#!/usr/bin/env python3
"""Build twin.json for the cendit Scenario 3 prototype from the committed data.

    python teams/cendit/prototype/build_data.py

Standard library only, offline. Reads Denver Water's originals in data/ and the
generated history in water-system-3d/ without modifying them, and writes
teams/cendit/prototype/data/twin.json:

  daily    one merged row per day, 2022-04-01 .. 2026-08-19, columnar
  years    peak SWE per water year at Hoosier Pass and a provisional tercile label
  lags     Spearman correlation of upstream signals vs Foothills TOC/alkalinity by lag and season
  models   ridge-regularised linear models, one per lead time, with test skill and a persistence baseline
  sonde    Strontia profiling sonde as daily median per 1 m depth bin, from data/Strontia 0407_0819.xlsx
  gate     what-if model: how plant TOC/alkalinity would shift if Foothills drew from a different Strontia gate
"""

import csv
import json
import math
import random
import re
import statistics
import zipfile
from datetime import date, datetime, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
DATA = ROOT / "data"
HISTORY = ROOT / "water-system-3d"
OUT = HERE / "data" / "twin.json"

START, END = date(2022, 4, 1), date(2026, 8, 19)
HORIZONS = range(1, 8)
MAX_LAG = 10
RIDGE = 1.0
TOC_LIMIT, ALK_LIMIT = 3.0, 60.0  # excursion thresholds from glossary.md / guide.md §8
TRANSIT_HOURS = 4  # Denver Water raw water group, guide.md §1

TERMS = [
    'The water quality data is provided "as is." Water quality data provided to the user is provisional '
    "and subject to change, and the user should not assume that the data has undergone any quality "
    "assurance or quality control review. Denver Water makes no warranty of any kind, express or implied, "
    "concerning the data, including accuracy, reliability, completeness, timeliness, or usefulness. "
    "Copyright 2026, Denver Water. https://www.denverwater.org/about-us/how-we-operate/public-records",
    "COPYRIGHT AND DISCLAIMER: see data/TERMS.md. Any sale, reproduction or distribution of this "
    "information, or products derived therefrom, in any format is expressly prohibited.",
]

SEASONS = {
    "all": set(range(1, 13)),
    "melt (Apr-Jun)": {4, 5, 6},
    "monsoon (Jul-Sep)": {7, 8, 9},
    "fall (Oct-Dec)": {10, 11, 12},
}


def parse_date(text):
    text = text.strip()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            pass
    raise ValueError(f"unrecognised date {text!r}")


def number(text):
    try:
        value = float(text)
    except (TypeError, ValueError):
        return None
    return value if math.isfinite(value) else None


def read_csv(name, date_col, columns):
    """{date: {key: value}} for the requested {csv_column: key} mapping."""
    rows = {}
    with open(DATA / name, newline="", encoding="utf-8-sig") as handle:
        for record in csv.DictReader(handle):
            day = parse_date(record[date_col])
            rows[day] = {key: number(record.get(col)) for col, key in columns.items()}
    return rows


def storage_by_day(abbrev):
    history = json.loads((HISTORY / "storage-history.json").read_text())["reservoirs"][abbrev]["years"]
    out = {}
    for wy, trace in history.items():
        origin = date(int(wy) - 1, 10, 1)
        for index, value in enumerate(trace):
            if value is not None:
                out[origin + timedelta(days=index)] = value
    return out


def water_year(day):
    return day.year + 1 if day.month >= 10 else day.year


def build_daily():
    sources = [
        read_csv("SouthPlatteFlow.csv", "measDate", {"Flow_CFS": "flow"}),
        read_csv("USGS_South_Platte.csv", "Date", {
            "Turbidity_Median": "turb", "Turbidity_Max": "turbMax",
            "Specific_Cond_Mean": "cond", "pH_Median": "ph",
            "Temp_C_Mean": "temp", "Dissolved_Oxygen_Mean": "do"}),
        read_csv("HoosierPass.csv", "DATE", {"SWE": "swe"}),
        read_csv("USC00058022.csv", "DATE", {"PRCP": "prcp"}),
        read_csv("FoothillsInfluent.csv", "DATE", {"TOC_mg_L": "toc", "Alk_mg_L": "alk"}),
    ]
    stor = {"strStor": storage_by_day("STRRESCO"), "cheStor": storage_by_day("CHERESCO")}
    keys = ["swe", "prcp", "flow", "turb", "turbMax", "cond", "ph", "temp", "do",
            "cheStor", "strStor", "toc", "alk"]
    days = [START + timedelta(days=i) for i in range((END - START).days + 1)]
    series = {key: [] for key in keys}
    for day in days:
        merged = {}
        for source in sources:
            merged.update(source.get(day, {}))
        for key, table in stor.items():
            merged[key] = table.get(day)
        for key in keys:
            series[key].append(merged.get(key))
    return days, series


def build_years(days):
    station = json.loads((HISTORY / "snotel-history.json").read_text())["stations"]["531:CO:SNTL"]
    peaks = {}
    for wy, trace in station["years"].items():
        values = [v for v in trace if v is not None]
        # Oct..Jun must be present for the peak to mean anything.
        if sum(v is not None for v in trace[:273]) >= 240:
            peaks[int(wy)] = max(values)
    ordered = sorted(peaks.values())
    low, high = quantile(ordered, 1 / 3), quantile(ordered, 2 / 3)
    median_peak = quantile(ordered, 0.5)
    shown = sorted({water_year(d) for d in days})
    labels = {}
    for wy in shown:
        peak = peaks.get(wy)
        if peak is None:
            labels[wy] = {"peak": None, "label": "unknown"}
            continue
        label = "dry" if peak < low else "wet" if peak > high else "normal"
        labels[wy] = {"peak": peak, "pctMedian": round(100 * peak / median_peak), "label": label}
    return {
        "station": "Hoosier Pass (531:CO:SNTL)",
        "rule": "Provisional, ours: tercile of water-year peak SWE across every Hoosier Pass year "
                "with Oct-Jun coverage. Not Denver Water's rule (open question Q16).",
        "nYears": len(peaks), "firstYear": min(peaks), "lastYear": max(peaks),
        "terciles": [round(low, 1), round(high, 1)], "medianPeak": median_peak,
        "labels": labels,
        "medianTrace": station["median"],
        "allPeaks": {str(k): v for k, v in sorted(peaks.items())},
    }


def quantile(ordered, q):
    if not ordered:
        return None
    pos = (len(ordered) - 1) * q
    lo, hi = math.floor(pos), math.ceil(pos)
    return ordered[lo] + (ordered[hi] - ordered[lo]) * (pos - lo)


# --- derived features -------------------------------------------------------

def derived(series, i, day):
    """Feature dict for index i, or None entries where inputs are missing."""
    flow, turb = series["flow"][i], series["turb"][i]
    prcp7 = series["prcp"][max(0, i - 6):i + 1]
    return {
        "logTurbFlow": math.log1p(turb * flow) if flow is not None and turb is not None else None,
        "logFlow": math.log(flow) if flow and flow > 0 else None,
        "turb": turb,
        "flow": flow,
        "cond": series["cond"][i],
        "ph": series["ph"][i],
        "temp": series["temp"][i],
        "do": series["do"][i],
        "swe": series["swe"][i],
        "prcp7": sum(prcp7) if len(prcp7) == 7 and None not in prcp7 else None,
    }


def seasonal(day):
    angle = 2 * math.pi * (day.timetuple().tm_yday - 1) / 365.25
    return {"sinDoy": math.sin(angle), "cosDoy": math.cos(angle)}


# --- lag correlation ---------------------------------------------------------

def ranks(values):
    order = sorted(range(len(values)), key=values.__getitem__)
    result = [0.0] * len(values)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and values[order[j + 1]] == values[order[i]]:
            j += 1
        for k in range(i, j + 1):
            result[order[k]] = (i + j) / 2
        i = j + 1
    return result


def pearson(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    sxx = sum((x - mx) ** 2 for x in xs)
    syy = sum((y - my) ** 2 for y in ys)
    return sxy / math.sqrt(sxx * syy) if sxx and syy else None


def spearman(xs, ys):
    return pearson(ranks(xs), ranks(ys))


LAG_FEATURES = ["flow", "turb", "logTurbFlow", "cond", "ph", "temp", "do", "swe", "prcp7"]


def build_lags(days, series):
    features = [derived(series, i, d) for i, d in enumerate(days)]
    out = {}
    for target in ("toc", "alk"):
        out[target] = {}
        for season, months in SEASONS.items():
            out[target][season] = {}
            for feat in LAG_FEATURES:
                rhos, ns = [], []
                for lag in range(MAX_LAG + 1):
                    xs, ys = [], []
                    for i in range(lag, len(days)):
                        if days[i].month not in months:
                            continue
                        x, y = features[i - lag][feat], series[target][i]
                        if x is not None and y is not None:
                            xs.append(x)
                            ys.append(y)
                    rho = spearman(xs, ys) if len(xs) >= 30 else None
                    rhos.append(round(rho, 3) if rho is not None else None)
                    ns.append(len(xs))
                out[target][season][feat] = {"rho": rhos, "n": ns}
    return out


# --- linear models ------------------------------------------------------------

# "upstream" is a pure soft sensor. "hybrid" predicts the change from the lab result h days
# before the target, so a zero correction is exactly persistence.
MODEL_FEATURES = {
    "upstream": {
        "toc": ["logTurbFlow", "logFlow", "cond", "swe", "temp", "sinDoy", "cosDoy"],
        "alk": ["cond", "ph", "logFlow", "temp", "swe", "sinDoy", "cosDoy"],
    },
    "hybrid": {
        "toc": ["dLogTurbFlow3", "dLogFlow3", "dCond3", "logTurbFlow"],
        "alk": ["dCond3", "dLogFlow3", "logFlow"],
    },
}


def model_inputs(features, series, target, days, i, h):
    """Inputs for predicting target at day i from what was known at day i-h."""
    x = dict(features[i - h])
    x.update(seasonal(days[i]))
    x["prior"] = series[target][i - h]
    back = features[i - h - 3] if i - h - 3 >= 0 else {}
    for key, src in (("dLogTurbFlow3", "logTurbFlow"), ("dLogFlow3", "logFlow"), ("dCond3", "cond")):
        now, then = x.get(src), back.get(src)
        x[key] = now - then if now is not None and then is not None else None
    return x


def solve(matrix, vector):
    """Gauss-Jordan with partial pivoting; matrix is small and ridge makes it well-posed."""
    n = len(vector)
    a = [row[:] + [vector[i]] for i, row in enumerate(matrix)]
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(a[r][col]))
        a[col], a[pivot] = a[pivot], a[col]
        scale = a[col][col]
        a[col] = [v / scale for v in a[col]]
        for r in range(n):
            if r != col and a[r][col]:
                factor = a[r][col]
                a[r] = [v - factor * p for v, p in zip(a[r], a[col])]
    return [a[i][n] for i in range(n)]


def fit(rows, names, delta=False):
    """Ridge regression on z-scored features. rows: [(x_dict, y)]. delta: fit y - x['prior']."""
    if delta:
        rows = [(x, y - x["prior"]) for x, y in rows]
    n = len(rows)
    means = {f: sum(x[f] for x, _ in rows) / n for f in names}
    stds = {f: math.sqrt(sum((x[f] - means[f]) ** 2 for x, _ in rows) / n) or 1.0 for f in names}
    ymean = sum(y for _, y in rows) / n
    z = [[(x[f] - means[f]) / stds[f] for f in names] for x, _ in rows]
    yc = [y - ymean for _, y in rows]
    k = len(names)
    xtx = [[sum(r[i] * r[j] for r in z) + (RIDGE if i == j else 0.0) for j in range(k)] for i in range(k)]
    xty = [sum(r[i] * y for r, y in zip(z, yc)) for i in range(k)]
    beta = solve(xtx, xty)
    return {"features": names, "mean": [means[f] for f in names], "std": [stds[f] for f in names],
            "coef": beta, "intercept": ymean, "delta": delta}


def predict(model, x):
    base = x["prior"] if model["delta"] else 0.0
    return base + model["intercept"] + sum(
        c * (x[f] - m) / s for f, m, s, c in zip(model["features"], model["mean"], model["std"], model["coef"]))


def scores(pairs):
    if not pairs:
        return None
    ys = [y for _, y in pairs]
    mean = sum(ys) / len(ys)
    sse = sum((p - y) ** 2 for p, y in pairs)
    sst = sum((y - mean) ** 2 for y in ys)
    return {"n": len(pairs), "r2": round(1 - sse / sst, 3) if sst else None,
            "rmse": round(math.sqrt(sse / len(pairs)), 3),
            "mae": round(sum(abs(p - y) for p, y in pairs) / len(pairs), 3)}


def build_models(days, series):
    features = [derived(series, i, d) for i, d in enumerate(days)]
    out = {}
    for target in ("toc", "alk"):
        out[target] = {"horizons": []}
        # One split date per target so every variant and horizon is graded on the same stretch of time.
        target_days = [i for i in range(len(days)) if series[target][i] is not None]
        split = target_days[len(target_days) // 2]
        out[target]["splitDate"] = days[split].isoformat()
        for h in HORIZONS:
            entry = {"h": h}
            for variant, table in MODEL_FEATURES.items():
                names = table[target]
                rows = []
                for i in range(h, len(days)):
                    y = series[target][i]
                    x = model_inputs(features, series, target, days, i, h)
                    if y is None or series[target][i - h] is None or any(x.get(f) is None for f in names):
                        continue
                    rows.append((i, x, y))
                train = [(x, y) for i, x, y in rows if i < split]
                test = [(i, x, y) for i, x, y in rows if i >= split]
                delta = variant == "hybrid"
                split_model = fit(train, names, delta)
                entry[variant] = {
                    "nTrain": len(train),
                    "test": scores([(predict(split_model, x), y) for _, x, y in test]),
                    "splitModel": split_model,
                    "allModel": fit([(x, y) for _, x, y in rows], names, delta),
                }
                if variant == "hybrid":
                    # Persistence graded on exactly the hybrid's test rows.
                    entry["persistence"] = {"test": scores([(x["prior"], y) for _, x, y in test])}
            out[target]["horizons"].append(entry)
    return out


def round_series(values, places):
    return [None if v is None else round(v, places) for v in values]


# --- Strontia profiling sonde -------------------------------------------------

SONDE_FILE = DATA / "Strontia 0407_0819.xlsx"
# Column letter -> key, from the sheet's header row. "Vertical Position" is depth below the surface in m:
# the 2026-04-07 cast reads 9.9 C at 0.9 and 4.8 C at 40.4.
SONDE_COLUMNS = {"A": "time", "B": "temp", "C": "cond", "D": "depth", "E": "ph", "F": "orp",
                 "G": "turb", "H": "chl", "I": "phyco", "K": "odo"}
SONDE_PARAMS = {
    "temp": {"label": "Temperature", "unit": "°C", "places": 2},
    "turb": {"label": "Turbidity", "unit": "NTU", "places": 2, "better": "low", "log": True},
    "sc": {"label": "Specific conductance (computed, 25 °C)", "unit": "µS/cm", "places": 1},
    "cond": {"label": "Conductivity (raw)", "unit": "as logged", "places": 1},
    "ph": {"label": "pH", "unit": "", "places": 2},
    "odo": {"label": "Dissolved oxygen", "unit": "mg/L", "places": 2, "better": "high"},
    "chl": {"label": "Chlorophyll", "unit": "µg/L", "places": 2, "better": "low"},
    "phyco": {"label": "Phycocyanin", "unit": "as logged", "places": 2, "better": "low"},
}


def read_sonde():
    """Minimal xlsx reader: the workbook is one sheet of plain numbers under a header row."""
    with zipfile.ZipFile(SONDE_FILE) as book:
        sheet = book.read("xl/worksheets/sheet1.xml").decode("utf-8")
    cell = re.compile(r'<c r="([A-K])\d+"[^>]*><v>([^<]*)</v>')
    readings = []
    for row in re.findall(r"<row [^>]*>(.*?)</row>", sheet)[1:]:
        cells = dict(cell.findall(row))
        rec = {key: number(cells.get(col)) for col, key in SONDE_COLUMNS.items()}
        if rec["time"] is not None and rec["depth"] is not None:
            rec["sc"] = specific_conductance(rec["cond"], rec["temp"])
            readings.append(rec)
    return readings


# General knowledge, not Denver Water's: standard linear compensation to 25 C. The raw sonde
# conductivity is uncompensated (it falls with alkalinity across the season); compensated it reads
# 294-327 at 45 ft, in line with the river gage's specific conductance.
SC_ALPHA = 0.0191


def specific_conductance(cond, temp):
    return cond / (1 + SC_ALPHA * (temp - 25)) if cond is not None and temp is not None else None


def build_sonde():
    readings = read_sonde()
    excel_epoch = datetime(1899, 12, 30)
    bins = {}
    for rec in readings:
        day = (excel_epoch + timedelta(days=rec["time"])).date()
        depth_bin = int(rec["depth"])
        slot = bins.setdefault((day, depth_bin), {k: [] for k in SONDE_PARAMS})
        for key in SONDE_PARAMS:
            if rec[key] is not None:
                slot[key].append(rec[key])
    days = sorted({d for d, _ in bins})
    first, last = days[0], days[-1]
    n_days = (last - first).days + 1
    max_bin = max(b for _, b in bins)
    params = {}
    for key, meta in SONDE_PARAMS.items():
        grid = []
        for i in range(n_days):
            day = first + timedelta(days=i)
            row = []
            for b in range(max_bin + 1):
                values = bins.get((day, b), {}).get(key)
                row.append(round(statistics.median(values), meta["places"]) if values else None)
            grid.append(row)
        params[key] = {**{k: v for k, v in meta.items() if k != "places"}, "grid": grid}
    return {
        "source": "data/Strontia 0407_0819.xlsx",
        "start": first.isoformat(), "end": last.isoformat(), "nReadings": len(readings),
        "daysWithData": len(days), "depths": list(range(max_bin + 1)),
        "params": params,
    }


# --- gate what-if -----------------------------------------------------------------

OPEN_GATE_FT = 45  # team, 2026-09-25: Foothills draws only through the 45 ft gate
M_TO_FT = 3.28084
# Temperature is left out on purpose: shallow water is warmer from sunlight, not a different source,
# so a temperature term would invent a TOC difference between gates.
GATE_FEATURES = {"alk": ["sc"], "toc": ["turb", "sc"]}
DETREND_HALF_WINDOW = 7
BOOTSTRAP = 300


def grid_at(grid, k, z):
    row = grid[k] if 0 <= k < len(grid) else None
    if not row:
        return None
    for off in (0, -1, 1):
        if 0 <= z + off < len(row) and row[z + off] is not None:
            return row[z + off]
    return None


def detrend(values, w=DETREND_HALF_WINDOW):
    """Value minus its centred moving mean: keeps day-to-day swings, drops the seasonal drift."""
    out = []
    for i, v in enumerate(values):
        window = [u for u in values[max(0, i - w):i + w + 1] if u is not None]
        out.append(v - sum(window) / len(window) if v is not None and len(window) >= 5 else None)
    return out


def ols(xrows, ys):
    """Plain least squares with intercept, in physical units. Returns (intercept, [betas])."""
    k = len(xrows[0]) + 1
    design = [[1.0] + list(r) for r in xrows]
    xtx = [[sum(r[i] * r[j] for r in design) + (1e-9 if i == j else 0.0) for j in range(k)] for i in range(k)]
    xty = [sum(r[i] * y for r, y in zip(design, ys)) for i in range(k)]
    coef = solve(xtx, xty)
    return coef[0], coef[1:]


def build_gate_model(days, series, sonde):
    start = date.fromisoformat(sonde["start"])
    idx = {d: i for i, d in enumerate(days)}
    n = len(sonde["params"]["sc"]["grid"])
    z_open = int(OPEN_GATE_FT / M_TO_FT)
    grids = {k: sonde["params"][k]["grid"] for k in ("sc", "turb")}

    def plant(target, k, lag):
        i = idx.get(start + timedelta(days=k + lag))
        return series[target][i] if i is not None else None

    out = {"openGateFt": OPEN_GATE_FT, "openBin": z_open, "scAlpha": SC_ALPHA,
           "detrendDays": 2 * DETREND_HALF_WINDOW + 1, "targets": {}}
    for target, feats in GATE_FEATURES.items():
        best = None
        for lag in (0, 1):
            yd = detrend([plant(target, k, lag) for k in range(n)])
            xd = {f: detrend([grid_at(grids[f], k, z_open) for k in range(n)]) for f in feats}
            rows = [k for k in range(n) if yd[k] is not None and all(xd[f][k] is not None for f in feats)]
            xrows = [[xd[f][k] for f in feats] for k in rows]
            ys = [yd[k] for k in rows]
            a, beta = ols(xrows, ys)
            my = sum(ys) / len(ys)
            sse = sum((y - a - sum(b * x for b, x in zip(beta, xr))) ** 2 for xr, y in zip(xrows, ys))
            r2 = 1 - sse / sum((y - my) ** 2 for y in ys)
            if best is None or r2 > best["r2"]:
                best = {"lag": lag, "beta": beta, "r2": r2, "rows": rows, "xrows": xrows, "ys": ys, "xd": xd}
        # 7-day block bootstrap keeps neighbouring days together, since they are not independent.
        rng = random.Random(2026)
        pairs = list(zip(best["xrows"], best["ys"]))
        blocks = [pairs[i:i + 7] for i in range(0, len(pairs), 7)]
        samples = []
        for _ in range(BOOTSTRAP):
            picked = [p for _ in blocks for p in rng.choice(blocks)]
            _, b = ols([p[0] for p in picked], [p[1] for p in picked])
            samples.append([round(v, 5) for v in b])
        typical = {}
        for f in feats:
            mags = sorted(abs(v) for v in best["xd"][f] if v is not None)
            typical[f] = round(quantile(mags, 0.95), 3)
        # Evidence check: at which depth does the sonde best track the plant, short-term?
        by_depth = []
        yd = detrend([plant(target, k, best["lag"]) for k in range(n)])
        for z in sonde["depths"]:
            xz = detrend([grid_at(grids[feats[0]], k, z) for k in range(n)])
            pr = [(x, y) for x, y in zip(xz, yd) if x is not None and y is not None]
            r = pearson([p[0] for p in pr], [p[1] for p in pr]) if len(pr) >= 30 else None
            by_depth.append(round(r, 3) if r is not None else None)
        out["targets"][target] = {
            "features": feats, "lag": best["lag"], "beta": [round(v, 5) for v in best["beta"]],
            "r2Detrended": round(best["r2"], 3), "n": len(best["rows"]), "bootstrap": samples,
            "typicalSwing": typical, "evidenceFeature": feats[0], "evidenceByDepth": by_depth,
        }
    return out


def main():
    days, series = build_daily()
    sonde = build_sonde()
    places = {"swe": 1, "prcp": 2, "flow": 1, "turb": 2, "turbMax": 1, "cond": 1, "ph": 2,
              "temp": 2, "do": 2, "cheStor": 0, "strStor": 0, "toc": 2, "alk": 1}
    payload = {
        "_comment": "Generated by teams/cendit/prototype/build_data.py from data/ and water-system-3d/. Do not edit.",
        "_terms": TERMS,
        "built": date.today().isoformat(),
        "constants": {"tocLimit": TOC_LIMIT, "alkLimit": ALK_LIMIT, "transitHours": TRANSIT_HOURS,
                      "capacityAF": {"cheStor": 79064, "strStor": 7863}},
        "daily": {"start": START.isoformat(), "end": END.isoformat(),
                  "series": {k: round_series(v, places[k]) for k, v in series.items()}},
        "years": build_years(days),
        "lags": build_lags(days, series),
        "models": build_models(days, series),
        "sonde": sonde,
        "gate": build_gate_model(days, series, sonde),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
    for target, block in payload["models"].items():
        for hz in block["horizons"]:
            parts = [f"{k} R2={hz[k]['test']['r2']} RMSE={hz[k]['test']['rmse']} n={hz[k]['test']['n']}"
                     for k in ("upstream", "hybrid", "persistence")]
            print(f"  {target} h={hz['h']}: " + " | ".join(parts))
    labels = payload["years"]["labels"]
    print("  water years:", {wy: (v["label"], v.get("peak")) for wy, v in labels.items()},
          "terciles", payload["years"]["terciles"])
    sonde = payload["sonde"]
    print(f"  sonde: {sonde['nReadings']} readings, {sonde['daysWithData']} days, "
          f"{sonde['start']}..{sonde['end']}, depth bins 0..{sonde['depths'][-1]} m")
    for target, g in payload["gate"]["targets"].items():
        print(f"  gate model {target}: {dict(zip(g['features'], g['beta']))} lag {g['lag']} d, "
              f"detrended R2 {g['r2Detrended']}, n {g['n']}")


if __name__ == "__main__":
    main()

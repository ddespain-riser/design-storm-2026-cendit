#!/usr/bin/env python3
"""Serve the cendit prototype and proxy the live public APIs it needs.

    python teams/cendit/prototype/server.py        # then open http://localhost:8766/

Static files come from this directory. GET /api/live?days=45 returns the last N days
of the same daily series the committed CSVs hold (USGS 06707525 daily stats, DWR
PLASPLCO flow and reservoir storage, Hoosier Pass SWE, GHCN precipitation) plus the
NWS forecast and alerts at Strontia Springs Dam. Upstream URLs are fixed here; the
client only chooses the day count. Everything returned is provisional.
"""

import http.client
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8766
ROOT = Path(__file__).resolve().parent
USER_AGENT = "design-storm-2026-cendit prototype (Explore DDD 2026 Design Storm)"
CACHE_SECONDS = 900
STRONTIA = ("39.43276", "-105.12591")  # Strontia Springs Dam, from water-system-3d/system.json

USGS_DV = "https://waterservices.usgs.gov/nwis/dv/"
DWR_DAY = "https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrytimeseriesday/"
SNOTEL = "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data"
GHCN = "https://www.ncei.noaa.gov/access/services/data/v1"
NWS_POINTS = "https://api.weather.gov/points/{},{}"
NWS_ALERTS = "https://api.weather.gov/alerts/active"

# (pcode, statistic) -> key, matching the columns build_data.py takes from USGS_South_Platte.csv.
USGS_KEYS = {
    ("63680", "00008"): "turb", ("63680", "00001"): "turbMax", ("00095", "00003"): "cond",
    ("00400", "00008"): "ph", ("00010", "00003"): "temp", ("00300", "00003"): "do",
}

_cache = {}
_lock = threading.Lock()


def get_json(url, params=None):
    if params:
        url = f"{url}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT, "Accept": "application/json, application/geo+json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if error.code < 500 or attempt == 2:
                raise
            time.sleep(1.5 * (attempt + 1))
        except (http.client.IncompleteRead, urllib.error.URLError, TimeoutError):
            if attempt == 2:
                raise
            time.sleep(1.5 * (attempt + 1))


def usgs(start, end):
    payload = get_json(USGS_DV, {"format": "json", "sites": "06707525",
                                 "parameterCd": "63680,00095,00400,00010,00300",
                                 "startDT": start, "endDT": end, "siteStatus": "all"})
    out = {}
    for series in payload.get("value", {}).get("timeSeries", []):
        code = series["variable"]["variableCode"][0]["value"]
        key = USGS_KEYS.get((code, series["name"].split(":")[-1]))
        if not key:
            continue
        no_data = series["variable"].get("noDataValue")
        for block in series.get("values", []):
            for reading in block.get("value", []):
                value = float(reading["value"])
                if value != no_data:
                    out.setdefault(key, {})[reading["dateTime"][:10]] = value
    return out


def dwr(abbrev, parameter, key, start, end):
    try:
        payload = get_json(DWR_DAY, {"format": "json", "abbrev": abbrev, "parameter": parameter,
                                     "startDate": start, "endDate": end, "pageSize": 5000})
    except urllib.error.HTTPError as error:
        if error.code == 404:  # DWR's way of saying "no data in this window"
            return {key: {}}
        raise
    values = {}
    for reading in payload.get("ResultList", []):
        value = reading.get("measValue")
        if value is not None and value != -999:
            values[reading["measDate"][:10]] = value
    return {key: values}


def snotel(start, end):
    payload = get_json(SNOTEL, {"stationTriplets": "531:CO:SNTL", "elements": "WTEQ",
                                "duration": "DAILY", "beginDate": start, "endDate": end})
    values = {}
    for station in payload or []:
        for series in station.get("data", []):
            for reading in series.get("values", []):
                if reading.get("value") is not None:
                    values[reading["date"][:10]] = reading["value"]
    return {"swe": values}


def ghcn(start, end):
    payload = get_json(GHCN, {"dataset": "daily-summaries", "stations": "USC00058022",
                              "startDate": start, "endDate": end, "dataTypes": "PRCP",
                              "format": "json", "units": "standard"})
    values = {}
    for day in payload or []:
        text = str(day.get("PRCP", "")).strip()
        if text:
            values[day["DATE"][:10]] = float(text)
    return {"prcp": values}


def nws():
    meta = get_json(NWS_POINTS.format(*STRONTIA))["properties"]
    hourly = get_json(meta["forecastHourly"])["properties"]["periods"]
    grid = get_json(meta["forecastGridData"])["properties"]
    alerts = get_json(NWS_ALERTS, {"point": ",".join(STRONTIA)})
    return {
        "hourly": [{"t": p["startTime"], "temp": p["temperature"],
                    "pop": (p.get("probabilityOfPrecipitation") or {}).get("value"),
                    "text": p.get("shortForecast", "")} for p in hourly],
        # validTime is "ISO/PTnH"; value in mm.
        "qpf": [{"t": v["validTime"], "mm": v["value"]}
                for v in grid.get("quantitativePrecipitation", {}).get("values", [])],
        "alerts": [{"event": a["properties"].get("event"), "headline": a["properties"].get("headline"),
                    "severity": a["properties"].get("severity"), "onset": a["properties"].get("onset"),
                    "ends": a["properties"].get("ends")} for a in alerts.get("features", [])],
    }


def live(days):
    end_day = date.today()
    start, end = (end_day - timedelta(days=days)).isoformat(), end_day.isoformat()
    jobs = {
        "usgs": lambda: usgs(start, end),
        "flow": lambda: dwr("PLASPLCO", "DISCHRG", "flow", start, end),
        "strStor": lambda: dwr("STRRESCO", "STORAGE", "strStor", start, end),
        "cheStor": lambda: dwr("CHERESCO", "STORAGE", "cheStor", start, end),
        "snotel": lambda: snotel(start, end),
        "ghcn": lambda: ghcn(start, end),
        "nws": nws,
    }
    results, errors = {}, []
    with ThreadPoolExecutor(max_workers=len(jobs)) as pool:
        futures = {name: pool.submit(job) for name, job in jobs.items()}
        for name, future in futures.items():
            try:
                results[name] = future.result()
            except Exception as error:  # one dead upstream should not take the page down
                errors.append(f"{name}: {type(error).__name__}: {error}")
    by_key = {}
    for name, value in results.items():
        if name != "nws":
            by_key.update(value)
    dates = [(end_day - timedelta(days=days - i)).isoformat() for i in range(days + 1)]
    return {
        "fetched": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "provisional": True,
        "daily": {"start": dates[0], "end": dates[-1],
                  "series": {k: [v.get(d) for d in dates] for k, v in by_key.items()}},
        "nws": results.get("nws"),
        "errors": errors,
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        path, _, query = self.path.partition("?")
        if path != "/api/live":
            return super().do_GET()
        try:
            days = int(urllib.parse.parse_qs(query).get("days", ["45"])[0])
        except ValueError:
            days = 45
        days = max(7, min(days, 120))
        with _lock:
            hit = _cache.get(days)
            if not hit or time.time() - hit[0] > CACHE_SECONDS:
                hit = (time.time(), json.dumps(live(days)).encode())
                _cache[days] = hit
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(hit[1])))
        self.end_headers()
        self.wfile.write(hit[1])


class Server(ThreadingHTTPServer):
    # On Windows SO_REUSEADDR lets a second copy bind the same port silently; fail loudly instead.
    allow_reuse_address = os.name != "nt"


def serve(port=PORT, on_ready=None):
    with Server(("127.0.0.1", port), Handler) as httpd:
        print(f"cendit prototype at http://localhost:{port}/  (live data via /api/live, Ctrl+C to stop)")
        if on_ready:
            on_ready(port)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    serve(int(sys.argv[1]) if len(sys.argv) > 1 else PORT)

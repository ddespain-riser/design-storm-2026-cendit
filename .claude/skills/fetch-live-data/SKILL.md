---
name: fetch-live-data
description: Pull current or historical readings from the public APIs behind this repository's data — USGS NWIS gages (turbidity, conductance, temperature, pH, dissolved oxygen, discharge), Colorado DWR telemetry (reservoir storage, flow, gage height), NRCS SNOTEL snow pillows, NOAA GHCN Daily weather, and NWS hourly forecasts and alerts. Use when asked for real-time, live, latest, current, or recent data; data for a specific date range or storm; a fresh pull to compare against the committed CSVs; or the Scenario 3 station set from snowpack to plant intake.
---

# Fetch live data (this repository)

Query the public APIs directly and answer from what they return. None of them need
an API key.

**Shortcut:** if `experiments/live-data/fetch.py` exists, use it. It covers every API
and station below, needs only the Python standard library, and writes long-format
CSV or JSON next to itself. `experiments/` is gitignored, so the script is local
only; if it's missing, call the APIs yourself with `Invoke-RestMethod`, `curl`, or
inline Python.

```
python experiments/live-data/fetch.py scenario3 --days 3
python experiments/live-data/fetch.py scenario3 --daily --start 2026-08-14 --end 2026-08-16
python experiments/live-data/fetch.py usgs --sites 06707525 --params 63680,00095 --start 2026-08-14 --end 2026-08-16
python experiments/live-data/fetch.py dwr --abbrevs STRRESCO --params STORAGE --interval hour --days 14
python experiments/live-data/fetch.py snotel --triplets 531:CO:SNTL --elements WTEQ --start 2025-10-01
python experiments/live-data/fetch.py nws --point 39.43276,-105.12591
```

The subcommands are `usgs`, `dwr`, `snotel`, `ghcn`, `nws`, and `scenario3`. Every
subcommand takes `--start`, `--end`, `--days` (default 7), `--out`, and `--format`.
Some take extras: `--daily` (usgs, scenario3), `--interval raw|hour|day` (dwr),
`--hourly` (snotel), and `--point` (nws). The script prints each series' count,
time span, and latest value.

## Ground rules

- **Never write into `data/`, `scripts/`, `figures/`, or `reference/`.** If a pull
  needs saving, put it in `experiments/live-data/`, which is gitignored.
- **Everything is provisional.** USGS, DWR, and NRCS revise values after
  publication. Say so whenever you report a number, and don't treat a fresh pull as
  a correction to the committed CSVs.
- **Report only what came back.** If a series returns nothing, say so; don't fill
  the gap or guess a value.
- **No public API has what reaches the plant.** Foothills TOC and alkalinity
  (`data/FoothillsInfluent.csv`), Strontia depth profiles, and reservoir release
  decisions are Denver Water's own data.
- Anything shared must follow the terms in `data/TERMS.md`.

## Tweakables

| Knob | Default | Notes |
|---|---|---|
| `WINDOW` | last 7 days | A named event (e.g. the August 14–15, 2026 storm) means explicit start and end dates. |
| `RESOLUTION` | finest available | USGS 15-minute, DWR `day` (or `hour`/`raw`), SNOTEL `DAILY` (or `HOURLY`). |
| `STATIONS` | Scenario 3 set below | Or whatever the user names. |
| `SAVE` | `false` | `true` saves a CSV to `experiments/live-data/<source>-<yyyymmddThhmmss>.csv`. |

## APIs

### USGS NWIS — gage water quality and flow

- 15-minute data: `https://waterservices.usgs.gov/nwis/iv/`
- Daily statistics: `https://waterservices.usgs.gov/nwis/dv/`
- Query: `format=json&sites=06707525,06701900&parameterCd=63680,00060&siteStatus=all`, plus either
  `period=P7D` or `startDT=2026-08-14&endDT=2026-08-16` (IV also accepts `YYYY-MM-DDTHH:MM`).
- Response: `value.timeSeries[]`. For each series, the site is
  `sourceInfo.siteCode[0].value` and the pcode is `variable.variableCode[0].value`.
  The unit is `variable.unit.unitCode`, and readings are in
  `values[].value[]` as `{value, dateTime, qualifiers}`. Drop readings equal to
  `variable.noDataValue`. The last segment of `series.name` is the statistic:
  `00000` for instantaneous; `00001` max, `00002` min, `00003` mean, `00008` median
  for daily.
- Pcodes: `63680` turbidity (FNU), `00095` specific conductance, `00010` temperature,
  `00400` pH, `00300` dissolved oxygen, `00060` discharge (cfs).
- (general knowledge) USGS is moving to new Water Data APIs at `api.waterdata.usgs.gov`.
  If `waterservices` stops answering, check there.

### Colorado DWR (CDSS) telemetry — reservoir storage, flow, gage height

- `https://dwr.state.co.us/Rest/GET/api/v2/telemetrystations/telemetrytimeseries{day|hour|raw}/`
- Query: `format=json&abbrev=STRRESCO&parameter=STORAGE&startDate=2026-08-14&endDate=2026-08-16&pageSize=50000&pageIndex=1`.
  Send one `abbrev` and one `parameter` per request.
- Response: `ResultList[]` with `measValue`, `measUnit`, and `measDate` (or
  `measDateTime`). If `PageCount` is greater than 1, fetch the rest by `pageIndex`.
  `-999` means missing.
- **An HTTP 404 means "no data"**: the station doesn't record that parameter in that
  window. It isn't an outage.
- Parameters: `STORAGE` (acre-feet), `DISCHRG` (cfs), `GAGE_HT` (ft). There is also
  `PRECIP`, but it's a cumulative counter that resets, and `guide.md` calls it dirty,
  so don't use it as a predictor.
- Storage telemetry has occasional garbage rows in the millions of acre-feet.
  `water-system-3d/fetch_storage_history.py` shows the sanity bounds used here.

### NRCS SNOTEL (AWDB) — snowpack

- `https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data`
- Query: `stationTriplets=531:CO:SNTL,938:CO:SNTL&elements=WTEQ&duration=DAILY&beginDate=2025-10-01&endDate=2026-09-25`.
  `duration=HOURLY` also works.
- Response: a list of `{stationTriplet, data:[{stationElement:{elementCode, storedUnitCode}, values:[{date, value}]}]}`.
- Elements: `WTEQ` (snow water equivalent, in), `SNWD` (snow depth), `PREC`
  (accumulated precipitation), `TOBS` (observed air temperature).
- The water year starts October 1.

### NOAA NCEI GHCN Daily — ground weather

- `https://www.ncei.noaa.gov/access/services/data/v1`
- Query: `dataset=daily-summaries&stations=USC00058022&startDate=...&endDate=...&dataTypes=PRCP,TMAX,TMIN,SNOW&format=json&units=standard`
- Response: a list of `{DATE, STATION, PRCP, ...}`. Values are strings with padding,
  so strip them before converting. Units are °F and inches.
- It lags by a day or more, so for "right now" use NWS instead.

### NWS (`api.weather.gov`) — forecast and alerts

- Only covers now onward; there's no history.
- **You must send a `User-Agent` header** or the request is refused.
- `GET https://api.weather.gov/points/{lat},{lon}`, then follow
  `properties.forecastHourly`. The forecast is in `properties.periods[]`, each with
  `startTime`, `temperature`, `probabilityOfPrecipitation.value`, and `shortForecast`.
- Active alerts: `https://api.weather.gov/alerts/active?point={lat},{lon}` returns
  `features[].properties` with `event`, `headline`, `onset`, `ends`, and `severity`.
- Default point: Strontia Springs Dam, `39.43276,-105.12591` (from `water-system-3d/system.json`).

### Radar (storm replay or live)

- Iowa State Mesonet NEXRAD tiles, the same pattern the map uses:
  `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-{stamp}/{z}/{x}/{y}.png`.
  See `design-storm-water-system-3d.html` for how it builds the timestamp.

## The Scenario 3 station set

These IDs are from `water-system-3d/system.json` and `strontia-brief/basins/`. They
were verified live on 2026-09-25.

| Journey step | Source | IDs | What to pull |
|---|---|---|---|
| Snowpack | SNOTEL | `335`, `938`, `415`, `485`, `505`, `531` (Hoosier Pass), `935`, `970`, `1014`, `939` — all `:CO:SNTL` | `WTEQ` |
| Weather | NWS, GHCN | Strontia point; `USC00058022` | forecast, alerts; `PRCP,TMAX,TMIN,SNOW` |
| Rivers and tunnels | USGS | `06701900` Trumbull, `09037500` Williams Fork, `09050700` Blue below Dillon | `00060` |
| Moffat Tunnel water quality | USGS | `09023562` Fraser below Moffat | `00010,00095,63680` (no discharge) |
| Sentinel before the intake | USGS | `06707525` above Strontia Springs | `63680,00095,00010,00400,00300` |
| Reservoirs | DWR | `DILRESCO`, `CHERESCO`, `CHARESCO`, `STRRESCO` (since 2021) | `STORAGE` |
| South Platte telemetry | DWR | `PLASPLCO` | `DISCHRG`, `GAGE_HT` |
| Plant intake | none | Foothills | Not public; see ground rules |

Known gaps:
- NWIS returned nothing for the map gages `06702500`, `06707000`, and `06707500`
  on 2026-09-25.
- Michigan Creek `937:CO:SNTL` is excluded because of its bad May 2026 readings
  (see `AGENTS.md`).

## Procedure

1. Turn the request into steps from the table above, specific stations, a window,
   and a resolution.
2. Make one request per source; batch sites or triplets where the API allows it.
   Treat DWR 404s as "no data".
3. Put the result into long format: `source, station, parameter, time, value, unit, note`.
   Keep USGS qualifiers (`P` means provisional) in `note`.
4. Report, for each series: whether it returned data, the count, the first and last
   timestamps, and the latest value. Also list the series that came back empty.
   Say the values are provisional. If you compare against a committed CSV, cite both.
5. Save to `experiments/live-data/` only if `SAVE` is on or the user asks. Never commit pulls.

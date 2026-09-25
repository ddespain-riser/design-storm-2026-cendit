# Snow to Foothills: team cendit's Scenario 3 prototype

An interactive view of how water and water quality move through Denver Water's
South Platte collection system, from the Hoosier Pass snowpack through Cheesman and
Strontia Springs to the Foothills treatment plant intake. It covers the past (Replay,
2022-04 to 2026-08), the present (Live), the next seven days (Forecast), and what the
plant would have received from a different Strontia gate (Reservoir depth).

Built for the Explore DDD 2026 Design Storm, Scenario 3. It is aimed first at plant
operators and water-quality scientists.

## Run it

From the repository root:

```
python teams/cendit/prototype/run.py
```

That rebuilds `data/twin.json` if any input is newer than it, starts a local server,
and opens http://localhost:8766/. Press Ctrl+C to stop.

| Option | What it does |
|---|---|
| `--port 8800` | Use a different port |
| `--rebuild` | Rebuild the data even if it looks current |
| `--no-browser` | Don't open a browser tab |

**Requirements:** Python 3.9 or newer (tested on 3.14), standard library only, so
there's nothing to install. The page itself has no external dependencies. Only
the Live and Forecast tabs need internet, because they call USGS, Colorado DWR,
NRCS, NOAA and NWS through the local server.

Open the page through the server rather than as a file; it fetches JSON. The repo
root's `serve.py` shows the page, but Live and Forecast won't work there.

Link to a day in Replay with a hash, e.g. http://localhost:8766/#2023-08-01.

## The tabs

| Tab | Question it answers |
|---|---|
| **Replay** | What did past events do as they moved through the system? Scrub or play any day, see detected events, what a model would have projected, and past days like this one. |
| **Live** | What does the system look like right now? Latest provisional readings and the NWS outlook at Strontia. |
| **Forecast** | Given today's upstream conditions and this morning's plant reading, what's coming in the next 7 days? The +4 day action window is highlighted. |
| **Reservoir depth** | Which gate would give Foothills the easiest water to treat on a given day (gate advisor)? What does the Strontia water column look like by depth, and how would plant TOC and alkalinity change if Foothills drew from a gate other than 45 ft? |
| **Years** | How do wet and dry years differ? Each water year overlaid, labelled by snowpack. |
| **Lags & skill** | How many days does the river lead the plant, and how much better is each model than repeating the last plant reading? |

Every page with the Journey strip also has a **blind spots** panel: what each stretch
of the system measures, and what it doesn't.

## Files

| File | What it is |
|---|---|
| `run.py` | One-command launcher: build if stale, serve, open browser. |
| `build_data.py` | Reads the committed data (read-only) and writes `data/twin.json`: the merged daily series, water-year labels, lag correlations, forecast models, sonde grids and the gate model. Offline. |
| `server.py` | Serves this folder on 127.0.0.1 and proxies `/api/live` to fixed public API URLs, cached for 15 minutes. |
| `index.html`, `app.js`, `style.css` | The page. Vanilla JS and SVG, no libraries. |
| `data/twin.json` | Generated. Don't edit by hand. It carries Denver Water's data terms inside it. |

Inputs, none of which are modified: `data/FoothillsInfluent.csv`, `data/USGS_South_Platte.csv`,
`data/SouthPlatteFlow.csv`, `data/HoosierPass.csv`, `data/USC00058022.csv`,
`data/Strontia 0407_0819.xlsx`, `water-system-3d/storage-history.json`,
`water-system-3d/snotel-history.json`.

## Models, and what they found

All of these are simple, transparent models, chosen so every number can be checked.
They aren't a replacement for Jake's random forests.

- **Signal lag.** Turbidity upstream correlates best with plant TOC about 4 days later,
  and conductance with alkalinity about 3 days later. Denver Water reckons the water
  itself travels from the gage to the intake in about 4 hours; the signal takes days.
- **Forecast, 1 to 7 days.** Ridge regression per horizon, trained on the first half of
  the record and tested on the second, against persistence (repeat the last plant
  reading). Operators measure TOC and alkalinity twice a day (Jake), so persistence is
  the real baseline. The upstream-plus-lab ("hybrid") model beats it for TOC at no
  horizon, and for alkalinity only at +5 to +7 days.
- **Heads-up.** Past days at the same time of year with a similar 3-day change in
  turbidity × flow, and what plant TOC and alkalinity did 4 days later. It reports
  counts and ranges, not advice.
- **Gate what-if.** Starts from what the plant measured through the 45 ft gate, then
  shifts it by the other gate's same-day difference in sonde readings times a slope
  fitted on detrended data. Alkalinity uses specific conductance (0.28 mg/L per µS/cm);
  TOC uses turbidity (0.019 mg/L per NTU). The shaded ranges come from a 7-day block
  bootstrap. Result for April to August 2026: no gate changes TOC meaningfully, and
  deeper gates carry slightly more alkalinity.
- **Gate advisor.** Turbidity only. For each sonde day, compares every gate's measured
  turbidity with the open 45 ft gate in 1, 3 and 5 m layers centred on the gate. It says
  **switch** if 45 ft is above 10 NTU (Jake) and another gate is under it in every
  layer, **small gain** if another gate is lower in every layer but on the same side of
  10 NTU, else **stay**. A day-by-day strip shows how long a suggestion held.

## Rules that are ours, not Denver Water's

- **Events:** a day counts if turbidity max is above a percentile of the record, **or**
  the 3-day flow rise is. The thresholds are adjustable in the UI.
- **Dry, normal or wet:** which third of Hoosier Pass's 46-year record a year's peak
  snow water equivalent falls in.
- **Seasons in the lag analysis:** melt (Apr–Jun), monsoon (Jul–Sep), fall (Oct–Dec).
- **Gate depths:** 15, 45, 65 and 95 ft, read as feet below the water surface, with only
  45 ft open (team, 2026-09-25).
- **Gate advisor:** the all-layers rule and the switch / small gain / stay tiers.
- **Specific conductance from the sonde:** raw conductivity / (1 + 0.0191 × (T − 25)),
  the standard compensation (general knowledge). The raw sonde column is uncompensated.

## Known limits

- **All live readings are provisional**, and USGS, DWR and NRCS revise them after
  publication.
- **Foothills TOC and alkalinity aren't public.** The Forecast tab asks you to enter
  this morning's plant reading.
- **Reservoir releases, which gate is actually drawing, and water from other sources
  aren't inputs.**
- **The sonde record covers 2026-04-07 to 08-19 only**, one dry spring and summer.
- **The gate advisor suggests; it doesn't decide.** The sonde is mid-reservoir, not at
  the intake tower, and only the 45 ft gate has plant outcomes behind it. Nothing here
  recommends a dosing decision.

## Open questions for Denver Water

1. Are the gate depths below the surface, or fixed elevations on the tower?
2. Has Foothills ever drawn from another gate, even for a day? That would test the
   what-if directly.
3. Is "TOC above 3 within 14 days" the right line between major and minor events?
4. Can we have the twice-daily plant readings rather than daily values?
5. Where will the fluorescence organic-matter sensor sit, and when will it have data?
6. What is Denver Water's own dry/normal/wet rule?

## Data terms

Denver Water provided this data under two notices. Both apply to this prototype and
to `data/twin.json`, and travel with anything derived from them. Full text is also in
[`data/TERMS.md`](../../../data/TERMS.md).

> The water quality data is provided "as is." Water quality data provided to the user is provisional and subject to change, and the user should not assume that the data has undergone any quality assurance or quality control review. Denver Water makes no warranty of any kind, express or implied, concerning the data, including accuracy, reliability, completeness, timeliness, or usefulness.
> Copyright 2026, Denver Water. https://www.denverwater.org/about-us/how-we-operate/public-records

> COPYRIGHT AND DISCLAIMER: The data and metadata contained herein were prepared by Denver Water for its internal purposes only. Denver Water provides data and metadata as a public service with no claim as to the completeness, usefulness, timeliness or accuracy of its content, positional or otherwise. Denver Water and its employees make no warranty, express or implied, and assume no legal liability or responsibility for the ability of users to fulfill their intended purposes in accessing or using data or metadata or for omissions in content regarding such. The information provided is presented "as is," without warranty of any kind, including, but not limited to, the implied warranties of merchantability, fitness for a particular purpose, or non-infringement. Your use of this information is at your own risk. In providing this information or access to it, Denver Water assumes no obligation to assist the user in the use of such information or in the development, use, or maintenance of any applications applied to or associated with the data or metadata. Any sale, reproduction or distribution of this information, or products derived therefrom, in any format is expressly prohibited.

Data from USGS, Colorado DWR, USDA NRCS, NOAA and NWS is public domain.

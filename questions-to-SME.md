Thinking of building a 'what if' simulator


What are the controls for releasing water from the resevoirs?
Are there minimum levels that must be maintained in resevoirs (dam safety, available supply for services, etc)?
Does higher flow mean more or less TOC?

## More questions, from the event storm below

1. **What counts as a dry year?** April 1 SWE, peak SWE, total runoff volume? Denver Water surely has a rule, and the rule is domain knowledge in itself.
2. **Which snow station stands for the basin?** One pillow is a proxy for thousands of square miles. `glossary.md` also notes that the replacement CSV matches Hoosier Pass (531) while Jake's notebooks name Buckskin Joe (938).
3. **How do reservoir releases shape what arrives downstream?** Cheesman sits between the snow and Strontia. If operators blend or hold water, what reaches the plant is partly a human decision, and none of that is in the shipped data. (Ties into the release-controls question above.)
4. **When does Strontia turn over, and does it matter at the plant?** The sonde record ends Aug 19, possibly before turnover happens.
5. **Why is the travel time about four hours but the best model lag two to four days?** Jake suspects mixing and deposition in the reservoir, which points at the Strontia events in section 5.
6. **Where does the Foothills intake draw from: a fixed depth or a choice of depths?** That decides which layer of the sonde data actually reaches the plant. (General knowledge: many reservoirs have intakes at several levels.)

---

# Domain events: Scenario 3, snowpack to tap

A first pass at the events in the water's journey, in event-storming style (past tense, in time order). Vocabulary comes from `glossary.md`, `guide.md`, and the 3D map's tour. Anything marked **(GK)** is general water knowledge rather than something in Denver Water's materials; confirm it with them before relying on it.

## Two clocks

Keep two timelines apart: **when something happens to the water** and **when someone finds out**. Snowpack peaks in April, but you only know it was the peak once it starts falling. TOC arrives at the plant today; the lab result comes back later. Most of Scenario 3, and all of Scenario 1, lives in the gap between those two clocks.

## 1. Snowpack (Oct to Jun, in the mountains)

| Event | What it means | Where it shows up |
|---|---|---|
| **Water Year Began** | Oct 1. Hydrologists start the year here so one winter's snow and the runoff it becomes stay together. | Calendar |
| **Snowpack Reading Recorded** | A SNOTEL station weighed the snow on its pillow. The number is **SWE** (snow water equivalent): inches of water if it all melted now. | `data/HoosierPass.csv`, `water-system-3d/snotel-history.json` (11 stations, most from 1980) |
| **Snowpack Peaked** | SWE stopped rising. *Pivotal event*: the year's water supply is largely set. | Same |
| **April 1 Snowpack Compared** | The traditional "how was the snow this year": April 1 SWE against the median. | Same |
| **Water Year Classified (Dry / Normal / Wet)** | The year got its label from the snowpack. | Nobody does this in the repo yet (question 1) |
| **Melt Began** | SWE started dropping steadily. | Same |
| **Snowpack Melted Out** | SWE reached zero. Late and slow means a long, strong river; early means a short pulse and a thin summer. | Same |

## 2. Runoff and rain (Apr to Sep, in the rivers)

| Event | What it means | Where it shows up |
|---|---|---|
| **Spring Runoff Began** | Melt reached the rivers and flow started climbing. Flow is in **cfs** (cubic feet per second). | `data/SouthPlatteFlow.csv` |
| **First Flush Occurred** | The rising river scoured banks and forest floor and carried a season's dead plant matter downstream: the spring TOC spike. | Later, as a TOC rise at the plant |
| **Runoff Peaked** | The season's highest flow. | `data/SouthPlatteFlow.csv` |
| **Storm Hit the Watershed** | Rain, often a short, intense summer (monsoon) thunderstorm. | `data/USC00058022.csv` (NOAA); radar in the map's storm replay |
| **River Returned to Baseflow** | No melt, no rain, only groundwater seeping out of rock. Baseflow carries more minerals, so alkalinity rises. | Flow, plus conductance in `data/USGS_South_Platte.csv` |

## 3. Collection system (reservoirs and tunnels)

| Event | What it means | Where it shows up |
|---|---|---|
| **Water Diverted Under the Divide** | West-slope water moved east: Dillon through the 23-mile Roberts Tunnel, or the Moffat Tunnel on the North System. | Not in the CSVs; the Grant gage on the map sees tunnel water entering the North Fork |
| **Reservoir Storage Changed** | A reservoir filled or drew down. | `water-system-3d/storage-history.json` (Dillon, Cheesman, Strontia, and CHARESCO) |
| **Reservoir Release Changed (GK)** | Operators changed how much water leaves a dam. A *decision*, not nature, and it shapes what arrives downstream. | Not in the repo (question 3) |
| **Tributaries Converged** | The North Fork joined the mainstem about 2 km above the Strontia gage, so that gage measures the combined flow. | `strontia-brief/places.json` |

## 4. The river gage above Strontia (the cheap sensors)

| Event | What it means | Where it shows up |
|---|---|---|
| **Gage Reading Recorded** | Every 15 minutes: turbidity, specific conductance, pH, temperature, dissolved oxygen. | `data/USGS_South_Platte.csv` (daily summaries) |
| **Turbidity Spiked** | The water went cloudy with sediment. The Aug 14 to 15 storm took it from about 2 to 329 FNU. | Map storm replay, `strontia-brief/series/` |
| **Conductance Shifted** | Dissolved minerals rose or fell; tracks alkalinity closely. | `data/USGS_South_Platte.csv` |
| **Sensor Pulled for Winter** | The gage stopped reporting before the river froze, which is why there is no Jan to Mar data. | Gaps in the CSV |
| **Reading Revised** | USGS replaced a provisional value. The same day's data can change after the fact. | A fresh API pull against the committed CSV |

## 5. Strontia Springs Reservoir (by depth)

| Event | What it means | Where it shows up |
|---|---|---|
| **Profile Cast Completed** | The sonde ran top to bottom, taking readings at many depths. | `data/Strontia 0407_0819.xlsx` (Apr 7 to Aug 19, 2026) |
| **Reservoir Stratified (GK)** | The sun warmed a lighter surface layer that stopped mixing with the cold water below. | Temperature by depth |
| **Bottom Water Lost Oxygen (GK)** | The deep layer, cut off from the air, used up its dissolved oxygen. | Dissolved oxygen by depth |
| **Storm Plume Entered Reservoir (GK)** | Muddy river water flowed in and slid to the depth that matched its density. | Turbidity by depth around Aug 14 to 15 |
| **Reservoir Turned Over (GK)** | The surface cooled to the same density as the water below and the whole column mixed. Usually in fall, possibly after the sonde record ends. | Probably not captured (question 4) |

## 6. Foothills treatment plant

| Event | What it means | Where it shows up |
|---|---|---|
| **Water Withdrawn to the Plant** | Piped from Strontia to Foothills, about four hours by Denver Water's reckoning. | `guide.md` section 1 |
| **Grab Sample Taken** | Someone filled a bottle by hand. | Implied |
| **Lab Result Reported** | TOC and alkalinity become known, after the water has arrived. The *finding out* clock. | `data/FoothillsInfluent.csv` |
| **TOC Excursion Began** | TOC went above 3 mg/L: more treatment work and a disinfection-byproduct compliance risk. | Computed from the same file |
| **Alkalinity Excursion Began** | Alkalinity went below 60 mg/L: the coagulation chemistry needs compensating. | Computed from the same file |
| *Adjust Treatment* (command, not event) | Operators changed dosing or staffing. Everything in Scenario 1 exists to move this **before** the excursion instead of after. | Not in the data |

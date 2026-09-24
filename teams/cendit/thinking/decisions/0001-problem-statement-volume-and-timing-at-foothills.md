# 0001. Problem statement: volume and timing of water arriving at Foothills

- **Status:** Proposed
- **Date:** 2026-09-24
- **Deciders:** team cendit

## Context

We wanted a problem statement rooted in something the SMEs said they care about
rather than one we found interesting. The clearest such signal in the materials is
about people, not chemistry. Jake's stated reason a few days of warning helps is
"staffing and treatment" — getting the right people on shift and the right
chemicals dosed before the unusual water arrives, rather than after someone
notices it (`guide.md` §2). `README.md` repeats it: advance prediction "would let
operators plan staffing and dosing before the water gets here. That is the
problem."

So the operator-side question is a resourcing question. What we want to give the
plant is not a number about water; it is an answer to *what will this event ask of
us, and when*.

Working backwards from that, the first thing a shift plan needs is how much water
is coming and when it lands. Our read is that a historical, explanatory version of
this question has to come first: if we cannot say what a past hydrologic event did
to arrival volume and timing, we have no basis for predicting the next one.

## Decision

We are framing our effort as:

> **When a hydrologic event happens upstream — storm, melt pulse, drought
> recession — how much water reaches the Foothills Water Treatment Plant, when
> does it arrive, and how does that change what the plant needs on hand?**

We take this in two phases.

**Phase 1, retrospective (our committed scope).** Using the historical record,
characterize how identifiable past events moved through the collection system to
the plant: the shape of the volume arriving, the lag between the event upstream
and the arrival, and how both vary between wet and dry years. Explain it well
enough that an operator recognizes their own experience in it.

**Phase 2, predictive (stretch).** Turn the retrospective characterization into
lead time — given conditions now, project arrival volume and timing far enough
ahead to be actionable for staffing. This is the facet that actually relieves the
constraint, and it is the one we will only reach if Phase 1 lands.

## Scope

**In scope**

- Volume and timing of water arriving at Foothills, as the primary quantity.
- Historical events present in the committed data: `data/SouthPlatteFlow.csv` and
  `data/USGS_South_Platte.csv` cover 2022-04-01 through 2026-08-19 daily, with
  snowpack in `data/HoosierPass.csv` and precipitation in `data/USC00058022.csv`.
- Framing the output in resourcing terms — lead time, magnitude, confidence — not
  just as a hydrograph.

**Out of scope (for now)**

- Predicting TOC and alkalinity as such. They are the plant's chemistry problem
  and Jake already has models for them; we are answering the volume-and-timing
  question sitting underneath the staffing decision. If volume turns out to be
  uninformative on its own, revisit this.
- Depth-resolved behavior inside Strontia Springs Reservoir.
- Any claim about actual crew sizes, shift rules, or chemical inventories. We have
  no data on those and will not invent them.

## Why this and not the alternatives

Cassidi's three scenarios (`README.md`) do not contain ours verbatim. Scenario 1 is
the TOC/alkalinity soft sensor; scenario 2 is storm impact on source-water
*quality* and arrival timing; scenario 3 is movement through the collection system
under hydrologic and seasonal events. Ours sits across 2 and 3, on the quantity
axis rather than the quality axis. Her framing on the deck explicitly invites a
scenario she did not anticipate, so we think this is fair game — but we should say
so to her plainly rather than let her assume we picked one of the three.

We chose it over scenario 1 because the soft-sensor path is the one Jake has
already walked, and over a pure visualization because "how did resourcing need to
change" is a question with an answer, not just a picture.

## Consequences

- We have to define "an event" operationally before we can count any. That
  definition is the first real piece of work.
- We owe the SMEs a clear statement that our volume framing is our inference from
  Jake's staffing comment, not something he asked for. If he tells us the volume
  side is already solved for them, the framing should change and this record gets
  superseded.
- Phase 2 being a stretch means Phase 1 must stand alone as a deliverable.

## Open questions

Most of these need an SME; a few we can settle against the data.

1. **Is arrival volume actually the driver of staffing, or is it variability in
   chemistry at a given volume?** Highest-value question to ask. Our whole framing
   rests on our answer being "volume matters".
2. **We have no plant-intake volume in this repo.** `data/FoothillsInfluent.csv`
   carries TOC and alkalinity only; the nearest volume signal is `Flow_CFS` at the
   South Platte gauge above Strontia. Does Denver Water have treated-volume or
   intake-flow records, and can we get them? If not, we must be explicit that
   gauge flow is a proxy and that Strontia's storage and releases sit between it
   and the plant.
3. **What lag do we use, and does the data support it?** The materials disagree in
   an interesting way: Denver Water's raw water group models about four hours from
   the sensor above Strontia to the plant intake, while Jake's models predict best
   with upstream readings lagged days — he attributes this to mixing and
   deposition in the reservoir and asks that the exact number not be leaned on
   (`guide.md` §1). Since arrival timing *is* our deliverable, this tension is our
   central technical problem rather than a detail.
4. **How much lead time is enough to change a staffing decision?** A model with 12
   hours of warning and one with 4 days are different products.
5. **Is 2022-04 onward enough history?** Four water years may not contain enough
   distinct events. Extending it means API pulls (`README.md`, public data
   resources), and pulled values are provisional.

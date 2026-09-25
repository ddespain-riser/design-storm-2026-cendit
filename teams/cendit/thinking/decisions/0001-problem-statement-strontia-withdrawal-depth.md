# 0001. Problem statement: which depth to withdraw from at Strontia Springs

- **Status:** Proposed
- **Date:** 2026-09-24, revised 2026-09-25
- **Deciders:** team cendit

## Context

This record originally framed our effort around **volume and timing of water
arriving at Foothills** — inferred from Jake's remark that lead time helps with
"staffing and dosing" (`guide.md` §2). That framing did not survive contact with
the SMEs or the data, and the 2026-09-25 revision below replaces it. The original
framing is preserved in [What we moved away from](#what-we-moved-away-from) so the
trail is legible; the record is still **Proposed**, so we amended it rather than
superseding it.

Three things pushed the pivot.

**Both SMEs care about treatment, not volume.** Cassidi's worked example of a
near-shutdown is a *quality* failure — "turbidity and water quality coming in was
basically too much for our filters to handle" (`../../content/sme-qa-cleaned.md`).
Jake's interview named treatment levers directly: coagulant dose at first-stage
sedimentation, and pre-oxidation when organics are incoming
(`../../content/jake-interview-transcript.md`; caveats in
[`../problem-options-from-jake.md`](../problem-options-from-jake.md)). Nobody at
Denver Water asked for arrival volume.

**We have the most data on this question.** `data/Strontia 0407_0819.xlsx` is a
depth-resolved profiling-sonde record: 16,093 readings over 104 days, 2026-04-07
through 2026-08-19, spanning vertical positions **4.68 m to 20.73 m**, carrying
temperature, conductivity, pH, ORP, turbidity, chlorophyll, phycocyanin and
dissolved oxygen. That is the densest and least-examined file in the repo. By
contrast, the target variable the old framing needed — a Foothills intake volume
series — **does not exist** (Q2); the plant's own quality readings are twice-daily
grab samples.

**Jake posed this question himself and does not have the answer.** He described
**four gates at different heights** in Strontia, said Denver Water can within
limits choose where to pull from, and said a goal of the profiling sonde is to
work out in real time whether pulling from a different level would improve water
quality. He also said plainly that they are still trying to figure out how to use
the sonde data at all. Nobody has looked at this yet.

## Decision

We are reframing our effort as:

> **At any given time, which depth should Strontia Springs Reservoir be withdrawn
> from to send the cleanest water to Foothills — and how much treatment effort
> does that choice save?**

Two phases, as before.

**Phase 1, characterize the water column (our committed scope).** From the sonde
record, describe how quality stratifies with depth at Strontia and how that
stratification moves over the season and around events: where the clean layer
sits, how deep and how stable it is, how fast it shifts, and which analytes
actually separate the layers. Deliver it well enough that an operator recognises
their reservoir in it.

**Phase 2, turn that into a withdrawal recommendation (stretch).** Map depth onto
the gates and onto treatment consequence — for a given profile, which gate yields
the lowest turbidity and organic load, and what that is worth in coagulant and
pre-oxidation. Gate heights are unknown (Q20), so this phase runs on assumed
elevations as a sensitivity study unless Jake supplies or approves them.

## Scope

**In scope**

- Depth-resolved water quality inside Strontia Springs Reservoir, as the primary
  quantity: `data/Strontia 0407_0819.xlsx`, 2026-04-07 to 2026-08-19.
- The link from a withdrawal depth to what the plant then has to do about it,
  using `data/FoothillsInfluent.csv` (TOC, alkalinity) and
  `data/SouthPlatteTelemetry.csv` / `data/USGS_South_Platte.csv` for turbidity and
  flow context.
- Inflow events as context for stratification — the monsoon turbidity slugs Jake
  pointed us at, not only the 2023 near-shutdown.
- Framing the output as an operating decision — pull from gate *n*, because —
  rather than as a profile plot.

**Out of scope (for now)**

- Arrival volume and lag as the primary target. Volume still enters as a driver of
  stratification and inflow; it is no longer the thing we predict.
- A hydraulic or CFD model of the reservoir. We are working from the observed
  profile, not simulating the water body.
- Any claim about actual gate elevations, crew sizes, shift rules, or chemical
  inventories. We have no data on those and will not invent them. Assumed gate
  heights are labelled as assumptions everywhere they appear.
- Predicting TOC as a soft sensor in its own right — Jake has walked that path.

## Why this and not the alternatives

Weighed against the four other options Jake volunteered
([`../problem-options-from-jake.md`](../problem-options-from-jake.md)):

- **Sensor siting (B)** is self-contained and he does not know the answer either,
  but it produces a recommendation Denver Water may not have a budget cycle for,
  and it says nothing about treatment.
- **Early warning narrowed to monsoon slugs (A+D)** is the nearest neighbour to
  the old framing and still a good validation case — we fold it in as context
  rather than as the headline, because warning only pays off if there is a lever
  to pull, and depth selection *is* the lever.
- **Sonde summary (E)** is a deliverable, not a problem statement. This decision
  absorbs it: characterizing the water column gives Jake the summary he asked for
  as a by-product of Phase 1.
- **Gate selection (C)** is what we chose. He called it "an open thing we've been
  talking about a lot recently," it is the highest-value problem he named, and the
  data it needs is the data we have most of.

Against Cassidi's three scenarios, this sits inside Scenario 2 — source-water
quality — with a decision attached.

## Consequences

- Q20 (gate heights) moves from a side question to a gate on Phase 2. We should
  ask Jake for the four elevations, or for permission to model them, this week.
- The sonde record is **104 days in a single season**. It cannot support an event
  study across wet and dry years, and we must not claim one. Anything seasonal we
  say is one spring-to-summer, stated as such.
- We owe Cassidi and Jake a plain statement that we pivoted and why, so neither
  assumes we are still working the volume question.
- The old framing's dependency on a Foothills intake series (Q2) is gone. Q2 drops
  in value; Q1 is effectively answered against the volume framing.
- Phase 2 being a stretch means Phase 1 — the water-column characterization — must
  stand alone as something Jake can use.

## What we moved away from

The 2026-09-24 framing, recorded here so the change is traceable:

> When a hydrologic event happens upstream — storm, melt pulse, drought recession
> — how much water reaches the Foothills Water Treatment Plant, when does it
> arrive, and how does that change what the plant needs on hand?

It failed on three counts: the target variable does not exist in the data (Q2);
the SMEs' own worked examples are quality failures at unremarkable flow (Q1 — on
2023-08-01, record-high turbidity of 477 NTU against a flow of 647 cfs, well under
the 1390 cfs record peak); and it was our inference from a staffing remark rather
than anything Denver Water asked for.

## Open questions

These live in the [question register](../questions/open-questions.md), ranked and
kept current as new content lands. The ones that now gate this record:

- **[Q20](../questions/open-questions.md#q20-what-are-the-strontia-gate-heights)** —
  the four gate elevations, or permission to model them. Blocks Phase 2.
- **[Q21](../questions/open-questions.md#q21-what-continuous-data-exists-that-is-not-in-the-repo)** —
  whether a longer profiler record or the fDOM test data exists. Either would
  widen the 104-day window.
- **[Q14](../questions/open-questions.md#q14-do-reservoir-releases-decide-what-arrives)** —
  whether releases are an operator's choice, which is now the mechanism we are
  studying rather than a confound.

This record stays **Proposed** until the team agrees the pivot and the SMEs have
been told.

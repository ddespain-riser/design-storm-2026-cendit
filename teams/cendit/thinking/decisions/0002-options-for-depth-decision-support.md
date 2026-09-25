# 0002. Options for operator-facing depth decision support

- **Status:** Proposed
- **Date:** 2026-09-25
- **Deciders:** team cendit

## Context

[0001](0001-problem-statement-strontia-withdrawal-depth.md) set the problem —
which depth to withdraw from at Strontia, and what that saves in treatment. It did
not say what we build. Three SME conversations on 2026-09-25 and one afternoon of
checking the data answered enough of the open questions that the build options are
now separable, so this record ranks them.

What changed since 0001 was written:

**The gate depths are known.** Cassidi gave them: **15, 45, 65 and 95 ft below the
surface**, with **45 ft as the default** and the others closed
(`../../content/depth-interview-notes.md`). This answers
[Q20](../questions/open-questions.md#resolved) and
un-gates Phase 2 of 0001. The pool is held very stable because Strontia sits
directly above treatment, so the depth-to-gate mapping needs no storage correction
to first order.

**The sonde covers all four gates, and 0001's stated range is wrong.** 0001 says
the record spans 4.68–20.73 m. Read directly from
`data/Strontia 0407_0819.xlsx`, it spans **0.85 m to 47.82 m** (2.8–156.9 ft), and
**all 104 days reach past the deepest gate** at 29.0 m. The 16,093 readings are
**~390 casts, 3.8 per day**, at roughly 0.25 m vertical resolution. Phase 2 is not
merely unblocked; the data covers every gate for the whole window.

**The lever is fast, but it is not pulled fast.** A gate change is a remote
software signal that takes effect in minutes (Cassidi), but Jake said they would
not change gates more than about **once per day**, and that after a storm the water
is much the same for **three to four days**
(`../../content/notes-jake-1210.md`). The decision cadence is daily, not 6-hourly.

**"Good" now has numbers.** Jake: turbidity **above 10 NTU is a concern**, and
alkalinity **below 60** brings a TOC-removal requirement that costs chemicals. Our
visual encodings should key off those bands rather than an arbitrary scale. The
exact regulatory meaning of the 60 figure is transcribed loosely and needs
confirming.

**Measurements beat predictions, for now.** Jake trusts the sonde readings and is
explicitly *"trying to sell operations on the sonde"*; he called the predictions
less confident and less trustworthy today. Anything we ship that leans on a
forecast inherits a credibility problem he already has.

**The sonde is not at the gate.** Jake flagged this as a point of contention: the
sonde is **mid-reservoir**, the gates are on the **intake tower at the edge**, and
the relationship is *"more like loose correlation."* This is the most serious
threat to the whole effort and it is addressed in O2 below.

**There is a ~12 hour lag from sonde to plant**, including measurement and
analysis delay. And the plant already runs **real-time turbidity, temperature, pH
and conductivity at 1–5 minute resolution** — none of which is in this repository,
where the only plant series is twice-daily TOC and alkalinity grab samples.

Meanwhile `../../prototype/` (Eduardo, 2026-09-25) already ships a **Reservoir
depth** tab with editable gate depths and a "what each gate would have drawn"
comparison. Several options below are revisions to that rather than new builds.

## Decision

We will pursue the options below **in the stated order**, and treat O1–O4 as the
committed build. Each option is versioned here so that re-ranking them later means
adding a record, not rewriting this one.

### O1. Validate the sonde against the plant at the 12-hour lag — *committed, do first*

Correlate the sonde column against `data/FoothillsInfluent.csv` TOC and alkalinity,
shifted by the ~12 hour lag Jake gave, and report honestly how strong the
relationship is.

Everything else rests on this. If mid-reservoir sonde readings do not track what
the plant sees, no gate recommendation built on them is credible, and we should
know that before building the recommendation rather than after. It also serves
Jake's actual goal — he is trying to sell operations on this instrument, and an
honest skill number is what that argument lacks.

**Known limit, state it up front:** only the 45 ft gate is open, so every plant
reading came through 45 ft. We can validate the sonde-to-plant link *at one depth*.
The other three gates are counterfactual and no observed plant outcome exists for
them. O1 therefore calibrates, it does not confirm the ranking.

### O2. Reframe the gate output from point values to layers — *committed*

Jake's mid-reservoir-versus-intake-tower objection breaks any claim of the form
"gate 3 would have delivered 4.2 NTU." It does not break the claim "the column is
stratified, the clean layer sat between 13 and 20 m, and gate 3 sits in it."
Horizontal differences across a reservoir are small compared with vertical
differences across a thermocline, so the *ordering* of the gates survives even
where the absolute numbers do not.

So: change the prototype's depth tab to present **stratification structure and gate
ranking with a margin**, not predicted per-gate values, and say in the UI that the
sonde is mid-reservoir. This is a presentation and wording change over a model that
already exists.

This also absorbs the withdrawal-zone question Jake put to us — *if you open the
gate, which depths are actually consumed?* Nobody knows. Test it as sensitivity:
recompute the ranking using 1 m, 3 m and 5 m averaging windows around each gate. If
the ranking holds across all three, the uncertainty is harmless and we can say so.

### O3. Move the decision cadence to daily, with event persistence — *committed*

Aggregate to a daily decision unit rather than per-cast, and show the
three-to-four-day post-storm persistence Jake described, so the operator sees not
just today's best gate but how long that answer is likely to hold. A recommendation
that flickers between gates every six hours is one they will correctly ignore.

### O4. Encode the real thresholds and clean the data — *committed*

Key the visual off **10 NTU** and **alkalinity 60** as banded thresholds rather
than a continuous ramp, so "this is a concern" is readable without interpretation.
In the same pass, handle what Jake warned about: outlier readings that were never
accurate, and the fact that **more recent data is higher quality**. Both are now
SME-endorsed reasons to filter, which is different from us deciding to.

### O5. Build the operator view around history — *next up*

The strongest product opening in the notes is not the recommendation at all. It is
that **SCADA shows a point-in-time snapshot only, with no way to look at historical
data** (`../../content/coleman-1145-interview-notes.md`). They do not lack sensors;
they lack *time*. A depth-versus-time heatmap with the four gates overlaid gives
them something they currently cannot get at any price.

Build it for the decision chain that actually exists: **operators do not decide.**
They notice and communicate upward. So the output is something an operator can hand
to a decision maker — a defensible line plus the evidence behind it — not an
autonomous setpoint.

### O6. Ask for the plant's high-resolution data — *blocked on an SME, ask this week*

The 1–5 minute plant instruments would replace twice-daily grab samples as O1's
validation target and turn a weak daily correlation into a real one. Also ask
whether any reading exists at the intake tower itself, which would settle O2
directly. Raise both with Jake alongside the confirmation questions below.

### O7. Prediction and lead time — *deprioritized, not dropped*

Deprioritized on two independent grounds: the gate change takes minutes, so
real-time detection is sufficient to act and no lead time is needed to *actuate*;
and Jake trusts measured values over model output today. Note the reframe that
makes it worth keeping — the ~12 hour sonde-to-plant lag means **a sonde reading is
already a measured 12-hour-ahead indicator of plant conditions**, which is a lead
time obtained without a model. Prediction proper earns its place for staffing,
chemical inventory, and the spill-versus-divert call, not for gate selection.

### O8. Blending across sources — *out of scope, recorded*

Jake described the real operational lever as pulling from different places to
**mix and dilute** alkalinity and TOC, of which gate selection is one instance.
That is a larger problem than 0001 scoped and we are not taking it on, but it is
the honest frame and we should not present gate choice as the whole lever.

## Scope

**In scope:** O1 through O5, against the committed data and the existing prototype.

**Out of scope (for now):** system-wide blending (O8); a hydraulic or CFD model of
the reservoir; any claim about actual chemical costs or crew sizes; presenting
per-gate absolute water quality as predicted plant outcome.

## Why this and not the alternatives

The ordering is driven by what would invalidate the most work if it turned out
badly. O1 first, because a weak sonde-to-plant link would undercut O2 through O5
and we would rather find out in a day than a week. O2 second, because Jake named
the mid-reservoir problem as contentious and a demo that ignores it will be
dismissed by exactly the operations audience he is trying to persuade.

The tempting order — build the compelling visual first, validate later — was
rejected for that reason. A polished view of an unvalidated number is worse than
no view, in a room where the instrument itself is still being sold.

## Consequences

- 0001's depth-range figure is wrong and its Phase 2 should move from stretch to
  committed. That record is still Proposed, so it can be amended rather than
  superseded.
- Q20 is answered and drops out of the register.
- O2 means we give up the most quotable version of our result — a per-gate NTU
  number. What we keep is defensible, which matters more here.
- We owe Jake a short list of confirmation questions, below.

## Open questions

- **Reservoir elevation.** The notes record height 6901 and a held level of 5990 ft.
  Those are inconsistent with a 243 ft dam; 5990 is probably a mis-hearing. Confirm.
- **The alkalinity 60 threshold.** Confirm the number, its units, and whether it is
  a regulatory tier boundary for enhanced coagulation or an internal rule of thumb.
- **Is any water quality measured at the intake tower?** Settles O2.
- **Can we have the plant's 1–5 minute instrument data?** Gates O6.
- **What does the gate actually draw?** Jake asked us for a recommendation on the
  withdrawal zone thickness; O2 answers it as sensitivity, not physics.

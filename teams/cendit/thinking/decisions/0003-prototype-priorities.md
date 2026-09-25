# 0003. What we prototype next, ranked against the pain points

- **Status:** Proposed
- **Date:** 2026-09-25
- **Deciders:** team cendit
- **Amends:** [0002](0002-options-for-depth-decision-support.md). The problem is still
  [0001](0001-problem-statement-strontia-withdrawal-depth.md); this record re-ranks
  the build, it does not re-open the problem.

## Context

0002 ranked O1–O8 against the SME notes. Since it was written, one thing changed that
the ranking did not account for: **`../../prototype/` already implements a good deal of
it.** Reading `prototype/app.js` and its README, the page today has

- a **depth × time heatmap** with the four gates overlaid as dashed lines, plus river
  turbidity bars on the same axis (`#dp-note`, the Reservoir depth tab) — this is
  most of what 0002 filed under O5 as "next up";
- **per-gate series and a best-gate table** (median, 90th percentile, days-won), which
  is Phase 1 of 0001 delivered;
- a **gate what-if** that shifts measured plant TOC and alkalinity by a fitted slope,
  with a bootstrap range and an "outside the fitted range" flag;
- a **correlation-by-depth panel** — plant alkalinity against specific conductance, and
  plant TOC against turbidity, at every depth — which is a first cut at O1's question,
  and the right shape for it: if the plant draws at 45 ft, the correlation should peak
  near 45 ft.

So the remaining work is narrower than 0002 implied, and its order is different. The
what-if is the one piece that now **conflicts** with a commitment in 0002: it states a
per-gate absolute value, which O2 said to stop doing.

The pain points the build is answering, restated from the 2026-09-25 notes so the
ranking below can be checked against them:

| # | Pain | Source |
|---|---|---|
| P1 | SCADA shows present state only. **No way to look at historical data.** | Coleman 1145 |
| P2 | Nobody knows whether the mid-reservoir sonde represents the intake tower. | Jake 1210 (Q24) |
| P3 | Nobody knows **what band of depths an open gate draws**; Jake asked *us* for a recommendation. | Coleman 1145 (Q23) |
| P4 | Operators do not decide. They notice and communicate upward — they need something handable. | Coleman 1145 |
| P5 | "Good water" is undefined beyond two numbers: turbidity **>10 NTU** is a concern, alkalinity **<60** costs chemicals. | Coleman 1145, Jake |
| P6 | Predictions are distrusted; measurements are trusted. Jake is still selling operations on the sonde. | Jake 1210 |
| P7 | Old sonde data contains outliers that were never accurate; recent data is better. | Coleman 1145 |
| P8 | The real lever is mixing and diluting across sources; gate choice is one instance of it. | Coleman 1145 |

## Decision

Build in the order below. **B1–B4 are the committed set** and are all small, because
the substrate exists. B5–B7 are next. B8–B9 are recorded and not taken on.

### B1. Retire the per-gate number and ship a ranking with a margin — *committed, do first*

**Pain:** P2, P3. **Where:** the what-if panel, `app.js` gate what-if section.

The what-if says "G3 at 65 ft would have measured 2.4 mg/L." Under Q24 we cannot
defend that sentence, and it is the sentence an operations audience will attack first.
Replace the headline with the claim we *can* defend: the column is stratified, the
clean layer sits between *x* and *y* metres, and gates rank in this order with this
much separation. Keep the modelled series, demote it to supporting evidence, and label
the sonde as mid-reservoir in the UI.

Ship the **margin** alongside the order: where two gates are within the day-to-day
noise, say they are tied rather than ranking them. The existing bootstrap already
produces the spread this needs.

Done when: no panel states a counterfactual per-gate absolute value as a result, and
the tab's top line is an ordering plus a separation.

### B2. Answer Jake's withdrawal-zone question as a sensitivity slider — *committed*

**Pain:** P3 — the only item on the list where an SME asked us for the answer.

Recompute the gate ranking with the sonde averaged over a **1 m, 3 m and 5 m** window
around each gate, exposed as a control rather than a constant. If the ordering holds
across all three, that *is* the recommendation: the uncertainty is harmless, say so
plainly. If it inverts at 5 m, we have a specific ask for an engineer — withdrawal rate
and tower geometry — which is worth more than a guess.

This is cheap: `sondeAt()` already reads a depth bin; it becomes a windowed mean.

Done when: the window is a control, and the tab states whether the order survives it.

### B3. Make the existing correlation-by-depth panel the honest-skill answer — *committed*

**Pain:** P2, P6. **Where:** the evidence-by-depth panel, which already exists.

It currently plots correlation against depth at zero lag. Two changes make it O1:
sweep the **lag** (0, 12 h, 1–4 days — Q3 has four candidate figures and the data can
adjudicate), and report a **skill number against persistence**, not just a correlation
shape. Then state the result whichever way it falls.

State the limit in the UI, not only here: **only the 45 ft gate has ever been open**,
so this calibrates the sonde-to-plant link at one depth. It cannot confirm the ranking
at the other three.

Honest is the point. Jake's argument for the sonde lacks a skill number, and a weak
one that we publish ourselves is worth more to him than a strong one he cannot check.

Done when: the panel reports lag, skill against persistence, and the one-depth caveat.

### B4. Band the thresholds and gate the low-quality record — *committed*

**Pain:** P5, P7.

Key the colour scales off **10 NTU** and **alkalinity 60** as bands, not a continuous
ramp, everywhere both appear. "Concern" should be readable without interpreting a
gradient. In the same pass, add the outlier filter Coleman endorsed and show what it
removed — a filter an SME asked for is different from one we chose, and the difference
should be visible.

Done when: the two thresholds are banded in every view that shows them, and the
filtered points are counted and disclosed rather than silently dropped.

### B5. A handable daily brief — *next up*

**Pain:** P1, P4. The single highest-value *new* build, and the reason it is not first
is that B1–B4 change what it would say.

Operators notice and hand upward, so the output is an artifact for that hand-off: one
day, one recommended gate, the ordering and margin behind it, the last 30 days of the
column as the heatmap we already have, and how long this answer is likely to hold —
Jake's **three-to-four-day post-storm persistence**, at a **daily** cadence, not
per-cast. A recommendation that flickers between gates every six hours is one they
will correctly ignore.

Make it exportable or printable. A screenshot of a live tab is what will actually get
forwarded; we may as well design the thing that gets forwarded.

### B6. Lean on history as the product, not the model — *next up*

**Pain:** P1, P6.

P1 is the pain with no competitor: they do not lack sensors, they lack *time*. The
heatmap already answers it, so this is about promotion rather than construction —
make "what has the column been doing" reachable without first accepting a
recommendation, and add the "days like this one" lookup against the depth record the
way Replay already does for the river.

This is also the answer to P6. It contains no prediction at all, so nothing in it
inherits the credibility problem Jake already has.

### B7. Ask for the plant's 1–5 minute data — *blocked on an SME, ask this week*

**Pain:** P2. Unchanged from 0002's O6. Twice-daily grab samples are a poor validation
target for B3; turbidity, temperature, pH and conductivity at 1–5 minutes would turn a
weak daily correlation into a real one. Ask in the same breath whether **anything at
all is measured at the intake tower**, which would settle Q24 directly, and what the
horizontal sonde-to-tower distance is.

### B8. Prediction — *deprioritized, with one reframe kept*

**Pain:** P6, inverted — prediction is the thing being distrusted. The gate change
takes minutes, so no lead time is needed to actuate it.

Keep one reframe, because it costs nothing: the **~12 hour sonde-to-plant lag means a
sonde reading is already a measured 12-hour-ahead indicator** of plant conditions.
That is lead time without a model, and it belongs in B5's brief. Prediction proper
earns its place for staffing, chemical inventory and the spill-or-divert call — not
for gate selection.

### B9. Blending across sources — *out of scope, recorded*

**Pain:** P8. Jake described the real lever as pulling from different places to mix and
dilute. Gate choice is one instance of it. Larger than 0001 scoped; we are not taking
it on, and we should not present gate choice as the whole lever.

## Why this order

The rule is unchanged from 0002 — do first what would invalidate the most work — but
the answer moved, because the visual that 0002 was protecting is already built.

B1 leads because the prototype currently makes a claim we have decided we cannot
defend, and the cost of shipping that claim is the audience. B2 follows because it is
the one open question an SME handed to us, and it is a slider. B3 is O1 demoted from
first to third: it is no longer a gate on the work, because the ranking argument in B1
survives a weak sonde-to-plant correlation — a weak correlation makes the *absolute*
numbers indefensible, which B1 already assumes.

The tempting order — build the brief (B5) first, because it demos best — is rejected
for 0002's reason: a polished view of a number we have retracted is worse than no
view.

## Consequences

- 0002's O1–O5 are superseded by B1–B6. The mapping is: O1→B3 (demoted), O2→B1+B2
  (promoted, split), O3→B5, O4→B4, O5→B5+B6 (mostly already built), O6→B7, O7→B8,
  O8→B9.
- The prototype README's gate what-if description and its "Result for April to August
  2026" line will need rewording under B1. So will the two open questions it lists
  about gate depth, which Cassidi has since answered.
- We give up the most quotable result we have — a per-gate TOC number. Deliberate.
- Q23 gets a real answer from B2 (sensitivity, not physics) and Q24 gets a measured
  bound from B3 at one depth only. Neither is closed by us alone.

## Open questions

Unchanged from 0002 and live in [the register](../questions/open-questions.md):
Q24 (does the sonde represent the gate), Q23 (what a gate draws), Q3 (sonde-to-plant
lag), Q21 (the plant's high-resolution data), Q25 (what makes water good). Plus the
two confirmations we owe Jake: the reservoir elevation figures, and whether
alkalinity 60 is a regulatory tier boundary or a rule of thumb.

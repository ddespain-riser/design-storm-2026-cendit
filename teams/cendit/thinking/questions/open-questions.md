# Open questions

- **Updated:** 2026-09-24
- **Working from:** [decision 0001](../decisions/0001-problem-statement-volume-and-timing-at-foothills.md)
  — volume and timing of water arriving at Foothills, retrospective first.

What team cendit does not know yet, ranked by how much the answer would change
what we build. Ranking rule and status values are in [`README.md`](README.md).

## The register

| # | Question | Unc. | Value | Answered by |
|---|---|---|---|---|
| [Q1](#q1-is-arrival-volume-really-the-staffing-driver) | Is arrival volume really the staffing driver, or is it chemistry at a given volume? | High | High | Cassidi |
| [Q2](#q2-does-a-foothills-intake-volume-series-exist) | Does a Foothills intake or treated-volume series exist, and can we have it? | High | High | Jake |
| [Q3](#q3-four-hours-or-several-days) | Four hours or several days? The travel-time contradiction. | High | High | Data first, then Jake |
| [Q4](#q4-what-are-the-dates-of-the-2023-storm) | What are the dates of the 2023 South Platte storm, and what did the gages show? | Med | High | Cassidi, then data |
| [Q5](#q5-replay-live-or-forecast) | Is the digital twin they want a replay, a live view, or a forecast? | Med | High | Cassidi |
| [Q6](#q6-how-much-lead-time-changes-a-decision) | How much lead time actually changes a decision? | Med | High | Cassidi, plant ops |
| [Q7](#q7-what-counts-as-an-event) | What counts as an event, operationally? | Med | High | Us, then validate |
| [Q8](#q8-which-of-the-three-audiences-are-we-serving) | Which of the three audiences are we serving? | Low | High | Team, then Cassidi |
| [Q9](#q9-what-does-influent-quality-cost-in-chemicals) | What does influent quality cost in chemicals, per unit? | High | Med | Cassidi |
| [Q10](#q10-is-four-water-years-enough-history) | Is 2022-04 onward enough history to hold enough events? | Med | Med | Data |
| [Q11](#q11-what-are-we-missing-between-readings) | What are we missing between the readings, and is interpolating defensible? | High | Med | Data, then Jake |
| [Q12](#q12-do-water-rights-and-instream-obligations-belong-in-the-model) | Do water rights and instream obligations belong in the model? | High | Low | Cassidi |
| [Q13](#q13-is-the-strontia-intake-multi-level) | Is the Strontia intake multi-level, and does an operator choose depth? | Med | Low | Jake |

---

### Q1. Is arrival volume really the staffing driver?

- **Status:** Open · **Uncertainty:** High · **Value:** High

**Why it matters.** Decision 0001 infers a volume framing from Jake's remark that
lead time helps with "staffing and dosing" (`guide.md` §2). Nobody at Denver Water
asked for volume. If the thing that strains a shift is chemistry variability at an
ordinary flow, our whole framing is aimed slightly off and 0001 should be
superseded.

**What we have.** The SME's one worked example cuts against us. Describing the 2023
storm they said "turbidity and water quality coming in was basically too much for
our filters to handle" — filters offline, massive cleaning, production slowed
(`../../content/sme-qa-cleaned.md`). That is a *quality* failure arriving on a
volume event. Which of the two they would have wanted warning about is exactly the
open part.

**What would answer it.** Ask directly: when you staff up for an incoming event,
what number are you reacting to? Then ask what a high-flow, clean-water event does
to the plant — if the answer is "not much", volume alone is not the driver.

---

### Q2. Does a Foothills intake volume series exist?

- **Status:** Open · **Uncertainty:** High · **Value:** High

**Why it matters.** We have committed to predicting arrival volume at Foothills and
we do not have arrival volume at Foothills. `data/FoothillsInfluent.csv` carries
TOC and alkalinity only. The nearest signal is `Flow_CFS` at the South Platte gage
*above* Strontia, with the reservoir's storage and releases sitting in between. No
target variable, no Phase 1.

**What would answer it.** Ask Jake whether plant intake flow or treated volume is
recorded and releasable. If not, we state plainly that gage flow is a proxy, and
Q3 becomes the thing that determines whether the proxy is any good.

---

### Q3. Four hours or several days?

- **Status:** Open · **Uncertainty:** High · **Value:** High

**Why it matters.** Arrival timing *is* our deliverable, so this is our central
technical problem rather than a detail. Denver Water's raw-water group models about
four hours from the sensor above Strontia to the plant intake. Jake's models
predict best with upstream readings lagged by days, which he attributes to mixing
and deposition in the reservoir, and he asks that the exact number not be leaned on
(`guide.md` §1).

**Read.** These may not be in conflict: four hours is probably water transit, days
is probably the signal's transit through a mixing body. If that reading is right,
our system has to show both, and saying so clearly may be a real contribution.

**What would answer it.** Cross-correlate `data/SouthPlatteFlow.csv` against
`data/FoothillsInfluent.csv` at a range of lags and see which story the data tells.
We can start this without an SME. Then put the interpretation to Jake.

---

### Q4. What are the dates of the 2023 storm?

- **Status:** Open · **Uncertainty:** Med · **Value:** High

**Why it matters.** The SME's account of a hundred-year storm in the South Platte
watershed that nearly shut Foothills down is the best anchor we have: a named
event, a known bad outcome, and their own verdict that "this is something you could
look at ahead of time, it really shouldn't be happening." If we can reconstruct it
from upstream data, we have our demo and our validation case in one.

**The catch.** They said 2023, hedged with "I think". Our committed data starts
2022-04-01, so it may be in the window. It may also be the August 14–15 storm the
3D map already replays (`README.md`) — a different event, different year.

**What would answer it.** Exact dates from Cassidi, then pull the gage record and
see whether the signature is there. Also ask: "you knew it was coming but not the
scale" — what would have told you the scale?

---

### Q5. Replay, live, or forecast?

- **Status:** Open · **Uncertainty:** Med · **Value:** High

**Why it matters.** Asked for their biggest problem, the SME did not name a
prediction. They named visualization — a digital twin that models constituents,
runs against historical years, digests datasets they cannot digest alone, and lets
them "explain different conditions to those across the organization"
(`../../content/sme-qa-cleaned.md`). That is Scenario 3, and it is an *explanatory*
ask. Decision 0001 commits us to a retrospective analysis, which is compatible —
but whether the artifact they want is a replay of history, a live system state, or
a forward projection changes what we build first.

**What would answer it.** Ask which of the three earns its keep soonest. Their
"model against historical years" phrasing suggests replay and year-over-year
comparison outranks forecasting, which would be good news for our Phase 1.

---

### Q6. How much lead time changes a decision?

- **Status:** Open · **Uncertainty:** Med · **Value:** High

**Why it matters.** A tool with twelve hours of warning and one with four days are
different products, aimed at different people. It also sets the bar Q3's answer has
to clear: if the honest achievable lead time is four hours, a staffing product is
not viable and a dosing product might be.

**What would answer it.** Ask what can still be changed at 48 hours, at 24, at 6.
Chemical ordering, shift scheduling, and filter prep probably have different
answers, and the shortest useful one is our floor.

---

### Q7. What counts as an event?

- **Status:** Open · **Uncertainty:** Med · **Value:** High

**Why it matters.** Decision 0001 names this as the first real piece of work. We
cannot count events, characterize them, or check whether we have enough of them
(Q10) until "event" is a rule over the data rather than a word.

**What would answer it.** Ours to settle. Propose a threshold rule over
`data/SouthPlatteFlow.csv` — rate of rise, or departure from a seasonal normal —
count what it catches across the record, and show the list to an SME to see whether
they recognize the events they lived through. Their recognition is the test, not
our statistics.

---

### Q8. Which of the three audiences are we serving?

- **Status:** Open · **Uncertainty:** Low · **Value:** High

**Why it matters.** The SME named three, and they want different things: the
~50-person water quantity team (how much water, how to move it, meeting demand and
water rights), the water quality and watershed scientists (regulatory compliance
and environmental stewardship), and the treatment plants (acute — what is arriving
now, treat it efficiently, chemicals are "hundreds of millions of dollars
expensive"). Decision 0001 aims at the plant. Our volume framing, though, is
closest to what the quantity team already does all day — which is worth knowing
before we build them a second one.

**What would answer it.** Mostly ours to decide, and we should decide explicitly in
a decision record rather than by default. One SME question is worth asking: does
the quantity team already have arrival volume and timing solved for themselves?

---

### Q9. What does influent quality cost in chemicals?

- **Status:** Open · **Uncertainty:** High · **Value:** Med

**Why it matters.** The SME volunteered that treatment chemicals are "hundreds of
millions of dollars expensive". Even a rough relationship between influent TOC or
turbidity and cost turns anything we build from a picture into a dollar figure, and
a dollar figure is what moves an organization. It is a multiplier on our output
rather than a dependency, which is why it sits below the framing questions.

**What would answer it.** Ask for a ballpark: coagulant dose per unit of TOC, or
what an event like 2023 cost in chemicals and labour. Do not estimate this
ourselves — `AGENTS.md` forbids inventing numbers, and a wrong cost claim is worse
than none.

---

### Q10. Is four water years enough history?

- **Status:** Open · **Uncertainty:** Med · **Value:** Med

**Why it matters.** 2022-04-01 to 2026-08-19 is about four and a half water years.
If our event rule (Q7) finds six events, no claim about wet-versus-dry behaviour
survives contact with a statistician. Extending means API pulls, and pulled values
are provisional.

**What would answer it.** Run the event rule and count. This one is ours, and it is
cheap once Q7 is settled — but it cannot be settled before Q7.

---

### Q11. What are we missing between the readings?

- **Status:** Open · **Uncertainty:** High · **Value:** Med

**Why it matters.** This is the SME's own open question, handed back to us: "we
have certain instantaneous points of time. One of the questions we have right now
is what are we missing?" Everything they do is real-time or retrospective, seen
from the plant's perspective. Whether a daily series can even represent a storm
pulse that passes in hours bears directly on Q3 and Q7.

**What would answer it.** Compare the fifteen-minute USGS record against the daily
series over a known event and measure what daily averaging erases. That is a
concrete answer to a question they could not answer for themselves, which makes it
worth doing even though it is not on our critical path.

---

### Q12. Do water rights and instream obligations belong in the model?

- **Status:** Open · **Uncertainty:** High · **Value:** Low

**Why it matters.** The SME spent more time on this than on any technical
constraint: water rights as a legal and political obligation, downstream cities,
drought restrictions sitting awkwardly beside hydrant flushing, recreation and
fisheries wanting streamflow and temperatures that conflict with moving water to
meet demand. None of it is in our CSVs. It is real context and it shapes what an
honest system would show, but it does not block Phase 1.

**What would answer it.** Ask whether instream flow or temperature targets exist as
numbers we could draw as bands. If they do not, this stays narrative and we should
say so rather than implying constraints we cannot source.

---

### Q13. Is the Strontia intake multi-level?

- **Status:** Open · **Uncertainty:** Med · **Value:** Low

**Why it matters.** If operators select intake depth, then depth-resolved sonde
data is an operational lever and not just a description of the reservoir. Decision
0001 puts depth behaviour out of scope, so this is parked — but it would reopen
that boundary if the answer is yes.

**What would answer it.** One question to Jake.

---

## Resolved

Kept because the answers shape the questions above, and because knowing a thing is
settled is worth as much as knowing it is open.

| # | Question | Resolution | Source |
|---|---|---|---|
| R1 | What is Denver Water's biggest problem, in their words? | Visualization. A digital twin that models constituents, compares against historical years, integrates datasets they cannot digest alone, and lets them explain conditions across the organization. | `../../content/sme-qa-cleaned.md` |
| R2 | Who would use what we build? | Three groups: water quantity (~50 people), water quality and watershed science, and treatment plant operations. Each wants a different thing from the same system. Now Q8. | `../../content/sme-qa-cleaned.md` |
| R3 | What do they do today? | Real-time and retrospective only, viewed from the plant's perspective. No forward modelling of quality. No alerts generated from weather data. | `../../content/sme-qa-cleaned.md` |
| R4 | Do they use weather or radar in prediction? | Only big-picture, and only for water *quantity* — snow water equivalent and seasonal scale. Explicitly "not for acute things". | `../../content/sme-qa-cleaned.md` |
| R5 | How are SNOTEL stations chosen? | Purely by location. No groupings; stations are scattered and picked off geographic coordinates. | `../../content/sme-qa-cleaned.md` |
| R6 | Hoosier Pass or Buckskin Joe? | Both names appear because the shipped CSV matches Hoosier Pass (531) while the notebooks name Buckskin Joe (938). Cite the file, not the notebook prose. Michigan Creek was dropped for a known feed error. | `AGENTS.md`, `.claude/skills/domain-research/SKILL.md` |

# Open questions

- **Updated:** 2026-09-24
- **Working from:** [decision 0001](../decisions/0001-problem-statement-volume-and-timing-at-foothills.md)
  — volume and timing of water arriving at Foothills, retrospective first.

What team cendit does not know yet, ranked by how much the answer would change
what we build. Ranking rule and status values are in [`README.md`](README.md).

**Numbers are stable ids, not ranks.** Rows are in rank order; a question keeps
its number when it moves so that notes and PRs referring to "Q4" stay true.

**Sources.** The register is fed by [`../../content/`](../../content/) and by
team working notes. Coleman's Scenario 3 notes
([`coleman-scenario-3-events-and-questions.md`](coleman-scenario-3-events-and-questions.md))
are folded in as of 2026-09-24 and are where Q14–Q18 come from.

## The register

| # | Question | Unc. | Value | Answered by |
|---|---|---|---|---|
| [Q1](#q1-is-arrival-volume-really-the-staffing-driver) | Is arrival volume really the staffing driver, or is it chemistry at a given volume? | High | High | Cassidi |
| [Q2](#q2-does-a-foothills-intake-volume-series-exist) | Does a Foothills intake or treated-volume series exist, and can we have it? | High | High | Jake |
| [Q3](#q3-four-hours-or-several-days) | Four hours or several days? The travel-time contradiction. | High | High | Data first, then Jake |
| [Q14](#q14-do-reservoir-releases-decide-what-arrives) | Do Cheesman and Strontia releases decide what arrives, making our target partly an operator's choice? | High | High | Jake or Cassidi |
| [Q4](#q4-what-are-the-dates-of-the-2023-storm) | What are the dates of the 2023 South Platte storm? Candidate found: 2023-08-01. | Low | High | Cassidi, to confirm |
| [Q5](#q5-replay-live-or-forecast) | Is the digital twin they want a replay, a live view, or a forecast? | Med | High | Cassidi |
| [Q6](#q6-how-much-lead-time-changes-a-decision) | How much lead time actually changes a decision? | Med | High | Cassidi, plant ops |
| [Q7](#q7-what-counts-as-an-event) | What counts as an event, operationally? | Med | High | Us, then validate |
| [Q8](#q8-which-of-the-three-audiences-are-we-serving) | Which of the three audiences are we serving? | Low | High | Team, then Cassidi |
| [Q9](#q9-what-does-influent-quality-cost-in-chemicals) | What does influent quality cost in chemicals, per unit? | High | Med | Cassidi |
| [Q15](#q15-does-higher-flow-mean-more-toc-or-less) | Does higher flow mean more TOC or less? | Med | Med | Data first, then Jake |
| [Q10](#q10-is-four-water-years-enough-history) | Is 2022-04 onward enough history to hold enough events? | Med | Med | Data |
| [Q11](#q11-what-are-we-missing-between-the-readings) | What are we missing between the readings, and is interpolating defensible? | High | Med | Data, then Jake |
| [Q16](#q16-what-counts-as-a-dry-year) | What counts as a dry year, by Denver Water's own rule? | Med | Med | Cassidi |
| [Q12](#q12-do-water-rights-and-instream-obligations-belong-in-the-model) | Do water rights and instream obligations belong in the model? | High | Low | Cassidi |
| [Q13](#q13-is-an-intake-multi-level) | Is either intake multi-level, and does an operator choose depth? | Med | Low | Jake |
| [Q17](#q17-can-one-snow-pillow-stand-for-the-basin) | Can one snow pillow stand for the basin? | Med | Low | Data, then Jake |
| [Q18](#q18-when-does-strontia-turn-over) | When does Strontia turn over, and does it reach the plant? | Med | Low | Jake |

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

**The data now cuts against us harder.** On the candidate date for that storm
(2023-08-01, see Q4) the volume signal is unremarkable and the quality signal is
the largest in the record:

| | 2023-08-01 | For comparison |
|---|---|---|
| `Turbidity_Max` | **477** | highest in the whole record; next is 329 on 2026-08-15 |
| `Turbidity_Median` | **47.3** | record median-of-daily-medians 3.3; p99 29.8 |
| `Flow_CFS` | **647** | 2023 snowmelt peak 1090; record peak 1390 on 2024-06-21 |

A volume threshold would not have fired on the worst day Foothills has seen. A
turbidity threshold would have fired unmistakably. The caveat is that the June
peaks are snowmelt — a gradual, expected ramp — so this contrasts an anticipated
rise against an acute shock rather than two like events.

Note also the TOC response at the plant: `data/FoothillsInfluent.csv` is flat on
8/1 (2.3) and climbs to 3.3 by 8/5, which is at least consistent with a multi-day
arrival lag and is a free test case for Q3.

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

Coleman's notes sharpen the *why*: the reservoir is not a pipe. Q14 is the other
half of the same problem — the reservoir both delays the signal and is operated.

---

### Q14. Do reservoir releases decide what arrives?

- **Status:** Open · **Uncertainty:** High · **Value:** High
- **From:** Coleman's Scenario 3 notes, §3 and the opening questions.

**Why it matters.** Q2 leaves us predicting Foothills arrival from a gage *above*
Strontia. Q3 asks how long the signal takes to cross the reservoir. This asks
whether it crosses intact at all. Coleman's event table names **Reservoir Release
Changed** as a *decision* rather than a natural event: Cheesman sits between the
snow and Strontia, and if operators blend, hold, or release to a schedule, then
what reaches the plant is partly an operational choice that appears nowhere in our
inputs. His related questions — what the release controls actually are, and what
minimum levels must be held for dam safety and supply — are the same question
asked from the operator's side.

**What we have.** `water-system-3d/storage-history.json` carries daily storage for
four reservoirs — `DILRESCO`, `CHERESCO`, `CHARESCO`, `STRRESCO` — as one
366-slot array per water year, so dates need deriving from day-of-water-year
before it lines up with the CSVs. Cheesman and Dillon reach back to the late
1980s; **Strontia only starts in 2021**, which is thinner than the rest and worth
knowing before leaning on it. Storage change is releases and inflows netted
together, so the series bounds the question without answering it: a day where
storage moves against the upstream gage is a day an operator intervened.
Coleman marks the release event **(GK)** and "not in the repo", which matches —
nothing here records a release directly. Note too that Grant is where Roberts
Tunnel water enters the North Fork, so some of what passes the sentinel gage was
never South Platte snow.

**What would answer it.** Two parts. Ask Jake or Cassidi how releases from
Cheesman and Strontia are set, on what horizon, and whether that schedule is
recordable as a series we could have. Meanwhile, difference the storage series
against gage flow across a known event (the 2023-08-01 candidate in Q4) and see
whether the reservoir visibly absorbed the pulse. If releases dominate, our
deliverable has an input we do not have, and decision 0001 needs revisiting.

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

**We pulled the gage record, and there is a signature.** 2023-08-01 carries the
highest `Turbidity_Max` in the entire committed record, 477 in
`data/USGS_South_Platte.csv`, against a record median-of-daily-medians of 3.3. The
daily median that day is 47.3, above the record p99 of 29.8. `Flow_CFS` rises
515 → 647 over 7/31–8/1 in `data/SouthPlatteFlow.csv` and is back to 420 by 8/3.
It is a sharp, short, high-turbidity event in the right year — consistent with the
account, though we matched it ourselves and they never gave a date.

August turbidity spikes recur: 2026-08-15 (329), 2024-08-06 (321), 2022-08-15
(285). So the map's August 14–15 replay is a *different* event of the same kind,
not this one.

**What still would answer it.** Confirm the date with Cassidi — this stays a
candidate until they say so, and we should not present it as the event. Then ask
the follow-up their own phrasing invites: "you knew it was coming but not the
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

### Q15. Does higher flow mean more TOC or less?

- **Status:** Open · **Uncertainty:** Med · **Value:** Med
- **From:** Coleman's Scenario 3 notes, opening questions.

**Why it matters.** Decision 0001 puts us on volume and timing, and Q1 asks
whether volume is even the right handle. This is the hinge between them: if flow
and TOC move together, a volume prediction is a quality prediction for free and
our framing survives Q1 intact. If they move apart, or the relationship flips by
season, then volume and quality are two products and we have to choose.

**What we have.** The materials point both ways and Coleman is right that it is
not obvious. Two mechanisms in his own event tables pull in opposite directions:
**First Flush** carries a season's dead plant matter into a rising river, which is
more TOC on more flow; **River Returned to Baseflow** describes groundwater with
more dissolved minerals, which is the alkalinity story rather than the TOC one.
Dilution argues the other way — the same load in more water is a lower
concentration. `guide.md` §6 has Jake's models predicting TOC from upstream
readings at a 2-day lag, which implies a usable relationship exists without
telling us its sign.

**What would answer it.** Ours, and cheap. Correlate `Flow_CFS` from
`data/SouthPlatteFlow.csv` against TOC in `data/FoothillsInfluent.csv` across the
lags from Q3, then split by season — snowmelt rise, monsoon storm, and baseflow
are three different regimes and a single correlation over all of them will average
them into nothing. Put the seasonal split to Jake once we have it; a sign that
flips is more interesting to him than a coefficient.

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

### Q16. What counts as a dry year?

- **Status:** Open · **Uncertainty:** Med · **Value:** Med
- **From:** Coleman's Scenario 3 notes, question 1.

**Why it matters.** Coleman's point is that the rule *is* domain knowledge, not a
preliminary to it: however Denver Water splits dry from normal from wet is a piece
of their language we should be speaking. It bites on two things we have committed
to. Q5 says the artifact they want may be replay and year-over-year comparison —
which needs year labels to compare *by*. And Q10 asks whether four and a half
water years hold enough events; if they hold only one dry year, that is a sharper
statement of the same limit than any event count.

**What we have.** Nothing yet. Coleman names the candidates — April 1 SWE, peak
SWE, total runoff volume — and the register should not pick one for them. His
event table marks **Water Year Classified** as the one event in the snowpack
sequence that nothing in this repo does. R4 tells us the quantity side of the
house already thinks at SWE and seasonal scale, so the rule almost certainly
exists; we just do not have it. `data/HoosierPass.csv` and
`water-system-3d/snotel-history.json` are where we would apply whatever they say.

**What would answer it.** One question to Cassidi, and it is a good one to lead
with because it costs them nothing and tells us how they carve up the record. Ask
for the rule and the threshold, then ask which of 2022 through 2026 each was.

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

### Q13. Is an intake multi-level?

- **Status:** Open · **Uncertainty:** Med · **Value:** Low
- **Widened:** 2026-09-24, from Coleman's question 6.

**Why it matters.** If operators select intake depth, then depth-resolved sonde
data is an operational lever and not just a description of the reservoir. Decision
0001 puts depth behaviour out of scope, so this is parked — but it would reopen
that boundary if the answer is yes.

**Now covers both intakes.** Coleman asks the same question about the Foothills
end: does the plant draw from a fixed depth or choose one? That decides which
layer of the sonde record actually reaches treatment, which is the part that bears
on our deliverable. He marks "many reservoirs have intakes at several levels" as
general knowledge rather than something the materials say, and it stays that way
until Jake confirms it.

**What would answer it.** One question to Jake, asked about both ends: the
Strontia withdrawal to Conduit 26, and the Foothills intake itself.

---

### Q17. Can one snow pillow stand for the basin?

- **Status:** Open · **Uncertainty:** Med · **Value:** Low
- **From:** Coleman's Scenario 3 notes, question 2.

**Why it matters.** Coleman puts it plainly: one pillow is a proxy for thousands
of square miles. Jake's models take a single station as the snowpack input, so if
that station is unrepresentative in a given year the input is wrong in a way no
amount of modelling downstream will recover. It ranks low only because decision
0001 is event-scale and retrospective, where snowpack is background rather than
driver — it would rise immediately if we took on seasonal supply.

**What we have.** R6 settles the naming half of his question: the shipped CSV
matches Hoosier Pass (531) while Jake's notebooks name Buckskin Joe (938), and we
cite the file. The representativeness half is untouched. R5 is the relevant SME
answer and it is not reassuring — stations are picked purely by geographic
coordinate, with no groupings. `water-system-3d/snotel-history.json` holds 11
stations, most from 1980, which is enough to check the question ourselves.

**What would answer it.** Ours first. Correlate the 11 stations against each other
across the shared record and see how tightly they move; if Hoosier Pass tracks the
ensemble, the proxy is defensible and we can say so with a number. Where it
diverges, and in which years, is the thing to put to Jake — along with whether a
basin-weighted index would be more honest than any single station.

---

### Q18. When does Strontia turn over?

- **Status:** Open · **Uncertainty:** Med · **Value:** Low
- **From:** Coleman's Scenario 3 notes, question 4.

**Why it matters.** Turnover changes water quality at an intake with no storm at
all — the whole column mixes and bottom water comes up. If it lands inside an
event we are trying to explain, an unexplained quality shift could be mistaken for
a storm signal. That is a real way to be wrong, which is why it is here rather
than dropped; it ranks low because decision 0001 excludes depth behaviour and
because we may simply not be able to see it.

**The catch, which is Coleman's.** The sonde record runs 2026-04-07 to 08-19
(`data/Strontia 0407_0819.xlsx`). Turnover is usually a fall event, so the data
most likely ends before it happens. His event table marks **Reservoir Turned Over**
as **(GK)** and "probably not captured", and that looks right — we should confirm
it rather than hunting for a signal that cannot be there.

**What would answer it.** Check the top-to-bottom temperature spread over the last
weeks of the cast record: still stratified on 08-19 settles that we did not catch
it. Then ask Jake when Strontia typically turns, whether the plant sees it at the
Foothills influent, and whether sonde data past August exists.

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

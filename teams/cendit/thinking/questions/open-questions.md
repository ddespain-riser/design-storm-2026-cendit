# Open questions

- **Updated:** 2026-09-25
- **Working from:** [decision 0001](../decisions/0001-problem-statement-volume-and-timing-at-foothills.md)
  — volume and timing of water arriving at Foothills, retrospective first.
  **0001 is now under real pressure** (Q1, Q2); the candidate replacements are in
  [`../problem-options-from-jake.md`](../problem-options-from-jake.md).

What team cendit does not know yet, ranked by how much the answer would change
what we build. Ranking rule and status values are in [`README.md`](README.md).

**Numbers are stable ids, not ranks.** Rows are in rank order; a question keeps
its number when it moves so that notes and PRs referring to "Q4" stay true.

**Sources.** The register is fed by [`../../content/`](../../content/) and by
team working notes. Coleman's Scenario 3 notes
([`coleman-scenario-3-events-and-questions.md`](coleman-scenario-3-events-and-questions.md))
are folded in as of 2026-09-24 and are where Q14–Q18 come from. The 2026-09-25
Jake interview ([`../../content/jake-interview-transcript.md`](../../content/jake-interview-transcript.md))
resolved R7–R10 and raised Q19–Q22.

**That transcript is machine-generated and heavily mangled** — it renders
Strontia as "Estrella"/"Resident Strange" and Foothills as "football". Nothing
below rests on a proper noun or a figure that only the raw transcript supports,
and everything drawn from it is marked as needing Jake's confirmation.

## The register

| # | Question | Unc. | Value | Answered by |
|---|---|---|---|---|
| [Q1](#q1-is-arrival-volume-really-the-driver) | Is arrival volume really the driver, or is it chemistry at a given volume? | High | High | Cassidi |
| [Q19](#q19-where-does-the-next-sensor-earn-the-most) | Where in the collection system does the next sensor earn the most? | High | High | Ours, then Jake |
| [Q3](#q3-four-hours-or-several-days) | Four hours or several days? The travel-time contradiction. | High | High | Data first, then Jake |
| [Q14](#q14-do-reservoir-releases-decide-what-arrives) | Do Cheesman and Strontia releases decide what arrives, making our target partly an operator's choice? | High | High | Jake or Cassidi |
| [Q22](#q22-what-would-make-anyone-act-on-a-forecast) | What would make plant staff actually act on a forecast? | High | High | Jake, plant ops |
| [Q2](#q2-does-a-foothills-intake-volume-series-exist) | Does a Foothills intake or treated-volume series exist, and can we have it? | High | High | Jake |
| [Q20](#q20-what-are-the-strontia-gate-heights) | What are the four Strontia gate heights, and may we model them? | High | Med | Jake |
| [Q5](#q5-replay-live-or-forecast) | Is the artifact they want a replay, a live view, or a forecast? Cassidi and Jake answered differently. | Med | High | Cassidi and Jake, together |
| [Q15](#q15-does-higher-flow-mean-more-toc-or-less) | Does higher flow mean more TOC or less? Jake says direct correlation; his own counterexample says otherwise. | Med | High | Data first, then Jake |
| [Q11](#q11-what-are-we-missing-between-the-readings) | What are we missing between the readings, and is interpolating defensible? | High | Med | Data, then Jake |
| [Q4](#q4-what-are-the-dates-of-the-2023-storm) | What are the dates of the 2023 South Platte storm? Candidate found: 2023-08-01. | Med | High | Cassidi, to confirm |
| [Q7](#q7-what-counts-as-an-event) | What counts as an event, operationally — and is a burn-scar monsoon slug a second class? | Med | High | Us, then validate |
| [Q21](#q21-what-continuous-data-exists-that-is-not-in-the-repo) | What continuous data exists that is not in the repo — the fDOM test sensor, the Strontia profiler record? | Med | Med | Jake |
| [Q9](#q9-what-does-influent-quality-cost-in-chemicals) | What does influent quality cost in chemicals, per unit? | High | Med | Cassidi |
| [Q16](#q16-what-counts-as-a-dry-year) | What counts as a dry year, by Denver Water's own rule? | Med | Med | Cassidi |
| [Q10](#q10-is-four-water-years-enough-history) | Is 2022-04 onward enough history to hold enough events? | Med | Med | Data |
| [Q8](#q8-which-of-the-three-audiences-are-we-serving) | Which of the three audiences are we serving? | Low | High | Team, then Cassidi |

Three low-value questions are [parked](#parked) rather than competing for SME
time: Q12, Q17, Q18.

---

### Q1. Is arrival volume really the driver?

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

**The data cuts against us harder.** On the candidate date for that storm
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

**And the Jake interview cuts against us a third time.** Asked what he has locked
on to, Jake described knowing what is coming toward the plant so operators can
change *treatment strategy* — coagulant dose, and pre-oxidation when organics are
high. Every lever he named acts on chemistry. He named no volume decision at all,
and the mundane event he steered us toward (Q7) is a turbidity event. Three
independent lines now point the same way.

**What would answer it.** Ask directly: when you staff up for an incoming event,
what number are you reacting to? Then ask what a high-flow, clean-water event does
to the plant — if the answer is "not much", volume alone is not the driver. Our
own read is that this is close to settled against 0001; confirming it with Cassidi
is what turns it into a superseding decision record rather than our opinion.

---

### Q19. Where does the next sensor earn the most?

- **Status:** Open · **Uncertainty:** High · **Value:** High
- **From:** the 2026-09-25 Jake interview.

**Why it matters.** Jake raised this himself, said he did not know the answer, and
called it an interesting problem space. That combination — a real decision, an SME
who wants it, and no one currently owning it — is rare, and it is the strongest
candidate in [`../problem-options-from-jake.md`](../problem-options-from-jake.md).
It also needs nothing Denver Water has not already given us, and it does not
depend on winning the adoption argument in Q22.

**What we have.** His own description of the gap: a large collection system that
is mostly uninstrumented, one river sensor reporting at fifteen minutes, much of
the rest at roughly four-hour resolution, and "a huge collection system that we're
not getting" (raw transcript; confirm the resolutions with him). He wondered aloud
whether a river site or a reservoir site would pay better and did not resolve it.
The committed CSVs plus `water-system-3d/` are enough to pose it as a
value-of-information question: which added station most reduces uncertainty in
what arrives at Foothills.

**What would answer it.** Ours first, and it needs Q11 done — quantify what the
existing network already tells us about plant influent, then test which candidate
location adds the most. Then two questions to Jake: does a siting study already
have an owner or a budget cycle, and what would actually constrain where a sensor
can go (power, access, permission).

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

**The interview adds a third figure.** Describing the flash-melt event, Jake put
roughly **four days** between what they saw in the data and the plant needing to
act, and said the window "works out" against transport time. That is closer to the
lagged-model story than to four hours — but it is an operational recollection, not
a measurement, and the transcript is raw. Ask whether four days is something he
measured or something he remembers.

**What would answer it.** Cross-correlate `data/SouthPlatteFlow.csv` against
`data/FoothillsInfluent.csv` at a range of lags and see which story the data tells.
We can start this without an SME. Then put the interpretation, and the four-day
figure, to Jake.

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
inputs.

**Jake confirmed the operational half, and widened it.** He described a broad
collection area, water of different quality from different places, and — within
limits — the ability to choose where to pull from, as a live lever on plant
influent quality, chemical cost, and regulatory margin. He called it something the
team has been discussing a lot recently. So source selection is not hypothetical:
it is an active operational choice upstream of everything we model, and it is in
none of our inputs. Q20 is its sharpest instance.

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

**What would answer it.** Two parts. Ask Jake or Cassidi how releases and source
selection are set, on what horizon, and whether that schedule is recordable as a
series we could have. Meanwhile, difference the storage series against gage flow
across a known event (the 2023-08-01 candidate in Q4) and see whether the reservoir
visibly absorbed the pulse. If releases dominate, our deliverable has an input we
do not have, and decision 0001 needs revisiting.

---

### Q22. What would make anyone act on a forecast?

- **Status:** Open · **Uncertainty:** High · **Value:** High
- **From:** the 2026-09-25 Jake interview.

**Why it matters.** Jake volunteered that roughly half the problem is not the
model. Plant staff have been running these processes for decades and consider
current practice good enough; the hard part is getting people willing to respond
in real time. If that is true, a more accurate forecast is not the binding
constraint, and a deliverable that ignores it solves the easy half. It also
changes what we build: a system that explains *why* it is warning, in terms an
operator already trusts, is a different artifact from one that emits a number.

**What we have.** Only his remark, from a raw transcript, and R3 — they work
real-time and retrospectively today, with no forward modelling of quality. We have
nothing about who decides, what a shift actually changes, or what a false alarm
costs them.

**What would answer it.** Ask Jake who would have to be convinced and what has
failed before. Better, ask for fifteen minutes with someone who runs a shift:
what would you need to see before you changed a coagulant dose on a prediction,
and what happens to you if the prediction is wrong? The false-alarm cost is the
number that sets our precision target, and we have no basis for it.

---

### Q2. Does a Foothills intake volume series exist?

- **Status:** Open · **Uncertainty:** High · **Value:** High

**Why it matters.** We have committed to predicting arrival volume at Foothills and
we do not have arrival volume at Foothills. `data/FoothillsInfluent.csv` carries
TOC and alkalinity only. The nearest signal is `Flow_CFS` at the South Platte gage
*above* Strontia, with the reservoir's storage and releases sitting in between. No
target variable, no Phase 1.

**The interview made the gap worse, not better.** R7 records what Jake said the
plant actually measures, and it is grab samples: TOC and alkalinity come from
operators drawing at a sample faucet roughly twice a day, not from an instrument.
So even the chemistry target is twice-daily and irregular, and he mentioned no
intake-flow or treated-volume series at all — though nobody asked him directly,
so this stays open rather than resolved.

**What would answer it.** Ask Jake the direct question we did not ask: is plant
intake flow or treated volume recorded, at what interval, and is it releasable? If
not, we state plainly that gage flow is a proxy, and Q3 becomes the thing that
determines whether the proxy is any good.

---

### Q20. What are the Strontia gate heights?

- **Status:** Open · **Uncertainty:** High · **Value:** Med
- **From:** the 2026-09-25 Jake interview. Absorbs the Strontia half of Q13.

**Why it matters.** Jake described **four gates at different heights** in Strontia
Springs Reservoir, and said a goal of the profiling sonde that travels up and down
is to work out in real time whether pulling from a different level would improve
water quality — using the reservoir, in effect, as a settling pond instead of
coagulant. That is selective withdrawal as an operational lever, and it is the
most concrete version of Q14. Decision 0001 puts depth behaviour out of scope; if
we take this on, that boundary moves.

**What we have.** His account, and the depth-resolved sonde record
(`data/Strontia 0407_0819.xlsx`). We do **not** have the gate heights — he said he
does not have them, was unsure whether they are public, and suggested modelling
them for the sake of the exercise. That suggestion is the trap `AGENTS.md` warns
about: modelled heights are assumptions, and any recommendation built on them has
to say so in the same breath.

**The Foothills half of old Q13 is still open.** Does the plant draw from a fixed
depth or choose one? That decides which layer of the sonde record actually reaches
treatment.

**What would answer it.** Ask Jake for the four gate elevations, or for permission
and a plausible range to assume. Ask the same question about the Foothills intake.
Meanwhile the analysis is runnable on assumed depths as a sensitivity study —
which layer of the column would have been better to draw from, on each day of the
sonde record — provided the assumption is stated everywhere the result is.

---

### Q5. Replay, live, or forecast?

- **Status:** Open · **Uncertainty:** Med · **Value:** High

**Why it matters.** Asked for their biggest problem, Cassidi did not name a
prediction. She named visualization — a digital twin that models constituents,
runs against historical years, digests datasets they cannot digest alone, and lets
them "explain different conditions to those across the organization"
(`../../content/sme-qa-cleaned.md`). That is Scenario 3, and it is an *explanatory*
ask.

**Jake answered the same question differently, and that gap is the finding.** His
framing was forward-looking throughout: know what is coming toward the plant, in
time to change treatment. Same organization, two SMEs, two different artifacts —
one explains the past to the organization, one warns the plant about next week.
Building for one is not building for the other, and R2's three audiences are
probably why.

**What would answer it.** Put it to them together rather than separately, and say
plainly that we heard two answers. Which earns its keep soonest? If the honest
answer is both, Q8 stops being a low-uncertainty question and becomes the decision
we have to make first.

---

### Q15. Does higher flow mean more TOC or less?

- **Status:** Open · **Uncertainty:** Med · **Value:** High
- **From:** Coleman's Scenario 3 notes, opening questions. Value raised 2026-09-25.

**Why it matters.** Decision 0001 puts us on volume and timing, and Q1 asks
whether volume is even the right handle. This is the hinge between them: if flow
and TOC move together, a volume prediction is a quality prediction for free and
our framing survives Q1 intact. If they move apart, or the relationship flips by
season, then volume and quality are two products and we have to choose.

**Jake asserted the relationship, then gave a counterexample to it.** He said flow
is "sort of a direct correlation with TOC" — which, if it holds, is the single
most useful sentence in the interview, because flow is the thing we can see
upstream and TOC is the thing that costs money. But minutes later, describing
monsoon slugs (Q7), he said TOC at the plant "didn't really go up a whole lot"
while turbidity did. Both can be true if the relationship is regime-dependent:
snowmelt flow carries organics, a convective rain cell carries sediment. That is
precisely the seasonal split Coleman anticipated, and it means neither a single
correlation nor Jake's one-liner is the answer.

**What we have, besides.** Two mechanisms in Coleman's event tables pull opposite
ways: **First Flush** carries a season's dead plant matter into a rising river;
**River Returned to Baseflow** describes groundwater with more dissolved minerals,
which is the alkalinity story rather than the TOC one. Dilution argues the other
way. `guide.md` §6 has Jake's models predicting TOC from upstream readings at a
2-day lag, which implies a usable relationship exists without telling us its sign.

**What would answer it.** Ours, and cheap. Correlate `Flow_CFS` from
`data/SouthPlatteFlow.csv` against TOC in `data/FoothillsInfluent.csv` across the
lags from Q3, then split by regime — snowmelt rise, monsoon storm, and baseflow
are three different animals and a single correlation over all of them averages
them into nothing. Remember TOC is a twice-daily grab sample (R7), so the series
is sparser than it looks. Show Jake where his own two statements diverge; a sign
that flips is more interesting to him than a coefficient.

---

### Q11. What are we missing between the readings?

- **Status:** Open · **Uncertainty:** High · **Value:** Med

**Why it matters.** This is the SMEs' own open question, handed back to us: "we
have certain instantaneous points of time. One of the questions we have right now
is what are we missing?" (`../../content/sme-qa-cleaned.md`). Whether a daily
series can even represent a storm pulse that passes in hours bears directly on Q3
and Q7 — and it is now the groundwork for Q19, because you cannot say where a
sensor should go without saying what the current network misses.

**Jake sharpened it into two gaps, not one.** A *temporal* gap — one river sensor
at fifteen minutes, much of the rest around four hours (confirm) — and a *spatial*
gap he considers larger, most of the collection system carrying no instrument at
all. R7 adds a third: the chemistry that matters most, TOC and alkalinity, is a
twice-daily grab sample, so the gap in the target variable is worse than the gap
in the inputs.

**What would answer it.** Compare the fifteen-minute USGS record against the daily
series over a known event and measure what daily averaging erases; then do the
same against the twice-daily influent sampling. That is a concrete answer to a
question they could not answer for themselves, and it feeds Q19 directly.

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
not this one. Jake's account of monsoon slugs (Q7) suggests that whole August
family may be one mechanism, which would make the recurrence a feature rather
than a coincidence.

**What still would answer it.** Confirm the date with Cassidi — this stays a
candidate until they say so, and we should not present it as the event. Then ask
the follow-up their own phrasing invites: "you knew it was coming but not the
scale" — what would have told you the scale?

---

### Q7. What counts as an event?

- **Status:** Open · **Uncertainty:** Med · **Value:** High
- **Widened:** 2026-09-25, to cover the mundane event class.

**Why it matters.** Decision 0001 names this as the first real piece of work. We
cannot count events, characterize them, or check whether we have enough of them
(Q10) until "event" is a rule over the data rather than a word.

**Jake gave us a second class, deliberately.** Asked for something less dramatic
than the near-shutdown, he described monsoon season: localized convective rain
cells rather than basin-wide melt, producing short turbidity slugs where TOC at
the plant barely moves. He thinks an example is already visible in the 3D map. He
then named the aggravating condition unprompted — **burn scars**, where lost
interception puts the hillside into the river on rain that a healthy catchment
would have absorbed.

So "event" is at least two rules, not one: a broad melt/flow event and a sharp,
local, sediment-dominated one. A single threshold will either miss the second or
drown in it. Burn-scar extent is not in our data, and whether Denver Water holds a
layer for it is worth one question rather than its own register entry.

**What would answer it.** Ours to settle. Propose two threshold rules — rate of
rise on flow, and a turbidity departure from seasonal normal — count what each
catches across the record, and show both lists to an SME to see whether they
recognize the events they lived through. Their recognition is the test, not our
statistics. Ask alongside: do you hold a burn-scar layer, and which tributaries
does it cover?

---

### Q21. What continuous data exists that is not in the repo?

- **Status:** Open · **Uncertainty:** Med · **Value:** Med
- **From:** the 2026-09-25 Jake interview.

**Why it matters.** Two datasets came up that we do not have, and both would
change what is buildable rather than merely informing it.

**The fDOM sensor.** Jake described a new instrument being tested, attached to the
existing river sonde, measuring fluorescent dissolved organic matter — an optical,
real-time proxy for organics. If it works, it is a continuous stand-in for the
twice-daily TOC grab sample (R7), which is the missing target variable in half
this register. Even a short test record would tell us whether the proxy holds.

**The Strontia profiler.** Installed about four or five months before the
interview, sampling on the order of every metre, 5–6 analytes. He said plainly
they are still working out how to use it and that even a summary of what it
contains would be useful. We hold `data/Strontia 0407_0819.xlsx`; whether that is
the whole record, and whether it continues past August, is unknown (it also bears
on Q18).

**What would answer it.** Ask Jake for both: the fDOM test data, even partial and
uncalibrated, and confirmation of what the shipped Strontia file covers. The
profiler summary is something we could hand back within days regardless of which
problem we pick, which makes it worth asking for early.

---

### Q9. What does influent quality cost in chemicals?

- **Status:** Open · **Uncertainty:** High · **Value:** Med

**Why it matters.** The SME volunteered that treatment chemicals are "hundreds of
millions of dollars expensive". Even a rough relationship between influent TOC or
turbidity and cost turns anything we build from a picture into a dollar figure, and
a dollar figure is what moves an organization. It is a multiplier on our output
rather than a dependency, which is why it sits below the framing questions.

**Jake named the levers, but not their prices.** Coagulant dose at the first
sedimentation stage, and pre-oxidation with chlorine or ozone when organics are
high. He put the cost of a bad event as "more time, more money" without a figure.
Knowing the levers narrows the question usefully: we need the cost of a dose
increment and of a pre-oxidation decision, not a whole-plant budget.

**What would answer it.** Ask for a ballpark: coagulant dose per unit of TOC, what
switching pre-oxidation on costs per day, or what an event like 2023 cost in
chemicals and labour. Do not estimate this ourselves — `AGENTS.md` forbids
inventing numbers, and a wrong cost claim is worse than none.

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

### Q10. Is four water years enough history?

- **Status:** Open · **Uncertainty:** Med · **Value:** Med

**Why it matters.** 2022-04-01 to 2026-08-19 is about four and a half water years.
If our event rule (Q7) finds six events, no claim about wet-versus-dry behaviour
survives contact with a statistician. Extending means API pulls, and pulled values
are provisional.

**What would answer it.** Run the event rule and count — both rules now, since Q7
splits into two classes and the mundane one is likely far more frequent, which
would be good news for sample size. This one is ours, and it is cheap once Q7 is
settled, but it cannot be settled before Q7.

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

**Q5 makes this less optional than it was.** Cassidi and Jake asked for different
artifacts, and the likeliest explanation is that they are speaking for different
audiences. Choosing the audience now chooses the artifact, and doing it by default
means letting whichever SME we spoke to last decide for us.

**What would answer it.** Mostly ours to decide, and we should decide explicitly in
a decision record rather than by default. One SME question is worth asking: does
the quantity team already have arrival volume and timing solved for themselves?

---

## Parked

Real questions, low enough value that they should not consume SME time while the
register above is unanswered. Unparked if the problem statement moves toward them.

| # | Question | Why parked |
|---|---|---|
| Q12 | Do water rights and instream obligations belong in the model? | High uncertainty, but it blocks nothing in Phase 1 and none of the candidate problem statements need it. Stays narrative unless instream targets exist as numbers we could draw as bands. |
| Q17 | Can one snow pillow stand for the basin? | Answerable by us without an SME: correlate the 11 stations in `water-system-3d/snotel-history.json` against each other. Rises immediately if we take on seasonal supply. R6 settles the naming half. |
| Q18 | When does Strontia turn over, and does the plant see it? | The sonde record (`data/Strontia 0407_0819.xlsx`) runs to 08-19 and turnover is usually a fall event, so the data most likely ends before it happens. Check the top-to-bottom temperature spread at the end of the cast record to confirm we did not catch it; folded into Q21's ask about later data. |

---

## Resolved

Kept because the answers shape the questions above, and because knowing a thing is
settled is worth as much as knowing it is open.

| # | Question | Resolution | Source |
|---|---|---|---|
| R1 | What is Denver Water's biggest problem, in their words? | Visualization. A digital twin that models constituents, compares against historical years, integrates datasets they cannot digest alone, and lets them explain conditions across the organization. **Jake answered the same question differently** — see Q5. | `../../content/sme-qa-cleaned.md` |
| R2 | Who would use what we build? | Three groups: water quantity (~50 people), water quality and watershed science, and treatment plant operations. Each wants a different thing from the same system. Now Q8. | `../../content/sme-qa-cleaned.md` |
| R3 | What do they do today? | Real-time and retrospective only, viewed from the plant's perspective. No forward modelling of quality. No alerts generated from weather data. | `../../content/sme-qa-cleaned.md` |
| R4 | Do they use weather or radar in prediction? | Only big-picture, and only for water *quantity* — snow water equivalent and seasonal scale. Explicitly "not for acute things". | `../../content/sme-qa-cleaned.md` |
| R5 | How are SNOTEL stations chosen? | Purely by location. No groupings; stations are scattered and picked off geographic coordinates. | `../../content/sme-qa-cleaned.md` |
| R6 | Hoosier Pass or Buckskin Joe? | Both names appear because the shipped CSV matches Hoosier Pass (531) while the notebooks name Buckskin Joe (938). Cite the file, not the notebook prose. Michigan Creek was dropped for a known feed error. | `AGENTS.md`, `.claude/skills/domain-research/SKILL.md` |
| R7 | Are TOC and alkalinity sensor readings? | **No — they are lab measurements.** At the plant, operators draw from a sample faucet roughly twice a day. Upstream it is a monthly-ish grab sample collected in person, and that monthly lab data is what is in the shipped dataset. Real-time in-river organics instruments exist and are expensive; they do not have them. Confirm the twice-daily figure with Jake. | `../../content/jake-interview-transcript.md` |
| R8 | What *is* measured continuously? | Turbidity and conductivity. Turbidity is their working proxy for TOC; conductivity for alkalinity. An fDOM sensor is in testing as a real-time organics proxy — see Q21. | `../../content/jake-interview-transcript.md` |
| R9 | Is either intake multi-level? (old Q13, Strontia half) | **Yes at Strontia** — four gates at different heights, and a profiling sonde installed to help decide in real time which to draw from. Heights unknown and possibly not public; the Foothills half is still open, in Q20. | `../../content/jake-interview-transcript.md` |
| R10 | How much lead time would change a decision? (old Q6) | Roughly **four days** in the flash-melt case, which Jake said matches transport time. What it buys: more time, more money, and different treatment strategies — coagulant dose and pre-oxidation. Treat as an operational recollection, not a measurement; whether it was measured is a follow-up in Q3, and whether anyone would act on it is Q22. | `../../content/jake-interview-transcript.md` |

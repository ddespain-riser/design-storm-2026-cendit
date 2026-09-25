# Open questions

- **Updated:** 2026-09-25 (afternoon pass)
- **Working from:** [decision 0001](../decisions/0001-problem-statement-strontia-withdrawal-depth.md)
  — which depth to withdraw from at Strontia Springs to send the cleanest water to
  Foothills — and [decision 0002](../decisions/0002-options-for-depth-decision-support.md),
  which ranks what we build. The whole list below has been **re-ranked against 0002**,
  which is the pass the previous version said it needed.

What team cendit does not know yet, ranked by how much the answer would change
what we build. Ranking rule and status values are in [`README.md`](README.md).

**Numbers are stable ids, not ranks.** Rows are in rank order; a question keeps
its number when it moves so that notes and PRs referring to "Q4" stay true.

**Sources.** The register is fed by [`../../content/`](../../content/) and by team
working notes. Coleman's Scenario 3 notes
([`coleman-scenario-3-events-and-questions.md`](coleman-scenario-3-events-and-questions.md))
are folded in as of 2026-09-24 and are where Q14–Q18 come from. The 2026-09-25
Jake interview ([`../../content/jake-interview-transcript.md`](../../content/jake-interview-transcript.md))
resolved R7–R10 and raised Q19–Q22. Three further 2026-09-25 conversations —
[Cassidi at ~1130](../../content/depth-interview-notes.md),
[Coleman at 1145](../../content/coleman-1145-interview-notes.md) and
[Jake at 1210](../../content/notes-jake-1210.md) — resolved R11–R16 and raised
Q23–Q25.

**Two source cautions.** The Jake interview transcript is machine-generated and
heavily mangled — it renders Strontia as "Estrella"/"Resident Strange" and
Foothills as "football". The three newer files are hand-typed raw notes: the proper
nouns survive, but they are terse and unreviewed, and where a figure below comes
only from them it is marked for confirmation.

## The register

| # | Question | Unc. | Value | Answered by |
|---|---|---|---|---|
| [Q24](#q24-does-the-sonde-represent-the-gate) | Does the mid-reservoir sonde represent what the intake tower draws? | High | High | Jake |
| [Q23](#q23-what-depth-does-an-open-gate-actually-draw) | What band of depths does an open gate actually draw from? | High | High | Jake asked *us*; then an engineer |
| [Q3](#q3-how-long-from-sonde-to-plant) | How long from sonde to plant? Four hours, twelve hours, or four days. | High | High | Data first, then Jake |
| [Q21](#q21-what-continuous-data-exists-that-is-not-in-the-repo) | What continuous data exists that is not in the repo — the plant's 1–5 minute instruments, fDOM, the full profiler record? | Med | High | Jake |
| [Q22](#q22-who-decides-a-gate-change-and-what-would-move-them) | Who decides a gate change, and what evidence would move them? | High | High | Jake, plant ops |
| [Q5](#q5-replay-live-or-forecast) | Is the artifact they want a replay, a live view, or a forecast? Three SMEs, three answers. | Med | High | Cassidi and Jake, together |
| [Q25](#q25-what-makes-water-good) | What makes water "good"? Jake gave two thresholds and asked us to work out the rest. | Med | High | Jake, then ours |
| [Q9](#q9-what-does-influent-quality-cost-in-chemicals) | What does influent quality cost in chemicals, per unit? | High | Med | Cassidi |
| [Q19](#q19-where-does-the-next-sensor-earn-the-most) | Where in the collection system does the next sensor earn the most? | High | Med | Ours, then Jake |
| [Q14](#q14-spill-or-divert-and-who-chooses) | Spill or divert, and blending across sources — how is that chosen? | Med | Med | Jake or Cassidi |
| [Q11](#q11-what-are-we-missing-between-the-readings) | What are we missing between the readings, and is interpolating defensible? | High | Med | Data, then Jake |
| [Q7](#q7-what-counts-as-an-event) | What counts as an event, operationally — and is a burn-scar monsoon slug a second class? | Med | Med | Us, then validate |
| [Q15](#q15-does-higher-flow-mean-more-toc-or-less) | Does higher flow mean more TOC or less? Jake says direct correlation; his own counterexample says otherwise. | Med | Med | Data first, then Jake |
| [Q4](#q4-what-are-the-dates-of-the-2023-storm) | What are the dates of the 2023 South Platte storm? Candidate found: 2023-08-01. | Med | Med | Cassidi, to confirm |
| [Q8](#q8-which-of-the-three-audiences-are-we-serving) | Which of the three audiences are we serving? | Low | High | Team, then Cassidi |

Six lower-value questions are [parked](#parked) rather than competing for SME
time: Q2, Q10, Q12, Q16, Q17, Q18.

---

### Q24. Does the sonde represent the gate?

- **Status:** Open · **Uncertainty:** High · **Value:** High
- **From:** the 2026-09-25 Jake 1210 notes. **Raised to the top of the register.**

**Why it matters.** This is the single assumption everything in 0002 rests on. Our
entire method reads water quality at a depth from the sonde and infers what a gate
at that depth would deliver. If that inference does not hold, the gate ranking is
not a weaker result — it is a different result, and O1 through O5 all need rework.

**What we have, and it cuts against us.** Jake raised this unprompted and called it
*"a point of contention"*: the sonde is **in the middle** of the reservoir, the gates
are at the **edge**, on the intake tower, and the relationship is *"more like loose
correlation"* (`../../content/notes-jake-1210.md`). Nobody in Denver Water has
established how loose. Note that he flagged this himself while advocating *for* the
instrument, which makes it a considered caveat rather than a brush-off.

**Our read, which is not evidence.** Vertical differences across a thermocline are
normally much larger than horizontal differences across a small reservoir, so the
*ordering* of the gates should survive even where absolute values do not. That is
the reasoning behind O2 in 0002, and it is currently an argument, not a measurement.

**What would answer it.** Ask Jake two things. Is any water quality measured at the
intake tower itself, at any interval, even a monthly grab? — that would let us
measure the gap directly rather than assume it away. And what is the horizontal
distance from the sonde to the tower, which sets how plausible the assumption is at
all. If the answer is that nothing is measured there, Q19 has its answer too.

---

### Q23. What depth does an open gate actually draw?

- **Status:** Open · **Uncertainty:** High · **Value:** High
- **From:** the 2026-09-25 Coleman 1145 notes. Jake put this to *us*.

**Why it matters.** A gate is not a straw sampling a point; it withdraws a layer
whose thickness depends on how strongly the column is stratified and how fast water
is being drawn. If the layer is thin, the sonde reading at gate depth is close to
what the plant gets. If it is thick, a gate sitting just below a clean layer may
still pull the dirty water above it, and the ranking can invert.

**What we have.** The note is explicit that this is an open request rather than a
gap we found: *"If you open the gate, which depths of the water is being consumed,
they don't know, but we should think about that and come up with recommendations"*
(`../../content/coleman-1145-interview-notes.md`). One nearby fact: the physical
measurement they take by hand is at **45 ft, once per month**, which is the default
gate depth. We have no withdrawal rate, no tower geometry and no port dimensions.

**What would answer it.** Partly ours, as a sensitivity study rather than physics:
recompute the gate ranking with 1 m, 3 m and 5 m averaging windows around each gate
and see whether the order holds. If it does, the uncertainty is harmless and we can
say so plainly, which is a real answer to Jake's request. If it does not, we need
the withdrawal rate and tower geometry from an engineer, and that is the ask.

---

### Q3. How long from sonde to plant?

- **Status:** Open · **Uncertainty:** High · **Value:** High
- **Retitled** 2026-09-25: was "Four hours or several days?". A fourth figure landed.

**Why it matters.** Under 0002 this stopped being background and became the hinge of
O1. Validating the sonde against plant TOC and alkalinity means shifting one series
against the other, and the shift we choose decides whether we find a relationship or
destroy one. Get it wrong and we may conclude the sonde is useless when it is only
misaligned.

**We now have four numbers for three different distances**, and conflating them is
the trap:

| Figure | From where to where | Source |
|---|---|---|
| ~4 hours | Sensor above Strontia → plant intake, as raw-water modelling | `guide.md` §1 |
| days | Upstream gage → plant, as the lag Jake's models fit best at | `guide.md` §6 |
| ~4 days | Data signal → plant needing to act, in the flash-melt case | Jake interview, R10 |
| **~12 hours** | **Sonde → plant, including measurement and analysis delay** | `../../content/notes-jake-1210.md` |

The 12-hour figure is the new one and the one O1 needs, because it starts at the
sonde rather than upstream of the reservoir. Note it is *not* purely transport — Jake
said it includes measurement and analysis delay, so part of it is laboratory latency
rather than water movement, and the two parts may need separating.

**What would answer it.** Ours first: cross-correlate the sonde record at the 45 ft
gate depth against `data/FoothillsInfluent.csv` across a range of lags and see where
skill peaks. That is O1, and it tests the 12-hour figure rather than assuming it.
Then ask Jake how the 12 hours splits between travel and lab, and whether it changes
with withdrawal rate.

---

### Q21. What continuous data exists that is not in the repo?

- **Status:** Open · **Uncertainty:** Med · **Value:** High
- **Widened** 2026-09-25: a third dataset, and the most useful one.

**Why it matters.** Three datasets have now come up that we do not have, and each
would change what is buildable rather than merely informing it.

**The plant's real-time instruments — new, and the big one.** Jake said the plant
runs **turbidity, temperature, pH and conductivity in real time**, with data
*"every 1-5 mins"* at the plant and lab (`../../content/notes-jake-1210.md`). Our
only plant series is twice-daily TOC and alkalinity grab samples. O1 is currently
forced to validate a 3.8-cast-per-day sonde record against a twice-daily lab value,
which is the weakest link in the whole plan. Minute-resolution plant turbidity would
replace it outright, and turbidity is the one analyte both instruments measure.

**The fDOM sensor.** A new instrument in testing, attached to the existing river
sonde, measuring fluorescent dissolved organic matter — an optical, real-time proxy
for organics. If it works it is a continuous stand-in for the twice-daily TOC grab
sample. Even a short, uncalibrated test record would tell us whether the proxy holds.

**The full Strontia profiler record.** We hold `data/Strontia 0407_0819.xlsx`,
2026-04-07 to 08-19. Whether it continues past August is unknown and bears on Q18 —
turnover is a fall event, so a few more weeks of casts would catch something the
shipped file almost certainly misses.

**What would answer it.** Ask Jake for all three, leading with the plant's
minute-resolution turbidity, because it is the one that unblocks work we are doing
this week rather than work we might do.

---

### Q22. Who decides a gate change, and what would move them?

- **Status:** Open · **Uncertainty:** High · **Value:** High
- **Retitled and partly answered** 2026-09-25: was "What would make anyone act on a
  forecast?". The *who* is now known; the *what would move them* is not.

**Why it matters.** 0002's O5 commits us to building for a specific decision chain,
and building for the wrong link in it wastes the deliverable. Jake volunteered
earlier that roughly half the problem is not the model — plant staff have run these
processes for decades and consider current practice good enough. A system that
explains *why* it is recommending a depth, in terms someone already trusts, is a
different artifact from one that emits a gate number.

**What we now know about the chain.** From the 1145 notes: the gate button is
**remote**, there are **two operators on shift** and someone is always on site, and
crucially **operators do not make the decision** — they notice data and communicate
it upward. Whether the decision maker looks at data directly or relies on the
operators' relay was explicitly left uncertain
(`../../content/coleman-1145-interview-notes.md`). So our output is something an
operator hands upward, not a setpoint.

**What is still open, and it is the expensive half.** What evidence would actually
justify moving off the 45 ft default? The same notes say plainly: *"they don't know,
they might be ok with predictive but might want real data. real time vs lag is not
certain. Maybe come up with solutions for all."* And Jake's 1210 note adds the
reason to be cautious — he trusts the sonde measurements, considers the predictions
*"less confident right now and less trustworthy"*, and is *"trying to sell
operations on the sonde"*. Our deliverable inherits that credibility problem.

**What would answer it.** Ask for fifteen minutes with whoever actually authorizes a
gate change: what would you need to see before moving off 45 ft, and what happens to
you if it was the wrong call? The cost of a bad call is the number that sets our
precision target and we still have no basis for it.

---

### Q5. Replay, live, or forecast?

- **Status:** Open · **Uncertainty:** Med · **Value:** High
- **Third data point added** 2026-09-25.

**Why it matters.** Three SMEs have now answered this differently, and we cannot
build all three well.

**Cassidi asked for explanation.** Her biggest problem was visualization — a digital
twin that models constituents, runs against historical years, and lets them "explain
different conditions to those across the organization"
(`../../content/sme-qa-cleaned.md`). That is Scenario 3 and it is retrospective.

**Jake asked for warning**, in his interview: know what is coming toward the plant in
time to change treatment. Forward-looking throughout.

**Jake then undercut the forecast himself.** In the 1210 notes he puts more trust in
actual sonde measurements than in predictions, and wonders whether *"we are
interested in longer-term quality rather than instantaneous sonde measurements"* —
which is a third position again, neither replay nor forecast but a smoothed present.

**What we have that decides part of it.** The strongest product signal in this
round is not about time horizon at all: the SCADA UI shows a **point-in-time
snapshot only**, local at the plant and local at the reservoir, with **no way to
look at historical data** (R16). They do not lack sensors; they lack history. That
argues the replay-and-trend axis has more unmet need behind it than the forecast
axis, independent of which SME asked for what.

**What would answer it.** Put it to Cassidi and Jake together and say plainly that we
have heard three answers. If the honest answer is "all of them", Q8 stops being a
low-uncertainty question and becomes the decision we make first.

---

### Q25. What makes water "good"?

- **Status:** Open · **Uncertainty:** Med · **Value:** High
- **From:** the 2026-09-25 Jake 1210 notes. He asked us to help work this out.

**Why it matters.** 0002's O4 commits us to encoding thresholds into the visual
rather than a continuous colour ramp, so that "this is a concern" reads without
interpretation. Those bands have to be Denver Water's, not ours — a threshold we
invent is exactly what `AGENTS.md` forbids, and an operator will spot a made-up band
instantly. It also decides what O1 optimizes: "best gate" is meaningless until
"better" is defined.

**What we have — two figures, both needing confirmation.** From
`../../content/notes-jake-1210.md`:

- **Turbidity above 10 is a concern.** Written "10 mtu" in the notes, which is
  almost certainly NTU, but that is our reading of a typo and not something he said.
- **Below 60, TOC removal is required**, which costs more chemicals. The units are
  not recorded and the sentence is terse; in context it reads as alkalinity, and it
  sounds like a regulatory tier boundary rather than an internal rule of thumb — but
  both of those are inferences we are making, not things in the note.

He also framed the broader task as helping them *"analyze what values are 'good'
values"*, and said **lower turbidity is good**, which at least fixes the direction.

**What would answer it.** Confirm both figures with Jake: the units, whether 60 is
alkalinity and whether it is regulatory, and whether 10 NTU is a plant limit, a
trigger for a specific action, or a rule of thumb. Ask what action each threshold
actually triggers, because a band that changes nothing is decoration. Then the rest
is ours — O1 relates sonde readings to plant TOC and alkalinity, which is his own
suggested method: *"measurements of the bouey compared to TOC and alkalinity at the
plant. You can likely figure that out through data."*

---

### Q9. What does influent quality cost in chemicals?

- **Status:** Open · **Uncertainty:** High · **Value:** Med

**Why it matters.** Cassidi volunteered that treatment chemicals are "hundreds of
millions of dollars expensive". Even a rough relationship between influent quality
and cost turns 0002's output from a picture into a dollar figure, and a dollar
figure is what moves an organization. It is a multiplier on our output rather than a
dependency, which is why it sits below the framing questions.

**What we have.** Jake named the levers, but never their prices: coagulant dose at
the first sedimentation stage, and pre-oxidation with chlorine or ozone when
organics are high. The 1210 notes add a qualitative link — below the threshold in
Q25 you are required to remove TOC, and *"you have to add more chemicals and it's
more costly"* — which says the relationship is real and stepped rather than smooth,
without giving its size.

**What would answer it.** Ask for a ballpark: coagulant dose per unit of TOC, what
switching pre-oxidation on costs per day, or what an event like 2023 cost in
chemicals and labour. Do not estimate this ourselves — `AGENTS.md` forbids inventing
numbers, and a wrong cost claim is worse than none.

---

### Q19. Where does the next sensor earn the most?

- **Status:** Open · **Uncertainty:** High · **Value:** Med
- **Value lowered** 2026-09-25: it is no longer our problem statement, but Q24 made
  it concrete.

**Why it matters.** Jake raised this himself and said he did not know the answer. We
did not take it as our problem — 0001 chose depth selection instead — so it drops in
value. It stays in the register because **Q24 turned it from an abstract siting study
into one specific instrument**: if the mid-reservoir sonde does not represent the
intake tower, the highest-value sensor in the system may be a second one on the
tower, and that recommendation falls out of work we are already doing.

**What we have.** His description of the gap: a large collection system that is
mostly uninstrumented, one river sensor at fifteen minutes, much of the rest at
roughly four-hour resolution (confirm), and "a huge collection system that we're not
getting". He wondered aloud whether a river site or a reservoir site would pay
better and did not resolve it.

**What would answer it.** Fold it into Q24's ask rather than spending separate SME
time on it: if nothing is measured at the tower, ask what would constrain putting
something there — power, access, permission, budget cycle.

---

### Q14. Spill or divert, and who chooses?

- **Status:** Open · **Uncertainty:** Med · **Value:** Med
- **Narrowed and partly answered** 2026-09-25. See R13.

**Why it matters.** The original question — whether reservoir releases decide what
arrives, making our target partly an operator's choice — is now half answered, and
the answer simplified our life. What remains open is the part that is still a lever
on our problem.

**What is now settled (R13).** Cassidi: **upstream reservoirs are used to regulate
for hydrologic events, and Strontia itself is kept very stable** because it sits
directly upstream of treatment (`../../content/depth-interview-notes.md`). So
Strontia is not being operated as a buffer, and a stable pool means depth maps to
gate without a storage correction — which is load-bearing for 0002 and worth having
in writing.

**What is still open.** Two choices at Strontia that are not in any of our inputs.
They can **spill rather than divert to treatment**, or pull direct to treatment
(Cassidi). And Jake's 1210 note describes the wider lever as *"pulling water from
different places to mix and dilute the alkalinity and TOC"* — blending across
sources, of which gate selection is one instance. 0002 puts blending out of scope
(O8) but names it as the honest frame, so we should not present gate choice as the
whole lever.

**What we have.** `water-system-3d/storage-history.json` carries daily storage for
`DILRESCO`, `CHERESCO`, `CHARESCO`, `STRRESCO` as one 366-slot array per water year,
so dates need deriving from day-of-water-year. Cheesman and Dillon reach back to the
late 1980s; **Strontia only starts in 2021**. Nothing here records a release or a
spill directly.

**What would answer it.** Ask on what basis they spill rather than divert, and
whether either that or the blending schedule is recordable as a series we could
have.

---

### Q11. What are we missing between the readings?

- **Status:** Open · **Uncertainty:** High · **Value:** Med

**Why it matters.** This is the SMEs' own open question handed back to us: "we have
certain instantaneous points of time. One of the questions we have right now is what
are we missing?" (`../../content/sme-qa-cleaned.md`). It bears on Q3 and Q7, and it
is the groundwork for Q19.

**Jake sharpened it into three gaps.** A *temporal* gap — one river sensor at fifteen
minutes, much of the rest around four hours (confirm). A *spatial* gap he considers
larger, most of the collection system carrying no instrument at all. And R7's third:
the chemistry that matters most, TOC and alkalinity, is a twice-daily grab sample, so
the gap in the target variable is worse than the gap in the inputs. Q21's discovery
that the plant runs minute-resolution turbidity narrows the third gap considerably —
for turbidity, not for TOC.

**What would answer it.** Compare the fifteen-minute USGS record against the daily
series over a known event and measure what daily averaging erases; then the same
against the twice-daily influent sampling. Concrete, ours, and it feeds Q19.

---

### Q7. What counts as an event?

- **Status:** Open · **Uncertainty:** Med · **Value:** Med
- **Value lowered** 2026-09-25: still needed, but 0002 made it an input rather than
  the headline.

**Why it matters.** 0002's O3 needs an event definition to show post-storm
persistence, and Q10 cannot be settled without one. But under the depth framing we
no longer need to *predict* events, only to recognize them in the record, which is a
lower bar than the old framing set.

**Jake gave us two classes, deliberately.** Asked for something less dramatic than
the near-shutdown, he described monsoon season: localized convective rain cells
rather than basin-wide melt, producing short turbidity slugs where TOC at the plant
barely moves. He named the aggravating condition unprompted — **burn scars**, where
lost interception puts the hillside into the river on rain a healthy catchment would
have absorbed. So "event" is at least two rules, and a single threshold will either
miss the second or drown in it.

**New: events have a duration now.** Jake's 1210 note says that after a storm the
water is **much the same for three to four days**, which is the first thing anyone
has told us about how long an event *lasts* rather than when it starts. That is what
O3 displays, and it wants confirming because a single terse note is carrying it.

**What would answer it.** Ours to settle. Propose two threshold rules — rate of rise
on flow, and a turbidity departure from seasonal normal — count what each catches,
and show both lists to an SME to see whether they recognize the events they lived
through. Their recognition is the test, not our statistics.

---

### Q15. Does higher flow mean more TOC or less?

- **Status:** Open · **Uncertainty:** Med · **Value:** Med
- **Value lowered** 2026-09-25: the volume framing it hinged on is gone (R12).

**Why it matters.** This was the hinge between volume and quality framings. With
0001 revised onto depth, it is no longer load-bearing — but it still tells us
whether upstream flow is a usable leading indicator of what the column will look
like, which is context for O3.

**Jake asserted the relationship, then gave a counterexample.** He said flow is "sort
of a direct correlation with TOC", then minutes later, describing monsoon slugs, said
TOC at the plant "didn't really go up a whole lot" while turbidity did. Both can be
true if the relationship is regime-dependent: snowmelt carries organics, a convective
rain cell carries sediment. That is the seasonal split Coleman anticipated.

**What we have, besides.** Coleman's event tables pull opposite ways: **First Flush**
carries a season's dead plant matter into a rising river; **River Returned to
Baseflow** describes groundwater with more dissolved minerals, which is the
alkalinity story. Dilution argues the other way.

**What would answer it.** Ours, and cheap. Correlate `Flow_CFS` against TOC across
the lags from Q3, then split by regime — snowmelt rise, monsoon storm and baseflow
are three different animals and one correlation over all of them averages them into
nothing. TOC is a twice-daily grab sample (R7), so the series is sparser than it
looks.

---

### Q4. What are the dates of the 2023 storm?

- **Status:** Open · **Uncertainty:** Med · **Value:** Med
- **Value lowered** 2026-09-25: the sonde record does not reach 2023, so this is no
  longer a validation case for the work we committed to.

**Why it matters.** Cassidi's account of a storm that nearly shut Foothills down is
the best narrative anchor we have. It is now a *framing* asset rather than a test
case: the sonde record starts 2026-04-07, so whatever happened in 2023 cannot be
examined by depth.

**The catch.** They said 2023, hedged with "I think". Our committed data starts
2022-04-01, so it may be in the window.

**We pulled the gage record, and there is a signature.** 2023-08-01 carries the
highest `Turbidity_Max` in the committed record, 477 in
`data/USGS_South_Platte.csv`, against a record median-of-daily-medians of 3.3. The
daily median that day is 47.3, above the record p99 of 29.8. `Flow_CFS` rises
515 → 647 over 7/31–8/1 and is back to 420 by 8/3. A sharp, short, high-turbidity
event in the right year — though we matched it ourselves and they never gave a date.

August turbidity spikes recur: 2026-08-15 (329), 2024-08-06 (321), 2022-08-15 (285).
So the map's August 14–15 replay is a *different* event of the same kind.

**What still would answer it.** Confirm the date with Cassidi; it stays a candidate
until they say so. Then the follow-up their phrasing invites: "you knew it was coming
but not the scale" — what would have told you the scale?

---

### Q8. Which of the three audiences are we serving?

- **Status:** Open · **Uncertainty:** Low · **Value:** High

**Why it matters.** Cassidi named three, wanting different things: the ~50-person
water quantity team, the water quality and watershed scientists, and the treatment
plants (acute — what is arriving now, treat it efficiently). 0001 and 0002 aim at the
plant, and R15 sharpened that considerably: within the plant, the person we are
serving is not the operator who watches the screen but whoever authorizes the change.
That is a fourth distinction inside the third audience.

**Q5 makes this less optional than it was.** Three SMEs asked for different
artifacts, and the likeliest explanation is that they speak for different audiences.
Choosing the audience chooses the artifact, and doing it by default means letting
whichever SME we spoke to last decide for us.

**What would answer it.** Mostly ours, and we should decide explicitly in a decision
record rather than by default. One SME question is worth asking: does the quantity
team already have arrival volume and timing solved for themselves?

---

## Parked

Real questions, low enough value that they should not consume SME time while the
register above is unanswered. Unparked if the problem statement moves toward them.

| # | Question | Why parked |
|---|---|---|
| Q2 | Does a Foothills intake or treated-volume series exist? | **Parked 2026-09-25.** Still unanswered, but 0001 dropped arrival volume as the target (R12), so it no longer blocks anything. The useful half — what else the plant records — moved into Q21, which asks for the minute-resolution instruments instead. |
| Q10 | Is four water years enough history? | **Parked 2026-09-25.** The sonde record is 104 days in one season regardless of how much river history we hold, so the binding limit on the depth work is the profiler window (Q21), not the CSV window. |
| Q12 | Do water rights and instream obligations belong in the model? | High uncertainty, but it blocks nothing in Phase 1 and none of the candidate problem statements need it. |
| Q16 | What counts as a dry year? | **Parked 2026-09-25.** A good question that the depth framing cannot use: one spring-to-summer of sonde data supports no wet-versus-dry comparison. Unpark if we return to seasonal supply. |
| Q17 | Can one snow pillow stand for the basin? | Answerable by us without an SME: correlate the 11 stations in `water-system-3d/snotel-history.json` against each other. R6 settles the naming half. |
| Q18 | When does Strontia turn over, and does the plant see it? | The shipped record runs to 08-19 and turnover is usually a fall event, so it most likely ends before it happens. **Now cheaply checkable:** the sonde covers the full column, 0.85–47.82 m, so the top-to-bottom temperature spread at the end of the cast record will confirm whether we caught it. Folded into Q21's ask for later data. |

---

## Resolved

Kept because the answers shape the questions above, and because knowing a thing is
settled is worth as much as knowing it is open.

| # | Question | Resolution | Source |
|---|---|---|---|
| R1 | What is Denver Water's biggest problem, in their words? | Visualization. A digital twin that models constituents, compares against historical years, and lets them explain conditions across the organization. **Jake answered differently** — see Q5. | `../../content/sme-qa-cleaned.md` |
| R2 | Who would use what we build? | Three groups: water quantity (~50 people), water quality and watershed science, and treatment plant operations. Now Q8. | `../../content/sme-qa-cleaned.md` |
| R3 | What do they do today? | Real-time and retrospective only, from the plant's perspective. No forward modelling of quality. No alerts from weather data. | `../../content/sme-qa-cleaned.md` |
| R4 | Do they use weather or radar in prediction? | Only big-picture, and only for water *quantity* — SWE and seasonal scale. Explicitly "not for acute things". | `../../content/sme-qa-cleaned.md` |
| R5 | How are SNOTEL stations chosen? | Purely by location. No groupings; picked off geographic coordinates. | `../../content/sme-qa-cleaned.md` |
| R6 | Hoosier Pass or Buckskin Joe? | Both appear because the shipped CSV matches Hoosier Pass (531) while the notebooks name Buckskin Joe (938). Cite the file. Michigan Creek was dropped for a known feed error. | `AGENTS.md` |
| R7 | Are TOC and alkalinity sensor readings? | **No — lab measurements.** At the plant, operators draw from a sample faucet roughly twice a day. Upstream it is a monthly-ish grab sample. Note R11's correction: other analytes *are* continuous at the plant. | `../../content/jake-interview-transcript.md` |
| R8 | What *is* measured continuously? | Turbidity and conductivity. Turbidity is their working proxy for TOC; conductivity for alkalinity. An fDOM sensor is in testing — see Q21. | `../../content/jake-interview-transcript.md` |
| R9 | Is either intake multi-level? | **Yes at Strontia** — four gates at different heights, with a profiling sonde installed to help decide which to draw from. Heights now known: R11. | `../../content/jake-interview-transcript.md` |
| R10 | How much lead time would change a decision? | Roughly **four days** in the flash-melt case. What it buys: more time, more money, different treatment strategies. An operational recollection, not a measurement — see Q3. | `../../content/jake-interview-transcript.md` |
| R11 | **What are the Strontia gate heights?** (old Q20) | **15, 45, 65 and 95 ft below the surface. They pull at 45 ft by default unless specified otherwise**, so the other three are closed. This also answers the Foothills half of old Q13: the draw is from a fixed default depth, not chosen per-event, though they *"would like to pull from whatever depth makes sense"*. The hand measurement is taken at 45 ft once per month. | `../../content/depth-interview-notes.md`, `../../content/coleman-1145-interview-notes.md` |
| R12 | **Is arrival volume really the driver?** (old Q1) | **No.** Three independent lines pointed away from it — both SMEs' worked examples are quality failures, the 2023-08-01 record shows record turbidity at unremarkable flow, and every lever Jake named acts on chemistry. 0001 was revised onto depth selection on 2026-09-25 rather than superseded. | [decision 0001](../decisions/0001-problem-statement-strontia-withdrawal-depth.md) |
| R13 | **Is Strontia operated as a buffer?** (part of Q14) | **No — the opposite.** *"Upstream reservoirs are used to regulate for hydrologic events, strontia is kept very stable because its directly upstream of treatment."* A stable pool means depth maps to gate without a storage correction. What remains open is spill-versus-divert and blending: Q14. | `../../content/depth-interview-notes.md` |
| R14 | How fast can a gate change, and how often would they? | **Actuation is minutes** — a remote software signal, and *"gate changes are quick"*. But Jake put the realistic cadence at **not more than about once per day**, adding that after a storm the water is much the same for three to four days. So the decision is daily, not continuous. | `../../content/depth-interview-notes.md`, `../../content/notes-jake-1210.md` |
| R15 | Who is at the controls? | The gate button is **remote**. **Two operators per shift**, always on site. **Operators do not make the decision** — they notice data and communicate it upward. Whether the decision maker reads the data directly is still open: Q22. | `../../content/coleman-1145-interview-notes.md` |
| R16 | Can they look at historical data today? | **No.** SCADA is local at the plant and local at the reservoir, and the UI *"gives point in time snapshot of present state only. So they have no way of looking at historical data."* Cassidi separately called the SCADA data not easily digestible with no good way to convert it. This is the clearest unmet need anyone has described to us. | `../../content/coleman-1145-interview-notes.md`, `../../content/depth-interview-notes.md` |

---

## Noted, not asked

Small factual snags that came out of this round and do not need SME time, recorded
so nobody re-derives them.

- **The reservoir elevation figures do not reconcile.** The 1130 notes give
  *"reservoir heiht is 6901, they keep it at 5990 (ft)"*. A 243 ft dam
  (`strontia-brief/places.json`) cannot hold a pool 911 ft below its crest, so one
  figure is mis-transcribed. It changes nothing for us — the gates are given as
  **depths below the surface**, which is how the sonde reports too, so we never need
  the absolute elevation. Ask only if it comes up.
- **Outliers and data vintage.** Jake cautioned to *"be careful of outlier data that
  wasnt accurate"* and said **more recent data is higher quality**. That is now an
  SME-endorsed reason to filter, which is different from us deciding to. Handled as
  O4 in 0002.

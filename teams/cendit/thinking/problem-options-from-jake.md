# Problem options from the Jake interview

- **Date:** 2026-09-25
- **Status:** For team discussion. Nothing here is decided. When one wins, it
  becomes a decision record and supersedes or amends
  [0001](decisions/0001-problem-statement-strontia-withdrawal-depth.md).
- **Source:** [`../content/jake-interview-transcript.md`](../content/jake-interview-transcript.md)

**Read the source caveat first.** That transcript is machine-generated and badly
mangled — station names, numbers, and speaker attribution are all unreliable
("Estrella Springs", "3DB", "71 here", "4 months a day"). Every quote below is
paraphrase unless marked, and every number is flagged as needing confirmation.
Nothing here should reach a slide without Jake seeing it.

---

## What Jake actually volunteered

Five problems, roughly in the order he raised them. He named the first one as
the thing he has "locked on to"; the rest came out as the conversation widened.

### A. Early warning for slugs arriving at the plant

The framing he led with: *know what is coming toward the treatment plant before
it gets there.* Flow events into the system, and flow as a leading indicator of
TOC — he stated a "direct correlation" between flow and TOC, unprompted.

What warning buys, in his words: more time, more money, **different treatment
strategies**. He named the levers concretely — coagulant dose at the first stage
of sedimentation, and **pre-oxidation** (chlorine or ozone ahead of
sedimentation) when a lot of organics are incoming.

Lead time: he described the flash-melt case as giving roughly **four days** in
the data between the upstream event and the plant needing to act, and said that
window "works out" against transport time. Confirm the number with him.

**The honest obstacle, which he raised himself:** adoption. Plant staff have
decades of experience and consider current practice good enough. Half the
problem is "getting people to be willing to want to respond in real time," not
building the model.

### B. Where to put the next sensor

He called this an interesting problem space unprompted: the collection system is
large and **mostly uninstrumented**. One good sensor in the river reports every
15 minutes; most of the rest is on the order of four hours or worse; the bulk of
the collection system reports nothing. He does not know where the next
installation earns the most — river, or reservoir — and said so.

This is an optimization/value-of-information problem over the existing record,
and it needs no new data from Denver Water. It also does not depend on winning
the adoption fight in A.

### C. Source blending and gate selection

The one he raised as "an open thing we've been talking about a lot recently."
Denver Water has a broad collection area, water from different places has
different quality, and **within limits they can choose where to pull from**.
Blending is a lever on plant influent quality, on chemical cost, and on
regulatory margin.

The sharp version is inside Strontia: he said there are **four gates at
different heights** in the reservoir, and that a goal of the profiling sonde
that moves up and down is to work out in real time whether pulling from a
different level would improve water quality. He does not have the gate heights
and is not sure they are public — he suggested modelling them rather than
waiting.

**This answers Q13 in the affirmative** and reopens the depth boundary decision
0001 drew. Note his lighter framing too: the reservoir as a settling pond you
can use instead of coagulant.

### D. The mundane event, not the hundred-year one

He steered us here deliberately when asked for something less dramatic. Monsoon
season: localized heavy rain cells, not basin-wide snowmelt. These produce
short turbidity slugs where **TOC barely moves at the plant** but turbidity is
its own challenge — and they are made worse by **burn scars**, where lost
interception sends the hillside into the river.

He thinks there is an example already visible in the 3D map. This is the cheap
validation case: frequent, in-record, and a different physical mechanism from
the 2023 event we have been anchoring on.

### E. Making the profiling sonde record useful

The Strontia profiler was installed **this spring, about four or five months
ago**, samples roughly every meter, and measures 5–6 analytes. He said plainly
they are *still trying to figure out how to use that data*, and that even a
summary of what it contains would be useful.

Short record, so it cannot carry an event study. But "nobody has looked at this
yet" is a real opening.

---

## What he told us about the instruments

This changes what we thought we had, so it belongs on the record separately.

- **TOC and alkalinity are not sensors.** They are lab measurements. At the
  plant, operators draw from a sample faucet roughly **twice a day**. Upstream
  it is a once- or twice-monthly grab sample by someone driving out. Real-time
  in-river TOC instruments exist and are expensive; they do not have them.
- **What they do measure continuously is a proxy set** — turbidity, and
  conductivity (his proxy for alkalinity). Turbidity stands in for TOC.
- **A new sensor is being tested** — fluorescent dissolved organic matter
  (fDOM), attached to the existing river sonde, as a real-time optical proxy for
  organics. Not in our data.
- The lab at the central building does monthly sampling and its results are in
  our dataset; the operations-relevant readings come from the plant twice daily.

That reframes the soft-sensor idea: **the target variable is twice-daily grab
samples**, not a continuous series. It also makes Q11 sharper than we had it.

---

## Recommendation

Rank by: does it use data we have, does it survive Jake's own objections, and
does it produce something no one at Denver Water has done.

1. **B — sensor siting.** Strongest candidate. Self-contained, purely
   analytical, needs nothing we do not have, and he explicitly said he does not
   know the answer. It also sidesteps the adoption problem that he says is half
   of A.
2. **A, narrowed to D** — an early-warning study built on **monsoon turbidity
   slugs** rather than the 2023 near-shutdown. More events in the record, a
   clean mechanism, and it tests the flow→TOC correlation claim directly.
   Folding D into A rather than treating them separately keeps one story.
3. **C — blending and gates.** The highest-value problem he named and the one
   he is personally curious about, but it needs gate heights we do not have and
   a hydraulic model we would be inventing. Good as a *stretch* layer on top of
   whatever we build, or as a question we hand back well-posed.
4. **E — sonde summary.** Not a problem statement; a two-day deliverable we
   could hand him regardless of which of the above we pick. Cheap goodwill, and
   it feeds C.

**What this does to decision 0001.** Every one of A–D is a *quality* problem,
not a volume one. Nothing Jake said supports arrival volume as the driver, and
he confirmed there is no intake volume series — the plant's own operational
readings are twice-daily lab values. 0001 should be superseded, not patched,
once the team picks from this list.

## What to ask Jake next

Folded into the [question register](questions/open-questions.md) — the live list
is there. The four that gate the options above:

- Gate heights at Strontia, or permission to model them (blocks C).
- Is the four-day window his estimate or something measured (sizes A)?
- Does a sensor-siting study have an owner already, or a budget cycle it would
  feed (sizes B)?
- Can we have the fDOM test data, even partial (changes E and A)?

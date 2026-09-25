# Question register

One running list of what team cendit does not know, ranked so the top of it is
always the next thing worth asking. It lives in
[`open-questions.md`](open-questions.md).

Point of the register: an SME's time is the scarcest input we have. When we get
fifteen minutes with Cassidi or Jake, we should already know which four questions
to spend it on, and why those four.

It is the opposite of the [decision log](../decisions/) by design. A decision is
closed by being written down and changes only by being superseded. A question is
open by definition and is *supposed* to churn — re-ranked whenever new content or
a new decision lands, and retired the moment it is answered.

## How a question is ranked

Two axes, judged against what [decision 0001](../decisions/0001-problem-statement-strontia-withdrawal-depth.md)
says we are building.

- **Uncertainty** — how little we can predict the answer. A question we could
  answer ourselves in an hour with `rg` and a CSV is not uncertain; it is work.
- **Value** — how much our plan changes depending on the answer. The test is
  concrete: name what we would do differently under each answer. If nothing
  changes, the question is interesting rather than valuable, and interesting goes
  to the bottom.

High uncertainty and high value ranks first. Between two questions that tie,
prefer the one that **blocks** another, and the one only an SME can answer — we
can grind out a data question on our own time.

A question nobody can act on differently is not a question. Cut it.

## Anatomy of an entry

Every question carries four things:

1. **Why it matters** — stated as what we would do differently, not as curiosity.
2. **What we have** — what the materials already say, including evidence that
   cuts *against* our current framing. That evidence is the most valuable thing in
   the register and the easiest to leave out.
3. **What would answer it** — the actual question to put to a person, or the
   actual analysis to run. Specific enough to do without rethinking it.
4. **Who or what answers it** — an SME by name, or a file.

## Keeping it current

- New content lands in [`../../content/`](../../content/) → re-read the register
  against it. Some questions are now answered, some are sharpened, some are newly
  raised by what was said.
- A teammate's working notes land → fold their questions in and leave the notes
  beside the register as a source document, with a mapping table saying where each
  question went. Do not rewrite the notes; the register is what we ask from, and
  the notes are the record of how a question got there.
  [`coleman-scenario-3-events-and-questions.md`](coleman-scenario-3-events-and-questions.md)
  is the worked example.
- A decision is accepted → its open questions belong here, and questions the
  decision settled move to Resolved.
- A question is answered → move it to the **Resolved** table with its answer and
  source. Do not delete it. A question we know is closed is worth as much as one
  we know is open, and it stops us asking twice.
- Anything that starts reading like a conclusion has stopped being a question.
  Write it up as a decision record instead.

The [`question-register`](../../../../.claude/skills/question-register/SKILL.md)
skill does this pass and is the easiest way to run it after a session.

## Ground rules

`AGENTS.md` applies here as everywhere: never invent a number, a threshold, a
station, or a date to make a question sound sharper. Cite the file. If a question
rests on something an SME said, quote them from `content/` rather than
paraphrasing from memory.

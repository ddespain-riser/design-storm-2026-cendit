---
name: question-register
description: Update team cendit's running list of open questions in teams/cendit/thinking/questions/open-questions.md after new content or a new decision lands — retiring what is now answered, raising what the new material provokes, and re-ranking everything by uncertainty against value. Use when a transcript, session note, or SME answer is added to teams/cendit/content/; when a decision record is written or superseded; when asked what to ask an SME next, what our open questions are, or to reprioritize them.
---

# Question register

Keep `teams/cendit/thinking/questions/open-questions.md` true. It is one running,
ranked list of what the team does not know, and its only job is that the top of it
is always the next thing worth asking.

The register's own rules — how ranking works, what an entry carries — are in
`teams/cendit/thinking/questions/README.md`. **Read it first.** This skill is the
procedure for running a pass over the register; that file is the standard the
result has to meet.

## The rule that outranks the rest

**Never invent a number, a threshold, a station, a date, or a quote.** A question
sounds sharper with a specific figure in it, which is exactly the temptation.
Quote the SME from `teams/cendit/content/` or cite the file, or write the question
without the figure. `AGENTS.md` has the full ground rules and they all apply.

The second rule: **a question nobody can act on differently is not a question.**
Before writing any entry, name what the team would do differently under each
plausible answer. If nothing changes, drop it.

## Tweakables

| Knob | Default | Notes |
|---|---|---|
| `TRIGGER` | infer | What prompted the pass: new content, a new decision, or a scheduled re-rank. Changes which step does the work. |
| `SCOPE` | `full` | `full` = re-read and re-rank everything. `incremental` = only questions the new material touches, leaving the rest ranked as they are. |
| `MAX_OPEN` | ~15 | Past that the register stops being a priority list. Merge or cut the bottom rather than letting it grow. |
| `TOP_N` | 4 | How many questions to surface as "ask these next" when reporting back. |
| `WRITE` | `true` | `false` = report the proposed changes in chat without editing the file. |

## Procedure

1. **Read the standard.** `teams/cendit/thinking/questions/README.md`, then the
   current register. Know what is already there before reading anything new.

2. **Read the current framing.** The newest accepted or proposed record in
   `teams/cendit/thinking/decisions/`. Value is judged against what the team is
   actually building, so a superseded problem statement re-ranks the whole list.

3. **Read the new material** end to end, not by keyword. The thing that changes a
   register is usually a passing remark — an aside about cost, an anecdote about a
   bad week — rather than an answer to a question anyone asked.

4. **Retire what is answered.** Move it to the **Resolved** table with the answer
   in one line and its source. Never delete it; a question known to be closed
   stops the team asking twice. Partial answers do not retire — rewrite the
   question to the part still open, which is usually sharper than the original.

5. **Hunt for contradiction.** The highest-value output of a pass is evidence that
   cuts *against* the team's current framing, and it is the easiest thing to skip
   because it is unwelcome. If new material undercuts a decision, say so in the
   affected question's **What we have**, plainly, and flag that the decision may
   need superseding. Do not soften it.

6. **Raise what the material provokes.** New questions get the four-part anatomy
   from the README. Prefer the specific over the broad: "what would have told you
   the scale of that storm?" beats "how do you assess storms?".

7. **Re-rank.** Uncertainty against value, both judged against step 2. Ties go to
   the question that blocks another, then to the one only a person can answer.
   Push down anything the team could answer itself with an hour and a CSV — that
   is work, not a question, and it belongs in the register only as a note on what
   would answer a real one.

8. **Rewrite the file whole** — summary table, detail blocks, Resolved table, and
   the `Updated` date. Check every anchor link in the table resolves to a heading.

9. **Report back**: what retired, what is new, what moved and why, and the `TOP_N`
   to ask next. Say explicitly if something in the new material contradicts a
   decision record.

## Where the material is

| Path | What it gives a pass |
|---|---|
| `teams/cendit/content/` | What SMEs actually said. Quote from the cleaned transcript; check the raw one when a number or a name matters, because cleaning is lossy. |
| `teams/cendit/thinking/decisions/` | What the team committed to. Each record's own **Open questions** section is an input to the register. |
| `data/`, `guide.md`, `glossary.md`, `README.md` | Whether a question is answerable without an SME at all. Check before spending someone's time. The `domain-research` skill does this properly. |

## Traps in this corpus

- **Auto-transcripts mangle proper nouns.** The raw transcript renders Strontia as
  "Estrella", Foothills as "football", Cassidi as "Cassidy". Never build a question
  around a name only the raw transcript supports.
- **Dates in speech are hedged.** "2023, I think it was" is not a date. Carry the
  hedge into the register rather than dropping it.
- **An SME's biggest stated problem may not be the team's chosen problem.** Both
  belong in the register. The gap between them is itself a high-value question.
- **A question with no owner rots.** Every entry names an SME or a file.
- **Do not let entries grow into essays.** A detail block is a short paragraph per
  part. When one needs more, it has become a decision — write it up in
  `teams/cendit/thinking/decisions/` and leave a question pointing at it.
- **Content is read-only in spirit.** A pass reads `teams/cendit/content/`; it
  never edits a transcript to match a conclusion.

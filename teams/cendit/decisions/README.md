# Decision log

Where team cendit records what we decided about scope and intent, and why. One
file per decision, numbered in the order we made them.

Point of the log: when someone asks "why are we building this and not that", the
answer is a file, not a memory of a conversation.

## What belongs here

Decisions that would be expensive to re-litigate: the problem statement, which
scenario we are answering, who the user is, what we are explicitly not doing,
which data we treat as in-scope. Not day-to-day implementation choices — those
live in the code and its commit messages.

## How to add one

1. Copy `TEMPLATE.md` to `NNNN-short-slug.md`, next number up.
2. Fill it in. Keep it to a page. Write the context honestly, including what we
   did not know at the time.
3. Open a PR like any other change. Discussion happens in review.

## Changing a decision

Do not rewrite an accepted record. Add a new one that supersedes it, and edit the
old record's status line to `Superseded by NNNN`. The trail of how our thinking
moved is the useful part.

## Status values

- **Proposed** — written down, not yet agreed by the team.
- **Accepted** — the team is working from this.
- **Superseded by NNNN** — replaced; see the newer record.

## Records

| # | Title | Status |
|---|-------|--------|
| [0001](0001-problem-statement-volume-and-timing-at-foothills.md) | Problem statement: volume and timing of water arriving at Foothills | Proposed |

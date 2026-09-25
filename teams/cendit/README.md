# Team cendit

Our work on the Explore DDD 2026 Denver Water Design Storm. Everything we produce
lives under this directory; Denver Water's originals in `data/`, `scripts/`,
`figures/`, and `reference/` stay untouched.

Our documents are split by where they come from.

- [`content/`](content/) — **material we captured, not authored.** What an SME
  said, what a source document holds. We edit these for readability, never for
  meaning.
- [`thinking/`](thinking/) — **what we made of it.** Our conclusions and our gaps.
  - [`decisions/`](thinking/decisions/) — what we decided about scope and intent,
    and why. Start at
    [0001](thinking/decisions/0001-problem-statement-strontia-withdrawal-depth.md)
    for the problem statement we are working from.
  - [`questions/`](thinking/questions/) — what we still do not know, ranked by how
    much the answer would change what we build.

The split matters because the two age differently. Content is fixed the moment it
is captured; thinking is supposed to move, and should move when new content or a
new decision lands.

Any dataset we derive from Denver Water's carries the notices in
[`data/TERMS.md`](../../data/TERMS.md).

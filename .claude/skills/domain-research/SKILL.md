---
name: domain-research
description: Research one water-domain term, concept, measurement, or place across everything in this repository and return a short sourced brief — what it means, where it lives in the data, how it moves through the collection system, and what is still unknown. Use when asked to define, explain, look up, or dig into a term or topic; when building ubiquitous language for a model; or when deciding what a Scenario 3 system should show about some parameter.
---

# Domain research (this repository)

Answer a domain question from the materials in this repo, fast, with every claim
traceable to a file. The output is a **brief**, not an essay: a team member should
be able to read it in a minute and then argue about the model with it.

This is domain research for building software. Two things matter equally: what the
term means to Denver Water, and what it looks like as data we could put in a system.

## The rule that outranks the rest

**Never invent a number, a threshold, a station, or a date.** Compute it from the
files here and cite the file, or say plainly that the repo does not answer it.
Label anything that comes from general water knowledge rather than these materials
as **(general knowledge)** — `glossary.md` already uses that convention. See
`AGENTS.md` for the full ground rules; they all apply here.

## Tweakables

| Knob | Default | Notes |
|---|---|---|
| `DEPTH` | `standard` | `quick` = definition + sources only. `deep` = adds notebooks, PDFs, and a computed data profile. |
| `COMPUTE_PROFILE` | `true` at `standard`+ | Range, units, coverage, and gaps for any term that is a measured column. |
| `SCENARIO_LENS` | `3` | Which scenario the "So what for us" section is written against. |
| `MAX_LENGTH` | ~1 page | Past that, split into a second brief on the narrower term. |
| `OUTPUT` | Markdown in chat | Set to a path under `teams/cendit/` to also write the file. |
| `WEB` | `false` | The repo first. Only reach outward when the repo is genuinely silent, and mark it. |

## Where to look, in order

Cheapest and most authoritative first. Stop when the question is answered.

1. **`glossary.md`** — plain-language definitions, water terms and statistics terms.
   Most one-word questions end here.
2. **`guide.md`** — the domain and Jake's models from zero, in 15 numbered sections.
   Section 1 is the physical system, 2 what the plant cares about, 3 the soft sensor,
   4 the data, 7 feature engineering, 10 the scores, 14 loose ends.
3. **`README.md`** — the challenge framing, the three scenarios in Cassidi's own
   words, why TOC and alkalinity matter, and the data terms.
4. **`data/*.csv` + `data/TERMS.md`** — what was actually measured. See the corpus
   map in `references/corpus-map.md` for which file holds which column.
5. **`water-system-3d/` and `strontia-brief/`** — the system as modelled: stations,
   reservoirs, tunnels, basins, blurbs. `water-system-3d/system.json` is where a
   place or gage gets its name, coordinates, and plain-language description.
6. **`scripts/*.ipynb`** — Jake's notebooks. Where a feature is actually constructed.
7. **`reference/*.pdf`** — Cassidi's deck, the TOC/alkalinity primer, the DBP rule
   slides. The regulatory and utility framing. Read these with the Read tool's
   `pages` argument; there is no `pdftotext` in this container.
8. **`figures/*.png`** — model results, correlation matrices, feature importances.
   Read the image when the question is "which inputs matter for X".

Search with `rg` across `*.md` first; it is one call and usually decides where to go.

## Procedure

1. **Pin the term.** Restate it in one line, including which sense you are taking
   if it is ambiguous (turbidity the measurement vs turbidity the model target).
2. **Sweep.** `rg -in "<term>" --glob '*.md'`, then widen to notebooks, JSON, and
   CSV headers as needed. Follow the order above.
3. **Profile the data**, when the term is something measured: which file, which
   column, which units, what date range, how many rows, any gaps or artifacts.
   Compute it — do not estimate. Keep the command in the brief so it can be rerun.
4. **Place it in the system.** Where in the watershed does this get measured or
   happen, and what is downstream of it? `strontia-brief/places.json` and
   `water-system-3d/system.json` carry the geography.
5. **Write the brief** in the shape below.
6. **Name what you could not settle**, as a question someone could actually ask
   Denver Water or answer with one more pull.

## Brief shape

```markdown
## <Term>

**In one line.** <Definition a non-water reader gets on first read.>

**Why the plant cares.** <Operational consequence. Thresholds only if sourced.>

**In our data.** <File, column, units, range, coverage, known artifacts — or
"not measured here", which is itself a finding.>

**In the system.** <Where it is measured, what is upstream and downstream,
how long water takes to get from there to Foothills if the repo says.>

**So what for Scenario 3.** <What a system we build would show, predict, or
let someone ask about this. Two or three sentences, opinionated.>

**Ubiquitous language.** <The one name we should use for this, and the near-miss
names in the materials that mean the same thing or subtly do not.>

**Open questions.** <Numbered. Each one answerable, and by whom or from what.>

**Sources.** <`file` or `file:line` per claim above. Anything unsourced is
labelled (general knowledge).>
```

Drop a section when it would be empty. Do not pad it.

## Traps in this corpus

- **Readings are provisional.** USGS revises published values; a fresh pull can
  differ from the committed CSVs. Never state one as settled.
- **The Michigan Creek artifact.** `data/MichiganCreek.csv` shows SWE 9.0 on
  May 12–15 2026 between zero readings — an NRCS feed error. The models use
  `data/HoosierPass.csv`. If a snow answer traces back to Michigan Creek, say so.
- **Station naming drifts.** The shipped snow CSV matches Hoosier Pass (531) while
  the notebooks name Buckskin Joe (938). Cite the file, not the notebook prose.
- **Water year, not calendar year.** October 1 to September 30. Any grouping,
  average, or "this year vs last year" claim must use it.
- **One station is a proxy, not a basin.** SNOTEL, gages, the sonde: each is one
  point standing in for a watershed. Say which when it matters.
- **Originals are read-only.** `data/`, `scripts/`, `figures/`, `reference/` are as
  Denver Water sent them. Research reads; it never edits them.
- **The terms travel.** Any derived dataset or shared output carries
  `data/TERMS.md`. Redistribution is restricted.

## Scenario 3, since that is what we are mapping

> Develop an interactive model that visualizes how water and water-quality
> conditions move from the watershed through the collection system to the treatment
> plants and evaluate how hydrologic and seasonal events influence that movement.

Good briefs for this scenario answer three things about a term without being asked:
is it a **state** (something the system is), a **flow** (something moving through
it), or an **event** (something that happens to it); at what **time resolution** we
have it; and whether it is something a user would **watch**, **compare across
years**, or **be warned about**. Those three answers are what turn a definition
into a design decision.

# How I Was Made — simple-todo via the BMad Method

> A recap of how `simple-todo` was planned and built end-to-end using the BMad Method.
> The point of this project was never the app — it was the **traceable path** from a
> first-principles scope decision to a built, tested artifact, with every decision recorded.

## Why this project exists

`simple-todo` demonstrates BMad on something **small enough to follow in one sitting but
real enough to have substance**. It is stripped to its irreducible core — **Capture → View →
Complete**. The discipline of *what got left out* (edit, delete, due dates, tags, accounts,
sync) is the actual deliverable.

## The planning chain

Every stage produced a coherent artifact:

```
Brainstorm ──▶ Brief ──▶ PRD ──▶ Architecture ──▶ Epics & Stories ──▶ Readiness check
  (05-20)     (final)   (final)   (CLI, in-mem)    (1 epic, 5 stories)   (06-04, passed)
```

- **Brief** — scoped from first principles: *what must be true for software to count as a
  todo app at all?* Answer: **Capture → View → Complete**. Everything else consciously cut.
- **PRD** — formalized the three features plus the in-memory, single-session constraint as
  deliberate, accepted limits.
- **Architecture** — chose the **Node.js CLI** modality, a swappable `add`/`list`/`complete`
  **store seam** (so a future file-backed store drops in cleanly), and a **"never crash"**
  error contract (errors to stderr, non-zero exit, no stack traces).
- **Epics** — decomposed into **one epic, five stories**, with a clean FR coverage map
  (FR1→1.1, FR2→1.2, FR3→1.3).

A notable mid-planning resolution: task reference switched from list-position to **by-ID**
(2026-06-04), overriding the earlier default.

## The build — Epic 1: The Capture → View → Complete Loop

Built **test-first (RED→GREEN)** on every slice, one commit per story:

| Story | What shipped |
|-------|--------------|
| 1.0 | Zero-dependency ESM Node scaffold, `node --test` wired |
| 1.1 | `add` — capture non-empty text, reject blanks |
| 1.2 | `list` — checkbox render `[ ]`/`[x]`, struck-through when done |
| 1.3 | `done <id>` — complete by ID, idempotent, silent no-op on miss |
| 1.4 | CLI entrypoint dispatching argv, end-to-end smoke test |

**Final artifact:** `todo add <text>` · `todo list` · `todo done <id>` — a zero-dependency,
in-memory ESM CLI exercising the full Capture → View → Complete loop.

## How it landed

- ✅ **29 tests passing**, exit 0, zero flaky
- ✅ **0 runtime + 0 dev dependencies** — held start to finish
- ✅ **8 commits**, one per story; clean, readable history
- ✅ Code review: **Approve**, 1 Low finding (symlinked-bin main-module guard), fixed

## The two lessons worth keeping

1. **Spec drift mid-build.** `architecture.md` and `epics.md` were revised to the checkbox
   View format *after* Story 1.2 was already built in the old strike-through style. The
   mismatch surfaced only at review and needed a reconciliation commit.
   → *Action: diff planning artifacts against HEAD before building each story.*
2. **Review caught what tests missed.** All 29 tests passed, but none exercised the symlinked
   `todo` bin, hiding a main-module-guard bug.
   → *Action: smoke-test the linked bin if `npm link` is in scope.*

## Status: done — by design

Epic 1 is genuinely complete (5/5 stories, retrospective done, working tree clean).
**No next epic** — the scope was deliberately this single loop. The one grounded future move,
already recorded in the architecture, is swapping the in-memory store for file persistence
*behind the existing seam* — a teaching demonstration of how a clean architecture decision
absorbs change.

---

*Source artifacts: `_bmad-output/planning-artifacts/` (brief, PRD, architecture, epics,
readiness report) and `_bmad-output/implementation-artifacts/` (story files, sprint status,
Epic 1 retrospective).*

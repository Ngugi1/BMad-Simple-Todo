# simple-todo — Token Budget

**Status:** planning artifact · **Created:** 2026-06-04 · **Project:** simple-todo (BMad Method demo)

This is the **cost/expense budget** for building simple-todo. Because the build is
AI-assisted, **the unit of expense is Claude tokens — not hours, not dollars, not story
points.** Calendar time was deliberately dropped as meaningless for an AI-assisted build
(see [implementation-flow](implementation-flow.md)); tokens are the metric that replaces it.

Estimates are **rough order-of-magnitude** for an agentic implementation session per story
(input + output tokens combined), not precise meter readings. They will be reconciled
against actuals after the build.

## Estimation basis

- **Model:** Claude (Opus-class), driving an agentic test-first loop (red → green per command).
- **Counted:** all tokens in the implementation loop — reading planning artifacts as context,
  writing the test, writing the implementation, running tests, and iterating — input + output.
- **Assumed on:** prompt caching (cached context is still counted, just cheaper per token).
- **Scope:** the four implementation stories in [epics.md](../_bmad-output/planning-artifacts/epics.md).
  Planning-phase tokens (brief → PRD → architecture → epics) are already spent and are not
  re-budgeted here.
- **Per story** assumes a roughly fresh context primed with the relevant story + Store seam.

## Per-story budget

| Story | Task | Expected tokens | Range |
|-------|------|----------------:|-------|
| 1.1 | Capture a task — Store seam + `add`, test-first (also bootstraps project + test harness) | **65k** | 50k–80k |
| 1.2 | View all tasks — `list`, struck-through completes, empty-state | **35k** | 25k–45k |
| 1.3 | Complete a task by ID — `complete`, idempotent + not-found no-op edge cases | **45k** | 35k–60k |
| 1.4 | Run the loop from the CLI — `argv` dispatch entrypoint + end-to-end smoke test | **60k** | 45k–75k |
| | **Total (implementation)** | **~205k** | **155k–260k** |

### Why the per-story numbers differ

- **1.1 is the heaviest** despite being conceptually small: it bootstraps the project
  (package layout, test runner) and establishes the Store seam every later story reuses.
- **1.2 is the lightest:** one read-only operation on an existing seam, few edge cases.
- **1.3 carries edge-case weight:** idempotent re-complete and silent not-found each need a
  test and a guard.
- **1.4 is integration-heavy:** argv parsing, dispatch wiring, and a full add→list→done→list
  smoke run that exercises every prior story.

## Caveats (no silent caps)

- These are estimates, not commitments. A single failed test-and-retry cycle can swing a
  story by 10–20k tokens; a clean first pass can come in under the low end.
- Ranges are ±~25% around the point estimate to reflect agentic-loop variance.
- If a story balloons past its high-end range, that is a signal to re-scope it — escalate via
  `correct course` rather than silently absorbing the overage.

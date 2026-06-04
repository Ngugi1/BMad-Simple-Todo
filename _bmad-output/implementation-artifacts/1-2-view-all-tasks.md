# Story 1.2: View all tasks

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Sam, the builder/demonstrator,
I want to see all tasks in the Store as a list,
so that captured tasks become recallable and the loop is observable.

## Acceptance Criteria

1. **List returns every Task, rendered as a checkbox + id + text.** Given a Store containing one or more Tasks, when `list` is called, then every Task is returned (including completed ones), **and** each line renders as `[ ] <id>. <text>` for open tasks and `[x] <id>. <text>` for completed tasks (text struck-through). The `[ ]`/`[x]` checkbox is the completion signal — no `(done)` suffix. [Source: epics.md#Story-1.2; PRD#FR-2]

2. **Empty Store gives a clear "no tasks" indication, not an error.** Given an empty Store, when `list` is called, then a clear "no tasks" indication is returned, not an error. [Source: epics.md#Story-1.2; PRD#FR-2]

## Tasks / Subtasks

- [x] **Task 1 (RED): Failing tests for `store.list()`** (AC: #1, #2)
  - [x] Extend `test/store.test.js` (additive — keep the existing 5 `add` tests intact). [Source: Story 1.1 File List]
  - [x] Test: a fresh `createStore()` → `list()` returns an empty array (`assert.deepEqual(store.list(), [])`).
  - [x] Test: after `add('a')` and `add('b')`, `list()` returns both Tasks in insertion order: `[{id:1,text:'a',done:false},{id:2,text:'b',done:false}]`.
  - [x] Test: `list()` returns a **copy** — mutating the returned array (e.g. `.push(...)` or `.pop()`) does NOT change what a subsequent `list()` returns. (Protects the store seam.) [Source: architecture.md#Architectural-Boundaries — state touched only through the seam]
  - [x] Run `npm test`; confirm the new `list` tests **fail** (method doesn't exist yet).
- [x] **Task 2 (GREEN): Implement `store.list()`** (AC: #1)
  - [x] In `src/store.js`, add a `list()` function that returns a shallow copy of the internal `tasks` array (`return [...tasks];`). Add it to the returned object: `return { add, list };`. Do not change `add` or any existing behavior. [Source: architecture.md#Structure-Patterns]
  - [x] Run `npm test`; confirm all `store.test.js` tests pass.
- [x] **Task 3 (RED): Failing tests for `renderList()`** (AC: #1, #2)
  - [x] Create `test/render.test.js`. Import `renderList` from `../src/render.js`.
  - [x] Test (empty): `renderList([])` returns the no-tasks indication string `"No tasks."` (exact). [Source: AC#2]
  - [x] Test (open tasks, plain): `renderList([{id:1,text:'a',done:false},{id:2,text:'b',done:false}])` returns `"[ ] 1. a\n[ ] 2. b"` (one task per line, `"[ ] <id>. <text>"`, no trailing newline). [Source: architecture.md#Format-Patterns]
  - [x] Test (completed, plain fallback): `renderList([{id:1,text:'done thing',done:true}])` returns `"[x] 1. ~~done thing~~"` — `[x]` checkbox plus plain-text strike-through when ANSI is off. [Source: architecture.md#Frontend-Architecture — plain fallback]
  - [x] Test (completed, ANSI): `renderList([{id:1,text:'x',done:true}], { ansi: true })` prefixes the `[x]` checkbox and wraps the text in the ANSI strike-through SGR sequence: `"[x] 1. [9mx[0m"`. [Source: architecture.md#Frontend-Architecture — ANSI strike-through]
  - [x] Test (mixed): an open + a completed task render correctly together on their own lines.
  - [x] Run `npm test`; confirm the render tests **fail** (`render.js` doesn't exist yet).
- [x] **Task 4 (GREEN): Implement `src/render.js`** (AC: #1, #2)
  - [x] Create `src/render.js` exporting `renderList(tasks, { ansi = false } = {})`. [Source: architecture.md#render.js]
  - [x] If `tasks` is empty → return `"No tasks."`. [Source: AC#2]
  - [x] Otherwise map each task to a line `"<checkbox> <id>. <renderedText>"` (checkbox `[ ]` open / `[x]` done) and join with `"\n"` (no trailing newline). Open task → `text` unchanged. Completed task → strike-through applied to the **text**: ANSI `[9m${text}[0m` when `ansi` is true, else plain `~~${text}~~`. [Source: architecture.md#Format-Patterns; #Frontend-Architecture]
  - [x] `renderList` is a **pure function**: it does NOT read `process.stdout`, does NOT print, and does NOT call `process.exit`. The caller (entrypoint, Story 1.4) decides `ansi` from `process.stdout.isTTY`. [Source: architecture.md#Process-Patterns; #Enforcement-Guidelines]
  - [x] Run `npm test` until all tests pass.
- [x] **Task 5 (REFACTOR): Tidy** (AC: #1, #2)
  - [x] Keep the strike-through codes as named module-level constants (`UPPER_SNAKE`, e.g. `ANSI_STRIKE_ON`/`ANSI_STRIKE_OFF`) rather than inline magic strings. Re-run `npm test` to confirm green.

## Dev Notes

### Scope of THIS story (read first)

This story delivers **View**: `store.list()` plus the rendering layer `src/render.js`. It does **NOT** implement `complete`, and it does **NOT** create `bin/todo.js` or do any terminal printing — those are Stories 1.3 (Complete) and 1.4 (CLI). `renderList` returns a *string*; nothing in this story writes to stdout. [Source: epics.md Epic-1 ordering; PRD#7-Counter-metric]

**Why we can build & test struck-through rendering before `complete` exists:** `renderList` is a pure function over a `tasks` array. The completed-task tests construct a `{ ...done: true }` task literal directly and pass it to `renderList` — no `store.complete` needed. Story 1.3 will simply let the store *produce* `done: true` tasks; rendering is already done here. [Source: architecture.md#Frontend-Architecture]

### Files this story touches

| File | Change | Notes |
|------|--------|-------|
| `src/store.js` | **UPDATE** | Add `list()`; export `{ add, list }`. Preserve `add` exactly. |
| `src/render.js` | **NEW** | `renderList(tasks, { ansi })` → string |
| `test/store.test.js` | **UPDATE** | Append `list` tests; keep the 5 existing `add` tests |
| `test/render.test.js` | **NEW** | render unit tests |

Do not create or modify any other files.

### Current state of `src/store.js` (the UPDATE target)

```js
export function createStore() {
  const tasks = [];
  let nextId = 1;
  function add(text) { /* validates, mints id, pushes, returns task */ }
  return { add };
}
```

- **What this story changes:** add a `list()` closure that returns `[...tasks]`; change the final line to `return { add, list };`.
- **What MUST be preserved:** `add`'s validation (throws `ValidationError` before minting), the sequential `nextId` counter, the private `tasks`/`nextId` (factory isolation), and the canonical Task shape. Do not refactor `add`. [Source: src/store.js as of Story 1.1]

### Architecture rules this story MUST follow (guardrails)

- **Glossary verb is exact:** the store method is `list` — never `getAll`, `getTasks`, `all`, etc. [Source: architecture.md#Naming-Patterns]
- **Single rendering authority:** the `"<id>. <text>"` line format and strike-through live **only** in `src/render.js`. No command or other module formats list output inline. [Source: architecture.md#Format-Patterns]
- **`list()` returns a copy**, so callers can't mutate the store's internal array through the returned reference — the only way to change state is via the seam (`add`/`complete`). [Source: architecture.md#Architectural-Boundaries]
- **Completion signal = `[ ]`/`[x]` checkbox** prefix, with struck-through text on done tasks as a secondary cue (PRD §4.3: completion is visually signalled). This story renders it but cannot yet *set* `done` via the store — that's 1.3. **Decision:** no `(done)` suffix; the checkbox is the signal (keeps it minimal per the counter-metric). [Source: PRD#4.3; architecture.md#Frontend-Architecture]
- **Pure render, no I/O:** `renderList` never touches `process.stdout`/`process.exit`/`console`. TTY detection is the entrypoint's job in Story 1.4 (it will pass `ansi: process.stdout.isTTY`). [Source: architecture.md#Process-Patterns]
- **ESM, lowercase files, `camelCase` functions, `UPPER_SNAKE` constants. Zero dependencies** — no `chalk`/`ansi-styles`; ANSI codes are tiny string literals. [Source: architecture.md#Naming-Patterns; #Selected-Starter]

### Technical specifics — ANSI strike-through

- The strike-through is ANSI SGR code **9** (crossed-out): open `[9m`, reset `[0m`. Test the exact bytes with `assert.equal(renderList([{id:1,text:'x',done:true}], {ansi:true}), '1. [9mx[0m')`.
- ANSI code 9 isn't universally rendered by every terminal, which is exactly why the plain `~~text~~` fallback exists for non-TTY output. No dependency needed — do **not** add `chalk`. [Source: architecture.md#Frontend-Architecture; zero-dependency rule]

### Testing standards & `node:test` specifics

- Add tests with the same conventions as `test/store.test.js`: `import { test } from 'node:test'; import assert from 'node:assert/strict';`. Each store test builds its own `createStore()`.
- `renderList` tests need no store — pass task literals directly.
- `node --test` auto-discovers `test/*.test.js`; the new `test/render.test.js` is picked up with no config.
- Full suite must stay green: the 5 existing `add` tests + new `list` tests + new render tests. [Source: architecture.md#Testing-Framework]

### Previous story intelligence (Story 1.1)

- Established and working: factory `createStore()` with private `tasks`/`nextId`; `add` returns the created Task; `ValidationError` in `src/errors.js`; `makeTask` in `src/task.js`. Tests use `node:assert/strict` and per-test stores. Suite is green (5/5). Follow these same patterns. [Source: 1-1-capture-a-task.md Completion Notes]
- Zero-dependency, ESM, Node v22.14.0 local (targets 24.x) — all carried forward unchanged.

### Git intelligence

- Single commit `e53e166` (Story 1.0 scaffold). Story 1.1's `src/`+`test/` are implemented but not yet committed — build on the working tree as-is. No conflicting patterns.

### Project Structure Notes

- All paths match the architecture tree (`src/render.js`, extend `src/store.js`, `test/render.test.js`). No variance.
- `test/store.test.js` grows additively across stories (list now, complete in 1.3) — do not restructure existing tests.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.2-View-all-tasks]
- [Source: _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md#FR-2] — view all; empty list is valid non-error
- [Source: _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md#4.3] — strike-through is the completion signal
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture] — list line format, ANSI strike-through + plain fallback, example output
- [Source: _bmad-output/planning-artifacts/architecture.md#Format-Patterns] — single render.js owns line format
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure-Patterns] — store seam, list returns tasks
- [Source: _bmad-output/implementation-artifacts/1-1-capture-a-task.md] — store/test patterns to follow

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m] (Opus 4.8, 1M context)

### Debug Log References

- RED: appended 3 `list` tests to `test/store.test.js` and created `test/render.test.js` (5 tests) → `npm test` showed 4 failures (render module missing, `list` undefined), 5 prior `add` tests still passing.
- GREEN: added `list()` to `src/store.js` and created `src/render.js` → `npm test` → 13 pass / 0 fail, exit 0.

### Completion Notes List

- **`store.list()`**: returns a shallow copy (`[...tasks]`) of tasks in insertion order; mutating the returned array can't reach into the store (seam protected). `add` unchanged; store now returns `{ add, list }`.
- **`src/render.js`** (`renderList(tasks, { ansi = false } = {})`): pure function, the single authority for list formatting. Empty → `"No tasks."`. Otherwise one line per task `"<id>. <text>"`, joined with `\n`, no trailing newline. Completed tasks struck-through on the text: ANSI SGR 9 (`\x1b[9m…\x1b[0m`) when `ansi:true`, plain `~~text~~` fallback otherwise. Strike codes are named module constants. No `console`/`process.stdout`/`process.exit` — TTY decision deferred to the entrypoint (Story 1.4).
- Decision recorded in story: the `[ ]`/`[x]` checkbox is the completion signal (no `(done)` suffix), with struck-through text on done tasks, per the revised architecture/epics + PRD §4.3.
- Verified struck-through rendering works before `complete` exists by passing `done:true` task literals to `renderList` (pure-function testing).
- Zero dependencies added (no chalk); ESM throughout. No regressions — all 5 prior `add` tests still pass.
- ACs satisfied: AC#1 (list returns all tasks; render shows id+text, completed struck-through) and AC#2 (empty store → "No tasks.", not an error).

### File List

- `src/store.js` (modified) — added `list()`; exports `{ add, list }`
- `src/render.js` (new) — `renderList(tasks, { ansi })` → string; sole list-formatting authority
- `test/store.test.js` (modified) — +3 `list` tests (empty, order, copy-safety)
- `test/render.test.js` (new) — 5 render tests (empty, open, plain strike, ANSI strike, mixed)

### Change Log

- 2026-06-04 — Story 1.2 implemented: `store.list()` + `src/render.js` (View), test-first. 13 tests green (5 add, 3 list, 5 render), exit 0. Status → review.
- 2026-06-04 — Reconciled View to the revised checkbox list format (`[ ] <id>. <text>` / `[x] <id>. <text>`, struck-through done text) after architecture.md/epics.md were updated. Updated `render.js` + `render.test.js` + AC#1; 13 tests still green, exit 0.

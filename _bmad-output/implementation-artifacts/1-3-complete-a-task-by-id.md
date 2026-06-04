# Story 1.3: Complete a task by ID

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Sam, the builder/demonstrator,
I want to mark a specific task done by its ID,
so that the list becomes a list and not just a notepad — the app's defining verb.

## Acceptance Criteria

1. **Completing a known ID sets done=true; the Task stays in the Store and still appears in `list`, struck-through.** Given a Store containing a Task with a known ID, when `complete` is called with that ID, then the target Task's done-state becomes `true`, **and** the Task remains in the Store and continues to appear in `list()` (now rendered struck-through by `render.js`). [Source: epics.md#Story-1.3; PRD#FR-3; PRD#4.3]

2. **Re-completing an already-complete Task is an idempotent no-op.** Given a Task already complete, when `complete` is called again with its ID, then done-state stays `true` and no error is raised — the call is idempotent. [Source: epics.md#Story-1.3; PRD#FR-3; PRD#9-Assumptions]

3. **Completing an ID that matches no Task is a safe, silent no-op.** Given an ID that matches no Task in the Store, when `complete` is called with that ID, then nothing in the Store changes and no error is surfaced — the domain returns `null` (it does NOT throw). [Source: epics.md#Story-1.3; PRD#FR-3; architecture.md#Process-Patterns]

## Tasks / Subtasks

- [x] **Task 1 (RED): Failing tests for `store.complete(id)`** (AC: #1, #2, #3)
  - [x] Extend `test/store.test.js` (additive — keep the existing 8 tests intact: 5 `add`, 3 `list`). [Source: 1-2-view-all-tasks.md File List]
  - [x] Test (happy path): after `add('a')`, `complete(1)` sets the task's `done` to `true`; `list()` afterwards returns `[{ id:1, text:'a', done:true }]`. (Verifies state is observable through the seam.) [Source: AC#1]
  - [x] Test (return value on success): `complete(1)` returns the completed Task object (`{ id:1, text:'a', done:true }`) so the entrypoint can confirm the action. [Source: architecture.md#Process-Patterns — store signals via return]
  - [x] Test (only the target changes): with two tasks added, `complete(2)` leaves task 1 `done:false` and sets only task 2 `done:true`.
  - [x] Test (idempotent): calling `complete(1)` twice keeps `done:true`, raises no error, and the second call still returns the task. [Source: AC#2]
  - [x] Test (unknown id → null no-op): on a store with one task, `complete(999)` returns `null` and `list()` is unchanged (task still `done:false`). [Source: AC#3]
  - [x] Test (unknown id does NOT throw): `assert.doesNotThrow(() => store.complete(999))`. [Source: architecture.md#Process-Patterns — unknown id returns null, never throws]
  - [x] Run `npm test`; confirm the new `complete` tests **fail** (method doesn't exist yet) while the 8 existing tests still pass.
- [x] **Task 2 (GREEN): Implement `store.complete(id)`** (AC: #1, #2, #3)
  - [x] In `src/store.js`, add a `complete(id)` closure: `const task = tasks.find((t) => t.id === id); if (!task) return null; task.done = true; return task;`. [Source: architecture.md#Data-Architecture; #Process-Patterns]
  - [x] Add it to the returned object: `return { add, list, complete };`. Do NOT change `add` or `list` or any existing behavior. [Source: architecture.md#Structure-Patterns]
  - [x] Run `npm test`; confirm ALL tests pass (8 existing + new `complete` tests), exit 0.
- [x] **Task 3 (REFACTOR): Tidy** (AC: #1, #2, #3)
  - [x] Confirm `complete` reads cleanly (single `find`, early `return null`, in-place `done = true`). No extra abstraction. Re-run `npm test` to confirm green.

## Dev Notes

### Scope of THIS story (read first)

This story delivers **Complete** at the domain layer only: add `store.complete(id)` to the existing store factory. It does **NOT** create `bin/todo.js`, does **NOT** print anything, and does **NOT** modify `src/render.js` — rendering of completed tasks (strike-through) was already built in Story 1.2 and is exercised here simply by `complete` producing `done:true` tasks. The CLI wiring that turns `todo done <id>` into a `complete` call (incl. parsing the `<id>` string to a number and the unknown/non-numeric notice) is **Story 1.4**. [Source: epics.md Epic-1 ordering; architecture.md#Implementation-Sequence]

### ⚠️ Do NOT touch rendering (cross-story note)

`src/render.js` is out of scope for 1.3. Note that the **render format spec was just revised** (architecture.md §Frontend / §Format-Patterns) from `"<id>. <text>"` to a checkbox form — open `[ ] <id>. <text>`, done `[x] <id>. <text>` (text struck-through, no `(done)` suffix). The current `render.js` still emits the old `"<id>. <text>"` format, so **that mismatch is a Story 1.2 review finding**, to be fixed under 1.2 — NOT here. Story 1.3 must leave `render.js` and `test/render.test.js` untouched. [Source: implementation-readiness-report-2026-06-04.md REC-1; epics.md#Story-1.2]

### Files this story touches

| File | Change | Notes |
|------|--------|-------|
| `src/store.js` | **UPDATE** | Add `complete(id)`; export `{ add, list, complete }`. Preserve `add` and `list` exactly. |
| `test/store.test.js` | **UPDATE** | Append `complete` tests; keep all 8 existing tests (5 `add`, 3 `list`). |

Do not create or modify any other files. In particular: no `bin/`, no `render.js`, no `task.js`, no `errors.js`.

### Current state of `src/store.js` (the UPDATE target)

```js
export function createStore() {
  const tasks = [];
  let nextId = 1;
  function add(text) { /* validates → throws ValidationError; mints id; pushes; returns task */ }
  function list() { return [...tasks]; }   // shallow copy; task object refs are shared
  return { add, list };
}
```

- **What this story changes:** add a `complete(id)` closure and change the final line to `return { add, list, complete };`.
- **What MUST be preserved:** `add` (validation-before-mint, `nextId` counter, no id gap on reject), `list` (returns a shallow copy), the private `tasks`/`nextId` (factory isolation), and the canonical Task shape `{ id, text, done }`. Do not refactor `add` or `list`. [Source: src/store.js as of Story 1.2]

### How `complete` mutates and why `list` reflects it

- `list()` returns `[...tasks]` — a copy of the **array**, but the **task objects are shared references**. So `complete` mutating `task.done = true` on the stored object is correctly observed by any subsequent `list()`. This is intended: mutating `done` via the `complete` seam is the *only* sanctioned way to change a task's state. [Source: architecture.md#Architectural-Boundaries; #Structure-Patterns]
- The Story 1.2 "list returns a copy" test only asserts that mutating the returned **array** (e.g. `.pop()`) can't change the store — it does not require deep immutability, so no deep clone is needed and that test stays green.

### Architecture rules this story MUST follow (guardrails)

- **Glossary verb is exact:** the store method is `complete` — never `markDone`, `done`, `finish`, `setComplete`, etc. [Source: architecture.md#Naming-Patterns; #Enforcement-Guidelines]
- **Unknown id returns `null`, never throws.** Unknown/not-found is a *defined no-op* per the PRD, distinct from `add`'s `ValidationError`. Do not throw, do not print, do not `process.exit`. [Source: architecture.md#Process-Patterns — "store.complete(unknownId) returns null (not a throw)"; PRD#4.3]
- **Domain signals, it does not print.** `complete` returns a value (task or `null`); the entrypoint (Story 1.4) decides what to print and which exit code to set. No `console.*` here. [Source: architecture.md#Process-Patterns; #Enforcement-Guidelines]
- **Id matching is strict on numbers.** Store ids are numbers (`makeTask` mints numeric ids). `complete` matches with `t.id === id`; passing a string like `'1'` will not match (returns `null`). Parsing the CLI string argument to a number is the **entrypoint's** job in Story 1.4 — do not add coercion to the store. [Source: architecture.md#Data-Architecture; #API-&-Communication-Patterns]
- **ESM, lowercase files, `camelCase` functions. Zero dependencies.** No new packages. [Source: architecture.md#Naming-Patterns; #Selected-Starter]
- **Completion is one-directional (v1):** there is no `uncomplete`/toggle — do not add one. [Source: PRD#5-Non-Goals]

### Technical specifics

- Minimal, idiomatic implementation (no need for more):
  ```js
  function complete(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return null;          // unknown id → safe, silent no-op
    task.done = true;                // idempotent: setting true again is harmless
    return task;
  }
  ```
- Idempotency falls out naturally: re-running `task.done = true` on an already-true task changes nothing and returns the same task — no special-casing required.

### Testing standards & `node:test` specifics

- Follow `test/store.test.js` conventions exactly: `import { test } from 'node:test'; import assert from 'node:assert/strict';`. Each test builds its own `createStore()` (factory isolation — no shared state). [Source: 1-2-view-all-tasks.md; architecture.md#Structure-Patterns]
- Append the new `complete` tests to `test/store.test.js`; do not restructure or rename existing tests. `node --test` auto-discovers `test/*.test.js`. [Source: architecture.md#Testing-Framework]
- Full suite must end green: 5 `add` + 3 `list` + new `complete` tests, exit 0.

### Previous story intelligence (Stories 1.1 & 1.2)

- Established and green (13 tests at end of 1.2): factory `createStore()` with private `tasks`/`nextId`; `add` throws `ValidationError`; `list()` returns `[...tasks]`; `makeTask` in `src/task.js`; `renderList` in `src/render.js` already renders `done:true` as struck-through. Build on this working tree as-is. [Source: 1-1-capture-a-task.md; 1-2-view-all-tasks.md Completion Notes]
- Strike-through is the completion signal, no `(done)` suffix — already implemented in render. Story 1.3 only needs to *produce* `done:true`. [Source: 1-2-view-all-tasks.md]
- Zero-dependency, ESM, Node v22.14.0 local (targets 24.x). Carry forward unchanged.

### Git intelligence

- Commits so far: `e53e166` (Story 1.0 scaffold). Stories 1.1 & 1.2 `src/`+`test/` are implemented in the working tree but **not yet committed** — extend the working tree directly; expect `src/store.js` to already contain `add` + `list`. No conflicting patterns to reconcile. [Source: git log]

### Project Structure Notes

- All paths match the architecture tree — only `src/store.js` (extend) and `test/store.test.js` (append) change. No new files, no variance. [Source: architecture.md#Complete-Project-Directory-Structure]
- `test/store.test.js` grows additively across stories (add → list → complete); do not restructure the existing tests.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.3-Complete-a-task-by-ID] — user story + 3 ACs
- [Source: _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md#FR-3] — complete by id; idempotent; complete-not-found is a silent no-op
- [Source: _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md#4.3] — completed Task stays visible, struck-through; strike-through is the signal
- [Source: _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md#5-Non-Goals] — no un-complete (one-directional)
- [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns] — complete returns null on unknown id, never throws; domain doesn't print
- [Source: _bmad-output/planning-artifacts/architecture.md#Data-Architecture] — numeric sequential id; complete sets done
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure-Patterns] — store seam; complete is the only sanctioned way to set done
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming-Patterns] — Glossary verb `complete` exactly
- [Source: _bmad-output/implementation-artifacts/1-2-view-all-tasks.md] — store/test/render patterns to follow; render already handles done:true

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m] (Opus 4.8, 1M context)

### Debug Log References

- RED: appended 6 `complete` tests to `test/store.test.js` → `npm test` showed 6 failures, 13 prior tests passing.
- GREEN: added `complete(id)` to `src/store.js` → `npm test` → 19 pass / 0 fail, exit 0.

### Completion Notes List

- Implemented `store.complete(id)`: `find` by numeric id → `null` if not found (safe silent no-op, no throw); otherwise `task.done = true` and return the task. Idempotent by construction (re-setting `true` is harmless).
- Store now returns `{ add, list, complete }`; `add` and `list` unchanged.
- Mutation is observed through `list()` because `list` copies the array but shares task object references — the only sanctioned way to flip `done` is via `complete`. The Story 1.2 "list returns a copy" test stays green (it only checks array-level immutability).
- No `render.js`/`task.js`/`errors.js`/`bin/` changes — strictly the domain `complete` slice. Numeric-id matching is strict (`===`); CLID string→number parsing is deferred to the entrypoint (Story 1.4).
- Zero dependencies; ESM; domain throws/returns but never prints. All 3 ACs satisfied.

### File List

- `src/store.js` (modified) — added `complete(id)`; exports `{ add, list, complete }`
- `test/store.test.js` (modified) — +6 `complete` tests (happy path, return value, target-only, idempotent, unknown-id null no-op, unknown-id doesn't throw)

### Change Log

- 2026-06-04 — Story 1.3 created (context engine). Status → ready-for-dev.
- 2026-06-04 — Story 1.3 implemented: `store.complete(id)` (Complete slice), test-first. 19 tests green (5 add, 3 list, 5 render, 6 complete), exit 0. Status → review.

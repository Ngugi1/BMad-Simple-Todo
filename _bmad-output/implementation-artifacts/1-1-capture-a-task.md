# Story 1.1: Capture a task

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Sam, the builder/demonstrator,
I want to add a task by supplying non-empty text,
so that the app has something to show — the single entry point of the whole loop.

## Acceptance Criteria

1. **Add creates a retained Task.** Given an empty in-memory Store exposing `add`, when `add` is called with non-empty text, then a new Task is created with that text and done-state `false`, **and** the Task is assigned a stable unique ID and is retained in the Store. [Source: epics.md#Story-1.1; PRD#FR-1]

2. **Empty/whitespace text is rejected.** Given the Store, when `add` is called with empty or whitespace-only text, then no Task is created and the input is rejected. [Source: epics.md#Story-1.1; PRD#FR-1; architecture.md#Process-Patterns — `store.add("")` throws `ValidationError`]

## Tasks / Subtasks

- [x] **Task 1 (RED): Write failing unit tests for the Task model and `add`** (AC: #1, #2)
  - [x] Create `test/store.test.js`. Import the test runner: `import { test } from 'node:test'` and `import assert from 'node:assert/strict'`. [Source: architecture.md#Testing-Framework]
  - [x] Each test creates its **own** store via `createStore()` — no shared module-level state (factory pattern guarantees isolation). [Source: architecture.md#Structure-Patterns]
  - [x] Test: `add("Write the demo script")` returns/holds a Task equal to `{ id: 1, text: "Write the demo script", done: false }` (exact field names, real boolean `false`). [Source: architecture.md#Format-Patterns]
  - [x] Test: a second `add(...)` yields `id: 2` — proves the store retains its monotonic `nextId` counter (retention of state). [Source: architecture.md#Data-Architecture]
  - [x] Test: `add("")`, `add("   ")`, and `add("\t\n")` each throw `ValidationError`, and the counter does **not** advance (next valid `add` still gets the next sequential id, no gap). [Source: architecture.md#Process-Patterns]
  - [x] Run `npm test` and confirm these tests **fail** (modules/functions don't exist yet) — this validates the tests before implementation. [Source: dev-story red-green cycle]
- [x] **Task 2 (GREEN): Implement the Task model** (AC: #1)
  - [x] Create `src/task.js` exporting `makeTask(id, text)` → `{ id, text, done: false }`. ESM `export`. No class needed — a plain factory returning the canonical shape. [Source: architecture.md#Project-Structure; architecture.md#Format-Patterns]
- [x] **Task 3 (GREEN): Implement `ValidationError`** (AC: #2)
  - [x] Create `src/errors.js` exporting a `ValidationError` class extending `Error`, with `name = "ValidationError"`. This is thrown by `store.add` on invalid text and later identified by the entrypoint (Story 1.4). Domain code throws — it does **not** print. [Source: architecture.md#Process-Patterns; architecture.md#errors.js]
- [x] **Task 4 (GREEN): Implement `createStore` with `add`** (AC: #1, #2)
  - [x] Create `src/store.js` exporting `createStore()`. It returns an object exposing **`add`** (this story only). It owns a private `tasks` array and a `nextId` counter starting at `1`. [Source: architecture.md#Data-Architecture; architecture.md#Structure-Patterns]
  - [x] `add(text)`: trim-check the input — if `text` is missing, empty, or whitespace-only, `throw new ValidationError("task text must not be empty")` **before** creating a Task or touching the counter. Otherwise mint the next id via the counter, build the Task with `makeTask(id, text)`, push it into `tasks`, and **return the created Task**. [Source: architecture.md#Data-Architecture; architecture.md#Process-Patterns]
  - [x] The store is the **sole ID minter** — `add` reads/increments `nextId` itself; never accept an id from the caller. [Source: architecture.md#Structure-Patterns — "Store ... the only ID minter"]
  - [x] Run `npm test` until all tests are **green**.
- [x] **Task 5 (REFACTOR): Tidy within the seam** (AC: #1, #2)
  - [x] Keep `tasks`/`nextId` private to the closure returned by `createStore` (no leaking internal arrays by reference where it would let callers mutate state outside the seam). Keep functions small and named per conventions. Re-run `npm test` to confirm still green.

## Dev Notes

### Scope of THIS story (read first — prevents the most likely mistake)

This story implements **only the `add` slice**: the Task model, the `ValidationError`, and `createStore()` exposing **`add`**. **Do NOT implement `list`, `complete`, `render.js`, or `bin/todo.js`** — those belong to Stories 1.2 (View), 1.3 (Complete), and 1.4 (CLI). `createStore` will *grow* `list` and `complete` in those later stories; in this story it returns an object with `add` only. Adding them now is scope creep against the project's scope-discipline counter-metric. [Source: epics.md#Epic-1 story ordering; PRD#7-Counter-metric]

**How retention is verified without `list`:** since `list` arrives in Story 1.2, AC #1's "retained in the Store" is proven here by (a) `add` returning the created Task and (b) a second `add` receiving `id: 2`, which can only happen if the store persists its counter/state across calls. Full `list`-based round-trip verification lands in 1.2 — that is intentional, not a gap.

### Current state of the codebase (from Story 1.0)

- The scaffold exists and is committed: `package.json` (`"type":"module"`, `"scripts.test":"node --test"`, zero deps) and `.gitignore`. There is **no** `src/`, `bin/`, or `test/` yet — this story creates the first `src/` files and the first test file. [Source: Story 1.0 completion; verified `ls` shows no src/bin/test]
- **Zero-dependency rule still holds:** do not `npm install` anything. Tests use the built-in `node:test` + `node:assert` only. [Source: architecture.md#Selected-Starter]
- **Runtime note carried from 1.0:** local machine runs **Node v22.14.0** (architecture targets 24.x LTS). Everything here — ESM, `node:test`, `node:assert/strict`, closures — is stable on v22.14.0. No `engines` field; no version pinning.

### Architecture rules this story MUST follow (guardrails)

- **Glossary verbs are exact.** The store method is named **`add`** — never `create`, `addTask`, `insert`, etc. (`list`/`complete` later, also verbatim.) [Source: architecture.md#Naming-Patterns]
- **Factory, not singleton.** `createStore()` returns a fresh object each call; state lives in the closure. **Never** a module-level `let tasks = []`. This is what keeps tests isolated. [Source: architecture.md#Structure-Patterns; #Anti-patterns]
- **Store is the source of truth and sole ID minter.** Commands/tests never mint a Task or id directly — only `store.add`. [Source: architecture.md#Structure-Patterns]
- **Canonical Task shape:** `{ id: number, text: string, done: boolean }` — these exact field names everywhere; `done` is a real boolean, never `0/1`. [Source: architecture.md#Format-Patterns]
- **ID strategy:** sequential integer from a store-held counter starting at `1`. [Source: architecture.md#Data-Architecture]
- **Domain signals, it does not print.** `add` **throws** `ValidationError` on bad input; it must **not** `console.log`/`console.error` and must **not** call `process.exit`. Printing and exit codes belong solely to the entrypoint (Story 1.4). [Source: architecture.md#Process-Patterns; #Enforcement-Guidelines]
- **ESM only.** `import`/`export`, no `require`. Lowercase filenames, `camelCase` functions/vars, `UPPER_SNAKE` for any module-level constant. [Source: architecture.md#Naming-Patterns]

### Files to create

| File | Purpose |
|------|---------|
| `src/task.js` | `makeTask(id, text)` → `{ id, text, done: false }` |
| `src/errors.js` | `ValidationError extends Error` (`name = "ValidationError"`) |
| `src/store.js` | `createStore()` → `{ add }`; owns `tasks[]` + `nextId` (starts 1); sole ID minter |
| `test/store.test.js` | unit tests for `add` (happy path, sequential ids, empty/whitespace rejection) |

Do not create any other files. [Source: architecture.md#Complete-Project-Directory-Structure]

### Testing standards & `node:test` specifics

- Tests live in `test/`, named `<unit>.test.js`, run with `node --test`. `node --test` auto-discovers `test/**` and `*.test.js` files — `test/store.test.js` will be picked up with no config. [Source: architecture.md#Structure-Patterns]
- Use `node:assert/strict` so equality is strict by default. Suggested imports:
  ```js
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { createStore } from '../src/store.js';
  import { ValidationError } from '../src/errors.js';
  ```
- Assert object shape with `assert.deepEqual(task, { id: 1, text: 'Write the demo script', done: false })`.
- Assert rejection with `assert.throws(() => store.add(''), ValidationError)` (works because `ValidationError` is a class). [Source: node:test/node:assert built-in APIs, stable Node 20+]
- Each `test(...)` creates its own `createStore()` — no shared fixtures, no `beforeEach` global state. [Source: architecture.md#Structure-Patterns]

### Project Structure Notes

- Aligns with the architecture tree: `src/task.js`, `src/errors.js`, `src/store.js`, `test/store.test.js` all match named locations. No variance.
- `test/store.test.js` is introduced here and **extended** (not replaced) in Stories 1.2 and 1.3 as `list` and `complete` are added — keep its structure additive.
- The store object returned by `createStore()` intentionally exposes only `add` in this story; later stories add `list`/`complete` to the same returned object. Plan the implementation so growing it is a one-line addition (e.g. `return { add };` → `return { add, list };`).

### Git intelligence

- Repo initialized in Story 1.0; single commit `e53e166` ("Initialize simple-todo Node.js project (Story 1.0)"). No code patterns to inherit yet beyond the ESM/zero-dep scaffold. Identity is set locally as `Sam <kelvinkim996@gmail.com>`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.1-Capture-a-task]
- [Source: _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md#FR-1] — add non-empty text; reject empty/whitespace
- [Source: _bmad-output/planning-artifacts/architecture.md#Data-Architecture] — Task shape, sequential id from counter
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure-Patterns] — factory store, sole ID minter, test isolation
- [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns] — domain throws `ValidationError`, never prints
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete-Project-Directory-Structure] — file locations
- [Source: _bmad-output/implementation-artifacts/1-0-initialize-the-node-project.md] — scaffold state, zero-dep rule, Node version note

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m] (Opus 4.8, 1M context)

### Debug Log References

- RED: wrote `test/store.test.js` (5 tests) → `npm test` failed with module-not-found (`../src/store.js`), confirming tests exercise real code.
- GREEN: created `src/task.js`, `src/errors.js`, `src/store.js` → `npm test` → 5 pass / 0 fail, exit 0.
- Verified exit code explicitly: `npm test` → exit 0.

### Completion Notes List

- Implemented the `add` slice test-first: Task model, `ValidationError`, and `createStore()` exposing `add`.
- `createStore()` is a factory holding a private `tasks` array and `nextId` counter (starts at 1) in its closure — no module-level singleton, so each test/store is isolated.
- `add(text)` validates **before** minting: empty/whitespace-only (or non-string) text throws `ValidationError` and the counter is untouched (verified: no id gap after a rejected add). Valid text mints the next sequential id, builds the Task via `makeTask`, stores it, and returns it.
- Store is the sole ID minter; `add` is the only store method exposed in this story. `list`/`complete`/`render.js`/`bin/todo.js` deliberately NOT implemented — they belong to Stories 1.2–1.4.
- Domain throws, never prints; no `console.*` or `process.exit` in any src file.
- Zero dependencies added; tests use built-in `node:test` + `node:assert/strict`.
- All ACs satisfied: AC#1 (creation + retention via returned Task and counter progression) and AC#2 (empty/whitespace rejection, no Task created).

### File List

- `src/task.js` (new) — `makeTask(id, text)` → `{ id, text, done: false }`
- `src/errors.js` (new) — `ValidationError extends Error`
- `src/store.js` (new) — `createStore()` → `{ add }`; private `tasks[]` + `nextId`; sole ID minter
- `test/store.test.js` (new) — 5 unit tests for `add` (happy path, sequential ids, empty/whitespace rejection, no-gap-on-reject)

### Change Log

- 2026-06-04 — Story 1.1 implemented: `add` slice (Task model, ValidationError, createStore with add), test-first. 5 tests green, exit 0. Status → review.

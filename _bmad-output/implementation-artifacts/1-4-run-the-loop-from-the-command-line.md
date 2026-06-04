# Story 1.4: Run the loop from the command line

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Sam, the builder/demonstrator,
I want a CLI entrypoint that dispatches `add` / `list` / `done` from argv,
so that the full Capture → View → Complete loop runs live in a demo.

## Acceptance Criteria

1. **argv is parsed and dispatched to the matching store operation; results print.** Given the store operations from Stories 1.1–1.3, when the CLI is invoked with `add <text>`, `list`, or `done <id>`, then argv is parsed and dispatched to the matching store operation and results print to the terminal. [Source: epics.md#Story-1.4; architecture.md#API-&-Communication-Patterns]

2. **End-to-end loop proven.** Given the wired CLI, when an end-to-end smoke run executes `add` → `list` → `done` → `list`, then the added task appears, then appears struck-through after completion — proving the loop end-to-end. [Source: epics.md#Story-1.4; docs/implementation-flow.md]

3. **"Never crash" error contract.** Given the wired CLI, when it is invoked with empty/whitespace `add` text, an unknown/non-numeric `done` id, or an unknown/missing command, then a clear one-line message is printed to **stderr** with a **non-zero exit code** and no stack trace; while successful commands print to **stdout** with **exit 0**. [Source: epics.md#Story-1.4; architecture.md#Process-Patterns]

## Tasks / Subtasks

- [x] **Task 1 (RED): Failing in-process tests for the dispatcher + end-to-end loop** (AC: #1, #2, #3)
  - [x] Create `test/cli.test.js`. Import the dispatcher: `import { execute } from '../bin/todo.js'` and `import { createStore } from '../src/store.js'`. [Source: architecture.md#Project-Structure]
  - [x] Test (end-to-end loop, AC#2): with ONE shared `createStore()`, run `execute(['add','Write','the','demo','script'], store)`, then `execute(['list'], store)` → out `"[ ] 1. Write the demo script"`, then `execute(['done','1'], store)`, then `execute(['list'], store)` → out `"[x] 1. ~~Write the demo script~~"`. All `code === 0`.
  - [x] Test (add success): `execute(['add','milk'], store)` returns `{ code: 0 }` and `out` contains the new task line `"[ ] 1. milk"`.
  - [x] Test (list empty): `execute(['list'], createStore())` → `{ code: 0, out: 'No tasks.' }`.
  - [x] Test (add empty → error contract): `execute(['add'], createStore())` → `code === 1` and non-empty `err` (the ValidationError message), `out === ''`.
  - [x] Test (done unknown id → no-op error): `execute(['done','999'], storeWithOneTask)` → `code === 1`, non-empty `err`, and the task stays `done:false`.
  - [x] Test (done non-numeric → error): `execute(['done','abc'], store)` → `code === 1`, non-empty `err` (never throws; treated as unknown id).
  - [x] Test (unknown/missing command → usage): `execute(['frobnicate'], store)` and `execute([], store)` → `code === 1`, `err` contains usage text.
  - [x] Run `npm test`; confirm the new `cli.test.js` tests **fail** (`bin/todo.js` / `execute` don't exist yet) while the existing 19 tests still pass.
- [x] **Task 2 (RED): Failing spawn-based tests for real process exit codes & streams** (AC: #1, #3)
  - [x] In `test/cli.test.js`, add `import { spawnSync } from 'node:child_process'`. Helper: `const runCli = (args) => spawnSync(process.execPath, ['bin/todo.js', ...args], { encoding: 'utf8' });` (runs from repo root; `process.execPath` is the current node). [Source: architecture.md#Development-Workflow]
  - [x] Test (success → stdout, exit 0): `runCli(['list'])` → `status === 0`, `stdout` contains `"No tasks."`, `stderr === ''`.
  - [x] Test (unknown command → stderr, non-zero, NO stack trace): `runCli(['frobnicate'])` → `status !== 0`, `stderr` matches `/usage/i`, `stdout === ''`, and `stderr` does **not** match `/\n\s*at\s+/` (no stack frames). [Source: AC#3 "no stack trace"]
  - [x] Test (empty add → stderr, non-zero): `runCli(['add'])` → `status !== 0`, `stderr` non-empty, `stdout === ''`.
  - [x] Run `npm test`; confirm these spawn tests **fail** until `bin/todo.js` exists.
- [x] **Task 3 (GREEN): Implement `bin/todo.js` (entrypoint + dispatcher)** (AC: #1, #2, #3)
  - [x] Create `bin/todo.js` with a `#!/usr/bin/env node` shebang. Imports: `createStore` from `../src/store.js`, `renderList` from `../src/render.js`, `ValidationError` from `../src/errors.js`. [Source: architecture.md#Requirements-to-Structure-Mapping]
  - [x] Export `execute(argv, store, { ansi = false } = {})` → returns `{ code, out, err }` (it never prints and never calls `process.exit` — this is what makes it testable in-process). It contains the **single try/catch**. Dispatch on `argv[0]`:
    - `add` → `const task = store.add(rest.join(' '))`; success → `{ code: 0, out: renderList([task], { ansi }), err: '' }`.
    - `list` → `{ code: 0, out: renderList(store.list(), { ansi }), err: '' }`.
    - `done` → parse `const id = Number(rest[0])`; `const task = Number.isInteger(id) ? store.complete(id) : null`; if `!task` → `{ code: 1, out: '', err: 'No task with id "<raw>".' }`; else `{ code: 0, out: renderList([task], { ansi }), err: '' }`.
    - default (unknown/missing) → `{ code: 1, out: '', err: USAGE }`.
    - `catch (e)`: `e instanceof ValidationError` → `{ code: 1, out: '', err: e.message }`; otherwise `{ code: 1, out: '', err: 'Unexpected error.' }` (friendly one-liner, **no** stack trace). [Source: architecture.md#Process-Patterns]
  - [x] Implement `main()`: create ONE store (`createStore()`), compute `ansi = process.stdout.isTTY === true`, call `execute(process.argv.slice(2), store, { ansi })`, write `out` to **stdout** (with trailing newline) and `err` to **stderr** (with trailing newline) — only if non-empty — then `process.exit(code)`. `main()` is the ONLY place that writes streams and sets the exit code. [Source: architecture.md#Process-Patterns — "No process.exit() scattered ... only the entrypoint"]
  - [x] Add a main-module guard so importing the file for tests does NOT execute `main()`: `import { fileURLToPath } from 'node:url';` then `if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();`. [Source: ESM entrypoint pattern]
  - [x] Define `const USAGE = 'Usage: todo <add <text> | list | done <id>>';` as a module constant (`UPPER_SNAKE`). [Source: architecture.md#Naming-Patterns]
  - [x] Run `npm test` until ALL tests pass (19 existing + new cli tests), exit 0.
- [x] **Task 4 (REFACTOR): Tidy + manual smoke** (AC: #1, #2, #3)
  - [x] Confirm no `console.*` calls (use `process.stdout.write`/`process.stderr.write` only in `main`); domain modules remain untouched. Re-run `npm test`.
  - [x] Manual smoke (document the output in Completion Notes): `node bin/todo.js list`, `node bin/todo.js add "demo"`, `node bin/todo.js done 1`, `node bin/todo.js bogus; echo $?`.

## Dev Notes

### ⭐ The critical design point — in-memory state does NOT survive across processes

The store is in-memory only (NFR1). So `node bin/todo.js add x` then `node bin/todo.js list` are **two separate processes**, each with a fresh empty store — the second prints "No tasks.". This is correct per the persistence non-goal, **not** a bug.

**Therefore the end-to-end loop (AC#2) is proven in a single process**, not by spawning separate commands. The implementation splits into:
- **`execute(argv, store, opts)`** — a pure-ish dispatcher returning `{ code, out, err }`; never prints, never exits. The smoke test calls it repeatedly **against one shared `store`**, so `add` → `list` → `done` → `list` accumulates state and proves the loop.
- **`main()`** — the thin process wrapper: one store, reads `process.argv`, writes streams, sets exit code. Only run when invoked directly (main-module guard).

Spawn-based tests (`spawnSync`) then verify the **real process contract** for single commands: exit codes, stdout-vs-stderr routing, and absence of a stack trace. Do **not** try to spawn `add` then `list` as separate processes expecting shared state — it won't, by design.

### Scope — what this story creates and what it must NOT touch

- **Creates exactly one file: `bin/todo.js`** (plus `test/cli.test.js`). [Source: architecture.md#Complete-Project-Directory-Structure]
- **Reuse, do not reimplement:** `createStore`/`add`/`list`/`complete` (`src/store.js`), `renderList` (`src/render.js`), `ValidationError` (`src/errors.js`). Do NOT add a second formatter, a second store, or duplicate validation. All list/task output MUST go through `renderList`. [Source: architecture.md#Enforcement-Guidelines]
- **No new dependencies** (no commander/yargs/chalk) — parse `process.argv` directly. [Source: architecture.md#Selected-Starter]
- **No persistence, no `uncomplete`, no extra commands** beyond `add`/`list`/`done`. [Source: PRD#5-Non-Goals]

### CLI verb vs store verb (don't get these wrong)

- The **CLI command is `done`**; it dispatches to the **store method `complete`**. The architecture command surface is `add <text>` · `list` · `done <id>`, while the store Glossary verbs are `add`/`list`/`complete`. Map `done` → `store.complete(id)`. [Source: architecture.md#API-&-Communication-Patterns; #Naming-Patterns]
- **`<id>` is a CLI string → parse to a number in the entrypoint** (`Number(rest[0])` + `Number.isInteger`). The store matches ids strictly (`===`) and does NOT coerce — non-numeric/unknown id ⇒ `store.complete` returns `null` ⇒ entrypoint prints a one-line notice to stderr and exits non-zero. The store never throws on a bad id. [Source: 1-3 Dev Notes; architecture.md#Process-Patterns]

### Error-handling contract (architecture "never crash")

| Invocation | Stream | Exit |
|------------|--------|------|
| `add <text>` (valid), `list`, `done <known id>` | stdout (rendered) | 0 |
| `add` with empty/whitespace text | stderr (ValidationError msg) | non-zero |
| `done <unknown/non-numeric id>` | stderr (one-line notice) | non-zero |
| unknown or missing command | stderr (USAGE) | non-zero |
| any unexpected error | stderr (friendly one-liner, **no stack trace**) | non-zero |

- The domain still **signals only** — `store.add` throws `ValidationError`, `store.complete` returns `null`. The **entrypoint is the only place that catches/prints/exits.** No `console.*`, no `process.exit` outside `main()`. [Source: architecture.md#Process-Patterns; #Enforcement-Guidelines]

### Current state of the modules this story wires (do not modify them)

```js
// src/store.js — createStore() => { add, list, complete }
//   add(text): throws ValidationError on empty/whitespace; mints numeric id; returns task
//   list(): returns [...tasks] (shallow copy; task refs shared)
//   complete(id): null if no match (no throw); else done=true; returns task
// src/render.js — renderList(tasks, { ansi=false }) => string
//   [] -> "No tasks."; else "<checkbox> <id>. <text>" per line; [ ]/[x]; done text struck-through
//   (ANSI SGR 9 on ansi:true, plain ~~text~~ otherwise)
// src/errors.js — ValidationError extends Error (name = "ValidationError")
```

[Source: src/store.js, src/render.js, src/errors.js as of Story 1.3]

### Expected dispatcher outputs (for the tests)

- `execute(['list'], freshStore)` → `{ code: 0, out: 'No tasks.', err: '' }`
- `execute(['add','milk'], freshStore)` → `{ code: 0, out: '[ ] 1. milk', err: '' }`
- after that store: `execute(['done','1'], store)` → `{ code: 0, out: '[x] 1. ~~milk~~', err: '' }`
- `execute(['done','999'], storeWith1Task)` → `{ code: 1, out: '', err: 'No task with id "999".' }`
- `execute(['add'], freshStore)` → `{ code: 1, out: '', err: <ValidationError message> }`
- `execute(['nope'], store)` / `execute([], store)` → `{ code: 1, out: '', err: USAGE }`

Note: `ansi` defaults to `false`, so in-process tests get the plain `~~ ~~` fallback (deterministic). `main()` passes `ansi: process.stdout.isTTY` so a real terminal gets ANSI strike-through.

### Testing standards & `node:test` specifics

- `test/cli.test.js` mixes two styles: **in-process** (`import { execute }`, deterministic, fast — covers the loop and all branches) and **spawn** (`spawnSync(process.execPath, ['bin/todo.js', ...])` — covers real exit codes/streams). [Source: architecture.md#Project-Structure — cli.test.js "smoke: spawn bin/todo.js ... + exit codes"]
- The main-module guard means importing `bin/todo.js` in tests will NOT run `main()` (so importing is side-effect free). Verify by the fact that in-process tests don't spawn a process or exit.
- Run from repo root: `npm test` → `node --test` auto-discovers `test/*.test.js` including the new `cli.test.js`. Full suite must end green (19 prior + new), exit 0. [Source: architecture.md#Testing-Framework]
- `spawnSync` uses `process.execPath` (absolute path to the running node) and relative `bin/todo.js`; the test process cwd is the repo root under `npm test`. [Source: Node child_process]

### Previous story intelligence (Stories 1.1–1.3)

- Green at 19 tests: `add`/`list`/`complete` all implemented and tested; `renderList` emits the checkbox format. Build the entrypoint on top — no domain changes needed. [Source: 1-1/1-2/1-3 Completion Notes]
- Patterns to mirror: ESM, `node:assert/strict`, per-test `createStore()`, named `UPPER_SNAKE` constants, domain throws/returns but never prints. [Source: prior stories]
- Zero-dependency, Node v22.14.0 local (targets 24.x). `process.stdout.isTTY`, `import.meta.url`, `fileURLToPath`, `spawnSync`, `process.execPath` are all stable on v22. Carry forward.

### Git intelligence

- Five commits, one per story so far (`e53e166` … `585c07f`). Stories 1.1–1.3 are committed; the working tree is clean. This story adds `bin/todo.js` + `test/cli.test.js` — the final piece. Commit as its own per-story commit when green. [Source: git log; [[one-commit-per-story]]]

### Project Structure Notes

- `bin/todo.js` matches the architecture tree exactly; `package.json` already declares `"bin": { "todo": "./bin/todo.js" }` (wired in Story 1.0) — this story finally creates the referenced file. No `package.json` change needed. [Source: architecture.md#Complete-Project-Directory-Structure; Story 1.0]
- After this story, the full FR→file mapping is satisfied: FR-1 `add`, FR-2 `list`+`render`, FR-3 `done`→`complete`, all reachable from `bin/todo.js`. [Source: architecture.md#Requirements-to-Structure-Mapping]

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.4-Run-the-loop-from-the-command-line] — 3 ACs
- [Source: _bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns] — CLI surface `add`/`list`/`done <id>`; error standard
- [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns] — entrypoint is the only try/catch + exit setter; never-crash; no stack trace
- [Source: _bmad-output/planning-artifacts/architecture.md#Requirements-to-Structure-Mapping] — bin/todo.js dispatch → store/render
- [Source: _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md#FR-1..FR-3] — feature behaviors
- [Source: docs/implementation-flow.md] — wire CLI entrypoint → end-to-end smoke (add → list → done)
- [Source: _bmad-output/implementation-artifacts/1-3-complete-a-task-by-id.md] — store API; id parsing is the entrypoint's job

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m] (Opus 4.8, 1M context)

### Debug Log References

- RED: wrote `test/cli.test.js` (in-process + spawn tests) → `npm test` failed (1 file error: `../bin/todo.js` missing), 19 prior tests passing.
- GREEN: created `bin/todo.js` (`execute` + `main` + main-guard) → `npm test` → 29 pass / 0 fail, exit 0.
- Manual smoke (each its own process; in-memory, so no cross-process state — by design):
  - `node bin/todo.js list` → `No tasks.` (exit 0)
  - `node bin/todo.js add "Write the demo script"` → `[ ] 1. Write the demo script` (exit 0)
  - `node bin/todo.js done 1` → `No task with id "1".` (exit 1 — fresh process, empty store)
  - `node bin/todo.js frobnicate` → `Usage: todo <add <text> | list | done <id>>` on stderr (exit 1)
  - `node bin/todo.js add` → `task text must not be empty` on stderr (exit 1)
- `grep console. bin/todo.js` → 0 matches (streams written only via process.stdout/stderr.write in main).

### Completion Notes List

- **`bin/todo.js`** is the entrypoint + dispatcher. `execute(argv, store, { ansi })` returns `{ code, out, err }`, contains the single try/catch, and never prints or exits — so the end-to-end loop is smoke-tested in one process against a shared store. `main()` is the only place that creates a store, writes streams, and sets the exit code; a main-module guard (`fileURLToPath(import.meta.url) === process.argv[1]`) keeps `import` side-effect-free for tests.
- CLI `done` maps to `store.complete`; `<id>` parsed via `Number()` + `Number.isInteger` in the entrypoint (store matches ids strictly, never coerces). Non-numeric/unknown id → one-line stderr notice, exit 1, no throw.
- Error contract verified: success → stdout exit 0; empty add (ValidationError), unknown/non-numeric done id, unknown/missing command → one-line stderr, non-zero exit; unexpected errors → friendly one-liner, never a stack trace (spawn test asserts no `at ` frames in stderr).
- Reused `createStore`/`renderList`/`ValidationError` — no new formatter, store, or validation; all output routed through `renderList`. Zero dependencies; `package.json` `bin` (wired in Story 1.0) now resolves to a real file.
- All 3 ACs satisfied. Full suite green (29 tests: 5 add, 3 list, 5 render, 6 complete, 10 cli).

### File List

- `bin/todo.js` (new) — CLI entrypoint: `execute(argv, store, {ansi})` dispatcher (single try/catch) + `main()` (one store, streams, exit code) + main-module guard
- `test/cli.test.js` (new) — 10 tests: in-process loop + branch coverage, plus spawn-based exit-code/stream/no-stack-trace checks

### Change Log

- 2026-06-04 — Story 1.4 implemented: `bin/todo.js` CLI entrypoint wiring the full Capture → View → Complete loop, test-first. 29 tests green, exit 0. Status → review.
- 2026-06-04 — Review fix (Low): main-module guard now `realpathSync(process.argv[1])`-compares so the symlinked `todo` bin (npm link) also runs `main()`. 29 tests still green, exit 0.

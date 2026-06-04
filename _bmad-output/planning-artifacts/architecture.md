---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-06-04'
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md
  - _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/.decision-log.md
  - _bmad-output/planning-artifacts/briefs/brief-simple-todo-2026-06-04/brief.md
  - docs/implementation-flow.md
  - _bmad-output/brainstorming/brainstorming-session-2026-05-20-1026.md
workflowType: 'architecture'
project_name: 'simple-todo'
user_name: 'Sam'
date: '2026-06-04'
earlyDecisions:
  - 'Interface modality = CLI (Node.js)'
  - 'State = in-memory store, swappable behind add/list/complete'
  - 'Task = text + boolean done-state'
  - 'Complete = strike-through, task stays visible'
  - 'Task-reference mechanism = by ID (resolved 2026-06-04, overrides earlier list-position default)'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

> **Cost metric note:** because this is an AI-assisted build, expense/cost is estimated in **Claude tokens, not calendar time**. Per-story token budgets live in [docs/token-budget.md](../../docs/token-budget.md).

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Three FRs over a single entity (Task = text + boolean done-state), each mapping to one CLI command:
- FR-1 Capture → `todo add <text>` — create a Task (done=false); reject empty/whitespace text.
- FR-2 View → `todo list` — render all Tasks; completed ones struck through; empty list is a valid state.
- FR-3 Complete → `todo done <id>` — set done=true; idempotent; unknown ID is a silent no-op.

**Non-Functional Requirements:**
No formal NFRs. The governing constraint is the opposite of most projects — a hard scope-discipline
counter-metric: do not add durability, features, or polish. Architecture must resist, not absorb, complexity.

**Scale & Complexity:**
- Primary domain: CLI / local Node.js (no network, no UI layer, no persistence layer)
- Complexity level: low (irreducible by design)
- Estimated architectural components: ~3 (CLI entrypoint, Task store, Task model)

### Technical Constraints & Dependencies

- Interface = Node.js CLI; state = in-memory only (non-durable by deliberate non-goal).
- Store is isolated behind an `add/list/complete` seam so file persistence is a later swap with no interface change.
- Task-reference = by ID (locked) → requires an ID-generation strategy and an unknown-ID no-op path.

### Cross-Cutting Concerns Identified

- **ID generation** — how each Task gets a stable, user-typeable identifier.
- **Input validation** — empty/whitespace task text rejected at the boundary.
- **Store seam** — the single abstraction that keeps in-memory-now / file-later cheap.

## Starter Template Evaluation

### Primary Technology Domain

CLI tool — local, single-process Node.js. No network, no UI rendering, no persistence layer.

### Starter Options Considered

- **oclif / CLI framework starter** — rejected: heavy plugin architecture for a 3-command tool; pure incidental complexity against the scope-discipline counter-metric.
- **commander 15.0.0** — excellent, widely used (ESM-only, needs Node ≥22.12). Rejected for v1: a dependency to parse three fixed subcommands; revisit only if the command surface grows.
- **Vanilla Node.js, zero-dependency (SELECTED)** — parse `process.argv` directly; built-in `node:test` for tests.

### Selected Starter: None (zero-dependency vanilla Node.js)

**Rationale for Selection:**
Three subcommands over an in-memory store need no framework. Vanilla keeps `dependencies` and
`devDependencies` empty, which is itself part of the demonstration (lean by construction). The store
seam (`add/list/complete`) — not a starter — is the architecture that matters here.

**Initialization Command:**

```bash
npm init -y
# then set in package.json: "type": "module", "bin": { "todo": "./bin/todo.js" }
# Node 24.x LTS; no runtime or test dependencies added.
```

**Architectural Decisions Provided (by choosing vanilla):**

**Language & Runtime:** JavaScript (ESM, `"type": "module"`), Node.js 24.x LTS. No TypeScript — a build step is unjustified at this size.

**Styling Solution:** N/A (CLI; plain stdout, ANSI strike-through for completed tasks).

**Build Tooling:** None. Run directly with `node`.

**Testing Framework:** Built-in `node:test` + `node:assert` — stable since Node 20, zero dependencies. Synchronous, isolated tests (reset the store per test).

**Code Organization:** `bin/todo.js` (argv parse → dispatch) · `src/store.js` (the `add/list/complete` seam) · `src/task.js` (Task model + ID) · `test/*.test.js`.

**Development Experience:** `node bin/todo.js <cmd>` to run; `node --test` to test. No hot-reload needed for a CLI.

**Note:** Project initialization (`npm init` + package.json wiring) should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Task identity = sequential integer ID from a store-held counter, surfaced in `list` output.
- Error handling = basic validation, fail soft — never crash; no stack traces reach the user.

**Important Decisions (Shape Architecture):**
- In-memory data model; store seam isolates `add/list/complete`.
- Output conventions: success → stdout/exit 0; errors → stderr/non-zero exit.

**Deferred / N/A (honestly not needed):**
- Database, migrations, caching — N/A (in-memory by design).
- Auth, security, encryption — N/A (local single-user CLI).
- API design, rate limiting, service comms — N/A (no network).
- Frontend/state management — N/A (stdout).
- Hosting, CI/CD, monitoring, scaling — N/A (runs locally via `node`).

### Data Architecture

- **Model:** `Task { id: number, text: string, done: boolean }`. Store holds an array + a
  monotonic `nextId` counter (starts at 1).
- **ID generation:** sequential integer from the counter, **surfaced in `list` output** so the user
  can reference it in `done <id>`. Chosen for human typeability at the CLI; zero-dependency. IDs reset
  per run — acceptable because state is in-memory. Caveat: not unique across sessions; revisit
  (→ `crypto.randomUUID`) only if persistence is ever added. The visible-ID-in-list is what makes
  by-ID reference usable at a CLI.
- **Validation:** task text must be non-empty/non-whitespace; rejected at the boundary before a Task
  is created.

### Authentication & Security

N/A — local, single-user, single-session CLI. No secrets, no network surface.

### API & Communication Patterns

N/A — no API. The only "interface" is the CLI command surface: `add <text>` · `list` · `done <id>`.

**Error handling standard (basic, fail-soft — never crash):**
- Empty/whitespace text on `add` → print a clear validation message to stderr, exit non-zero. No Task created.
- `done <id>` with a non-existent or non-numeric ID → no-op (per PRD); print a brief notice, exit non-zero. No throw.
- Unknown/missing command → print usage help to stderr, exit non-zero.
- No code path surfaces a raw stack trace to the user; unexpected errors are caught at the entrypoint
  and reported as a friendly one-line message.
- Success paths → stdout, exit 0.

### Frontend Architecture

N/A — CLI. `list` renders one Task per line as a **checkbox followed by the Task's sequential ID**:
open tasks `[ ]`, completed tasks `[x]`. The ID is shown so it's directly usable in `done <id>`.
Completed Tasks additionally get ANSI strike-through on the text (plain fallback when output is not
a TTY). The checkbox is the primary completion signal; no redundant `(done)` suffix.

Example:
```
  [ ] 1. Write the demo script
  [x] 2. ~~Buy coffee~~
  [ ] 3. Rehearse the walkthrough
```

### Infrastructure & Deployment

N/A — run directly with `node`. No build, no pipeline, no hosting. (CI is an optional later nicety,
explicitly out of scope for the demo.)

### Decision Impact Analysis

**Implementation Sequence:**
1. `npm init` + package.json wiring (first story).
2. Task model + ID counter (`src/task.js`).
3. Store seam `add/list/complete` (`src/store.js`).
4. CLI entrypoint: argv parse → dispatch + top-level error guard (`bin/todo.js`).
5. The three commands, each test-first.

**Cross-Component Dependencies:**
- ID generation lives in the store (owns the counter) — commands never mint IDs themselves.
- The entrypoint's top-level try/catch is what guarantees "never crash"; every command assumes it exists.

## Implementation Patterns & Consistency Rules

*Architecture style: a plain, direct, single-process design. No actor model, no message-passing —
the actor approach was considered and deliberately rejected as incidental complexity for a
synchronous, single-store CLI (consistent with the scope-discipline counter-metric).*

### Pattern Categories Defined

**Critical conflict points identified:** ~6 real fork points. Standard categories (database, API,
events, state management, loading states) are N/A by design.

### Naming Patterns

- **Language/module:** ES Modules (`import`/`export`), `"type": "module"`. No CommonJS.
- **Files:** lowercase, one concept per file — `bin/todo.js`, `src/task.js`, `src/store.js`,
  `src/render.js`, `test/<unit>.test.js`. No PascalCase filenames. No `src/actors/`.
- **Code:** `camelCase` for functions and variables, `UPPER_SNAKE` for module-level constants.
  Functions are verbs; the store's methods are exactly `add`, `list`, `complete` (matching the PRD
  Glossary verbatim — no synonyms like `create`/`getAll`/`markDone`).
- **Database/API naming:** N/A.

### Structure Patterns

- **Store is the single source of truth and the only ID minter.** Commands never create Tasks or
  IDs directly — they call `store.add(text)` / `store.list()` / `store.complete(id)`.
- **Store is a factory, not a module singleton:** `createStore()` returns a fresh store object.
  The entrypoint creates exactly one per process; each test creates its own — this keeps tests
  isolated with no shared global state.
- **Tests** live in `test/`, named `<unit>.test.js`, run with `node --test`. The store factory
  makes fixtures unnecessary.

### Format Patterns

- **Task shape (canonical):** `{ id: number, text: string, done: boolean }` — these exact field
  names everywhere. Booleans are real `true`/`false`, never `0/1`.
- **List rendering (one place):** a single `render.js` owns the line format `"[ ] <id>. <text>"` for
  open tasks and `"[x] <id>. <text>"` for done tasks, with strike-through applied to `text` when `done`
  (TTY) and a plain fallback. The `[ ]`/`[x]` checkbox is the completion signal — no `(done)` suffix.
  No command formats output inline.
- **API response wrappers / date formats:** N/A.

### Process Patterns — error handling ("never crash")

- **Domain layer signals, it does not print.** `store.add("")` (empty/whitespace) throws a
  `ValidationError`; `store.complete(unknownId)` returns `null` (not a throw — unknown ID is a
  defined no-op per the PRD).
- **The entrypoint is the only place that catches and prints.** `bin/todo.js` wraps dispatch in a
  single try/catch: known errors → one-line message to **stderr**, exit **1**; an unexpected error →
  friendly one-liner to stderr (never a raw stack trace), exit **1**. Success → stdout, exit **0**.
- **No `process.exit()` scattered through command code** — only the entrypoint sets exit codes.

### Enforcement Guidelines

**All AI agents MUST:**
- Use the store's `add` / `list` / `complete` verbs exactly; never mint a Task or ID outside the store.
- Route all list output through `render.js` and all errors through the entrypoint — never `console.log` mid-domain.
- Let only the entrypoint catch errors and set exit codes; domain code throws or returns, never prints.

**Anti-patterns to avoid:**
- A module-level `let tasks = []` singleton (breaks test isolation) — use `createStore()`.
- Renaming Glossary verbs (`createTask`, `getTasks`, `markComplete`).
- Printing a stack trace to the user, or `throw`ing on an unknown ID in `complete`.
- Introducing actors/message-passing/threads — explicitly rejected for this project.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
simple-todo/
├── package.json          # "type":"module"; bin: { "todo": "bin/todo.js" }; scripts.test = "node --test"; no deps
├── README.md             # usage: todo add <text> | todo list | todo done <id>
├── .gitignore            # node_modules/, *.log
├── bin/
│   └── todo.js           # ENTRYPOINT: parse process.argv → dispatch; the ONLY try/catch; sets exit codes
├── src/
│   ├── store.js          # createStore() → { add, list, complete }; owns tasks[] + nextId; sole ID minter
│   ├── task.js           # makeTask(id, text) → { id, text, done:false }  (canonical Task shape)
│   ├── render.js         # renderList(tasks) → string; "[ ]/[x] <id>. <text>", strike-through when done (TTY-aware)
│   └── errors.js         # ValidationError (thrown by store.add, identified by the entrypoint)
└── test/
    ├── store.test.js     # unit: add (incl. empty-text reject), list, complete (incl. unknown-id no-op)
    └── cli.test.js       # smoke: spawn bin/todo.js for the add → list → done loop + exit codes
```

### Architectural Boundaries

- **API / service / data boundaries:** N/A — single process, no network, no DB, no external integrations.
- **The one internal boundary that matters — the store seam:** all state lives behind `createStore()`.
  `bin/todo.js` and tests touch tasks ONLY through `add` / `list` / `complete`. Swapping the in-memory
  array for file persistence later means rewriting `store.js` alone; nothing else changes.

### Requirements to Structure Mapping

- **FR-1 Capture (`todo add <text>`):** `bin/todo.js` (dispatch + validation surface) → `src/store.js#add`
  (mint ID, create Task, reject empty) → `src/task.js`. Tests: `test/store.test.js`, `test/cli.test.js`.
- **FR-2 View (`todo list`):** `bin/todo.js` → `src/store.js#list` → `src/render.js`. Tests: both test files.
- **FR-3 Complete (`todo done <id>`):** `bin/todo.js` → `src/store.js#complete` (set done; `null` on unknown id).
  Tests: both test files.

### Integration Points & Data Flow

- **Internal communication:** direct function calls — `bin → store`, `bin → render`. No events, no message bus.
- **Data flow (happy path):** `argv → bin parse → store (mutate/read) → render → stdout (exit 0)`.
- **Data flow (error path):** `store throws ValidationError | returns null → bin catches/inspects →
  stderr (exit 1)`. No stack trace ever reaches the user.
- **External integrations:** none.

### File Organization Patterns

- **Configuration:** just `package.json` (+ `.gitignore`). No build config, no env files, no CI files (out of scope).
- **Source:** flat `src/` — one file per concept (store, task, render, errors). Entry in `bin/`.
- **Tests:** flat `test/`, `<unit>.test.js`, run via `node --test`. Store factory means no fixtures/mocks dir.
- **Assets:** none.

### Development Workflow

- **Run:** `node bin/todo.js <cmd>` (or `todo <cmd>` once linked via `npm link`).
- **Test:** `npm test` → `node --test`. No build step, no dev server, no deployment.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** No conflicts. ESM + Node 24 LTS + built-in `node:test` + zero-dependency
vanilla all compose cleanly. The actor model was considered and explicitly rejected, and that rejection
is documented so no agent reintroduces message-passing.

**Pattern Consistency:** Naming (ESM, lowercase files, camelCase, Glossary verbs), the factory-store
rule, and the "entrypoint is the only place that prints/exits" error pattern are mutually consistent
and align with the vanilla-Node choice.

**Structure Alignment:** The tree supports every decision — the store seam is one file (`src/store.js`),
rendering is isolated (`src/render.js`), and the entrypoint owns dispatch + the single error guard.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- FR-1 Capture → `store.add` + `bin/todo.js` dispatch + `src/task.js`. ✅
- FR-2 View → `store.list` + `src/render.js`. ✅
- FR-3 Complete → `store.complete` (by ID; `null` on unknown). ✅

**Non-Functional Requirements Coverage:** No formal NFRs by design. The governing constraint —
scope discipline — is actively enforced (actors rejected, no deps, N/A sections named not padded).

### Implementation Readiness Validation ✅

**Decision Completeness:** Stack, versions, ID strategy, error handling, and rendering all specified.
**Structure Completeness:** Full file tree, boundaries, and FR→file mapping present.
**Pattern Completeness:** All ~6 real conflict points addressed; anti-patterns listed.

### Gap Analysis Results

- **Critical gaps:** none.
- **Important gaps:** none.
- **Nice-to-have (deferred, non-blocking):** optional CI workflow; optional `npm link` install docs in
  README. Both explicitly out of scope for the demo.

### Validation Issues Addressed

One cross-artifact consistency note (not an architecture defect), now **resolved**: `docs/implementation-flow.md`
was checked and already reflects task-ref = **by ID** (diagram + legend). No action needed; all artifacts agree.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined (direct calls; N/A external — stated)
- [x] Performance considerations addressed (N/A at this scale — explicitly assessed)

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified (direct function calls; no events — stated)
- [x] Process patterns documented (error handling / "never crash")

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION (all 16 checklist items ✅, no critical gaps)
**Confidence Level:** high

**Key Strengths:**
- Minimal blast radius: zero dependencies, one state seam, one error-handling chokepoint.
- Tight FR→file traceability; an agent can't be ambiguous about where code goes.
- Scope discipline encoded as enforceable rules, not just prose.

**Areas for Future Enhancement:**
- File persistence (swap `store.js` behind the same seam), optional CI, `npm link` install docs.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow the documented decisions exactly; touch state only via `store.add/list/complete`.
- Keep printing and exit codes in the entrypoint only; domain code throws or returns.
- Do not introduce dependencies, actors, or persistence.

**First Implementation Priority:**
`npm init -y` + package.json wiring (`"type":"module"`, `bin`, `scripts.test`) — the first story.

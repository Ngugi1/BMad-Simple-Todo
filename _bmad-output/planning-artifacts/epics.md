---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/briefs/brief-simple-todo-2026-06-04/brief.md
  - docs/implementation-flow.md
  - _bmad-output/brainstorming/brainstorming-session-2026-05-20-1026.md
---

# simple-todo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for simple-todo, decomposing the requirements from the PRD and Architecture decisions into implementable stories. There is no UX Design document — simple-todo is a CLI with no UI surface — so no UX requirements are extracted.

> **Cost metric:** expense for this project is estimated in **Claude tokens, not time** (an AI-assisted build makes calendar time meaningless). The expected tokens to finish each story below are budgeted in [docs/token-budget.md](../../docs/token-budget.md).

## Requirements Inventory

### Functional Requirements

FR1: The user can add a Task by supplying non-empty text. The Task is created with the supplied text and done-state `false` and appears in subsequent View output. Empty or whitespace-only text is rejected and no Task is created.

FR2: The user can view the full list of Tasks in the Store. Every Task appears, including completed ones (rendered struck-through). An empty Store renders a clear "no tasks" indication, not an error.

FR3: The user can mark a specific Task (referenced by its ID) complete. The target Task's done-state becomes `true`; it remains in the Store and continues to appear in View, rendered struck-through. Re-completing an already-complete Task is an idempotent no-op. Completing a Task not in the Store is a safe, silent no-op.

### NonFunctional Requirements

NFR1: State is held in an **in-memory** Store for the current session only. No persistence across restarts is a deliberate, accepted constraint (PRD §5).

NFR2: Single-user, single-session, local operation. No accounts, multi-user, or sync.

NFR3: The Store exposes exactly `add` / `list` / `complete` and is swappable behind that interface (architecture seam for a future file-backed store).

### Additional Requirements

- **Interface modality = CLI (Node.js).** The CLI entrypoint parses `argv` and dispatches to the Store operations (architecture early decision).
- **Task-reference mechanism = by ID** — a Task is designated for completion by an assigned id, not list position (resolved 2026-06-04, overrides the earlier list-position default).
- **Task shape = text + boolean done-state**, nothing else.
- **Complete = strike-through, Task stays visible** (the strike-through is the completion signal).
- **Test-first build (red → green)** for each command, re-converging at the CLI entrypoint and a single end-to-end smoke test (`add → list → done`), per the implementation flow.
- **No starter template** — greenfield, plain Node.js; no scaffolding framework specified.

### UX Design Requirements

None — simple-todo is a CLI with no UI surface, so no UX Design document exists and no UX-DRs are extracted.

### FR Coverage Map

- FR1: Epic 1 (Story 1.1) — Capture a task
- FR2: Epic 1 (Story 1.2) — View all tasks, completed struck-through
- FR3: Epic 1 (Story 1.3) — Complete a task by ID, stays visible

All 3 FRs covered. NFR1–3 and the architecture additional requirements are satisfied across Stories 1.0–1.4 (project scaffold, in-memory Store seam, CLI entrypoint, test-first). Story 1.0 carries the project-initialization work the architecture names as the first implementation priority (no FR — it is the enabling foundation).

## Epic List

### Epic 1: The Capture → View → Complete Loop
Sam (or an observer) can run the CLI, add a task, view the full list, and mark a task done by ID — the entire app exercised end-to-end in one session.
**FRs covered:** FR1, FR2, FR3

## Epic 1: The Capture → View → Complete Loop

Deliver the complete simple-todo loop on an in-memory Store (`add`/`list`/`complete`) exposed through a Node.js CLI. Built test-first (red→green) per command, re-converging at a single CLI entrypoint and one end-to-end smoke test. Stories are ordered so each depends only on those before it.

### Story 1.0: Initialize the Node project

As Sam, the builder/demonstrator,
I want a zero-dependency Node.js project scaffold wired for ESM and the built-in test runner,
So that every subsequent story has a runnable, testable foundation to build on.

**Acceptance Criteria:**

**Given** an empty project directory
**When** the project is initialized (`npm init`) and `package.json` is wired
**Then** `package.json` sets `"type": "module"`, declares `"bin": { "todo": "./bin/todo.js" }`, and sets `"scripts": { "test": "node --test" }`
**And** both `dependencies` and `devDependencies` are empty — no runtime or test packages are added (zero-dependency by design)

**Given** the initialized project
**When** the toolchain is targeted
**Then** it targets Node.js 24.x LTS using ES Modules (`import`/`export`), with no build step and no TypeScript

**Given** the wired `package.json`
**When** `npm test` is run before any feature code exists
**Then** `node --test` executes cleanly and exits 0 (no tests is not a failure)
**And** a `.gitignore` ignores `node_modules/` and `*.log`

### Story 1.1: Capture a task

As Sam, the builder/demonstrator,
I want to add a task by supplying non-empty text,
So that the app has something to show — the single entry point of the whole loop.

**Acceptance Criteria:**

**Given** an empty in-memory Store exposing `add`
**When** `add` is called with non-empty text
**Then** a new Task is created with that text and done-state `false`
**And** the Task is assigned a stable unique ID and is retained in the Store

**Given** the Store
**When** `add` is called with empty or whitespace-only text
**Then** no Task is created and the input is rejected (FR1)

### Story 1.2: View all tasks

As Sam, the builder/demonstrator,
I want to see all tasks in the Store as a list,
So that captured tasks become recallable and the loop is observable.

**Acceptance Criteria:**

**Given** a Store containing one or more Tasks
**When** `list` is called
**Then** every Task is returned, including completed ones
**And** each line renders as a checkbox + ID + text — open tasks `[ ] <id>. <text>`, completed tasks `[x] <id>. <text>` with the text struck-through (the checkbox is the completion signal, no `(done)` suffix) (FR2)

**Given** an empty Store
**When** `list` is called
**Then** a clear "no tasks" indication is returned, not an error (FR2)

### Story 1.3: Complete a task by ID

As Sam, the builder/demonstrator,
I want to mark a specific task done by its ID,
So that the list becomes a list and not just a notepad — the app's defining verb.

**Acceptance Criteria:**

**Given** a Store containing a Task with a known ID
**When** `complete` is called with that ID
**Then** the Task's done-state becomes `true`
**And** the Task remains in the Store and still appears in `list`, rendered struck-through (FR3)

**Given** a Task already complete
**When** `complete` is called again with its ID
**Then** the operation is an idempotent no-op (done-state stays `true`) (FR3)

**Given** an ID that matches no Task in the Store
**When** `complete` is called with that ID
**Then** nothing changes and no error is surfaced — a safe, silent no-op (FR3)

### Story 1.4: Run the loop from the command line

As Sam, the builder/demonstrator,
I want a CLI entrypoint that dispatches `add` / `list` / `done` from argv,
So that the full Capture → View → Complete loop runs live in a demo.

**Acceptance Criteria:**

**Given** the Store operations from Stories 1.1–1.3
**When** the CLI is invoked with `add <text>`, `list`, or `done <id>`
**Then** argv is parsed and dispatched to the matching Store operation, and results print to the terminal

**Given** the wired CLI
**When** an end-to-end smoke run executes `add` → `list` → `done` → `list`
**Then** the added task appears, then appears struck-through after completion — proving the loop end-to-end

**Given** the wired CLI
**When** it is invoked with empty/whitespace `add` text, an unknown `done` id, or an unknown/missing command
**Then** a clear one-line message is printed to **stderr** with a **non-zero exit code** and no stack trace, while successful commands print to **stdout** with **exit 0** (architecture "never crash" error-handling contract)

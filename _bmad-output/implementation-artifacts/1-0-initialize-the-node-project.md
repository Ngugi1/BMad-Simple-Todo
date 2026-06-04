# Story 1.0: Initialize the Node project

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Sam, the builder/demonstrator,
I want a zero-dependency Node.js project scaffold wired for ESM and the built-in test runner,
so that every subsequent story (1.1–1.4) has a runnable, testable foundation to build on.

## Acceptance Criteria

1. **`package.json` is correctly wired.** Given an empty project directory, when the project is initialized (`npm init`) and `package.json` is edited, then `package.json` sets `"type": "module"`, declares `"bin": { "todo": "./bin/todo.js" }`, and sets `"scripts": { "test": "node --test" }`. **And** both `"dependencies"` and `"devDependencies"` are empty or absent — no runtime or test packages are added (zero-dependency by design). [Source: epics.md#Story-1.0]

2. **Toolchain targets Node 24.x LTS, ESM, no build.** The project targets Node.js 24.x LTS using ES Modules (`import`/`export`), with no build step and no TypeScript. [Source: epics.md#Story-1.0; architecture.md#Selected-Starter]

3. **`npm test` passes cleanly with zero tests.** Given the wired `package.json`, when `npm test` is run before any feature code exists, then `node --test` executes cleanly and exits `0` (no tests is not a failure). **And** a `.gitignore` ignores `node_modules/` and `*.log`. [Source: epics.md#Story-1.0]

## Tasks / Subtasks

- [x] **Task 1: Initialize and wire `package.json`** (AC: #1, #2)
  - [x] Run `npm init -y` in the project root (`/Users/sam/dev/simple-todo`) to generate a baseline `package.json`. [Source: architecture.md#Initialization-Command]
  - [x] Edit `package.json` to set `"type": "module"`. [Source: architecture.md#Naming-Patterns — "ES Modules; No CommonJS"]
  - [x] Add `"bin": { "todo": "./bin/todo.js" }`. **Do NOT create `bin/todo.js` in this story** — the file is built in Story 1.4. Declaring the bin entry now is correct; npm does not require the target file to exist unless you `npm link`/publish (neither is in scope). [Source: epics.md#Story-1.0; architecture.md#Project-Structure]
  - [x] Set `"scripts": { "test": "node --test" }`. Replace the default `npm init` test script (which prints an error and exits 1) entirely. [Source: epics.md#Story-1.0]
  - [x] Remove the default `"main": "index.js"` line, or point it somewhere harmless — there is no `index.js`; the entrypoint is `bin/todo.js`. Leaving a dangling `main` is cosmetic but the structure has no `index.js`. [Source: architecture.md#Project-Structure]
  - [x] Confirm `"dependencies"` and `"devDependencies"` are empty or absent. Run **no** `npm install <pkg>` of any kind. [Source: architecture.md#Selected-Starter — "keeps dependencies and devDependencies empty"]
  - [x] Do NOT add an `engines` field, lockfile tweaks, TypeScript config, or any build tooling — none are in the ACs and all violate the scope-discipline counter-metric. [Source: PRD#7-Counter-metric]
- [x] **Task 2: Create `.gitignore`** (AC: #3)
  - [x] Create `.gitignore` at the project root containing `node_modules/` and `*.log`. [Source: epics.md#Story-1.0; architecture.md#File-Organization]
- [x] **Task 3: Verify the test gate** (AC: #2, #3)
  - [x] Run `npm test` and confirm it invokes `node --test`, prints the TAP "0 tests / 0 fail" summary, and exits `0`. (Verified locally: with zero test files, `node --test` exits 0 on the installed runtime.)
  - [x] Do NOT create any `test/*.test.js`, `src/*.js`, or `bin/*.js` files — there is intentionally no test and no feature code yet. The empty-but-passing test run **is** the deliverable of this story.

## Dev Notes

### What this story is — and is NOT

This is the **enabling scaffold story**. It carries no Functional Requirement. Its entire output is: a correctly-wired `package.json`, a `.gitignore`, and a green `npm test` that runs zero tests. The store, Task model, render, errors, CLI entrypoint, and all tests are **later stories (1.1–1.4)** — do not anticipate them by creating empty stub files. [Source: epics.md#FR-Coverage-Map — "Story 1.0 ... no FR — it is the enabling foundation"]

The single most important constraint on this project is the **scope-discipline counter-metric**: "do not add durability, features, or polish ... Architecture must resist, not absorb, complexity." Adding anything beyond the three ACs (a dependency, a build step, TypeScript, an `engines` field, a stub `bin/todo.js`, a CI file) is a defect here, not initiative. [Source: PRD#7-Success-Metrics; architecture.md#Core-Architectural-Decisions]

### Tech stack & versions (locked by architecture)

- **Runtime:** Node.js **24.x LTS**, target. ⚠️ The local dev machine reports **Node v22.14.0 / npm 10.9.2**. This is fine for this story: the behaviors required (ESM `"type":"module"`, `node --test` exiting 0 on zero test files) are stable from Node 20 onward and verified working on v22.14.0. Do not "fix" the version mismatch — the ACs target 24.x but do not require pinning it, and there is no `engines` field to add. [Source: architecture.md#Language-Runtime; verified locally]
- **Module system:** ES Modules only (`import`/`export`). No CommonJS, no `require`. [Source: architecture.md#Naming-Patterns]
- **Test runner:** built-in `node:test` + `node:assert` (zero-dependency, stable since Node 20). Invoked via `node --test`. No Jest/Vitest/Mocha — adding one violates zero-dependency. [Source: architecture.md#Testing-Framework]
- **Build tooling:** none. Run directly with `node`. No bundler, no transpile. [Source: architecture.md#Build-Tooling]

### Final `package.json` target shape

The wired file should be equivalent to:

```json
{
  "name": "simple-todo",
  "version": "1.0.0",
  "description": "A todo app reduced to Capture → View → Complete.",
  "type": "module",
  "bin": { "todo": "./bin/todo.js" },
  "scripts": { "test": "node --test" }
}
```

Field values like `name`/`version`/`description` from `npm init -y` are fine as-is; the **load-bearing** keys are `type`, `bin`, and `scripts.test`, plus the **absence** of `dependencies`/`devDependencies`. [Source: epics.md#Story-1.0; architecture.md#Initialization-Command]

### Project structure (target end-state — most files come in later stories)

```
simple-todo/
├── package.json          # THIS STORY: "type":"module"; bin.todo; scripts.test="node --test"; no deps
├── .gitignore            # THIS STORY: node_modules/, *.log
├── README.md             # NOT this story (deferred / optional)
├── bin/todo.js           # Story 1.4 — do NOT create now (but DO declare it in bin)
├── src/store.js          # Story 1.1–1.3
├── src/task.js           # Story 1.1
├── src/render.js         # Story 1.2
├── src/errors.js         # Story 1.1/1.3
└── test/*.test.js        # Stories 1.1–1.4
```

[Source: architecture.md#Complete-Project-Directory-Structure]

### Testing standards

- Tests (when they arrive in later stories) live in `test/`, named `<unit>.test.js`, run with `node --test`. **No test files exist in this story** and that is correct — `node --test` with zero matching files reports `1..0` and exits `0`. [Source: architecture.md#Structure-Patterns]
- The **proof of done for this story is the test command itself**: `npm test` exits 0. There is nothing to assert beyond that.

### Project Structure Notes

- Greenfield: the project root currently contains only `_bmad/`, `_bmad-output/`, `.claude/`, and `docs/`. There is no `package.json`, `src/`, `bin/`, or `test/` yet — this story creates the first runnable scaffold. No conflicts with existing structure.
- The repository is **not yet git-initialized** (`git rev-parse` fails). The `.gitignore` is still required by AC #3; `git init` itself is not an explicit AC — create `.gitignore` regardless so it is in place when the repo is initialized. Mention to Sam if a `git init` is desired, but do not block on it.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.0-Initialize-the-Node-project]
- [Source: _bmad-output/planning-artifacts/epics.md#Requirements-Inventory] — zero-dependency, test-first, no starter template
- [Source: _bmad-output/planning-artifacts/architecture.md#Starter-Template-Evaluation] — vanilla Node, rationale for no framework
- [Source: _bmad-output/planning-artifacts/architecture.md#Initialization-Command] — `npm init -y` + package.json wiring
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete-Project-Directory-Structure] — full target tree
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Sequence] — "npm init + package.json wiring (first story)"
- [Source: _bmad-output/planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md#7-Success-Metrics] — scope-discipline counter-metric
- [Source: docs/implementation-flow.md] — test-first build order; Story 1.0 precedes the store-interface gate

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m] (Opus 4.8, 1M context)

### Debug Log References

- `npm init -y` → generated baseline `package.json` (had `main: index.js` and the default failing test script; both removed during wiring).
- `npm test` → `node --test` → TAP `1..0`, `# pass 0 / # fail 0`, **exit 0**. Confirms AC #3 (zero tests is not a failure).
- Environment note: local runtime is **Node v22.14.0 / npm 10.9.2**; architecture targets **Node 24.x LTS**. The required behaviors (ESM, `node --test` exit 0 on zero test files) are stable from Node 20+ and verified on v22.14.0. No `engines` field added (not an AC; scope discipline).

### Completion Notes List

- Wired `package.json`: `"type":"module"`, `"bin":{"todo":"./bin/todo.js"}`, `"scripts":{"test":"node --test"}`. Removed default `"main":"index.js"` and the placeholder test script. No `dependencies`/`devDependencies` present — zero-dependency by design.
- `"bin"` declares `./bin/todo.js` but the file is intentionally **not** created — that is Story 1.4. npm does not require the target to exist absent `npm link`/publish.
- Created `.gitignore` ignoring `node_modules/` and `*.log`.
- Scope discipline held: **no** `bin/`, `src/`, or `test/` files created. The green empty test run is the deliverable.
- Repo is not git-initialized; `.gitignore` is in place for when it is. `git init` left to Sam's discretion (not an AC).
- All 3 ACs satisfied and verified.

### File List

- `package.json` (new) — wired ESM scaffold, bin entry, test script, zero deps
- `.gitignore` (new) — ignores `node_modules/`, `*.log`

### Change Log

- 2026-06-04 — Story 1.0 implemented: zero-dependency Node.js ESM scaffold (`package.json` + `.gitignore`); `npm test` green with zero tests. Status → review.

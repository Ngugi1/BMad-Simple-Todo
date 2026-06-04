---
title: simple-todo
status: final
created: 2026-06-04
updated: 2026-06-04
---

# PRD: simple-todo
*Working title — confirm.*

## 0. Document Purpose

This PRD is for the downstream BMad workflow owners (architecture, epics/stories, dev) who will plan and build `simple-todo`. It is deliberately lean — a ~2-page spec for a demonstration vehicle, not a commercial product. *(Build cost is estimated in Claude tokens, not time — see the [token budget](../../../../docs/token-budget.md); this is an AI-assisted build, so calendar time is not the cost unit.)* Vocabulary is anchored in the Glossary (§3); the three features are grouped with their Functional Requirements nested and globally numbered; inferred decisions are tagged `[ASSUMPTION]` inline and indexed in §9. It builds on the 2026-05-20 brainstorming session (`_bmad-output/brainstorming/brainstorming-session-2026-05-20-1026.md`), which locked the scope and surfaced the three definition questions now resolved here.

## 1. Vision

`simple-todo` is a Node.js todo application reduced to its irreducible core: **Capture → View → Complete**. A user records a task, sees their list of tasks, and marks a task done. Nothing more.

Its purpose is not to compete with any todo product — it is a clean, end-to-end demonstration of the BMad Method. The three features were derived from first principles — asking *what must be true for software to count as a todo app at all* and rebuilding from those atoms rather than copying existing apps — which is what makes the lean scope defensible rather than merely small. A three-feature spec is small enough to plan and build start-to-finish in a demo, yet each feature carries enough real substance that BMad's planning rigor (PRD → architecture → epics → implementation) has something genuine to work with. Scope discipline is itself the thing being demonstrated.

## 2. Target User

### 2.1 Primary Persona

**Sam, the builder/demonstrator.** Sam is walking an audience through the BMad Method and needs a working artifact at the end. The "user" of the app during a demo is Sam himself (or a single observer Sam hands it to), running it locally in one session.

### 2.2 Jobs To Be Done

- **Functional:** Capture a task, see all captured tasks, mark one complete — the minimum loop of any todo app.
- **Contextual (the real job):** Produce a small, defensible, fully-planned-and-built app that proves BMad was used end to end.
- **Emotional:** Show that lean scope is a deliberate strength, not a shortcut.

### 2.3 Key User Journeys

- **UJ-1. [Sam, the builder/demonstrator] captures and clears a task in one session.** Sam opens the app, adds "Write the demo script" (**Capture**), sees it appear in the list (**View**), and marks it done — the entry strike-throughs and stays visible (**Complete**). The full Capture → View → Complete loop is exercised in seconds. *(In-memory: if the app restarts, the list is empty again — an accepted non-goal, see §5.)*

## 3. Glossary

*Downstream workflows and readers must use these terms exactly.*

- **Task** — A single unit of intended work. Consists of exactly two parts: a **text** (the description) and a **done-state** (a boolean, initially false). Nothing else.
- **Done-state** — The boolean on a Task indicating whether it has been completed. `false` = open, `true` = complete.
- **Capture** — The action of adding a new Task to the Store.
- **View** — The presentation of all Tasks currently in the Store, as a list.
- **Complete** — The action of setting a Task's done-state to `true`.
- **Store** — The in-memory collection holding all Tasks for the current session. Exposes `add`, `list`, and `complete`. Not persisted across restarts.

## 4. Features

### 4.1 Capture

**Description:** The user adds a new Task by providing its text. The Task is created with a done-state of `false` and added to the Store. This is the single entry point — there is no app without it. Realizes UJ-1.

**Functional Requirements:**

#### FR-1: Add a task

The user can add a Task by supplying non-empty text. Realizes UJ-1.

**Consequences (testable):**
- A new Task is created with the supplied text and done-state `false`, and appears in subsequent View output.
- Empty or whitespace-only text is rejected; no Task is created. `[ASSUMPTION: empty input is rejected rather than silently stored.]`

### 4.2 View

**Description:** The user sees all Tasks currently in the Store, presented as a list. Both open and completed Tasks are shown; completed Tasks render with a strike-through (see §4.3). View is read-only — it closes the loop by making captured Tasks recallable. Realizes UJ-1.

**Functional Requirements:**

#### FR-2: View all tasks

The user can view the full list of Tasks in the Store. Realizes UJ-1.

**Consequences (testable):**
- Every Task in the Store appears in the list, including completed ones.
- An empty Store renders an empty list (or a clear "no tasks" indication), not an error. `[ASSUMPTION: empty list is a valid, non-error state.]`

### 4.3 Complete

**Description:** The user marks a Task done, setting its done-state to `true`. The completed Task **remains visible** in the list and renders with a strike-through — the strike-through *is* the completion signal. This is the app's defining verb: the difference between a list and a notepad. Realizes UJ-1.

**Functional Requirements:**

#### FR-3: Mark a task complete

The user can mark a specific Task complete. Realizes UJ-1.

**Consequences (testable):**
- The target Task's done-state becomes `true`.
- The Task remains in the Store and continues to appear in View, rendered with a strike-through.
- Completing an already-complete Task is a no-op (done-state stays `true`). `[ASSUMPTION: re-completing is idempotent rather than an error.]`
- Targeting a Task that is not in the Store is a safe no-op — no Task is changed and no error is surfaced. `[ASSUMPTION: complete-not-found is a silent no-op.]` *(How a Task is referenced — list position vs. an id — is an architecture decision, deferred to §8.)*

## 5. Non-Goals (Explicit)

- **No persistence across restarts.** The Store is in-memory only; losing all Tasks on restart is a deliberate, accepted non-goal — not a defect.
- **No edit or delete.** A Task's text cannot be changed and a Task cannot be removed.
- **No elaboration on the Task model:** no priorities, due dates, tags/categories, search/filter, reminders/notifications.
- **No multi-user, accounts, or sync.** Single-user, single-session, local.
- **No un-complete.** Completion is one-directional in v1. `[ASSUMPTION: there is no need to toggle a Task back to open.]`

## 6. MVP Scope

### 6.1 In Scope

- Capture a Task (text + done-state `false`).
- View all Tasks as a list, completed ones struck through.
- Complete a Task (strike-through, stays visible).
- In-memory Store with `add` / `list` / `complete`.

### 6.2 Out of Scope for MVP

- Everything in §5 Non-Goals.
- Interface modality and stack choices (CLI vs web vs TUI) — a decision for the architecture stage, not this PRD.

## 7. Success Metrics

This is a demo, so success is qualitative: **the app is planned and built end-to-end with BMad, and a single Capture → View → Complete loop runs cleanly in a live demo.** If an observer can add a task, see it, and mark it done without confusion, the PRD did its job.

**Counter-metric (do not optimize):** do not add features, persistence, or polish to make it "more impressive." Scope discipline is the demonstration; expanding scope defeats the purpose.

## 8. Open Questions

1. **Interface modality and stack** — CLI, web, or TUI, and the specific Node.js stack. Deferred to the architecture stage.
2. **Task reference mechanism** — how a user designates *which* Task to Complete (list position vs. an assigned id). Affects FR-3; deferred to architecture.

*All three brainstorm definition questions (task shape, persistence, complete behavior) are resolved — see §9 and the decision log.*

## 9. Assumptions Index

- §4.1 FR-1 — empty/whitespace-only task text is rejected, not stored.
- §4.2 FR-2 — an empty Store is a valid non-error state.
- §4.3 FR-3 — re-completing an already-complete Task is idempotent.
- §4.3 FR-3 — completing a Task that is not in the Store is a silent no-op.
- §5 — no un-complete; completion is one-directional in v1.

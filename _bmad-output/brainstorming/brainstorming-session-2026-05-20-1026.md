---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Features for a simple Node.js todo app, built to demonstrate the BMad Method'
session_goals: 'Generate a lean, essentials-first set of candidate features worth planning with BMad'
selected_approach: 'ai-recommended'
techniques_used: ['First Principles Thinking']
ideas_generated: 3
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Mary (Business Analyst)
**Participant:** Sam
**Date:** 2026-05-20

## Session Overview

**Topic:** Features for a simple Node.js todo app, built to demonstrate the BMad Method

**Goals:** Generate a lean, essentials-first feature set. The todo app is a demonstration
vehicle for the BMad Method — features should be simple to build yet meaningful enough that
BMad's planning rigor has something to work with.

**Approach:** AI-Recommended techniques. Recommended a three-phase flow (First Principles →
Resource Constraints → Reverse Brainstorming). The participant converged to the bare-minimum
feature set during Phase 1, so Phases 2–3 were intentionally not needed.

## Technique Execution Results

### First Principles Thinking

- **Method:** Stripped the concept to bedrock — "what must be true for software to count as a
  todo app at all?" — and rebuilt the feature set from those atoms rather than copying existing
  apps.
- **Outcome:** Three irreducible atoms confirmed as the complete essential set. Participant made
  a deliberate, disciplined call to stay at bare minimum.

## The Essential Feature Set

A todo app, reduced to its irreducible core: **Capture → View → Complete.**

**[Core #1] Capture**
- *Concept:* The user can add a task — record "a thing I intend to do." The single entry point.
- *Rationale:* Irreducible. There is no app without a way to record a task.

**[Core #2] View**
- *Concept:* The user can see all captured tasks in a list. Recall of what's been recorded.
- *Rationale:* Closes the minimum loop — capture is meaningless without retrieval.

**[Core #3] Complete**
- *Concept:* The user can mark a task done.
- *Rationale:* This is the *todo*-ness — the difference between a list and a notepad. Defines the
  app's core verb. Everything else (priorities, due dates, tags, edit, delete, search) is
  elaboration on top of this and was deliberately excluded.

## Deliberately Excluded (Scope Boundary)

The following were consciously left out to keep the demo lean. They are *elaborations on the
three atoms*, not part of the essential set: edit task, delete task, priorities, due dates, tags
/ categories, search/filter, reminders/notifications, multi-user/accounts, sync.

## Open Definition Questions (for the next BMad step)

Not new features — these are decisions that *specify* the three essentials and are good material
for the PRD / architecture stages:

1. **What is a "task"?** Just a line of text, or text + a done-state? (Working assumption:
   text + done-state — still bare minimum.)
2. **Does it persist?** In-memory only, or saved to a file/DB so the list survives a restart?
3. **What does "complete" do?** Strike-through and remain visible, or disappear from the view?

## Session Summary

**Key Achievements:**
- Confirmed a lean, defensible, essentials-only feature set: Capture → View → Complete.
- Established a clear scope boundary (what is intentionally excluded) — useful demo material.
- Surfaced three definition questions to carry into PRD/architecture.

**Reflection:** Fast, decisive convergence. First Principles reached bedrock quickly and the
participant resisted scope creep — exactly what "lean" should look like. A 3-feature spec is small
enough to plan end-to-end in a BMad demo, yet each feature has real substance to specify.

## Recommended Next Steps

1. **Product Brief** (`bmad-product-brief`, code **CB** in Mary's menu) — capture the problem,
   audience (BMad demo viewers), and this scope as a one-page brief.
2. **PRD** (`bmad-prd`) — turn the three features + the three definition questions into
   requirements.
3. **Architecture** (`bmad-create-architecture`) — decide persistence and the Node.js stack.

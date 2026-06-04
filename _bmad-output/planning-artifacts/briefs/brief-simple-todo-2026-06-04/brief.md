---
title: simple-todo
status: final
created: 2026-06-04
updated: 2026-06-04
---

# Product Brief: simple-todo

## Executive Summary

`simple-todo` is a Node.js todo application stripped to its irreducible core — **Capture → View → Complete**. A user adds a task, sees their list, and marks a task done. There is nothing else, and that is the point.

The product exists to do one job honestly: serve as a clean, end-to-end demonstration of the BMad Method. It is small enough to plan and build start-to-finish in a single sitting, yet each of its three features carries enough real substance that the method's planning rigor — brief → PRD → architecture → epics → implementation — has something genuine to chew on. This brief completes the artifact set; the PRD that elaborates it is already finalized (`planning-artifacts/prds/prd-simple-todo-2026-06-04/prd.md`).

## The Problem

This is not solving a market pain — todo apps are a solved space, and pretending otherwise would be dishonest. The real problem is the demonstrator's: *showing* that a disciplined method produces working software needs a worked example that is small enough to follow completely but real enough to be convincing. Most demos fail at one end or the other — a toy too trivial to show rigor, or a system too large to follow in the room. `simple-todo` is sized to thread that needle.

## The Solution

A minimal todo app whose entire surface is three actions: capture a task (text + a done-state), view all tasks as a list, and complete a task — which strike-throughs it in place rather than removing it. State lives in memory for the session. The solution's value is not the app; it is the *traceable path* from a first-principles scope decision to a built artifact, with every decision recorded along the way.

## What Makes This Different

Honestly: nothing about the app competes with anything. The differentiator is **deliberate minimalism as a teaching artifact** — the scope was derived from first principles (*what must be true for software to count as a todo app at all?*) and everything else was consciously cut. The discipline of *what was left out* — edit, delete, due dates, tags, search, accounts, sync — is itself the thing being demonstrated. There is no moat, and claiming one would undercut the demo.

## Who This Serves

- **Primary: Sam, the demonstrator.** Needs a defensible, fully-planned-and-built artifact that proves BMad was used end to end.
- **Secondary: the demo audience.** People evaluating whether the method produces coherent, traceable software. Their success is being able to follow the whole chain without getting lost.

## Success Criteria

- The app is planned and built end-to-end with BMad, every stage producing a coherent artifact.
- A single Capture → View → Complete loop runs cleanly in a live demo; an observer can add, see, and complete a task without confusion.
- **Counter-signal (avoid):** resist adding features, persistence, or polish to look more impressive — scope discipline is the demonstration, and expanding scope defeats it.

## Scope

**In:** capture a task, view all tasks (completed ones struck through), complete a task; in-memory store with `add` / `list` / `complete`.

**Out:** persistence across restarts, edit, delete, un-complete, priorities, due dates, tags, search, reminders, multi-user, accounts, sync. Interface modality and Node.js stack are deferred to the architecture stage.

## Vision

There is no growth ambition here, and inventing one would be dishonest. If `simple-todo` succeeds, it is *retired* — it has served its purpose as a demonstration. The one grounded extension, if ever wanted, is to use it as a teaching base: swap the in-memory store for file persistence behind the same `add/list/complete` seam, demonstrating how a clean BMad architecture decision absorbs change. That is a teaching move, not a product roadmap.

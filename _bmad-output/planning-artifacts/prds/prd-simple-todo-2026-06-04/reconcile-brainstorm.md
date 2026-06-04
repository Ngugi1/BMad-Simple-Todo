# Reconciliation: Brainstorm → PRD

**Source input:** `brainstorming-session-2026-05-20-1026.md` (First Principles session, Mary + Sam, 2026-05-20)
**PRD draft:** `prd-simple-todo-2026-06-04/prd.md`

Scope: report ONLY gaps — source content the PRD dropped, contradicted, or under-represented. Items the PRD faithfully carried are not listed.

---

## Coverage that is solid (context, not gaps)

The PRD carries the core well: Capture → View → Complete as irreducible atoms; the scope boundary / deliberately-excluded list (§5 Non-Goals); the demo-vehicle framing; the three definition questions (task = text+done-state, persistence, what "complete" does) all resolved explicitly. Scope-discipline-as-the-point is preserved strongly (§1, §7 counter-metric). This is a high-fidelity reconciliation overall.

---

## Gaps (source → PRD)

### G1. "First Principles" provenance / method is dropped (qualitative, minor)
- **Source:** The entire feature set is justified by a specific method — stripping to "what must be true for software to count as a todo app at all?" and *rebuilding from atoms rather than copying existing apps*. The "irreducible atom" framing and the anti-cargo-cult rationale ("rebuilt... rather than copying existing apps") is the intellectual backbone of why scope is what it is.
- **PRD:** Uses the word "irreducible" (§1) but never names or explains the First Principles derivation. A downstream reader sees the conclusion (3 features) without the reasoning that makes the scope *defensible* rather than arbitrary.
- **Severity:** Low. Conclusions survive; the "why this is defensible" narrative is thinner. Worth a one-line nod in §0 or §1.

### G2. Phases 2–3 were intentionally skipped — the "decisive convergence" story is lost
- **Source:** Explicitly notes the planned three-phase flow (First Principles → Resource Constraints → Reverse Brainstorming) and that **Phases 2–3 were deliberately not run** because the participant converged to bare-minimum in Phase 1. The Reflection frames this as "fast, decisive convergence... resisted scope creep — exactly what lean should look like."
- **PRD:** No trace. This is process metadata, so arguably out of scope for a PRD — but it is *load-bearing qualitative evidence* that the lean scope was a disciplined choice, not an under-exploration. The PRD asserts scope discipline (§7) but drops the source's actual evidence for it.
- **Severity:** Low–Medium. Tone/intent item: the PRD claims discipline; the source *demonstrated* it. Easy to lose in an FR structure.

### G3. "Notepad vs list" distinction under-tied to its rationale
- **Source:** Complete is "the *todo*-ness — the difference between a list and a notepad. Defines the app's core verb."
- **PRD:** §4.3 does carry "the difference between a list and a notepad" and "defining verb" — so this is **mostly preserved**. Listed only because the source's framing of Complete as *the* differentiator (everything else is "elaboration on top of this") is slightly flattened: the PRD treats the three features as co-equal atoms, whereas the source positions Complete as primary and Capture/View as the loop around it. Minor emphasis shift, not a drop.
- **Severity:** Very low / borderline non-gap.

### G4. Excluded-items list: two items added, none dropped (contradiction check — clears)
- **Source excluded:** edit, delete, priorities, due dates, tags/categories, search/filter, reminders/notifications, multi-user/accounts, sync.
- **PRD §5 Non-Goals:** covers all of the above, AND adds two not in the source: **no un-complete** (§5, flagged `[ASSUMPTION]`) and **no persistence across restarts** (which resolves brainstorm Q2). These are *additions/resolutions*, not contradictions — the PRD correctly tags un-complete as an assumption. No source exclusion was dropped.
- **Severity:** None (informational — confirms no contradiction).

### G5. Recommended Next Steps — Product Brief step bypassed
- **Source:** Recommended Next Steps lists **Product Brief (CB)** as step 1, *then* PRD, then Architecture.
- **PRD:** Jumps straight to PRD; §0 references the brainstorm directly, not a product brief. The brief step appears to have been skipped.
- **Severity:** Low / process. Not a content gap in the PRD itself, but the source's recommended sequence was not followed; flag in case a brief was intended.

---

## Net assessment

No contradictions and no dropped scope items. The material losses are **qualitative/provenance**, not requirements: (a) the First Principles derivation that makes the scope defensible, and (b) the "decisive convergence / Phases 2–3 deliberately skipped" evidence that the lean scope was disciplined rather than under-explored. Both are exactly the kind of tone/intent signal an FR structure silently sheds. Everything functional is faithfully carried.

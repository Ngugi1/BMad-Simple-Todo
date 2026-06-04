# PRD Quality Review — simple-todo

## Overall verdict

This is a tight, internally consistent PRD that is correctly calibrated to its stakes: a deliberately minimal, ~2-page demonstration vehicle for the BMad Method. The three locked decisions (Task = text + boolean done-state, in-memory Store, Complete = strike-through-and-stay) are stated unambiguously in the Glossary and carried through the FRs without contradiction. Every FR has at least one testable consequence, every inline assumption round-trips to the index, and the Glossary vocabulary holds across FRs, UJs, and scope sections. The only soft spots are cosmetic (one rhetorical Open Question, an undefined error/targeting model for completing a Task), none of which block hand-off to architecture or epics.

## Decision-readiness — strong

A decision-maker can act on this immediately. The three definition questions the brainstorm surfaced are resolved in the Glossary and FRs, and the genuinely open decision — interface modality and Node stack — is named honestly and explicitly deferred to architecture (§6.2, §8.1), not smuggled in. Trade-offs are stated with what was given up: in-memory means data loss on restart, and that cost is named in the Vision arc, UJ-1, §5, and §9 rather than hidden. The counter-metric in §7 ("do not add features... to make it more impressive") is a real tension callout, not a safe checkpoint.

### Findings
- **[low]** Open Question §8.2 is rhetorical (§8) — "None blocking. All three brainstorm definition questions are resolved" is an answer, not an open question. *Fix:* move this reassurance into §0 or the decision-log reference and let §8 hold only the genuinely-open modality/stack item.

## Substance over theater — strong

No furniture. The single persona (Sam, builder/demonstrator) is load-bearing: it is what makes "the user is Sam in one local session" and the in-memory non-goal defensible. The Vision is product-specific — it could not be swapped into another PRD because its thesis *is* that minimalism is the demonstration. No NFR boilerplate, no invented differentiation. Success Metrics are honestly qualitative and tied to the actual goal (a clean Capture → View → Complete loop in a live demo) rather than vanity activity metrics.

## Strategic coherence — strong

The PRD has a clear thesis — "scope discipline is itself the thing being demonstrated" (§1) — and every feature serves it. The three features are exactly the irreducible Capture → View → Complete loop; nothing is included that the thesis wouldn't justify, and §5/§7 actively defend against scope creep. MVP scope kind is coherent (problem-solving/experience minimal), and the counter-metric protects the thesis directly.

## Done-ness clarity — adequate

Each FR carries explicit, testable consequences, which is what downstream story creation will lean on. FR-1 (text + done-state false, empty/whitespace rejected), FR-2 (all tasks shown incl. completed, empty Store is non-error), and FR-3 (done-state true, stays visible struck-through, idempotent re-complete) all give an engineer verifiable conditions. No "handles gracefully" / "user-friendly" hedging anywhere.

One genuine gap for the stakes: FR-3 says "the user can mark a *specific* Task complete" but neither the FR nor the Store contract (`add`/`list`/`complete`) defines how a Task is targeted/identified, nor what happens when `complete` is called against a non-existent target. The empty-input and empty-list error paths are specified; the "complete a missing task" path is not. This is fixable in one line and is the only done-ness hole.

### Findings
- **[medium]** Task targeting / not-found behavior undefined (§3 Store, §4.3 FR-3) — `complete` takes "a specific Task" but the PRD never says how a Task is referenced (index? id?) or what happens on an invalid reference, while sibling error paths (empty text, empty list) are specified. *Fix:* add one consequence to FR-3, e.g. "completing a non-existent Task is a no-op / surfaces a clear not-found, not a crash," and note that the reference mechanism is an architecture decision if intentionally deferred.

## Scope honesty — strong

Omissions are explicit and do real work. §5 enumerates the tempting adjacencies (persistence, edit/delete, priorities/dates/tags, multi-user, un-complete) and frames the in-memory loss as "a deliberate, accepted non-goal — not a defect." Inferences the user didn't directly confirm are tagged `[ASSUMPTION]` inline and indexed in §9. Open-items density (1 open question + 4 assumptions) is appropriate-to-low for the stakes and does not threaten the green-light.

## Downstream usability — strong

This PRD is chain-top (feeds architecture → epics → dev), and it extracts cleanly. The Glossary is present and its six terms are used identically across FRs, UJs, and scope sections. FR / UJ IDs are contiguous and unique (FR-1..3, UJ-1), and cross-references resolve (§4.2 → §4.3, §6.2 → §5, §9 → FR-1/2/3/§5). Each feature section stands alone via Glossary terms rather than "see above." UJ-1 names the §2.1 persona. The one residual extraction risk is the undefined Task-targeting mechanism noted under Done-ness, which architecture must resolve before stories can specify the `complete` interaction.

## Shape fit — strong

Correctly shaped as a hobby/solo, single-operator demo: rigor is light, the persona/UJ apparatus is minimal (one persona, one UJ) and justified rather than over-formalized, and Success Metrics are operational/qualitative rather than user-funnel metrics. It is neither over-formalized (no gratuitous UJ density) nor under-formalized (the load-bearing definitions are pinned in the Glossary). The substance bar is met despite the light rigor.

## Mechanical notes

- **Glossary drift:** none. Task, Done-state, Capture, View, Complete, Store used consistently; no synonym drift (e.g., "done-state" not alternated with "completed flag"). "Store" used uniformly for the in-memory collection.
- **ID continuity:** FR-1, FR-2, FR-3 and UJ-1 are contiguous and unique; no gaps or duplicates.
- **Assumptions Index roundtrip:** complete. Four inline `[ASSUMPTION]` tags (FR-1 empty-input, FR-2 empty-list, FR-3 idempotent re-complete, §5 no un-complete) each appear in §9; every §9 entry maps back to an inline tag. No orphans either direction.
- **UJ persona linkage:** UJ-1 references "Sam," the persona defined in §2.1. Linkage is by name in narrative form rather than an exact bracketed label, but unambiguous given a single persona.
- **Cross-refs:** all resolve (§4.2→§4.3, §4.3→§4.1 via Store, §6.1/§6.2→§5, §8→§9, §9→FRs).
- **Locked-decision consistency:** no contradictions. Task=text+boolean (§3, FR-1) ✓; in-memory Store (§3, §5, §6.1) ✓; Complete=strike-through-and-stay (§3, §4.3, FR-3) ✓.

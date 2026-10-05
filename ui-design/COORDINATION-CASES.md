# Coordination cases — Knowledge first

Iteration 81 implements item 1 of the operating-accountability review as a read-only Knowledge case directory. Open Organization → Browse coordination cases. Routes are `/organizations/knowledge/cases` and `/organizations/knowledge/cases/{case-id}`; persona is preserved.

Two explicitly authored cases connect existing records:

- `current-workshop-brief`: Leo is explicitly assigned ownership of follow-up in this sample. Current input/version clarification, delivery and a separate receiver acknowledgment remain required. Source links inspect supplying K-02-C, waiting K-02-E, Leo and K-02 workflow.
- `guide-publication-policy`: case follow-up owner remains unknown. Authorization policy, exact publication subject and decision allocation need clarification; the assessment-role gap remains a separate question. Source links inspect the existing gap, decision requirement and workflow.

Case ownership is not assignment allocation, decision authority or outcome review. No task, binding, permission, deadline or escalation contact is created. Priority/due date remain unspecified. Next action and waiting context are authored planning expectations. Closure conditions are requirements, not passed checks; neither case has a resolution record. The earlier brief-v0 receipt cannot close the current-input case. Editor response or Distributor binding cannot close the publication-policy case. Case closure would not verify the goal.

Search, ownership and coordination-question filters use `caseQ`, `caseOwner`, `caseNeed` in directory URLs. Empty recovery clears filters and focuses search. Scoped detail/source navigation uses the existing validated persona session trail, preserving directory filters and overview source through refresh. Fresh case details return to Cases. Unknown/foreign cases and invalid filters are rejected. Existing main proposal/plan decision behavior is unchanged; no second proposal mechanism or personal inbox action is added. Main/larger case routes are not enabled in this first unit.

Validation: production build and twelve related model/browser checks passed across scoped cases/routes, explicit versus unknown ownership, no binding-derived ownership, current receipt boundary, desktop/mobile filter/refresh/source return, owner and decision inspection, empty recovery/focus and width, plus existing decision/exchange behavior. Three previews were inspected, reproducible with `scripts/capture-cases.mjs` on port 4173. Existing >500 kB bundle warning remains; no performance claim is made.

This completes the agreed Knowledge-first inspection slice of item 1. Interactive case drafts/resolution and broader scenario coverage require explicit records and remain separate future work. Next prioritized item is the versioned workstream agreement.

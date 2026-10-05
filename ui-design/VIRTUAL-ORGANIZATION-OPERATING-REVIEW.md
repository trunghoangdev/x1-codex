# Virtual organization operating review after iteration 79

Reviewed 2026-10-05. This is a code/data-contract and product-design review of the local prototype, including the completed coordination, outcome, workflow, decision and activity slices. No browser inspection, customer research or live runtime verification was performed in this review. No application behavior changes are proposed as already implemented.

## Current assessment

Organization is now a useful shared entry point across Software Factory and Knowledge Operations; My Work remains personal. The UI can explain purpose, scoped roles, human/AI/deterministic workers, assignments, explicit input/parallel relationships, gaps, outcome requirements and decision questions. Source inspection and scenario isolation are substantial strengths.

A virtual organization does not require one universal linear flow. It needs a shared purpose, responsibility for bounded work, clear exchange and decision rules, evidence of results and a way to resolve coordination questions. Different workstreams can use different operating patterns. A role catalog or workflow diagram alone does not supply that operating accountability.

The five completed slices provide inspection rather than a complete operating system. Current gaps are in ownership of coordination issues, versioned work agreements, actual outcome-review records and resource/policy context. Adding more directories alone would offer diminishing value. The next sequence should connect existing screens around a concrete organizational question.

## 1. Coordination cases — recommended first

Customer question: who is handling this unresolved organizational issue, and what should happen next?

Evidence: `coordinationOverview.ts` groups explicit signals, while `organizationAttention.ts` supplies main local response/readiness context. Neither models a coordination case owner, next action, agreed closure condition or resolution record. `responsibilityProposals.ts` already supports main invitation allocation proposals and accepted/rejected plans, but acceptance does not create allocation. That behavior should be reused, not duplicated as a second proposal mechanism.

Proposed slice: a case that references a specific dependency, gap or decision requirement and has an explicitly authored owner (or unknown), next coordination action, waiting party, required closure evidence and represented case status. Keep owner of follow-up separate from input provider, assignment owner, decision authority and outcome reviewer. Priority and due date remain unspecified unless declared; signal counts do not establish urgency.

First unit: two Knowledge cases, one for the missing current workshop brief and one for unresolved publication decision policy/allocation. Explicitly author the follow-up ownership of the first case and leave the second unknown where appropriate. Link existing provider/receiver, decision requirement and gap inspection; do not create tasks, contacts or approval permissions. Begin with read-only case inspection and filtering. Local case drafts can follow after the case/resolution contract is clear.

Acceptance: a coordinator can answer who is following up, what is awaited and which record would close the case. The old brief-v0 receipt does not close the current missing-input case. Editor response does not close the publication-policy case. Closing a coordination case does not verify the whole goal.

## 2. Versioned workstream agreement

Customer question: what exactly did this organization agree to accomplish, within what scope?

Evidence: `Workstream` in `organizationOverview.ts` has goal/project/coordination/outcome prose and assignment references. `OutcomeReview` has criteria, context and boundary. There is no explicit agreement version or approved scope-change record; project labels are not a project registry. Main has an exact release subject, but general workstreams do not share a versioned work agreement.

Proposed slice: a compact work agreement with problem/beneficiary, intended outcome, included/excluded scope, subject/version, input prerequisites and declared decision/review responsibilities. Reuse existing goal and criteria; do not add another disconnected goal hierarchy. Show changes against a prior agreement only when a prior version is authored, including which assignment/evidence references still apply.

First unit: two independently authored versions of the guide brief with a narrowly defined audience/scope change and explicit source references. Keep the current fixture independent until mappings are declared. No implicit invalidation, approval or automatic reallocation.

Acceptance: users distinguish a request to prepare a guide from a request to publish a specific version for a named audience. A changed audience does not silently reuse an older receipt or assessment as proof for the new agreement.

## 3. Outcome-review records

Customer question: who evaluated whether the goal was achieved, and on what evidence?

Evidence: `outcomes.ts` models expectations and gaps, not reviewer allocation or a reviewed conclusion. Shared OutcomeReview intentionally says the result is not represented. `exchangeActivity.ts` offers an outcome-review event kind but supplies no such event; a filter option is not an actual review capability.

Proposed slice: an explicit goal-level review record tied to agreement/subject, criterion/evidence references, reviewer allocation, conclusion, rationale and timestamp when supplied. Distinguish not reviewed, insufficient evidence, partially supported and supported only through authored records. Preserve missing or conflicting observations rather than computing success from finished assignments.

First unit: an independently authored Knowledge reader-observation example and an insufficient-evidence review against the guide goal. Reviewer allocation and evidence provenance must be explicit. Use a read-only fixture before building a conclusion form.

Acceptance: publication can have happened while reader usefulness remains unestablished. A conclusion identifies its scope and reviewed version; subsequent evidence or scope changes do not rewrite the old review.

## 4. Worker capability and declared availability

Customer question: which worker can take this responsibility, and what information is missing before allocating it?

Evidence: shared workers currently have identity/category/type; bindings express scope and responsibility. Existing proposal candidates are authored and explicitly not validated for capacity or permission. Empty assignment lists do not establish availability. There is no capability, declared capacity, operating constraint or freshness contract.

Proposed slice: separately represented skills/tools, declared availability with source/as-of time, constraints and unknowns. Human availability, AI tool access and deterministic executor applicability need distinct meanings. Show candidates as a planning aid, never as automatic allocation or effective authorization. Resource/cost limits belong here only when supplied; do not invent utilization percentages or spend estimates.

First unit: two authored worker profiles showing a relevant capability and an unknown/stale availability report. Connect from existing proposal inspection without replacing its workflow.

Acceptance: a scoped Reviewer binding does not prove the person has time available. An AI worker capability does not grant publication or release authority. A deterministic distributor can remain inapplicable without an explicit subject/policy.

## 5. Reusable operating patterns and explicit decision policy

Customer question: how does this kind of team normally collaborate, and what governs a decision or escalation?

Evidence: `flows` currently contain authored expectations; `workflowMap.ts` draws only explicit instance relationships. `decisionRequests.ts` has a main release projection and a Knowledge policy-clarification requirement, with no supplied escalation contact. Instance order cannot establish a reusable workflow template or policy.

Proposed slice: versioned operating-pattern descriptions with role mandates, required exchanges, parallel/revision expectations and separate declared decision/escalation policies. Instances reference a pattern version while preserving their actual allocation and state. A template is guidance, not an execution engine; policies require explicit subjects and decision roles.

First unit: a Knowledge operating-pattern description that references the existing research/editorial parallel group and workshop brief dependency. Keep publication authorization and escalation policy unknown unless separately authored. Compare declared expectations with represented instance relationships without declaring unmodeled steps as completed or blocked.

Acceptance: two workstreams can use different patterns. An escalation recipient appears only when a policy explicitly names it; a Planner/Coordinator label alone does not supply an escalation chain. No general drag-and-drop workflow editor is needed for this slice.

## Supporting prototype work

Persistence/export of local demo drafts and responses would improve continuity across sessions and machines, but it is separate from organizational accountability. A scoped export/import or explicitly labeled local save must not claim shared server state, durable audit or live SF integration. Keep sample/reset boundaries visible. The latest production build has a >500 kB bundle warning; loading boundaries can be reviewed as engineering work without confusing that warning with measured user-facing slowness.

These capabilities can be designed from authored data on the current machine. Real SF connectivity, tenant permissions, worker scheduling, budget enforcement and execution remain later integration work; they do not block the first coordination-case slice.

## Recommended sequence

Start with coordination cases. Then stabilize the versioned work agreement before modeling actual goal-level review records. Worker profiles and reusable patterns can follow as separate small units. Keep the organization view central and link My Work only when the selected person has an explicitly allocated action.

The proposed items are a new backlog, not new implemented capabilities. Existing main proposals, decisions and history should remain the source for their current behaviors.

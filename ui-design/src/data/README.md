# Prototype data boundary

This directory contains plain TypeScript data and view models, with no React imports.

- `models.ts`: frontend assignment, attempt, local response and preview-state types.
- `assignments.ts`: the fictional inbox and assignment records.
- `attempts.ts`: synthetic execution examples, referencing the shared sample candidate.
- `candidate.ts`: synthetic candidate and before/after file bodies.
- `evidence.ts`: assignment-scoped artifact fixtures and lookup helpers.
- `checks.ts`: alternative validator observation scenarios; shared types live in `models.ts`.
- `requirements.ts`: authored sample review criteria, independent of candidate file contents.
- `organization.ts`: authored waiting/next-step explanations and release-state summaries.
- `revisionCycle.ts`: independent five-record contribution/review/revision scenario with explicit references and synthetic subject identities.
- `reconciliation.ts`: independent synthetic staging expectation and incomplete observation for A-1035.
- `release.ts`: one synthetic release subject shared by evidence, confirmation and receipts.

Components consume these values. Evidence data no longer imports a UI component to obtain the release identity. Decision receipts and preview types are likewise independent of rendering.

## What is not an API contract

These types describe what this prototype renders. Assignment fields such as human ownership, role, deadline labels and permission strings are not established fields of the current Software Factory assignment schema. `Readiness` describes interactive demo scenarios, not a backend state machine. `ResponseRecord` is a local session receipt, not a governed server receipt.

The original assignment views remain fixture-backed. The separate SF inspection view fetches and validates a packaged synthetic or explicitly redacted retained JSON snapshot; Demo continuity explicitly saves local browser snapshots. Neither introduces an SF endpoint, authentication, server admission or shared persistence. A future integration must map a versioned application API into these views, preserve missing/unknown fields, and use server-authoritative identity, permissions and decision receipts. It must not cast arbitrary JSON to these types or use UI permission labels as authorization.

## Remaining extraction

This is an incremental boundary, not a finished data layer. Candidate, evidence, requirements and validator observation fixtures now live here. Organization cards, historical activity and some release-preview presentation/policy logic still remain in components. No generic repository abstraction is introduced before the actual application contract is available.

`organizationOverview.ts` is an authored organization model: workers, scoped role bindings and two workstreams. Membership is a proposed design relationship, not a backend contract or inferred dependency. Outcome statements stay unverified independently of local response counts. Other assignments remain visible outside the streams. See `../../ORGANIZATION-MODEL.md`.

`workstreamDetails.ts` describes proposed handoffs and missing outcome evidence for each sample stream. Handoff states are authored context, not events inferred from local responses or a workflow engine.

`workerDetails.ts` explicitly maps worker/role bindings to sample assignment IDs and describes known invitation responsibility gaps. Empty mappings do not indicate idle workers. These are authored relationships, not production permission checks.

`organizationAttention.ts` derives bounded attention signals from sample assignments, readiness, explicit responsibility gaps and workstream outcomes. Local responses affect response signals only; unverified effects and goals remain visible. Counts are signals, not completion metrics.

`handoffs.ts` defines two authored exchanges with participant scopes, input expectations, receiving conditions, return paths and explicit assignment links. They describe proposed coordination rather than recorded transfers; response receipts do not advance delivery status.

`outcomes.ts` defines proposed outcome evidence criteria and explicit supporting-context IDs for each stream. These are authored review expectations; assignment responses cannot turn them into verified outcomes.

`largeOrganization.ts` is an independent Demos scenario: six streams, nine workers, nineteen bindings and eighteen assignments. It does not extend the current personal inbox or supply live worker states. Relationships and state labels are authored examples; no response actions or verification are attached.

`responsibilityProposals.ts` defines local proposal receipts and authored worker options for the two invitation gaps. Recording proposals does not mutate assignments, role bindings or gap signals. Role/scope are fixed by the gap; worker capability and capacity are unverified.

`workstreamDirectory.ts` defines URL filter defaults for the main organization directory. Entries reuse `organizationOverview`, explicit `workerDetails` gaps and `outcomes` evidence requirements; no receipt or proposal resolves these signals.

`workerDirectory.ts` defines URL filter defaults, explicit worker type classification and directory entries built from scoped bindings and distinct `workerAssignments` links. Counts are sample relationship counts, not capacity or availability measurements.

`workstreamDetails.ts` includes explicit flow-step assignment, evidence, handoff and gap references. Attached flow evidence is restricted to the workstream's authored assignment membership. Missing/conditional steps are not dynamically allocated or advanced by session responses.

`responsibilityProposals.ts` now also holds session allocation-decision receipts and the authored binding/assignment preview. Acceptance means plan accepted, allocation pending; no canonical relationship or assignment is created.

`coordinationActivity.ts` projects current session proposals and their decisions into dated coordination records. Each record uses the explicit gap-to-workstream relationship and includes demo actor, proposed worker, role/scope and rationale. Removing a proposal removes its projected records; no immutable audit or allocation-created event is claimed.

`organizationScenario.ts` provides a common frontend contract and main/large adapters for workers, bindings, streams, explicit assignments, flows, gaps, outcome requirements and evidence. `scenarioAttention.ts` derives bounded read-only signals from explicit gaps and selected assignment states. Main overview/directories now consume the common scenario model; specialized interactive assignment fixtures remain main-only.

`sfSnapshot.ts` is a bounded adapter for the separately packaged synthetic and redacted retained SF inspection envelopes. It preserves retained attempt/assignment and exact work-product relationships without importing demo permission/receipt models. See `../../SF-SNAPSHOT-INSPECTION.md` for pinned shape references and limits.

`humanContribution.ts` holds one fictional contribution exercise with up to nine content versions, explicit responsibility/input and local immutable delivery/receipt/assessment transitions. It is independent of production snapshots and existing assignment receipts, session-only and excluded from Demo continuity. See `../../HUMAN-CONTRIBUTION.md`.

`sfReadProjection.ts` defines the draft inspection read projection and derives it from validated packaged snapshots. It carries one response-byte revision across assignment/attempt/product links, explicit field availability and read errors. These are frontend integration types, not an approved Go/API schema. See `../../SF-READ-CONTRACT.md`.

`contributionCommand.ts` is a local draft intent/status model for the independent human exercise. It freezes submitted payloads, blocks duplicate submission during uncertainty, preserves command history through edits and separates admission from delivery projection. No real permission/concurrency check or durable idempotency store is implemented. See `../../CONTRIBUTION-COMMAND-CONTRACT.md`.

`../integration/contributionPort.ts` is an isolated local-checkpoint adapter example with validated reads, cancellation and superseded-response handling. Backend operations explicitly return unsupported. It is not wired into screens and does not define an approved server API. See [integration plan](../../BACKEND-INTEGRATION-PLAN.md).

`knowledgeResponsibility.ts` adds an optional local K-01-H offer/response history to the contribution exercise. Exact scope and actor/state replay validation back contribution/workspace v4 recovery; unresolved offers gate submission without rewriting authored assignments. See `../../KNOWLEDGE-RESPONSIBILITY.md`.

`knowledgeHandoff.ts` freezes exact contribution input/preparation, pending work and bounded authority for owner-proposed Leo/delegate transfers. Recipient acknowledgement changes the effective contributor; stale packages block acceptance and command/delivery performer links retain historical authors. Contribution/workspace v5 preserve packages. See `../../KNOWLEDGE-HANDOFF.md`.

`knowledgeTimeline.ts` projects retained Knowledge workspace records into typed timeline rows with exact actors, versions, references and source destinations. Filters paginate twenty rows at a time; no independent event store or inferred transitions are introduced. See `../../KNOWLEDGE-TIMELINE.md`.

Material update · iteration 136: [fresh material use](../../MATERIAL-USE-REVISIONS.md) supports separate mandates, assessments and authorizations through draft-09, retained earlier chains and checkpoint v6. Pending follow-up revision requests block current-source use; prior authority and applicability are never inherited.

Iteration 137 adds append-only authorization control history, execution gating and whole-workspace checkpoint v7 replay at exact use-stage anchors. See [authority control](../../AUTHORITY-CONTROL.md).

Iteration 138 adds [K-01 → K-02 input handoffs](../../CROSS-WORKSTREAM-INPUTS.md), separate receiver applicability, frozen downstream brief links and source-change gating. Whole-workspace checkpoint v8 retains this history; earlier formats remain readable. Contribution-only replacement preserves packages and briefs while current-source mismatch blocks reuse.

Iteration 139 adds [accepted review responsibility handoffs](../../REVIEW-RESPONSIBILITY-HANDOFF.md) for publication review, authorization/control and outcome review. Original decisions retain their authors; current holders gate new decisions. Whole-workspace checkpoint v9 replays exact-package ownership history without carrying rights into a new material or cycle.

Iteration 140 adds the [goal outcome loop](../../GOAL-OUTCOME-LOOP.md): scoped owner goal decisions, exact linked follow-up offers/acceptance/delivery/review and checkpoint v10. Accepted task results do not rewrite outcome evidence; open tasks require review or explicit cancellation before a new material/use cycle.

`caseLifecycle.ts` adds a separate bounded workshop-brief case event history with Leo acceptance/follow-up, Maya resolution review, exact current brief/receipt evidence and explicit reopening. `KnowledgeWorkspace.caseEvents` uses checkpoint v11 replay and timeline projection; brief delivery, assignment counts, authority and workshop outcomes remain separate. See [case lifecycle](../../CASE-LIFECYCLE.md).

`workshop.ts` implements the bounded K-02 local workshop event loop and shared scenario projection. It freezes exact received brief plus resolved case identity; facilitator acceptance, preparation review, simulated execution, observations and criterion review are separate transitions. Checkpoint v12 replays events; timeline preserves frozen source. See [workshop delivery](../../WORKSHOP-DELIVERY.md).

`workerReadiness.ts` provides scoped authored Knowledge worker planning profiles and adapts existing main `workerCapabilities.ts` records without losing stale availability. Candidate readiness separates declared capability, unknown/limited availability, explicit assignment links and the current K-02 human-facilitator requirement. These read-only declarations neither grant authority nor mutate workshop/checkpoint state. See [worker readiness](../../WORKER-READINESS.md).

`changeImpact.ts` derives Knowledge source/scope impact rows from existing use, pending-review-package, applicability, guide input, brief, case and workshop guards. It does not mutate records, infer unrecorded dependencies or grant authority. `Current` concerns source matching only; counts represent records rather than root causes. See [impact coverage](../../CHANGE-IMPACT.md).

`patternAdoption.ts` separates workstream guidance selection from immutable exact-work associations. `patternVersions()` preserves original v1 and supplies authored v2 expectations. Upgrade/rollback cannot rebind existing work; missing or replaced sources do not inherit associations. Events retain validated frozen context and known pattern content in checkpoint v13, timeline and advisory change impact. See [pattern versioning](../../PATTERN-VERSIONING.md).

`organizationGoals.ts` defines the explicit Knowledge goal-map-v1 and derives workstream evidence/conclusions from existing use/goal and workshop records. It separates scoped simulation decisions from organization-level attainment, retains source/cycle boundaries, and does not infer goal ownership from operational roles. This read-only view adds no checkpoint state. See [organization goals](../../ORGANIZATION-GOALS.md).

Iteration 151 extends `workshop.ts` with explicit facilitator/reviewer allocation and acceptance-only handoff before execution. Reviewer identity stays fixed; accepted transfers reset active preparation. New fields replay through checkpoint v14, including frozen workshop history within pattern contexts; v12/v13 defaults remain compatible. See [multi-candidate allocation](../../WORKSHOP-ALLOCATION.md).

## Exception follow-up · iteration 152

`exceptionLoop.ts` derives supported K-02 incident conditions and validates explicit ticket transitions, named handling acceptance, exact remedy evidence and independent owner closure. `knowledgeCheckpoint.ts` v15 replays the bounded history; `knowledgeTimeline.ts` exposes retained records. Pattern snapshots exclude exception history. See [boundaries](../../EXCEPTION-HANDLING.md).

## Personal next steps · iteration 154

`personalNextSteps.ts` derives actor-specific read-only follow-ups from current Knowledge records. It reuses existing progress/acceptance models, preserves source identity and separates work, review and waiting. Entries are independent of authored assignment counts and filters; no checkpoint slice is added. See [coverage](../../PERSONAL-NEXT-STEPS.md).

## Guided organization snapshots

`organizationJourney.ts` generates eight synthetic Knowledge chapters using existing transition models; `journeyChapters.ts` exports route-safe identifiers. These are isolated presenter fixtures, not server responses. Each chapter is checkpoint-replay tested. Browsing does not update working records; importing an exported snapshot uses explicit workspace replacement.

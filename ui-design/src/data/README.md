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

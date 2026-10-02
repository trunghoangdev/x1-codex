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

No fetch calls, endpoints, authentication, server admission, runtime JSON validation or persistence have been added. A future integration must map a versioned application API into these views, preserve missing/unknown fields, and use server-authoritative identity, permissions and decision receipts. It must not cast arbitrary JSON to these types or use UI permission labels as authorization.

## Remaining extraction

This is an incremental boundary, not a finished data layer. Candidate, evidence, requirements and validator observation fixtures now live here. Organization cards, historical activity and some release-preview presentation/policy logic still remain in components. No generic repository abstraction is introduced before the actual application contract is available.

`organizationOverview.ts` is an authored organization model: workers, scoped role bindings and two workstreams. Membership is a proposed design relationship, not a backend contract or inferred dependency. Outcome statements stay unverified independently of local response counts. Other assignments remain visible outside the streams. See `../../ORGANIZATION-MODEL.md`.

`workstreamDetails.ts` describes proposed handoffs and missing outcome evidence for each sample stream. Handoff states are authored context, not events inferred from local responses or a workflow engine.

`workerDetails.ts` explicitly maps worker/role bindings to sample assignment IDs and describes known invitation responsibility gaps. Empty mappings do not indicate idle workers. These are authored relationships, not production permission checks.

`organizationAttention.ts` derives bounded attention signals from sample assignments, readiness, explicit responsibility gaps and workstream outcomes. Local responses affect response signals only; unverified effects and goals remain visible. Counts are signals, not completion metrics.

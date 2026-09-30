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
- `reconciliation.ts`: independent synthetic staging expectation and incomplete observation for A-1035.
- `release.ts`: one synthetic release subject shared by evidence, confirmation and receipts.

Components consume these values. Evidence data no longer imports a UI component to obtain the release identity. Decision receipts and preview types are likewise independent of rendering.

## What is not an API contract

These types describe what this prototype renders. Assignment fields such as human ownership, role, deadline labels and permission strings are not established fields of the current Software Factory assignment schema. `Readiness` describes interactive demo scenarios, not a backend state machine. `ResponseRecord` is a local session receipt, not a governed server receipt.

No fetch calls, endpoints, authentication, server admission, runtime JSON validation or persistence have been added. A future integration must map a versioned application API into these views, preserve missing/unknown fields, and use server-authoritative identity, permissions and decision receipts. It must not cast arbitrary JSON to these types or use UI permission labels as authorization.

## Remaining extraction

This is an incremental boundary, not a finished data layer. Candidate, evidence, requirements and validator observation fixtures now live here. Organization cards, historical activity and some release-preview presentation/policy logic still remain in components. No generic repository abstraction is introduced before the actual application contract is available.

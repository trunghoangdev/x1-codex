# Prototype data boundary

This directory contains plain TypeScript data and view models, with no React imports.

- `models.ts`: frontend assignment, attempt, local response and preview-state types.
- `assignments.ts`: the fictional inbox and assignment records.
- `attempts.ts`: synthetic execution examples, referencing the shared sample candidate.
- `release.ts`: one synthetic release subject shared by evidence, confirmation and receipts.

Components consume these values. Evidence data no longer imports a UI component to obtain the release identity. Decision receipts and preview types are likewise independent of rendering.

## What is not an API contract

These types describe what this prototype renders. Assignment fields such as human ownership, role, deadline labels and permission strings are not established fields of the current Software Factory assignment schema. `Readiness` describes interactive demo scenarios, not a backend state machine. `ResponseRecord` is a local session receipt, not a governed server receipt.

No fetch calls, endpoints, authentication, server admission, runtime JSON validation or persistence have been added. A future integration must map a versioned application API into these views, preserve missing/unknown fields, and use server-authoritative identity, permissions and decision receipts. It must not cast arbitrary JSON to these types or use UI permission labels as authorization.

## Remaining extraction

This is an incremental boundary, not a finished data layer. Candidate and artifact fixtures remain in `candidateData.ts` and `evidenceData.ts`. Requirements, check scenarios, organization cards and historical activity still need separate treatment. No generic repository abstraction is introduced before the actual application contract is available.

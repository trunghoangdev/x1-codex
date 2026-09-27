# Software Factory: evidence for the next UI iteration

Read-only review of `forge-software-factory` at commit `f25def284034d71be812bcaf35b858ba8e73e555`. This review used that repository's source, tests, operating rules, findings, and ledger. It did not execute assignments, invoke providers, inspect operational retention directories, or use the excluded `x1` repository. Tests were read, not run.

## What changes the design

The next useful screen is an **assignment and candidate review workspace**, with attempt history and explicit gate observations. This is a more directly supported next step than expanding the prototype's organization dashboard.

The current repository owns CLI execution, retained attempt records, candidate retrieval, materialization, and validator observations. It does not expose an HTTP UI API, a personal inbox query, or an implemented human approval command. The existing prototype's people, due dates, role bindings, permissions, and approval records remain illustrative.

## Source-backed UI model

| Concept | Available information | UI use | Source |
| --- | --- | --- | --- |
| Work identity | Optional generated `work_id`; assignment statements can change while membership in work remains | Group related assignment versions without confusing them with execution attempts; handle absent work identity | `internal/taskrun/assignment.go:33` |
| Assignment | Objective, repository and exact base revision OR prepared context, output scope, required effect paths, validator, publication criterion, expected payload type | Overview with intent, fixed base, permitted changes, required deliverables, and known checks | `internal/taskrun/assignment.go:33` |
| Attempt | Assignment/attempt IDs, open/settled times, outcome, platform state and digests, observed termination, optional exit code, diagnostics, cleanup, failure | Separate attempt history; inspect failures without hiding retained evidence | `internal/taskrun/retention.go:74` |
| Candidate | Work-product envelope, candidate bytes, artifact/content/blob identities, schema and type tag | Exact candidate inspector and provenance summary | `internal/taskrun/workproduct.go:73` |
| Change set | Item name, operation and body digest; scoped body retrieval; tree reconstructed against the base | Changed-files list and diff against the pinned base, not the operator's current checkout | `internal/taskrun/effect.go:36`; `internal/taskrun/workproduct.go:448` |
| Validation observation | Assignment, attempt, exact candidate digest, validator, timestamp, whether it ran, termination, exit code, diagnostics | A separate gate card showing the observed result and its subject | `internal/taskrun/validation.go:89` |
| Production history | Work items, attempts, refusals, elapsed time, interventions and effects, currently recorded in Markdown | Later operational reporting; no assumption of a live metrics API | `production-ledger.md` |

These are repository-internal models or CLI-adjacent records, not a promise of a stable browser API. A Go application boundary should expose an explicit versioned projection. The browser should not read host paths, import Go internals, or parse free-text CLI messages as authoritative state.

## State distinctions the design must preserve

1. **Work / assignment / attempt:** a new attempt is another execution of a statement; a changed statement gets a new assignment ID. Optional work identity groups statements. The grouping alone does not supply an explicit supersession relationship.
2. **Open is not necessarily running:** an interrupted attempt can remain `open`. Without a liveness signal, show “Open — completion not recorded,” not an animated running indicator.
3. **Produced is not approved:** attempt outcome (`open`, `produced`, `failed`) is distinct from platform state, candidate quality, approval, and external effect. Cleanup failure can leave a failed attempt with retained artifact coordinates.
4. **Missing exit code is not zero:** a process that never started has no observed exit status. Preserve unavailable and unknown values.
5. **Validator passed / refused / could not run:** `executed=false` means the candidate was not judged. A nonzero validator result is not an organizational rejection decision. The CLI can complete normally after recording a validator refusal; command exit alone is not the candidate's verdict.
6. **Receipt acceptance is not human acceptance:** passing work-product integrity checks yields a retained candidate, not permission to publish it. Display only the verification claims actually established; do not label the entire artifact provenance independently verified.
7. **Allowed paths are not required paths:** output scope limits what may change; required effect paths state what the candidate must contain. Both need separate labels.
8. **Materialized is not applied:** reconstructing the candidate tree produces something to assess. It does not modify the authoritative target or establish a deployed effect.
9. **Validation observations are not a complete event history:** `validation.json` is atomically replaced. Do not invent an append-only validation timeline from that single file.

Sources: `organization/operating-rules.md`; `internal/taskrun/run.go`; `internal/taskrun/retention.go`; `internal/taskrun/workproduct.go`; `internal/taskrun/validation.go`; `cmd/materialize-candidate/main.go`.

## Proposed next screen

Keep My Work as the product direction, but add a concrete Software Factory review slice:

- **Overview:** objective, source/base, permitted scope, required deliverables, stated criteria.
- **Attempts:** each attempt's distinct identity, timestamps, observed outcome, artifact coordinates and failure explanation.
- **Candidate & Changes:** exact identities, changed files, digest-backed content and a base-to-candidate diff.
- **Checks:** candidate completeness, validator observation, technical assessment, publication admissibility and applicability. Represent unavailable gates as unavailable; only some of these are automated today.
- **Decision:** exact subject, actor, authority scope, rationale and authoritative receipt, once the backend provides them.

The process finding in `findings.md:737` places publication admissibility and applicability before approval. The UI should show missing prerequisites before offering a final decision, with enforcement on the server. This is a recorded process requirement, not proof of a fully automated gate chain.

Preflight and execution should also be separate actions. `run-assignment -preflight-only` intentionally cannot open an attempt. If execution is exposed later, a readiness check must never spend a provider-backed attempt just to determine whether the installation is usable.

## What we need from development

### First priority: a small sanitized fixture pack

One coherent example is more useful than many disconnected screenshots. Provide:

- The assignment JSON plus its objective, including the exact base and expected output kind.
- Related `attempt.json` records: produced, failed, and open/interrupted examples if available. Include a missing-exit-code case.
- The candidate identity envelope and decoded change set, with a small safe base/body example sufficient to render a diff.
- Related `validation.json` observations for passed, refused, and could-not-run cases, preserving their actual schema and missing-field behavior.
- Any real human assessment, approval/refusal, publication/applicability evidence, and effect receipt shapes that already exist. If they are manual or not implemented, say so rather than fabricating a contract.

Use synthetic substitutes where production content cannot be shared and label them as such. Retained stdout/stderr can contain secrets according to the operating rules; do not provide raw credential/session material or unsanitized operational logs. Sanitized bytes will not match original digests: either use a consistent synthetic fixture or explicitly mark redacted content as unverifiable.

### Before backend integration: ownership and contracts

Development needs to confirm:

- **Identity and inbox:** where the current human, role bindings, permissions and assignment-to-person relationship come from. These are not fields on the current SF assignment model.
- **Queries:** the public application surface for listing work/attempts, reading candidate changes and gate observations, pagination and schema versions. Does it exist elsewhere, or must it be introduced?
- **Commands:** what surface admits an assessment or decision, what exact subject it binds, and what receipt demonstrates admission. Include stale-candidate/revoked-authority behavior and duplicate submission handling.
- **Freshness:** polling or events, and how the UI distinguishes an active run from an abandoned open record. SSE is a design option, not a capability discovered here.
- **Visibility:** which users can inspect artifacts and diagnostic streams, what redaction is applied, and whether a safe download surface exists.

These are requested capabilities and data contracts, not invented endpoint names or a requirement to build a generic platform before this slice.

## Immediate recommendation

We have enough source evidence to redesign the assignment detail and failure states now. For faithful data-backed interaction, request the fixture pack first. Preserve the existing prototype as a visual exploration until the missing identity, query, and governed-command boundaries are defined.

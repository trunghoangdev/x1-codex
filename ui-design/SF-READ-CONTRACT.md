# Software Factory inspection read contract — draft v1

Status: **frontend integration proposal**, implemented by the local snapshot adapter. It is not an approved Go application API, a deployed endpoint or a published Forge contract. The backend remains the owner of eventual application semantics. No command contract, authentication or authority capability is introduced in this slice.

## Implemented boundary

`readSfProjection(raw, expectedOrigin)` validates a complete packaged snapshot before exposing `SfReadProjection`. The TypeScript discriminated unions in `src/data/sfReadProjection.ts` are the executable draft projection definition. Original consumer records are validated through `sfSnapshot.ts`; they are not cast to the main demo assignment model.

The projection envelope carries `contract: sf.inspection-read.draft`, `version: 1`, source kind, capture time, source reference, historical freshness and a revision. Assignment, attempts and work products share this envelope. Source paths such as `attempt:<id>` locate records within the snapshot; they are not public API URLs or verification proofs.

`revision` is nullable: if browser digest support is unavailable (for example over a non-secure remote HTTP origin), it is `null` and the UI explicitly says revision is unavailable while keeping source inspection usable. It is never replaced with the attempt ID or an invented token. When available, `revision` is SHA-256 of the **exact UTF-8 snapshot response text**. Re-reading identical bytes has the same revision; any response-byte change, including serialization or capture metadata, changes it. This detects representation differences, not chronology, governance identity, cryptographic provenance or authenticity. It is not a production ETag or command concurrency token.

The original `source.revision` is retained as `sourceRevision`. For the captured run it names an attempt, not an immutable revision of all source material. Capture time is when the export read the records; opened/settled times remain individual attempt observations. No atomic multi-file source transaction or live freshness is established by this exporter. Future server projections need an explicitly defined coherent revision/as-of boundary rather than reusing an attempt ID.

## Field availability

| State | Meaning | Example |
| --- | --- | --- |
| `known` | The inspected record supplies a supported value and field locator | Exit code `0`, exact artifact identity |
| `not-recorded` | The record supplies no value; no default or inferred relationship | Missing exit status or optional work ID |
| `redacted` | The manifest deliberately withholds this field | Validator command, payload bytes |
| `unsupported` | This source does not represent that application concept | Effective permission, worker binding, installed organization |

Unknown is represented by one of these explicit reasons rather than a guessed value. `known` means represented, not verified true. `not-recorded` means missing in this projection, not proof of nonexistence in the organization. An omitted payload is not an empty payload. Missing exit is not zero. There is no inferred worker, permission or approval from a role/title, exit status or platform state.

A product relationship is `available` only when a response matches the attempt's exact artifact identity. It is `not-recorded` when the attempt reports no artifact, or `unavailable` when an artifact is named but its response is absent from the snapshot. No latest-product resolution or content-digest substitution is permitted.

## Source mapping

| Projected fields | Current source | Limit |
| --- | --- | --- |
| Assignment identity, optional work identity, base, scope, required paths, expected kind | SF `internal/taskrun/assignment.go` JSON fields | SF consumer shape, not a public HTTP resource; capture-time assignment file |
| Validator/publication criterion/objective location | Same assignment source, or omission manifest | Redacted in real export; synthetic values are examples |
| Attempt ID, assignment ID, timestamps, outcome, termination, exit, coordinates, cleanup | SF `internal/taskrun/retention.go`, `AttemptRecord` schema 2 | Recorded observations; no fresh runtime query |
| Historical objective, output scope, expected kind | Attempt record | Historical terms remain distinct from current assignment fields |
| Artifact/content/blob identity, payload schema/type | Forge published `work-product` response, described in `docs/operating.md` | Resolver relationships do not independently prove artifact provenance |
| Payload bytes | Response or explicit redaction | Real exported bytes omitted; no substitute body |
| Capture time/source reference/redactions | Prototype exporter/envelope | Projection metadata, not governed material |
| Installed org, actor, worker, effective permission, node, approval, effect | Not supplied by this dataset | Backend/application gap; no proposed endpoint can make these facts exist |

The source paths were inspected read-only. Source checkpoints for the existing captures are documented in `SF-SNAPSHOT-INSPECTION.md`. Private architecture documents are not reproduced.

## Query and failure behavior

The current transport is GET of packaged static JSON. There is no `/api/*` route. The loader distinguishes loading, a validated projection, and error. Error codes are `load-failed`, `invalid-json`, `unsupported-version`, `invalid-snapshot`, `wrong-origin` and `too-large`. Read errors never carry a fabricated assignment outcome, and retry never executes or resubmits work. The size limit is 1 MB of UTF-8 response data after reading; this local adapter is not a streaming network resource limiter.

The loader cancels outdated requests and does not expose stale data after a source/retry change. Origin mismatch fails rather than using a synthetic fallback. Manifest contradictions and invalid normalized fields reject the projection. Existing raw-source inspection remains available; source identities and the source dataset are unchanged.

## Before a backend adopts this design

Define and version a canonical application schema in its owning repository; generate or mechanically derive clients from that source rather than promoting these TypeScript declarations to platform authority. Decide which relationships the service can supply, their authorization/redaction rules and coherence/freshness semantics. Preserve missing data rather than filling the gaps from private Forge storage.

Agree on organization/resource scoping, authenticated query access, pagination/completeness, actual revision/ETag behavior and stable error responses. The draft currently describes one assignment and its included attempts/products; it establishes no complete listing, universal organization schema, replay operation or update command. Server acknowledgement, admission, projection lag, idempotency and command concurrency remain a separate next slice.

Previews: [desktop snapshot context](previews/92-sf-read-context-1440.png), [mobile snapshot context](previews/92-sf-read-context-390.png).

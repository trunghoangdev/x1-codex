# UI integration boundary · iteration 114

This is a frontend implementation plan, not an approved API or a claim of live integration. The current UI remains demo-backed. The sample adapter is isolated from the application: it demonstrates validation and read lifecycle handling without changing existing session or checkpoint behavior.

## Evidence and ownership

Reviewed on 2026-10-07:

- [SF README](../../forge-software-factory/README.md): SF consumes released platform commands and contract-defined JSON; it does not own a server, UI or database.
- [SF assignment](../../forge-software-factory/internal/taskrun/assignment.go): worker-neutral assignment statements, optional continuing work identity, base, output scope and required paths. Assignment ID identifies a statement; it is not a concurrency token for an editable human task.
- [Forge delivery](../../forge/docs/contracts/delivery.md): an outside party's work offer to an installation and that installation's disposition. This is not automatically the UI's Leo→Maya contribution delivery.
- [Forge authorization](../../forge/docs/contracts/authorization.md): authorization, approval and policy remain separate; a browser persona cannot supply authority.
- [Forge receipts](../../forge/docs/contracts/receipts.md): component reports about artifacts/execution, not the proposed human receiver receipt or editorial assessment.
- [SF read draft](SF-READ-CONTRACT.md) and [human command draft](CONTRIBUTION-COMMAND-CONTRACT.md): existing frontend proposals, explicitly not approved backend surfaces.

The two older architecture notes in `x-dartmesh-note/personal` now contain move notices pointing to `x-dartmesh-ws/canon`. Those target files are absent from this checkout. This plan therefore does not claim to have revalidated the moved canon. No excluded `x1` material was read.

A future authenticated application service/control plane should assemble authorized application projections and translate approved operations into published platform surfaces. The browser must not depend on Forge private storage or call worker runtimes directly. This is a proposed integration arrangement; the reviewed repositories do not establish that service's endpoint/schema contract.

## Read model inventory

| UI surface | Required application projection | Available today / missing |
| --- | --- | --- |
| Organization | Organization identity, goals, streams, scoped roles/bindings, explicit gaps, source/as-of boundary | Authored `OrganizationScenario`; no reviewed production organization API |
| My Work | Authenticated principal, allocated responsibilities, explicit response/input flags, contribution stage | Authored allocation plus local contribution; persona is not authentication; scoped server query missing |
| Contribution | Exact assignment/subject/version, input, immutable deliveries, receipt/assessment lineage, command correlation | Validated local checkpoint; human application read contract missing |
| Receiver inbox | Authorized receiver scope, exact delivered versions, receipt responsibility, revision requests | Local exercise; server responsibility and read visibility enforcement missing |
| SF evidence inspection | Assignment, attempts, exact work-product identities, redactions, source and capture time | Implemented packaged snapshot adapter; historical, not a live API |
| Attention/history | Signals and records derived from the same scoped projection; explicit source and freshness | Local/authored derivation; durable event ordering and server projection revision missing |

A production projection needs a versioned envelope with organization/scope, source, coherent revision/as-of semantics, explicit field availability and authoritative relationship identities. Null/missing/redacted/unsupported values must remain distinguishable. An empty result is valid only if an authorized complete response establishes it; transport failure or forbidden scope must not become an empty inbox. Pagination must state count/completeness semantics before UI counters use it.

Read revision, artifact digest and expected command revision serve different purposes. The response-byte SHA-256 used for SF snapshot comparison must never become an assignment concurrency token. Revalidate scope and permission when executing a command even if an earlier read enabled a button.

## Command inventory — application contracts still required

| Intent | Required exact binding | Result must distinguish |
| --- | --- | --- |
| Submit contribution | Organization, assignment, subject/version, immutable body/note/input, prior assessment if revised, expected canonical revision, idempotency key | Acknowledgement, admission, definitive rejection, uncertainty, delivery projection |
| Query command | Same organization/principal access and durable command ID/key | Pending/admitted/rejected vs unavailable/not-found with defined retention semantics |
| Record receiver receipt | Exact delivery, current authorized receiver, expected concurrency domain | Admitted receipt record vs acknowledgement; never editorial acceptance |
| Record assessment | Exact receipt/delivery/version, conclusion and rationale, authorized assessor | Admitted assessment identity; never implicit publication or verified outcome |

No URLs, HTTP verbs or generated clients are frozen here. A browser-supplied actor/persona is display context; the service derives the principal and effective permission. Backend owners must define schema/versioning, concurrency domain, idempotency scope/retention, rejection vocabulary and exact record references. A human receipt must not be serialized as a Forge execution receipt solely because both are called receipts.

## Read and command lifecycle

1. Select explicit scope; retain local draft and distinguish it from the last observed remote projection.
2. Start a cancellable read. Reject malformed/unsupported/wrong-scope responses before exposing records. Ignore obsolete responses after navigation or a newer read.
3. On read failure, retain earlier data with an explicit stale/unavailable notice and observation time. Do not call it current. A production freshness duration is not specified by this prototype.
4. Review immutable intent and canonical expected revision before submission. Keep durable command correlation through navigation/reconnect; the current local checkpoint is not that server store.
5. Pending/unknown acknowledgement preserves the intent and blocks duplicate submission. Query the same identity. Timeout, cancellation and generic not-found do not prove rejection or nonexecution.
6. Definitive permission denial keeps the draft and requires authority review. Conflict keeps both submitted intent and refreshed canonical context available for deliberate reconciliation; no automatic merge is assumed.
7. Admission freezes the intent. Refresh/read its exact delivery projection without resubmitting. Receipt, assessment, authorization and outcome remain separate.

Race prevention only stops obsolete data from replacing newer data. It does not establish freshness, authorization or atomic reads. Imported demo files are never submitted automatically, treated as remote truth or used to recover authenticated command identity.

## Executable sample adapter

[`src/integration/contributionPort.ts`](src/integration/contributionPort.ts) provides an injected local checkpoint reader, not an HTTP client. It validates with the existing bounded checkpoint parser, accepts only Knowledge K-01-H, and labels successful data `local-demo-checkpoint`. Capture time is the checkpoint save time, not a server observation or coherent revision. Scope checking is demo routing, not authorization.

`latestContributionReader` ignores late responses and supports explicit invalidation on navigation. Errors carry no replacement state. Every backend operation returns `unsupported` without sending anything. This keeps the distinction between the existing explicit local simulator and a future application backend executable.

```ts
const port = createDemoContributionPort(async () => checkpointText);
const reader = latestContributionReader(port);
const result = await reader.read(contributionScope, controller.signal);
if (result.state === "available") {
  // Preview result.value; require an explicit local replacement decision.
  // Never overwrite an unsaved draft simply because a read succeeded.
}
// On leaving scope: controller.abort(); reader.invalidate();
```

This sample is not wired into current screens and does not migrate all components to a repository abstraction. A real adapter must validate a new approved application projection rather than disguise server JSON as a demo checkpoint. Preserve the existing SF validator for historical evidence inspection.

## Next implementation gates

1. Backend owners define one authenticated read slice and its scope/revision/availability semantics. Start with SF inspection if existing packaged observations are the intended source; do not pretend this provides organization membership.
2. Add a validating real adapter and test missing fields, denied scope, cancellation, stale/late response and cross-organization isolation using the approved schema.
3. Introduce one screen behind an explicit data-source selection. Label historical/read-only data and retain independent local draft state. No silent demo fallback on backend failure.
4. Implement one approved mutation only after submission/query/idempotency/authorization contracts are jointly defined. Verify uncertain acknowledgement and delayed read projection before enabling receipt/assessment mutations.

No backend setup or developer data is required for the completed scaffold. Actual connection needs the application projection schema, authentication environment and command guarantees above.

## Validation

Build and six targeted checks passed across runs: valid checkpoint with unknown command preserved; all operations unsupported; wrong scope, invalid version/JSON, unavailable source and abort; superseded/navigation-invalidated reads; existing contribution lifecycle and desktop/phone cross-screen consistency. No live backend or deployment was tested.

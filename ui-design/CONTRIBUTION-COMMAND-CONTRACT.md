# Human contribution command — draft v1

Status: local frontend contract proposal and simulator, not an implemented SF endpoint or Forge command. `src/data/contributionCommand.ts` is the executable bounded model. It works only with the fictional human contribution exercise; it does not write real retained SF records.

## Intent and identity

One intent names assignment, exact subject/version, immutable text/note/input citation, optional earlier assessment reference, expected assignment revision, command ID and idempotency key. The actor is deliberately not supplied as a client-authoritative field. A real application derives the authenticated principal and checks its current scope and effective permission.

The expected revision tokens are explicitly demo-only. They are not generated from the SF read snapshot digest, an artifact digest or an attempt ID. A backend must define the concurrency domain and canonical assignment revision before adopting this contract. The conflict preview is an authored rejection; it does not inspect a real concurrent write. Changing demo outcomes is not an actual refresh of authority or context.

A real service must scope idempotency to principal/organization/operation, bind the key to the complete immutable intent, and return the same command/result for the same intent. Reusing a key with different intent must fail. This simulator prevents repeat submission while a command is pending/unknown/admitted but unprojected; it is not a durable idempotency service and does not establish these server guarantees. A definitively rejected intent can be edited and submitted as a new command/key; prior attempts remain inspectable locally.

## Status, admission and projection

| State | UI behavior | What it does not establish |
| --- | --- | --- |
| pending | Preserve submitted intent; query the same command | Admission, delivery or receipt |
| unknown | Lock duplicate submission/editing; query same ID/key | Rejection, nonexecution or safety of retry |
| rejected | Preserve draft; show permission/revision reason | Delivery or restoration of permission |
| admitted | Keep intent frozen; wait for projection | Receiver receipt, acceptance, publication or outcome |
| admitted + projection updated | Exact delivery appears in the local exercise | Independent receiver action or real governed admission |

Transport acknowledgement and admission are distinct. A pending response can settle via a status query. Unknown is an observation about acknowledgement, not a terminal server execution state. A real status query returning unavailable/not-found must not be converted to rejected unless the service's contract establishes a definitive absence; the demo exposes still unknown instead.

The default preview admits and projects immediately to preserve the existing walkthrough. Other outcomes are explicit controls under **Command delivery simulation**. Status-query controls simulate admission, definitive rejection or continued uncertainty. **Simulate delivery projection refresh** can only project the admitted, unchanged payload for its exact version. It cannot project unknown/rejected commands or edited/different subjects. Repeated projection does not create another delivery.

Admission timestamps are separate from submission timestamps. Command history is local mutable session data, not a durable audit trail. Navigation retains the exercise; reload clears it. Demo continuity does not save/export it. Receiver receipt/assessment and revision lineage remain their own records.

## Proposed backend responsibilities — still missing

- Versioned canonical intent/status schemas and authenticated, authorized submission/query surfaces.
- Current server-derived actor/scope/permission and expected-revision enforcement at admission, including changes after UI confirmation.
- Durable correlation/idempotency records, duplicate-intent comparison and well-defined retention/access rules.
- Explicit rejection and uncertain-status semantics; success means admitted material only when the response actually establishes it.
- A governed delivery/record reference and coherent projection revision so the UI can observe admission without resending during read-model lag.

No endpoint names or generated client are frozen by this prototype. The read projection's nullable snapshot checksum cannot serve as a command concurrency token. This draft documents the required separation before real implementation; it does not claim backend approval or deployment.

Previews: [desktop command status](previews/93-contribution-command-1440.png), [mobile command status](previews/93-contribution-command-390.png).

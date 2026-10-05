# Software Factory snapshot inspection

Demos → **Open SF snapshot** opens `#/demos/sf-snapshot`. The selected attempt has a deep link, for example `#/demos/sf-snapshot/snapshot-attempt-02`, which survives reload and browser history.

One bundled JSON dataset supplies the assignment, two retained attempts and one work-product response. The failed launch has no exit status or artifact; the produced attempt points to its exact artifact identity and response. The UI displays decoded example text, independently named artifact/content/blob identities and unavailable verification/approval/effect material. Missing worker, actor and node are not inferred.

## Source boundary

The fixture is **synthetic**, not a capture or redacted production record. No development retention roots, diagnostic streams, credentials or private planning excerpts were copied. Synthetic artifact/attempt identities do not identify governed objects. Blob and typed-payload identities were computed for the example bytes/body, but the viewer performs no cryptographic verification or provenance verification.

Shape references inspected read-only:

- `forge-software-factory@f25def2`: `internal/taskrun/assignment.go`, `retention.go` (`AttemptRecord` schema 2) and `workproduct.go`. These define SF's current consumer/retention shapes, **not a public HTTP application contract**.
- `forge@1ca7404`: `docs/operating.md`, work-product response; `docs/contracts/typed-payload.md`, typed-payload v1. Work-product delivery cannot alone establish artifact provenance.

`public/snapshots/sf-example-v1.json` wraps those fields in a prototype-owned versioned inspection envelope. `src/data/sfSnapshot.ts` validates supported versions, required display fields, relationship identity, duplicate records, timestamps, product kind and example text encoding. It is a bounded inspection adapter, not a full Go-schema validator or generated production client. A separate redacted retained envelope is also supported, as described below.

The view fetches a packaged static snapshot, not an SF server. Source revision/time remain visible; neither indicates runtime freshness. A failed fetch or invalid dataset removes the projection and offers retry without claiming execution failure. Unavailable work products remain unavailable.

## Validation and next boundary

Targeted browser checks cover mobile/desktop navigation, reload, no inferred work product/exit status, exact relationship selection, malformed/version/foreign-link rejection and failed fetch/retry. Related demo continuity and deferred-screen checks cover the shared entry point.

The first increment delivered schema-shaped synthetic inspection; iteration 92 adds a real redacted retained export below. A live integration requires a versioned application API and authority/identity handling; the envelope must not silently become that API. The next UI increment is one human contribution/delivery/revision responsibility.

## Real retained run — iteration 92

Demos → **Inspect retained SF run** opens `#/demos/sf-retained`; select the retained attempt or open `#/demos/sf-retained/20260913T153424Z-eb63b7bd05303482` directly. This snapshot was exported read-only from linux3 on 2026-10-05. It captures SF work item 10, which settled on 2026-09-13. Capture time is not execution time or a live health observation.

The allowlist exporter reads the organization-owned assignment file, retained `attempt.json` and retained `candidate/work-product.json`. It does not inspect Forge's private storage, run Forge/provider commands, mutate remote files or read the excluded repo. Assignment ID, scope and expected kind are checked against the attempt; artifact identity and product kind are checked against the retained response. The assignment file is its capture-time representation, not independently proven immutable historical assignment material.

Original attempt ID, timestamps, outcome `produced`, reported platform state `admitted`, process exit `0`, recorded cleanup and artifact/content/blob identities are preserved. This is what the retained records report, not a fresh verification of admission or cleanup. The ledger describes later operator review and a repository effect, but this export includes neither that approval nor an effect record; the UI does not infer them.

`sf-inspection-redacted` v1 is a partial inspection projection, not a replayable assignment or complete Forge work-product response. Objective text/location, repository/working-context host paths, validator/publication commands, execution material, request digest, diagnostics, raw payload bytes and referenced file bodies are omitted. A manifest makes these omissions visible; redacted is different from absent in the original. Unknown identity/authority/node remain unknown.

Before omitting bytes, the exporter hashes the decoded source blob and rebuilds/hashes the typed-payload v1 body; both match the retained digests. The exported integrity results are **exporter observations**, not a signed verifier report. Without source bytes, the browser cannot repeat blob verification. Artifact origin/inputs/supersession remain unverified. No content is rewritten or given a replacement digest.

`src/data/sfSnapshot.ts` validates the envelope and rejects unexpected fields in redacted assignment/attempt/product records. Fetching a wrong-origin snapshot fails rather than substituting synthetic data. The source is packaged JSON, not a live SF endpoint. Existing demo decisions/drafts cannot mutate these records.

Re-export command (explicit read-only capture; review the fixed source selection before using it for a different run):

```sh
ssh -o BatchMode=yes -o StrictHostKeyChecking=yes trungh@100.95.104.52 'python3 -' < ui-design/scripts/export-sf-retained.py > ui-design/public/snapshots/sf-retained-v1.json
```

Run from `x1-codex`. The exporter uses a deliberately narrow allowlist and asserts supported relationships and byte integrity before emitting JSON. Diagnostics/payloads are never written locally by this procedure. The current route validates the selected known attempt; another capture requires updating that bounded source/route contract. This is not a generic importer.

Previews: [desktop](previews/90-sf-retained-1440.png) and [mobile](previews/90-sf-retained-390.png).

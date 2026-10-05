# Software Factory snapshot inspection

Demos → **Open SF snapshot** opens `#/demos/sf-snapshot`. The selected attempt has a deep link, for example `#/demos/sf-snapshot/snapshot-attempt-02`, which survives reload and browser history.

One bundled JSON dataset supplies the assignment, two retained attempts and one work-product response. The failed launch has no exit status or artifact; the produced attempt points to its exact artifact identity and response. The UI displays decoded example text, independently named artifact/content/blob identities and unavailable verification/approval/effect material. Missing worker, actor and node are not inferred.

## Source boundary

The fixture is **synthetic**, not a capture or redacted production record. No development retention roots, diagnostic streams, credentials or private planning excerpts were copied. Synthetic artifact/attempt identities do not identify governed objects. Blob and typed-payload identities were computed for the example bytes/body, but the viewer performs no cryptographic verification or provenance verification.

Shape references inspected read-only:

- `forge-software-factory@f25def2`: `internal/taskrun/assignment.go`, `retention.go` (`AttemptRecord` schema 2) and `workproduct.go`. These define SF's current consumer/retention shapes, **not a public HTTP application contract**.
- `forge@1ca7404`: `docs/operating.md`, work-product response; `docs/contracts/typed-payload.md`, typed-payload v1. Work-product delivery cannot alone establish artifact provenance.

`public/snapshots/sf-example-v1.json` wraps those fields in a prototype-owned versioned inspection envelope. `src/data/sfSnapshot.ts` validates supported versions, required display fields, relationship identity, duplicate records, timestamps, product kind and example text encoding. It is a bounded inspection adapter, not a full Go-schema validator or generated production client. Only this synthetic envelope is accepted.

The view fetches a packaged static snapshot, not an SF server. Source revision/time remain visible; neither indicates runtime freshness. A failed fetch or invalid dataset removes the projection and offers retry without claiming execution failure. Unavailable work products remain unavailable.

## Validation and next boundary

Targeted browser checks cover mobile/desktop navigation, reload, no inferred work product/exit status, exact relationship selection, malformed/version/foreign-link rejection and failed fetch/retry. Related demo continuity and deferred-screen checks cover the shared entry point.

This completes the first **schema-shaped read-only inspection** increment. A real redacted dataset still requires an explicitly prepared export through supported consumer/public surfaces. A live integration requires a versioned application API and authority/identity handling; the envelope must not silently become that API. The next UI increment is one human contribution/delivery/revision responsibility.

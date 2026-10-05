# Local demo save and transfer

Open **Demos → Demo continuity** in the main sample.

1. Choose **Save local snapshot** to keep the current state in this browser. Reload restores the last explicitly saved snapshot; later edits are not saved automatically.
2. Choose **Export demo snapshot** to download current state as `forge-ui-demo-v1.json`. Export does not require a prior local save.
3. On another machine running this UI, import the file, review the snapshot summary, then choose **Apply imported snapshot**. This replaces current main-sample work and saves the imported state locally. Export first if you need the existing work.
4. **Reset local demo** offers a separate confirmation before clearing current and saved state. Authored samples remain available.

The versioned main-sample format includes response text drafts, structured assessment criteria/conclusion/evidence selections, reconciliation conclusion, local response receipts and recorded responsibility proposals/plan decisions. Assignment completion indicators are rebuilt from those local receipts. No live SF execution, effective permissions or verified organizational outcomes are restored.

Unrecorded proposal forms, pending submission state, navigation/filter context, simulation controls and independent read-only scenario fixtures are outside this snapshot. Import/reset clear local submission simulation state and return release readiness to missing; a restored approval receipt is still only a local historical demo record.

Local storage belongs to this browser and origin, including port. Moving to Mac M1 requires the exported file; it is not automatic sync. Local storage is not a shared audit log or backup service. Use the same UI fixture/format version when transferring.

Import validates format/version/scope, known assignment and proposal references, response kinds, structured fields and evidence/criterion references, rejects unsupported keys and limits the JSON file to 1 MB. Invalid import leaves current and saved work unchanged. Storage errors are reported; export remains available when local save is unavailable. A malformed saved snapshot starts with the normal sample state and reports recovery context in Demo continuity.

No server integration or real-world authority is created. Snapshot content is local user-supplied demo data.

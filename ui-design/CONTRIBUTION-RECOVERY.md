# Knowledge contribution checkpoint recovery

Iteration 105 adds a separate browser checkpoint for the shared Knowledge contribution exercise. Open **Save or restore Knowledge contribution** from any Knowledge workspace screen.

1. Choose **Save contribution checkpoint**, then confirm replacing the saved checkpoint with the current exercise. Later changes require another save.
2. Reload still starts the contribution exercise empty. Choose **Review saved contribution** to read and validate the saved checkpoint.
3. Inspect its save time, version/command totals and latest command status. Confirm restoration to replace current Knowledge work, including unsaved edits, or cancel without replacing it.
4. Removing a saved checkpoint requires confirmation and leaves current session work untouched.

This checkpoint includes draft text/notes, citations, immutable delivered revisions, receiver receipts, authored revision-request records and complete command history. It excludes standalone Demos contribution, main software demo state, navigation and retained SF data. The existing Demos continuity format is unchanged. Storage belongs to this browser/origin; no cross-machine transfer, automatic saving, automatic restoration, server query or durable/shared organizational storage is added.

## Validation and uncertainty

The versioned wrapper validates field shapes, bounded sizes (2 MB, two contribution versions, at most 100 commands), fixed assignment/subject/input identities, command sequence/idempotency keys, revision/assessment relationships, delivery/receipt links and status/projection constraints. Unsupported, malformed or inconsistent state is rejected before replacement. This is local-format validation, not authenticated provenance.

Unknown/pending command acknowledgement preserves the original payload and command/key identity and remains locked after restoration. Admitted-but-unprojected commands still await projection. Receipt remains separate from assessment; a second-version receipt does not accept the result or establish publication. Unsaved changes after a checkpoint cannot be recovered. Restoring an older checkpoint intentionally rolls back local exercise state; nothing queries a live backend to reconcile it.

Blocked/full browser storage or invalid data shows an error without clearing current work. Clearing browser data removes the checkpoint. Labels on contribution/inbox/source views distinguish reload starting empty from explicit checkpoint recovery. Source signals remain local observations and may be restored; they are never described as live organizational facts.

## Verification

Model checks cover unresolved commands, admission/projection lag, two-version history, payload/identity consistency and invalid formats. Desktop/phone browser tasks cover explicit save/review/cancel/restore, unknown-command locks, exact command-status focus and invalid-checkpoint removal. Storage failure must preserve the draft. Existing contribution, receiver, attention and command tests protect the shared work path. No participant session is claimed.

## Persistent save status — iteration 107

A save-status line now sits outside the checkpoint disclosure on Knowledge screens. It distinguishes no checkpoint, current work matching a checkpoint (with save time), unsaved differences, an available checkpoint not restored into an empty session, and unavailable/invalid storage.

Comparison covers the complete contribution/command/receiver state, not merely draft text. Receipt, assessment and command transitions can therefore make a saved exercise differ. Object key order is normalized for comparison; omitted command history and an empty command list are equivalent. Editing back to the saved state correctly restores the matching status.

The status reads the validated browser checkpoint on mount and refreshes after save/review/removal, browser focus and relevant cross-tab storage events. A preview does not restore anything. Reload does not claim a nonempty saved exercise is already loaded. Storage failure never creates a new saved timestamp. Cross-tab refresh only updates checkpoint status, not the current exercise. Save/restore remain explicit and local.

## File transfer between machines — iteration 108

Open **Save or restore Knowledge contribution → Move contribution between machines**.

1. On the source machine, choose **Export current contribution**. The browser downloads `forge-knowledge-contribution.json` containing the current exercise, including unsaved draft/command/receiver changes. This does not update the browser checkpoint.
2. Transfer the file using your own file-transfer method and open a compatible UI version on the destination machine.
3. Choose **Import contribution file**. Format, size and record relationships are validated before an import preview is offered. Inspect the file capture time, version/command totals and latest command status.
4. **Cancel import** leaves current work untouched. **Confirm import contribution** replaces current Knowledge session state, including unsaved work. No merge or server reconciliation is performed.
5. Save a contribution checkpoint explicitly on the destination browser if you want local recovery after reload. Import itself does not modify that browser's saved checkpoint.

The existing versioned checkpoint wrapper is reused. On export its `savedAt` field denotes file capture time, displayed as **File captured** in the import preview; it is not evidence that browser storage was saved. Unknown/pending commands, admitted projection lag, exact payloads and idempotency identities retain their original behavior. File-format validation does not authenticate provenance.

Files include entered contribution text and local records. Standalone Demos, main-software continuity snapshots and historical SF data are separate and cannot be imported as this format. Files larger than 2 MB, unsupported formats, malformed JSON or inconsistent relationships are rejected without replacing work or checkpoint. While a file is being read, checkpoint/export actions are disabled; a newer file selection supersedes earlier reads. Same-file reselection is supported after cancellation or rejection.

Technical transfer checks use independent browser contexts, not a physical Mac session. Actual cross-machine transfer is manual; the UI neither uploads files nor synchronizes machines.

## Replacement impact preview · iteration 116

Restore/import previews now show current and incoming stages, the next contributor step after replacement, versions added/removed and changed text/note/citation/delivery/receipt/assessment fields. Command history replacement is explicit, including counts even when the latest status is unchanged. Current work is compared with the readable browser checkpoint; when no comparison is available, the UI says so rather than claiming work is saved.

Two disclosures expose current and incoming text, notes, citations, receiver identities and command statuses before confirmation. Differences from the saved checkpoint are warned about, with export suggested before discarding current work. Restore/import still replaces the whole local exercise, preserves the browser checkpoint and never merges histories or cancels server operations. The impact derives from current props, so edits while the preview is open are reflected. Cancellation changes neither current work nor the saved checkpoint.

Production build and thirteen targeted checks passed across desktop/320px rollback and unsaved-text previews, cancel/restore preservation, checkpoint/storage failures, file transfer and Chromium/Firefox keyboard recovery. No participant session was conducted.

Revision update · iteration 132: [content revisions](CONTRIBUTION-REVISIONS.md) now support draft-03 through draft-09 after an explicit revision request. Each has separate exact delivery/receipt/reassessment and comparison with its predecessor. Contribution checkpoints use v3 for three or more versions; v1/v2 remain readable. Use cycles still apply only to the same assessed draft-02; authorization does not transfer to changed material.

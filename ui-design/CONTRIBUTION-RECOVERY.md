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

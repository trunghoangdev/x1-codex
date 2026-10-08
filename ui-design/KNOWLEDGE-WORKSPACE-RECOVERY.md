# Whole Knowledge workspace recovery

Knowledge now has an explicit checkpoint covering contribution, K-02 brief delivery/receipt, K-01 adoption history and bounded-use records together. Open **Save or restore whole Knowledge workspace** on Knowledge pages. This is local browser/file recovery, not shared backend storage.

## Operations

- Save: confirm overwriting the browser checkpoint with current four-slice state. It does not overwrite the existing contribution-only checkpoint.
- Review saved workspace: inspect the replacement preview and confirm or cancel. Reload starts an empty session; no checkpoint is restored automatically.
- Export: download the current complete workspace as `knowledge-workspace.json`; it does not save browser storage.
- Import: validate a whole-workspace file or existing contribution v1/v2 checkpoint before preview. Whole replacement replaces all four slices together in one React update. Contribution-only replacement keeps brief, adoption and use history; it can make the retained use source stale.
- Remove: confirm deletion of the browser workspace checkpoint only. Current session and contribution-only files/checkpoints are preserved.

The preview identifies changed versus retained slices, current/incoming use stage and blocking reason, exact usable brief version and adopted audience. Expand exact records to inspect removed and incoming text, versions, decisions and history. The preview derives retained state from the current session; confirm never silently merges unrelated scopes or saves the restored state.

Existing contribution recovery controls remain supported and now explain their effect on retained dependent use records before confirmation. Personal actor selection, filters and navigation are not work records and are not saved by this format. Main Software Factory snapshots remain independently scoped.

## Format and validation

Format `forge.knowledge-workspace.v1`, browser key `forge-knowledge-workspace-v1`. Import limit 4 MB; brief versions and adoption history each have a 200-record limit. Contribution validation retains its existing command/version/checkpoint constraints.

Brief histories are reconstructed through versioned delivery and receipt operations, checking exact receipt identity and delivery timing. Adoption history is replayed to validate versions, adopter/scope, duplicate prevention and supersession. The use chain validates its frozen draft/delivery/receipt/assessment source and replays each separate mandate, assessment, authorization, execution, reader observation and outcome transition. Record IDs, actors, source links and criterion must match the represented operations; unknown fields and unsupported formats are rejected.

A well-formed but stale use subject is preserved as historical state. Current/incoming source mismatch is visibly blocked by the existing common progress projection rather than repaired or deleted. JSON files cannot establish authenticated authority or prove that any observation occurred.

Invalid files, blocked storage and quota errors leave the current session unchanged. Asynchronous file results are ignored after a newer recovery operation or unmount. Keyboard focus moves to confirmation/preview and returns to the recovery heading after confirm/cancel.

## Validation

Eighteen distinct targeted checks passed across runs, covering whole/partial recovery, source changes, invalid lineage/fields/formats, phone/desktop save/export/reload/restore/cancel/remove, storage failures and existing contribution/brief/agreement/use paths. Production build and diff checks passed; the existing bundle-size advisory remains. No backend or participant result is claimed.

Scope update · iteration 129: [exact applicability decisions](SCOPE-APPLICABILITY.md) now connect represented records to adopted scope and guard pending use authorization/execution. Whole workspace checkpoints include this history in format v2; v1 remains readable. This supersedes earlier statements that record-by-record applicability is unimplemented.

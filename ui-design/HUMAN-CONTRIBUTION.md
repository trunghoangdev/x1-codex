# Human contribution exercise

Demos → **Try human contribution**, or `#/demos/human-contribution`, opens an interactive fictional responsibility: a human contributor prepares an onboarding guide for an editor. This is independent from the Knowledge authored walkthrough, main assignments and retained SF snapshot.

The contributor inspects the input and expected deliverable, writes text plus a delivery note, and cites the authored input. **Review delivery** shows the exact subject/version, receiver, content and citation before **Record local delivery** freezes that version. Editing is no longer available on delivered text.

Receiver receipt and assessment are separate explicit simulation controls. Receipt names the delivery; the first-version assessment names the receipt and requests revision. Its rationale is an authored scenario response, not automated judgement of the user's text. A contributor cannot create the first assessment before the receiver receipt.

**Prepare draft-02** copies the earlier delivered text into a new editable revision. Its new delivery note/citation must be supplied. The revised delivery references the first assessment; earlier content, delivery, receipt and assessment remain unchanged. Draft-02 can receive its own receipt but ends with reassessment pending. No acceptance, publication authorization or outcome verification is inferred.

## State and boundaries

App-owned in-memory state survives navigation away and back within the current session. Reload clears the exercise, as explained on screen. The existing Demo continuity save/export/import does not include this independent exercise. No server, upload, actual editor message, authenticated identity or governed admission is involved. A shared URL opens the screen, not another person's contribution.

The bounded frontend types and transition helpers in `src/data/humanContribution.ts` are not a production contribution protocol. This two-version exercise does not generate assignments, bind workers, adopt policy or modify the real retained SF metadata. Live work needs the application contracts and authority handling described in the architecture review.

Validation covers required fields, confirmation/edit return, independent receipt/assessment gates, immutable first-version records, revision lineage, session navigation, mobile overflow and explicit reload reset.

Previews: [desktop revision](previews/91-human-contribution-1440.png) and [mobile revision](previews/91-human-contribution-390.png).

## Command status simulation — iteration 95

Delivery confirmation now records a local command intent. Expand **Command delivery simulation** before confirmation to preview pending/unknown/rejection/revision conflict or admitted-but-unprojected outcomes. Default admission plus immediate projection preserves the original walkthrough. Pending/unknown locks the submitted text; query the same command before proceeding. Admitted work can wait for explicit projection refresh before any delivery/receiver record appears. See [the draft command contract](CONTRIBUTION-COMMAND-CONTRACT.md).

## Knowledge My Work entrance — iteration 99

Knowledge Operations → select Leo → My Work → **Open contribution · K-01-H** opens the existing preparation/delivery/revision UI with organization and K-01 workstream context. K-01-H is an explicitly authored preparation responsibility scoped to Leo's coordinator binding. It is separate from researcher K-01-D and distribution-scope K-01-P; it does not replace their authored records.

The integrated exercise has its own app-owned session state, separate from the standalone Demos exercise. Navigation preserves drafts, immutable deliveries and command history; reload clears them. Neither exercise is included in Demo continuity. The inbox repeats that boundary before opening preparation and reports only the latest local delivery observation. Its other assignment/coordination records remain authored and do not advance from this exercise.

The route is `#/organizations/knowledge/contributions/K-01-H?persona=leo`. Other personas cannot open that preparation route; switching persona there returns to the chosen person's inbox. This is sample navigation, not an authentication or permission check. Receiver buttons remain explicitly simulated inside preparation; a shared receiver inbox is the next item, not part of this increment.

## Shared receiver and organization views — iteration 100

Knowledge Operations now uses the same session records across Leo's contribution, Maya's My Work and the Organization overview. Maya's **Contribution for Maya** panel lists delivered revisions with frozen text, scope note, cited input and exact delivery/receipt/assessment relationships. Draft text and commands awaiting delivery projection do not appear as received work.

Maya may **Record sample receipt · draft-01**, then **Request sample revision · draft-01**. Receipt is required before the revision request. The request uses the existing authored scenario guidance, not an evaluation of entered text. Leo's inbox then exposes the revision request; preparation responds to its exact assessment ID and creates a separate draft-02 delivery. Maya may receive draft-02, but reassessment is intentionally pending.

Integrated contributor views no longer offer the receiver simulation controls: switch the sample persona to Maya to act as receiver. Standalone Demos retains its original receiver controls and independent state. Persona selection grants no real permissions. All these records are local session observations, not server-admitted receipt/assessment records.

Organization's **Contribution exchange · K-01-H** panel shows the same history, with delivery, receipt and assessment distinct and a direct receiver-inbox link. Existing authored coordination counts and outcome requirements are not advanced by these records. Both earlier delivered revisions and earlier receiving records remain inspectable; reload clears the complete shared exercise. Demo continuity still excludes it.

## Main task path — iteration 102

Integrated preparation opens with **Current task**, the current draft version, required deliverable and a state-specific next step. A keyboard-operable shortcut focuses the editor while preparing, or the command-status heading while acknowledgement/projection is unresolved. Exact input remains open beside responsibility context; confirmation explains the exact-version review step. Unresolved status keeps editing/submission blocked and explicitly says not to submit again.

Integrated version history is collapsed by default and remains available through its labeled disclosure. Standalone Demos keeps its history open. Maya's inbox presents the newest delivered revision first, makes the receiver's next step explicit, and collapses earlier revisions. Organization keeps its exchange observations inspectable. Draft preparation, receipt, revision request and pending reassessment retain their original meanings; no new authority or backend behavior is introduced.

## Explicit Knowledge checkpoint — iteration 105

Knowledge now supports a separate [contribution checkpoint](CONTRIBUTION-RECOVERY.md). Reload still starts empty, but users can explicitly save, review and restore the shared draft/command/delivery/receiver state. Demos continuity and standalone contribution remain independent. This supersedes earlier statements that Knowledge work can only be lost on reload; unsaved work still cannot be recovered.

## Portable Knowledge exercise — iteration 108

The [recovery controls](CONTRIBUTION-RECOVERY.md) now support exporting current work and importing a validated file into another browser/machine. Import requires a preview and confirmation, replaces the whole local exercise, and does not change the saved checkpoint until an explicit save. Standalone Demos and real retained SF sources remain separate.

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

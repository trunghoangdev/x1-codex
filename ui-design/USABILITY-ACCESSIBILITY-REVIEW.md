# Task usability and accessibility review

Review date: 2026-10-05. Baseline: iteration 96. This pass fixes technical issues and prepares participant tasks. **No human usability sessions or assistive-technology sessions have been conducted.** Browser automation is not user research or WCAG certification.

## Findings and changes

| Finding | Result |
| --- | --- |
| Human confirmation/delivery/revision removes the active control without a next focus destination | Fixed: confirmation heading, editor on cancel, command-status heading after submit, receiver heading after receipt/assessment, editor for draft-02 |
| Contribution inputs do not expose their shared requirement context to assistive technology | Fixed: explicit requirement text connected through aria-describedby to text and note controls |
| Receiver receipt/assessment changes lack a dedicated live status | Fixed: delivered/receipt/assessment summary has polite status semantics |
| Operator exact-source buttons must work by keyboard, not only pointer | Verified on retained snapshot: Enter focuses the matching attempt/product source heading |
| Unknown acknowledgement can be confused with failed work or permission to retry | Existing copy and submission lock tested; comprehension with people remains untested |
| Platform admission/exit zero could be mistaken for publication authority/effect | Existing trace preserves explicit gaps; reviewer/authority tasks below test comprehension rather than assuming it |
| Inspection is long and repeats context across multiple panels | Remaining usability hypothesis: ask operators which details they need first before restructuring the layout |

Focus changes occur only at stage transitions, not while typing. Programmatically focused headings use tabindex=-1 and do not add extra ordinary Tab stops. Form editing does not clear earlier command history or immutable delivered revisions. No data/backend semantics changed.

## Technical verification

Targeted Chromium checks cover worker keyboard confirmation/cancel/submit/revision on 390px and 1440px screens; form-description association; live receipt state; operator source-link keyboard focus; existing contribution/command uncertainty behavior; and directory empty-list recovery. Separate existing reviewer assessment, exact-subject release, phone response-focus and unknown-attempt checks are included in this pass.

This is bounded task verification. It does not cover a full WCAG audit, axe certification, actual screen-reader announcements, browser/OS combinations, 200–400% zoom, forced colors, all contrast pairs, every route or production identity/permissions. Those remain explicit follow-ups. Earlier browser-test names mentioning customers do not establish participant testing.

## Participant task plan — ready, not yet run

Use fictional data and the redacted snapshot only. Tell participants that responses are local demonstrations and identify which exercise resets on reload. Ask them to think aloud; observe first and avoid suggesting buttons. Record success/assistance, misinterpretations, unexpected navigation and lost context. Time can be recorded, but no measured baseline exists yet.

### Worker

Start at Demos → Try human contribution. Ask: “Prepare a short guide from the supplied input and deliver it for review. Explain what happened and what still needs someone else's action.” Then preview unknown acknowledgement and ask what they would do next. Finally obtain the illustrative revision request and prepare draft-02.

Expected distinctions: responsibility vs receiver; exact version frozen by delivery; unknown requires status query, not duplicate submission; receipt is not assessment; earlier version stays unchanged. Observe whether the local-only/reload boundary is understood. Repeat using keyboard alone where the participant is comfortable.

### Reviewer / authority participant

Start at My Work → A-1042. Ask: “Inspect the candidate and evidence, identify what remains uncertain, and record a justified assessment.” Then inspect A-1041 release prerequisites and ask whether assessment, successful checks or approval establish deployment.

Expected distinctions: evidence citations refer to the reviewed subject; criteria can remain unreviewed/unsupported; release decision binds the exact candidate; approval is not an observed effect. Observe whether the action panel and draft return can be found without guidance. Do not mark all prerequisites satisfied merely to manufacture task success.

### Operator

Start at Demos → Inspect retained SF run. Ask: “Find the selected attempt's work product and explain what the source actually establishes. Who is accountable, which policy authorized publication, and did the effect happen?”

Expected distinctions: retained metadata vs sample persona; capture time vs execution time; source-provided artifact links vs unverified provenance; responsibility/policy/assessment/effect unavailable. Ask them to inspect a source and return their attention to the trace. Unknown is a valid answer, not task failure.

## Session record template

| Participant / role | Task / device / input method | Completed unaided? | Misinterpretation or friction | Evidence / next change |
| --- | --- | --- | --- | --- |
| Not run | — | — | — | No participant results yet |

Never insert inferred participant results or synthetic completion percentages. Preserve observed wording and distinguish a design interpretation from what the participant actually said.

## Next checks

1. Run the prepared tasks with actual worker/reviewer/operator participants and prioritize observed errors over additional screens.
2. Check these tasks with a screen reader, zoom/forced colors and another supported browser; confirm heading focus/status announcement behavior in the actual combination.
3. Evaluate inspection density and source-return discoverability using task observations. Keep unavailable facts visible without repeating every boundary explanation.
4. Recheck accessibility when authentication, live admission and concurrent updates arrive; current local controls cannot validate production error/permission semantics.

## Follow-up display checks — iteration 98

Chromium and Firefox reflow/forced-colors checks have now been run: see [environments, results and manual zoom limits](DISPLAY-ACCESSIBILITY-REVIEW.md). This resolves a bounded second-browser technical check, not full cross-browser coverage or the outstanding actual screen-reader/user sessions.

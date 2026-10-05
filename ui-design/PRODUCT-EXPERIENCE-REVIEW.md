# Virtual organization product experience review

Reviewed 2026-10-05 after iteration 98. This is a source/design review, not a new browser or participant study. Inspected current overview, coordination, personal-work, contribution, scenario models and shell routing alongside the recorded architecture/accessibility reviews. No excluded repository or live environment was read.

## Assessment

The design communicates a virtual organization well: shared purpose, parallel streams, responsibility independent of worker type, personal participation, versioned handoffs and separate assessment/authority/effect. Software-specific inspection remains useful depth rather than the definition of every organization.

The next opportunity is a coherent experience of working together. Inspection is extensive; interactive contribution, shared coordination and retained SF inspection remain separate experiences. Three authored organizations demonstrate design breadth, not operational generality. A successful next slice should let participants explain how their own work changes what another person needs to do and what the organization can observe.

## Current strengths and gaps

| Area | What exists | Most useful next improvement |
| --- | --- | --- |
| Organization | Purpose, coordination counts, directories, scoped responsibilities | Show concrete actionable coordination needs before requiring several detail screens |
| My Work | Main responses; read-only Knowledge/large persona inboxes and follow-up | Connect ordinary contribution and revision to a personal assignment |
| Collaboration | Authored dependencies/history and a separate interactive two-version contribution | Let one coherent sample carry contributor and receiver views of the same records |
| Authority/evidence | Exact-subject review, local receipts, source gaps | Preserve the distinctions while making the primary task easier to find |
| Source data | Synthetic and real historical redacted SF inspection | Keep datasets separate; live authority/integration requires an application API |
| Usability | Recorded keyboard, reflow and two-browser checks | Participant comprehension and actual screen-reader sessions remain untested |

## Proposed next sequence

### 1. Bring contribution into My Work

Use the existing fictional Knowledge responsibility as the first bounded integration. Give it an explicit organization, workstream, assignment and contributor relationship. My Work opens preparation, input, exact-version delivery and revision directly; organization and workstream links provide return context. Reuse the existing command uncertainty and immutable-revision mechanisms.

Start with contributor navigation and assignment context only. Keep the receiver simulation explicitly labeled until item 2. Do not reuse a retained SF identity or imply backend admission. Decide and disclose reload/save behavior before offering this route; the current contribution exercise is excluded from Demo continuity.

Acceptance: a participant starts from My Work, finds what they owe, prepares a draft and returns to the same organization/assignment without losing session state. Existing standalone demo remains reachable and current command-status behavior is preserved.

### 2. Connect contributor and receiver views

Build on item 1 with one shared sample record set. A receiver persona sees the exact delivered revision, records the existing sample receipt/revision request, and the contributor sees the resulting next responsibility. The organization shows delivery/receipt/assessment as distinct observations. Persona switching is a demo mechanism, not authentication.

Acceptance: both views reference the same delivery/version; revision requests appear in the contributor view; earlier content stays inspectable. A received contribution does not automatically satisfy an outcome or establish publication authority.

### 3. Make organization attention actionable

Refine the existing overview instead of adding another dashboard. For represented coordination needs, expose the affected subject, known follow-up owner, reason for waiting and useful destination. Prefer a compact list with details on demand. Missing ownership stays unknown; no invented deadlines, urgency ranks or progress percentages.

Acceptance: from Organization, a participant can identify one concrete coordination need and reach its responsible work/context. Local state updates reflect only the linked sample records, with overlapping signals still distinguished from unique tasks.

### 4. Simplify the main task path

Review the integrated contributor/receiver/organization paths at desktop and phone widths. Keep input, expected result, current version and next action prominent. Move repeated technical explanations into scoped details while retaining visible sample/source boundaries and consequential warnings. A command's unknown acknowledgement must remain obvious and block unsafe duplicate actions.

Acceptance: participants can explain the next action and distinguish delivery, receipt and assessment. Targeted keyboard/reflow checks protect modified paths; actual participant/screen-reader findings must be recorded separately from automation.

### 5. Test the collaboration story with people

Prepare a short walkthrough of the integrated path and run contributor, receiver and coordinator tasks. Record wrong turns, misunderstood states, number of navigation steps and requests for missing context. Compare findings against the existing task plan before selecting more UI work.

Acceptance: observations come from actual sessions, not invented outcomes. If participants are unavailable, provide the task script and leave results explicitly unfilled.

## Later, or dependent on other work

Live SF integration, authentication, server-derived permissions and durable commands need backend contracts and authorized implementation work. Retained snapshots cannot supply these capabilities. Static serving is a separate packaging question.

Organization setup, agreement adoption, worker placement and a multi-organization Control Plane remain product opportunities. Defer broad editors/fleet dashboards until a concrete task and supported data source justify their shape. The completed-product marketing vision describes the destination; it does not make every envisioned screen the next useful prototype increment.

The immediate recommendation is item 1, followed by item 2. Together they turn existing design pieces into a visible organization collaboration loop without expanding the number of fictional scenarios.

## Item 1 implementation checkpoint

Iteration 99 implements the bounded personal contribution entrance in Knowledge My Work for Leo (K-01-H), with explicit K-01/organization context, independent session state and reload exclusions. Item 2, a shared receiver inbox and organizational projection of the same contribution records, remains next.

## Item 2 implementation checkpoint

Iteration 100 connects Maya's receiver inbox, Leo's preparation/revision path and the Organization exchange panel through the same session records. Exact delivery/receipt/assessment relationships and immutable earlier revisions are visible. The receiver request remains an explicitly authored sample response; no backend permission/admission or outcome completion is inferred. Item 3 (actionable organization attention) is next.

## Item 3 implementation checkpoint

Iteration 101 makes Knowledge organization needs directly inspectable through compact subject/reason/responsibility/next-step records, including the shared contribution's receiver/revision/command needs. Full Knowledge/larger attention lists use the same presentation; main attention clarifies equivalent responsibility boundaries. Item 4 (simplify the main task path) remains next.

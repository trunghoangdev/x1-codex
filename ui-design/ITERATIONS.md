# UI iterations

Each iteration is intentionally small and independently reviewable.

## 01 — Assignment attempt history

Implemented an Attempts tab with a separate component and synthetic fixtures following Software Factory's AttemptRecord fields. Open A-1042 to inspect produced, failed-to-launch, and open/unsettled examples. Other assignments show an explicit unavailable-sample state rather than borrowing unrelated records.

- Missing exit status remains “Not observed.”
- Open means completion has not been recorded, not proof of live execution.
- Produced is distinct from candidate approval and external effect.
- Records expose UTC timestamps and an illustrative artifact reference.
- Tabs support Arrow keys, Home, and End; the history adapts to mobile.

No production records were copied. No backend or remote execution was added. Existing screenshot previews show the initial exploration, before this tab was added.

Validation: production build and all five browser tests passed, including the existing decision flows, attempt state distinctions, empty history, keyboard navigation, and phone-width overflow.

Next proposed slice: candidate changed-files list and diff against a pinned base, with explicit sample-data provenance. This is not implemented in iteration 01.

## 02 — Candidate and file diff

Open **A-1042 → Candidate** to inspect three small synthetic files against a fixed sample base revision. File selection displays a line diff calculated from the fixture's complete before/after arrays, with separate base/new line numbers and added/removed counts. Color is supplemented by plus/minus markers.

The candidate and produced attempt share the same synthetic artifact reference. Neither the revision nor digest is presented as verified. Other assignments show an explicit missing-sample state. The illustrative retry snippets are not a complete implementation of the assignment objective or evidence of passing tests.

The diff scrolls within its panel on narrow screens. No production data, backend connection, or mutation of a source repository was introduced.

Validation: production build, formatting checks, and all six browser tests passed. The new test covers file switching, added/removed lines and counts, sample identity labels, assignment isolation and mobile overflow. Earlier screenshot previews remain snapshots of iteration 00.

Next proposed slice: **Checks**, separating validator passed, refused and could-not-run observations from human assessment and approval.

## 03 — Validator observations and decision boundaries

Open **A-1042 → Checks**. A labeled scenario selector previews three independent synthetic observations: validator passed, validator refused, and could not run. These alternatives are not a historical sequence and changing the preview does not mutate an assignment or record a decision.

The observation displays its assignment, attempt, sample candidate-bytes digest, validator, timestamp, execution flag, termination, and optional exit code. Missing status remains “Not observed.” Expand diagnostics to read an explanation, explicitly separated from an authoritative decision.

A second section distinguishes human assessment, publication admissibility, applicability, approval and external effect. An assessment submitted through the existing demo updates only its assessment indicator. Missing gates remain unavailable; a validator pass never becomes an approval. Other assignments have an explicit no-sample state.

No validator was executed and no production observation was copied. The digest is explicitly synthetic and unverified. This UI does not implement production readiness enforcement; the existing release decision demo remains separate.

Validation: production build and all seven browser tests passed, covering the three observation states, absent exit status, diagnostics, assessment separation, assignment isolation, mobile overflow and prior flows.

Next proposed slice: connect the existing release decision demo to an explicit prerequisite summary and exact decision subject, keeping unavailable evidence visibly unavailable.

## 04 — Release prerequisites and exact decision subject

Open **A-1041**. Its authority panel now identifies the sample release digest and production target, separately from A-1042's review candidate. A labeled preview offers missing evidence (default), satisfied prerequisites, and publication refused scenarios. Approval is disabled unless prerequisites are satisfied; refusal remains available with a required rationale.

The confirmation dialog repeats the exact subject. Recording a decision retains its subject, target and prerequisite scenario in local Activity, and locks the scenario selector for that completed assignment. Cancel makes no decision. The submit handler also rejects an approval with unsatisfied prerequisites or a second response to completed work.

These are fictional prerequisites and a synthetic, unverified digest. No real gate runs, no backend enforces authority, and no release is executed. Choosing “satisfied” only exercises the UI. Existing release approval tests now explicitly select that scenario; they still establish that a decision does not establish an external effect.

Validation: production build and all eight browser tests passed. Coverage includes missing/refused prerequisites, cancellation, required rationale, exact subject in confirmation/history, locked completed decisions and mobile overflow. A prior test was narrowed to its Checks panel so the new, separate release scenario selector does not count as a validator selector.

Next proposed slice: a structured decision receipt showing actor, subject, rationale and recording time, with a clear distinction between a local demo record and a server-admitted decision.

## 05 — Structured local decision receipt

Submit a response, then choose **View record** or open **Activity**. A structured receipt replaces the previous free-text activity entry and records a local unique ID, assignment, decision, browser-clock timestamp, demo actor, role, simulated permission, subject, rationale, and release prerequisite snapshot when applicable.

Release decisions retain the exact sample release digest and target. A-1042 assessment receipts refer to the sample candidate-bytes digest. Other sample subjects explicitly state that no immutable digest is connected. The record is copied at submission, filtered by exact assignment ID, and remains stable while navigating in the same session. Historical sample activity no longer acquires a misleading “Just now” timestamp after a response.

The receipt says **LOCAL DEMO RECORD** and explicitly states that no server admitted it, no identity/authority service verified it, and no external effect was established. Refresh clears it. No remote data, persistence, signatures, or backend admission were introduced.

Validation: production build and all nine browser tests passed. New coverage checks actor, permission, subject context, multiline rationale, timestamp stability, assignment isolation, mobile layout and refresh reset.

Next proposed slice: unify the Evidence view and artifact inspector with the assignment-scoped candidate and decision records, replacing the remaining generic sample links.

## 06 — Assignment-scoped evidence and artifact inspection

Assignment Evidence now lists only explicitly associated sample records; its badge counts those records. A-1042 owns its source change, historical test fixture and worker notes. A-1041 owns a separate release subject. Other assignments show an unavailable-evidence state, and their Overview input inspector states that its body and immutable reference are not connected.

The inspector consumes a typed artifact record instead of guessing content from its title. Source content is derived from the candidate fixture; the release identity is shared with the decision subject. Records without a digest say so. The historical “42 passed” fixture is explicitly not an executed check, not verified against the candidate, and not proof of duplicate-event coverage.

The workspace Evidence page groups records by assignment and links available session receipts to that assignment's Activity. Its release chain no longer marks tests and assessment as attached without connected records; the release subject, decision and unestablished effect remain separate.

Validation: production build and all ten browser tests passed. New coverage checks assignment isolation, unavailable evidence, per-artifact content and reference behavior, and inspector layout at phone width. No remote records were copied or backend connected. Initial screenshots remain historical previews.

Next proposed slice: inspect a bounded set of sanitized SF metadata from the authorized development host to refine fixtures against observed data, without exposing logs or credentials or running assignments.

## 07 — Process failure and independent attempt observations

A bounded read-only inspection of allowlisted attempt/validation JSON metadata on the authorized development host informed this iteration. Only aggregate state classifications and field-presence information were returned. No raw diagnostic streams, objectives, credentials, artifact bodies or production identifiers were copied into this repository. Nothing was executed or modified remotely.

The inspected sample included produced/admitted attempts and failed attempts with an observed nonzero process exit but no reported platform state or artifact reference. The UI now represents that second shape explicitly, instead of illustrating every failure as a process that never started.

Open **A-1042 → Attempts** for four synthetic examples. Platform state, process exit, and ephemeral cleanup now appear separately. Missing observations remain “Not recorded”; a process failure does not become a platform refusal. The cleanup wording follows the local SF harness's `destroyed` record value; it is an illustrative observation, not independent cleanup verification.

No open attempts, absent exit codes, or failed validator observations were seen in the bounded sample. Existing examples for those cases remain clearly synthetic edge cases, not claims about production history. The sample is not a complete inventory and cannot establish the absence of other outcomes.

Validation: production build and all eleven browser tests passed. Added coverage checks process-failure semantics, missing platform/artifact coordinates, observed versus unknown cleanup, and mobile overflow. Live data remains disconnected.

Next proposed slice: make the growing assignment interface easier to scan on mobile, with refreshed preview screenshots of the current screens.

## 08 — Mobile assignment navigation and refreshed previews

At phone widths, the six assignment tabs now use a two-row grid with at least 44px touch targets. Candidate file buttons, scenario selectors and response actions also have larger touch targets. A mobile/tablet “Review authority & response” shortcut scrolls to and focuses the authority panel, avoiding a long scroll through candidate content. Existing keyboard tab navigation remains available.

The capture script now regenerates twelve previews, including Attempts, Candidate, Checks, a local receipt, release prerequisites and mobile candidate review. It disables animations during capture to avoid recording intermediate tab transitions. It also uses a cautious assessment rationale rather than asserting that the sample test report proves duplicate-event coverage.

Validation: production build and all twelve browser tests passed. The new test verifies that every phone tab fits horizontally with a 44px target and that the response shortcut transfers focus to the intended panel. Desktop release and mobile candidate screenshots were visually inspected. No backend, remote operation or data-contract change was introduced.

The current preview files replace the historical initial screenshots mentioned in earlier iterations.

## 09 — Explicit assignment review requirements

Open **A-1042 → Overview**. A new Work requirements section provides the review basis: source repository, exact sample base revision shared with Candidate, declared validator, publication criterion, permitted output scope, required effect paths and criteria with the evidence needed to judge them.

Requirements are authored independently of candidate file contents. In the example, documentation is permitted but is not a required effect path. Criteria include bounded retry delay, duplicate-payment prevention, required candidate contents and publication admissibility. No criterion is shown as passed, and the sample snippets explicitly do not establish duplicate-event correctness.

This section describes the underlying work being reviewed, not additional repository-write permission for the reviewer. Other assignments explicitly state that detailed source/scope/criteria are not connected. All requirements are fictional, not imported or reconstructed production assignments. Existing preview screenshots remain at iteration 08.

Validation: production build and all thirteen browser tests passed. New coverage checks base/validator references, scope versus required-path distinctions, unproven criteria, reviewer authority boundaries, assignment isolation and mobile overflow.

Next proposed slice: connect attempt, candidate, checks and receipt views with subject-scoped navigation.

## 10 — Subject-scoped related-record navigation

A-1042 now supports a connected review journey: its producing attempt opens the matching candidate, Candidate links to the producing attempt and Checks, and Checks links to Activity only after a response exists. The receipt links back to its exact sample candidate only when assignment and subject digest match. A release receipt instead links to its release Evidence; it never points to the unrelated review candidate.

Attempts without a connected candidate do not offer a candidate link. Related-record navigation preserves the selected assignment and focuses the destination tab. The Checks scenario is now session state, so leaving and returning to it does not silently reset a could-not-run preview to passed. Only A-1042 currently has this preview model.

These are navigation links over explicit sample relationships, not verified provenance or evidence that any particular preview was used to make a decision. Receipts remain local session records; there is no backend or URL routing change. The previews remain at iteration 08.

Validation: production build and all fourteen browser tests passed. The new journey test follows the producing attempt through Candidate, Checks and Receipt, verifies unavailable links stay absent, checks destination focus and preview retention, and confirms mobile layout.

Next proposed slice: explicit unavailable/error/stale-data states before connecting a live backend.

## 11 — Unavailable and invalidated release decision context

Open **A-1041 → Preview release prerequisites** for three additional fictional cases: review-data load failure, candidate changed, and authority revoked. Each explains the problem and blocks both approval and refusal. Missing prerequisite evidence remains a different state: it blocks approval but permits a reasoned refusal while the decision context itself is available.

The confirmation dialog can simulate invalidation after it opens. Typed rationale is preserved while the context is blocked, but the submit control and submission handler both reject recording. No receipt or completion is created. Reset closes an invalidated dialog and returns the demo to missing evidence; it does not grant readiness or claim a server refresh or restored authority.

The displayed release subject is an old snapshot in the candidate-changed scenario. The UI does not manufacture a replacement candidate or silently apply the previous rationale to a new subject. This remains a local design simulation, not server-side authorization, concurrency control or real error recovery. Other assignment types are outside this slice.

Validation: production build and all seventeen browser tests passed. Three added scenarios cover blocked actions, invalidation after opening confirmation, preserved rationale, safe reset, absent receipts and phone-width overflow. Previews remain at iteration 08.

Next proposed slice: URL-addressable assignment tabs and browser Back/Forward, preserving context without implying persistence of demo responses.

## 12 — URL-addressable screens and browser history

Workspace screens and assignment tabs now use hash routes, suitable for the static prototype without server-side route rewriting:

- `#/work`, `#/organization`, `#/evidence`
- `#/assignments/A-1042/overview`
- `#/assignments/A-1042/candidate` (and attempts, checks, evidence, activity)

UI navigation and related-record links update the URL. Direct links and browser Back/Forward restore the selected assignment/tab. Refresh preserves the screen but resets demo decisions, receipts and scenario state. These values are never encoded in the URL. Repeated navigation to the same destination does not create a duplicate history entry.

Invalid assignment IDs, unknown tabs and malformed routes show an explicit warning with a recovery link to My Work. Route changes dismiss open confirmation/inspector dialogs, preventing a dialog from remaining attached to a different screen. This is view navigation, not backend routing or persistence. Inbox filters, search and scroll positions are outside this slice.

Existing refresh tests were adjusted to check the restored screen and absence of prior session decisions, rather than expecting every refresh to return to the inbox. New browser coverage checks direct links, history navigation, refresh, dialog dismissal and invalid-link recovery. Preview screenshots remain at iteration 08.

Validation: production build and all eighteen browser tests passed for iteration 12.

## 13 — First data/model extraction

Moved fictional assignment and attempt records, shared release identity, and common frontend types out of rendering components into `src/data`. Evidence now obtains the release identity from a plain data module rather than importing the ReleaseReview component. The record values and user-facing behavior are unchanged.

`src/data/README.md` documents the distinction between prototype view models and the still-unestablished backend API contract, plus the remaining extraction work. This slice introduces no network calls, API endpoints, persistence or production authorization. Existing candidate/evidence modules and remaining inline scenario fixtures are explicitly identified; this is not claimed as a complete data layer.

Validation: production build and all eighteen existing browser tests passed after extraction. No new behavior was introduced, so the existing end-to-end regression suite was used rather than adding tests that mirror file moves.

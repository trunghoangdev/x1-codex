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

## 14 — Candidate, evidence and check fixture extraction

Moved candidate and evidence modules into `src/data`, extracted validator observation alternatives and authored review requirements from components, and moved observation types into the shared frontend models. Updated all consumers to use the new paths directly; no compatibility re-export files remain.

The data directory has no React/component imports. Candidate relationships, digest labels, missing-data behavior and requirement-versus-result semantics remain unchanged. Requirements remain explicitly authored rather than inferred from candidate output. Organization snapshots, historical activity and some release-preview presentation/policy logic remain in components and are documented as remaining work.

No new runtime behavior, API contract, fetch operation or persistence was introduced. Preview screenshots remain at iteration 08.

Validation: production build and all eighteen existing browser tests passed. This is a fixture/module refactor; no tests were added solely to assert file placement.

## 15 — Session-only response drafts

Response text is now stored separately for each assignment and response kind. Typing keeps a draft in React memory; closing by Cancel, Escape, outside click or screen navigation does not submit or discard it. The authority panel lists nonempty drafts with Continue and Delete actions. Deletion requires explicit confirmation and can be cancelled.

Approval and refusal drafts cannot overwrite each other or appear on another assignment. Resuming a draft does not bypass prerequisite or invalidation checks. Successful submission creates the existing receipt and clears all drafts for the completed assignment, as explained in the draft panel. Drafts and submitted receipts remain distinct.

This slice uses no localStorage, backend or durable save. Refresh/closing the browser clears drafts; the dialog and draft panel state that limitation. No unload-warning behavior was added. Preview screenshots remain at iteration 08.

Validation: production build and all nineteen browser tests passed. The new test covers closing/resuming, cross-tab and cross-assignment navigation, approval/refusal isolation, cancelled and confirmed deletion, and transition from draft to receipt after submission.

## 16 — Diff layout and changed-file search

Candidate now offers **Unified** and **Side by side** views of the same computed line diff. Split mode pairs removed/added lines within each change block and preserves independent base/candidate line numbers, with empty cells where one side has no line. Plus/minus markers supplement color. The line-diff logic is separated into `src/diff.ts` and remains sized for the small in-memory fixtures, not large production patches.

**Find a changed file** filters paths case-insensitively. Filtering does not silently select another file or clear the open diff. An empty result explains this and provides a clear-filter action. Switching layout keeps the selected file and counts. Split mode scrolls inside the diff region on small screens; Unified remains the default.

No editing, patch application, syntax highlighting or backend was added. Expanding/collapsing large unchanged regions is outside this slice. Screenshots remain at iteration 08.

Validation: production build and all twenty browser tests passed. Added coverage verifies replacement pairing, added-file blank base cells, path filtering and empty-state recovery, selected-file stability, layout switching, counts and mobile overflow.

## 17 — Preserve candidate review context

Candidate view state now lives in session memory keyed by assignment and sample candidate identity. The selected file, Unified/Side-by-side mode and file-path filter survive tab switches, browser history navigation and visiting another assignment. They reset on refresh; no localStorage or URL persistence is introduced. This slice does not preserve scroll positions.

When A-1042 has an unsent response draft, Candidate, Evidence and Checks show **Resume … while reviewing** near the top of the review panel. It opens the existing draft, using the same submission rules and receipt flow. Other assignments do not borrow this shortcut or candidate state, and completed assignments do not display draft shortcuts.

The candidate component receives controlled view state rather than owning state that disappears when its tab unmounts. The current prototype still has only one inspectable candidate; this does not claim a production candidate-switching contract. Screenshots remain at iteration 08.

Validation: production build and all twenty-one browser tests passed. The added end-to-end test covers draft resumption from Evidence, Back navigation restoring the selected file/filter/layout, isolation from the release assignment, restoration after returning from the inbox, and reset after refresh.

## 18 — My Work filters and return context

My Work adds project filtering, **Has a draft**, draft badges, and **Due soonest** sorting. Sorting uses the authored sample order Today → Tomorrow → Friday, not a live calendar or production deadline calculation. **Reset all filters** restores the complete open-work view, including search and response-kind filters.

Filter state is encoded in the hash URL and retained when opening assignments and returning to My Work. Browser history restores filter selections; search replaces the current history entry to avoid an entry per keystroke. For example: `#/work?project=Payments+API&sort=due`. Unknown projects produce an explicit unavailable option and empty view; unsupported kind/sort values fall back to defaults.

URLs contain only filter values. Draft text, decisions and completion state remain session-only and disappear on refresh. A shared drafts-only link therefore does not share drafts. Empty-state and filter notes explain this boundary. No backend or durable persistence was added. Preview screenshots remain at iteration 08.

Validation: production build and all twenty-two browser tests passed. New coverage checks direct filter links, history restoration, assignment return context, draft filtering and refresh reset, reset-all behavior, sample due ordering, mobile overflow and unknown filter values.

## 19 — Keyboard access and reading comfort

Added **Skip to main content** without changing the hash route, current-page semantics on workspace navigation, and expanded/control semantics on the mobile navigation toggle. Keyboard focus now uses a darker blue ring, including dropdowns and programmatically focusable content.

Response dialogs initially focus the rationale field. The Tab loop includes enabled dropdowns and links; the surrounding app is inert while a dialog is open. Closing restores the opener when it still exists, and restores the previous inert state and page scrolling. This applies to the shared response/evidence dialog component.

Selected supporting labels now use 12px text; dialog explanations and placeholders use darker colors. Icon buttons have a 44px minimum target. On phones, compact text actions and filter buttons have 44px targets and form text uses 16px to improve readability. Existing reduced-motion support is retained.

This is a focused usability pass, not a comprehensive WCAG certification or screen-reader audit. Screenshots remain at iteration 08; the live prototype shows these changes.

The closed mobile sidebar is also hidden from keyboard navigation and the accessibility tree, rather than merely translated offscreen.

Validation: production build and the 23-test browser suite passed. After the final mobile-sidebar fix, the responsive-navigation and keyboard-access tests were rerun successfully. Coverage includes skip-link focus without changing routes, initial rationale focus, Tab wrapping, background isolation, Escape and opener restoration, mobile navigation visibility/state and minimum icon target size.

## 20 — My Work loading, empty and error previews

My Work now has a labeled **Data preview** selector for Loaded sample work, Loading, No assigned work and Load failed. The selector explicitly states that these are sample scenarios and that retry sends no SF request. This slice covers the inbox; existing release-specific failure previews remain separate.

Loading and error views hide assignment counts, rows and release shortcuts. Failure describes the assignment count as unknown rather than zero. The successful empty response is distinct from a loaded list with no filter matches. Loading is announced through a status region and the content region exposes its busy state; failure uses an alert.

**Retry sample load** shows loading and restores the loaded fixtures after 800ms. Choosing a different scenario or leaving My Work cancels that timer. Successful retry returns focus to the scenario selector. Restore sample work exits the empty scenario. Filters, drafts and decisions are unchanged; the preview itself resets to Loaded when leaving/reopening My Work or refreshing. Refresh still clears session drafts/decisions as before. The manual Loading scenario remains loading until another scenario is selected.

No network integration, durable persistence or server error contract was added. Preview images remain at iteration 08.

Validation: production build and all 24 browser tests passed. Added coverage checks failure versus empty data, hidden inbox counts, loading/busy state, retry recovery and focus, preserved project filter, cancellation when selecting another scenario, refresh reset and mobile overflow.

## 21 — Organization responsibilities and next steps

Organization now includes **Needs your attention**, covering the five sample assignments owned by Alex Morgan. Each card shows the project, responsible person/role, why the work is waiting, the next review step and an assignment link. The scope is explicitly personal sample work, not an organization-wide backlog or inferred dependency graph.

Release explanations follow the same session prerequisite state used by the assignment, distinguishing missing/refused evidence from blocked decisions due to load errors, changed candidates or revoked authority. Staging reconciliation retains its unconfirmed-effect explanation. Authored explanations live in `src/data/organization.ts`; they are not backend dependency records.

After a local response, the card links to the assignment Activity receipt and explicitly leaves downstream effects unestablished. Open-work counts, Reviewer counts and the Release authority summary update with session decisions. Executor status is shown as not connected instead of implying a confirmed authorization or execution result. Other role cards remain illustrative snapshots. Refresh resets session decisions and prerequisite scenarios.

The card grid becomes a single column on phones. No backend integration or action execution was added. Preview images remain at iteration 08.

Validation: production build and all 25 browser tests passed. Added coverage checks assignment links, shared revoked-authority state, local response/count updates, Activity receipt navigation, browser Back, mobile overflow and session reset on refresh.

## 22 — Scoped Activity and evidence lookup

Activity now filters between All records, Local responses and Sample evidence. It renders only session receipts and evidence fixtures attached to the selected assignment. Evidence entries open the same scoped inspector; closing restores focus to the trigger. The old identical three-event history shown on every assignment was removed. Available fixtures are explicitly not presented as verified publication events or a chronological server log. Assignments without connected records show an honest empty state.

Evidence lists support case-insensitive search by record ID, title or producer, with no-match recovery. Searches are independent per assignment group, and never pull records from other assignments. The workspace Evidence index now also includes assignments that have a local receipt but no evidence fixture. Existing related-record links in Attempts, Candidate, Checks and receipts remain intact.

Filters reset when their component unmounts or the page refreshes; this slice adds no URL persistence or server search. All records remain sample/session data, and no new relationship between A-1042 and the A-1041 release is inferred. Preview screenshots remain at iteration 08.

Validation: production build and all 25 existing browser tests passed. The new scoped lookup test passed after correcting its Evidence-tab locator to allow the existing count badge. It covers activity filters, inspector focus restoration, case-insensitive search, empty recovery, cross-assignment isolation, missing history and mobile overflow (26 tests total).

## 23 — Prototype v1 demo checkpoint

Refreshed all twelve existing screenshots and added split diff, load-error and Activity evidence-filter previews (15 total). The capture script exercises the current UI and asserts recovery from the sample load failure. Reviewed the mobile inbox and desktop Organization captures visually.

`WALKTHROUGH.md` provides a complete English demo sequence with expected behavior, screenshots, reset instructions and session boundaries. README now points to it and distinguishes current previews from historical iteration notes. Screenshots capture different session moments; the walkthrough identifies this rather than implying one persistent dataset.

This is a UI prototype checkpoint, not production readiness. No backend integration, authorization or durable persistence was added. The existing footer design label is retained.

Validation: capture script completed successfully, production build and all 26 browser tests passed, and local links in README and WALKTHROUGH resolve.

## 24 — Consistent inbox counts and screen focus

My Work's data-preview state now belongs to the app so its sidebar count matches the inbox: unavailable (—, with an accessible label) for loading/error, zero for a successful empty result, and the current open-assignment count for loaded fixtures. Retry restores the current session count. Leaving My Work resets the preview as before; session responses and filters remain intact.

After an in-app screen change, including browser history between screens, focus moves to the destination heading. The initial page load, tab changes and filter updates do not trigger this move. Focus runs after route-driven dialog cleanup so restoring a dialog opener cannot override the destination focus. Headings are programmatically focusable without entering normal Tab order.

No persistence or backend behavior changed. Preview images remain the iteration 23 checkpoint.

Validation: production build and 26 existing browser tests passed. The added test passed after explicitly focusing the scenario selector before asserting focus retention. It verifies unavailable/empty/recovered sidebar counts, Enter navigation, tab focus, return navigation and browser Back (27 tests total).

## 25 — Collapsible demo controls

My Work, Checks, release prerequisites and decision-change simulation controls now use native details/summary disclosures, collapsed by default. Keyboard users can toggle them with Enter or Space. Collapsing controls does not reset the scenario; actual observations, blocking messages, action availability and sample-data labels remain outside the disclosure. Reopening a screen resets disclosure visibility with component mounting.

The dialog focus loop includes summaries and skips controls hidden inside closed disclosures. My Work retry/restore returns focus to the scenario selector when expanded, or the visible summary when collapsed. The capture script and walkthrough now open controls explicitly before selecting scenarios. Screenshots remain the iteration 23 checkpoint.

Validation: production build and all 28 browser tests passed. Existing scenario tests now expand controls through their summary before selection; added coverage verifies collapsed defaults, keyboard expansion, preserved error state, retry focus while collapsed and mobile overflow.

## 26 — Organization status groups and filters

Organization separates Awaiting response, Blocked and Responded into labeled groups. Local responses take precedence over prerequisite previews. An open A-1041 is blocked whenever its current preview is not ready; missing/refused prerequisites block approval while refusal can remain available. Load-error/stale/revoked block both decisions. A-1035 remains awaiting reconciliation, since an unconfirmed effect does not itself block submitting a response.

Project, role and status filters combine within the personal sample queue. Group counts reflect filters; the overall open count continues to describe all five sample assignments. Empty combinations have a reset action, and recorded responses remain directly linked to Activity. Filters reset when leaving Organization or refreshing; no URL persistence or backend workflow inference is added.

Screenshots remain the iteration 23 checkpoint. This slice does not change the surrounding illustrative role cards.

Validation: production build and all 29 browser tests passed. Added coverage checks initial groups, combined filters and empty recovery, release readiness transitions, local-response grouping/links and mobile overflow.

## 27 — Preserve lookup context and inbox return position

Evidence search and Activity type are now controlled by per-assignment session state in the app. They survive tab changes and assignment/screen navigation. Evidence search is shared between an assignment tab and its matching workspace Evidence group; different assignments remain isolated. Refresh clears both, and they are not encoded in URLs.

Opening an assignment from My Work remembers its row and scroll position. Returning via the UI or browser history restores focus and scroll to that row when it remains in the current list. If the row has disappeared after a response or filtering, the destination heading receives focus instead. A changed viewport can bring an offscreen row back into view. This is bounded inbox restoration, not general scroll persistence across every screen.

No durable storage or backend integration was added. Screenshots remain the iteration 23 checkpoint.

Validation: production build and all 30 browser tests passed. Added coverage checks per-assignment lookup state across tabs, UI/history inbox return focus, mobile scroll restoration, completed-row fallback, isolation and refresh reset.

## 28 — Long-content and larger-list review

Added browser-only fixture overrides for 50 assignments, 63 evidence records on A-1042, long unbroken titles/project/producer names and a multiline rationale of over 4,000 characters. The normal demo fixtures remain unchanged. Tests exercise search, assignment details, evidence inspection, response recording, receipts and Organization at 390px and 1440px.

The initial tests reproduced horizontal overflow on assignment detail screens. Human-readable headings, metadata and artifact labels now wrap long values; flex/grid children can shrink within their containers. Code and diff regions retain their own scrolling rather than globally hiding overflow. Organization now shows explicit missing-detail text when an assignment lacks an authored waiting reason or next step, instead of assuming a matching fixture exists.

This is a bounded content/layout check, not a performance benchmark or support claim for arbitrarily large datasets. Pagination/virtualization and backend data loading are outside this slice. Preview screenshots remain the iteration 23 checkpoint.

Validation: production build and all 32 browser tests passed, including the two new content-scale cases at mobile and desktop widths.

## 29 — Explicit A-1042 assessment conclusions

A-1042 now requires an explicit Meets criteria, Changes requested or Insufficient evidence conclusion alongside the rationale. These are proposed UI choices, not an SF schema or workflow contract. Optional evidence checkboxes include only that assignment's fixtures; records are never selected merely because they were opened. Empty selection is recorded as No evidence cited.

Conclusion and citations persist with the session draft, including drafts containing only structured selections. Confirmed deletion clears them; submission snapshots evidence ID/title/assignment and conclusion into the receipt, then clears the draft. Refresh resets session data. Other assignment response forms are unchanged.

Recording a response still completes the local demo assignment regardless of conclusion. This slice does not create a revision request, grant release authority or establish downstream effects. Cited fixtures remain unverified. Screenshots remain at iteration 23; capture script and walkthrough now supply a conclusion before recording.

Validation: production build and the 33-test suite passed; an additional targeted structured-draft test also passed (34 tests total). Coverage includes required conclusion, cited-record snapshot, draft resumption/deletion, no-evidence receipts, refresh reset and long-content/mobile regressions.

## 30 — A-1035 staging reconciliation

A-1035 Overview and its response dialog now compare the expected staging effect with observation 238, which establishes request acceptance only. The synthetic expected artifact digest is separate from the production release subject. Running artifact, health and observation time are explicitly unavailable; required follow-up evidence is listed.

The response requires an explicit Still undetermined conclusion plus rationale. Confirmed-effect and mismatch choices are shown disabled because the current fixture supports neither. This slice deliberately contains only the existing incomplete-observation scenario; it does not invent successful deployment evidence. The conclusion survives closing/resuming a draft, including a structured-only draft, and is cleared on confirmed deletion or submission.

The receipt snapshots target, expected effect/digest, observation, missing evidence and conclusion. Recording the response completes the local assignment response only: the staging effect stays unconfirmed, and no retry/deployment occurs. Refresh clears session state. These are UI proposal fields, not a backend reconciliation contract. Screenshots remain at iteration 23.

Validation: production build and 34 existing browser tests passed. The new reconciliation test passed after checking native option.disabled directly (35 tests total). It verifies required conclusion, unavailable resolved outcomes, draft resumption, snapshot scope, mobile overflow and refresh reset.

## 31 — Response delivery simulation

Response dialogs now expose a collapsed Delivery scenario selector: receipt confirmed, rejected, offline before sending, or acknowledgement lost. Submitting locks editing and repeat submission for a 700ms simulation. Only confirmed receipt creates the local record and clears drafts; rejection/offline retain the draft without a receipt.

Unknown delivery blocks editing/resubmission until the explicit **Simulate status check: not received** action. Closing or navigating away during a pending simulation cancels its timer and preserves an unknown state for resumption, rather than creating a late receipt on another screen. The simulated status check does not query SF; it only selects the not-received resolution. Unknown status blocks other response types for the same assignment as well.

All states are session-only and reset on refresh. This is not durable idempotency, server admission or a real offline queue. Existing authority/readiness validation still applies when starting a submission. Inputs are frozen during the pending attempt. Screenshots remain at iteration 23.

Validation: production build and the 37-test suite passed. After making unknown status assignment-scoped, build and all three delivery tests passed, including the new approval/refusal conflict case (38 tests total). Coverage checks retained drafts, editing locks, no duplicate local receipt, explicit unknown resolution and close-during-send behavior.

## 32 — Per-criterion A-1042 assessment

Each of A-1042's four authored acceptance criteria now has a stable sample ID and a reviewer status (Not reviewed, Meets criterion, Needs changes or Insufficient evidence), optional note and assignment-scoped evidence selections. All start Not reviewed. Expected evidence remains visible next to the criterion; viewing an artifact never marks a criterion met.

Criterion edits count as a session draft even without an overall conclusion or rationale. Closing/resuming preserves them; confirmed draft deletion and successful submission clear them. Sending/unknown delivery locks criterion controls with the rest of the form. Evidence at criterion level is independent of overall citations and of other criteria.

Receipts snapshot all four criterion definitions, statuses, notes and cited record identities/titles. Unreviewed/no-evidence states are explicit. These are reviewer statements, not verified checks; they neither derive nor override the overall conclusion. Per-criterion completion is not a new mandatory SF rule: partial reviews can be recorded with the existing required overall conclusion and rationale. Refresh clears session data. Screenshots remain at iteration 23.

Validation: production build and 37 tests passed initially. After giving criterion notes their own CSS class, build and all three targeted criterion/long-content tests passed (39 tests total). Coverage checks structured-only draft resumption, independent citations, unreviewed defaults, locked pending submission, receipt snapshots, mobile layout and refresh reset.

## 33 — Explicit revision-cycle scenario

Organization now includes a standalone five-record cycle: DEMO-C1 contribution, DEMO-A1 changes-requested assessment, DEMO-W2 revision request, DEMO-C2 revised contribution and DEMO-A2 pending reassessment. Selecting a step opens its actor, state, subject and explicit references; reference buttons navigate to the actual related sample record and focus its heading.

Revision 1 and revision 2 have distinct synthetic digests. The first assessment stays attached to revision 1, while the second assessment awaits review of revision 2. The worker's claimed new coverage is not a verified result. Earlier records are preserved, and nothing implies release authorization or deployment success.

This cycle is deliberately independent of the existing assignments and local receipts. It is authored sample history, not automatically produced by selecting Changes requested on A-1042. No worker runs, files, assignments or server records are created. Missing file bodies and test reports remain explicit. Selection resets on leaving Organization or refresh. Screenshots remain the iteration 23 checkpoint.

Validation: production build and all 40 browser tests passed. The new test checks keyboard selection/focus, explicit reference navigation, separate revision identities, pending reassessment, preserved earlier assessment, mobile overflow and reset without changing assignment counts.

## 34 — Compact long assessments

Per-criterion editors now start collapsed behind native details/summary controls. Each summary shows the criterion title, reviewer status, cited-record count and whether a note exists. Expanding/collapsing preserves edits; reopening the dialog resets disclosure visibility while keeping draft content. Only the chosen criteria need to occupy the full editor height.

A progress line counts criteria with an explicit reviewer status, not passed criteria; notes or citations alone do not increase it. Review criteria and Overall rationale buttons move focus to the relevant section/input. The existing dialog focus loop includes visible summaries and skips collapsed inputs. No validation or receipt semantics changed.

This reduces the default four expanded editors to four summaries; it does not add a wizard, mandatory completion rule or hidden automatic assessment. Screenshots remain at iteration 23.

Validation: production build passed. 39 tests passed initially; after adapting two existing locators to the collapsed-editor/status behavior, all three targeted review tests passed (41 tests total). New coverage checks Enter/Space toggling, retained edits/citations, accurate status progress, section focus and mobile overflow.

## 35 — Current workflow previews

Refreshed the 15 existing previews and added criterion review, mobile review, unknown response delivery, staging reconciliation and pending reassessment in the revision cycle (20 total). The capture script fills a real criterion draft through the UI and waits for the unknown-delivery state before taking its image. These are screenshots of the prototype, not externally generated mockups.

README and walkthrough link the current images and explain that modal images capture a visible scrolled region. Earlier iteration screenshot-freshness statements remain historical. No application behavior changed in this slice.

Validation: production build passed; the updated capture script completed all 20 screenshots and exercised the UI flows. README/walkthrough links resolve. Mobile criterion review and revision-cycle captures were visually inspected. No application code changed, so the existing 41-test validation remains the prior behavior baseline rather than a new test run in this documentation slice.

## 36 — Response presentation and draft extraction

Moved the shared focus-trapping dialog shell to `Modal.tsx`, the complete response form to `ResponseDialog.tsx`, and draft state/lifecycle operations to `useResponseDrafts.ts`. The application calls the draft hook unconditionally, preserving its lifetime across dialog closure and screen navigation. It clears an assignment's drafts through a named operation after recording a receipt.

Delivery state remains in the existing app-owned `useResponseSubmission` hook; receipt creation, readiness and application navigation remain in the app. The dialog consumes those state owners instead of creating another copy. Main loses roughly 390 lines. This is a bounded refactor, not a complete decomposition of the application or a general backend response framework.

No field, validation rule, markup behavior, storage boundary or sample data changed. The shared modal keeps its existing focus, inert-background and Escape behavior. Iteration 35 previews remain current.

Validation: production build and all 41 existing browser tests passed after extraction, including draft isolation/deletion, delivery ambiguity, modal focus, long content and structured receipts. No tests were added solely to assert file placement.

## 37 — Organization-first overview

Organization becomes the default root screen and first navigation entry. My Work remains the explicit personal route. The overview introduces two authored workstreams, four workers and seven scoped role bindings; current assignments link to their details and attached evidence. Separate production, staging and accessibility subjects stay outside the modeled streams rather than acquiring invented dependencies.

Local response labels update independently of unverified goal outcomes. Existing personal attention and revision-cycle sections remain available below the organization overview. The new model is sample design data, not an SF API contract, org-wide backlog or real permission enforcement. `ORGANIZATION-MODEL.md` records these boundaries and the next workstream-detail increment.

Validation: production build and all 42 browser tests passed. Added default-entry, workstream/evidence navigation, scoped-binding count and mobile-width coverage; extended response coverage to verify the goal remains unverified. A new desktop overview preview supplements the iteration 35 workflow images.

## 38 — Workstream details and coordination

Both overview cards now open dedicated, addressable workstream pages. Details explain the goal, responsible roles, proposed handoffs, current assignment and attached evidence, missing outcome observations and subject boundaries. Payment coordination includes conditional revision/reassessment; invitation coordination explicitly leaves future assignments and bindings unrepresented.

Local responses expose their Activity record without advancing handoffs or claiming a verified outcome. Direct URLs, refresh and browser Back retain the correct stream; screen transitions focus the heading. My Work row focus restoration remains intact. Added the payment detail preview and refreshed the organization overview image.

Validation: production build passed. The full 43-test run passed 41 tests and exposed two inbox-focus regressions caused by the screen-key change. After fixing that key, reran those two tests plus workstream navigation and response-boundary coverage (four passing tests). New coverage includes deep links, refresh/history, evidence navigation, unknown stream fallback, mobile overflow and conditional handoffs remaining unchanged after a local response.

## 39 — Scoped worker responsibilities

Organization role cards now link to worker details, with direct URLs for all four workers. Each page groups explicit assignment links under that worker's scoped role bindings. Local response labels and Activity links remain distinct from outcome confirmation. Empty lists do not imply idle capacity, live health or absence of work outside the sample.

A Responsibility gaps section distinguishes the unrepresented invitation developer binding from an invitation assessment assignment that has not been allocated despite an existing reviewer binding. Both link to the invitation workstream. All relationships are authored sample data; this slice introduces no assignment creation or permission management.

Added browser coverage for binding isolation, assignment navigation, history and refresh, all three empty worker examples, mobile width, gap navigation and unknown-worker fallback. Updated model documentation and walkthrough, refreshed the overview preview and added a worker-detail preview.

Validation: production build and all 44 browser tests passed. Desktop worker preview was visually inspected; browser coverage also verifies the detail page fits a 390px viewport.

## 40 — Organization attention

The organization overview now shows a filterable attention section below its workstreams. Explicit responsibility gaps, pending responses and unverified effects/goals link to their source assignment or stream. Counts measure bounded sample signals, not unique assignments or completion. The planner is identified as a sample coordination contact; unassigned outcome-review responsibility is explicit.

Release explanations reuse current prerequisite readiness. Ordinary response signals clear when a local receipt is recorded; release/staging unverified effects and both workstream outcomes remain. Responsibility gaps do not disappear merely because criteria were submitted. The separate Alex queue remains available below the organization context.

Added browser coverage for category counts, scoped navigation, release authority revocation, response removal without outcome confirmation, mobile width and reload reset. Updated documentation and capture script, refreshed the organization preview and added a dedicated attention image.

Validation: production build and all 45 browser tests passed. The dedicated attention preview was visually inspected.

## 41 — Explicit handoff details

Workstreams now link to two dedicated exchanges: candidate to reviewer and criteria to planner. Each page identifies sender/receiver scopes, expected inputs, proposed receiving conditions, assignment/evidence links and a return path for revision or clarification. Direct URLs and browser history preserve the exchange context; Back to workstream returns to its parent stream.

Local response receipts are inspectable while handoff receipt remains unconfirmed. The invitation exchange explicitly has no planning assignment or evidence attached. This slice describes authored collaboration expectations and does not create assignments or automatically verify transfer/acceptance conditions.

Added browser coverage for participants, exact input navigation, response-versus-delivery semantics, conditional revision, direct routes, history/refresh, missing evidence, mobile width and unknown-handoff fallback. Added a handoff preview and refreshed the workstream preview.

Validation: production build passed. The full suite passed 45 existing tests; the new handoff test initially navigated away during simulated submission. After waiting for the recorded response dialog to close, the handoff test passed on rerun (46 tests covered). The desktop handoff preview was visually inspected.

## 42 — Organization activity

Organization now links to a dedicated activity view at `#/organization/activity`. Filters select modeled workstreams, other organization work and record type. Local response receipts are ordered newest first, with actor, subject, rationale and recording time. Attached sample evidence is listed separately because publication times are unavailable. Links open assignment Activity for receipt/artifact inspection.

Stream membership is explicit; sharing a project does not place release evidence in the payment stream. Empty scopes show the absence of connected records without inferring outcomes. Filters reset on navigation and refresh clears local receipts. Added an activity preview and refreshed the organization overview.

Validation: production build and five relevant browser tests passed: organization activity, assignment routing/history, assignment Activity/evidence scope, screen focus and inbox focus/filter restoration. New coverage includes response recording, scope isolation, empty invitation records, undated evidence explanation, mobile width and refresh reset. Desktop preview was visually inspected.

## 43 — Goal-level outcome review

Each workstream now links to a dedicated outcome review with goal evidence requirements, explicitly linked supporting context, remaining gaps and unassigned reviewer responsibility. Payment recovery and duplicate-processing requirements stay distinct from candidate assessment; invitation behavior needs agreed criteria, implementation identity and observations. No goal-level decision form or automatic verification is introduced.

Local assignment receipts remain inspectable without marking the goal achieved, including a Meets criteria assessment. The view explains subject boundaries and links back to its workstream. Added an outcome preview and refreshed the workstream preview.

Validation: production build and five relevant browser tests passed (outcome review, workstream routing, inbox focus, organization attention and organization activity). New coverage verifies supporting evidence links, response-versus-outcome semantics, history/refresh, missing invitation context, mobile width and unknown-outcome fallback. Desktop preview was visually inspected.

## 44 — Overview navigation and layout review

Added focus-moving overview shortcuts for goals, attention and worker bindings without changing the workspace hash. Secondary other-work and responsibility-gap explanations start collapsed behind native keyboard-accessible disclosure controls; their organization attention signals remain visible. Detail breadcrumbs now identify the current subject and return to Organization, with visually truncated mobile labels retaining full accessible text.

`UI-REVIEW.md` records findings and the remaining priorities: compact attention, relocating the personal/demo sections, exact artifact navigation and consistent detail spacing/return paths. Refreshed six organization detail/overview previews.

Validation: production build and eight relevant browser tests passed across overview, workstreams, workers, attention, handoffs, activity and outcomes. New coverage verifies section focus, unchanged hashes, keyboard disclosure toggling, breadcrumb return and mobile width. Mobile outcome layout was visually inspected.

## 45 — Compact attention summary and dedicated list

Replaced the overview's full attention list with three category counts and an all-items entry. The full signal list moves to `#/organization/attention/all`; category links use durable responsibility/response/outcome paths. Filtering, refresh and browser history preserve the selected category. Overview section shortcuts still focus the attention summary, and detail breadcrumbs identify Attention.

Both views use the same signal derivation, preserving response removal and unverified outcome semantics. Updated the attention walkthrough/model, remaining review priorities and capture script; refreshed overview and attention previews.

Validation: production build and five relevant browser tests passed, covering overview, section focus, attention semantics, inbox focus and new category-route behavior. New coverage verifies the compact summary, category counts, filter URL/history/refresh, mobile width and invalid-category fallback. Summary preview was visually inspected.

## 46 — Personal queue and demos outside the overview

Moved Alex's grouped response queue to `#/work/attention`, reached from My Work. The queue retains project/role/status filters, prerequisite explanations and local receipt links, with labels reflecting its personal scope. The independent revision cycle moves to the Demos navigation entry at `#/demos`.

Organization Overview no longer embeds either section. Its organization attention summary and role/workstream links remain the coordination entry. Queue navigation preserves work-filter context and avoids treating queue-origin assignments as opened inbox rows. Added route/focus/mobile coverage and migrated queue/revision/large-fixture tests to their new locations. Updated the model, walkthrough, review priorities and capture script; refreshed inbox/overview previews and added a queue preview.

Validation: production build and all 51 browser tests passed, including large fixture layouts, personal response-state filters, receipt navigation, revision identity/focus, independent demo reset and the new entry/route separation. Refreshed organization preview was visually inspected.

## 47 — Exact cited artifact inspection

Cited record links in Outcome review and Organization activity now open their exact artifact in the shared inspector on the source page. Workstream and Handoff record lists also expose exact inspection links. Assignment Activity remains available from organization evidence entries for broader context, and collection-level evidence links retain their existing tab navigation.

Inspection preserves the source route and filters; Escape/close restores the originating link's focus. Existing sample identity/provenance explanations remain in the inspector. Updated review priorities, walkthrough/model and capture script, refreshed four detail previews and added a direct outcome-artifact preview.

Validation: production build and six relevant browser tests passed, covering exact records/assignment scope, source URL preservation, filter retention, keyboard focus, mobile overflow, response/outcome distinction and existing modal containment. The exact-artifact preview was visually inspected.

## 48 — Contextual assignment return

Assignment Back buttons now name the source page: workstream, handoff, outcome review, worker, organization activity/attention or personal queue. The app remembers the source route, scroll and initiating link per assignment in the browser session; switching assignment tabs keeps that context. Returning via the button or browser history restores source scroll/focus, with a heading fallback when the originating link no longer exists.

Organization activity and queue filters move to app-owned state so they survive assignment return. Main navigation resets those filters. Inbox row restoration remains separate. A refreshed/directly loaded assignment has no session source and returns to My Work. Added the assignment-source preview and capture step, and documented the session boundary.

Validation: production build passed. Eight relevant browser tests passed across the initial and focused reruns. Two expectations were updated for the intended source-link focus and explicit refresh boundary. New coverage verifies all source types, retained filters, tab changes, source scroll/focus, attention category and direct-link fallback; existing inbox/filter, queue and activity behavior passed. Preview was visually inspected.

# Forge workspace · UI prototype v1

An interactive English-language design for humans and AI workers collaborating in a Software Factory. The opening Organization screen connects shared goals, parallel workstreams and scoped worker roles. My Work is Alex's personal entry into assignments, evidence and decisions.

## Run

From this directory:

```sh
npm ci --cache ../.cache/npm
npm run dev
```

Open the local URL printed by Vite. For a production build, run `npm run build`. The resulting `dist/` contains static assets; this prototype does not include a Go server.

## Walkthrough

Follow the [complete demo walkthrough](WALKTHROUGH.md) for review, draft, evidence, release decision, recovery and mobile flows. It includes expected results and links to current screenshots.

## Design decisions

- **Information hierarchy:** organization goals and coordination first; personal responsibilities then connect to input, evidence, authority and responses.
- **Visual language:** deep green navigation, warm neutral surfaces, restrained amber for authority, slate blue for assessments, and lavender for reconciliation. Text labels accompany color.
- **Typography:** system sans-serif; no remote font dependency.
- **Navigation:** Organization (default), My Work, Evidence. More administrative screens should be designed around demonstrated operational needs.
- **Layout:** persistent desktop navigation; responsive cards and assignment rows; a navigation toggle on narrow screens. Assignment authority stays visible beside its context on large screens and follows it on small screens.
- **Interaction:** search, responsibility filters, completed work, assignment tabs, artifact inspection, rationale validation, local decision records, keyboard-focus containment and Escape dismissal for dialogs.

## Scope and boundaries

This is a design prototype using React, TypeScript, Vite, and Lucide icons. All people, IDs, dates, digests, snippets, records, and organizational activity are fictional. Organization combines illustrative role snapshots with session-aware assignment summaries. Evidence records and the inspector are illustrative, not verified artifacts.

Responses live only in React state and reset on refresh. There is no authentication, backend, actual authorization check, durable storage, live event stream, or external execution. A real implementation must obtain identity and permissions from the application API and submit commands for server-side authorization and governed admission. The UI must not treat its local state as an authoritative record.

Before production: extend the existing failure previews to production rejection/offline/concurrent-update handling; define versioned API contracts; connect exact artifact provenance; add authentication and server-enforced permissions; conduct a full accessibility review and user testing. The visible multi-role persona exists solely to exercise both review and authority flows.

This design is an original implementation based on the allowed repository discussions. It contains no copied private planning documents and uses no material from the excluded `x1` repository.

## Verification

```sh
PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright npx playwright install chromium --no-shell
PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright npm test
```

The browser suite checks the assessment and approval/refusal flows, required rationale, inbox state, authority boundaries, artifact inspection, keyboard dismissal, and narrow-screen overflow. Run `npm run build` separately for the TypeScript and production-bundle checks.

## Screenshots

- [My Work](previews/01-my-work.png)
- [Assignment detail](previews/02-assignment.png)
- [Assessment dialog](previews/03-assessment.png)
- [Organization](previews/04-organization.png)
- [Evidence](previews/05-evidence.png)
- [Mobile inbox](previews/06-mobile.png)

To regenerate, start Vite on port 4173, then run `PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright node scripts/capture-previews.mjs` from this directory.

Validation at the v1 checkpoint: production build and 41 browser tests passed. The capture script exercises desktop and 390px mobile flows; selected screenshots were visually reviewed. This is not a complete accessibility or cross-browser certification.

This environment lacked the Chromium NSS/NSPR shared libraries. They were extracted into the repository-local `.cache/browser-libs/` without installing system packages. When testing here, use:

```sh
LD_LIBRARY_PATH=../.cache/browser-libs/extracted/usr/lib/x86_64-linux-gnu \
PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright \
TMPDIR=../.cache/tmp npm test
```

On a workstation that already has Chromium's system libraries, the `LD_LIBRARY_PATH` override is unnecessary. Cache folders are intentionally not committed.

## Incremental updates

See [ITERATIONS.md](ITERATIONS.md). The first update adds **Attempts** to assignment detail. Open **A-1042 → Attempts** for sample execution history; the other assignments explicitly state that no sample history is connected. Existing screenshots represent the initial design.

The second update adds **A-1042 → Candidate**: select a changed file to inspect its computed sample line diff and fixed base reference. This is illustrative source content, not a production candidate. See iteration 02 in the progress document for validation and scope.

The third update adds **A-1042 → Checks**: preview passed, refused, or could-not-run validator observations independently of human decisions. No real validator runs when the scenario selector changes. See iteration 03 for scope and validation.

The fourth update strengthens **A-1041 → release review**. Approval starts disabled because sample prerequisites are missing. Use **Preview release prerequisites → All prerequisites satisfied — demo** to exercise approval, or record a refusal. The confirmation and local Activity include the exact sample release subject and target. See iteration 04 for limitations and validation.

The fifth update adds a **structured decision receipt** under **Activity** after submitting a response. Use **View record** to see the local receipt ID, demo actor, time, subject, permission, rationale and prerequisite snapshot. It is session-only and explicitly not a server-admitted decision. See iteration 05 for details.

The sixth update scopes **Evidence** to each assignment and gives **Artifact Inspector** explicit per-record content and reference availability. The workspace Evidence page groups records by assignment and links session receipts. Release test/assessment records that are not connected are now shown as unavailable. See iteration 06 for details.

The seventh update refines **A-1042 → Attempts** using state patterns from a bounded read-only development metadata review. It adds a process-exited-with-error example and separates platform state, process exit and cleanup observations. All displayed records remain synthetic; no production data connection was added.

## Current previews — iteration 35

All 20 preview files reflect the iteration 35 checkpoint. Earlier iteration notes below describe historical validation and screenshot freshness.

- [Attempts](previews/07-attempts.png)
- [Candidate and diff](previews/08-candidate.png)
- [Checks](previews/09-checks.png)
- [Decision receipt](previews/10-receipt.png)
- [Release prerequisites](previews/11-release-review.png)
- [Mobile candidate review](previews/12-mobile-candidate.png)

Phone assignment navigation now displays all six tabs in two rows. **Review authority & response** jumps to and focuses the action panel. Build and all twelve browser tests passed for this iteration.

Iteration 09 expands **A-1042 → Overview** with explicit review requirements: fixed base, permitted paths, required deliverables, validator, publication criterion and evidence needed for acceptance. These are authored sample requirements, not passed checks or production configuration. Other assignments display missing-detail states. The screenshots above reflect iteration 08; run the app for this update.

Iteration 10 connects **A-1042 → Attempts → Inspect produced candidate → Review candidate checks → View recorded response** (after submission). Receipts link back to their matching subject; failed attempts have no candidate shortcut. Related-record navigation focuses the destination tab and retains the Checks preview. See iteration 10 for scope and validation.

Iteration 11 adds **A-1041** preview states for failed data loading, changed candidate and revoked authority. Both decisions are blocked, including when invalidation is simulated inside confirmation. **Reset demo review** returns to missing evidence; it performs no backend request and restores no real permission. See iteration 11 for behavior and validation.

Iteration 12 adds shareable **screen URLs**. For example, open `http://localhost:4173/#/assignments/A-1042/candidate` to go directly to Candidate. Browser Back/Forward is supported. Refresh keeps the screen but clears all demo response data; sharing an Activity URL does not share a receipt. Invalid links show a warning and a recovery action. Use the port printed by your local Vite server if it differs.

Iteration 13 starts separating fixtures from UI under [`src/data`](src/data/README.md). Assignment/attempt fixtures, the shared release identity and frontend types are now component-independent. The prototype still runs entirely on sample data; this does not introduce or define a production API.

Iteration 14 moves candidate/evidence fixtures, authored review requirements and validator scenarios into `src/data`. The displayed values and interactions are unchanged. See the [data boundary guide](src/data/README.md) for the current structure and remaining work.

Iteration 15 adds **session-only response drafts**. Type a rationale, close the dialog, inspect other tabs, then choose **Continue … draft** in the authority panel. Drafts are isolated by assignment and response type. Delete asks for confirmation; submitting a response clears that assignment's drafts and creates its local receipt. Refresh clears drafts; nothing is persisted or sent to a backend.

Iteration 16 improves **Candidate** with a changed-file search and **Unified / Side by side** layouts. File filtering preserves the current diff; split view shows base/candidate line numbers and scrolls inside its panel on mobile. The feature still uses small synthetic file bodies.

Iteration 17 keeps the selected candidate file, diff layout and path filter while you move between tabs or assignments in the same session. An existing A-1042 draft can be resumed directly from Candidate, Evidence or Checks. Refresh resets this view state and drafts; scroll positions are not retained.

Iteration 18 improves **My Work** with project and draft filters, draft badges, sample due-date sorting and a reset action. Filters stay in the URL while opening assignments and returning, and support browser history. Try `http://localhost:4173/#/work?project=Payments+API&sort=due`. Drafts and completed responses still disappear on refresh; sharing a filter URL shares no response content.

Iteration 19 improves keyboard access and reading comfort: **Skip to main content**, stronger focus rings, navigation state announcements, background isolation while dialogs are open, and focus restoration on close. Supporting text is larger/darker in selected areas; mobile controls have larger targets and form text. See iteration 19 for scope and validation.

Iteration 20 adds **Data preview** on My Work: loaded, loading, no assigned work and load failed. Failure hides unknown counts; a successful empty response differs from a filtered list with no matches. **Retry sample load** simulates recovery without contacting SF or clearing session work. The preview resets when reopening My Work. See iteration 20 for details.

Iteration 21 expands **Organization** with a personal sample work queue: responsible role, waiting reason, next step and direct assignment navigation. Release blockers follow the current prerequisite preview; completed local responses link to Activity without implying deployment success. See iteration 21 for scope.

Iteration 22 adds **Activity type** filtering and scoped evidence inspector links. Activity no longer repeats a generic history across assignments. Evidence lists support search by ID, title or producer with clear empty states; workspace groups also expose receipts for assignments without evidence fixtures. See iteration 22 for boundaries.

Additional v1 previews: [Split diff](previews/13-split-diff.png), [Load error](previews/14-load-error.png), [Activity](previews/15-activity.png). See the [walkthrough](WALKTHROUGH.md) for screenshot session context.

Iteration 24 fixes inbox/sidebar count consistency during loading, failure and empty previews, and moves focus to the destination heading when navigating between screens. Tab and filter interactions retain their own focus. Screenshots above remain the iteration 23 checkpoint.

Iteration 25 collapses scenario selectors under **Demo controls** by default. Expand them to change a sample scenario; closing them preserves the selection and keeps results/blockers visible. The walkthrough reflects this interaction.

Iteration 26 groups Organization work into **Awaiting response**, **Blocked** and **Responded**, with combined project/role/status filters and empty-state recovery. Release blockers follow the current demo prerequisites; local responses move into Responded without implying execution success.

Iteration 27 preserves Evidence searches and Activity filters per assignment for the session. Returning to My Work restores the opened row and scroll position when available, otherwise the heading. Refresh clears this context.

Iteration 28 checks long content and larger lists using browser-only fixture overrides: 50 assignments, 63 evidence records and a long multiline rationale on mobile/desktop. Long labels now wrap, and Organization handles missing authored details. The normal demo dataset is unchanged; this is not a large-scale performance benchmark.

Iteration 29 adds an explicit proposed assessment conclusion and optional cited evidence for A-1042. Drafts preserve these selections, and receipts snapshot them alongside rationale. No downstream workflow or real authorization is implied.

Iteration 30 adds an expected-versus-observed reconciliation view for **A-1035**. The incomplete staging fixture permits **Still undetermined** with rationale; its receipt snapshots the comparison without implying deployment success.

Iteration 31 simulates response delivery with pending, rejection, offline and unknown acknowledgement states. Drafts survive unsuccessful attempts; unknown status requires explicit sample resolution before retry. Receipt confirmation remains local, with no network or durable deduplication.

Iteration 32 adds per-criterion statuses, notes and evidence citations to A-1042 assessments. Drafts retain these independently of the overall conclusion; receipts snapshot each criterion, including unreviewed and missing-evidence states.

Iteration 33 adds a **Revision cycle · standalone sample** explorer in Organization. Five linked records demonstrate contribution, assessment, explicit revision request, revised contribution and pending reassessment, with separate subject identities and preserved earlier decisions. This does not advance real or session assignments.

Iteration 34 makes long assessments easier to navigate: collapsible criterion editors show status/citation/note summaries, reviewer-status progress and direct jumps to criteria or overall rationale. Closing an editor preserves its draft.

New workflow previews:

- [Criterion review](previews/16-criterion-review.png)
- [Mobile review](previews/17-mobile-review.png)
- [Unknown delivery outcome](previews/18-delivery-unknown.png)
- [Staging reconciliation](previews/19-reconciliation.png)
- [Revision cycle — pending reassessment](previews/20-revision-cycle.png)

Iteration 35 refreshes all previews and connects the walkthrough to the current assessment, delivery and reconciliation flows. Earlier screenshot-freshness notes are historical.

Iteration 36 extracts response presentation and draft state without changing UI behavior:

- `ResponseDialog.tsx`: response form, structured assessment/reconciliation inputs and delivery controls.
- `useResponseDrafts.ts`: session drafts, structured fields, deletion and completion cleanup; invoked by the app.
- `Modal.tsx`: shared dialog shell and keyboard/focus behavior.
- `useResponseSubmission.ts`: existing app-owned delivery simulation.

Receipt creation and page composition still live in `main.tsx`; this is an incremental refactor.

## Organization overview

Two authored workstreams model payment webhook reliability and invitation improvements. Four workers hold seven scoped role bindings. See [the organization model](ORGANIZATION-MODEL.md) for the scenario boundaries and next increment. Existing iteration 35 previews predate this overview.

[Organization overview · iteration 37](previews/21-organization-overview.png)

Workstream cards now open dedicated detail pages with coordination handoffs, current assignments, evidence and outcome gaps. Deep links: `#/workstreams/WS-01` and `#/workstreams/WS-02`. [Payment workstream detail](previews/22-workstream-detail.png).

Select **View worker** on an organization role card to inspect that worker’s scoped bindings and related assignments. **Responsibility gaps** distinguishes missing bindings from work not yet assigned. [Worker detail preview](previews/23-worker-detail.png).

**Organization attention** summarizes responsibility gaps, pending responses and unverified outcomes across the sample. Filter by attention type, then inspect the linked assignment or workstream. Counts represent signals, not progress. [Attention preview](previews/24-organization-attention.png).

On a workstream, select **Open handoff** to inspect participants, inputs, receiving conditions and revision/clarification return paths. [Handoff preview](previews/25-handoff-detail.png).

Select **View organization activity** on Organization to filter records by workstream and type. Session responses have recording times; attached evidence has no verified publication history. [Activity preview](previews/26-organization-activity.png).

On each workstream, select **Review outcome evidence** to inspect goal-level evidence requirements, existing context and remaining gaps. [Outcome review preview](previews/27-outcome-review.png).

The overview has section shortcuts for Goals, Attention and Roles & Workers. Additional organization work and gap explanations are expandable. Detail breadcrumbs identify the current subject and return to Organization. See [the layout/navigation review](UI-REVIEW.md) for remaining improvements.

Attention is now a compact three-category summary on the overview. Select a count or **View all organization attention** for the dedicated list. Category URLs preserve the filter across refresh and history.

# Historical README checkpoints

Archived on 2026-10-07 as development history. Screenshot freshness and instructions below refer to their original checkpoints; use README.md and WALKTHROUGH.md for current presentation.

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
- **Navigation:** Organization (default), My Work, Evidence, Demos. More administrative screens should be designed around demonstrated operational needs.
- **Layout:** persistent desktop navigation; responsive cards and assignment rows; a navigation toggle on narrow screens. Assignment authority stays visible beside its context on large screens and follows it on small screens.
- **Interaction:** search, responsibility filters, completed work, assignment tabs, artifact inspection, rationale validation, local decision records, keyboard-focus containment and Escape dismissal for dialogs.

## Human contribution

Demos → **Try human contribution** lets a human prepare, deliver and revise one fictional text contribution. Delivery, receipt and assessment are separate; earlier versions remain inspectable. Session-only, excluded from Demo continuity. See [human contribution](HUMAN-CONTRIBUTION.md).

## Software Factory inspection

Demos → **Open SF snapshot** provides one coherent read-only assignment/attempt/work-product example with source context and unavailable evidence states. The example is synthetic. **Inspect retained SF run** opens redacted metadata from a real historical execution; neither source is live. See [snapshot inspection](SF-SNAPSHOT-INSPECTION.md).

## Organization context and accountability

SF inspection separates its source dataset from the main sample organization/persona and shows installed-context gaps. A selected-attempt trace links exact source records and leaves assessment/authority/effect gaps explicit. See [organization context and accountability](SF-ORGANIZATION-ACCOUNTABILITY.md).

## Contribution command contract

The human contribution exercise now separates pending/unknown/rejected/admitted command status from delivery projection and receiver receipt. Expand **Command delivery simulation** in its editor to try these local outcomes. See [command contract and backend requirements](CONTRIBUTION-COMMAND-CONTRACT.md).

## Inspection read contract

SF inspection now consumes a validated draft projection with a snapshot-byte revision, capture/source context and explicit known/not-recorded/redacted/unsupported fields. See [the draft read contract and source mapping](SF-READ-CONTRACT.md). No SF HTTP endpoint or command capability is introduced.

## Scope and boundaries

See [Architecture alignment review](ARCHITECTURE-ALIGNMENT-REVIEW.md) for the overall assessment at checkpoint 90 and the recommended next sequence, starting with one source-backed work slice.

This is a design prototype using React, TypeScript, Vite, and Lucide icons. People and operational interactions in the main/Knowledge/large scenarios are fictional. The separate retained SF inspection contains explicitly labeled real historical metadata with an omission manifest; the synthetic SF inspection remains fictional. Organization combines illustrative role snapshots with session-aware assignment summaries. Main-scenario evidence records and its artifact inspector are illustrative, not verified artifacts. The retained inspection preserves source identities but does not independently verify provenance.

Responses are local demo state. Demos → Demo continuity supports explicit browser snapshots and JSON transfer; reload restores only the last saved snapshot. There is no authentication, backend, actual authorization check, shared durable storage, live event stream, or external execution. A real implementation must obtain identity and permissions from the application API and submit commands for server-side authorization and governed admission. The UI must not treat its local state as an authoritative record.

Before production: extend the existing failure previews to production rejection/offline/concurrent-update handling; define versioned API contracts; connect exact artifact provenance; add authentication and server-enforced permissions; conduct a full accessibility review and user testing. The visible multi-role persona exists solely to exercise both review and authority flows.

This design is an original implementation based on the allowed repository discussions. It contains no copied private planning documents and uses no material from the excluded `x1` repository.

## Usability and accessibility review

The [task review and participant plan](USABILITY-ACCESSIBILITY-REVIEW.md) records bounded technical findings, focus/form/status fixes and worker/reviewer/operator tasks. Participant and actual screen-reader sessions have not been run.

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

**My Work → View response queue · Alex** opens the personal assignments grouped by response state. **Demos** opens the independent revision-cycle example. Both are now outside Organization Overview.

Cited artifact links now open the exact record in the inspector from workstreams, handoffs, outcome review and organization activity. Closing preserves the current route and filters and restores keyboard focus. [Exact artifact preview](previews/29-outcome-artifact-inspector.png).

Assignment Back buttons now identify their source page and restore its session filters, scroll and link focus. Direct assignment links after refresh use My Work as the return destination.

Organization detail pages share back-button, spacing and empty-state styles. On mobile, filters and action groups expand to the available width and text-link targets are larger.

**Demos → Explore larger organization** offers an independent six-stream, nine-worker scenario with multiple assignees and search/worker/state filters. See [the scale review](ORGANIZATION-SCALE-REVIEW.md) for findings and boundaries.

Responsibility gaps now offer **Propose responsibility**. Choose a sample worker and rationale, then reopen or remove the local proposal. Gaps stay open until a separate allocation decision. See [the proposal demo](RESPONSIBILITY-PROPOSALS.md).

Customer presentation: Demos → Start customer walkthrough. The eight-step guide connects existing screens and explains the change from invitation coordination to payment evidence. See [CUSTOMER-WALKTHROUGH.md](CUSTOMER-WALKTHROUGH.md).

Organization Overview → Browse workstreams opens a searchable directory with project and responsibility/outcome filters stored in the URL. See [WORKSTREAMS-DIRECTORY.md](WORKSTREAMS-DIRECTORY.md).

Organization Overview → Browse workers opens a searchable directory with type, role and explicit assignment-link filters stored in the URL. See [WORKERS-DIRECTORY.md](WORKERS-DIRECTORY.md).

Workstream detail now shows an ordered collaboration flow with explicit assignment, evidence, exchange and missing-responsibility links. Numbering is proposed coordination rather than execution history. See [WORKSTREAM-FLOW.md](WORKSTREAM-FLOW.md).

Responsibility proposal → Review allocation plan previews proposed binding/assignment changes and records a local accept/reject decision with rationale. Accepted plans remain pending allocation. See [ALLOCATION-REVIEW.md](ALLOCATION-REVIEW.md).

Organization includes an expandable plain-language workspace guide. Directory empty states offer Show all recovery, and allocation review keeps the original proposal behind a disclosure. See [CUSTOMER-EXPERIENCE-REVIEW.md](CUSTOMER-EXPERIENCE-REVIEW.md).

Current organization design assessment and next priorities: [VIRTUAL-ORGANIZATION-REVIEW.md](VIRTUAL-ORGANIZATION-REVIEW.md). The shared organization model is coherent; overview density, coordination history and a common scenario provider are the next gaps.

Organization Overview now places coordination attention directly after shared purpose. Workstream cards summarize goals/outcomes; worker cards summarize identity/type/binding counts. Use the existing directories/details for assignment and scoped binding inspection. Section shortcuts and secondary disclosures remain available.

Organization activity includes proposal and allocation-plan decision records with scoped filters and receipt inspection. Accepted plans remain pending allocation. See [COORDINATION-ACTIVITY.md](COORDINATION-ACTIVITY.md).

Demos → Open larger scenario workspace uses shared Overview and directory components with six workstreams/nine workers. Scenario-qualified read-only detail/assignment inspection keeps main records separate. See [SHARED-SCENARIOS.md](SHARED-SCENARIOS.md).

Roles can be explored from Organization → Browse roles, at `#/organization/roles` or `#/organizations/large/roles`. Search and responsibility coverage filters persist in the URL. Role catalogs, bindings, assignments and known scope gaps remain separate sample records.

Demos → **Open knowledge scenario workspace** explores a non-software organization. Select Maya (Editor) or Leo (Coordinator), then open My Work to inspect their different assignments. Direct links: `#/organizations/knowledge?persona=maya`, `#/organizations/knowledge/work?persona=maya` and `#/organizations/knowledge/work?persona=leo`. See [KNOWLEDGE-SCENARIO.md](KNOWLEDGE-SCENARIO.md). This is a read-only persona preview with sample data.

Explicit input dependencies are available in workstream/assignment detail and the knowledge inbox. Try `#/organizations/knowledge/assignments/K-02-E?persona=maya` or `#/workstreams/WS-01`; Organization attention → Input shows missing-input signals. See [COORDINATION-INPUTS.md](COORDINATION-INPUTS.md).

Shared read-only My Work supports search and role/workstream/attention filters. Try `#/organizations/knowledge/work?persona=maya&status=waiting`, `#/organizations/large/work?persona=sam` or `#/organizations/large/work?persona=jamie`. Sam has two allocated Reviewer assignments; Jamie’s Planner binding has no represented assignments. See [PERSONAL-WORK.md](PERSONAL-WORK.md).

Organization → Browse roles → **Coverage by workstream** shows declared bindings, scoped assignments, known gaps and unknown relationships. The optional role × workstream matrix preserves unmodeled cells as unknown. Try `#/organization/roles?view=scope&scope=scope-WS-02`. See [ROLE-SCOPE-COVERAGE.md](ROLE-SCOPE-COVERAGE.md).

Workers has compact summaries, expandable scope references and URL-preserved pages of six records. See [compact directory behavior and remaining scope](COMPACT-DIRECTORIES.md).

Workstreams also has compact summaries and four records per page, with expandable goal/gap/outcome context and preserved page/filter/persona URLs.

Roles now has four-card catalog/coverage pages and expandable catalog records with independent binding/assignment/gap pages. Expansion and nested page URLs survive refresh and existing detail return.

Use **Sample organization** to switch between main software, larger software and Knowledge Operations. Evidence stays inside the selected sample. Read-only nested return context survives refresh in the same tab. See [scenario navigation](SCENARIO-NAVIGATION.md).

The [latest virtual organization review](VIRTUAL-ORGANIZATION-NEXT-REVIEW.md) proposes the next five slices, beginning with a compact organization coordination overview. These proposals are not implemented features.

Knowledge Organization now has **Coordination by workstream** with missing-input provider links, independent responsibility/response/evidence needs and URL-preserved filters. See [coordination overview](COORDINATION-OVERVIEW.md). Main/larger adaptation follows in the next unit.

Iteration 73: Knowledge and larger software share the compact coordination overview and global persona controls. Larger software has four workstreams per page and three worker summaries, with complete directories available. Iteration 74 also adapts main responses from the interactive attention projection, keeping outside-stream work separate. See [COORDINATION-OVERVIEW.md](COORDINATION-OVERVIEW.md).

Iteration 75 adds shared outcome requirements/context review for all three samples, including scoped evidence and source return. See [SHARED-OUTCOME-REVIEW.md](SHARED-OUTCOME-REVIEW.md).

Iteration 76 starts Knowledge workflow/exchange map inspection with explicit responsibilities, input endpoints and parallel groups. Main/larger adaptation remains next. See [WORKFLOW-MAP.md](WORKFLOW-MAP.md).

Iteration 77 completes workflow/exchange map inspection across main, Knowledge and larger software. Main local responses do not advance flow or confirm input receipt; read-only relationships remain authored and explicitly scoped. See [WORKFLOW-MAP.md](WORKFLOW-MAP.md).

Iteration 78 adds scoped Decision responsibility inspection with main release allocation, an explicitly authored Knowledge clarification requirement, unknown policy/escalation fields and a larger empty state. See [DECISION-RESPONSIBILITY.md](DECISION-RESPONSIBILITY.md).

Iteration 79 adds read-only shared exchange history with Knowledge’s explicitly authored earlier draft events, independent delivery/receipt semantics and scoped URL/source return. Main activity remains unchanged; larger has no events. See [EXCHANGE-ACTIVITY.md](EXCHANGE-ACTIVITY.md).

The next operating-accountability review is [VIRTUAL-ORGANIZATION-OPERATING-REVIEW.md](VIRTUAL-ORGANIZATION-OPERATING-REVIEW.md), after the five inspection slices through iteration 79. It recommends coordination cases first; these proposals are not implemented features.

Iteration 81 adds Knowledge-first [Coordination cases](COORDINATION-CASES.md), with explicit follow-up ownership/unknowns, next actions, closure requirements and scoped source inspection. It is read-only and does not allocate tasks or resolve cases.

Versioned Knowledge welcome-guide scope proposals: see [WORKSTREAM-AGREEMENTS.md](WORKSTREAM-AGREEMENTS.md). Open K-01 and choose “Inspect proposed workstream agreement” to compare authored audiences and scope without implying adoption or evidence applicability.

Explicit goal-level review example: see [OUTCOME-REVIEW-RECORDS.md](OUTCOME-REVIEW-RECORDS.md). From Knowledge K-01 outcome requirements, inspect `guide-review-01` for the reviewer, version-bound reader finding, insufficient-evidence conclusion and remaining gaps.

Worker planning context: see [WORKER-CAPABILITIES.md](WORKER-CAPABILITIES.md). Main Jamie/Codex worker details and invitation proposals show authored capabilities alongside unknown or stale availability.

Knowledge operating guidance and policy gaps: see [OPERATING-PATTERNS.md](OPERATING-PATTERNS.md). From K-01 or K-02 workflow inspection, choose “Inspect operating pattern and policy”.

Knowledge overview now connects the operating records: see [ORGANIZATION-OPERATING-CONTEXT.md](ORGANIZATION-OPERATING-CONTEXT.md). Use “Agreements, reviews & policy” to inspect current gaps and separately labeled design examples.

Knowledge personal follow-up: see [PERSONAL-CASE-FOLLOW-UP.md](PERSONAL-CASE-FOLLOW-UP.md). Select Leo and open My Work to inspect the explicitly owned workshop-brief case alongside, but separately from, assignments.

One coherent version-bound collaboration example: see [COLLABORATION-WALKTHROUGH.md](COLLABORATION-WALKTHROUGH.md). Knowledge overview offers “Explore a complete collaboration example” with eleven fictional records and explicit revision/source links.

Local save and transfer are available in **Demos → Demo continuity**. See [DEMO-CONTINUITY.md](DEMO-CONTINUITY.md) for manual snapshots, reload restoration, reviewed import, reset and moving the demo between machines. Unsaved changes are not restored automatically.

Readability and loading update: [READABILITY-AND-LOADING.md](READABILITY-AND-LOADING.md) describes compact overview summaries, expandable context and deferred secondary views. Initial minified JavaScript is about 491 kB; the build no longer emits the previous >500 kB chunk warning.

Display follow-up: [Chromium/Firefox reflow and forced-colors review](DISPLAY-ACCESSIBILITY-REVIEW.md), with a separate repeatable two-browser test config and explicit actual-zoom/screen-reader limits.

## Product experience review after iteration 98

The [current review and proposed next sequence](PRODUCT-EXPERIENCE-REVIEW.md) recommends connecting ordinary contribution to My Work, then sharing the same version-bound records with a receiver and organization view. These are proposals, not implemented features.

Iteration 99: Knowledge Operations → Leo → My Work now offers **Open contribution · K-01-H**, with organization/workstream context and navigation-preserved session state. Reload clears this exercise; Demo continuity excludes it. Receiver responses remain explicit simulations. See [human contribution](HUMAN-CONTRIBUTION.md).

Iteration 100: Maya's Knowledge My Work receives Leo's exact delivered revisions and offers local sample receipt/revision-request actions. Leo sees the request in his own inbox; Organization shows the same exchange history. Integrated preparation no longer provides receiver controls. Reassessment/publication/outcome remain separate and unestablished. See [shared contribution behavior](HUMAN-CONTRIBUTION.md).

Iteration 101: Knowledge Organization now offers a compact actionable coordination list; Knowledge/larger attention lists identify subjects, waiting reasons, known responsibilities and suggested destinations. Local contribution needs route to Maya's receipt inbox or Leo's revision/command context. Main attention also exposes responsibility/follow-up boundaries. See [actionable attention](ACTIONABLE-ATTENTION.md).

Iteration 102: integrated contribution starts with current version, deliverable and next-action shortcuts; Maya sees the newest delivery and receiver next step first. Earlier versions remain behind disclosures. Command uncertainty and session boundaries stay visible. See [main task path](HUMAN-CONTRIBUTION.md).

Review after iteration 102: [UI consolidation priorities](EXPERIENCE-CONSOLIDATION-REVIEW.md) recommends simplifying Organization composition, labeling authored/session signal sources, deciding contribution recovery behavior and updating the integrated participant walkthrough. These are proposals, not implemented features.

Iteration 103: Organization prioritizes shared purpose, attention/next actions and workstreams. Contribution history and policy/agreement context move into separate initially collapsed disclosures after workstreams; the policy shortcut opens and focuses its target. See [landing-page consolidation](ORGANIZATION-CONSOLIDATION.md).

Iteration 104: attention signals label authored context versus local sample state, summaries show source totals, and Knowledge/larger workstream counters explain their independent scope. Knowledge contribution observations reset on reload; main local state retains its existing explicit snapshot rules. See [attention source semantics](ACTIONABLE-ATTENTION.md).

Iteration 105: **Save or restore Knowledge contribution** offers a confirmed browser checkpoint with validated, previewed restoration after reload. Unknown-command identities and submission locks survive restoration. This is separate from Demos continuity and requires explicit saving/restoring. See [contribution recovery](CONTRIBUTION-RECOVERY.md).

Iteration 106: the [integrated participant walkthrough](INTEGRATED-PARTICIPANT-WALKTHROUGH.md) covers Leo → Maya → revision → Organization, command uncertainty and checkpoint recovery. A [blank session record](PARTICIPANT-SESSION-RECORD.md) separates observed feedback from facilitator interpretation. Ready for human sessions; no participant results are claimed.

Iteration 107: Knowledge shows contribution save status even with checkpoint controls collapsed—unsaved, matching a timestamped checkpoint, changed since saving, saved-but-not-restored, or unavailable. Draft/command/receiver changes all participate in the comparison. Explicit save/restore behavior is unchanged.

Iteration 108: **Move contribution between machines** exports current Knowledge work as JSON and imports through validation, preview and explicit replacement confirmation. Export/import never writes the browser checkpoint automatically; save on the destination if needed. Unknown-command locks and exact records survive transfer. See [file transfer instructions](CONTRIBUTION-RECOVERY.md).

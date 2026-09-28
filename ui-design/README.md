# Forge workspace · design exploration 01

An interactive English-language design for humans and AI workers collaborating in a Software Factory. The opening screen makes the user's next responsibility clear; assignment details connect that responsibility to its input, evidence, and authority.

## Run

From this directory:

```sh
npm ci --cache ../.cache/npm
npm run dev
```

Open the local URL printed by Vite. For a production build, run `npm run build`. The resulting `dist/` contains static assets; this prototype does not include a Go server.

## Walkthrough

1. On **My Work**, select a responsibility card or search by assignment ID, title, or project.
2. Open **A-1042**. Read the assignment, inspect its evidence, and submit an assessment with a rationale. The reviewer can submit an assessment, but has no deployment approval action on this assignment.
3. Return to My Work. The completed assignment has moved to **Completed**, and its inbox count has decreased.
4. Open **A-1041** to approve or refuse the exact release candidate. A rationale is required. The recorded decision appears in Activity.
5. Visit **Organization** to inspect human, AI, and deterministic worker roles.
6. Visit **Evidence** to follow the illustrative chain from contribution to release decision. Recording an approval leaves the external effect unconfirmed.

## Design decisions

- **Information hierarchy:** responsibility first, then input, evidence, authority, and response.
- **Visual language:** deep green navigation, warm neutral surfaces, restrained amber for authority, slate blue for assessments, and lavender for reconciliation. Text labels accompany color.
- **Typography:** system sans-serif; no remote font dependency.
- **Navigation:** My Work, Organization, Evidence. More administrative screens should be designed around demonstrated operational needs.
- **Layout:** persistent desktop navigation; responsive cards and assignment rows; a navigation toggle on narrow screens. Assignment authority stays visible beside its context on large screens and follows it on small screens.
- **Interaction:** search, responsibility filters, completed work, assignment tabs, artifact inspection, rationale validation, local decision records, keyboard-focus containment and Escape dismissal for dialogs.

## Scope and boundaries

This is a design prototype using React, TypeScript, Vite, and Lucide icons. All people, IDs, dates, digests, snippets, records, and organizational activity are fictional. Organization cards show a fixed illustrative snapshot. Evidence records and the inspector are illustrative, not verified artifacts.

Responses live only in React state and reset on refresh. There is no authentication, backend, actual authorization check, durable storage, live event stream, or external execution. A real implementation must obtain identity and permissions from the application API and submit commands for server-side authorization and governed admission. The UI must not treat its local state as an authoritative record.

Before production: design rejection/error/offline/concurrent-update states; define versioned API contracts; connect exact artifact provenance; add authentication and server-enforced permissions; conduct a full accessibility review and user testing. The visible multi-role persona exists solely to exercise both review and authority flows.

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

Validation in the current workspace: production build passed; all four Playwright tests passed in Chromium. Desktop and 390px mobile screenshots were inspected. This is not a complete accessibility or cross-browser certification.

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

## Current previews — iteration 08

The preview files have been refreshed; earlier notes describing them as initial-design snapshots are historical.

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

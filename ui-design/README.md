# Forge workspace · virtual organization UI prototype

Organization is the shared view of goals, workstreams, responsibilities and coordination. My Work is each person's entrance into contributions, reviews and decisions. The prototype includes a shared Knowledge contribution loop and software-specific inspection.

## Run

From this directory:

```sh
npm ci --cache ../.cache/npm
npm run dev -- --port 4173 --strictPort
```

Open the URL printed by Vite. Build static assets with `npm run build`. No application backend or Go server is included.

## Start the demo

Open **Demos → Start organization demo**. Follow [the current walkthrough](WALKTHROUGH.md) for Organization → Leo My Work → Maya receipt/revision → shared coordination, followed by separate software evidence examples.

Starting preserves local work. For a clean presentation, use a fresh browser profile instead of clearing someone else's data. Sample personas do not authenticate users or grant permissions.

## Current previews · iteration 109

Captured from iteration 109 on 2026-10-07. These are fictional demo views, not production operation.

- [Knowledge Organization · desktop](previews/109-organization-desktop.png)
- [Knowledge Organization · phone](previews/109-organization-phone.png)
- [Leo contribution](previews/109-contribution.png)
- [Maya receiver](previews/109-receiver.png)
- [Software evidence · separate sample](previews/109-software-evidence.png)

With Vite running on port 4173, reproduce from this directory using `node scripts/capture-current-demo.mjs`. Screenshots in other files retain their own historical checkpoint dates; see [development history](README-HISTORY.md).

## What is interactive?

| Surface | Source and behavior |
| --- | --- |
| Main Software Factory workspace | Fictional assignments, reviews, authority responses, evidence and local receipts |
| Knowledge Operations | Authored organization context plus one shared local Leo/Maya contribution exercise |
| Larger software organization | Read-only authored scale scenario |
| Synthetic SF inspection | Coherent fictional assignment/attempt/work-product snapshot |
| Retained SF inspection | Real historical redacted metadata; not live or independently provenance-verified |

Assessment, authorization, execution observations and verified outcomes remain distinct. Missing responsibility or evidence is visible. Contribution receipt does not establish acceptance or publication.

## Save, recover and move work

Knowledge's visible save status distinguishes current work from its browser checkpoint. **Save or restore Knowledge contribution** supports explicit save, validated preview/restore and JSON export/import between machines. Reload starts Knowledge empty; recover explicitly. Unsaved work is not recovered. Import replaces the current exercise and does not automatically update the checkpoint. See [contribution recovery](CONTRIBUTION-RECOVERY.md).

Main software **Demos → Demo continuity** has a separate explicit snapshot/export/import mechanism; reload may restore its last saved snapshot. Standalone human contribution is session-only and excluded from both save mechanisms. See [demo continuity](DEMO-CONTINUITY.md).

## Scope and product boundaries

React, TypeScript, Vite and Lucide power this original English-language design. No authentication, server-enforced authorization, shared durable organization state, live SF API or external execution is implemented. Local records and imported files are demonstrations, not server-admitted organizational facts. No material from the excluded `x1` repository is used.

Read [architecture alignment](ARCHITECTURE-ALIGNMENT-REVIEW.md), [source boundaries](SF-READ-CONTRACT.md), [receiver experience](RECEIVER-EXPERIENCE.md), [backend integration plan](BACKEND-INTEGRATION-PLAN.md), [revision comparison](CONTRIBUTION-COMPARISON.md), [contribution accessibility review](CONTRIBUTION-ACCESSIBILITY-REVIEW.md), [contribution error recovery](CONTRIBUTION-ERROR-RECOVERY.md), [contribution consistency](CONTRIBUTION-CONSISTENCY.md), [actionable attention](ACTIONABLE-ATTENTION.md) and [consolidation review](EXPERIENCE-CONSOLIDATION-REVIEW.md) for design rationale and remaining work.

## Verify and test with people

Run `npm run build` and relevant Playwright tests with `npm test`. In this environment, browser dependencies are repository-local:

```sh
LD_LIBRARY_PATH=../.cache/browser-libs/extracted/usr/lib/x86_64-linux-gnu \
PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright \
TMPDIR=../.cache/tmp npm test
```

Use [participant tasks](INTEGRATED-PARTICIPANT-WALKTHROUGH.md) and the [blank session record](PARTICIPANT-SESSION-RECORD.md) for actual feedback. Participant and screen-reader sessions have not been conducted. Technical browser checks are not usability evidence or accessibility certification.

[Iterations](ITERATIONS.md) record completed increments. [Historical customer tour](CUSTOMER-WALKTHROUGH.md) and [software review walkthrough](SF-REVIEW-WALKTHROUGH.md) remain supplemental domain examples.

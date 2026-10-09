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

Open **Demos → Explore guided organization journey** for the eight-chapter goal-to-reviewed-result story. Follow [the presenter walkthrough](WALKTHROUGH.md). The guided snapshots preserve current work; **Start organization demo** opens the editable Knowledge workspace. See [journey behavior and limits](ORGANIZATION-JOURNEY.md).

Starting preserves local work. For a clean presentation, use a fresh browser profile instead of clearing someone else's data. Sample personas do not authenticate users or grant permissions.

## Current previews · iteration 109

Captured from iteration 109 on 2026-10-07. These are fictional demo views, not production operation.

- [Knowledge Organization · desktop](previews/109-organization-desktop.png)
- [Knowledge Organization · phone](previews/109-organization-phone.png)
- [Leo contribution](previews/109-contribution.png)
- [Maya receiver](previews/109-receiver.png)
- [Software evidence · separate sample](previews/109-software-evidence.png)

With Vite running on port 4173, reproduce from this directory using `node scripts/capture-current-demo.mjs`. Screenshots in other files retain their own historical checkpoint dates; see [development history](README-HISTORY.md).

## Goal outcome loop · iteration 140

After outcome review, the owner separately records scoped goal attainment, an evidence gap or further work. Follow-up offers have a named recipient, acceptance, delivery and owner review; completing a task never rewrites the original outcome. Shared K-01 status, My Work, timeline and checkpoint v10 retain the loop. See [goal outcome loop](GOAL-OUTCOME-LOOP.md).

## Review responsibility handoff · iteration 139

Publication review, authorization/control and outcome review can transfer to separate local principals after exact-package acknowledgment and acceptance. Former holders cannot record the transferred decision; earlier grants and outcomes keep their authors. Shared progress, My Work, timeline and checkpoint v9 retain the arrangement. See [review responsibility handoff](REVIEW-RESPONSIBILITY-HANDOFF.md).

## Cross-workstream input · iteration 138

K-01’s assessed access guide can become K-02 workshop preparation input through Maya’s exact offer, Leo’s receipt and a separate applicability decision. Briefs freeze their source references; changed sources and new handoff decisions block reuse while retaining earlier briefs. Open My Work as Maya/Leo or either workstream. See [cross-workstream inputs](CROSS-WORKSTREAM-INPUTS.md).

## Fresh authority for revised material · iteration 136

Maya can request further content revision without overwriting a suitable assessment. After a new delivery, receipt and suitable reassessment, the owner can confirm a fresh mandate through draft-09. Publication assessment, authorization, execution and outcome start separately; earlier chains remain in history and the timeline. See [fresh material use](MATERIAL-USE-REVISIONS.md).

## Knowledge timeline · iteration 135

**Open Knowledge timeline** follows retained local work from offers and handoffs through contribution, assessment, scope and bounded-use outcomes, plus K-02 brief history. Filter by workstream/stage or search, inspect exact records and follow their references. See [Knowledge timeline](KNOWLEDGE-TIMELINE.md).

## Input and authority handoff · iteration 134

K-01-H now supports owner-proposed handoffs between Leo and a local demo delegate. The recipient reviews exact input, frozen draft, remaining work and bounded contribution rights before accepting. Ownership stays with the original contributor until acceptance; stale packages block acceptance. See [Knowledge handoff](KNOWLEDGE-HANDOFF.md).

## Knowledge responsibility · iteration 133

Before submission, the demo owner can offer K-01-H to Leo. Leo accepts, requests clarification or declines; unresolved offers block submission. Organization, attention and My Work show the next responsible actor. Checkpoints preserve offers and responses. See [Knowledge responsibility](KNOWLEDGE-RESPONSIBILITY.md).

## Content revision loop · iteration 132

Leo and Maya can continue requested revisions through draft-09. Each version preserves its own delivery, receipt and assessment; the comparison follows the latest two versions. Checkpoints recover the full history. See [content revisions](CONTRIBUTION-REVISIONS.md). Use authorization remains exact to draft-02 and does not transfer to changed material.

## What is interactive?

| Surface | Source and behavior |
| --- | --- |
| Main Software Factory workspace | Fictional assignments, reviews, authority responses, evidence and local receipts |
| Knowledge Operations | Authored organization context plus one shared local Leo/Maya contribution exercise |
| Larger software organization | Read-only authored scale scenario |
| Synthetic SF inspection | Coherent fictional assignment/attempt/work-product snapshot |
| Retained SF inspection | Real historical redacted metadata; not live or independently provenance-verified |

Assessment, authorization, execution observations and verified outcomes remain distinct. Missing responsibility or evidence is visible. Contribution receipt does not establish acceptance or publication.

Maya can reassess received draft-02 with a reasoned local conclusion. Suitability, publication authority and verified outcome remain separate. See [reassessment](CONTRIBUTION-REASSESSMENT.md), including checkpoint v1/v2 compatibility.

The main software sample also supports [explicit local responsibility allocation](LOCAL-RESPONSIBILITY-ALLOCATION.md), separate from accepting an allocation plan. New responsibilities appear in a separate local inbox and organizational views.

## Save, recover and move work

Knowledge's visible save status distinguishes current work from its browser checkpoint. **Save or restore Knowledge contribution** supports explicit save, validated preview/restore and JSON export/import between machines. Reload starts Knowledge empty; recover explicitly. Unsaved work is not recovered. Import replaces the current exercise and does not automatically update the checkpoint. See [contribution recovery](CONTRIBUTION-RECOVERY.md).

Main software **Demos → Demo continuity** has a separate explicit snapshot/export/import mechanism; reload may restore its last saved snapshot. Standalone human contribution is session-only and excluded from both save mechanisms. See [demo continuity](DEMO-CONTINUITY.md).

See the [current organization completion review](VIRTUAL-ORGANIZATION-COMPLETION-REVIEW.md) for the next implementation sequence and production requirements.

## Scope and product boundaries

React, TypeScript, Vite and Lucide power this original English-language design. No authentication, server-enforced authorization, shared durable organization state, live SF API or external execution is implemented. Local records and imported files are demonstrations, not server-admitted organizational facts. No material from the excluded `x1` repository is used.

Read [architecture alignment](ARCHITECTURE-ALIGNMENT-REVIEW.md), [source boundaries](SF-READ-CONTRACT.md), [contribution layout](CONTRIBUTION-LAYOUT.md), [workstream contribution progress](CONTRIBUTION-PROGRESS.md), [receiver experience](RECEIVER-EXPERIENCE.md), [backend integration plan](BACKEND-INTEGRATION-PLAN.md), [revision comparison](CONTRIBUTION-COMPARISON.md), [contribution accessibility review](CONTRIBUTION-ACCESSIBILITY-REVIEW.md), [contribution error recovery](CONTRIBUTION-ERROR-RECOVERY.md), [contribution consistency](CONTRIBUTION-CONSISTENCY.md), [actionable attention](ACTIONABLE-ATTENTION.md) and [consolidation review](EXPERIENCE-CONSOLIDATION-REVIEW.md) for design rationale and remaining work.

## Verify and test with people

Run `npm run build` and relevant Playwright tests with `npm test`. In this environment, browser dependencies are repository-local:

```sh
LD_LIBRARY_PATH=../.cache/browser-libs/extracted/usr/lib/x86_64-linux-gnu \
PLAYWRIGHT_BROWSERS_PATH=../.cache/ms-playwright \
TMPDIR=../.cache/tmp npm test
```

Use [participant tasks](INTEGRATED-PARTICIPANT-WALKTHROUGH.md) and the [blank session record](PARTICIPANT-SESSION-RECORD.md) for actual feedback. Participant and screen-reader sessions have not been conducted. Technical browser checks are not usability evidence or accessibility certification.

[Iterations](ITERATIONS.md) record completed increments. [Historical customer tour](CUSTOMER-WALKTHROUGH.md) and [software review walkthrough](SF-REVIEW-WALKTHROUGH.md) remain supplemental domain examples.

Workshop input exchange: [exact-version Knowledge K-02 brief handoff](BRIEF-HANDOFF.md) (local session demo).

Knowledge K-01: [local agreement adoption and scope impact](AGREEMENT-ADOPTION.md) (session-only simulation).

Knowledge K-01: [assessed draft to bounded use and outcome review](AUTHORIZED-USE-OUTCOME.md) (session-only simulation, no publication executed).

Knowledge bounded-use flow: [shared and personal next responsibilities](USE-RESPONSIBILITIES.md).

Knowledge continuity: [whole workspace checkpoint, export and explicit recovery](KNOWLEDGE-WORKSPACE-RECOVERY.md).

Knowledge scope governance: [exact source applicability decisions](SCOPE-APPLICABILITY.md).

Knowledge repeated operation: [one explicit subsequent bounded-use cycle](USE-CONTINUATION.md).

Main local allocations: [performer acceptance and confirmed reassignment](RESPONSIBILITY-ACCEPTANCE.md).

Authority update · iteration 137: [suspension and revocation](AUTHORITY-CONTROL.md) preserve the original grant, block future execution, require explicit verification to resume a suspension, and retain control history in timeline and whole-workspace checkpoint v7. Revocation cannot be resumed.

Iteration 141 simplifies Knowledge use and goal follow-up reading order: current status and responsible person first, action fields visible, exact evidence and retained cycle history available in disclosures. See [iteration notes](ITERATIONS.md).

Iteration 142 adds a concise organization overview scan of workstream goals, recorded outcomes, inspection cues and known responsible people. Detailed coordination is expandable and opens automatically for filtered links. The scan is bounded to four streams with access to the complete directory; it is not a live health or completion score.

Iteration 143 aligns Roles, Workers, Workflow, Outcome and My Work with a common Current state / Responsibility / Next step summary. Facts and actions remain specific to each screen; narrow screens stack the same reading order vertically.

Iteration 144 audits navigation continuity: organization-aware invalid-link recovery, persona-preserving bounded-use links, contextual local-inbox returns and Escape dismissal for the mobile menu. Empty-directory and nested-return paths are covered by targeted phone/desktop checks.

Iteration 145 adds a [local workshop-brief case lifecycle](CASE-LIFECYCLE.md): accepted follow-up, updates, exact-source resolution proposals, independent review and explicit reopening. Organization/My Work, timeline and whole-workspace checkpoint v11 retain its status and history; case closure does not verify workshop outcomes.

Iteration 146 completes a [local K-02 workshop delivery loop](WORKSHOP-DELIVERY.md): facilitator offer/acceptance, preparation and independent readiness, simulated execution, separate observations and scoped outcome review. Shared/personal progress, scoped allocation, timeline and checkpoint v12 preserve exact source and cycle history.

Iteration 147 adds [worker capabilities and availability](WORKER-READINESS.md) to directory cards, capability search and worker profiles. K-02 facilitator candidate review separates declared skills, scoped availability, assignment links and acceptance; existing SF historical declarations retain their stale status. All readiness data remains authored advisory context, not live capacity.

Iteration 148 adds a [shared source and scope impact report](CHANGE-IMPACT.md). It connects retained use, pending review handoffs, adopted-scope applicability, K-01→K-02 inputs, brief, case and workshop source gates. Blocked/review-needed/historical/current statuses distinguish changed sources from missing evidence; inspection preserves persona and return context without mutating decisions.

Iteration 149 adds [versioned operating guidance](PATTERN-VERSIONING.md): explicit v1/v2 selection, compatibility rationale, separate exact-work version associations, retained versions through upgrade/rollback, shared impact and timeline, and replay-validated whole-workspace checkpoint v13. Guidance selection does not migrate running work or change operational authority.

Iteration 150 adds an [organization goal and evidence map](ORGANIZATION-GOALS.md) for Knowledge: explicit purpose-to-workstream links, scoped evidence/decisions, source and cycle boundaries, remaining gaps and next operational responsibility. Scoped simulation results never automatically establish an organization-wide outcome; organization-level accountability remains explicitly unallocated.

Iteration 151 adds [multi-candidate K-02 allocation](WORKSHOP-ALLOCATION.md): explicit Leo/Maya offers, independent reviewer choice, acceptance-only pre-execution handoff, fresh recipient preparation/readiness and replay-validated checkpoint v14. Candidate profiles remain advisory; reviewer conflicts and post-execution transfers are blocked.

## Exception handling · iteration 152

[Explicit K-02 exception follow-up](EXCEPTION-HANDLING.md) connects observed issues, accepted handling, exact remedies and independent review, with shared/personal responsibilities and checkpoint recovery.

## Workspace layout · iteration 153

[Organization-first layout](WORKSPACE-LAYOUT.md) prioritizes purpose, goals and coordination, with operating tools on demand and personal/detail actions expanded below the main content.

## Personal next steps · iteration 154

[My Work next steps](PERSONAL-NEXT-STEPS.md) distinguishes current work, independent review and waiting, with direct response links and a compact grouped assignment inbox.

## Shared workstream coordination · iteration 155

[Operational lanes](ORGANIZATION-FLOW.md) make each Knowledge workstream’s current step, next actor and waiting conditions visible without collapsing separate decisions into a completion score.

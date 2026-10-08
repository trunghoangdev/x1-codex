# Virtual organization review after iteration 125

Reviewed 2026-10-07 through source and local design documentation. This is not a new runtime, participant or production assessment. This sequence supersedes the iteration-120 backlog for future planning; it does not change the implementation status of earlier slices.

## Assessment

The UI now demonstrates explicit local allocation, versioned input delivery and receipt, revised contribution reassessment, agreement adoption, and an assessed-result-to-bounded-use/outcome chain. These are substantial interaction building blocks for a virtual organization.

They do not yet form one continuous organizational operation. Main-sample allocation and Knowledge exercises remain separate. The latest use chain is a panel on selected shared views, not a set of allocated personal responsibilities. Sam and the demo organization owner are named simulated actors, not connected worker identities. Scope impact is a checklist with unknown applicability. Several new state slices clear on reload and are not included in existing checkpoints.

The next work should connect the existing records, identities and responsibilities before adding more screens or domain breadth. Organization remains the shared entrance; My Work should expose only the selected person's represented next responsibilities. A domain may coordinate parallel work rather than follow one global linear process.

## Proposed sequence

### 1. Connect local next responsibilities to Organization and My Work — local slice implemented at iteration 127

See [use responsibilities](USE-RESPONSIBILITIES.md). The following retains the original acceptance scope; production membership, authority and shared durable queues remain outside this local slice.

Create one derived presentation of the Knowledge use chain's current stage, exact subject, responsible demo principal, blocking condition and destination. Represent the demo owner and Sam explicitly within local actor context; do not silently identify Sam as Maya or invent a production membership. Route actions through inspectable source records. Reuse the projection for shared attention, the K-01 progress lane and appropriate personal entries, instead of copying stage logic into each screen.

Acceptance: after editorial suitability, scope allocation/publication assessment/use authorization/execution/reader observation/outcome review each has an explicit next responsibility. A completed decision leaves its queue; refusal/revision/failure shows its real boundary without automatically assigning unsupported follow-up work. Missing/changed source blocks continuation consistently. Existing authored counters remain separately labelled. Persona switching remains a simulation, not authorization.

This closes a partial acceptance gap from iteration 125: its chain is connected internally, but Organization/My Work do not yet connect the next participant at every boundary.

### 2. Recover the whole Knowledge workspace coherently — local slice implemented at iteration 128

See [whole workspace recovery](KNOWLEDGE-WORKSPACE-RECOVERY.md). The original acceptance scope follows; shared durable storage and concurrency remain outside this local slice.

Extend explicit local recovery to include contribution, K-02 brief handoff, K-01 agreement adoption and authorized-use chain together, with a versioned format and exact-link validation. Preserve compatibility with existing contribution-only checkpoints; make partial versus whole-workspace replacement clear. Preview what is replaced, retained and made stale. Do not silently auto-merge unrelated scopes or accept broken references.

Acceptance: export/reload/explicit restore reproduces the same stage, input version, adopted scope, decisions and history. Invalid or incompatible data leaves current state intact. Cancel preserves current work. A contribution-only import shows its impact on dependent use records. Main software snapshots remain independently scoped. This is local recovery, not shared durable multi-user storage.

### 3. Record actual scope applicability decisions — local slice implemented at iteration 129

See [scope applicability](SCOPE-APPLICABILITY.md). The following preserves original acceptance criteria; production review authority and repeated execution cycles remain outside the local slice.

Extend the agreement impact checklist with explicit checks linking an exact source record/version to the exact adoption record and audience. Support applicable, needs reassessment and insufficient information with reviewer responsibility and rationale. Keep workstream agreement and bounded-use audience distinct until an explicit mapping is recorded. A newer agreement leaves earlier applicability decisions historical; it does not automatically grant use permission.

Acceptance: changing cohort/team scope identifies the specific assessments and inputs requiring reconsideration. Unknown mappings stay unknown; records applicable to the earlier scope remain intact. Any downstream use guard explains the precise missing scope mapping rather than claiming all evidence is invalid. A suitable editorial assessment alone does not authorize publication.

### 4. Continue after revision, refusal or execution failure

Support a bounded subsequent cycle with new version/attempt/decision identities and explicit links to the previous result. The contribution model currently supports only drafts 01/02; use records currently have fixed single-cycle IDs. Extend those deliberately rather than overwriting the prior cycle or adding a reset disguised as retry.

Acceptance: a failed simulated execution can receive a separately authorized subsequent attempt; changed material requires its own delivery/receipt/assessment as appropriate. Refusal and revision decisions remain inspectable. Retry does not duplicate an already recorded action or reuse authority for a changed version. Recovery and stale-source protection cover both cycles. Define which follow-up is actually supported before offering controls.

### 5. Add performer acceptance and explicit reassignment continuity

Build on recorded local allocation with the selected performer's separate acceptance, clarification or decline. For reassignment, distinguish a proposal from an effective responsibility change and record the exact pending work and input/decision history transferred. Represent availability as unknown unless supplied. Do not treat a worker selection as consent, permission or capacity.

Acceptance: planner allocation alone does not claim acceptance. A decline leaves an explicit coordination need. An effective reassignment updates both personal entrances while preserving earlier ownership and records. Any publication mandate or exact input that cannot transfer automatically is flagged for review. Keep this local until backend allocation/authority contracts exist.

## Ordering and supporting layout work

Start with item 1: it makes the existing capability understandable as organizational work instead of isolated exercise panels. Then item 2 protects continuity. Items 3–5 improve governed change, repeated operation and responsibility transitions.

During item 1, show a concise shared status and next action, with detailed use-chain forms/history opened from the relevant responsibility. Currently the full authorized-use exercise is rendered before the main workstream/outcome/decision content, and agreement banners appear across Knowledge views. Reduce repeated top-level panels as the common projection becomes available. This is supporting layout work, not another screen backlog.

## Production boundary

Frontend work cannot supply authenticated organization membership, policy enforcement, durable shared commands, concurrency/idempotency, live worker dispatch or observed customer outcomes. Keep that integration track explicit. Real participant testing remains deferred by the user. None of these proposals requires reading the excluded `x1` repository or using unavailable architecture canon.

## Sources inspected

`ScenarioWorkspace.tsx`, root state in `main.tsx`, `actionableAttention.ts`, `scenarioWork.ts`, `exchangeActivity.ts`, `authorizedUse.ts`, `agreementAdoption.ts`, `demoSnapshot.ts`, iteration history and the implementation guides for local allocation, brief handoff, agreement adoption and authorized use. Review only; no application behavior changed or new browser tests run.

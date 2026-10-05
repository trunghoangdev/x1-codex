# UI architecture alignment review

Reviewed 2026-10-05 against implementation checkpoint `7af731e` (iteration 90).

The UI is a substantial organization-centered interaction prototype. It explains shared purpose, scoped responsibility, human participation and evidence. It is not yet an operational organization interface. The largest remaining gap is accountable source data and a complete human work path, rather than another directory or dashboard.

## Evidence and limits

Inspected the current README, iteration history, scenario/data models, main workspace, demo continuity and operating-context backlog. Compared relevant product, interaction, deployment and persistence guidance in the permitted planning repository with the current Software Factory README and operating rules. The excluded `x1` repository and archive directories were not read.

Private planning documents are not reproduced here. These are original observations about the prototype. Directional architecture does not establish that an API or backend capability exists. No live environment was contacted and no new browser run was performed. Iteration 90 records the latest build and targeted browser validation; this review does not certify accessibility or production readiness.

## Where we stand

| Area | Current implementation | Remaining boundary |
| --- | --- | --- |
| Organization | Shared goals, workstreams, scoped bindings, gaps and attention | Authored state; no installed organization configuration source |
| My Work | Explicit assignments, response queues and Knowledge case ownership | Demo personas; no authenticated actor or server-derived inbox |
| Human participation | Structured assessment, rationale, citations, authority responses and reconciliation | Ordinary contribution/delivery is primarily an authored walkthrough |
| Collaboration | Dependencies, parallel work, handoffs, versioned briefs and revision examples | No admitted objective, allocation, agreement adoption or operational delivery path |
| Authority | Exact release subject, prerequisites, refusal and invalidation previews | Local labels and receipts establish no effective permission or admission |
| Evidence/outcomes | Scoped inspection, criteria and independent outcome gaps | Fictional identities/content; no resolver/verifier-backed provenance |
| Generic design | Shared main/large/Knowledge projections; roles distinct from runtimes | Three fixed scenarios; Knowledge examples are not general operating capabilities |
| Worker context | Declared capability/availability and scoped responsibilities | No authoritative contract compatibility, current availability or placement |
| Activity/continuity | Source navigation, local receipts and explicit save/export/import | Browser snapshots are neither organization persistence nor durable audit |
| Deployment | React/TypeScript/Vite produces static assets | No Go serving package or application API |
| Usability | Responsive layout, keyboard behavior, disclosures and deferred screens | Task-based user testing and full accessibility review remain; bundle reduction is not a latency benchmark |

## What to preserve

Keep Organization as the shared view and My Work as the personal entrance. Connect them through explicit subjects and responsibilities.

Keep assessment, authorization, execution observations and outcome verification separate. Missing/unknown states and exact-subject review are valuable. A completed local response must not become an established external effect.

Keep software candidate/check/release inspection as domain-specific depth. Knowledge examples probe generality; they do not establish an integrated Content Factory. Explicit collaboration dependencies must not acquire execution semantics from card ordering.

## Most consequential gaps

1. **Authoritative origin:** frontend types describe presentation, not a published application contract. No source revision/freshness boundary binds assignments, evidence and available actions together.
2. **Doing ordinary human work:** the actionable main surface concentrates on review and authority. A worker still needs a coherent input → contribution → delivery receipt → revision path for one actual responsibility.
3. **Operating the organization:** accepted local allocation plans do not create bindings or assignments. Briefs remain proposals and patterns remain guidance. Inspection is more complete than the operating lifecycle.
4. **Accountability:** local timelines cannot establish server-admitted actor, authority, assignment/attempt, artifact and effect relationships.
5. **Installation context:** organization version, source and execution boundary are absent. Add bounded context when supported, rather than a speculative fleet console.

The current Software Factory README explicitly states that the repository has no server, UI or database. It consumes released command/JSON surfaces and retains attempts and work products. An application API must be designed and implemented; integration is not simply switching fixtures to an existing HTTP endpoint. Retained diagnostics can carry sensitive material, so a representative fixture should be deliberately redacted rather than copied wholesale.

## Recommended sequence

### 1. One real-shaped read-only Software Factory slice

Start with assignment → retained attempt → exact work product → evidence/source inspection. Inspect consumer-visible schemas and use a redacted representative fixture with source, identity, observation time and missing fields. Separate projection-load failure from assignment failure.

Build a small adapter into existing views, not a full generic data framework. A captured fixture stays explicitly a snapshot. Do not cast arbitrary JSON to frontend models or fill missing public relationships from private storage layouts.

Acceptance: one coherent dataset drives linked screens; unsupported fields remain unknown; demo permissions and records never appear as operational facts. This can be prepared locally without a live backend.

### 2. Complete one human contribution responsibility

Design contribution, delivery and revision against the same assignment and exact subject versions. Include expected deliverable, submission subject, receipt relationship and assessment. Corrections preserve earlier records.

Acceptance: a user can explain what they owe, prepare a contribution and inspect what was received. Local simulation and actual command capability remain distinct. The application must define the submission contract before live integration.

### 3. Establish application contracts before live decisions

Agree on versioned reads/commands, server-derived identity and permissions, concurrency checks, correlation/idempotency and authoritative command status. Handle stale authority, admitted commands awaiting projection refresh and uncertain acknowledgement.

Acceptance: neither transport success nor a local click establishes authorization or effect. Backend changes require work in their authorized repository; they are not implied capabilities of this prototype.

### 4. Add minimal installed context and an accountability trace

Expose organization identity/version, relevant binding/policy context, freshness and placement where the public application surface supports them. Make one real decision trace inspectable through its subject and evidence links.

Acceptance: a user can locate a displayed fact's source and distinguish observations, admitted records and unknown effects. No generic organization editor or fleet manager is required.

### 5. Test with people and package the proven slice

Ask a worker, reviewer and operator to find responsibility, explain waiting work, inspect failure, distinguish approval from effect and resume uncertain submission. Measure task errors and navigation friction. Review screen-reader/keyboard behavior and long content on narrow screens.

Then prove static serving and deep-link handling in an agreed Go application package. Vite remains a development tool, not the installed product server.

## Priorities to defer

More fictional organizations, workflow editing, a plugin platform, fleet dashboards and broad analytics add breadth before the current work path becomes operational. Preserve existing demonstrations and their labels. Judge the next increment by whether one human responsibility works against accountable source records, rather than by screen count.

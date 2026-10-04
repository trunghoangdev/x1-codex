# Virtual organization review after iteration 70

Reviewed on 2026-10-04. This review inspects the current prototype’s code, contracts and six overview browser views. It is a frontend/product design review, not customer research or verification of a real organization runtime. The preceding five-item sequence is complete; the proposals below form a new backlog and are not implemented capabilities.

## Assessment

The workspace now represents a useful organizational foundation across software and knowledge operations: shared purpose, workstreams, explicit role catalogs, heterogeneous workers, scoped responsibility, assignments, input dependencies, personal queues and scenario-isolated navigation. My Work is a personal entry; Organization should support coordination across those entries.

An organization need not follow one linear process. Different workstreams can use different collaboration expectations, run parallel responsibilities, exchange inputs and return work for revision. Organization/project/environment/subject responsibilities can also sit outside a particular workstream. The UI already preserves these distinctions. Its next improvement should make the operating relationships easier to inspect and act on, while retaining unknowns where the records are incomplete.

Today a coordinator still moves among attention categories, streams, role coverage and individual assignments to understand a coordination question. Shared outcome verification, decision responsibility and chronological coordination records are less developed than the software sample’s individual response screens.

## 1. Organization coordination overview — recommended first

Evidence: `OrganizationOverview.tsx` has an attention summary, but stream cards show goal/outcome prose and all streams/workers render in the overview. Workers/Workstreams/Roles directories are paged; Overview remains unbounded. Scenario switcher, boundary and persona panels also repeat context above the actual organization heading. `AttentionSummary` groups by category rather than showing related signals together by workstream.

Proposed slice: consolidate organization/persona context, then add compact workstream summaries showing independently represented responsibility gaps, waiting inputs, pending responses and outcome evidence needs. Each signal should open its exact source and expected next coordination context. Show a short bounded set of streams with filters and a full-directory link; replace the full worker roster with a short responsibility summary and directory entry points. Preserve other organization work as a distinct section.

Data work: explicitly link signals to stream/assignment/dependency/criterion IDs, retaining unattributed signals instead of forcing them into a stream. Main attention must retain its existing local response/readiness projection: the shared main adapter currently labels every assignment `Awaiting response` and cannot replace that projection. Counts describe independent records/categories, not an additive total of blocked work. An allocation gap, missing input, pending response and missing outcome evidence are different conditions. Do not rank urgency from record counts or infer a coordination owner from a Planner binding; priority/owner can remain unspecified unless authored.

Acceptance: from Knowledge overview identify K-02’s missing coordinator brief, inspect Leo’s K-02-C supplying assignment and return to the same filtered overview. K-01’s publication-review gap stays separate. In the main sample, recording an assessment changes only the represented response signal; it does not deliver an input or verify the outcome. Mobile users reach the coordination summary without scrolling through repeated sample explanations or every worker.

First unit: compact shared context and workstream coordination projection using the existing Knowledge records, then adapt main and larger software with explicit references. No new runtime or allocation action is required.

## 2. Shared outcome review across organization domains

Evidence: `OutcomeReview.tsx` imports main assignments/evidence and displays an unassigned reviewer/Not verified banner. Read-only scenario stream details show only `needed` and `gap` text, omitting the richer criterion title, available context and boundary. `OutcomeReview` data has criteria/evidence links/boundary, but no explicit review allocation or reviewed-result record. `scenarioAttention` emits an Outcome signal for every stream; that is an authored sample convention, not a general verification classifier.

Proposed slice: a shared read-only outcome screen driven by scenario records. Show criterion, required observation, available context, exact evidence links, subject/environment boundary and explicitly represented review responsibility. Retain Unknown/not reviewed when a review result or reviewer allocation is absent. Start by showing existing fixtures consistently; introduce typed reviewed conclusions only when an authored review record is supplied.

Acceptance: Knowledge guide distinguishes publication work from evidence that members can find answers. The workshop requires participant observations. Neither receives a success label because an editor/coordinator responded. Main payment review still distinguishes candidate assessment, staging observation and production behavior. Evidence links stay in the selected scenario, including empty/unavailable records.

First unit: share criterion/context/boundary inspection without adding an outcome decision form. A future allocated reviewer must be modeled explicitly rather than inferred from a Reviewer binding.

## 3. Shared workflow and exchange map

Evidence: read-only `ScenarioWorkspace` renders `flows` as an ordered list. Knowledge flow records are projected from assignments; array order is not a dependency contract. Main `WorkstreamFlow` is richer but imports fixed software data. Shared `dependencies` and `parallelWork` are explicit; revision expectations remain prose (`returnPath`), not confirmed revision edges or execution history.

Proposed slice: a scenario-driven operating map of role responsibilities, assigned workers, input providers/receivers and explicitly authored parallel groups. Keep expected collaboration, present assignment state and observed events visually distinct. Use existing dependency IDs for exchange connections. Show unallocated roles as requirements/gaps, never as invented tasks. Add a revision connection only with an explicit authored relationship.

Acceptance: Knowledge K-01 shows research/editorial criteria as parallel; K-02 links Leo’s brief to Maya’s review while facilitation stays unallocated. Main software represents the developer as a provider worker where no developer assignment exists. Adjacent flow steps or a shared project do not create arrows. Opening a node returns to the same map/filter.

First unit: the Knowledge workshop and parallel guide branch. Keep an accessible textual list alongside any diagram. Versioned reusable workflow templates can follow once the explicit instance relationships are clear; do not start with a general visual workflow editor.

## 4. Decision responsibility and escalation

Evidence: bindings and scoped requirements explain responsibility, but do not establish an actual decision request, effective authority, escalation recipient or deadline. Main software has specialized release/allocation decision previews. Knowledge publication review is an explicit gap, while Distributor applicability remains unknown. The shared organization contract has no decision-request/escalation records.

Proposed slice: a read-only decision directory with explicitly authored requests: subject/scope, decision question, requester, allocated decision role/person (or unknown/unassigned), required evidence and escalation contact only when declared. Distinguish assessment, approval, allocation planning and actual execution. Attach concise role mandates explaining what responsibility covers, with references to the specific request/scope.

Acceptance: a contributor can distinguish who assesses a guide from who, if anyone, is allocated to authorize publication. The Distributor binding does not fabricate that authority. Missing decision ownership remains a visible coordination question. Main production-release authorization stays separate from staging reconciliation. Unknown policy and missing allocation are different states.

First unit: describe the existing main release subject and one separately authored Knowledge decision requirement. A publication approval policy must be supplied/authored explicitly; it cannot be deduced from the current publication-review gap. No permissions, deadlines or escalation chain are invented from names.

## 5. Shared coordination activity and exchange records

Evidence: `OrganizationActivity.tsx` combines main response/proposal/plan-decision records and evidence. Read-only Activity correctly has no records. `InputDependency.receipt` is currently restricted to `unconfirmed`; an assignment response does not confirm delivery or receipt. The shared contract has no dated activity/exchange record collection.

Proposed slice: a shared read-only activity projection with typed authored sample events, actors, subjects, source references and timestamps when actually provided. Separate assignment response, input delivery, receiver acknowledgment, revision request, decision and outcome review. Keep untimed expectations/evidence outside chronological history. Introduce a small Knowledge event fixture only with explicit sample labeling and independent event semantics.

Acceptance: recording or representing Leo’s response does not establish that Maya received the brief. A separately authored receipt refers to a specific input/version and recipient. A revision event identifies the originating assessment and returning work. Other scenarios’ records never appear, and missing history remains an honest empty state.

First unit: shared record inspection with a small authored Knowledge exchange history and unchanged main records. Interactive cross-domain response simulation should follow a settled receipt/event contract, rather than auto-advancing workflow steps.

## Priority and dependencies

| Order | Customer question | Initial scope |
| --- | --- | --- |
| 1 | Where does this organization need coordination now? | Compact overview and source-linked workstream signals |
| 2 | What evidence would establish that the goal was achieved? | Shared read-only outcome requirements/context |
| 3 | How do roles and workers collaborate on this goal? | Explicit workflow/exchange map |
| 4 | Who is allocated to decide, and where does an unresolved request go? | Authored decision responsibility/unknowns |
| 5 | What actually happened between these responsibilities? | Typed shared activity and separate exchange records |

Deliver each as an incremental unit with URL/context return and desktop/mobile inspection. Item 1 should link to existing detail views before depending on later screens. Items 2–3 can reuse current criteria/dependency fixtures; items 4–5 need new explicitly authored records. They remain feasible frontend work without a live SF deployment.

For later real integration, dev data would be most useful in five areas: authoritative signal/assignment state and membership; workflow/exchange IDs and receipt semantics; decision subject/authority/escalation records; outcome reviewer/conclusion/evidence links; and event ordering/timestamps. The current missing contracts do not block the proposed read-only sample slices. Runtime availability/capacity, tenant access, assignment creation, execution and durable audit remain separate work.

## Browser observations

Inspected current Overview for all three scenarios at 1440px and 390px, height 1000px. All six views loaded without observed page JavaScript errors or horizontal document overflow. These measurements describe this fixture/layout and do not establish usability failure or a required height target.

| Scenario | Desktop document height | Mobile document height | Stream cards | Worker cards |
| --- | ---: | ---: | ---: | ---: |
| Main software | 2,408px | 4,268px | 2 | 4 |
| Knowledge | 2,666px | 4,627px | 2 | 4 |
| Larger software | 4,003px | 7,254px | 6 | 9 |

Visually inspected Knowledge desktop and larger software mobile captures. The repeated context panels and full worker roster motivate item 1’s shorter overview. Measurements and capture script are reproducible with `scripts/review-organization.mjs` against local port 4173. Captures: `previews/67-review-knowledge-overview.png`, `previews/68-review-large-overview-mobile.png`.

No application behavior changed during this review. Build/tests were not rerun for documentation/capture changes; browser checks above were performed on the current prototype. No customer or live-runtime evidence was collected.

## Item 1 started — iteration 72

Delivered Knowledge-first coordination by workstream with explicit gap/input/response/criterion references, provider/receiver links, URL filters, bounded stream summaries and source-return context. Knowledge sample/persona context is consolidated; workers are short bounded summaries and mobile attention counts use two columns. Exact gap/criterion identities are inspectable in stream detail. Build and twenty related checks passed. See [COORDINATION-OVERVIEW.md](COORDINATION-OVERVIEW.md). Item 1 remains in progress: next adapt main local response/readiness/outside-stream records and larger software through the shared coordination view. Items 2–5 remain proposed.

## Item 1 completed — iterations 72–74

All three samples now use coordination by workstream. Main response-needed signals come from its interactive attention projection; response recording does not verify outcomes. Release/staging/onboarding remain outside modeled workstreams. Main URL filters survive overview refresh and in-session source inspection/return; main detail return references remain in memory. Read-only return trails retain their session storage behavior. Larger software exercises four/two paging, with full directories behind three worker summaries. Build and related desktop/mobile checks passed; see COORDINATION-OVERVIEW.md for validation and limits. Items 2–5 remain proposed; shared outcome review is next.

## Item 2 completed — iteration 75

Shared outcome inspection now presents existing scenario criteria, available context, exact evidence references, assignment context and scope boundaries. Absent goal-review result/allocation remains explicit; responses and role bindings do not verify goals. Scoped read-only outcome routes preserve persona and refreshed source return; main evidence dialog and in-memory source return retain their established boundaries. Build and nineteen related checks passed. See [SHARED-OUTCOME-REVIEW.md](SHARED-OUTCOME-REVIEW.md). Items 3–5 remain proposed; shared workflow/exchange map is next.

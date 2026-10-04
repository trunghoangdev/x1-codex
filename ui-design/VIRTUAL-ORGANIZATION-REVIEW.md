# Virtual organization design review

## Verdict

The prototype has a coherent virtual organization interaction model, demonstrated through a Software Factory. It explains shared goals, scoped responsibility, heterogeneous workers, assigned requests, expected exchanges and evidence-based outcome review. It is useful for explaining the product and exploring individual work. It does not yet demonstrate an interchangeable organization workspace or a complete organization operations console.

The organizational primitives are broader than software delivery, but the current content, relationships and decisions remain Software Factory-specific. A second domain is needed before claiming the design fits virtual organizations generally. This review is an inspection of code and prototype behavior, not customer research or validation against a real SF runtime.

## What fits the intended model

| Concern | Current design | Assessment |
| --- | --- | --- |
| Shared purpose | Organization goals and workstreams | Clear organization entry, separate from individual work |
| Role versus worker | Scoped bindings and human/AI/deterministic workers | Sound distinction; assignments are not inferred from role names |
| Personal responsibility | My Work, response queue and scoped assignment views | Effective personal entry, currently demonstrated only as Alex |
| Coordination | Explicit flow, handoffs and conditional revision | Expected coordination is kept distinct from execution history |
| Missing responsibility | Explicit invitation gaps and proposals | Gaps remain visible until actual allocation; no false success |
| Decisions | Assessment, release authority and allocation-plan receipts | Response/authority/effect remain distinct; allocation is only a plan |
| Outcome | Separate goal evidence requirements | Does not equate completed response with achieved business goal |
| Inspection | Exact artifact modal and contextual return | Supports investigating why work or proof is missing |

## Findings and priorities

### 1. Overview is still too detailed for organizational coordination — high UX priority

`OrganizationOverview.tsx` repeats workstream assignment detail and role/worker bindings even though dedicated directories now exist. It also provides section-jump controls and directory controls adjacent to each other. Attention follows the full stream cards rather than being the first operational summary.

In this review's 390px-wide, 1000px-high viewport, the overview document measured 5,312px. The two-stream sample already needs considerable scrolling. This is a layout observation, not proof that users fail the task.

Proposed next slice: keep organization purpose, a prominent compact attention summary, concise goal/workstream cards and directory entry points. Move the full assignment/binding lists into their existing detail/directory screens. Preserve clear keyboard navigation and the expandable glossary. Avoid progress percentages or health scores without authoritative data.

### 2. Organization history misses coordination decisions — high model priority

`OrganizationActivity.tsx` receives assignment response receipts and evidence, but no proposal or allocation-decision records. Those records are stored separately on proposals in `main.tsx` and can only be inspected through the gap modal. An accepted plan therefore does not appear alongside other organizational records.

Proposed slice: add explicit proposal/plan-decision record types to organization activity, with worker, role/scope, actor, rationale, time and subject links. Keep accepted-plan versus allocation-created events distinct. Do not invent a confirmed handoff from a recorded response. Define how removal of a local demo proposal affects local activity; do not present demo deletion as production audit behavior.

### 3. The larger organization does not exercise the main workspace — high architecture priority

The main screens import fixed `workers`, `roleBindings`, `workstreams` and `assignments`. `largeOrganization.ts` defines an independent six-stream/nine-worker scenario with a different assignment schema, displayed only by `LargeOrganizationDemo.tsx`. Worker classification and several flow/decision facts are separately authored.

Consequently, the large demo does not validate the main overview, directories, worker details, assignment views, attention or outcomes at that scale.

Proposed slice: establish one bounded organization scenario contract containing identity, goals/streams, workers, bindings, assignments, flow references, gaps and evidence requirements. First adapt the existing small fixture; then bring a larger read-only scenario through the same screens. Separate organization membership from the current person's inbox and keep independent demo records isolated. This can remain frontend/sample work; no backend integration is required.

### 4. Roles have no organization-wide entry — medium priority

Workers expose their bindings and scopes, but the UI has no role-centered question such as: who holds Reviewer responsibility, in which scopes, and which assignments/gaps are represented? `directoryRoles` is derived from bindings rather than an explicit role catalog, so a required role with no binding cannot be represented through that list alone.

Proposed slice: a role responsibility view or matrix, driven by an explicit role catalog and scoped binding/assignment references. Distinguish no binding, binding without assignment and assignment waiting for input. Do not infer live authorization, capability or availability from a role label.

### 5. General organization fit remains unproven — medium product priority

The workspace label, all main goals, contribution artifacts and authority subjects are software-specific. The current signed-in actor is Alex; a planner decision is explicitly an authored demo reviewer rather than a verified identity/authority switch.

Proposed slice: after the shared scenario contract, add a small non-software example such as research or content production using the same screens and primitives. Include multiple human assignees and bounded AI participation. Evaluate persona-specific My Work separately. Do not add cosmetic organization switching while records and inbox still refer to the previous organization.

### 6. Design specification has drifted — documentation priority

`DESIGN.md` still describes My Work as the first-use path and Organization primarily as an illustrative role structure. Its mutable-record statement omits proposals/decisions, and its production-state list does not reflect the newer bounded response/readiness previews. The implementation and newer focused documents are more current.

Update the specification around organization-first navigation and the current sample/state boundaries when implementing the next overview slice. Keep simulated failure states separate from actual API integration.

## Browser review evidence

Inspected six routes at 1440px and 390px widths, each with a 1000px viewport height: Organization, both directories, invitation workstream, Organization activity and the larger organization demo. All loaded with no observed page JavaScript errors or horizontal overflow. Visually inspected the desktop overview and mobile invitation detail.

Observed document heights at 390px: overview 5,312px; workstreams directory 1,707px; workers directory 2,635px; invitation detail 4,389px; activity 2,262px; larger demo 8,793px. Heights depend on viewport, fonts and fixture content; they motivate reducing overview detail and later paging, not an arbitrary target height.

No code behavior was changed for this review. Existing tests were not rerun for a documentation-only change; the browser inspection above was performed against the current prototype.

## Recommended sequence

1. Compact organization overview and update its design specification.
2. Bring proposal/allocation-plan records into organization activity.
3. Establish a shared scenario contract and validate larger organizations through the main screens in incremental slices.
4. Add a role-centered responsibility view using explicit role definitions.
5. Exercise the same workspace with a non-software organization and a second personal persona.

Keep runtime monitoring, live allocation, real capacity estimates and SF integration outside these frontend slices until their data contracts are available.

## Follow-up: overview slice completed

The overview now places attention immediately after organization purpose, replaces assignment/evidence detail in workstream cards with linked-assignment counts, and replaces seven binding cards with four worker identity summaries. Directory entries sit with their corresponding sections; the glossary moves below secondary content. Keyboard section shortcuts, other-work/gap disclosures and proposal entries remain.

At the same 390px/1000px viewport, the revised overview measured 3,917px versus 5,312px before this slice (about 26% shorter), with attention now preceding goals. This remains a scrollable page, not a demonstrated large-organization solution. Shared scenarios, organization decision history and role-centered inspection remain separate follow-ups.

## Follow-up: coordination activity slice completed

Organization activity now includes session proposals and allocation-plan decisions, with explicit workstream scope, demo actor, proposed worker/role, rationale, time and receipt inspection. Accepted plans remain allocation pending; neither record type implies a created assignment or binding. Removing a local proposal removes its derived activity records, so the UI explicitly avoids claiming permanent audit history. A real allocation-created event and durable audit behavior remain future provider work.

## Follow-up: shared scenario foundation completed

Both samples now have a common organization contract. The main overview/directories use its main adapter, and Demos opens the larger sample through the same overview/directory components. Scenario-qualified read-only details expose its assignments, flow responsibilities and unverified outcome requirements. Main records remain isolated; specialized interactive assignment inputs/actions are not invented for the larger sample. This validates shared organization navigation at the larger fixture scale, while full provider-backed assignment workflows remain future work.

## Item 4 completed — role-centered responsibility inspection

Both organization overviews now link to Roles. Explicit catalogs drive role cards rather than deriving roles from occupied bindings. Each card separates scoped holders, role assignments with authored/session response state, and known gaps linked by explicit role/gap IDs. Search and coverage filters support no bindings, bindings without role assignments and known scope gaps; main and larger routes preserve filters across refresh and contextual inspection. Current fixtures have no globally unbound role; catalog independence is checked with an additional unbound definition in a data test. No binding-scope match, effective authority, worker availability or complete coverage is claimed. Item 5, another organization domain and persona, remains.

## Item 5 completed — another domain and personal entry points

Added an independently authored Knowledge Operations scenario for a welcome guide and workshop. Common Organization components now take domain and purpose from scenario data. Maya (Editor) and Leo (Coordinator) have different explicitly allocated inboxes, with input and expected-response descriptions, response-needed versus waiting-input states, URL identity and contextual inspection. Shared roles include genuinely unbound publication review/facilitation responsibilities in the authored sample. Organization navigation retains shared purpose and gaps regardless of persona. No new response or publishing commands, verified outcomes or production authentication are implied.

All five proposed design slices are complete. The non-software sample tests reuse of the current frontend model; it does not validate arbitrary organization types or real-provider interoperability. Customer usability studies, authoritative data/actions, production identity/access control and paging remain future work rather than completed capabilities.

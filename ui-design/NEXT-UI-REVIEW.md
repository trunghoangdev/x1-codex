# Next UI review after iteration 62

Reviewed the current shared scenario contract, read-only workspace, personal inbox, role directory, main handoff/proposal fixtures, workstream directory and design documents. This is a code/document review; no new browser measurements, customer research or live-runtime validation were performed. The preceding five-item review sequence is complete. The items below are proposed frontend slices, not implemented capabilities.

The workspace now demonstrates organizational primitives in both software and knowledge operations. The next useful step is to make coordination questions easier to answer using explicit relationships, then improve personal work and density. More sample domains are lower priority until these relationships are exercised.

## 1. Explicit dependencies and waiting inputs — recommended first

Current evidence: `OrganizationScenario.flows` holds ordered step descriptions and assignment references, but no dependency edges or input-provider references. `ScenarioMyWork` displays a waiting-input flag and prose. Maya's K-02-E waits for the coordinator brief, but that input is not linked structurally to Leo's K-02-C. Main handoffs contain richer expectations in a separate fixture.

Proposed slice: author dependency/input records with stable IDs, source and receiving assignments, required input, represented availability and expected exchange. Add a shared Coordination view within workstream detail, including parallel branches and return-for-revision relationships when explicitly authored. Each waiting assignment links to the relevant supplying assignment and person. Organization attention can expose identified waiting inputs without inferring dependencies from prose, adjacent list items or shared project names.

Acceptance example: from Maya's waiting outline review, inspect the missing coordinator brief, open Leo's supplying assignment, and return to the original context. A recorded response must not automatically mark the input delivered or clear the dependency. Distinguish missing allocation from missing input, and expected exchange from confirmed receipt. Begin with the knowledge workshop, then adapt one software handoff.

## 2. Consistent personal work across personas

Current evidence: `ScenarioMyWork` is a short read-only list with counts and no filters or empty recovery. Alex's main inbox has more developed search, filtering and response behavior. Larger software exploration has no local personal inbox and directs My Work to the main Alex sample.

Proposed slice: establish a shared read-only personal queue projection for explicit allocations with search, role/workstream filters and response-needed versus waiting-input views. Use the knowledge personas first; then add one explicitly authored persona to the larger software adapter. Keep Alex's specialized response actions separate until their input contracts can be supplied to the common view.

Acceptance example: Maya filters waiting inputs and finds K-02-E; Leo sees only his own explicit allocations. Filter URLs survive refresh/back, a persona with no assignments gets a useful empty state, and no task is inferred from holding a role. Response-needed and waiting-input categories should have defined overlap semantics rather than misleading totals.

## 3. Role coverage by scope

Current evidence: Roles separates bindings, role assignments and known gaps, but explicitly states that assignment-to-binding scope matching is not verified. Binding scope is display text; no binding ID or structured scope reference connects it to an assignment. Counts across a whole role cannot answer whether a particular workstream has covered responsibilities.

Proposed slice: introduce structured authored scope/binding references and a role-by-workstream coverage view. Show explicit binding, assignment, known gap and unknown relationship separately. Model project/environment/subject scopes where necessary instead of matching scope labels as strings.

Acceptance example: Developer has a Payments binding while Invitation implementation remains uncovered; Reviewer may have a broad Team Workspace binding while the invitation assessment assignment remains missing. The knowledge sample exposes unbound publication review/facilitation. An authored binding link is not proof of effective permission, capability or availability.

## 4. Compact directories and bounded lists

Current evidence: Workers, Workstreams and Roles render all matching rows; each role card renders every matching assignment/binding. A single role in the larger adapter already includes assignments across six streams. Search narrows the data but does not bound a long result list.

Proposed slice: offer compact summaries with expandable details and paging for directories/assignment lists. Keep totals, active filters, keyboard focus and detail return explicit. Overview should retain short summaries rather than expanding every record. A larger synthetic fixture can exercise density without pretending to be actual workload.

Acceptance example: a user can find and inspect a worker in a long directory, return to the same page/filter and recover from empty results on desktop/mobile. Result counts describe the full filtered set; no hidden-record count becomes a health or capacity score. Paging can start with one directory before spreading to other screens.

## 5. Consistent scenario navigation and evidence context

Current evidence: independent scenarios are entered through Demos. Knowledge preserves persona in its local Organization/My Work navigation, but Evidence navigation exits to the main sample. Return buttons in read-only details use in-memory origin URLs and fall back to Overview after refresh. The design documents still contain some historical statements preceding completion notes.

Proposed slice: provide a clear sample-organization entry/switcher with domain/persona context and scenario-scoped Evidence navigation. Empty evidence should explain what is missing in the selected organization instead of opening another sample's records. Make main-only demos/actions explicit. Review nested detail return and direct-link behavior; preserve existing main session state without treating sample switching as authentication or tenant access.

Acceptance example: while viewing Knowledge Operations as Leo, opening Evidence stays in that scenario and shows its actual empty fixture. Switching to the software sample visibly changes identity and records. Assignment → workstream → assignment inspection has a predictable return path, with no cycle or surprise persona switch.

## Scope and order

Recommended order is 1 → 2 → 3 → 4 → 5, delivered as separate reviewable units. Item 1 directly strengthens the organization-wide coordination model. Items 2 and 3 strengthen personal responsibility and scoped coverage; items 4 and 5 improve scale and navigation consistency.

These slices can be completed with authored frontend fixtures. Live integration, actual assignment creation, publishing/execution, verified capacity, durable audit and authenticated identity remain separate work requiring authoritative contracts. A cross-domain response simulation could be considered after the shared input/queue model, but would need explicit local receipt semantics and must not imply publication or confirmed handoff.

## Item 1 completed — iteration 64

Added explicit input/parallel-work records, shared coordination inspection, a missing-input attention category and provider links from knowledge personal work. The initial slice covers the workshop brief, one existing software candidate handoff and parallel welcome-guide research/editorial criteria. Receipt and availability remain independent of local responses, and nested provider/receiver return unwinds by persona. No live delivery, allocation or workflow advancement is implemented. See [COORDINATION-INPUTS.md](COORDINATION-INPUTS.md). Items 2–5 remain proposed; the next recommended item is consistent personal work across personas.

## Item 2 completed — iteration 65

Added a shared read-only personal queue projection, search and role/stream/attention filter URLs for knowledge and larger software personas. The larger scenario now has Sam’s explicitly allocated Reviewer inbox and Jamie’s Planner-with-no-assignment empty inbox. Search/history/refresh and detail return preserve filters; changing persona resets personal filters. Overlapping response/input flags are documented and tested; no task or readiness is inferred from a binding or missing records. Main Alex specialized response actions remain unchanged. See [PERSONAL-WORK.md](PERSONAL-WORK.md). Items 3–5 remain proposed; the next recommended item is role coverage by scope.

## Item 3 completed — iteration 66

Added structured scope catalogs, stable binding IDs and explicit assignment/requirement links for all three samples. Roles now offers workstream coverage filters, an optional role × workstream matrix and separate inspection of broader subject/environment/project/organization scopes. Main invitation gaps remain despite the broader Reviewer binding; release and staging subjects remain outside the payment stream. Knowledge distinguishes unbound publication/facilitation from the unresolved Distributor-to-guide relationship. Unknown and unmodeled relationships do not become coverage claims. See [ROLE-SCOPE-COVERAGE.md](ROLE-SCOPE-COVERAGE.md). Items 4–5 remain proposed; next is compact directories and bounded lists.

## Item 4 started — iteration 67

Delivered the first proposed directory slice: Workers now shows six compact summaries per page, with native expandable bindings/assignment IDs. Full filtered totals, displayed ranges, URL page/filter/persona context, page-change focus, detail return and empty recovery are explicit. The existing nine-worker fixture exercises two pages on desktop/mobile. See [COMPACT-DIRECTORIES.md](COMPACT-DIRECTORIES.md). Item 4 remains in progress: next apply bounded presentation to Workstreams and Roles, including nested assignment/binding lists. Item 5 remains proposed.

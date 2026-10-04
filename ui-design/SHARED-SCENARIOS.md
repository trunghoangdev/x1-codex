# Shared organization scenarios

The Sample organization switcher or Demos → Open larger scenario workspace enters `#/organizations/large`. The existing standalone larger demo remains separately available. The new workspace uses the same Organization Overview, Workstreams directory and Workers directory components as the main sample, with an explicit scenario passed to each. Main directories also use the shared contract through its main adapter.

`organizationScenario.ts` defines identity/read-only mode, typed workers, scoped bindings, workstreams, explicit assignment relationships, flows, responsibility gaps, outcome evidence requirements and evidence records. The main adapter keeps its existing five assignments and fixtures. The larger adapter keeps six streams, nine workers, nineteen bindings and eighteen assignments; one assessment is unassigned. No candidate, observation or recorded decision is fabricated for the larger scenario.

Larger workstream and worker details provide read-only inspection of explicit assignments, coordination steps and goal evidence gaps. Assignments show the authored state/worker and link to their scoped stream/worker. Specialized candidate/check/attempt and response dialogs remain main-fixture views; they are not shown for larger assignments without their required records. Larger Activity explicitly has no records, and main proposals/responses never appear there.

Scenario-qualified URLs preserve identity even for shared names/IDs such as Alex. Directory filters live in the query string, survive refresh/history and replace the current entry while typing. Detail return keeps a validated, bounded source trail in tab session storage per scenario/persona, preserving return after refresh. Without a stored source, assignments fall back to their workstream, workers/streams to their directories and other screens to overview. Storage failure retains in-memory navigation. Category links filter scenario attention using explicit state/gap signals. There is no automatic flow advancement or health/capacity inference.

Main organization actions and records remain app-owned and survive navigation to/from the larger sample. Refresh still resets all app session records, even while viewing the larger sample. Return to main organization explicitly exits the scenario. Larger My Work now stays within its authored Sam/Jamie persona instead of opening Alex's main inbox. Main Organization navigation stays within the selected larger workspace while it is open. This is sample exploration rather than tenant/identity switching.

Reference checks validate worker, stream, assignment, gap, flow and evidence membership in both adapters. Browser checks cover common screen counts, scoped IDs, filtered URL/history/refresh, keyboard search, read-only boundaries, proposal isolation and unchanged personal work at desktop/mobile widths.

Remaining provider work includes supplying authoritative commands/receipts and full assignment inputs for other scenarios. Paging remains a separate design improvement. The contract is a frontend sample model, not a Forge/SF API schema.

## Role catalogs

Each adapter now authors role definitions and gap-to-role references independently of its bindings. RolesDirectory uses the same contract in both scenarios. Catalog entries with no bindings remain representable; the main and larger software fixtures contain no globally unbound catalog role. The invitation Developer scope gap in the main sample and unassigned L-02-R in the larger sample illustrate missing scoped responsibility despite bindings elsewhere. No extra outcome role or runtime allocation is invented.

## Non-software organization and personas

`knowledgeOrganization.ts` supplies a third adapter for Knowledge Operations. Domain and shared purpose now belong to the scenario contract instead of being fixed software headings. `scenarioRegistry.ts` resolves read-only adapters by scenario-qualified path. The knowledge adapter adds Maya/Leo persona references, authored assignment inputs/expected responses and explicit response-needed/input-wait flags. `ScenarioMyWork` projects only worker-allocated assignments; it never derives tasks from bindings. Details and directories use the same read-only workspace as the larger software adapter.

The knowledge persona is stored in the URL and retained by Organization/My Work navigation, filters and detail links. Invalid persona IDs and cross-scenario assignment IDs are rejected. Switching personas does not authenticate or grant permission. Main sample actions remain unchanged; larger software My Work now uses its own Sam/Jamie persona inbox. Knowledge My Work remains within its selected persona. See [KNOWLEDGE-SCENARIO.md](KNOWLEDGE-SCENARIO.md) for scope, flow and production boundaries.

## Dependencies and parallel work

The scenario contract now contains explicit `dependencies` and `parallelWork` arrays. Knowledge declares K-02-C supplying the brief required by K-02-E and a parallel research/editorial-criteria group. Main declares a provider-worker reference for the payment candidate input to A-1042 without inventing a developer assignment. Larger declares neither; its flow order does not imply a dependency. Shared CoordinationInputs renders these relations in stream/assignment context, and the knowledge queue links to providers. Missing inputs become Input attention signals independently of responsibility gaps and response signals.

## Shared personal queue

Knowledge and larger software now share `scenarioPersonalWork` and ScenarioMyWork filters for search, assignment role, stream and explicit response/input-wait flags. Sam has two larger-sample Reviewer assignments; Jamie holds Planner responsibility with no allocated work. Personal filter URLs survive detail return, history and refresh; switching persona resets the inbox filters. Both-status semantics are explicit and non-additive. Missing larger assignment input/response details are stated as unrepresented. Main Alex response forms remain specialized. See [PERSONAL-WORK.md](PERSONAL-WORK.md).

## Structured role scope references

All adapters now decorate bindings with stable IDs/scope IDs and author scope catalogs, assignment-scope links and scoped role requirements. These records are consumed by RoleScopeCoverage, while existing catalog/worker views and allocations remain intact. Scope relationships are explicit references; no label parsing or automatic broad-scope inheritance is implemented. Main release/staging/onboarding remain separate from the modeled workstreams. Knowledge Distributor is explicitly unresolved for the guide, and larger unassigned assessment stays unbound. See [ROLE-SCOPE-COVERAGE.md](ROLE-SCOPE-COVERAGE.md).

## Scenario navigation and evidence — iteration 70

The global sample switcher exposes all three authored organizations and domain/persona context. Organization, My Work, Evidence and the brand keep read-only scenario identity. Demos is explicitly main-sample navigation. Knowledge/larger Evidence reads only the selected adapter’s evidence fixture (currently empty), with requirements links rather than main sample artifacts. Switching scenarios resets filters and selects the target’s default persona; main local records survive a switch within the mounted app. See [SCENARIO-NAVIGATION.md](SCENARIO-NAVIGATION.md).

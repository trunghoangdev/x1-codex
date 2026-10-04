# Shared organization scenarios

Demos → Open larger scenario workspace enters `#/organizations/large`. The existing standalone larger demo remains separately available. The new workspace uses the same Organization Overview, Workstreams directory and Workers directory components as the main sample, with an explicit scenario passed to each. Main directories also use the shared contract through its main adapter.

`organizationScenario.ts` defines identity/read-only mode, typed workers, scoped bindings, workstreams, explicit assignment relationships, flows, responsibility gaps, outcome evidence requirements and evidence records. The main adapter keeps its existing five assignments and fixtures. The larger adapter keeps six streams, nine workers, nineteen bindings and eighteen assignments; one assessment is unassigned. No candidate, observation or recorded decision is fabricated for the larger scenario.

Larger workstream and worker details provide read-only inspection of explicit assignments, coordination steps and goal evidence gaps. Assignments show the authored state/worker and link to their scoped stream/worker. Specialized candidate/check/attempt and response dialogs remain main-fixture views; they are not shown for larger assignments without their required records. Larger Activity explicitly has no records, and main proposals/responses never appear there.

Scenario-qualified URLs preserve identity even for shared names/IDs such as Alex. Directory filters live in the query string, survive refresh/history and replace the current entry while typing. Detail return remembers a source URL in the mounted scenario workspace; a refreshed direct detail falls back to the scenario overview. Category links filter scenario attention using explicit state/gap signals. There is no automatic flow advancement or health/capacity inference.

Main organization actions and records remain app-owned and survive navigation to/from the larger sample. Refresh still resets all app session records, even while viewing the larger sample. Return to main organization explicitly exits the scenario; My Work opens Alex's main sample inbox and is labeled accordingly in the larger overview. Main Organization navigation stays within the selected larger workspace while it is open. This is sample exploration rather than tenant/identity switching.

Reference checks validate worker, stream, assignment, gap, flow and evidence membership in both adapters. Browser checks cover common screen counts, scoped IDs, filtered URL/history/refresh, keyboard search, read-only boundaries, proposal isolation and unchanged personal work at desktop/mobile widths.

Remaining provider work includes supplying authoritative commands/receipts and full assignment inputs for other scenarios. Paging and a role-centered view are separate design improvements. The contract is a frontend sample model, not a Forge/SF API schema.

## Role catalogs

Each adapter now authors role definitions and gap-to-role references independently of its bindings. RolesDirectory uses the same contract in both scenarios. Catalog entries with no bindings remain representable; current sample fixtures contain no globally unbound catalog role. The invitation Developer scope gap in the main sample and unassigned L-02-R in the larger sample illustrate missing scoped responsibility despite bindings elsewhere. No extra outcome role or runtime allocation is invented.

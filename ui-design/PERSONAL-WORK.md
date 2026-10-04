# Shared personal work queues

The read-only knowledge and larger software workspaces now use one personal queue projection and one My Work component. Knowledge has Maya (Editor) and Leo (Coordinator); larger software has Sam (Reviewer) and Jamie (Planner). Alex's existing main-sample assessment, release and reconciliation workflows remain specialized and unchanged.

## Explicit allocation and attention

`scenarioPersonalWork` selects only assignments whose explicit worker ID matches the selected persona. It does not create tasks from role bindings, worker type, scope labels or stream membership. Sam's larger-sample inbox contains L-03-R and L-06-R; Jamie holds a Planner binding but has no allocated assignments in the represented fixture. The empty inbox explains this distinction and links to Jamie's scoped responsibilities, without implying idle time or availability.

The knowledge fixture retains its authored response-needed and waiting-input flags. The larger assignment fixture now authors response-needed flags alongside its states: allocated assessment/authorization requests and the contribution needing revision have response-needed flags; an unassigned assessment does not count as someone's requested response. No input-wait state is inferred from missing artifact descriptions. Larger queue cards explicitly say when input or expected-response details are not represented rather than inventing candidate/check records.

Response-needed and waiting-input sets may overlap. The full inbox summary shows both counts, while the explanatory text shows how many belong to both and states that the categories are not added together. The Both filter requires both explicit flags. Counts describe represented requests, not workload, effective authority or runtime readiness.

## Filters and URLs

Search covers the selected persona's assignment IDs/titles, role, authored state, input/expected-response text and linked workstream name/project. Assignment role and workstream filters combine with All assigned work, Awaiting my response, Waiting for input or Both. Options reflect allocated assignments and retain valid active options from a direct URL, even when they currently match nothing.

Query keys are `q`, `role`, `stream` and `status`; `persona` keeps identity. Filters replace the current history entry while editing, so typing retains search focus. Assignment/goal/provider inspection returns to the full original inbox URL. Browser Back and refresh retain URL filters. Clear work filters and Show all my work clear all queue filters, retain persona and focus search.

Changing persona on My Work resets that inbox's personal filters. This avoids carrying a role or search condition from the previous person into a new inbox. It does not authenticate, grant permissions or reallocate work. The current full-inbox count in the sidebar stays independent of result filters.

An inbox with zero allocations is distinct from a nonempty inbox with zero search results. The first links to the person's responsibilities; the second offers Show all my work. Neither is presented as organization health. Invalid persona, role, workstream or attention-status values are rejected by route validation for personal work.

## Sample entry points

- `#/organizations/knowledge/work?persona=maya&status=waiting`
- `#/organizations/knowledge/work?persona=leo&status=response`
- `#/organizations/large/work?persona=sam&stream=L-06&status=response`
- `#/organizations/large/work?persona=jamie`

My Work and Organization navigation remain inside the selected read-only scenario/persona. Return to main organization explicitly restores the main Alex sample and its session records. Refresh keeps the existing global session reset boundary. Evidence now stays within the selected scenario/persona; validated per-persona return trails survive refresh in the same tab. See [SCENARIO-NAVIGATION.md](SCENARIO-NAVIGATION.md).

## Validation and limits

Model checks exercise explicit allocations, response/input overlap without mutating fixtures, persona membership and invalid filter routes. Desktop/mobile browser checks cover combined filters, keyboard search focus, detail/history/refresh return, no-result recovery, persona filter reset, Sam's read-only assignments, Jamie's responsibilities with no tasks, sidebar identity and unchanged main Alex entry. Existing knowledge, roles, dependencies and larger workspace checks remain applicable.

The queue adds no response commands, delivery acknowledgment, allocation, publishing or scheduling. Authoritative queue state and permissions will need provider contracts. Paging and a broader identity switcher are separate improvements.

Previews: `51-maya-filtered-work.png`, `52-sam-personal-work.png`, `53-jamie-empty-work-mobile.png`.

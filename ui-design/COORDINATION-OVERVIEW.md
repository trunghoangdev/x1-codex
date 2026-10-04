# Organization coordination overview

Iteration 72 starts item 1 of the review after iteration 70. Open Knowledge Operations → Organization. Iteration 73 extends the same reference-based board to the larger software sample. Iteration 74 completes item 1 with the main interactive projection. All three samples now use the shared board.

## Compact organization context

Knowledge’s sample and persona controls now share the global context panel, including My Work and explicit Return to main organization. A collapsed About this sample section retains fixture boundaries. Sample navigation explanations are also collapsed. This replaces Knowledge’s separate long boundary/persona panels across its screens. Persona changes preserve overview filters and reset personal inbox filters as before.

Knowledge Overview retains purpose and full organization counts, shows two-column attention counts on mobile, and limits worker summaries to the first three authored workers with full-directory links. Worker ordering is fixture order, not priority or capacity. The full four-worker directory and scoped role records remain available. Main/larger roster behavior is unchanged.

## Coordination projection

`coordinationRows` uses references from the selected scenario:

- Responsibility gaps reference `workstreamId`.
- Missing inputs reference dependency `streamId` and explicit provider/receiver IDs; only `availability=missing` contributes.
- Pending responses use assignment `streamId` and an explicit `responseNeeded=true` flag. State text or a binding does not create a response-needed record.
- Outcome evidence needs count authored criteria with nonempty gap text, linked through the outcome’s `streamId`. This is a missing-evidence expectation, not a reviewed conclusion or completed goal.

Counts refer to different record types and can overlap. They are not summed into progress, health or urgency. Missing flags/records do not establish completion, available capacity or audited coverage. No coordinator is inferred from holding Planner/Coordinator responsibility.

K-01 has one publication-review gap, two pending responses and one outcome evidence need. K-02 has one facilitation gap, one missing input, one pending response and one outcome evidence need. The brief explicitly links Leo’s K-02-C to Maya’s K-02-E. Delivery/receipt remains unconfirmed; neither inspecting a record nor a represented assignment response confirms it.

Cards show the four independent counts. Missing inputs expose provider and waiting assignment links directly. Expand Inspect coordination records for gap sources, response requests and outcome requirements. Knowledge stream detail now displays exact gap and criterion IDs so those source links have an inspectable destination. Rich shared outcome review remains a later backlog item.

## Filters, bounds and return

Workstream/goal/project search and Coordination need filters live in Knowledge overview URLs as `coordQ`, `coordSignal` and `coordPage`, retaining `persona`. Up to four matching workstreams render per page, in authored order. Counts describe the whole filtered set separately from the shown range. Search/signal changes reset paging; page controls focus results. Clear/empty recovery resets filters and focuses search. Positive out-of-range pages clamp visually; invalid page/signal values and coordination params outside read-only scenario overviews are rejected.

Provider, receiver, gap and outcome-source inspection uses the existing scenario/persona return trail. The full filtered overview URL survives detail return, browser history and refresh. Card disclosure state is local and resets after leaving. Changing persona retains organization-level filters because the organization questions are shared; personal inbox allocation remains persona-specific.

The two-workstream fixture does not exercise an actual second page in browser checks; the four-card bound is implemented for the shared component. Main adapter response/readiness semantics must be supplied explicitly before reuse: its static Awaiting response labels cannot replace the main local response projection. Main release/staging/onboarding records outside modeled streams also need their distinct treatment in that next unit.

## Validation

Production build and twenty related model/browser tests passed at 390px/1440px across new projection/filter/source checks and existing knowledge, navigation, queues, coordination and larger software behavior. Checks cover independent categories, no state-text inference, label-independent reference membership, scoped params, gap/criterion inspection, provider/receiver return after refresh, persona filter preservation, empty recovery/focus and mobile width. Existing software response/input semantics remain covered and unchanged.

Three previews were captured and visually inspected: `69-knowledge-coordination-overview.png`, `70-missing-input-overview-mobile.png`, `71-knowledge-responsibility-source.png`.

At the same 1000px viewport height, unfiltered Knowledge document heights changed from 2666→2792px on desktop and 4627→4153px on mobile. Desktop adds coordination detail while mobile benefits from compact context/counts/worker summaries. These are fixture/layout observations, not customer usability validation or a prescribed page-height target.

## Larger software extension — iteration 73

The larger sample now uses the same coordination board, compact worker summaries and consolidated global persona controls. Six authored workstreams render across two pages (four/two); the full worker directory still contains nine workers. Missing inputs remain zero because the fixture represents no dependencies; an empty input filter does not prove delivery or completion. Responsibility source inspection now shows referenced gaps in both read-only scenarios.

Fourteen related tests passed, including desktop/mobile paging, result focus, refresh, exact return URL, empty recovery, single persona controls and existing personal queues/scenario navigation. Production build passed. Desktop/mobile previews `72-larger-coordination-1440.png` and `72-larger-coordination-390.png` were inspected. Main adaptation remains the next bounded unit of item 1.

## Main software completion — iteration 74

Main pending responses are projected from `organizationAttention(completed, readiness)` and intersected with explicit stream assignment references. Static assignment state labels are never treated as response-needed flags. Recording a local response removes that pending signal without clearing authored outcome evidence requirements or proving execution. Release, staging and onboarding remain in Other organization work, outside the two modeled streams; existing readiness/response behavior is retained.

Main filters use `coordQ`, `coordSignal` and `coordPage` in the Organization URL. Refresh retains filters. Assignment/workstream inspection restores the filtered source in the current session; main return references and local responses remain in memory and are not durable after refreshing a detail page. Read-only scenarios retain their existing session-storage return trails. Main workstream detail now exposes the referenced responsibility gaps and criterion identities. Three worker summaries link to the full directory, and the personal inbox entry remains available.

Production build and eleven final related checks passed across coordination projection, desktop/mobile filters, refresh, source return, separate outside work and existing attention/section navigation. Five input relationship checks also passed during this unit, preserving represented input versus unconfirmed receipt. Both main previews (`73-main-coordination-1440.png`, `73-main-coordination-390.png`) were inspected. Item 1 is complete within authored frontend sample scope; item 2 is shared outcome review.

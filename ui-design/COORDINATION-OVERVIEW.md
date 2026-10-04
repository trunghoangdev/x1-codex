# Organization coordination overview — Knowledge first

Iteration 72 starts item 1 of the review after iteration 70. Open Knowledge Operations → Organization. Main and larger software still use their existing overview/attention projection; adapting them is the next item 1 unit.

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

Workstream/goal/project search and Coordination need filters live in Knowledge overview URLs as `coordQ`, `coordSignal` and `coordPage`, retaining `persona`. Up to four matching workstreams render per page, in authored order. Counts describe the whole filtered set separately from the shown range. Search/signal changes reset paging; page controls focus results. Clear/empty recovery resets filters and focuses search. Positive out-of-range pages clamp visually; invalid page/signal values and coordination params outside Knowledge overview are rejected.

Provider, receiver, gap and outcome-source inspection uses the existing scenario/persona return trail. The full filtered overview URL survives detail return, browser history and refresh. Card disclosure state is local and resets after leaving. Changing persona retains organization-level filters because the organization questions are shared; personal inbox allocation remains persona-specific.

The two-workstream fixture does not exercise an actual second page in browser checks; the four-card bound is implemented for the shared component. Main adapter response/readiness semantics must be supplied explicitly before reuse: its static Awaiting response labels cannot replace the main local response projection. Main release/staging/onboarding records outside modeled streams also need their distinct treatment in that next unit.

## Validation

Production build and twenty related model/browser tests passed at 390px/1440px across new projection/filter/source checks and existing knowledge, navigation, queues, coordination and larger software behavior. Checks cover independent categories, no state-text inference, label-independent reference membership, scoped params, gap/criterion inspection, provider/receiver return after refresh, persona filter preservation, empty recovery/focus and mobile width. Existing software response/input semantics remain covered and unchanged.

Three previews were captured and visually inspected: `69-knowledge-coordination-overview.png`, `70-missing-input-overview-mobile.png`, `71-knowledge-responsibility-source.png`.

At the same 1000px viewport height, unfiltered Knowledge document heights changed from 2666→2792px on desktop and 4627→4153px on mobile. Desktop adds coordination detail while mobile benefits from compact context/counts/worker summaries. These are fixture/layout observations, not customer usability validation or a prescribed page-height target.

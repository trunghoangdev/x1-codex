# Organization-first design

Organization is the default entry. My Work is a personal view for Alex, not an organization-wide backlog.

The authored scenario distinguishes:

- Organization: shared purpose and coordination context, currently a Software Factory.
- Workstream: a goal and a set of related assignments; multiple streams coexist.
- Worker: a human, AI worker or deterministic worker.
- Role binding: a worker's responsibility and permission within an explicit scope.
- Assignment: a concrete request to perform work, assess, authorize or reconcile.
- Evidence: attached records inspected from an assignment.
- Outcome: whether the goal is demonstrated, independent of response counts.

`organizationOverview.ts` defines four workers, seven role bindings and two workstreams. Payment webhook reliability contains A-1042; invitation improvements contains A-1038. These are proposed sample relationships, not discovered SF contracts. Existing fixture assignees remain the source for assignment responsibility. Developer and planner bindings demonstrate broader collaboration without inventing extra assignment records.

A-1041 production authorization, A-1035 staging reconciliation and A-1032 accessibility assessment are displayed separately. Sharing a project does not prove a dependency, artifact identity or workstream membership. Neither workstream has verified outcome evidence. A local response changes only the response label; it cannot mark the goal achieved.

The overview links current assignments and evidence, shows coordination needs, and lists scoped bindings. The existing personal attention queue and revision-cycle demonstration remain below it. Counts describe this bounded sample, not full organizational coverage or worker health.

Workstream details are available at `#/workstreams/WS-01` and `#/workstreams/WS-02`. Each shows proposed handoffs, responsible roles, current assignments, attached evidence and missing outcome observations. Conditional revision and unassigned future work are explicit. These are coordination patterns, not execution history; local responses do not advance them. Browser history returns from assignments to the stream, and a direct URL restores the same sample view.

`workstreamDetails.ts` holds the authored handoff descriptions. No backend integration, assignment creation or real permission enforcement is introduced here. Worker detail pages at `#/workers/alex`, `#/workers/jamie`, `#/workers/codex` and `#/workers/runner` expose scoped bindings and explicitly linked assignments. `workerDetails.ts` defines these links, without inferring ownership from role labels. Empty assignment lists say nothing about availability or capacity. The overview surfaces the invitation developer-binding gap separately from the missing assessment assignment: Alex already has a reviewer binding for that project. These are sample gaps, not a full coverage audit.

## Organization attention

The overview summarizes bounded sample signals in three category counts. The full attention view at `#/organization/attention/all` has filters and links to each source assignment or workstream. `organizationAttention.ts` combines explicit responsibility gaps, pending assignment responses and unverified outcomes. Counts measure signals, not distinct assignments, completion or organization health. The same stream can have both a responsibility gap and an unverified outcome.

Release readiness reuses the existing prerequisite explanations. Recorded responses remove ordinary response signals; release and staging subjects retain unverified-effect signals and link to the local receipt. Neither workstream outcome nor responsibility gaps clear automatically. The planner named on responsibility gaps is the sample coordination contact, not the worker allocated to the missing task. Unknown outcome-review responsibility is stated explicitly. Attention categories use durable URLs ending in `/responsibility`, `/response` or `/outcome`; refresh and browser history restore the filter. Responses reset on reload. The older Alex attention queue remains a separate personal section.

## Handoff details

Two explicit sample exchanges are defined in `handoffs.ts`: candidate to reviewer and criteria to planner. They link from the corresponding workstream to `#/handoffs/payment-review` and `#/handoffs/invitation-planning`. Each describes sender/receiver scopes, inputs, proposed receiving conditions, return paths and existing assignment/evidence. Local receipts are inspectable without confirming transfer or acceptance. These pages do not create follow-up assignments or automatically evaluate receiving conditions.

## Organization activity

`#/organization/activity` combines session response receipts and attached sample evidence across modeled workstreams. The Other organization work filter covers assignments with no authored stream membership. Responses are ordered by recording time; undated evidence is presented separately and has no inferred publication sequence. Filters reset when leaving the page; refresh clears local responses. Source links open assignment Activity for full receipt or artifact inspection.

## Outcome review

`#/outcomes/WS-01` and `#/outcomes/WS-02` show proposed goal-level evidence requirements, available context, missing observations and unassigned outcome-review responsibility. `outcomes.ts` explicitly links context records to criteria within the corresponding stream. Existing assignment assessments do not verify these requirements, even when their conclusion is Meets criteria. The view is read-only: no goal decision or automatic completion calculation is introduced.

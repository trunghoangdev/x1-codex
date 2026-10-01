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

`workstreamDetails.ts` holds the authored handoff descriptions. No backend integration, assignment creation or real permission enforcement is introduced here. A future increment can explore how scoped worker bindings are inspected and how missing responsibility is surfaced.

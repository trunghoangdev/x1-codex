# Workers directory

Organization Overview → Browse workers opens `#/organization/workers`. Search matches worker ID/name/type, role, scope and explicitly linked assignment IDs. Worker type, Role and Assignment links combine with search. A role filter selects workers holding that role; cards still show all their bindings and total distinct assignment links. Type classification is authored separately from the presentation label.

The directory reuses four main-scenario workers, seven scoped bindings and the explicit `workerAssignments` links. Alex has four bindings and five linked assignments; Jamie, Codex and the release runner have no linked assignments in this sample. Their role bindings remain visible. No links does not mean idle or available. Binding descriptions do not prove live permissions, capacity, runtime health or workload outside the sample.

The organization responsibility-gap panel stays visible regardless of worker filters. Both invitation gaps belong to a workstream rather than being attributed as missing duties to a particular worker. Review responsibility gaps opens the existing Attention category and its proposal flow. Proposals neither allocate assignments nor update directory links. The independent larger organization scenario remains separate.

Filters replace the current URL entry, avoiding history entries for each keystroke. Refresh/history restores filters. Open worker opens the existing scoped detail with assignment inspection and response links. Back to Workers returns to its remembered directory URL in the session; refreshing detail falls back to Organization. Main navigation clears this context; opening from the overview's worker links uses the normal Organization return.

Cards, filters, result announcement and empty state support mobile. No external requests, availability scoring or assignment count-based capacity estimate is introduced. A real provider and pagination remain future work.

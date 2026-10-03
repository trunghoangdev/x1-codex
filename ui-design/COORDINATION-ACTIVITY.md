# Organization coordination activity

Organization activity now includes Local coordination with responsibility proposals and allocation-plan decisions. Record type offers Responsibility proposals and Allocation-plan decisions alongside responses and sample evidence. Scope filters use the proposal gap's explicit workstream reference, not a guessed project or worker role.

Each coordination record shows its workstream/scope, proposed worker/role, demo actor, rationale, timestamp and meaning. Proposal author is recorded as Alex Morgan (demo proposer); plan reviewer remains Jamie Chen in the authored demo Planner role. This does not switch the signed-in identity or validate live authority.

Accepted allocation plans explicitly remain allocation pending: no assignment, binding or permission is created. Rejected plans explicitly plan no creation. Both responsibility gaps remain open. Inspect coordination receipt opens the existing proposal modal on the activity screen; closing restores the link and keeps activity filters. Removing the proposal removes both derived coordination records and returns focus to the activity heading.

Records are derived from current session proposals, not an append-only audit log. Removal and refresh clear them; no deletion audit event is fabricated. A production audit trail would need authoritative append-only events and separate allocation-created records. Assignment responses and coordination records are sorted newest-first within their own sections; undated evidence remains separate. There is no implied global chronology across sections.

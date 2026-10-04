# Scenario navigation and evidence

The global **Sample organization** selector exposes main Software Factory, larger Software Factory and Knowledge Operations. Domain and current authored person remain visible. It is sample browsing, not authentication or tenant switching.

Switching organizations preserves Organization, My Work or Evidence when applicable; other/detail screens enter the target overview. Filters reset and the target uses its explicitly authored default persona (Alex, Sam or Maya). Main sample session responses/proposals stay in the mounted app; switching does not copy them to another sample. Refresh retains the existing main session reset behavior. Read-only persona changes retain organization context but clear personal queue filters.

Organization/My Work/Evidence sidebar links and the brand keep read-only scenario/persona identity. Demos explicitly belongs to the main software sample, as do specialized response actions. Return to main organization remains an explicit exit.

## Evidence

`#/organizations/knowledge/evidence?persona=leo` and `#/organizations/large/evidence?persona=sam` read only their adapters’ `evidence` arrays. Both fixtures are currently empty. The empty state explains that absence does not establish success/failure and links to scenario workstreams’ evidence requirements. Main artifacts and decisions are never used to fill an empty scenario. Main `#/evidence` keeps the existing inspectable records and decision chain. No real-runtime evidence retrieval is added.

## Return context and direct links

Read-only inspection stores at most 24 source/destination edges under `forge-scenario-return-v1:<scenario>:<persona>` in tab session storage. Source and destination must be valid selected-scenario routes, source persona must match, and self-source edges are rejected. Storage errors retain in-memory context. This UI navigation state is not audit history or shared persistence.

Returning truncates the used trail, so assignment → workstream → same assignment unwinds through prior screens instead of cycling. Refreshing a detail restores its filtered/paged directory or personal source in the same tab. Persona/scenario changes cannot restore another identity’s trail. A fresh link with no remembered source uses explicit local fallbacks: assignment → authored workstream, worker → Workers, workstream → Workstreams, other detail → Overview. URL filters still restore independently of storage. Main detail return behavior is unchanged.

Validation: sixteen related tests passed on desktop/mobile for scenario route/persona validation, sidebar Evidence, empty fixture isolation, switching Evidence/Overview, default identity, refresh, repeated detail unwind, fresh fallbacks, foreign stored context and document width, plus existing personal queues, coordination and role directory return. No backend tenant, login, authorization or durable command contract is implied.

Iteration 72 consolidates Knowledge’s Sample persona and My Work/main exit controls into the global sample context panel. Its fixture explanation is collapsed; navigation, default identities and return semantics are unchanged. Coordination filters are organization-wide and remain when Knowledge persona changes.

Iteration 73: Knowledge and larger software share the compact coordination overview and global persona controls. Larger software has four workstreams per page and three worker summaries, with complete directories available. Main response/readiness adaptation remains pending. See [COORDINATION-OVERVIEW.md](COORDINATION-OVERVIEW.md).

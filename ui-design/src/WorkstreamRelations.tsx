import type { KnowledgeWorkspace } from "./data/knowledgeCheckpoint";
import { workstreamRelations } from "./data/workstreamRelations";
export function WorkstreamRelations({state,onOpen}:{state:KnowledgeWorkspace;onOpen:(path:string)=>void}) {
  const relation = workstreamRelations(state);
  return <section className="panel org-stream workstream-relations" aria-label="Cross-workstream input relationship">
    <h3>K-01 → K-02 · guide for workshop preparation</h3>
    <p className="flow-status"><strong>Exchange status:</strong> {relation.status}</p>
    <p>Maya offers an assessed guide from K-01. Leo receives the exact version and separately assesses its applicability to K-02 preparation.</p>
    {relation.recorded ? <details><summary>Inspect transferred source and responses</summary>
      <p><strong>Source:</strong> {relation.source}</p><p><strong>Exchange:</strong> {relation.handoff}</p>
      <p><strong>Receiver response:</strong> {relation.response}</p><p><strong>Applicability:</strong> {relation.assessment}</p>
    </details> : <p>No cross-workstream dependency has been recorded. K-02 may use an independently supplied brief.</p>}
    <p><strong>Next exchange responsibility:</strong> {relation.next ?? (relation.recorded ? "No pending exchange response." : "Not allocated; optional exchange has not started.")}</p>
    <p>{relation.reason}</p><p><strong>Downstream input:</strong> {relation.brief}</p>
    <button className="text-link" onClick={()=>onOpen("/workstreams/K-02")}>Inspect guide exchange and workshop brief</button>
    <details><summary>Downstream dependencies and source changes</summary>
      <p>A received current brief supports case resolution; a resolved current case supports workshop allocation. Each requires its own recorded response. Guide exchange alone does not approve a case, authorize publication or establish workshop outcomes.</p>
      {relation.impacts.length ? <ul>{relation.impacts.map(row=><li key={row.id}>
        <h4>{row.title} · {row.status}</h4><p>{row.reason}</p>
        <p><strong>Source follow-up:</strong> {row.owner}</p><p>{row.next}</p>
        <button className="text-link" onClick={()=>onOpen(row.destination.replace("/organizations/knowledge",""))}>Inspect dependent source · {row.id}</button>
      </li>)}</ul> : <p>No delivered brief, case response or workshop cycle is recorded yet.</p>}
      <p>Source checks do not predict unrecorded downstream effects. Earlier executions and reviews retain their original context.</p>
      <button className="text-link" onClick={()=>onOpen("/impact")}>Open complete source and scope impact</button>
    </details>
  </section>;
}

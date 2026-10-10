import type { KnowledgeTimelineEvent, TimelineKind } from "./knowledgeTimeline";

/** Resolve only represented snapshot sources; an unknown destination never exposes all records. */
export function journeySource(records: KnowledgeTimelineEvent[], source: string) {
  const path = source.split("?")[0].replace("/organizations/knowledge", "");
  let label = "Selected source", kinds: readonly TimelineKind[] = [];
  let stream: "K-01" | "K-02" | undefined;
  if (path === "/workshop/K-02") { label = "Workshop cycles and criterion review"; kinds = ["Workshop delivery"]; }
  else if (path === "/exceptions") { label = "Exception handling history"; kinds = ["Exception follow-up"]; }
  else if (path.startsWith("/cases/")) { label = "Brief coordination case"; kinds = ["Coordination case"]; }
  else if (source === "Cross-workstream guide input") { label = "Guide exchange and applicability"; kinds = ["Workstream input"]; }
  else if (source === "Workshop brief handoff") { label = "Workshop brief and receipt"; kinds = ["Workshop brief"]; }
  else if (source === "Knowledge contribution responsibility") { label = "Contribution responsibility"; kinds = ["Responsibility"]; }
  else if (source === "Knowledge input and authority handoff") { label = "Contribution handoff"; kinds = ["Handoff"]; }
  else if (source === "Maya contribution inbox" || path.startsWith("/contributions/") || path === "/work") { label = "Contribution and editorial exchange"; kinds = ["Responsibility", "Handoff", "Contribution", "Editorial"]; }
  else if (path === "/use/K-01") { label = "Bounded use and goal follow-up"; kinds = ["Use", "Scope", "Goal follow-up"]; }
  else if (path === "/workstreams/K-01" || path === "/workstreams/K-02") { stream = path.endsWith("K-01") ? "K-01" : "K-02"; label = `${stream} workstream history`; }
  else if (source === "Organization goal evidence") { label = "Recorded execution and goal evidence"; kinds = ["Use", "Goal follow-up", "Workshop delivery"]; }
  else if (path === "/impact" || path === "/workstreams") { label = "Cross-workstream record context"; stream = undefined; kinds = [...new Set(records.map(e=>e.kind))]; }
  return {label, records: records.filter(e=>stream ? e.stream === stream : kinds.includes(e.kind))};
}
export function chapterChanges(records: KnowledgeTimelineEvent[], prior: KnowledgeTimelineEvent[]) {
  const keys = new Set(prior.map(e=>e.key));
  const added = records.filter(e=>!keys.has(e.key));
  return {added, groups: [...new Set(added.map(e=>e.kind))].map(kind=>({kind,count:added.filter(e=>e.kind===kind).length}))};
}

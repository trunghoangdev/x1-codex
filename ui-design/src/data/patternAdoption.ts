import { patternVersions, type OperatingPattern } from "./operatingPatterns";
import type { KnowledgeWorkspace } from "./knowledgeCheckpoint";
export type PatternContext = Omit<KnowledgeWorkspace, "patternEvents">;
export type PatternWork = {
  id: string;
  label: string;
  source: string;
  at: string;
  destination: string;
};
export type PatternEvent = {
  id: string;
  action: "Adopt guidance" | "Associate work";
  actor: "owner";
  stream: "K-01" | "K-02";
  version: string;
  pattern: OperatingPattern;
  rationale: string;
  at: string;
  context: PatternContext;
  adoptionId?: string;
  work?: PatternWork;
  supersedes?: string;
};
export function patternWork(
  context: PatternContext,
  stream: string,
): PatternWork[] {
  const works: PatternWork[] = [];
  if (stream === "K-01") {
    for (const c of context.contribution.contributions)
      if (c.delivery)
        works.push({
          id: `contribution:${c.delivery.id}`,
          label: `Contribution delivery · v${c.version}`,
          source: JSON.stringify(c.delivery),
          at: c.delivery.at,
          destination: "/contributions/K-01-H?persona=leo",
        });
    for (const material of [
      ...(context.use?.previousMaterials ?? []),
      ...(context.use ? [context.use] : []),
    ])
      for (const use of [
        ...(material.previousCycle ? [material.previousCycle] : []),
        material,
      ])
        works.push({
          id: `use:${use.mandate.id}`,
          label: `Bounded use · ${use.mandate.id}`,
          source: JSON.stringify({
            mandate: use.mandate,
            subject: use.subject,
            audience: use.audience,
          }),
          at: use.mandate.at,
          destination: "/use/K-01",
        });
  }
  if (stream === "K-02") {
    for (const b of context.brief.versions) {
      const { receipt, ...delivery } = b;
      works.push({
        id: `brief:${b.version}`,
        label: `Workshop brief · v${b.version}`,
        source: JSON.stringify(delivery),
        at: b.deliveredAt,
        destination: "/workstreams/K-02",
      });
    }
    for (const e of context.workshopEvents ?? [])
      if (e.action === "Offer facilitation")
        works.push({
          id: `workshop:${e.id}`,
          label: `Workshop delivery · cycle ${e.cycle}`,
          source: JSON.stringify({
            id: e.id,
            cycle: e.cycle,
            ...(e.allocation ? { allocation: e.allocation } : {}),
            source: e.source,
            body: e.body,
            at: e.at,
          }),
          at: e.at,
          destination: "/workshop/K-02",
        });
  }
  return works;
}
export function activePattern(events: PatternEvent[], stream: string) {
  return [...events]
    .reverse()
    .find((e) => e.stream === stream && e.action === "Adopt guidance");
}
export function workPattern(
  events: PatternEvent[],
  stream: string,
  work: PatternWork,
) {
  return events.find(
    (e) =>
      e.stream === stream &&
      e.action === "Associate work" &&
      e.work?.id === work.id &&
      e.work.source === work.source,
  );
}
function latestTime(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  return Math.max(
    0,
    ...Object.entries(value).map(([k, v]) =>
      ["at", "deliveredAt"].includes(k) && typeof v === "string"
        ? Date.parse(v)
        : latestTime(v),
    ),
  );
}
export function recordPatternEvent(
  events: PatternEvent[],
  context: PatternContext,
  actor: string,
  action: PatternEvent["action"],
  stream: PatternEvent["stream"],
  version: string,
  workId: string,
  rationale: string,
  at: string,
): PatternEvent[] {
  const pattern = patternVersions(stream).find((p) => p.version === version),
    active = activePattern(events, stream),
    last = events.at(-1);
  if (
    !pattern ||
    actor !== "owner" ||
    events.length >= 20 ||
    !rationale.trim() ||
    rationale.length > 3000 ||
    !Number.isFinite(Date.parse(at)) ||
    Date.parse(at) < latestTime(context) ||
    (last && Date.parse(at) < Date.parse(last.at))
  )
    return events;
  const work = patternWork(context, stream).find((w) => w.id === workId);
  if (
    action === "Adopt guidance"
      ? active?.version === version
      : action === "Associate work"
        ? !active ||
          active.version !== version ||
          !work ||
          !!workPattern(events, stream, work)
        : true
  )
    return events;
  const { patternEvents: ignored, ...snapshot } = context as KnowledgeWorkspace;
  return [
    ...events,
    {
      id: `pattern-event-${events.length + 1}`,
      actor: "owner",
      action,
      stream,
      version,
      pattern: structuredClone(pattern),
      rationale: rationale.trim(),
      at,
      context: structuredClone(snapshot),
      ...(action === "Associate work"
        ? { adoptionId: active!.id, work: structuredClone(work!) }
        : active
          ? { supersedes: active.id }
          : {}),
    },
  ];
}

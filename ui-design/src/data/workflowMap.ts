import type { OrganizationScenario } from "./organizationScenario";
export function workflowMap(scenario: OrganizationScenario, streamId: string) {
  const stream = scenario.streams.find((s) => s.id === streamId);
  const assignments = scenario.assignments.filter(
    (a) => a.streamId === streamId && stream?.assignmentIds.includes(a.id),
  );
  const ids = new Set(assignments.map((a) => a.id));
  return {
    stream,
    assignments,
    gaps: scenario.gaps.filter((g) => g.workstreamId === streamId),
    dependencies: scenario.dependencies.filter(
      (d) =>
        d.streamId === streamId &&
        ids.has(d.receiverAssignmentId) &&
        ("assignmentId" in d.provider
          ? ids.has(d.provider.assignmentId)
          : scenario.workers.some(
              (w) => "workerId" in d.provider && w.id === d.provider.workerId,
            )),
    ),
    parallelWork: scenario.parallelWork.filter(
      (g) =>
        g.streamId === streamId &&
        g.assignmentIds.length > 1 &&
        g.assignmentIds.every((id) => ids.has(id)),
    ),
  };
}

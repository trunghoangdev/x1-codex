import type { OrganizationScenario } from "./organizationScenario";
import type { Workstream } from "./organizationOverview";
// A reference must resolve inside this scenario and this stream's assignment scope.
export function outcomeContextEvidence(
  scenario: OrganizationScenario,
  stream: Workstream,
  id: string,
) {
  return scenario.evidence.find(
    (e) =>
      e.id === id &&
      stream.assignmentIds.includes(e.assignmentId) &&
      scenario.assignments.some(
        (a) => a.id === e.assignmentId && a.streamId === stream.id,
      ),
  );
}

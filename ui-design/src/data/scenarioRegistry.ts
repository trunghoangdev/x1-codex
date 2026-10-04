import { largeOrganization } from "./organizationScenario";
import { knowledgeOrganization } from "./knowledgeOrganization";
export const readOnlyScenarios = [largeOrganization, knowledgeOrganization];
export function resolveScenario(raw: string) {
  return readOnlyScenarios.find(
    (s) => raw.split("?")[0].split("/")[2] === s.id,
  );
}
export function scenarioPersona(raw: string) {
  const s = resolveScenario(raw);
  const id = new URLSearchParams(raw.split("?")[1]).get("persona");
  return s?.personas?.find((p) => p.workerId === id) ?? s?.personas?.[0];
}

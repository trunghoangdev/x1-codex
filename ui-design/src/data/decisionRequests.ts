import { releaseSubject } from "./release";
import type { OrganizationScenario } from "./organizationScenario";
export type DecisionRequest = {
  id: string;
  scenarioId: OrganizationScenario["id"];
  title: string;
  kind: "Authorization" | "Responsibility clarification";
  subject: { label: string; scope: string; identity?: string };
  question: string;
  requester?: { workerId: string };
  allocation:
    | {
        state: "allocated";
        workerId: string;
        role: string;
        assignmentId: string;
      }
    | { state: "unassigned" | "unknown"; detail: string };
  policy: { state: "declared" | "unknown"; detail: string };
  mandate: string;
  requiredEvidence: string[];
  boundary: string;
  source: { assignmentId?: string; streamId?: string; gapId?: string };
  escalation?: { workerId: string; reason: string };
  provenance: string;
};
const requests: DecisionRequest[] = [
  {
    id: "release-v182-decision",
    scenarioId: "main",
    title: "Payments API production release",
    kind: "Authorization",
    subject: {
      label: releaseSubject.label,
      scope: releaseSubject.target,
      identity: releaseSubject.digest,
    },
    question:
      "May this exact release candidate proceed to production deployment?",
    allocation: {
      state: "allocated",
      workerId: "alex",
      role: "Release authority",
      assignmentId: "A-1041",
    },
    policy: {
      state: "declared",
      detail:
        "A-1041 represents release.approve for this exact candidate. Effective permission and prerequisite state remain sample previews in the assignment.",
    },
    mandate:
      "Authorize or refuse this exact production release subject. Candidate assessment, deployment execution and effect confirmation are separate responsibilities.",
    requiredEvidence: [
      "Exact candidate identity and production target",
      "Assessment, checks and prerequisite evidence for the same subject; inspect current readiness in A-1041",
    ],
    boundary:
      "A-1035 concerns staging reconciliation and does not authorize production. A-1042 candidate assessment does not grant release authority. A recorded authorization does not prove deployment.",
    source: { assignmentId: "A-1041" },
    provenance:
      "Projection of existing authored A-1041 assignment and synthetic release subject. No requester or escalation contact is represented.",
  },
  {
    id: "guide-publication-responsibility",
    scenarioId: "knowledge",
    title: "Clarify guide publication decision responsibility",
    kind: "Responsibility clarification",
    subject: {
      label: "New member welcome guide",
      scope:
        "K-01 · Proposed internal guide publication; exact version not represented",
    },
    question:
      "Which role and person will decide publication authorization, under which policy and for which guide version?",
    allocation: {
      state: "unknown",
      detail:
        "No publication authorization owner or authorization assignment is represented. This is a sample coordination question, not an approval request assigned to an editor.",
    },
    policy: {
      state: "unknown",
      detail:
        "Publication authorization policy is not supplied. The known Publication reviewer gap describes assessment responsibility; it does not define who can authorize publication.",
    },
    mandate:
      "Clarify authorization responsibility and required policy before a publication decision can be allocated. Editorial criteria, publication assessment and distribution remain distinct.",
    requiredEvidence: [
      "Named guide version, proposed audience and distribution channel",
      "Explicit publication authorization policy and decision allocation",
      "Publication assessment evidence required by that policy; current requirements are unknown",
    ],
    boundary:
      "Maya’s editorial response is not publication approval. The Distribution worker binding does not allocate authorization or imply distribution occurred. Publication reviewer is explicitly missing; authorization policy and owner are separately unknown.",
    source: { streamId: "K-01", gapId: "knowledge-publication" },
    provenance:
      "New authored sample responsibility-clarification requirement. It introduces no publication approval policy, permission, deadline or execution request.",
  },
];
export function decisionRequests(scenario: OrganizationScenario) {
  return requests.filter((r) => r.scenarioId === scenario.id);
}

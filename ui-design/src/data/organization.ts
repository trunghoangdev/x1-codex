import type { Readiness } from "./models";

// Authored UI explanations, not inferred dependencies or a production workflow.
export const organizationWork: Record<string, { wait: string; next: string }> =
  {
    "A-1042": {
      wait: "The source contribution awaits human assessment.",
      next: "Inspect the candidate, checks and evidence before submitting an assessment.",
    },
    "A-1041": {
      wait: "",
      next: "Inspect the exact release subject and its current prerequisites.",
    },
    "A-1038": {
      wait: "Acceptance criteria need clarification before implementation can be evaluated.",
      next: "Clarify expired invitations and existing-member behavior.",
    },
    "A-1035": {
      wait: "The staging effect is unconfirmed; request acceptance is not proof of deployment.",
      next: "Compare the observed effect with the expected artifact.",
    },
    "A-1032": {
      wait: "The proposed accessibility changes await assessment.",
      next: "Review keyboard navigation, focus order and error announcements.",
    },
  };
export const releaseWait: Record<Readiness, string> = {
  missing:
    "Approval is blocked: required release evidence is missing. Refusal remains available in the assignment.",
  ready:
    "Sample prerequisites are ready for a decision. Execution has not been confirmed.",
  refused:
    "Approval is blocked: a prerequisite assessment refused the candidate. Inspect the evidence before deciding.",
  "load-error": "Both decisions are blocked: review data could not be loaded.",
  stale: "Both decisions are blocked: the candidate snapshot changed.",
  revoked: "Both decisions are blocked: release authority is no longer valid.",
};

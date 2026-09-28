// Fictional UI fixtures, not production SF assignments or an API response.
import type { Assignment } from "./models";
export const assignments: Assignment[] = [
  {
    id: "A-1042",
    title: "Review retry handling for payment webhooks",
    project: "Payments API",
    kind: "Assessment",
    role: "Reviewer",
    authority: "assessment.submit",
    due: "Today",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "Review the proposed retry behavior for failed webhook deliveries. Confirm that repeated events cannot trigger duplicate payments, and assess the attached test evidence.",
    artifact: "Retry handling · changeset c8e4a21",
  },
  {
    id: "A-1041",
    title: "Authorize Payments API release v1.8.2",
    project: "Payments API",
    kind: "Authority",
    role: "Release authority",
    authority: "release.approve",
    due: "Today",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "Decide whether the exact release candidate v1.8.2 may proceed to deployment. Your approval authorizes this candidate only; execution and confirmation are separate steps.",
    artifact: "Release candidate · v1.8.2",
  },
  {
    id: "A-1038",
    title: "Clarify acceptance criteria for team invitations",
    project: "Team Workspace",
    kind: "Work",
    role: "Product owner",
    authority: "contribution.submit",
    due: "Tomorrow",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "Define the expected behavior for expired invitations and existing organization members. Submit acceptance criteria for the implementation assignment.",
    artifact: "Invitation requirements · revision 3",
  },
  {
    id: "A-1035",
    title: "Reconcile staging deployment confirmation",
    project: "Payments API",
    kind: "Reconciliation",
    role: "Operator",
    authority: "reconciliation.submit",
    due: "Today",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "The deployment request was accepted, but its final effect is unconfirmed. Compare the staging observation with the expected artifact and record your assessment. Do not assume success from request acceptance alone.",
    artifact: "Staging deployment · observation 238",
  },
  {
    id: "A-1032",
    title: "Assess accessibility fixes for onboarding",
    project: "Team Workspace",
    kind: "Assessment",
    role: "Reviewer",
    authority: "assessment.submit",
    due: "Friday",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "Check keyboard navigation, focus order, and form error announcements against the proposed onboarding changes.",
    artifact: "Onboarding accessibility · changeset 91bca02",
  },
];

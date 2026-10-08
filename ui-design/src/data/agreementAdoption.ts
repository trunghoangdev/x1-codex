import { agreementVersions } from "./workstreamAgreements";
export type AgreementAdoption = {
  id: string;
  versionId: string;
  audience: string;
  rationale: string;
  at: string;
  adopter: "Leo · demo workstream coordinator";
  streamId: "K-01";
  supersedes?: string;
};
export function adoptAgreement(
  history: AgreementAdoption[],
  versionId: string,
  audience: string,
  rationale: string,
  at: string,
): AgreementAdoption[] {
  const previous = history.at(-1);
  if (
    !agreementVersions.some((v) => v.id === versionId) ||
    previous?.versionId === versionId ||
    !audience.trim() ||
    !rationale.trim() ||
    audience.length > 500 ||
    rationale.length > 3000 ||
    !Number.isFinite(Date.parse(at))
  )
    return history;
  return [
    ...history,
    {
      id: `local-agreement-adoption-${history.length + 1}`,
      versionId,
      audience: audience.trim(),
      rationale: rationale.trim(),
      at,
      adopter: "Leo · demo workstream coordinator",
      streamId: "K-01",
      ...(previous ? { supersedes: previous.id } : {}),
    },
  ];
}
export const agreementImpact = [
  {
    id: "K-01-P",
    title: "Distribution scope",
    effect:
      "Reconsider audience and channel constraints against the named cohort or team list.",
    path: "/assignments/K-01-P",
  },
  {
    id: "K-01-E",
    title: "Editorial criteria",
    effect:
      "Reconsider coverage and acceptance criteria for the adopted audience; existing editorial responses do not establish applicability.",
    path: "/assignments/K-01-E",
  },
  {
    id: "K-01-D",
    title: "Research and source inputs",
    effect:
      "Check representative questions and source coverage. Approved material and audience mappings remain unconfirmed.",
    path: "/assignments/K-01-D",
  },
  {
    id: "K-01-H",
    title: "Contribution delivery and assessment",
    effect:
      "Existing contribution versions, receipts and assessments retain their exact subjects. Their applicability to this agreement is unknown; reassessment may be needed.",
    path: "/assignments/K-01-H",
  },
  {
    id: "K-01-goal",
    title: "Outcome evidence",
    effect:
      "No reader observations are represented. Do not mark absent evidence valid or invalidate unrelated evidence automatically.",
    path: "/outcomes/K-01",
  },
];

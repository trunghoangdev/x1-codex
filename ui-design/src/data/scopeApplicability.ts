import {
  contributionResponsibility,
  type HumanContributionState,
} from "./humanContribution";
import type { AgreementAdoption } from "./agreementAdoption";
import type { AuthorizedUse } from "./authorizedUse";
export type ApplicabilityContext = {
  contribution: HumanContributionState;
  use?: AuthorizedUse;
};
export type ApplicabilitySource = {
  kind: "input" | "delivery" | "assessment" | "bounded-use" | "reader-evidence";
  id: string;
  snapshot: string;
  reviewer: string;
};
export type ApplicabilityCheck = {
  id: string;
  adoptionId: string;
  agreementVersion: string;
  audience: string;
  source: ApplicabilitySource;
  context: ApplicabilityContext;
  conclusion: "Applicable" | "Needs reassessment" | "Insufficient information";
  rationale: string;
  at: string;
  reviewer: string;
};
export type ApplicabilityScope = {
  adoptions: AgreementAdoption[];
  checks: ApplicabilityCheck[];
};
export function applicabilitySources(
  context: ApplicabilityContext,
): ApplicabilitySource[] {
  const c = context.contribution.contributions.at(-1),
    u = context.use;
  const sources: ApplicabilitySource[] = [
    {
      kind: "input",
      id: contributionResponsibility.input,
      snapshot: JSON.stringify({
        id: contributionResponsibility.input,
        text: contributionResponsibility.inputText,
      }),
      reviewer: "Leo · demo scope coordinator",
    },
  ];
  if (c?.delivery)
    sources.push({
      kind: "delivery",
      id: c.delivery.id,
      snapshot: JSON.stringify(c.delivery),
      reviewer: "Maya · demo applicability reviewer",
    });
  const assessment = c?.reassessment ?? c?.assessment;
  if (assessment)
    sources.push({
      kind: "assessment",
      id: assessment.id,
      snapshot: JSON.stringify({
        assessment,
        delivery: c?.delivery,
        receipt: c?.receipt,
      }),
      reviewer: "Maya · demo applicability reviewer",
    });
  if (u)
    sources.push({
      kind: "bounded-use",
      id: u.mandate.id,
      snapshot: JSON.stringify({
        subject: u.subject,
        audience: u.audience,
        mandate: u.mandate,
      }),
      reviewer: "Sam · demo bounded-use scope reviewer",
    });
  if (u?.readerEvidence?.kind === "Simulated reader evidence")
    sources.push({
      kind: "reader-evidence",
      id: u.readerEvidence.id,
      snapshot: JSON.stringify({
        subject: u.subject,
        audience: u.audience,
        evidence: u.readerEvidence,
      }),
      reviewer: "Maya · demo applicability reviewer",
    });
  return sources;
}
export function recordApplicability(
  checks: ApplicabilityCheck[],
  adoption: AgreementAdoption | undefined,
  context: ApplicabilityContext,
  kind: ApplicabilitySource["kind"],
  conclusion: ApplicabilityCheck["conclusion"],
  rationale: string,
  at: string,
): ApplicabilityCheck[] {
  const source = applicabilitySources(context).find((s) => s.kind === kind);
  if (
    !adoption ||
    !source ||
    !["Applicable", "Needs reassessment", "Insufficient information"].includes(
      conclusion,
    ) ||
    !rationale.trim() ||
    rationale.length > 3000 ||
    !Number.isFinite(Date.parse(at))
  )
    return checks;
  const previous = checks.at(-1);
  if (
    previous?.adoptionId === adoption.id &&
    previous.source.snapshot === source.snapshot &&
    previous.source.kind === kind &&
    previous.conclusion === conclusion &&
    previous.rationale === rationale.trim()
  )
    return checks;
  return [
    ...checks,
    {
      id: `local-applicability-${checks.length + 1}`,
      adoptionId: adoption.id,
      agreementVersion: adoption.versionId,
      audience: adoption.audience,
      source,
      context: structuredClone({
        contribution: context.contribution,
        ...(context.use ? { use: context.use } : {}),
      }),
      conclusion,
      rationale: rationale.trim(),
      at,
      reviewer: source.reviewer,
    },
  ];
}
export function currentApplicability(
  checks: ApplicabilityCheck[],
  adoption: AgreementAdoption | undefined,
  source: ApplicabilitySource | undefined,
) {
  return adoption && source
    ? [...checks]
        .reverse()
        .find(
          (c) =>
            c.adoptionId === adoption.id &&
            c.audience === adoption.audience &&
            c.source.kind === source.kind &&
            c.source.id === source.id &&
            c.source.snapshot === source.snapshot,
        )
    : undefined;
}
export function applicabilityGuard(
  context: ApplicabilityContext,
  scope?: ApplicabilityScope,
): string | undefined {
  const adoption = scope?.adoptions.at(-1);
  if (!adoption || !context.use) return;
  const sources = applicabilitySources(context);
  for (const kind of ["assessment", "bounded-use"] as const) {
    const source = sources.find((s) => s.kind === kind);
    const check = currentApplicability(scope!.checks, adoption, source);
    if (check?.conclusion !== "Applicable")
      return `${kind} ${source?.id ?? "source missing"} → ${adoption.id} (${adoption.audience}): ${check?.conclusion ?? "applicability unknown"}. Record an explicit applicability decision before authorized use.`;
  }
}

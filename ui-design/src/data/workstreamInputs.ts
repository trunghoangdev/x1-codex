import { allocateUseMandate, assessedUseSubject } from "./authorizedUse";
import type { HumanContributionState } from "./humanContribution";
export type GuideInputResponse =
  "Received" | "Clarification requested" | "Declined" | "Cancelled";
export type GuideInputConclusion =
  "Applicable" | "Needs adaptation" | "Not applicable";
export type GuideHandoff = {
  id: string;
  briefCount: number;
  from: "K-01";
  to: "K-02";
  sender: "Maya";
  receiver: "Leo";
  subject: string;
  rationale: string;
  purpose: string;
  at: string;
  response?: {
    id: string;
    actor: "Maya" | "Leo";
    decision: GuideInputResponse;
    at: string;
    rationale: string;
  };
  applicability?: {
    id: string;
    actor: "Leo";
    conclusion: GuideInputConclusion;
    sourceId: string;
    at: string;
    rationale: string;
  }[];
};
export type GuideBriefInput = {
  handoffId: string;
  applicabilityId: string;
  subject: string;
  handoffCount: number;
  decisionCount: number;
};
const valid = (text: string, at: string) =>
  typeof text === "string" &&
  !!text.trim() &&
  text.length <= 3000 &&
  Number.isFinite(Date.parse(at));
export function offerGuideInput(
  history: GuideHandoff[],
  subject: string | undefined,
  rationale: string,
  purpose: string,
  at: string,
  briefCount = 0,
): GuideHandoff[] {
  if (
    !Number.isInteger(briefCount) ||
    briefCount < 0 ||
    briefCount > 200 ||
    briefCount < (history.at(-1)?.briefCount ?? 0)
  )
    return history;
  if (
    history.length >= 20 ||
    (history.length && !history.at(-1)?.response) ||
    !valid(rationale, at) ||
    !valid(purpose, at) ||
    !allocateUseMandate(subject, "K-02 internal preparation", rationale, at)
  )
    return history;
  const last = history.at(-1);
  if (last && Date.parse(at) < latestGuideTime(last)) return history;
  return [
    ...history,
    {
      id: `guide-workshop-handoff-${history.length + 1}`,
      briefCount,
      from: "K-01",
      to: "K-02",
      sender: "Maya",
      receiver: "Leo",
      subject: subject!,
      rationale: rationale.trim(),
      purpose: purpose.trim(),
      at,
    },
  ];
}
export function latestGuideTime(h: GuideHandoff): number {
  return Math.max(
    Date.parse(h.at),
    Date.parse(h.response?.at ?? h.at),
    ...(h.applicability ?? []).map((a) => Date.parse(a.at)),
  );
}
export function respondGuideInput(
  history: GuideHandoff[],
  id: string,
  decision: GuideInputResponse,
  rationale: string,
  at: string,
): GuideHandoff[] {
  const h = history.at(-1);
  if (
    !h ||
    h.id !== id ||
    h.response ||
    !["Received", "Clarification requested", "Declined", "Cancelled"].includes(
      decision,
    ) ||
    !valid(rationale, at) ||
    Date.parse(at) < Date.parse(h.at)
  )
    return history;
  return history.map((x) =>
    x === h
      ? {
          ...h,
          response: {
            id: `${h.id}-response`,
            actor: decision === "Cancelled" ? "Maya" : "Leo",
            decision,
            rationale: rationale.trim(),
            at,
          },
        }
      : x,
  );
}
export function assessGuideInput(
  history: GuideHandoff[],
  id: string,
  subject: string | undefined,
  conclusion: GuideInputConclusion,
  rationale: string,
  at: string,
): GuideHandoff[] {
  const h = history.at(-1);
  if (
    !h ||
    h.id !== id ||
    h.subject !== subject ||
    h.response?.decision !== "Received" ||
    !["Applicable", "Needs adaptation", "Not applicable"].includes(
      conclusion,
    ) ||
    !valid(rationale, at) ||
    Date.parse(at) < latestGuideTime(h) ||
    (h.applicability?.length ?? 0) >= 10
  )
    return history;
  return history.map((x) =>
    x === h
      ? {
          ...h,
          applicability: [
            ...(h.applicability ?? []),
            {
              id: `${h.id}-applicability-${(h.applicability?.length ?? 0) + 1}`,
              actor: "Leo",
              conclusion,
              sourceId: h.response!.id,
              rationale: rationale.trim(),
              at,
            },
          ],
        }
      : x,
  );
}
export function guideInputStatus(
  history: GuideHandoff[],
  subject?: string,
): {
  ready: boolean;
  reason: string;
  actor: "Maya" | "Leo";
  input?: GuideBriefInput;
} {
  const h = history.at(-1);
  if (!h)
    return {
      ready: false,
      reason:
        "No K-01 guide handed to K-02. The optional cross-workstream exercise has not started.",
      actor: "Maya",
    };
  if (h.subject !== subject)
    return {
      ready: false,
      reason:
        "K-01 source changed or has a pending revision. Preserve earlier briefs; Maya must hand over the new suitable version. Cancel any pending old offer first.",
      actor: "Maya",
    };
  if (!h.response)
    return {
      ready: false,
      reason: "Guide offered by Maya; Leo’s exact receipt is pending.",
      actor: "Leo",
    };
  if (h.response.decision !== "Received")
    return {
      ready: false,
      reason: `${h.response.decision}. Maya must resolve the response and make a new offer; earlier packages remain.`,
      actor: "Maya",
    };
  const a = h.applicability?.at(-1);
  if (a?.conclusion !== "Applicable")
    return {
      ready: false,
      reason: a
        ? `${a.conclusion}: ${a.rationale}. Leo must resolve gaps and record a new applicability decision, or ask Maya for revised material.`
        : "Receipt recorded; Leo must separately assess applicability to K-02 preparation.",
      actor: "Leo",
    };
  return {
    ready: true,
    reason:
      "Exact K-01 guide received and assessed Applicable for K-02 internal preparation. Publication and workshop approval remain separate.",
    actor: "Leo",
    input: {
      handoffId: h.id,
      applicabilityId: a.id,
      subject: h.subject,
      handoffCount: history.length,
      decisionCount: h.applicability!.length,
    },
  };
}
export const currentGuideSubject = (contribution: HumanContributionState) =>
  assessedUseSubject(contribution);

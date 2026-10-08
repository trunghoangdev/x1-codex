import { recordPatternEvent, type PatternEvent } from "./patternAdoption";
import { recordWorkshopEvent, type WorkshopEvent } from "./workshop";
import {
  recordCaseEvent,
  retainsBriefs,
  type CaseEvent,
} from "./caseLifecycle";
import {
  reviewGoal,
  respondGoalTask,
  deliverGoalTask,
  assessGoalTask,
  cancelGoalTask,
} from "./goalLoop";
import {
  proposeReviewHandoff,
  respondReviewHandoff,
  decisionActorId,
  reviewAnchor,
} from "./reviewHandoffs";
import {
  offerGuideInput,
  respondGuideInput,
  assessGuideInput,
  type GuideHandoff,
} from "./workstreamInputs";
import {
  recordApplicability,
  type ApplicabilityCheck,
} from "./scopeApplicability";
import {
  parseContributionCheckpoint,
  encodeContributionCheckpoint,
} from "./contributionCheckpoint";
import {
  contributionResponsibility,
  type HumanContributionState,
} from "./humanContribution";
import {
  deliverBrief,
  receiveBrief,
  type BriefHandoffState,
} from "./briefHandoff";
import { adoptAgreement, type AgreementAdoption } from "./agreementAdoption";
import {
  continueUse,
  useVersion,
  latestUseTime,
  allocateUseMandate,
  assessedUseSubject,
  recordUseStep,
  controlAuthority,
  type AuthorizedUse,
  type UseAction,
} from "./authorizedUse";
export type KnowledgeWorkspace = {
  contribution: HumanContributionState;
  brief: BriefHandoffState;
  adoptions: AgreementAdoption[];
  use?: AuthorizedUse;
  applicability?: ApplicabilityCheck[];
  caseEvents?: CaseEvent[];
  workshopEvents?: WorkshopEvent[];
  patternEvents?: PatternEvent[];
};
export type KnowledgeCheckpoint = {
  format:
    | "forge.knowledge-workspace.v1"
    | "forge.knowledge-workspace.v2"
    | "forge.knowledge-workspace.v3"
    | "forge.knowledge-workspace.v4"
    | "forge.knowledge-workspace.v5"
    | "forge.knowledge-workspace.v6"
    | "forge.knowledge-workspace.v7"
    | "forge.knowledge-workspace.v8"
    | "forge.knowledge-workspace.v9"
    | "forge.knowledge-workspace.v10"
    | "forge.knowledge-workspace.v11"
    | "forge.knowledge-workspace.v12"
    | "forge.knowledge-workspace.v13"
    | "forge.knowledge-workspace.v14";
  savedAt: string;
  state: KnowledgeWorkspace;
};
export type KnowledgeImport =
  | { kind: "workspace"; checkpoint: KnowledgeCheckpoint }
  | {
      kind: "contribution";
      contribution: HumanContributionState;
      savedAt: string;
    };
export const knowledgeCheckpointKey = "forge-knowledge-workspace-v1";
const object = (x: unknown): x is Record<string, any> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const shape = (x: unknown, keys: string[]) =>
  object(x) && Object.keys(x).every((k) => keys.includes(k));
const text = (x: unknown, max = 3000): x is string =>
  typeof x === "string" && x.length <= max;
const date = (x: unknown): x is string =>
  text(x, 100) && Number.isFinite(Date.parse(x));
function canonical(x: any): string {
  return JSON.stringify(
    Array.isArray(x)
      ? x.map((v) => JSON.parse(canonical(v)))
      : object(x)
        ? Object.fromEntries(
            Object.keys(x)
              .sort()
              .map((k) => [k, JSON.parse(canonical(x[k]))]),
          )
        : x,
  );
}
export function sameKnowledgeValue(a: unknown, b: unknown) {
  return a === undefined || b === undefined
    ? a === b
    : canonical(a) === canonical(b);
}
function validateSubject(raw: unknown): string {
  if (!text(raw, 100000)) throw Error("Invalid frozen source");
  const s = JSON.parse(raw);
  const d = s.delivery,
    r = s.receipt,
    a = s.assessment;
  if (
    !shape(s, ["subject", "version", "delivery", "receipt", "assessment"]) ||
    s.subject !== "human-guide-example" ||
    !useVersion(raw) ||
    !shape(d, [
      "id",
      "at",
      "body",
      "note",
      "input",
      "respondsTo",
      "performer",
    ]) ||
    d.id !== `human-delivery-v${s.version}` ||
    (d.performer !== undefined && !["leo", "delegate"].includes(d.performer)) ||
    !date(d.at) ||
    !text(d.body, 12000) ||
    !d.body.trim() ||
    !text(d.note, 3000) ||
    !d.note.trim() ||
    d.input !== contributionResponsibility.input ||
    (s.version === 2
      ? d.respondsTo !== "human-assessment-v1"
      : ![
          `human-reassessment-v${s.version - 1}`,
          `human-revision-request-v${s.version - 1}`,
        ].includes(d.respondsTo)) ||
    !shape(r, ["id", "deliveryId", "at"]) ||
    r.id !== `human-receipt-v${s.version}` ||
    r.deliveryId !== d.id ||
    !date(r.at) ||
    !shape(a, [
      "id",
      "receiptId",
      "deliveryId",
      "assessor",
      "at",
      "conclusion",
      "rationale",
    ]) ||
    a.id !== `human-reassessment-v${s.version}` ||
    a.receiptId !== r.id ||
    a.deliveryId !== d.id ||
    a.assessor !== "Maya" ||
    a.conclusion !== "Suitable for stated scope" ||
    !date(a.at) ||
    !text(a.rationale) ||
    !a.rationale.trim()
  )
    throw Error("Invalid frozen source links");
  const expected = assessedUseSubject({
    contributions: [
      {
        version: s.version,
        body: d.body,
        note: d.note,
        citesInput: true,
        delivery: d,
        receipt: r,
        reassessment: a,
      },
    ],
  });
  if (raw !== expected) throw Error("Invalid exact source encoding");
  return raw;
}
export function parseKnowledgeCheckpoint(raw: string): KnowledgeCheckpoint {
  try {
    if (raw.length > 4_000_000) throw Error();
    const x = JSON.parse(raw);
    if (
      !shape(x, ["format", "savedAt", "state"]) ||
      ![
        "forge.knowledge-workspace.v1",
        "forge.knowledge-workspace.v2",
        "forge.knowledge-workspace.v3",
        "forge.knowledge-workspace.v4",
        "forge.knowledge-workspace.v5",
        "forge.knowledge-workspace.v6",
        "forge.knowledge-workspace.v7",
        "forge.knowledge-workspace.v8",
        "forge.knowledge-workspace.v9",
        "forge.knowledge-workspace.v10",
        "forge.knowledge-workspace.v11",
        "forge.knowledge-workspace.v12",
        "forge.knowledge-workspace.v13",
        "forge.knowledge-workspace.v14",
      ].includes(x.format) ||
      !date(x.savedAt) ||
      !shape(x.state, [
        "contribution",
        "brief",
        "adoptions",
        "use",
        "applicability",
        "caseEvents",
        "workshopEvents",
        "patternEvents",
      ])
    )
      throw Error();
    const s = x.state;
    parseContributionCheckpoint(encodeContributionCheckpoint(s.contribution));
    if (
      s.contribution.responsibility &&
      ![
        "forge.knowledge-workspace.v4",
        "forge.knowledge-workspace.v5",
        "forge.knowledge-workspace.v6",
        "forge.knowledge-workspace.v7",
        "forge.knowledge-workspace.v8",
        "forge.knowledge-workspace.v9",
        "forge.knowledge-workspace.v10",
        "forge.knowledge-workspace.v11",
        "forge.knowledge-workspace.v12",
        "forge.knowledge-workspace.v13",
        "forge.knowledge-workspace.v14",
      ].includes(x.format)
    )
      throw Error();
    if (
      s.contribution.handoffs &&
      ![
        "forge.knowledge-workspace.v5",
        "forge.knowledge-workspace.v6",
        "forge.knowledge-workspace.v7",
        "forge.knowledge-workspace.v8",
        "forge.knowledge-workspace.v9",
        "forge.knowledge-workspace.v10",
        "forge.knowledge-workspace.v11",
        "forge.knowledge-workspace.v12",
        "forge.knowledge-workspace.v13",
        "forge.knowledge-workspace.v14",
      ].includes(x.format)
    )
      throw Error();
    if (
      !shape(s.brief, ["versions", "guideHandoffs"]) ||
      !Array.isArray(s.brief.versions) ||
      s.brief.versions.length > 200 ||
      !Array.isArray(s.adoptions) ||
      s.adoptions.length > 200
    )
      throw Error();
    let guideHandoffs: GuideHandoff[] = [];
    if (s.brief.guideHandoffs !== undefined) {
      if (
        ![
          "forge.knowledge-workspace.v8",
          "forge.knowledge-workspace.v9",
          "forge.knowledge-workspace.v10",
          "forge.knowledge-workspace.v11",
          "forge.knowledge-workspace.v12",
          "forge.knowledge-workspace.v13",
          "forge.knowledge-workspace.v14",
        ].includes(x.format) ||
        !Array.isArray(s.brief.guideHandoffs) ||
        !s.brief.guideHandoffs.length ||
        s.brief.guideHandoffs.length > 20
      )
        throw Error();
      for (const h of s.brief.guideHandoffs) {
        validateSubject(h.subject);
        if (
          !Number.isInteger(h.briefCount) ||
          h.briefCount > s.brief.versions.length ||
          (h.briefCount > 0 &&
            Date.parse(h.at) <
              Date.parse(s.brief.versions[h.briefCount - 1].deliveredAt))
        )
          throw Error();
        guideHandoffs = offerGuideInput(
          guideHandoffs,
          h.subject,
          h.rationale,
          h.purpose,
          h.at,
          h.briefCount,
        );
        if (h.response)
          guideHandoffs = respondGuideInput(
            guideHandoffs,
            h.id,
            h.response.decision,
            h.response.rationale,
            h.response.at,
          );
        if (
          h.applicability !== undefined &&
          (!Array.isArray(h.applicability) ||
            !h.applicability.length ||
            h.applicability.length > 10)
        )
          throw Error();
        for (const a of h.applicability ?? [])
          guideHandoffs = assessGuideInput(
            guideHandoffs,
            h.id,
            h.subject,
            a.conclusion,
            a.rationale,
            a.at,
          );
      }
      if (!sameKnowledgeValue(guideHandoffs, s.brief.guideHandoffs))
        throw Error();
    }
    let brief: BriefHandoffState = { versions: [] };
    for (const v of s.brief.versions) {
      if (
        !shape(v, [
          "version",
          "body",
          "deliveredAt",
          "receipt",
          "guideInput",
        ]) ||
        !text(v.body, 6000) ||
        !date(v.deliveredAt)
      )
        throw Error();
      if (v.guideInput) {
        const input = v.guideInput;
        if (
          ![
            "forge.knowledge-workspace.v8",
            "forge.knowledge-workspace.v9",
            "forge.knowledge-workspace.v10",
            "forge.knowledge-workspace.v11",
            "forge.knowledge-workspace.v12",
            "forge.knowledge-workspace.v13",
            "forge.knowledge-workspace.v14",
          ].includes(x.format) ||
          !Number.isInteger(input.handoffCount) ||
          input.handoffCount < 1 ||
          input.handoffCount > guideHandoffs.length ||
          !Number.isInteger(input.decisionCount) ||
          input.decisionCount < 1
        )
          throw Error();
        const prefix = guideHandoffs.slice(0, input.handoffCount),
          last = prefix.at(-1)!;
        if (
          input.decisionCount > (last.applicability?.length ?? 0) ||
          last
            .applicability!.slice(input.decisionCount)
            .some((a) => Date.parse(a.at) < Date.parse(v.deliveredAt)) ||
          last.briefCount > brief.versions.length ||
          guideHandoffs
            .slice(input.handoffCount)
            .some((h) => h.briefCount <= brief.versions.length)
        )
          throw Error();
        prefix[prefix.length - 1] = {
          ...last,
          applicability: last.applicability!.slice(0, input.decisionCount),
        };
        brief = deliverBrief(
          { ...brief, guideHandoffs: prefix },
          v.body,
          v.deliveredAt,
          input.subject,
        );
      } else {
        if (
          guideHandoffs.length &&
          brief.versions.length >= guideHandoffs[0].briefCount
        )
          throw Error();
        const { guideHandoffs: ignored, ...unlinked } = brief;
        brief = deliverBrief(unlinked, v.body, v.deliveredAt);
      }
      if (v.receipt) {
        if (!shape(v.receipt, ["id", "at"]) || !date(v.receipt.at))
          throw Error();
        brief = receiveBrief(brief, v.version, v.receipt.at);
      }
    }
    if (guideHandoffs.length) brief = { ...brief, guideHandoffs };
    if (!sameKnowledgeValue(brief, s.brief)) throw Error();
    let adoptions: AgreementAdoption[] = [];
    for (const a of s.adoptions) {
      if (
        !object(a) ||
        !text(a.audience, 500) ||
        !text(a.rationale) ||
        !date(a.at)
      )
        throw Error();
      adoptions = adoptAgreement(
        adoptions,
        a.versionId,
        a.audience,
        a.rationale,
        a.at,
      );
    }
    if (!sameKnowledgeValue(adoptions, s.adoptions)) throw Error();
    if (
      (s.contribution.contributions.some((c: any) => c.revisionRequest) ||
        (s.use &&
          (useVersion(s.use.subject)! > 2 ||
            s.use.previousMaterials !== undefined))) &&
      ![
        "forge.knowledge-workspace.v6",
        "forge.knowledge-workspace.v7",
        "forge.knowledge-workspace.v8",
        "forge.knowledge-workspace.v9",
        "forge.knowledge-workspace.v10",
        "forge.knowledge-workspace.v11",
        "forge.knowledge-workspace.v12",
        "forge.knowledge-workspace.v13",
        "forge.knowledge-workspace.v14",
      ].includes(x.format)
    )
      throw Error();
    if (s.use !== undefined) {
      const u = s.use;
      if (
        !shape(u, [
          "goalReviews",
          "reviewHandoffs",
          "authorityHistory",
          "previousMaterials",
          "cycle",
          "previousCycle",
          "continuation",
          "subject",
          "audience",
          "mandate",
          "publicationAssessment",
          "authorization",
          "execution",
          "readerEvidence",
          "outcome",
        ]) ||
        !text(u.audience, 500) ||
        !object(u.mandate) ||
        !text(u.mandate.rationale) ||
        !date(u.mandate.at)
      )
        throw Error();
      const subject = validateSubject(u.subject);
      if (u.previousMaterials !== undefined) {
        if (
          ![
            "forge.knowledge-workspace.v6",
            "forge.knowledge-workspace.v7",
            "forge.knowledge-workspace.v8",
            "forge.knowledge-workspace.v9",
            "forge.knowledge-workspace.v10",
            "forge.knowledge-workspace.v11",
            "forge.knowledge-workspace.v12",
            "forge.knowledge-workspace.v13",
            "forge.knowledge-workspace.v14",
          ].includes(x.format) ||
          !Array.isArray(u.previousMaterials) ||
          !u.previousMaterials.length ||
          u.previousMaterials.length > 7
        )
          throw Error();
        let previousVersion = 1,
          previousAt = 0;
        for (const prior of [...u.previousMaterials, u]) {
          const version = useVersion(prior.subject);
          if (
            !version ||
            version <= previousVersion ||
            Date.parse(prior.mandate?.at) < previousAt
          )
            throw Error();
          if (prior !== u) {
            if (prior.previousMaterials !== undefined) throw Error();
            parseKnowledgeCheckpoint(
              JSON.stringify({
                format: x.format,
                savedAt: x.savedAt,
                state: {
                  contribution: s.contribution,
                  brief: { versions: [] },
                  adoptions: [],
                  use: prior,
                },
              }),
            );
          }
          previousVersion = version;
          previousAt = latestUseTime(prior);
        }
      }
      let rebuilt = allocateUseMandate(
        subject,
        u.audience,
        u.mandate.rationale,
        u.mandate.at,
      )!;
      if (
        u.cycle !== undefined ||
        u.previousCycle !== undefined ||
        u.continuation !== undefined
      ) {
        if (
          ![
            "forge.knowledge-workspace.v3",
            "forge.knowledge-workspace.v4",
            "forge.knowledge-workspace.v5",
            "forge.knowledge-workspace.v6",
            "forge.knowledge-workspace.v7",
            "forge.knowledge-workspace.v8",
            "forge.knowledge-workspace.v9",
            "forge.knowledge-workspace.v10",
            "forge.knowledge-workspace.v11",
            "forge.knowledge-workspace.v12",
            "forge.knowledge-workspace.v13",
            "forge.knowledge-workspace.v14",
          ].includes(x.format) ||
          u.cycle !== 2 ||
          !shape(u.previousCycle, [
            "goalReviews",
            "reviewHandoffs",
            "authorityHistory",
            "subject",
            "audience",
            "mandate",
            "publicationAssessment",
            "authorization",
            "execution",
            "readerEvidence",
            "outcome",
          ]) ||
          !object(u.continuation) ||
          !text(u.continuation.rationale) ||
          !date(u.continuation.at)
        )
          throw Error();
        parseKnowledgeCheckpoint(
          JSON.stringify({
            format: [
              "forge.knowledge-workspace.v6",
              "forge.knowledge-workspace.v7",
              "forge.knowledge-workspace.v8",
              "forge.knowledge-workspace.v9",
              "forge.knowledge-workspace.v10",
              "forge.knowledge-workspace.v11",
              "forge.knowledge-workspace.v12",
              "forge.knowledge-workspace.v13",
              "forge.knowledge-workspace.v14",
            ].includes(x.format)
              ? x.format
              : s.contribution.handoffs
                ? "forge.knowledge-workspace.v5"
                : s.contribution.responsibility
                  ? "forge.knowledge-workspace.v4"
                  : "forge.knowledge-workspace.v1",
            savedAt: x.savedAt,
            state: {
              contribution: s.contribution,
              brief: { versions: [] },
              adoptions: [],
              use: u.previousCycle,
            },
          }),
        );
        rebuilt = continueUse(
          u.previousCycle,
          subject,
          u.audience,
          u.continuation.rationale,
          u.continuation.at,
        );
      }
      if (
        u.authorityHistory !== undefined &&
        (![
          "forge.knowledge-workspace.v7",
          "forge.knowledge-workspace.v8",
          "forge.knowledge-workspace.v9",
          "forge.knowledge-workspace.v10",
          "forge.knowledge-workspace.v11",
          "forge.knowledge-workspace.v12",
          "forge.knowledge-workspace.v13",
          "forge.knowledge-workspace.v14",
        ].includes(x.format) ||
          !Array.isArray(u.authorityHistory) ||
          !u.authorityHistory.length ||
          u.authorityHistory.length > 20)
      )
        throw Error();
      if (
        u.reviewHandoffs !== undefined &&
        (![
          "forge.knowledge-workspace.v9",
          "forge.knowledge-workspace.v10",
          "forge.knowledge-workspace.v11",
          "forge.knowledge-workspace.v12",
          "forge.knowledge-workspace.v13",
          "forge.knowledge-workspace.v14",
        ].includes(x.format) ||
          !Array.isArray(u.reviewHandoffs) ||
          !u.reviewHandoffs.length ||
          u.reviewHandoffs.length > 40)
      )
        throw Error();
      let roleCursor = 0;
      const replayRoles = () => {
        while (roleCursor < (u.reviewHandoffs?.length ?? 0)) {
          const e = u.reviewHandoffs[roleCursor];
          if (
            e.afterRecordId !== reviewAnchor(rebuilt) ||
            e.controlCount !== (rebuilt.authorityHistory?.length ?? 0)
          )
            break;
          rebuilt =
            e.action === "Proposed"
              ? proposeReviewHandoff(
                  rebuilt,
                  subject,
                  e.role,
                  e.to,
                  e.rationale,
                  e.at,
                )
              : respondReviewHandoff(
                  rebuilt,
                  subject,
                  e.actor,
                  e.action,
                  e.rationale,
                  e.at,
                  e.acknowledged === true,
                );
          roleCursor++;
        }
      };
      replayRoles();
      for (const [key, field] of [
        ["publicationAssessment", "conclusion"],
        ["authorization", "decision"],
        ["execution", "result"],
        ["readerEvidence", "kind"],
        ["outcome", "conclusion"],
      ] as const) {
        const record = u[key];
        if (record !== undefined) {
          if (!object(record) || !text(record.rationale) || !date(record.at))
            throw Error();
          rebuilt = recordUseStep(
            rebuilt,
            subject,
            record[field] as UseAction,
            record.rationale,
            record.at,
            decisionActorId(record.actor),
          );
          replayRoles();
          for (const event of u.authorityHistory ?? []) {
            if (event.afterRecordId === record.id) {
              rebuilt = controlAuthority(
                rebuilt,
                event.action,
                event.rationale,
                event.conditions,
                event.at,
                decisionActorId(event.actor) as any,
              );
              replayRoles();
            }
          }
        }
      }
      if (roleCursor !== (u.reviewHandoffs?.length ?? 0)) throw Error();
      if (u.goalReviews !== undefined) {
        if (
          ![
            "forge.knowledge-workspace.v10",
            "forge.knowledge-workspace.v11",
            "forge.knowledge-workspace.v12",
            "forge.knowledge-workspace.v13",
            "forge.knowledge-workspace.v14",
          ].includes(x.format) ||
          !Array.isArray(u.goalReviews) ||
          !u.goalReviews.length ||
          u.goalReviews.length > 10
        )
          throw Error();
        for (const r of u.goalReviews) {
          const task = r.followUp;
          rebuilt = reviewGoal(
            rebuilt,
            subject,
            r.decision,
            r.rationale,
            r.limitations,
            r.at,
            task
              ? {
                  title: task.title,
                  assignee: task.assignee,
                  expectedResult: task.expectedResult,
                }
              : undefined,
          );
          if (task?.response)
            rebuilt = respondGoalTask(
              rebuilt,
              subject,
              task.response.actor,
              task.response.decision,
              task.response.rationale,
              task.response.at,
              task.response.acknowledged === true,
            );
          if (task?.delivery)
            rebuilt = deliverGoalTask(
              rebuilt,
              subject,
              task.delivery.actor,
              task.delivery.body,
              task.delivery.at,
            );
          if (task?.review)
            rebuilt = assessGoalTask(
              rebuilt,
              subject,
              task.review.decision,
              task.review.rationale,
              task.review.at,
            );
          if (task?.cancellation)
            rebuilt = cancelGoalTask(
              rebuilt,
              task.cancellation.rationale,
              task.cancellation.at,
            );
        }
      }
      if (u.previousMaterials)
        rebuilt = { ...rebuilt, previousMaterials: u.previousMaterials };
      if (!sameKnowledgeValue(rebuilt, u)) throw Error();
      // A stale source is valid history: preserve it and let the shared projection block continuation.
    }
    if (
      s.applicability !== undefined ||
      x.format === "forge.knowledge-workspace.v2"
    ) {
      if (
        !Array.isArray(s.applicability) ||
        s.applicability.length > 100 ||
        (s.applicability.length &&
          ![
            "forge.knowledge-workspace.v2",
            "forge.knowledge-workspace.v3",
            "forge.knowledge-workspace.v4",
            "forge.knowledge-workspace.v5",
            "forge.knowledge-workspace.v6",
            "forge.knowledge-workspace.v7",
            "forge.knowledge-workspace.v8",
            "forge.knowledge-workspace.v9",
            "forge.knowledge-workspace.v10",
            "forge.knowledge-workspace.v11",
            "forge.knowledge-workspace.v12",
            "forge.knowledge-workspace.v13",
            "forge.knowledge-workspace.v14",
          ].includes(x.format))
      )
        throw Error();
      let checks: ApplicabilityCheck[] = [];
      for (const check of s.applicability) {
        if (
          !object(check) ||
          !shape(check.context, ["contribution", "use"]) ||
          !object(check.source) ||
          !text(check.rationale) ||
          !date(check.at)
        )
          throw Error();
        parseKnowledgeCheckpoint(
          JSON.stringify({
            format: [
              "forge.knowledge-workspace.v6",
              "forge.knowledge-workspace.v7",
              "forge.knowledge-workspace.v8",
              "forge.knowledge-workspace.v9",
              "forge.knowledge-workspace.v10",
              "forge.knowledge-workspace.v11",
              "forge.knowledge-workspace.v12",
              "forge.knowledge-workspace.v13",
              "forge.knowledge-workspace.v14",
            ].includes(x.format)
              ? x.format
              : check.context.contribution?.handoffs
                ? "forge.knowledge-workspace.v5"
                : check.context.contribution?.responsibility
                  ? "forge.knowledge-workspace.v4"
                  : check.context.use?.cycle === 2
                    ? "forge.knowledge-workspace.v3"
                    : "forge.knowledge-workspace.v1",
            savedAt: x.savedAt,
            state: { ...check.context, brief: { versions: [] }, adoptions: [] },
          }),
        );
        const adoption = adoptions.find((a) => a.id === check.adoptionId);
        checks = recordApplicability(
          checks,
          adoption,
          check.context,
          check.source.kind,
          check.conclusion,
          check.rationale,
          check.at,
        );
      }
      if (!sameKnowledgeValue(checks, s.applicability)) throw Error();
    }
    if (s.caseEvents !== undefined) {
      if (
        ![
          "forge.knowledge-workspace.v11",
          "forge.knowledge-workspace.v12",
          "forge.knowledge-workspace.v13",
          "forge.knowledge-workspace.v14",
        ].includes(x.format) ||
        !Array.isArray(s.caseEvents) ||
        !s.caseEvents.length ||
        s.caseEvents.length > 40
      )
        throw Error();
      let events: CaseEvent[] = [];
      for (const event of s.caseEvents) {
        if (
          !shape(event.context, ["brief", "contribution"]) ||
          !text(event.rationale) ||
          !date(event.at)
        )
          throw Error();
        parseKnowledgeCheckpoint(
          JSON.stringify({
            format: "forge.knowledge-workspace.v11",
            savedAt: x.savedAt,
            state: { ...event.context, adoptions: [] },
          }),
        );
        if (!retainsBriefs(event.context.brief, s.brief)) throw Error();
        events = recordCaseEvent(
          events,
          event.context,
          event.actor,
          event.action,
          event.rationale,
          event.at,
        );
      }
      if (!sameKnowledgeValue(events, s.caseEvents)) throw Error();
    }
    if (s.workshopEvents !== undefined) {
      if (
        ![
          "forge.knowledge-workspace.v12",
          "forge.knowledge-workspace.v13",
          "forge.knowledge-workspace.v14",
        ].includes(x.format) ||
        !Array.isArray(s.workshopEvents) ||
        !s.workshopEvents.length ||
        s.workshopEvents.length > 40
      )
        throw Error();
      let events: WorkshopEvent[] = [];
      for (const e of s.workshopEvents) {
        if (
          (e.allocation || e.handoffId) &&
          x.format !== "forge.knowledge-workspace.v14"
        )
          throw Error();
        if (
          !shape(e.context, ["brief", "contribution", "caseEvents"]) ||
          !Array.isArray(e.context.caseEvents) ||
          !text(e.body) ||
          !date(e.at)
        )
          throw Error();
        parseKnowledgeCheckpoint(
          JSON.stringify({
            format: "forge.knowledge-workspace.v12",
            savedAt: x.savedAt,
            state: {
              brief: e.context.brief,
              contribution: e.context.contribution,
              adoptions: [],
              ...(e.context.caseEvents.length
                ? { caseEvents: e.context.caseEvents }
                : {}),
            },
          }),
        );
        if (
          !retainsBriefs(e.context.brief, s.brief) ||
          !sameKnowledgeValue(
            e.context.caseEvents,
            (s.caseEvents ?? []).slice(0, e.context.caseEvents.length),
          )
        )
          throw Error();
        events = recordWorkshopEvent(
          events,
          e.context,
          e.actor,
          e.action,
          e.body,
          e.at,
          e.allocation,
        );
      }
      if (!sameKnowledgeValue(events, s.workshopEvents)) throw Error();
    }
    if (s.patternEvents !== undefined) {
      if (
        ![
          "forge.knowledge-workspace.v13",
          "forge.knowledge-workspace.v14",
        ].includes(x.format) ||
        !Array.isArray(s.patternEvents) ||
        !s.patternEvents.length ||
        s.patternEvents.length > 20
      )
        throw Error();
      let events: PatternEvent[] = [];
      for (const e of s.patternEvents) {
        if (
          e.context.workshopEvents?.some(
            (w: any) => w.allocation || w.handoffId,
          ) &&
          x.format !== "forge.knowledge-workspace.v14"
        )
          throw Error();
        if (
          !shape(e.context, [
            "contribution",
            "brief",
            "adoptions",
            "use",
            "applicability",
            "caseEvents",
            "workshopEvents",
          ]) ||
          !text(e.rationale) ||
          !date(e.at)
        )
          throw Error();
        parseKnowledgeCheckpoint(
          JSON.stringify({
            format: "forge.knowledge-workspace.v14",
            savedAt: x.savedAt,
            state: e.context,
          }),
        );
        events = recordPatternEvent(
          events,
          e.context,
          e.actor,
          e.action,
          e.stream,
          e.version,
          e.work?.id ?? "",
          e.rationale,
          e.at,
        );
      }
      if (!sameKnowledgeValue(events, s.patternEvents)) throw Error();
    }
    return x;
  } catch {
    throw Error(
      "Invalid or unsupported Knowledge workspace checkpoint. Current work is unchanged.",
    );
  }
}
export function encodeKnowledgeCheckpoint(state: KnowledgeWorkspace) {
  const encodedState = { ...state };
  if (!state.applicability?.length) delete encodedState.applicability;
  if (!state.caseEvents?.length) delete encodedState.caseEvents;
  if (!state.workshopEvents?.length) delete encodedState.workshopEvents;
  if (!state.patternEvents?.length) delete encodedState.patternEvents;
  const raw = JSON.stringify({
    format: [
      ...(state.workshopEvents ?? []),
      ...(state.patternEvents ?? []).flatMap(
        (e) => e.context.workshopEvents ?? [],
      ),
    ].some((e) => e.allocation || e.handoffId)
      ? "forge.knowledge-workspace.v14"
      : state.patternEvents?.length
        ? "forge.knowledge-workspace.v13"
        : state.workshopEvents?.length
          ? "forge.knowledge-workspace.v12"
          : state.caseEvents?.length
            ? "forge.knowledge-workspace.v11"
            : hasGoalReviews(state.use) ||
                state.applicability?.some((c) => hasGoalReviews(c.context.use))
              ? "forge.knowledge-workspace.v10"
              : hasReviewHandoffs(state.use) ||
                  state.applicability?.some((c) =>
                    hasReviewHandoffs(c.context.use),
                  )
                ? "forge.knowledge-workspace.v9"
                : state.brief.guideHandoffs ||
                    state.brief.versions.some((v) => v.guideInput)
                  ? "forge.knowledge-workspace.v8"
                  : hasAuthorityHistory(state.use) ||
                      state.applicability?.some((c) =>
                        hasAuthorityHistory(c.context.use),
                      )
                    ? "forge.knowledge-workspace.v7"
                    : state.contribution.contributions.some(
                          (c) => c.revisionRequest,
                        ) ||
                        (state.use &&
                          (useVersion(state.use.subject)! > 2 ||
                            state.use.previousMaterials)) ||
                        state.applicability?.some(
                          (c) =>
                            c.context.contribution.contributions.some(
                              (v) => v.revisionRequest,
                            ) ||
                            (c.context.use &&
                              (useVersion(c.context.use.subject)! > 2 ||
                                c.context.use.previousMaterials)),
                        )
                      ? "forge.knowledge-workspace.v6"
                      : state.contribution.handoffs ||
                          state.applicability?.some(
                            (c) => c.context.contribution.handoffs,
                          )
                        ? "forge.knowledge-workspace.v5"
                        : state.contribution.responsibility ||
                            state.applicability?.some(
                              (c) => c.context.contribution.responsibility,
                            )
                          ? "forge.knowledge-workspace.v4"
                          : state.use?.cycle === 2 ||
                              state.applicability?.some(
                                (c) => c.context.use?.cycle === 2,
                              )
                            ? "forge.knowledge-workspace.v3"
                            : state.applicability?.length
                              ? "forge.knowledge-workspace.v2"
                              : "forge.knowledge-workspace.v1",
    savedAt: new Date().toISOString(),
    state: encodedState,
  });
  parseKnowledgeCheckpoint(raw);
  return raw;
}
export function parseKnowledgeImport(raw: string): KnowledgeImport {
  if (raw.length > 4_000_000) throw Error("Checkpoint exceeds the 4 MB limit.");
  const format = JSON.parse(raw)?.format;
  if (
    format === "forge.knowledge-contribution.v1" ||
    format === "forge.knowledge-contribution.v2" ||
    format === "forge.knowledge-contribution.v3" ||
    format === "forge.knowledge-contribution.v4" ||
    format === "forge.knowledge-contribution.v5" ||
    format === "forge.knowledge-contribution.v6"
  ) {
    const c = parseContributionCheckpoint(raw);
    return { kind: "contribution", contribution: c.state, savedAt: c.savedAt };
  }
  return { kind: "workspace", checkpoint: parseKnowledgeCheckpoint(raw) };
}
export function replaceKnowledge(
  current: KnowledgeWorkspace,
  incoming: KnowledgeImport,
): KnowledgeWorkspace {
  return incoming.kind === "workspace"
    ? incoming.checkpoint.state
    : { ...current, contribution: incoming.contribution };
}

function hasAuthorityHistory(use?: AuthorizedUse): boolean {
  return (
    !!use &&
    (!!use.authorityHistory ||
      !!use.previousCycle?.authorityHistory ||
      !!use.previousMaterials?.some(hasAuthorityHistory))
  );
}

function hasReviewHandoffs(use?: AuthorizedUse): boolean {
  return (
    !!use &&
    (!!use.reviewHandoffs ||
      !!use.previousCycle?.reviewHandoffs ||
      !!use.previousMaterials?.some(hasReviewHandoffs))
  );
}

function hasGoalReviews(use?: AuthorizedUse): boolean {
  return (
    !!use &&
    (!!use.goalReviews ||
      !!use.previousCycle?.goalReviews ||
      !!use.previousMaterials?.some(hasGoalReviews))
  );
}

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
  type AuthorizedUse,
  type UseAction,
} from "./authorizedUse";
export type KnowledgeWorkspace = {
  contribution: HumanContributionState;
  brief: BriefHandoffState;
  adoptions: AgreementAdoption[];
  use?: AuthorizedUse;
  applicability?: ApplicabilityCheck[];
};
export type KnowledgeCheckpoint = {
  format:
    | "forge.knowledge-workspace.v1"
    | "forge.knowledge-workspace.v2"
    | "forge.knowledge-workspace.v3"
    | "forge.knowledge-workspace.v4"
    | "forge.knowledge-workspace.v5"
    | "forge.knowledge-workspace.v6";
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
      ].includes(x.format) ||
      !date(x.savedAt) ||
      !shape(x.state, [
        "contribution",
        "brief",
        "adoptions",
        "use",
        "applicability",
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
      ].includes(x.format)
    )
      throw Error();
    if (
      s.contribution.handoffs &&
      ![
        "forge.knowledge-workspace.v5",
        "forge.knowledge-workspace.v6",
      ].includes(x.format)
    )
      throw Error();
    if (
      !shape(s.brief, ["versions"]) ||
      !Array.isArray(s.brief.versions) ||
      s.brief.versions.length > 200 ||
      !Array.isArray(s.adoptions) ||
      s.adoptions.length > 200
    )
      throw Error();
    let brief: BriefHandoffState = { versions: [] };
    for (const v of s.brief.versions) {
      if (
        !shape(v, ["version", "body", "deliveredAt", "receipt"]) ||
        !text(v.body, 6000) ||
        !date(v.deliveredAt)
      )
        throw Error();
      brief = deliverBrief(brief, v.body, v.deliveredAt);
      if (v.receipt) {
        if (!shape(v.receipt, ["id", "at"]) || !date(v.receipt.at))
          throw Error();
        brief = receiveBrief(brief, v.version, v.receipt.at);
      }
    }
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
      x.format !== "forge.knowledge-workspace.v6"
    )
      throw Error();
    if (s.use !== undefined) {
      const u = s.use;
      if (
        !shape(u, [
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
          x.format !== "forge.knowledge-workspace.v6" ||
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
                format: "forge.knowledge-workspace.v6",
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
          ].includes(x.format) ||
          u.cycle !== 2 ||
          !shape(u.previousCycle, [
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
            format:
              x.format === "forge.knowledge-workspace.v6"
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
            format:
              x.format === "forge.knowledge-workspace.v6"
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
  const raw = JSON.stringify({
    format:
      state.contribution.contributions.some((c) => c.revisionRequest) ||
      (state.use &&
        (useVersion(state.use.subject)! > 2 || state.use.previousMaterials)) ||
      state.applicability?.some(
        (c) =>
          c.context.contribution.contributions.some((v) => v.revisionRequest) ||
          (c.context.use &&
            (useVersion(c.context.use.subject)! > 2 ||
              c.context.use.previousMaterials)),
      )
        ? "forge.knowledge-workspace.v6"
        : state.contribution.handoffs ||
            state.applicability?.some((c) => c.context.contribution.handoffs)
          ? "forge.knowledge-workspace.v5"
          : state.contribution.responsibility ||
              state.applicability?.some(
                (c) => c.context.contribution.responsibility,
              )
            ? "forge.knowledge-workspace.v4"
            : state.use?.cycle === 2 ||
                state.applicability?.some((c) => c.context.use?.cycle === 2)
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

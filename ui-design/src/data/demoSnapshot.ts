import { evidenceFor } from "./evidence";
import { reviewRequirements } from "./requirements";
import { assignments } from "./assignments";
import { proposalRequirements } from "./responsibilityProposals";
import type { ResponsibilityProposal } from "./responsibilityProposals";
import type { ResponseRecord } from "./models";
import type { DraftSnapshot } from "../useResponseDrafts";
export const demoStorageKey = "forge-ui-demo-snapshot-v1";
export type DemoSnapshot = {
  format: "forge-ui-demo";
  version: 1;
  scope: "main-sample";
  savedAt: string;
  drafts: DraftSnapshot;
  receipts: ResponseRecord[];
  proposals: Record<string, ResponsibilityProposal>;
};
const obj = (x: unknown): x is Record<string, any> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const str = (x: unknown): x is string =>
  typeof x === "string" && x.length <= 1000000;
const strings = (x: unknown): x is string[] =>
  Array.isArray(x) && x.length <= 100 && x.every(str);
const date = (x: unknown) => str(x) && Number.isFinite(Date.parse(x));
const keys = (x: Record<string, any>, allowed: string[]) =>
  Object.keys(x).every((k) => allowed.includes(k));
const responseKinds = (id: string) => {
  const kind = assignments.find((a) => a.id === id)?.kind;
  return kind === "Authority"
    ? ["Approval", "Refusal"]
    : kind === "Assessment"
      ? ["Assessment"]
      : kind === "Work"
        ? ["Contribution"]
        : kind === "Reconciliation"
          ? ["Reconciliation"]
          : [];
};
const safeKeys = (value: unknown): boolean =>
  !value ||
  typeof value !== "object" ||
  Object.entries(value).every(
    ([key, nested]) =>
      !["__proto__", "constructor", "prototype"].includes(key) &&
      safeKeys(nested),
  );
const assignment = (id: string) => assignments.some((a) => a.id === id);
const evidence = (x: unknown) =>
  obj(x) &&
  keys(x, ["id", "title", "assignmentId"]) &&
  str(x.id) &&
  str(x.title) &&
  assignment(x.assignmentId) &&
  evidenceFor(x.assignmentId).some((e) => e.id === x.id && e.title === x.title);
const statuses = [
  "Not reviewed",
  "Meets criterion",
  "Needs changes",
  "Insufficient evidence",
];
export function parseDemoSnapshot(raw: string): DemoSnapshot {
  if (raw.length > 1000000)
    throw new Error("Snapshot exceeds the 1 MB demo limit.");
  let x: any;
  try {
    x = JSON.parse(raw);
  } catch {
    throw new Error("File is not valid JSON.");
  }
  if (!safeKeys(x))
    throw new Error("Invalid snapshot keys. Nothing was replaced.");
  const fail = () => {
    throw new Error(
      "Unsupported or invalid main-sample snapshot. Nothing was replaced.",
    );
  };
  if (
    !obj(x) ||
    !keys(x, [
      "format",
      "version",
      "scope",
      "savedAt",
      "drafts",
      "receipts",
      "proposals",
    ]) ||
    x.format !== "forge-ui-demo" ||
    x.version !== 1 ||
    x.scope !== "main-sample" ||
    !date(x.savedAt)
  )
    return fail();
  const d = x.drafts;
  if (
    !obj(d) ||
    !keys(d, [
      "text",
      "assessmentConclusion",
      "assessmentEvidence",
      "criterionReviews",
      "reconciliationConclusion",
    ]) ||
    !obj(d.text) ||
    !strings(d.assessmentEvidence) ||
    !d.assessmentEvidence.every((id: string) =>
      evidenceFor("A-1042").some((e) => e.id === id),
    ) ||
    !obj(d.criterionReviews) ||
    ![
      "",
      "Meets criteria",
      "Changes requested",
      "Insufficient evidence",
    ].includes(d.assessmentConclusion) ||
    !["", "Still undetermined"].includes(d.reconciliationConclusion)
  )
    return fail();
  for (const [id, values] of Object.entries(d.text))
    if (
      !assignment(id) ||
      !obj(values) ||
      !Object.entries(values).every(
        ([kind, text]) => responseKinds(id).includes(kind) && str(text),
      )
    )
      return fail();
  for (const [id, r] of Object.entries(d.criterionReviews))
    if (
      !reviewRequirements.criteria.some((c) => c.id === id) ||
      !obj(r) ||
      !keys(r, ["status", "note", "evidenceIds"]) ||
      !statuses.includes(r.status) ||
      !str(r.note) ||
      !strings(r.evidenceIds) ||
      !r.evidenceIds.every((id: string) =>
        evidenceFor("A-1042").some((e) => e.id === id),
      )
    )
      return fail();
  if (
    !Array.isArray(x.receipts) ||
    x.receipts.length > assignments.length ||
    !obj(x.proposals)
  )
    return fail();
  const ids = new Set<string>();
  for (const r of x.receipts) {
    if (
      !obj(r) ||
      !keys(r, [
        "id",
        "assignmentId",
        "decision",
        "recordedAt",
        "actor",
        "role",
        "permission",
        "rationale",
        "subject",
        "prerequisites",
        "assessment",
        "reconciliation",
      ]) ||
      !assignment(r.assignmentId) ||
      !responseKinds(r.assignmentId).includes(r.decision) ||
      ids.has(r.assignmentId) ||
      !["id", "decision", "actor", "role", "permission", "rationale"].every(
        (k) => str(r[k]),
      ) ||
      !date(r.recordedAt) ||
      !obj(r.subject) ||
      !keys(r.subject, ["label", "digest", "target"]) ||
      !str(r.subject.label) ||
      ["digest", "target"].some(
        (k) => r.subject[k] !== undefined && !str(r.subject[k]),
      ) ||
      (r.prerequisites !== undefined && !str(r.prerequisites))
    )
      return fail();
    ids.add(r.assignmentId);
    if (r.assessment !== undefined) {
      const a = r.assessment;
      if (
        r.assignmentId !== "A-1042" ||
        !obj(a) ||
        !keys(a, ["conclusion", "evidence", "criteria"]) ||
        ![
          "Meets criteria",
          "Changes requested",
          "Insufficient evidence",
        ].includes(a.conclusion) ||
        !Array.isArray(a.evidence) ||
        !a.evidence.every(evidence)
      )
        return fail();
      if (
        a.criteria !== undefined &&
        (!Array.isArray(a.criteria) ||
          !a.criteria.every(
            (c: any) =>
              obj(c) &&
              keys(c, [
                "id",
                "title",
                "detail",
                "expectedEvidence",
                "status",
                "note",
                "evidence",
              ]) &&
              ["id", "title", "detail", "expectedEvidence", "note"].every((k) =>
                str(c[k]),
              ) &&
              reviewRequirements.criteria.some(
                (criterion) => criterion.id === c.id,
              ) &&
              statuses.includes(c.status) &&
              Array.isArray(c.evidence) &&
              c.evidence.every(evidence),
          ))
      )
        return fail();
    }
    if (r.reconciliation !== undefined) {
      const v = r.reconciliation;
      if (
        r.assignmentId !== "A-1035" ||
        !obj(v) ||
        !keys(v, [
          "conclusion",
          "target",
          "expected",
          "expectedDigest",
          "observed",
          "missing",
        ]) ||
        v.conclusion !== "Still undetermined" ||
        !["target", "expected", "expectedDigest", "observed", "missing"].every(
          (k) => str(v[k]),
        )
      )
        return fail();
    }
  }
  for (const [gap, p] of Object.entries(x.proposals)) {
    const requirement = proposalRequirements[gap];
    if (
      !requirement ||
      !obj(p) ||
      !keys(p, [
        "id",
        "gapId",
        "workerId",
        "role",
        "scope",
        "rationale",
        "proposer",
        "recordedAt",
        "decision",
      ]) ||
      p.gapId !== gap ||
      !requirement.workerIds.includes(p.workerId) ||
      p.role !== requirement.role ||
      p.scope !== requirement.scope ||
      !["id", "rationale", "proposer"].every((k) => str(p[k])) ||
      !date(p.recordedAt)
    )
      return fail();
    if (
      p.decision !== undefined &&
      (!obj(p.decision) ||
        !keys(p.decision, ["outcome", "rationale", "recordedAt", "reviewer"]) ||
        !["Accepted", "Rejected"].includes(p.decision.outcome) ||
        !str(p.decision.rationale) ||
        !str(p.decision.reviewer) ||
        !date(p.decision.recordedAt))
    )
      return fail();
  }
  return x as DemoSnapshot;
}
export function readSavedDemo(): { snapshot?: DemoSnapshot; error?: string } {
  try {
    const raw = localStorage.getItem(demoStorageKey);
    return raw ? { snapshot: parseDemoSnapshot(raw) } : {};
  } catch {
    return {
      error:
        "Saved local demo could not be restored. Start state is unchanged; export or reset from Demo continuity.",
    };
  }
}

import { validateKnowledgeHandoffs } from "./knowledgeHandoff";
import { validateKnowledgeResponsibility } from "./knowledgeResponsibility";
import {
  contributionResponsibility as r,
  type HumanContributionState,
  maxContributionVersions,
  revisionRequest,
} from "./humanContribution";
export const contributionCheckpointKey = "forge-knowledge-contribution-v1";
export type ContributionCheckpoint = {
  format:
    | "forge.knowledge-contribution.v1"
    | "forge.knowledge-contribution.v2"
    | "forge.knowledge-contribution.v3"
    | "forge.knowledge-contribution.v4"
    | "forge.knowledge-contribution.v5";
  savedAt: string;
  state: HumanContributionState;
};
export function parseContributionCheckpoint(
  raw: string,
): ContributionCheckpoint {
  const fail = () => {
    throw new Error(
      "Invalid or unsupported contribution checkpoint. Current work has not been replaced.",
    );
  };
  if (raw.length > 2_000_000) fail();
  const value = JSON.parse(raw);
  const object = (v: any, keys: string[]) =>
    v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.keys(v).every((k) => keys.includes(k));
  const text = (v: any, max = 12000) =>
    typeof v === "string" && v.length <= max;
  const time = (v: any) => text(v, 100) && Number.isFinite(Date.parse(v));
  if (
    !object(value, ["format", "savedAt", "state"]) ||
    ![
      "forge.knowledge-contribution.v1",
      "forge.knowledge-contribution.v2",
      "forge.knowledge-contribution.v3",
      "forge.knowledge-contribution.v4",
      "forge.knowledge-contribution.v5",
    ].includes(value.format) ||
    !time(value.savedAt)
  )
    fail();
  const s = value.state;
  if (
    !object(s, ["contributions", "commands", "responsibility", "handoffs"]) ||
    !Array.isArray(s.contributions) ||
    s.contributions.length < 1 ||
    s.contributions.length >
      ([
        "forge.knowledge-contribution.v3",
        "forge.knowledge-contribution.v4",
        "forge.knowledge-contribution.v5",
      ].includes(value.format)
        ? maxContributionVersions
        : 2) ||
    (s.commands !== undefined &&
      (!Array.isArray(s.commands) || s.commands.length > 100))
  )
    fail();
  if (s.responsibility !== undefined) {
    if (
      ![
        "forge.knowledge-contribution.v4",
        "forge.knowledge-contribution.v5",
      ].includes(value.format)
    )
      fail();
    validateKnowledgeResponsibility(s.responsibility, s);
  }
  if (s.handoffs !== undefined) {
    if (value.format !== "forge.knowledge-contribution.v5") fail();
    validateKnowledgeHandoffs(s);
  }
  for (const [i, c] of s.contributions.entries()) {
    if (
      !object(c, [
        "version",
        "body",
        "note",
        "citesInput",
        "delivery",
        "receipt",
        "assessment",
        "reassessment",
      ]) ||
      c.version !== i + 1 ||
      !text(c.body) ||
      !text(c.note, 3000) ||
      typeof c.citesInput !== "boolean"
    )
      fail();
    for (const field of ["delivery", "receipt", "assessment", "reassessment"])
      if (
        c[field] !== undefined &&
        (!c[field] || typeof c[field] !== "object" || Array.isArray(c[field]))
      )
        fail();
    const d = c.delivery;
    if (
      d &&
      (!object(d, [
        "id",
        "at",
        "body",
        "note",
        "input",
        "respondsTo",
        "performer",
      ]) ||
        d.id !== `human-delivery-v${c.version}` ||
        !time(d.at) ||
        d.body !== c.body ||
        d.note !== c.note ||
        !c.body.trim() ||
        !c.note.trim() ||
        !c.citesInput ||
        d.input !== r.input ||
        (d.performer !== undefined &&
          (!s.handoffs || !["leo", "delegate"].includes(d.performer))) ||
        (i === 0
          ? d.respondsTo !== undefined
          : d.respondsTo !== revisionRequest(s.contributions[i - 1])?.id))
    )
      fail();
    if (
      c.receipt &&
      (!d ||
        !object(c.receipt, ["id", "deliveryId", "at"]) ||
        c.receipt.id !== `human-receipt-v${c.version}` ||
        c.receipt.deliveryId !== d.id ||
        !time(c.receipt.at))
    )
      fail();
    if (
      c.assessment &&
      (i !== 0 ||
        !c.receipt ||
        !object(c.assessment, [
          "id",
          "receiptId",
          "at",
          "conclusion",
          "rationale",
        ]) ||
        c.assessment.id !== "human-assessment-v1" ||
        c.assessment.receiptId !== c.receipt.id ||
        !time(c.assessment.at) ||
        c.assessment.conclusion !== "Revision requested" ||
        !text(c.assessment.rationale) ||
        !c.assessment.rationale.trim())
    )
      fail();
    if (
      c.reassessment &&
      (value.format === "forge.knowledge-contribution.v1" ||
        i === 0 ||
        !c.receipt ||
        !d ||
        !object(c.reassessment, [
          "id",
          "receiptId",
          "deliveryId",
          "assessor",
          "at",
          "conclusion",
          "rationale",
        ]) ||
        c.reassessment.id !== `human-reassessment-v${c.version}` ||
        c.reassessment.receiptId !== c.receipt.id ||
        c.reassessment.deliveryId !== d.id ||
        c.reassessment.assessor !== "Maya" ||
        !time(c.reassessment.at) ||
        !["Suitable for stated scope", "Further revision needed"].includes(
          c.reassessment.conclusion,
        ) ||
        !text(c.reassessment.rationale, 3000) ||
        !c.reassessment.rationale.trim())
    )
      fail();
    if (i > 0 && !revisionRequest(s.contributions[i - 1])) fail();
  }
  const commands = s.commands ?? [];
  for (const [i, c] of commands.entries()) {
    if (
      !object(c, [
        "id",
        "idempotencyKey",
        "contract",
        "expectedRevision",
        "assignment",
        "subject",
        "version",
        "body",
        "note",
        "input",
        "respondsTo",
        "submittedAt",
        "status",
        "rejection",
        "admittedAt",
        "projected",
        "performer",
      ]) ||
      c.id !== `demo-command-${i + 1}` ||
      c.idempotencyKey !== `${c.id}-key` ||
      c.contract !== "human.contribution-submit.draft.v1" ||
      (c.performer !== undefined &&
        (!s.handoffs || !["leo", "delegate"].includes(c.performer))) ||
      !Number.isInteger(c.version) ||
      c.version < 1 ||
      c.version > maxContributionVersions ||
      c.expectedRevision !== `demo-assignment-revision-${c.version}` ||
      c.assignment !== r.assignment ||
      c.subject !== r.subject ||
      c.input !== r.input ||
      !text(c.body) ||
      !c.body.trim() ||
      !text(c.note, 3000) ||
      !c.note.trim() ||
      !time(c.submittedAt) ||
      !["pending", "unknown", "rejected", "admitted"].includes(c.status) ||
      typeof c.projected !== "boolean"
    )
      fail();
    if (
      c.status === "admitted"
        ? !time(c.admittedAt) || c.rejection !== undefined
        : c.admittedAt !== undefined || c.projected
    )
      fail();
    if (
      c.status === "rejected"
        ? !["permission-denied", "revision-conflict"].includes(c.rejection)
        : c.rejection !== undefined
    )
      fail();
    const contribution = s.contributions[c.version - 1];
    if (
      !contribution ||
      (c.version === 1
        ? c.respondsTo !== undefined
        : c.respondsTo !== revisionRequest(s.contributions[c.version - 2])?.id)
    )
      fail();
    if (i && c.version < commands[i - 1].version) fail();
    if (c.status !== "rejected") {
      if (
        c.body !== contribution.body ||
        c.note !== contribution.note ||
        !contribution.citesInput
      )
        fail();
      if (
        c.projected
          ? !contribution.delivery ||
            contribution.delivery.at !== c.admittedAt ||
            contribution.delivery.performer !== c.performer
          : i !== commands.length - 1 ||
            contribution.delivery ||
            c.version !== s.contributions.length
      )
        fail();
      if (
        commands.some(
          (other: any, j: number) =>
            j !== i &&
            other.version === c.version &&
            other.status !== "rejected",
        )
      )
        fail();
    }
  }
  for (const c of s.contributions)
    if (
      c.delivery &&
      commands.filter((cmd: any) => cmd.version === c.version && cmd.projected)
        .length !== 1
    )
      fail();
  return value;
}
export function encodeContributionCheckpoint(state: HumanContributionState) {
  const raw = JSON.stringify({
    format: state.handoffs
      ? "forge.knowledge-contribution.v5"
      : state.responsibility
        ? "forge.knowledge-contribution.v4"
        : state.contributions.length > 2
          ? "forge.knowledge-contribution.v3"
          : state.contributions.some((c) => c.reassessment)
            ? "forge.knowledge-contribution.v2"
            : "forge.knowledge-contribution.v1",
    savedAt: new Date().toISOString(),
    state,
  });
  parseContributionCheckpoint(raw);
  return raw;
}

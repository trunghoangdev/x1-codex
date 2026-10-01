import { useState } from "react";
import type {
  Assignment,
  ResponseRecord,
  CriterionReview,
} from "./data/models";
export function useResponseDrafts(selected: Assignment | null) {
  const [decision, setDecision] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [assessmentConclusion, setAssessmentConclusion] = useState<
    NonNullable<ResponseRecord["assessment"]>["conclusion"] | ""
  >("");
  const [assessmentEvidence, setAssessmentEvidence] = useState<string[]>([]);
  const [reconciliationConclusion, setReconciliationConclusion] = useState<
    "" | "Still undetermined"
  >("");
  const reconciliationForm =
    selected?.id === "A-1035" && decision === "Reconciliation";
  const [criterionReviews, setCriterionReviews] = useState<
    Record<string, CriterionReview>
  >({});
  const hasAssessmentDraft =
    !!assessmentConclusion ||
    assessmentEvidence.length > 0 ||
    Object.values(criterionReviews).some(
      (r) =>
        r.status !== "Not reviewed" || r.note.trim() || r.evidenceIds.length,
    );
  const assessmentForm = selected?.id === "A-1042" && decision === "Assessment";
  const draftEntries = (id: string) => {
    const entries = { ...drafts[id] };
    if (id === "A-1042" && hasAssessmentDraft && !entries.Assessment?.trim())
      entries.Assessment = "Structured assessment draft";
    if (
      id === "A-1035" &&
      reconciliationConclusion &&
      !entries.Reconciliation?.trim()
    )
      entries.Reconciliation = "Structured reconciliation draft";
    return Object.entries(entries);
  };
  const reason =
    selected && decision ? (drafts[selected.id]?.[decision] ?? "") : "";
  function setReason(value: string) {
    if (!selected || !decision) return;
    const id = selected.id,
      kind = decision;
    setDrafts((previous) => ({
      ...previous,
      [id]: { ...previous[id], [kind]: value },
    }));
  }
  function discardDraft(id: string, kind: string) {
    if (
      !window.confirm(
        `Delete the ${kind.toLowerCase()} draft for ${id}? This cannot be undone.`,
      )
    )
      return;
    if (id === "A-1042" && kind === "Assessment") {
      setAssessmentConclusion("");
      setAssessmentEvidence([]);
      setCriterionReviews({});
    }
    if (id === "A-1035" && kind === "Reconciliation")
      setReconciliationConclusion("");
    setDrafts((previous) => {
      const remaining = { ...previous[id] };
      delete remaining[kind];
      return { ...previous, [id]: remaining };
    });
  }
  function clearDrafts(id: string) {
    if (id === "A-1035") setReconciliationConclusion("");
    if (id === "A-1042") {
      setAssessmentConclusion("");
      setAssessmentEvidence([]);
      setCriterionReviews({});
    }
    setDrafts((previous) => {
      const remaining = { ...previous };
      delete remaining[id];
      return remaining;
    });
  }
  return {
    decision,
    setDecision,
    assessmentConclusion,
    setAssessmentConclusion,
    assessmentEvidence,
    setAssessmentEvidence,
    reconciliationConclusion,
    setReconciliationConclusion,
    criterionReviews,
    setCriterionReviews,
    assessmentForm,
    reconciliationForm,
    draftEntries,
    reason,
    setReason,
    discardDraft,
    clearDrafts,
  };
}

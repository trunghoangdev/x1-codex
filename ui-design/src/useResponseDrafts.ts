import { useState } from "react";
import type {
  Assignment,
  ResponseRecord,
  CriterionReview,
} from "./data/models";
export type DraftSnapshot = {
  text: Record<string, Record<string, string>>;
  assessmentConclusion:
    NonNullable<ResponseRecord["assessment"]>["conclusion"] | "";
  assessmentEvidence: string[];
  criterionReviews: Record<string, CriterionReview>;
  reconciliationConclusion: "" | "Still undetermined";
};
export function useResponseDrafts(
  selected: Assignment | null,
  initial?: DraftSnapshot,
) {
  const [decision, setDecision] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(
    initial?.text ?? {},
  );
  const [assessmentConclusion, setAssessmentConclusion] = useState<
    NonNullable<ResponseRecord["assessment"]>["conclusion"] | ""
  >(initial?.assessmentConclusion ?? "");
  const [assessmentEvidence, setAssessmentEvidence] = useState<string[]>(
    initial?.assessmentEvidence ?? [],
  );
  const [reconciliationConclusion, setReconciliationConclusion] = useState<
    "" | "Still undetermined"
  >(initial?.reconciliationConclusion ?? "");
  const reconciliationForm =
    selected?.id === "A-1035" && decision === "Reconciliation";
  const [criterionReviews, setCriterionReviews] = useState<
    Record<string, CriterionReview>
  >(initial?.criterionReviews ?? {});
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
  function restore(snapshot: DraftSnapshot) {
    setDrafts(snapshot.text);
    setAssessmentConclusion(snapshot.assessmentConclusion);
    setAssessmentEvidence(snapshot.assessmentEvidence);
    setCriterionReviews(snapshot.criterionReviews);
    setReconciliationConclusion(snapshot.reconciliationConclusion);
    setDecision(null);
  }
  return {
    snapshot: {
      text: drafts,
      assessmentConclusion,
      assessmentEvidence,
      criterionReviews,
      reconciliationConclusion,
    },
    restore,
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

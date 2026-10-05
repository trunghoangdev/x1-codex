import { Modal } from "./Modal";
import { Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { CriterionAssessment } from "./CriterionAssessment";
import { ReconciliationReview } from "./ReconciliationReview";
import { ResponseSubmission } from "./ResponseSubmission";
import { DemoControls } from "./DemoControls";
import {
  DecisionProblem,
  decisionBlocked,
  ReleaseSubject,
} from "./ReleaseReview";
import { evidenceFor } from "./data/evidence";
import type { Assignment, Readiness } from "./data/models";
import type { useResponseDrafts } from "./useResponseDrafts";
import type { useResponseSubmission } from "./useResponseSubmission";
export function ResponseDialog({
  selected,
  draft,
  readiness,
  setReadiness,
  submission,
}: {
  selected: Assignment;
  draft: ReturnType<typeof useResponseDrafts>;
  readiness: Readiness;
  setReadiness: (value: Readiness) => void;
  submission: ReturnType<typeof useResponseSubmission>;
}) {
  const {
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
    reason,
    setReason,
  } = draft;
  const deliveryLocked =
    submission.state === "sending" || submission.state === "unknown";
  if (!decision) return null;
  return (
    <Modal
      title={`${decision} for ${selected.id}`}
      onClose={() => setDecision(null)}
    >
      {assessmentForm && (
        <nav className="review-jumps" aria-label="Assessment sections">
          <button
            className="button secondary"
            onClick={() =>
              document.getElementById("criterion-assessments")?.focus()
            }
          >
            Review criteria
          </button>
          <button
            className="button secondary"
            onClick={() => document.getElementById("rationale")?.focus()}
          >
            Overall rationale
          </button>
        </nav>
      )}
      <ResponseSubmission submission={submission} />
      <fieldset className="response-form" disabled={deliveryLocked}>
        <div className="modal-kicker">
          <ShieldCheck size={18} />
          {selected.role} · {selected.authority}
        </div>
        <p>
          You are recording a response for <strong>{selected.title}</strong>.
        </p>
        {selected.kind === "Authority" && (
          <>
            <ReleaseSubject />
            <p className="demo-note">
              Prerequisite snapshot: {readiness}. This decision applies only to
              the subject above.
            </p>
          </>
        )}
        {selected.kind === "Authority" && (
          <>
            <DemoControls context="Decision changes">
              <label className="check-scenario">
                Simulate a change before recording
                <select
                  value={decisionBlocked(readiness) ? readiness : "unchanged"}
                  onChange={(e) => setReadiness(e.target.value as Readiness)}
                >
                  <option value="unchanged" disabled>
                    No change
                  </option>
                  <option value="load-error">Review data load failed</option>
                  <option value="stale">Candidate changed</option>
                  <option value="revoked">Authority revoked</option>
                </select>
              </label>
            </DemoControls>
            <DecisionProblem
              state={readiness}
              onReset={() => {
                setReadiness("missing");
                setDecision(null);
              }}
            />
          </>
        )}
        <p className="demo-note">
          Draft kept in this session as you type. Closing this dialog does not
          submit or delete it. Save or export from Demos → Demo continuity to
          retain it after reload.
        </p>
        {reconciliationForm && (
          <>
            <ReconciliationReview />
            <label className="record-filter">
              Reconciliation conclusion (required)
              <select
                aria-label="Reconciliation conclusion"
                value={reconciliationConclusion}
                onChange={(e) =>
                  setReconciliationConclusion(
                    e.target.value as typeof reconciliationConclusion,
                  )
                }
              >
                <option value="">Choose a conclusion</option>
                <option>Still undetermined</option>
                <option disabled>
                  Expected effect confirmed — evidence unavailable
                </option>
                <option disabled>
                  Mismatch established — evidence unavailable
                </option>
              </select>
            </label>
            <p className="demo-note">
              Proposed UI conclusion. Add what remains unknown and the evidence
              needed next in your rationale. This records a response, not a
              successful deployment.
            </p>
          </>
        )}
        {assessmentForm && (
          <fieldset className="assessment-fields">
            <legend>Assessment · proposed sample choices</legend>
            <label>
              Assessment conclusion (required)
              <select
                aria-label="Assessment conclusion"
                value={assessmentConclusion}
                onChange={(e) =>
                  setAssessmentConclusion(
                    e.target.value as typeof assessmentConclusion,
                  )
                }
              >
                <option value="">Choose a conclusion</option>
                <option>Meets criteria</option>
                <option>Changes requested</option>
                <option>Insufficient evidence</option>
              </select>
            </label>
            <p>
              These are UI proposals, not an SF contract. A conclusion does not
              authorize release or verify evidence.
            </p>
            <p>
              Referenced evidence (optional). Select only records you used;
              inspecting a record does not select it.
            </p>
            {evidenceFor(selected.id).map((evidence) => (
              <label key={evidence.id} className="assessment-evidence">
                <input
                  type="checkbox"
                  checked={assessmentEvidence.includes(evidence.id)}
                  onChange={(event) =>
                    setAssessmentEvidence((old) =>
                      event.target.checked
                        ? [...old, evidence.id]
                        : old.filter((id) => id !== evidence.id),
                    )
                  }
                />
                {evidence.id} · {evidence.title}
              </label>
            ))}
            <p>
              No selection will be recorded as “No evidence cited”. References
              remain unverified sample records.
            </p>
          </fieldset>
        )}
        {assessmentForm && (
          <CriterionAssessment
            reviews={criterionReviews}
            onChange={(id, review) =>
              setCriterionReviews((old) => ({ ...old, [id]: review }))
            }
          />
        )}
        <label className="textarea-label" htmlFor="rationale">
          {selected.kind === "Work"
            ? "Contribution and acceptance criteria"
            : "Decision rationale"}{" "}
          <span>Required</span>
        </label>
        <textarea
          id="rationale"
          data-initial-focus
          rows={5}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain your conclusion and cite the evidence you reviewed…"
        />
        <div className="inline-note">
          <LockKeyhole size={17} />
          <p>
            This simulates a record in this browser session. It does not contact
            Forge, authorize a real release, or persist after refresh.
          </p>
        </div>
      </fieldset>
      <div className="modal-actions">
        <button className="button secondary" onClick={() => setDecision(null)}>
          Cancel
        </button>
        <button
          className="button primary"
          disabled={
            deliveryLocked ||
            !reason.trim() ||
            (assessmentForm && !assessmentConclusion) ||
            (reconciliationForm && !reconciliationConclusion) ||
            (selected.kind === "Authority" && decisionBlocked(readiness)) ||
            (decision === "Approval" && readiness !== "ready")
          }
          onClick={submission.send}
        >
          Record {decision.toLowerCase()}
          <Check size={16} />
        </button>
      </div>
    </Modal>
  );
}

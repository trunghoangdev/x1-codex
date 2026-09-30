import { reviewRequirements } from "./data/requirements";
import { evidenceFor } from "./data/evidence";
import type { CriterionReview, CriterionSnapshot } from "./data/models";
export const emptyCriterion: CriterionReview = {
  status: "Not reviewed",
  note: "",
  evidenceIds: [],
};
export function snapshotCriteria(
  reviews: Record<string, CriterionReview>,
): CriterionSnapshot[] {
  return reviewRequirements.criteria.map((criterion) => {
    const review = reviews[criterion.id] ?? emptyCriterion;
    return {
      id: criterion.id,
      title: criterion.title,
      detail: criterion.detail,
      expectedEvidence: criterion.evidence,
      status: review.status,
      note: review.note,
      evidence: evidenceFor("A-1042")
        .filter((e) => review.evidenceIds.includes(e.id))
        .map(({ id, title, assignmentId }) => ({ id, title, assignmentId })),
    };
  });
}
export function CriterionAssessment({
  reviews,
  onChange,
}: {
  reviews: Record<string, CriterionReview>;
  onChange: (id: string, review: CriterionReview) => void;
}) {
  return (
    <section aria-label="Criterion assessments">
      <h3>Review each criterion</h3>
      <p className="demo-note">
        Proposed reviewer observations. Nothing is marked met automatically.
        Unreviewed criteria remain explicit in the receipt; these choices do not
        change the overall conclusion or verify evidence.
      </p>
      {reviewRequirements.criteria.map((criterion) => {
        const review = reviews[criterion.id] ?? emptyCriterion;
        return (
          <fieldset className="assessment-fields" key={criterion.id}>
            <legend>{criterion.title}</legend>
            <p>{criterion.detail}</p>
            <p>Evidence needed: {criterion.evidence}</p>
            <label>
              Status
              <select
                aria-label={`Status for ${criterion.title}`}
                value={review.status}
                onChange={(e) =>
                  onChange(criterion.id, {
                    ...review,
                    status: e.target.value as CriterionReview["status"],
                  })
                }
              >
                <option>Not reviewed</option>
                <option>Meets criterion</option>
                <option>Needs changes</option>
                <option>Insufficient evidence</option>
              </select>
            </label>
            <label>
              Reviewer note
              <textarea
                aria-label={`Note for ${criterion.title}`}
                value={review.note}
                onChange={(e) =>
                  onChange(criterion.id, { ...review, note: e.target.value })
                }
                rows={2}
              />
            </label>
            <p>Referenced sample evidence (optional)</p>
            {evidenceFor("A-1042").map((evidence) => (
              <label className="assessment-evidence" key={evidence.id}>
                <input
                  type="checkbox"
                  aria-label={`${criterion.title}: ${evidence.id}`}
                  checked={review.evidenceIds.includes(evidence.id)}
                  onChange={(event) =>
                    onChange(criterion.id, {
                      ...review,
                      evidenceIds: event.target.checked
                        ? [...review.evidenceIds, evidence.id]
                        : review.evidenceIds.filter((id) => id !== evidence.id),
                    })
                  }
                />
                {evidence.id} · {evidence.title}
              </label>
            ))}
            {!review.evidenceIds.length && (
              <p>No evidence cited for this criterion.</p>
            )}
          </fieldset>
        );
      })}
    </section>
  );
}

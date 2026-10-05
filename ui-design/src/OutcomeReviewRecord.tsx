import { DetailBackButton } from "./DetailPresentation";
import type { OrganizationScenario } from "./data/organizationScenario";
import {
  outcomeReviewRecords,
  readerObservations,
} from "./data/outcomeReviewRecords";

export function OutcomeReviewRecord({
  scenario,
  onBack,
  onSource,
}: {
  scenario: OrganizationScenario;
  onBack: () => void;
  onSource: (path: string) => void;
}) {
  const review = outcomeReviewRecords(scenario, "K-01")[0];
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>
        Back to scenario context
      </DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">K-01 · INDEPENDENT AUTHORED EXAMPLE</div>
          <h1 tabIndex={-1}>Outcome review · {review.id}</h1>
          <p>
            A recorded conclusion about reader usefulness, distinct from
            assignment completion and publication.
          </p>
        </div>
      </div>
      <div className="org-banner">
        <div>
          <h2>Insufficient evidence</h2>
          <p>{review.rationale}</p>
          <p>
            This is an illustrative review and observation, not a live
            evaluation or a change to the current Knowledge fixture.
          </p>
        </div>
      </div>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Reviewed subject and responsibility"
      >
        <h2>Who reviewed what?</h2>
        <p>
          Subject · {review.subject.id} · {review.subject.version}
        </p>
        <p>Audience · {review.subject.audience}</p>
        <p>
          Agreement proposal · {review.agreementVersion} · adoption not recorded
        </p>
        <p>
          Reviewer ·{" "}
          {
            scenario.workers.find((w) => w.id === review.allocation.workerId)
              ?.name
          }
        </p>
        <p>Allocation · {review.allocation.id}</p>
        <p>{review.allocation.mandate}</p>
        <p>
          Reviewed at ·{" "}
          <time dateTime={review.reviewedAt}>{review.reviewedAt}</time> ·
          authored example timestamp
        </p>
        <button className="text-link" onClick={() => onSource("/workers/maya")}>
          Inspect reviewer context
        </button>
        <p>
          <button
            className="text-link"
            onClick={() =>
              onSource("/agreements/K-01?agreementVersion=brief-v1&compare=no")
            }
          >
            Inspect reviewed agreement proposal · brief-v1
          </button>
        </p>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Review evidence and gaps"
      >
        <h2>Evidence considered and still missing</h2>
        {review.criteria.map((c) => (
          <article key={c.criterionId}>
            <h3>Criterion · {c.criterionId}</h3>
            {c.observationIds.map((id) => {
              const observation = readerObservations.find(
                (o) =>
                  o.id === id &&
                  o.subjectId === review.subject.id &&
                  o.subjectVersion === review.subject.version,
              );
              return observation ? (
                <div key={id}>
                  <h3>Observation · {id}</h3>
                  <p>
                    Subject · {observation.subjectId} ·{" "}
                    {observation.subjectVersion}
                  </p>
                  <p>{observation.audience}</p>
                  <p>{observation.finding}</p>
                  <p>
                    Recorded by ·{" "}
                    {
                      scenario.workers.find(
                        (w) => w.id === observation.recordedBy,
                      )?.name
                    }{" "}
                    ·{" "}
                    <time dateTime={observation.observedAt}>
                      {observation.observedAt}
                    </time>
                  </p>
                  <p>{observation.method}</p>
                  <p>Limitations · {observation.limitations}</p>
                </div>
              ) : (
                <p key={id}>
                  {id} · Matching subject/version observation unavailable
                </p>
              );
            })}
            <p>
              <strong>Still missing:</strong> {c.missing}
            </p>
          </article>
        ))}
        <button
          className="text-link"
          onClick={() => onSource("/outcomes/K-01")}
        >
          Inspect original outcome requirements
        </button>
      </section>
      <section
        className="panel org-stream"
        aria-label="Review scope and conclusion limits"
      >
        <h2>What this conclusion establishes</h2>
        <p>{review.boundary}</p>
        <p>
          Even if a guide were published, publication alone would not establish
          reader usefulness. This example records no publication event.
        </p>
        <p>
          Next step: resolve the next-step guidance and gather observations for
          the declared cohort before commissioning another review. Follow-up
          allocation is not represented.
        </p>
      </section>
    </div>
  );
}

import type { OrganizationScenario } from "./data/organizationScenario";
import { agreementVersions } from "./data/workstreamAgreements";
import { outcomeReviewRecords } from "./data/outcomeReviewRecords";
import { operatingPattern } from "./data/operatingPatterns";
import { coordinationCases } from "./data/coordinationCases";

export function OrganizationOperatingContext({
  scenario,
  onSource,
}: {
  scenario: OrganizationScenario;
  onSource: (path: string) => void;
}) {
  if (scenario.id !== "knowledge") return null;
  return (
    <section
      className="org-overview-section"
      aria-label="Workstream operating context"
    >
      <h2 id="org-operating-context" tabIndex={-1}>
        Agreements, reviews & policy
      </h2>
      <p>
        Where the current Knowledge workstreams need clarification. Independent
        design examples are shown separately from current operating records.
      </p>
      <p>
        <button
          className="button secondary"
          onClick={() => onSource("/walkthroughs/guide-cycle")}
        >
          Explore a complete collaboration example
        </button>
      </p>
      <div className="org-stream-grid">
        {scenario.streams.map((stream) => {
          const association = operatingPattern(scenario, stream.id);
          const examples = outcomeReviewRecords(scenario, stream.id);
          const cases = coordinationCases(scenario).filter(
            (c) => c.streamId === stream.id,
          );
          const outcome = scenario.outcomes.find(
            (o) => o.streamId === stream.id,
          );
          return (
            <article
              className="panel org-stream"
              aria-label={`Operating context · ${stream.id}`}
              key={stream.id}
            >
              <div className="eyebrow">{stream.id}</div>
              <h3>{stream.name}</h3>
              <dl className="operating-summary">
                <dt>
                  <strong>Agreement</strong>
                </dt>
                <dd>
                  {stream.id === "K-01"
                    ? `${agreementVersions.length} proposed briefs · adoption not recorded`
                    : "Versioned agreement not represented"}
                </dd>
                <dt>
                  <strong>Outcome reviewer</strong>
                </dt>
                <dd>Current goal-level review allocation not represented</dd>
                <dt>
                  <strong>Outcome evidence</strong>
                </dt>
                <dd>
                  {outcome?.criteria.some((c) => c.gap.trim())
                    ? "Evidence requirements still have gaps"
                    : "Verification not established"}{" "}
                  · current outcome not verified
                </dd>
                <dt>
                  <strong>Decision & escalation policy</strong>
                </dt>
                <dd>
                  {association?.pattern.policy.state === "unknown"
                    ? "Unknown · policy and escalation recipient not supplied"
                    : "Policy not represented"}
                </dd>
              </dl>
              <p>
                <button
                  className="text-link"
                  onClick={() => onSource(`/outcomes/${stream.id}`)}
                >
                  Inspect outcome gaps · {stream.id}
                </button>
              </p>
              {stream.id === "K-01" && (
                <p>
                  <button
                    className="text-link"
                    onClick={() => onSource("/agreements/K-01")}
                  >
                    Compare proposed agreements · K-01
                  </button>
                </p>
              )}
              {association && (
                <p>
                  <button
                    className="text-link"
                    onClick={() => onSource(`/patterns/${stream.id}`)}
                  >
                    Inspect pattern and policy · {stream.id}
                  </button>
                  <br />
                  {association.pattern.id} · {association.pattern.version} ·
                  guidance, adoption not recorded
                </p>
              )}
              {examples.map((review) => (
                <p key={review.id}>
                  <button
                    className="text-link"
                    onClick={() => onSource(`/outcome-reviews/${review.id}`)}
                  >
                    Inspect independent review example · {review.id}
                  </button>
                  <br />
                  Insufficient evidence · {review.subject.version} /{" "}
                  {review.agreementVersion}; does not verify this current
                  workstream
                </p>
              ))}
              <details className="directory-record-details">
                <summary>Coordination follow-up · {stream.id}</summary>
                {cases.map((c) => (
                  <p key={c.id}>
                    <strong>{c.title}</strong>
                    <br />
                    {c.owner.state === "assigned"
                      ? `Follow-up: ${scenario.workers.find((w) => c.owner.state === "assigned" && w.id === c.owner.workerId)?.name}`
                      : "Follow-up owner unknown"}
                    <br />
                    {c.nextAction}
                    <br />
                    <button
                      className="text-link"
                      onClick={() => onSource(`/cases/${c.id}`)}
                    >
                      Inspect follow-up case · {c.id}
                    </button>
                  </p>
                ))}
              </details>
              <p>
                <button
                  className="text-link"
                  onClick={() => onSource(`/workstreams/${stream.id}`)}
                >
                  Inspect workstream context · {stream.id}
                </button>
              </p>
            </article>
          );
        })}
      </div>
      <p>
        Missing records identify questions to resolve; they do not establish
        priority, blocked execution or completion.
      </p>
    </section>
  );
}

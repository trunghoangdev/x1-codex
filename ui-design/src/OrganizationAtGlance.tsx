import type { OrganizationScenario } from "./data/organizationScenario";
import { coordinationRows } from "./data/coordinationOverview";

export function OrganizationAtGlance({
  scenario,
  onWorkstream,
  onDirectory,
}: {
  scenario: OrganizationScenario;
  onWorkstream: (id: string) => void;
  onDirectory: () => void;
}) {
  const rows = coordinationRows(scenario);
  return (
    <section
      className="org-overview-section organization-glance"
      aria-label="Organization at a glance"
    >
      <h2>Organization at a glance</h2>
      <p>
        Goals, recorded outcomes and one coordination signal per stream. Missing
        inputs precede pending responses, responsibility gaps and evidence
        needs. Streams follow source order, not urgency.{" "}
        {scenario.readOnly
          ? "Authored scenario with bounded local projections; this is not a live organization feed."
          : "Sample workspace with local response projections; real outcomes remain unverified."}
      </p>
      <div className="org-stream-grid">
        {rows
          .slice(0, 4)
          .map(({ stream, inputs, responses, gaps, criteria }) => {
            const input = inputs[0];
            const providerRef = input?.provider;
            const provider =
              providerRef && "assignmentId" in providerRef
                ? scenario.assignments.find(
                    (a) => a.id === providerRef.assignmentId,
                  )
                : undefined;
            const assignment = input ? provider : responses[0];
            const worker = scenario.workers.find(
              (w) => w.id === assignment?.workerId,
            );
            const signal = input
              ? `Input missing: ${input.input}`
              : responses[0]
                ? `Response pending: ${responses[0].title}`
                : gaps[0]
                  ? `Responsibility gap: ${gaps[0].title}`
                  : criteria[0]
                    ? `Evidence needed: ${criteria[0].title}`
                    : "No coordination signal represented; completion is not established.";
            return (
              <article
                key={stream.id}
                className="panel org-stream glance-card"
                aria-label={`Summary · ${stream.id}`}
              >
                <span className="section-label">
                  {stream.id} · {stream.project}
                </span>
                <h3>{stream.name}</h3>
                <p>
                  <strong>Goal</strong>
                  <br />
                  {stream.goal}
                </p>
                <p>
                  <strong>Recorded outcome</strong>
                  <br />
                  {stream.outcome}
                </p>
                <div className="glance-next">
                  <p>
                    <strong>Needs inspection</strong>
                    <br />
                    {signal}
                  </p>
                  <p>
                    <strong>Known responsible person</strong>
                    <br />
                    {worker?.name ??
                      "Not assigned in this signal; inspect responsibility before allocating work."}
                  </p>
                  <p>
                    {assignment?.expectedResponse ??
                      (input
                        ? "Inspect the provider and waiting assignment before coordinating delivery."
                        : "Inspect the exact requirements and responsibility records before deciding the next action.")}
                  </p>
                </div>
                {gaps.length > 0 && (
                  <p className="glance-gap">
                    {gaps.length} known responsibility gap
                    {gaps.length === 1 ? "" : "s"} · not resolved by recording a
                    response.
                  </p>
                )}
                <button
                  className="button secondary"
                  onClick={() => onWorkstream(stream.id)}
                >
                  Inspect workstream · {stream.id}
                </button>
              </article>
            );
          })}
      </div>
      {rows.length > 4 && (
        <p>Showing 4 of {rows.length} streams in source order.</p>
      )}
      <button className="text-link" onClick={onDirectory}>
        Open complete workstream directory
      </button>
    </section>
  );
}

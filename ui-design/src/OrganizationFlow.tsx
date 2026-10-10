import { WorkstreamRelations } from "./WorkstreamRelations";
import type { KnowledgeWorkspace } from "./data/knowledgeCheckpoint";
import type { OrganizationScenario } from "./data/organizationScenario";
import { workstreamFlow } from "./data/workstreamFlow";
export function OrganizationFlow({
  state,
  scenario,
  onOpen,
}: {
  state: KnowledgeWorkspace;
  scenario: OrganizationScenario;
  onOpen: (path: string) => void;
}) {
  const rows = workstreamFlow(state);
  return (
    <section
      className="org-overview-section"
      aria-label="Workstream coordination"
    >
      <h2>Workstream coordination</h2>
      <p>
        Parallel workstreams, with separate contribution, input and decision
        flows. Source order is not urgency. Open a step to inspect its exact
        work and response.
      </p>
      <WorkstreamRelations state={state} onOpen={onOpen} />
      <div className="org-stream-grid">
        {rows.map((row) => {
          const stream = scenario.streams.find((s) => s.id === row.stream)!;
          return (
            <article
              className="panel org-stream flow-stream"
              key={row.stream}
              aria-label={`Flow · ${row.stream}`}
            >
              <span className="section-label">
                {row.stream} · {stream.name}
              </span>
              <h3>{stream.goal}</h3>
              <p>
                <strong>Recorded outcome:</strong> {stream.outcome}
              </p>
              <ul>
                {row.lanes.map((lane) => (
                  <li key={lane.id}>
                    <h4>{lane.label}</h4>
                    <p className="flow-status"><strong>Step status:</strong> {lane.status}</p>
                    <p>
                      <strong>Next responsible:</strong>{" "}
                      {lane.actor ??
                        "No next performer allocated for this step."}
                    </p>
                    <p>
                      <strong>Waiting / boundary:</strong> {lane.waiting}
                    </p>
                    <details>
                      <summary>Next step and source · {lane.id}</summary>
                      <p>{lane.next}</p>
                      <p>{lane.source}</p>
                    </details>
                    <button
                      className="text-link"
                      onClick={() => onOpen(lane.path)}
                    >
                      Inspect flow step · {row.stream} · {lane.id}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                className="button secondary"
                onClick={() => onOpen(`/workstreams/${row.stream}`)}
              >
                Inspect workstream · {row.stream}
              </button>
            </article>
          );
        })}
      </div>
      <p>
        K-01 and K-02 are linked only by an explicitly recorded guide exchange.
        A closed case, exception or successful session does not by itself
        establish learning outcomes.
      </p>
      <button
        className="button secondary"
        onClick={() => onOpen("/workstreams")}
      >
        Open complete workstream directory
      </button>
    </section>
  );
}

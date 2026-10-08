import type { OrganizationScenario } from "./data/organizationScenario";
import type { KnowledgeWorkspace } from "./data/knowledgeCheckpoint";
import { organizationGoals } from "./data/organizationGoals";
export function OrganizationGoalSummary({
  scenario,
  state,
  onOpen,
}: {
  scenario: OrganizationScenario;
  state: KnowledgeWorkspace;
  onOpen: () => void;
}) {
  const view = organizationGoals(scenario, state);
  if (!view) return null;
  return (
    <section className="panel organization-goal-summary" aria-label="Organization goal summary">
      <h2>Purpose → workstream results</h2>
      <h3>{view.goal.title}</h3>
      <p>
        {view.positive} of {view.rows.length} linked workstreams have a current
        positive scoped decision in simulation.
      </p>
      <p>{view.boundary}</p>
      <p>Accountability: {view.goal.owner}.</p>
      <button className="button secondary" onClick={onOpen}>
        Review organization goals and evidence
      </button>
    </section>
  );
}
export function OrganizationGoals({
  scenario,
  state,
  onSource,
}: {
  scenario: OrganizationScenario;
  state: KnowledgeWorkspace;
  onSource: (path: string) => void;
}) {
  const view = organizationGoals(scenario, state);
  if (!view) return null;
  return (
    <section aria-label="Organization goal evidence">
      <div className="panel">
        <h2>{view.goal.title}</h2>
        <p>Organization purpose: {scenario.purpose}</p>
        <p>{view.goal.intent}</p>
        <p>
          Source: {view.goal.source}. Workstream links below are explicitly
          authored sample relationships, not inferred from activity.
        </p>
        <p>
          <strong>Goal accountability:</strong> {view.goal.owner}. Local
          use-owner and workshop-review decisions do not allocate
          organization-wide goal ownership.
        </p>
        <p>
          {view.positive} of {view.rows.length} linked workstreams have current
          positive scoped simulation decisions; {view.historical} have
          source-historical results.
        </p>
        <p>{view.boundary}</p>
      </div>
      {view.rows.map((row) => (
        <article
          className="panel org-stream"
          key={row.streamId}
          aria-label={`Goal contribution ${row.streamId}`}
        >
          <h2>
            {row.streamId} · {row.name}
          </h2>
          <p>
            <strong>Contributes through:</strong> {row.goal}
          </p>
          <p>
            <strong>Expected evidence:</strong> {row.expected}
          </p>
          <h3>{row.status}</h3>
          <p>{row.scope}</p>
          <h3>Evidence represented</h3>
          {row.evidence.length ? (
            <ul>
              {row.evidence.map((e) => (
                <li key={e.id}>
                  <strong>{e.kind}</strong>
                  <p>
                    {e.id} · {e.actor} · {e.at}
                  </p>
                  <p>{e.summary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No execution, observation or result-assessment records represented
              for this current cycle.
            </p>
          )}
          <h3>Remaining gap and limits</h3>
          <p>{row.gap}</p>
          <p>{row.prior}</p>
          <h3>Next operational responsibility</h3>
          <p>{row.responsible}</p>
          <p>{row.next}</p>
          <p>
            Operational responsibility is separate from ownership of the
            organization goal.
          </p>
          <button
            className="button secondary"
            onClick={() => onSource(row.destination)}
          >
            Inspect evidence work · {row.streamId}
          </button>
          <button
            className="text-link"
            onClick={() =>
              onSource(`/organizations/knowledge/outcomes/${row.streamId}`)
            }
          >
            Inspect outcome criteria · {row.streamId}
          </button>
          <details>
            <summary>Exact retained evidence context</summary>
            <pre>{JSON.stringify(row.retained, null, 2)}</pre>
          </details>
        </article>
      ))}
      <p>
        This view derives from local Knowledge records, including explicitly
        restored checkpoints. It creates no goal decision, assignment, evidence
        or authority. Unlinked organization goals, real readership and real
        learning results are not represented.
      </p>
    </section>
  );
}

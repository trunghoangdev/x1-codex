import { PatternAdoption } from "./PatternAdoption";
import {
  activePattern,
  type PatternContext,
  type PatternEvent,
} from "./data/patternAdoption";
import type { OrganizationScenario } from "./data/organizationScenario";
import { operatingPattern } from "./data/operatingPatterns";
import { DetailBackButton } from "./DetailPresentation";

export function OperatingPattern({
  events,
  context,
  onEvents,
  scenario,
  streamId,
  onBack,
  onSource,
}: {
  events: PatternEvent[];
  context: PatternContext;
  onEvents: (events: PatternEvent[]) => void;
  scenario: OrganizationScenario;
  streamId: string;
  onBack: () => void;
  onSource: (path: string) => void;
}) {
  const association = operatingPattern(scenario, streamId)!;
  const active = activePattern(events, streamId);
  const pattern = active?.pattern ?? association.pattern;
  const parallel = scenario.parallelWork.filter(
    (p) => p.streamId === streamId && association.parallelIds.includes(p.id),
  );
  const dependencies = scenario.dependencies.filter(
    (d) => d.streamId === streamId && association.dependencyIds.includes(d.id),
  );
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>
        Back to scenario context
      </DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {streamId} · AUTHORED OPERATING GUIDANCE
          </div>
          <h1 tabIndex={-1}>Operating pattern · {pattern.title}</h1>
          <p>
            {pattern.id} · {pattern.version}
          </p>
        </div>
      </div>
      <div className="org-banner">
        <div>
          <h2>
            {active
              ? `Local guidance selected · ${active.version}`
              : "Guidance · adoption not recorded"}
          </h2>
          <p>
            This workstream has an explicitly authored design association with
            this pattern version. Expectations describe a reusable way to
            collaborate; actual assignments, relationships and states remain
            independent.
          </p>
        </div>
      </div>
      <PatternAdoption
        events={events}
        context={context}
        streamId={streamId as "K-01" | "K-02"}
        onChange={onEvents}
        onSource={onSource}
      />
      <section
        className="org-overview-section"
        aria-label="Pattern role mandates"
      >
        <h2>Expected responsibilities</h2>
        <div className="org-stream-grid">
          {pattern.mandates.map((m) => (
            <article className="panel org-stream" key={m.role}>
              <h3>{m.role}</h3>
              <p>{m.expectation}</p>
              <p>
                Pattern mandate; worker allocation must be inspected in the
                workstream.
              </p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Pattern exchange expectations"
      >
        <h2>Exchanges and revision</h2>
        <ul>
          {pattern.exchanges.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <h3>When an input needs revision</h3>
        <p>{pattern.revision}</p>
        <p>
          These expectations are not an executable sequence or completed checks.
        </p>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Pattern and instance comparison"
      >
        <h2>What is represented in this workstream?</h2>
        {parallel.map((p) => (
          <article key={p.id}>
            <h3>Parallel relationship · {p.id}</h3>
            <p>
              Explicitly represented research/editorial preparation. Parallel
              expectation does not imply either assignment is complete.
            </p>
            {p.assignmentIds.map((id) => (
              <p key={id}>
                <button
                  className="text-link"
                  onClick={() => onSource(`/assignments/${id}`)}
                >
                  Inspect related assignment · {id}
                </button>
              </p>
            ))}
          </article>
        ))}
        {dependencies.map((d) => (
          <article key={d.id}>
            <h3>Input relationship · {d.id}</h3>
            <p>
              Current input · {d.availability} · receipt · {d.receipt}
            </p>
            <p>{d.description}</p>
            <p>
              <button
                className="text-link"
                onClick={() =>
                  onSource(
                    `/assignments/${"assignmentId" in d.provider ? d.provider.assignmentId : ""}`,
                  )
                }
              >
                Inspect supplying responsibility ·{" "}
                {"assignmentId" in d.provider ? d.provider.assignmentId : ""}
              </button>
            </p>
            <p>
              <button
                className="text-link"
                onClick={() =>
                  onSource(`/assignments/${d.receiverAssignmentId}`)
                }
              >
                Inspect receiving responsibility · {d.receiverAssignmentId}
              </button>
            </p>
          </article>
        ))}
        {!parallel.length && !dependencies.length && (
          <p>
            No mapped instance relationship is available. Missing representation
            does not establish completion or a blocked state.
          </p>
        )}
        <p>
          Other pattern expectations have no explicit relationship/completion
          mapping here. Inspect actual allocations, gaps and states rather than
          deriving them from guidance.
        </p>
        <button
          className="text-link"
          onClick={() => onSource(`/workflows/${streamId}`)}
        >
          Inspect instance workflow · {streamId}
        </button>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Decision and escalation policy"
      >
        <h2>Decision policy · unknown</h2>
        <p>{pattern.policy.subject}</p>
        <p>{pattern.policy.decisionRole}</p>
        <h3>Escalation · unknown</h3>
        <p>{pattern.policy.escalation}</p>
        <p>
          No authority, contact, deadline or escalation action is created by
          this pattern.
        </p>
        {streamId === "K-01" && (
          <button className="text-link" onClick={() => onSource("/decisions")}>
            Inspect publication decision requirement
          </button>
        )}
      </section>
      <section className="panel org-stream">
        <h2>Source and boundary</h2>
        <p>
          Independently authored Knowledge design guidance, linked only through
          the explicitly listed instance relationship IDs. Neither flow order
          nor role titles establish policy adoption.
        </p>
        <button
          className="text-link"
          onClick={() => onSource(`/workstreams/${streamId}`)}
        >
          Inspect source workstream · {streamId}
        </button>
      </section>
    </div>
  );
}

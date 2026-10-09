import { useMemo, useState, useEffect, useRef } from "react";
import {
  organizationJourney,
  type JourneyId,
} from "./data/organizationJourney";
import { briefHandoffScenario } from "./data/briefHandoff";
import { goalLoopScenario } from "./data/goalLoop";
import { assessedUseSubject } from "./data/authorizedUse";
import { workshopScenario } from "./data/workshop";
import { knowledgeOrganization } from "./data/knowledgeOrganization";
import { knowledgeTimeline } from "./data/knowledgeTimeline";
import { encodeKnowledgeCheckpoint } from "./data/knowledgeCheckpoint";
import { OrganizationFlow } from "./OrganizationFlow";
import { OrganizationGoalSummary } from "./OrganizationGoals";
import { PersonalNextSteps } from "./PersonalNextSteps";
import { DetailBackButton } from "./DetailPresentation";
export function OrganizationJourney({
  step,
  onStep,
  onExit,
}: {
  step: JourneyId;
  onStep: (step: JourneyId) => void;
  onExit: () => void;
}) {
  const stages = useMemo(() => organizationJourney(), []),
    index = stages.findIndex((s) => s.id === step),
    stage = stages[Math.max(0, index)];
  const scenario = useMemo(() => workshopScenario(
    goalLoopScenario(briefHandoffScenario(knowledgeOrganization, stage.state.brief, stage.state.contribution), stage.state.use, assessedUseSubject(stage.state.contribution)),
    stage.state.workshopEvents ?? [],
    { brief: stage.state.brief, contribution: stage.state.contribution, caseEvents: stage.state.caseEvents ?? [] },
  ), [stage]);
  const [actor, setActor] = useState("leo"),
    [inspect, setInspect] = useState(""),
    [showState, setShowState] = useState(false),
    [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null),
    source = useRef<HTMLHeadingElement>(null);
  const records = useMemo(() => knowledgeTimeline(stage.state), [stage]),
    prior = useMemo(
      () =>
        new Set(
          index > 0
            ? knowledgeTimeline(stages[index - 1].state).map((e) => e.key)
            : [],
        ),
      [index, stages],
    );
  const added = records.filter((e) => !prior.has(e.key));
  useEffect(() => {
    setInspect("");
    setShowState(false);
    setError("");
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => {
    if (inspect) source.current?.focus();
  }, [inspect]);
  function download() {
    try {
      const raw = encodeKnowledgeCheckpoint(stage.state),
        url = URL.createObjectURL(
          new Blob([raw], { type: "application/json" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = `knowledge-journey-${stage.id}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not export this snapshot.",
      );
    }
  }
  return (
    <div className="organization-journey">
      <DetailBackButton onClick={onExit}>
        Back to current Organization
      </DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">GUIDED ORGANIZATION DEMO</div>
          <h1 tabIndex={-1}>A virtual organization at work</h1>
          <p>
            Follow one team from purpose to coordinated work, failure, recovery
            and independent result review. Eight fictional snapshots; your
            current workspace stays unchanged.
          </p>
        </div>
      </div>
      <nav className="journey-stages" aria-label="Organization journey stages">
        {stages.map((s, i) => (
          <button
            className="button secondary"
            key={s.id}
            aria-current={stage.id === s.id ? "step" : undefined}
            onClick={() => onStep(s.id)}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </nav>
      <section
        className="panel org-stream journey-story"
        aria-label="Journey chapter"
      >
        <span className="section-label">
          STEP {index + 1} OF {stages.length}
        </span>
        <h2 tabIndex={-1} ref={heading}>
          {stage.title}
        </h2>
        <p>{stage.summary}</p>
        <p className="journey-point">{stage.point}</p>
        <div className="organization-sections">
          <button
            className="button secondary"
            disabled={index <= 0}
            onClick={() => onStep(stages[index - 1].id)}
          >
            Previous chapter
          </button>
          <button
            className="button primary"
            disabled={index >= stages.length - 1}
            onClick={() => onStep(stages[index + 1].id)}
          >
            Next chapter
          </button>
        </div>
      </section>
      <OrganizationGoalSummary
        scenario={scenario}
        state={stage.state}
        onOpen={() => setInspect("Organization goal evidence")}
      />
      <details className="organization-disclosure journey-records">
        <summary>What changed in this chapter · {added.length} records</summary>
        <ol>
          {added.map((e) => (
            <li key={e.key}>
              <strong>{e.title}</strong> · {e.actor}
              <p>
                {e.stream} · {e.id}
              </p>
              <p>{e.detail}</p>
            </li>
          ))}
        </ol>
        {!added.length && (
          <p>
            The shared purpose and authored work context are introduced here; no
            operational response has been recorded.
          </p>
        )}
      </details>
      <section className="panel personal-inbox-summary">
        <label>
          View a participant’s next steps
          <select
            aria-label="Journey participant"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
          >
            <option value="owner">Demo organization owner</option>
            <option value="leo">Leo</option>
            <option value="maya">Maya</option>
          </select>
        </label>
        <PersonalNextSteps
          state={stage.state}
          actor={actor}
          onOpen={(s) => setInspect(s.path ?? s.panel ?? s.source)}
        />
      </section>
      <OrganizationFlow
        scenario={scenario}
        state={stage.state}
        onOpen={setInspect}
      />
      {inspect && (
        <section
          className="panel org-stream"
          aria-label="Journey source preview"
        >
          <h2 ref={source} tabIndex={-1}>
            Source context in this snapshot
          </h2>
          <p>{inspect}</p>
          <p>
            This preview contains this chapter’s retained records. It does not
            open or replace your current operational workspace.
          </p>
          <ul>
            {records.map((e) => (
              <li key={e.key}>
                {e.id} · {e.title} · {e.actor}
              </li>
            ))}
          </ul>
          <button className="text-link" onClick={() => setInspect("")}>
            Close snapshot preview
          </button>
        </section>
      )}
      <details className="organization-disclosure">
        <summary>Presenter tools and snapshot export</summary>
        <div className="journey-export">
          <p>
            Download this chapter as a validated Knowledge checkpoint to try its
            operational forms through the existing workspace recovery flow.
            Export current work before replacing it. Chapter navigation itself
            does not change or save workspace records.
          </p>
          <button className="button secondary" onClick={download}>
            Download chapter checkpoint
          </button>
          <button className="text-link" onClick={() => setShowState((v) => !v)}>
            Toggle frozen chapter records
          </button>
          {showState && <pre>{JSON.stringify(stage.state, null, 2)}</pre>}
          {error && <p role="alert">{error}</p>}
        </div>
      </details>
    </div>
  );
}

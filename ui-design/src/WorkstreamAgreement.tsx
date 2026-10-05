import type { OrganizationScenario } from "./data/organizationScenario";
import { agreementVersions } from "./data/workstreamAgreements";
import { DetailBackButton } from "./DetailPresentation";

export function WorkstreamAgreement({
  scenario,
  versionId,
  compare,
  onSelection,
  onBack,
  onSource,
}: {
  scenario: OrganizationScenario;
  versionId: string;
  compare: boolean;
  onSelection: (version: string, compare: boolean) => void;
  onBack: () => void;
  onSource: (path: string) => void;
}) {
  const selected = agreementVersions.find((v) => v.id === versionId)!;
  const previous = agreementVersions.find((v) => v.id === selected.previousId);
  const stream = scenario.streams.find((s) => s.id === "K-01")!;
  const outcome = scenario.outcomes.find((o) => o.streamId === stream.id)!;
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>
        Back to scenario context
      </DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">KNOWLEDGE OPERATIONS · K-01</div>
          <h1 tabIndex={-1}>Proposed workstream agreement</h1>
          <p>
            Clarify the audience and scope before treating a guide as accepted
            or ready to publish.
          </p>
        </div>
      </div>
      <div className="org-banner">
        <div>
          <h2>Proposed · adoption not recorded</h2>
          <p>
            Two independently authored design briefs. Neither changes existing
            assignments, evidence or authority. A brief version identifies this
            proposal; a delivered guide version is not represented.
          </p>
        </div>
      </div>
      <div className="stream-directory-filters panel">
        <label>
          Proposed brief version
          <select
            value={selected.id}
            onChange={(e) => onSelection(e.target.value, compare)}
          >
            {agreementVersions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} · {v.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Comparison
          <select
            value={compare ? "yes" : "no"}
            onChange={(e) => onSelection(selected.id, e.target.value === "yes")}
          >
            <option value="no">Selected version only</option>
            <option value="yes">Compare with authored predecessor</option>
          </select>
        </label>
      </div>
      <p role="status">
        Selected proposal: {selected.id}.{" "}
        {compare
          ? previous
            ? `Comparing with ${previous.id}.`
            : "No authored predecessor exists for this version."
          : "Comparison hidden."}
      </p>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Intended outcome"
      >
        <h2>Problem and intended outcome</h2>
        <p>
          New members need to know where reliable answers live and what to do
          next.
        </p>
        <p>{stream.goal}</p>
        <p>
          Existing outcome requirements remain the source of success criteria;
          no observations or passed review are represented.
        </p>
        {outcome.criteria.map((c) => (
          <p key={c.id}>
            {c.id} · {c.title}
          </p>
        ))}
        <button
          className="text-link"
          onClick={() => onSource("/outcomes/K-01")}
        >
          Inspect outcome requirements
        </button>
      </section>
      <div className="org-stream-grid">
        {(compare && previous ? [previous, selected] : [selected]).map((v) => (
          <section
            className="panel org-stream"
            key={v.id}
            aria-label={`Scope ${v.id}`}
          >
            <div className="eyebrow">{v.id} · AUTHORED PROPOSAL</div>
            <h2>{v.title}</h2>
            <h3>Beneficiaries and audience</h3>
            <p>{v.audience}</p>
            <h3>Included scope</h3>
            <ul>
              {v.included.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <h3>Excluded scope</h3>
            <ul>
              {v.excluded.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <h3>Input prerequisites · not confirmed</h3>
            <ul>
              {v.prerequisites.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {compare && previous && (
        <section
          className="panel org-stream org-overview-section"
          aria-label="Scope change"
        >
          <h2>Audience and scope change</h2>
          <p>
            {previous.id} → {selected.id}: expand from one cohort to several
            named teams and add team-specific answers. The intended outcome
            remains the existing K-01 goal.
          </p>
          <p>
            No scope-change approval is recorded. An earlier cohort receipt or
            assessment would need an explicit subject/version/audience
            applicability record before supporting the expanded brief.
          </p>
        </section>
      )}
      <section
        className="panel org-stream org-overview-section"
        aria-label="Version applicability"
      >
        <h2>What applies to this proposal?</h2>
        <p>
          No assignment or evidence applicability mapping to {selected.id} has
          been declared. Existing records are context, not proof of acceptance,
          invalidation or completion.
        </p>
        <p>
          No guide delivery, receipt, assessment or reader observations are
          represented for either brief. The workshop's brief-v0 exchange history
          belongs to K-02 and is not guide evidence.
        </p>
        {stream.assignmentIds.map((id) => (
          <p key={id}>
            <button
              className="text-link"
              onClick={() => onSource(`/assignments/${id}`)}
            >
              Inspect assignment context · {id}
            </button>{" "}
            · version applicability unconfirmed
          </p>
        ))}
      </section>
      <section
        className="panel org-stream"
        aria-label="Review and decision responsibilities"
      >
        <h2>Review and decision responsibilities</h2>
        <p>
          Existing editorial-criteria and distribution-scope assignments request
          clarification. They do not approve this brief or authorize
          publication.
        </p>
        <p>
          Publication assessment responsibility is missing; publication
          authorization policy and owner remain unknown. Publishing would
          require a named guide revision, audience, explicit authority and
          decision record.
        </p>
        <button className="text-link" onClick={() => onSource("/decisions")}>
          Inspect publication decision requirement
        </button>
        <p>
          <button
            className="text-link"
            onClick={() => onSource("/workstreams/K-01")}
          >
            Inspect source workstream · K-01
          </button>
        </p>
      </section>
    </div>
  );
}

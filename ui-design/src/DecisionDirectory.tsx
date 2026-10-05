import type { OrganizationScenario } from "./data/organizationScenario";
import { decisionRequests } from "./data/decisionRequests";
import type { Readiness } from "./data/models";
import { releaseWait } from "./data/organization";
import { DetailBackButton } from "./DetailPresentation";
export function DecisionDirectory({
  scenario,
  completed = {},
  readiness = "missing",
  onBack,
  onAssignment,
  onWorker,
  onStream,
}: {
  scenario: OrganizationScenario;
  completed?: Record<string, string>;
  readiness?: Readiness;
  onBack: () => void;
  onAssignment: (id: string, tab?: string) => void;
  onWorker: (id: string) => void;
  onStream: (id: string) => void;
}) {
  const records = decisionRequests(scenario);
  const name = (id: string) =>
    scenario.workers.find((w) => w.id === id)?.name ?? "Worker not represented";
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>
        {scenario.readOnly
          ? "Back to scenario context"
          : "Back to Organization"}
      </DetailBackButton>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            {scenario.domain} · SAMPLE DECISION RECORDS
          </div>
          <h1 tabIndex={-1}>Decision responsibility</h1>
          <p>
            Inspect decision subjects, allocation and unresolved policy or
            escalation questions.
          </p>
        </div>
      </div>
      <p role="status">
        {records.length} represented decision{" "}
        {records.length === 1 ? "requirement" : "requirements"}. This directory
        is not an audit of all organizational decisions.
      </p>
      {records.length === 0 && (
        <section className="panel org-stream">
          <h2>No decision records represented</h2>
          <p>
            Role bindings and authorization-shaped assignment titles do not
            supply a decision subject, policy or escalation record. Open a
            workstream to inspect existing responsibilities.
          </p>
        </section>
      )}
      {records.map((r) => (
        <article
          className="panel org-stream org-overview-section"
          aria-label={r.title}
          key={r.id}
        >
          <div className="eyebrow">
            {r.id} · {r.kind}
          </div>
          <h2>{r.title}</h2>
          <p>
            <strong>Decision question:</strong> {r.question}
          </p>
          <section aria-label="Decision subject">
            <h3>Subject & scope</h3>
            <p>{r.subject.label}</p>
            <p>{r.subject.scope}</p>
            <p className="decision-identity">
              {r.subject.identity ?? "Exact subject version not represented"}
            </p>
          </section>
          <section aria-label="Decision allocation">
            <h3>Who is allocated to decide?</h3>
            {r.allocation.state === "allocated" ? (
              <>
                <p>
                  {name(r.allocation.workerId)} · {r.allocation.role} ·
                  allocated by sample assignment {r.allocation.assignmentId}
                </p>
                <button
                  className="text-link"
                  onClick={() =>
                    onWorker(
                      r.allocation.state === "allocated"
                        ? r.allocation.workerId
                        : "",
                    )
                  }
                >
                  Inspect decision worker · {name(r.allocation.workerId)}
                </button>
                <p>
                  {completed[r.allocation.assignmentId]
                    ? "Local response recorded · execution and outcome unverified"
                    : "Awaiting assignment response"}
                </p>
                <p>{releaseWait[readiness]}</p>
              </>
            ) : (
              <p>
                {r.allocation.state === "unknown"
                  ? "Decision allocation unknown"
                  : "Decision owner unassigned"}{" "}
                · {r.allocation.detail}
              </p>
            )}
            <p>
              <strong>Responsibility mandate:</strong> {r.mandate}
            </p>
            <p>
              <strong>Requester:</strong>{" "}
              {r.requester ? name(r.requester.workerId) : "Not represented"}
            </p>
          </section>
          <section aria-label="Decision policy">
            <h3>Policy & evidence requirements</h3>
            <p>
              <strong>
                {r.policy.state === "unknown"
                  ? "Policy unknown"
                  : "Authored policy context"}
              </strong>{" "}
              · {r.policy.detail}
            </p>
            <ul>
              {r.requiredEvidence.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <p>{r.boundary}</p>
          </section>
          <section aria-label="Decision escalation">
            <h3>Unresolved decision or escalation</h3>
            {r.escalation ? (
              <p>
                {name(r.escalation.workerId)} · {r.escalation.reason}
              </p>
            ) : (
              <p>
                Escalation contact and policy not represented. No recipient or
                automatic escalation is inferred from role names.
              </p>
            )}
            <p>
              Decision deadline not represented. This directory submits no
              response, allocation, publication or execution request.
            </p>
          </section>
          <details className="directory-record-details">
            <summary>Inspect decision source · {r.id}</summary>
            <p>{r.provenance}</p>
            {r.source.assignmentId && (
              <button
                className="text-link"
                onClick={() =>
                  onAssignment(
                    r.source.assignmentId!,
                    completed[r.source.assignmentId!] ? "Activity" : "Overview",
                  )
                }
              >
                Inspect decision assignment · {r.source.assignmentId}
              </button>
            )}
            {r.source.streamId && (
              <button
                className="text-link"
                onClick={() => onStream(r.source.streamId!)}
              >
                Inspect decision requirement source ·{" "}
                {r.source.gapId ?? r.source.streamId}
              </button>
            )}
          </details>
        </article>
      ))}
    </div>
  );
}

import type { ResponsibilityProposal } from "./data/responsibilityProposals";
import { DetailBackButton, DetailEmptyState } from "./DetailPresentation";
import { assignments } from "./data/assignments";
import type { Assignment, Readiness } from "./data/models";
import {
  organizationAttention,
  type AttentionCategory,
} from "./data/organizationAttention";

export function OrganizationAttention({
  completed,
  readiness,
  onOpen,
  onWorkstream,
  proposals,
  onPropose,
  category,
  onCategory,
  onBack,
}: {
  completed: Record<string, string>;
  readiness: Readiness;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onWorkstream: (id: string) => void;
  proposals: Record<string, ResponsibilityProposal>;
  onPropose: (gapId: string) => void;
  category: AttentionCategory | "All";
  onCategory: (category: AttentionCategory | "All") => void;
  onBack: () => void;
}) {
  const items = organizationAttention(completed, readiness);
  const shown = items.filter(
    (item) => category === "All" || item.category === category,
  );
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>Back to Organization</DetailBackButton>
      <div className="page-heading workstream-heading">
        <div>
          <div className="eyebrow">ORGANIZATION ATTENTION</div>
          <h1 tabIndex={-1}>What needs coordination?</h1>
        </div>
      </div>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Organization attention"
      >
        <h2 id="org-attention" tabIndex={-1}>
          Organization attention
        </h2>
        <p>
          Coordination across the sample organization: responsibility gaps,
          pending responses, missing inputs and unverified outcomes. These are
          known signals, not a complete organization backlog.
        </p>
        <div className="org-filters">
          <label>
            Attention type
            <select
              aria-label="Attention type"
              value={category}
              onChange={(event) =>
                onCategory(event.target.value as AttentionCategory | "All")
              }
            >
              <option value="All">All attention types</option>
              {(
                ["Responsibility", "Response", "Input", "Outcome"] as const
              ).map((value) => (
                <option key={value} value={value}>
                  {value} ·{" "}
                  {items.filter((item) => item.category === value).length}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p role="status">
          {shown.length} of {items.length} attention items · counts describe
          signals, not assignments or progress.
        </p>
        <div className="org-stream-grid">
          {shown.map((item) => (
            <article
              key={item.id}
              className="org-stream-assignment"
              aria-label={item.title}
            >
              <span className="badge neutral">{item.category}</span>
              <h3>{item.title}</h3>
              <p>
                <strong>{item.owner}</strong>
              </p>
              <p>{item.detail}</p>
              <button
                className="text-link"
                onClick={() => {
                  if (item.target.kind === "workstream")
                    onWorkstream(item.target.id);
                  else {
                    const assignment = assignments.find(
                      (a) => a.id === item.target.id,
                    );
                    if (assignment) onOpen(assignment, item.target.tab);
                  }
                }}
              >
                Inspect {item.target.kind} · {item.target.id}
              </button>
              {item.category === "Responsibility" && (
                <p>
                  <button
                    className="button secondary"
                    onClick={() => onPropose(item.id)}
                  >
                    {proposals[item.id]
                      ? "View proposal"
                      : "Propose responsibility"}{" "}
                    · {item.title}
                  </button>
                </p>
              )}
            </article>
          ))}
        </div>
        {shown.length === 0 && (
          <DetailEmptyState>
            No matching attention items in this sample. This does not establish
            organization health.
          </DetailEmptyState>
        )}
        <p>
          Recorded responses clear their response signal. Responsibility gaps
          and unverified outcomes require separate evidence and remain visible.
        </p>
      </section>
    </div>
  );
}

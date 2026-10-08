import { useEffect, useState } from "react";
import { OrganizationAtGlance } from "./OrganizationAtGlance";
import type { AttentionItem } from "./data/organizationAttention";
import type { ReactNode } from "react";
import {
  mainOrganization,
  type OrganizationScenario,
} from "./data/organizationScenario";
import { scenarioAttention } from "./data/scenarioAttention";
import { WorkspaceGuide } from "./WorkspaceGuide";
import type { ResponsibilityProposal } from "./data/responsibilityProposals";
import { AttentionSummary } from "./AttentionSummary";
import type { AttentionCategory } from "./data/organizationAttention";
import { assignments } from "./data/assignments";

import type { Assignment, Readiness } from "./data/models";
import { releaseWait } from "./data/organization";

export function OrganizationOverview({
  scenario = mainOrganization,
  attentionItems,
  goalContext,
  coordination,
  coordinationExpanded = false,
  operatingContext,
  coordinationNeeds,
  exchangeHistory,
  completed,
  readiness,
  onOpen,
  onMyWork,
  onWorkstream,
  proposals,
  onPropose,
  onWorker,
  onWorkersDirectory,
  onRolesDirectory,
  onDirectory,
  onCases,
  onDecisions,
  onActivity,
  onAttention,
  myWorkLabel,
}: {
  scenario?: OrganizationScenario;
  attentionItems?: AttentionItem[];
  goalContext?: ReactNode;
  coordination?: ReactNode;
  coordinationExpanded?: boolean;
  operatingContext?: ReactNode;
  coordinationNeeds?: ReactNode;
  exchangeHistory?: ReactNode;
  myWorkLabel?: string;
  completed: Record<string, string>;
  readiness: Readiness;
  onOpen: (assignment: Assignment, tab?: string) => void;
  onMyWork: () => void;
  onWorkstream: (id: string) => void;
  proposals: Record<string, ResponsibilityProposal>;
  onPropose: (gapId: string) => void;
  onWorker: (id: string) => void;
  onWorkersDirectory: () => void;
  onRolesDirectory: () => void;
  onDirectory: () => void;
  onCases?: () => void;
  onDecisions?: () => void;
  onActivity: () => void;
  onAttention: (category: AttentionCategory | "All") => void;
}) {
  const [coordinationOpen, setCoordinationOpen] =
    useState(coordinationExpanded);
  useEffect(() => {
    if (coordinationExpanded) setCoordinationOpen(true);
  }, [coordinationExpanded]);
  const {
    workers,
    bindings: roleBindings,
    streams: workstreams,
    gaps: responsibilityGaps,
  } = scenario;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ORGANIZATION OVERVIEW</div>
          <h1 tabIndex={-1}>One team. Clear responsibility.</h1>
          <p>
            Shared goals, parallel workstreams and the people and workers
            responsible.
          </p>
        </div>
        {(!coordination || !scenario.readOnly || scenario.id === "knowledge") && (
          <button className="button secondary" onClick={onMyWork}>
            {myWorkLabel ??
              `Open My Work · Alex${scenario.readOnly ? " (main sample)" : ""}`}
          </button>
        )}
      </div>
      <div className="org-banner">
        <div>
          <span className="section-label">
            {scenario.domain.toUpperCase()} · {scenario.name.toUpperCase()}
          </span>
          <h2>{scenario.purpose}</h2>
          <p>
            {workstreams.length} workstreams · {workers.length} workers ·{" "}
            {roleBindings.length} scoped role bindings
          </p>
          {!coordination && (
            <p>
              Authored design scenario. Workstream membership and role scopes
              illustrate a proposed organization model; they are not live
              records.
            </p>
          )}
        </div>
      </div>
      {goalContext}
      <OrganizationAtGlance
        scenario={scenario}
        onWorkstream={onWorkstream}
        onDirectory={onDirectory}
      />
      <AttentionSummary
        attentionItems={
          attentionItems ??
          (scenario.readOnly ? scenarioAttention(scenario) : undefined)
        }
        completed={completed}
        readiness={readiness}
        onOpen={onAttention}
      />
      <nav className="organization-sections" aria-label="Organization sections">
        {[
          ["org-goals", "Goals & workstreams"],
          ...(operatingContext
            ? [["org-operating-context", "Agreements, reviews & policy"]]
            : []),
          ["org-attention", "Attention"],
          ["org-workers", "Roles & workers"],
        ].map(([id, label]) => (
          <button
            className="button secondary"
            key={id}
            onClick={() => {
              const heading = document.getElementById(id);
              let ancestor = heading?.parentElement;
              while (ancestor) {
                if (ancestor instanceof HTMLDetailsElement)
                  ancestor.open = true;
                ancestor = ancestor.parentElement;
              }
              heading?.focus({ preventScroll: true });
              heading?.scrollIntoView({ block: "start", behavior: "instant" });
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {coordinationNeeds}
      <details
        className="organization-disclosure org-overview-section"
        open={coordinationOpen}
        onToggle={(event) => setCoordinationOpen(event.currentTarget.open)}
      >
        <summary>Inspect detailed workstream coordination</summary>
        {coordination ?? (
          <>
            <section
              aria-label="Organization workstreams"
              className="org-overview-section"
            >
              <h2 id="org-goals" tabIndex={-1}>
                Goals & workstreams
              </h2>
              <p>
                These streams run alongside each other. A recorded response does
                not establish that a goal has been achieved.
              </p>
              <div className="org-stream-grid">
                {workstreams.map((stream) => (
                  <article
                    className="panel org-stream"
                    key={stream.id}
                    aria-label={stream.name}
                  >
                    <span className="section-label">
                      {stream.id} · {stream.project}
                    </span>
                    <h3>{stream.name}</h3>
                    <button
                      className="text-link"
                      onClick={() => onWorkstream(stream.id)}
                    >
                      Explore workstream · {stream.id}
                    </button>
                    <p>
                      <strong>Goal</strong>
                      <br />
                      {stream.goal}
                    </p>
                    <p>
                      {stream.assignmentIds.length} linked assignment · inspect
                      details in the workstream
                    </p>
                    <p className="org-outcome">
                      <strong>Outcome</strong>
                      <br />
                      {stream.outcome}
                    </p>
                  </article>
                ))}
              </div>
              <p>
                <button className="button secondary" onClick={onDirectory}>
                  Browse workstreams
                </button>
              </p>
            </section>
          </>
        )}
      </details>
      {onCases && (
        <p>
          <button className="button secondary" onClick={onCases}>
            Browse coordination cases
          </button>
        </p>
      )}
      {onDecisions && (
        <p>
          <button className="button secondary" onClick={onDecisions}>
            Inspect decision responsibility
          </button>
        </p>
      )}
      <p className="org-overview-section">
        <button className="button secondary" onClick={onActivity}>
          View organization activity
        </button>
      </p>
      {exchangeHistory && (
        <details className="organization-disclosure org-overview-section">
          <summary>Contribution exchange history · K-01-H</summary>
          {exchangeHistory}
        </details>
      )}
      {operatingContext && (
        <details className="organization-disclosure org-overview-section">
          <summary>Inspect agreements, reviews & policy</summary>
          {operatingContext}
        </details>
      )}
      {scenario.id === "main" && (
        <details className="organization-disclosure org-overview-section">
          <summary>Other organization work · 3 assignments</summary>
          <section
            className="panel org-stream org-overview-section"
            aria-label="Other organization work"
          >
            <h2>Other work requiring coordination</h2>
            <p>
              These assignments are outside the two modeled streams. A shared
              project does not establish a dependency.
            </p>
            {["A-1041", "A-1035", "A-1032"].map((id) => {
              const assignment = assignments.find((a) => a.id === id);
              return (
                assignment && (
                  <div className="org-stream-assignment" key={id}>
                    <button
                      className="text-link"
                      onClick={() => onOpen(assignment)}
                    >
                      {id} · {assignment.title}
                    </button>
                    <p>
                      {completed[id]
                        ? "Local response recorded; outcome remains unverified."
                        : id === "A-1041"
                          ? releaseWait[readiness]
                          : id === "A-1035"
                            ? "Staging effect unconfirmed. This is a different subject from the production release."
                            : "Accessibility assessment requested; no invitation-workstream dependency is established."}
                    </p>
                  </div>
                )
              );
            })}
          </section>
        </details>
      )}
      <section
        className="org-overview-section"
        aria-label="Roles and worker bindings"
      >
        <h2 id="org-workers" tabIndex={-1}>
          Roles & worker bindings
        </h2>
        <p>
          A worker can hold several roles. Each binding has a scope;
          contribution, assessment and authorization remain distinct
          responsibilities.
        </p>
        <p>
          {workers.length} workers · {roleBindings.length} scoped bindings.
          Inspect roles, scopes and assignment links in Workers.
          {coordination &&
            ` Showing ${Math.min(3, workers.length)} worker summaries; the directory contains all ${workers.length}.`}
        </p>
        <div
          className={
            coordination
              ? "compact-worker-summary overview-workers"
              : "org-stream-grid overview-workers"
          }
        >
          {(coordination ? workers.slice(0, 3) : workers).map((worker) => (
            <article
              className="panel org-stream"
              key={worker.id}
              aria-label={worker.name}
            >
              <span className="section-label">{worker.type}</span>
              <h3>{worker.name}</h3>
              <p>
                {
                  roleBindings.filter(
                    (binding) => binding.workerId === worker.id,
                  ).length
                }{" "}
                scoped bindings
              </p>
              <button className="text-link" onClick={() => onWorker(worker.id)}>
                View worker · {worker.name}
              </button>
            </article>
          ))}
        </div>
        <p>
          <button className="button secondary" onClick={onWorkersDirectory}>
            Browse workers
          </button>{" "}
          <button className="button secondary" onClick={onRolesDirectory}>
            Browse roles
          </button>
        </p>
      </section>
      <details className="organization-disclosure org-overview-section">
        <summary>
          Responsibility gaps · {responsibilityGaps.length} known gaps
        </summary>
        <section
          className="panel org-stream org-overview-section"
          aria-label="Responsibility gaps"
        >
          <h2>Responsibility gaps</h2>
          <p>
            Known gaps in this authored scenario, not an audit of the whole
            organization.
          </p>
          {responsibilityGaps.map((gap) => (
            <article className="org-stream-assignment" key={gap.id}>
              <h3>{gap.title}</h3>
              <p>{gap.description}</p>
              <button
                className="text-link"
                onClick={() => onWorkstream(gap.workstreamId)}
              >
                Inspect workstream · {gap.title}
              </button>
              {!scenario.readOnly && (
                <p>
                  <button
                    className="button secondary"
                    onClick={() => onPropose(gap.id)}
                  >
                    {proposals[gap.id]
                      ? "View proposal"
                      : "Propose responsibility"}{" "}
                    · {gap.title}
                  </button>
                </p>
              )}
            </article>
          ))}
        </section>
      </details>
      <WorkspaceGuide
        personalLabel={
          scenario.personas ? "the selected sample persona’s" : "Alex’s"
        }
      />
    </>
  );
}

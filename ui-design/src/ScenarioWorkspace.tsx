import { ContributionRecovery } from "./ContributionRecovery";
import { CoordinationNeeds } from "./CoordinationNeeds";
import { actionableAttention, type CoordinationNeed } from "./data/actionableAttention";
import { ContributionExchange } from "./ContributionExchange";
import { HumanContribution } from "./HumanContribution";
import type { HumanContributionState } from "./data/humanContribution";
import { CollaborationWalkthrough } from "./CollaborationWalkthrough";
import { walkthroughRecords } from "./data/collaborationWalkthrough";
import { OrganizationOperatingContext } from "./OrganizationOperatingContext";
import { OperatingPattern } from "./OperatingPattern";
import { operatingPattern } from "./data/operatingPatterns";
import { OutcomeReviewRecord } from "./OutcomeReviewRecord";
import { WorkstreamAgreement } from "./WorkstreamAgreement";
import { CoordinationCases } from "./CoordinationCases";
import {
  coordinationCases,
  defaultCaseFilters,
  type CaseFilters,
} from "./data/coordinationCases";
import { ExchangeActivity, type ExchangeFilters } from "./ExchangeActivity";
import { DecisionDirectory } from "./DecisionDirectory";
import { WorkflowMap } from "./WorkflowMap";
import { OutcomeReview } from "./OutcomeReview";
import { CoordinationOverview } from "./CoordinationOverview";
import {
  defaultCoordinationFilters,
  type CoordinationFilters,
} from "./data/coordinationOverview";
import { readScenarioWorkFilters } from "./data/scenarioWork";
import { CoordinationInputs } from "./CoordinationInputs";
import { RolesDirectory } from "./RolesDirectory";
import {
  readRolePages,
  rolePageParams,
  type RoleFilters,
} from "./data/roleDirectory";
import { OrganizationOverview } from "./OrganizationOverview";
import { useRef } from "react";
import { resolveScenario, scenarioPersona } from "./data/scenarioRegistry";
import { ScenarioMyWork } from "./ScenarioMyWork";
import { WorkstreamsDirectory } from "./WorkstreamsDirectory";
import { WorkersDirectory } from "./WorkersDirectory";
import {
  defaultStreamFilters,
  type StreamFilters,
} from "./data/workstreamDirectory";
import {
  defaultWorkerFilters,
  type WorkerFilters,
} from "./data/workerDirectory";
import { DetailBackButton } from "./DetailPresentation";
export { validScenarioPath } from "./scenarioRoutes";
import { validScenarioPath } from "./scenarioRoutes";
export function ScenarioWorkspace({
  path,
  onRoute,
  onMain,
  onMyWork,
  contribution,
  onContribution,
}: {
  contribution: HumanContributionState;
  onContribution: (state: HumanContributionState) => void;
  path: string;
  onRoute: (path: string, replace?: boolean) => void;
  onMain: () => void;
  onMyWork: () => void;
}) {
  const origins = useRef<
    Record<string, { destination: string; source: string }[]>
  >({});
  const scenario = resolveScenario(path)!;
  const needs = actionableAttention(scenario, contribution);
  const base = `/organizations/${scenario.id}`;
  const persona = scenarioPersona(path);
  const person = scenario.workers.find((w) => w.id === persona?.workerId);
  const qualify = (next: string) =>
    base +
    next +
    (persona
      ? `${next.includes("?") ? "&" : "?"}persona=${persona.workerId}`
      : "");
  const [pathname, query] = path.split("?");
  const suffix = pathname.slice(base.length);
  const params = new URLSearchParams(query);
  const trailKey = `forge-scenario-return-v1:${scenario.id}:${persona?.workerId ?? ""}`;
  const getTrail = () => {
    const key = persona?.workerId ?? "";
    if (!origins.current[key]) {
      try {
        const saved: unknown = JSON.parse(
          sessionStorage.getItem(trailKey) ?? "[]",
        );
        origins.current[key] = Array.isArray(saved)
          ? saved
              .filter(
                (entry) =>
                  entry &&
                  typeof entry.destination === "string" &&
                  typeof entry.source === "string" &&
                  entry.destination.startsWith(base + "/") &&
                  entry.source.split("?")[0] !== entry.destination &&
                  validScenarioPath(entry.destination) &&
                  resolveScenario(entry.source)?.id === scenario.id &&
                  validScenarioPath(entry.source) &&
                  scenarioPersona(entry.source)?.workerId === persona?.workerId,
              )
              .slice(-24)
          : [];
      } catch {
        origins.current[key] = [];
      }
    }
    return origins.current[key];
  };
  const saveTrail = () => {
    try {
      sessionStorage.setItem(trailKey, JSON.stringify(getTrail()));
    } catch {
      /* Return context still works in memory. */
    }
  };
  const open = (next: string) => {
    const destination = base + next.split("?")[0];
    if (destination === pathname) return;
    const trail = getTrail();
    trail.push({ destination, source: path });
    if (trail.length > 24) trail.shift();
    saveTrail();
    onRoute(qualify(next));
  };
  const openNeed = (item: CoordinationNeed) => item.destination ? onRoute(item.destination) : open(`/${item.target.kind === "workstream" ? "workstreams" : "assignments"}/${item.target.id}`);
  const back = () => {
    const trail = getTrail();
    let index = trail.length - 1;
    while (index >= 0 && trail[index].destination !== pathname) index--;
    const assignment = scenario.assignments.find(
      (a) => suffix === `/assignments/${a.id}`,
    );
    const outcomeStream = scenario.streams.find(
      (s) =>
        suffix === `/outcomes/${s.id}` ||
        suffix === `/workflows/${s.id}` ||
        suffix === `/agreements/${s.id}` ||
        suffix === `/patterns/${s.id}`,
    );
    const fallback =
      suffix === "/walkthroughs/guide-cycle"
        ? "/workstreams/K-01"
        : suffix === "/outcome-reviews/guide-review-01"
          ? "/outcomes/K-01"
          : outcomeStream
            ? `/workstreams/${outcomeStream.id}`
            : assignment?.streamId
              ? `/workstreams/${assignment.streamId}`
              : suffix.startsWith("/workers/")
                ? "/workers"
                : suffix.startsWith("/workstreams/")
                  ? "/workstreams"
                  : suffix.startsWith("/cases/")
                    ? "/cases"
                    : "";
    const source = index >= 0 ? trail[index].source : qualify(fallback);
    if (index >= 0) trail.splice(index);
    saveTrail();
    onRoute(source);
  };
  const filter = (kind: string, values: Record<string, string>) => {
    const p = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v && v !== "All" && v !== "all") p.set(k, v);
    });
    onRoute(qualify(`${kind ? `/${kind}` : ""}${p.size ? `?${p}` : ""}`), true);
  };
  const stream = scenario.streams.find(
    (s) => suffix === `/workstreams/${s.id}`,
  );
  const worker = scenario.workers.find((w) => suffix === `/workers/${w.id}`);
  const assignment = scenario.assignments.find(
    (a) => suffix === `/assignments/${a.id}`,
  );
  const links = (ids: string[]) =>
    ids.map((id) => {
      const a = scenario.assignments.find((a) => a.id === id)!;
      return (
        <article className="org-stream-assignment" key={id}>
          <h3>{a.title}</h3>
          <p>
            {a.id} · {a.role} ·{" "}
            {scenario.workers.find((w) => w.id === a.workerId)?.name ??
              "Unassigned"}{" "}
            · {a.state}
          </p>
          <button
            className="text-link"
            onClick={() => open(`/assignments/${id}`)}
          >
            Inspect scenario assignment · {id}
          </button>
        </article>
      );
    });
  return (
    <div className="detail-page coordination-workspace">
      <details
        className="organization-disclosure"
        role="region"
        aria-label="Scenario boundary"
      >
        <summary>About this sample</summary>
        <p>
          {scenario.name} · {scenario.id === "knowledge" ? "authored sample" : "read-only sample"} · {scenario.streams.length}{" "}
          workstreams · {scenario.workers.length} workers. These are authored
          responsibilities and requirements, not live permissions, capacity or
          verified outcomes. Main software records remain separate.
        </p>
      </details>
      {scenario.id === "knowledge" && <details className="organization-disclosure org-overview-section"><summary>Save or restore Knowledge contribution</summary><ContributionRecovery state={contribution} onChange={onContribution} /></details>}
      {suffix === "/contributions/K-01-H" ? (
        <HumanContribution state={contribution} onChange={onContribution}
          onBack={() => onRoute(qualify("/work"))}
          workspace={{ onOrganization: () => onRoute(qualify("")), onWorkstream: () => open("/workstreams/K-01") }} />
      ) : suffix === "/walkthroughs/guide-cycle" ? (
        <CollaborationWalkthrough
          scenario={scenario}
          recordId={params.get("cycleRecord") ?? walkthroughRecords[0].id}
          onSelect={(id) =>
            filter("walkthroughs/guide-cycle", { cycleRecord: id })
          }
          onBack={back}
          onSource={open}
        />
      ) : suffix.startsWith("/patterns/") ? (
        <OperatingPattern
          scenario={scenario}
          streamId={suffix.split("/")[2]}
          onBack={back}
          onSource={open}
        />
      ) : suffix === "/outcome-reviews/guide-review-01" ? (
        <OutcomeReviewRecord
          scenario={scenario}
          onBack={back}
          onSource={open}
        />
      ) : suffix === "/agreements/K-01" ? (
        <WorkstreamAgreement
          scenario={scenario}
          versionId={params.get("agreementVersion") ?? "brief-v2"}
          compare={params.get("compare") === "yes"}
          onSelection={(version, compare) =>
            filter("agreements/K-01", {
              agreementVersion: version,
              compare: compare ? "yes" : "no",
            })
          }
          onBack={back}
          onSource={open}
        />
      ) : suffix === "/cases" || suffix.startsWith("/cases/") ? (
        <CoordinationCases
          scenario={scenario}
          caseId={suffix.split("/")[2]}
          filters={{
            ...defaultCaseFilters,
            query: params.get("caseQ") ?? "",
            owner: (params.get("caseOwner") ?? "all") as CaseFilters["owner"],
            need: (params.get("caseNeed") ?? "all") as CaseFilters["need"],
          }}
          onFilters={(f) =>
            filter("cases", {
              caseQ: f.query,
              caseOwner: f.owner,
              caseNeed: f.need,
            })
          }
          onBack={back}
          onCase={(id) => open(`/cases/${id}`)}
          onSource={open}
        />
      ) : suffix === "/activity" ? (
        <ExchangeActivity
          scenario={scenario}
          filters={{
            stream: params.get("actStream") ?? "all",
            kind: (params.get("actKind") ?? "all") as ExchangeFilters["kind"],
            event: params.get("event") ?? undefined,
          }}
          onFilters={(f) =>
            filter("activity", {
              actStream: f.stream,
              actKind: f.kind,
              event: f.event ?? "",
            })
          }
          onBack={back}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onWorker={(id) => open(`/workers/${id}`)}
        />
      ) : suffix === "/decisions" ? (
        <DecisionDirectory
          scenario={scenario}
          onBack={back}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onWorker={(id) => open(`/workers/${id}`)}
          onStream={(id) => open(`/workstreams/${id}`)}
        />
      ) : suffix.startsWith("/workflows/") ? (
        <WorkflowMap
          scenario={scenario}
          streamId={suffix.split("/")[2]}
          onBack={back}
          onPattern={
            operatingPattern(scenario, suffix.split("/")[2])
              ? () => open(`/patterns/${suffix.split("/")[2]}`)
              : undefined
          }
          onActivity={() => open(`/activity?actStream=${suffix.split("/")[2]}`)}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onWorker={(id) => open(`/workers/${id}`)}
          onStream={() => open(`/workstreams/${suffix.split("/")[2]}`)}
          onOutcome={() => open(`/outcomes/${suffix.split("/")[2]}`)}
        />
      ) : suffix.startsWith("/outcomes/") ? (
        <OutcomeReview
          scenario={scenario}
          stream={scenario.streams.find((s) => suffix === `/outcomes/${s.id}`)!}
          outcome={scenario.outcomes.find(
            (o) => suffix === `/outcomes/${o.streamId}`,
          )!}
          completed={{}}
          backLabel="Back to scenario context"
          onReviewRecord={
            scenario.id === "knowledge" && suffix === "/outcomes/K-01"
              ? () => open("/outcome-reviews/guide-review-01")
              : undefined
          }
          onBack={back}
          onOpen={(id) => open(`/assignments/${id}`)}
        />
      ) : suffix === "/work" ? (
        <ScenarioMyWork
          onContribution={() => onRoute(qualify("/contributions/K-01-H"))}
          contribution={contribution}
          onContributionChange={onContribution}
          onCase={(id) => open(`/cases/${id}`)}
          scenario={scenario}
          workerId={persona!.workerId}
          filters={readScenarioWorkFilters(params)}
          onFilters={(f) =>
            filter("work", {
              q: f.query,
              role: f.role,
              stream: f.stream,
              status: f.status,
            })
          }
          onWorker={(id) => open(`/workers/${id}`)}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onStream={(id) => open(`/workstreams/${id}`)}
          onOrganization={() => onRoute(qualify(""))}
        />
      ) : suffix === "/evidence" ? (
        <div className="detail-page">
          <DetailBackButton onClick={() => onRoute(qualify(""))}>
            Back to Organization
          </DetailBackButton>
          <div className="page-heading">
            <div>
              <div className="eyebrow">SCENARIO EVIDENCE</div>
              <h1 tabIndex={-1}>Evidence · {scenario.name}</h1>
              <p>Artifacts represented in this sample organization.</p>
            </div>
          </div>
          {scenario.evidence.length === 0 ? (
            <section
              className="panel org-stream"
              aria-label="Scenario evidence"
            >
              <h2>No evidence artifacts represented</h2>
              <p>
                {scenario.name} has authored assignments and evidence
                requirements, but no attached artifacts. Missing records do not
                establish that work succeeded or failed. Main software sample
                artifacts and decisions are separate.
              </p>
              <button
                className="button secondary"
                onClick={() => onRoute(qualify("/workstreams"))}
              >
                Browse evidence requirements
              </button>
            </section>
          ) : (
            <section
              className="panel org-stream"
              aria-label="Scenario evidence"
            >
              <p>{scenario.evidence.length} authored artifacts</p>
              {scenario.evidence.map((a) => (
                <article key={a.id}>
                  <h2>{a.title}</h2>
                  <p>
                    {a.id} · {a.producer}
                  </p>
                  <p>{a.detail}</p>
                  <details>
                    <summary>Inspect artifact contents · {a.id}</summary>
                    <pre>{a.content}</pre>
                  </details>
                  <button
                    className="text-link"
                    onClick={() => open(`/assignments/${a.assignmentId}`)}
                  >
                    Inspect artifact assignment · {a.assignmentId}
                  </button>
                </article>
              ))}
            </section>
          )}
        </div>
      ) : suffix === "/roles" ? (
        <RolesDirectory
          scenario={scenario}
          filters={{
            ...readRolePages(params),
            detail: params.get("detail") ?? undefined,
            query: params.get("q") ?? "",
            view: params.get("view") === "scope" ? "scope" : undefined,
            scope: params.get("scope") ?? undefined,
            coverage: (params.get("coverage") ??
              "all") as RoleFilters["coverage"],
          }}
          onFilters={(f) =>
            filter("roles", {
              ...rolePageParams(f),
              q: f.query,
              coverage: f.coverage,
              view: f.view ?? "",
              scope: f.scope ?? "",
            })
          }
          onWorker={(id) => open(`/workers/${id}`)}
          onStream={(id) => open(`/workstreams/${id}`)}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onBack={() => onRoute(qualify(""))}
        />
      ) : suffix === "/workstreams" ? (
        <WorkstreamsDirectory
          scenario={scenario}
          filters={{
            ...defaultStreamFilters,
            page: params.has("page") ? Number(params.get("page")) : undefined,
            query: params.get("q") ?? "",
            project: params.get("project") ?? "All",
            signal: (params.get("signal") ?? "all") as StreamFilters["signal"],
          }}
          onFilters={(f) =>
            filter("workstreams", {
              q: f.query,
              project: f.project,
              signal: f.signal,
              page: (f.page ?? 1) > 1 ? String(f.page) : "",
            })
          }
          onOpen={(id) => open(`/workstreams/${id}`)}
          onBack={() => onRoute(qualify(""))}
        />
      ) : suffix === "/workers" ? (
        <WorkersDirectory
          scenario={scenario}
          filters={{
            ...defaultWorkerFilters,
            page: params.has("page") ? Number(params.get("page")) : undefined,
            query: params.get("q") ?? "",
            role: params.get("role") ?? "All",
            type: (params.get("type") ?? "all") as WorkerFilters["type"],
            assignments: (params.get("links") ??
              "all") as WorkerFilters["assignments"],
          }}
          onFilters={(f) =>
            filter("workers", {
              q: f.query,
              role: f.role,
              type: f.type,
              links: f.assignments,
              page: (f.page ?? 1) > 1 ? String(f.page) : "",
            })
          }
          onOpen={(id) => open(`/workers/${id}`)}
          onAttention={() =>
            onRoute(qualify("/attention?category=responsibility"))
          }
          onBack={() => onRoute(qualify(""))}
        />
      ) : (
        <>
          {suffix !== "" && (
            <>
              <DetailBackButton onClick={back}>
                Back to scenario context
              </DetailBackButton>
              <div className="page-heading">
                <div>
                  <h1 tabIndex={-1}>
                    {stream?.name ??
                      worker?.name ??
                      assignment?.title ??
                      (suffix === "/attention"
                        ? "Scenario organization attention"
                        : suffix === "/activity"
                          ? "Scenario organization activity"
                          : "Organization overview")}
                  </h1>
                </div>
              </div>
            </>
          )}
          {stream ? (
            <>
              <p>{stream.goal}</p>
              <p>{stream.outcome}</p>
              {
                <section
                  className="panel org-stream"
                  aria-label="Workstream responsibility sources"
                >
                  <h2>Known responsibility gaps</h2>
                  {scenario.gaps
                    .filter((g) => g.workstreamId === stream.id)
                    .map((g) => (
                      <article key={g.id}>
                        <h3>{g.title}</h3>
                        <p>
                          {g.id} · {g.description}
                        </p>
                      </article>
                    ))}
                </section>
              }
              <section className="panel org-stream">
                <h2>Coordination & assignments</h2>
                {scenario.id === "knowledge" && stream.id === "K-01" && (
                  <p>
                    <button
                      className="button secondary"
                      onClick={() => open("/agreements/K-01")}
                    >
                      Inspect proposed workstream agreement
                    </button>
                  </p>
                )}
                {
                  <button
                    className="button secondary"
                    onClick={() => open(`/workflows/${stream.id}`)}
                  >
                    Explore workflow & exchanges
                  </button>
                }
                <p>{stream.coordination}</p>
                <ol>
                  {scenario.flows[stream.id].map((step) => (
                    <li key={step.assignmentId}>
                      <strong>{step.title}</strong>
                      <p>
                        {step.responsibility} · {step.state}
                      </p>
                      <p>{step.exchange}</p>
                    </li>
                  ))}
                </ol>
                {links(stream.assignmentIds)}
                <CoordinationInputs
                  scenario={scenario}
                  streamId={stream.id}
                  onAssignment={(id) => open(`/assignments/${id}`)}
                  onWorker={(id) => open(`/workers/${id}`)}
                />
                <h2>Outcome evidence requirements</h2>
                <button
                  className="button secondary"
                  onClick={() => open(`/outcomes/${stream.id}`)}
                >
                  Review outcome evidence
                </button>
                {scenario.outcomes
                  .find((o) => o.streamId === stream.id)
                  ?.criteria.map((c) => (
                    <div key={c.id}>
                      <h3>{c.title}</h3>
                      <p>Criterion · {c.id}</p>
                      <p>{c.needed}</p>
                      <p>{c.gap}</p>
                    </div>
                  ))}
              </section>
            </>
          ) : worker ? (
            <>
              <h2>Scoped responsibilities</h2>
              <ul>
                {scenario.bindings
                  .filter((b) => b.workerId === worker.id)
                  .map((b) => (
                    <li key={`${b.role}:${b.scope}`}>
                      {b.role} · {b.scope}
                    </li>
                  ))}
              </ul>
              <h2>Explicit assignment links</h2>
              {links(
                scenario.assignments
                  .filter((a) => a.workerId === worker.id)
                  .map((a) => a.id),
              )}
              <p>
                No links does not establish that this worker is idle or
                available.
              </p>
            </>
          ) : assignment ? (
            <section className="panel org-stream">
              <p>
                {assignment.id} · {assignment.role} · {assignment.state}
              </p>
              <p>
                Worker:{" "}
                {scenario.workers.find((w) => w.id === assignment.workerId)
                  ?.name ?? "Unassigned"}
              </p>
              <CoordinationInputs
                scenario={scenario}
                assignmentId={assignment.id}
                onAssignment={(id) => open(`/assignments/${id}`)}
                onWorker={(id) => open(`/workers/${id}`)}
              />
              {assignment.input && (
                <>
                  <h2>Input & expected response</h2>
                  <p>
                    <strong>Input:</strong> {assignment.input}
                  </p>
                  <p>
                    <strong>Expected response:</strong>{" "}
                    {assignment.expectedResponse}
                  </p>
                </>
              )}
              <p>
                Authored read-only state. No verified artifacts or external
                execution record is attached; no response action is enabled.
              </p>
              <button
                className="text-link"
                onClick={() => open(`/workstreams/${assignment.streamId}`)}
              >
                Inspect scenario workstream
              </button>
              {assignment.workerId && (
                <button
                  className="text-link"
                  onClick={() => open(`/workers/${assignment.workerId}`)}
                >
                  Inspect scenario worker
                </button>
              )}
            </section>
          ) : suffix === "/attention" ? (
            <section className="panel org-stream">
              <CoordinationNeeds items={needs.filter(record => !params.get("category") || params.get("category") === "all" || record.category.toLowerCase() === params.get("category"))} onOpen={openNeed} />
              <p>
                Signals combine authored context and explicitly local Knowledge contribution transitions. Suggested inspection does not allocate responsibility or establish completion.
              </p>
            </section>
          ) : (
            <OrganizationOverview
              onCases={
                scenario.id === "knowledge" ? () => open("/cases") : undefined
              }
              onDecisions={() => open("/decisions")}
              scenario={scenario}
              attentionItems={needs}
              coordination={
                <CoordinationOverview
                  scenario={scenario}
                  filters={{
                    ...defaultCoordinationFilters,
                    query: params.get("coordQ") ?? "",
                    signal: (params.get("coordSignal") ??
                      "all") as CoordinationFilters["signal"],
                    page: params.has("coordPage")
                      ? Number(params.get("coordPage"))
                      : undefined,
                  }}
                  onFilters={(f) =>
                    filter("", {
                      coordQ: f.query,
                      coordSignal: f.signal,
                      coordPage: (f.page ?? 1) > 1 ? String(f.page) : "",
                    })
                  }
                  onAssignment={(id) => open(`/assignments/${id}`)}
                  onStream={(id) => open(`/workstreams/${id}`)}
                  onOutcome={(id) => open(`/outcomes/${id}`)}
                  onDirectory={() => onRoute(qualify("/workstreams"))}
                />
              }
              completed={{}}
              readiness="missing"
              coordinationNeeds={scenario.id === "knowledge" ? <CoordinationNeeds items={needs} compact onOpen={openNeed} /> : undefined}
              exchangeHistory={scenario.id === "knowledge" ? <ContributionExchange state={contribution} onOpen={() => onRoute(base + "/work?persona=maya")} /> : undefined}
              operatingContext={scenario.id === "knowledge" ? <OrganizationOperatingContext scenario={scenario} onSource={open} /> : undefined}
              proposals={{}}
              onOpen={(a) => open(`/assignments/${a.id}`)}
              onMyWork={persona ? () => onRoute(qualify("/work")) : onMyWork}
              myWorkLabel={
                persona ? `Open personal inbox · ${person?.name}` : undefined
              }
              onWorkstream={(id) => open(`/workstreams/${id}`)}
              onWorker={(id) => open(`/workers/${id}`)}
              onDirectory={() => onRoute(qualify("/workstreams"))}
              onWorkersDirectory={() => onRoute(qualify("/workers"))}
              onRolesDirectory={() => onRoute(qualify("/roles"))}
              onActivity={() => onRoute(qualify("/activity"))}
              onAttention={(category) =>
                onRoute(
                  qualify(
                    "/attention" +
                      (category === "All"
                        ? ""
                        : `?category=${category.toLowerCase()}`),
                  ),
                )
              }
              onPropose={() => {}}
            />
          )}
        </>
      )}
    </div>
  );
}

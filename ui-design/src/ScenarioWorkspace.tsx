import { OrganizationOverview } from "./OrganizationOverview";
import { scenarioAttention } from "./data/scenarioAttention";
import { useRef } from "react";
import { largeOrganization as scenario } from "./data/organizationScenario";
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
const base = "/organizations/large";
export function validScenarioPath(raw: string) {
  const [path, query] = raw.split("?");
  const suffix = path.slice(base.length);
  const params = new URLSearchParams(query);
  if (
    ![
      "",
      "/workstreams",
      "/workers",
      "/attention",
      "/activity",
      ...scenario.streams.map((s) => `/workstreams/${s.id}`),
      ...scenario.workers.map((w) => `/workers/${w.id}`),
      ...scenario.assignments.map((a) => `/assignments/${a.id}`),
    ].includes(suffix)
  )
    return false;
  return (
    (!params.has("category") ||
      ["all", "responsibility", "response", "outcome"].includes(
        params.get("category")!,
      )) &&
    (!params.has("project") ||
      ["All", ...scenario.streams.map((s) => s.project)].includes(
        params.get("project")!,
      )) &&
    (!params.has("signal") ||
      ["all", "responsibility", "outcome"].includes(params.get("signal")!)) &&
    (!params.has("type") ||
      ["all", "human", "ai", "deterministic"].includes(params.get("type")!)) &&
    (!params.has("role") ||
      ["All", ...scenario.bindings.map((b) => b.role)].includes(
        params.get("role")!,
      )) &&
    (!params.has("links") ||
      ["all", "linked", "none"].includes(params.get("links")!))
  );
}
export function ScenarioWorkspace({
  path,
  onRoute,
  onMain,
  onMyWork,
}: {
  path: string;
  onRoute: (path: string, replace?: boolean) => void;
  onMain: () => void;
  onMyWork: () => void;
}) {
  const origins = useRef<Record<string, string>>({});
  const [pathname, query] = path.split("?");
  const suffix = pathname.slice(base.length);
  const params = new URLSearchParams(query);
  const open = (next: string) => {
    origins.current[next] = path;
    onRoute(base + next);
  };
  const back = () => onRoute(origins.current[suffix] ?? base);
  const filter = (kind: string, values: Record<string, string>) => {
    const p = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v && v !== "All" && v !== "all") p.set(k, v);
    });
    onRoute(`${base}/${kind}${p.size ? `?${p}` : ""}`, true);
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
    <div className="detail-page">
      <section
        className="panel org-stream org-overview-section"
        aria-label="Scenario boundary"
      >
        <strong>{scenario.name} · read-only sample</strong>
        <p>
          {scenario.streams.length} workstreams · {scenario.workers.length}{" "}
          workers · {scenario.bindings.length} scoped bindings ·{" "}
          {scenario.assignments.length} assignments. No live capacity, authority
          or outcomes are verified. Main-scenario records and Alex's inbox
          remain separate.
        </p>
        <button className="button secondary" onClick={onMain}>
          Return to main organization
        </button>
      </section>
      {suffix === "/workstreams" ? (
        <WorkstreamsDirectory
          scenario={scenario}
          filters={{
            ...defaultStreamFilters,
            query: params.get("q") ?? "",
            project: params.get("project") ?? "All",
            signal: (params.get("signal") ?? "all") as StreamFilters["signal"],
          }}
          onFilters={(f) =>
            filter("workstreams", {
              q: f.query,
              project: f.project,
              signal: f.signal,
            })
          }
          onOpen={(id) => open(`/workstreams/${id}`)}
          onBack={() => onRoute(base)}
        />
      ) : suffix === "/workers" ? (
        <WorkersDirectory
          scenario={scenario}
          filters={{
            ...defaultWorkerFilters,
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
            })
          }
          onOpen={(id) => open(`/workers/${id}`)}
          onAttention={() =>
            onRoute(base + "/attention?category=responsibility")
          }
          onBack={() => onRoute(base)}
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
              <section className="panel org-stream">
                <h2>Coordination & assignments</h2>
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
                <h2>Outcome evidence requirements</h2>
                {scenario.outcomes
                  .find((o) => o.streamId === stream.id)
                  ?.criteria.map((c) => (
                    <div key={c.id}>
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
              <p>
                Authored read-only state. No candidate, checks or external
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
              {scenarioAttention(scenario)
                .filter(
                  (record) =>
                    !params.get("category") ||
                    params.get("category") === "all" ||
                    record.category.toLowerCase() === params.get("category"),
                )
                .map((record) => (
                  <article className="org-stream-assignment" key={record.id}>
                    <h2>
                      {record.category} · {record.title}
                    </h2>
                    <p>
                      {record.owner} · {record.detail}
                    </p>
                    <button
                      className="text-link"
                      onClick={() =>
                        open(
                          `/${record.target.kind === "workstream" ? "workstreams" : "assignments"}/${record.target.id}`,
                        )
                      }
                    >
                      Inspect scenario signal · {record.id}
                    </button>
                  </article>
                ))}
              <p>
                Signals reflect authored states. No proposal or allocation
                action is enabled in this read-only scenario.
              </p>
            </section>
          ) : suffix === "/activity" ? (
            <section className="panel org-stream">
              <h2>No scenario records represented</h2>
              <p>
                This read-only scenario has authored assignments and states, but
                no response, proposal, decision or evidence records. Records
                from the main sample are not shown here.
              </p>
            </section>
          ) : (
            <OrganizationOverview
              scenario={scenario}
              completed={{}}
              readiness="missing"
              proposals={{}}
              onOpen={(a) => open(`/assignments/${a.id}`)}
              onMyWork={onMyWork}
              onWorkstream={(id) => open(`/workstreams/${id}`)}
              onWorker={(id) => open(`/workers/${id}`)}
              onDirectory={() => onRoute(base + "/workstreams")}
              onWorkersDirectory={() => onRoute(base + "/workers")}
              onActivity={() => onRoute(base + "/activity")}
              onAttention={(category) =>
                onRoute(
                  base +
                    "/attention" +
                    (category === "All"
                      ? ""
                      : `?category=${category.toLowerCase()}`),
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

import {
  readScenarioWorkFilters,
  validScenarioWorkFilters,
} from "./data/scenarioWork";
import { CoordinationInputs } from "./CoordinationInputs";
import { RolesDirectory } from "./RolesDirectory";
import { roleCoverage, type RoleFilters } from "./data/roleDirectory";
import { OrganizationOverview } from "./OrganizationOverview";
import { scenarioAttention } from "./data/scenarioAttention";
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
export function validScenarioPath(raw: string) {
  const scenario = resolveScenario(raw);
  if (!scenario) return false;
  const base = `/organizations/${scenario.id}`;
  const [path, query] = raw.split("?");
  const suffix = path.slice(base.length);
  const params = new URLSearchParams(query);
  if (
    ![
      "",
      "/workstreams",
      "/workers",
      "/roles",
      ...(scenario.personas ? ["/work"] : []),
      "/attention",
      "/activity",
      ...scenario.streams.map((s) => `/workstreams/${s.id}`),
      ...scenario.workers.map((w) => `/workers/${w.id}`),
      ...scenario.assignments.map((a) => `/assignments/${a.id}`),
    ].includes(suffix)
  )
    return false;
  return (
    (suffix !== "/work" || validScenarioWorkFilters(scenario, params)) &&
    (!params.has("persona") ||
      !!scenario.personas?.some((p) => p.workerId === params.get("persona"))) &&
    (!params.has("view") || params.get("view") === "scope") &&
    (!params.has("scope") ||
      [
        "All",
        ...scenario.scopes
          .filter((s) => s.kind === "workstream")
          .map((s) => s.id),
      ].includes(params.get("scope")!)) &&
    (!params.has("coverage") ||
      (roleCoverage.includes(params.get("coverage")!) &&
        (params.get("coverage") !== "unknown" ||
          params.get("view") === "scope"))) &&
    (!params.has("category") ||
      ["all", "responsibility", "response", "input", "outcome"].includes(
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
      [
        "All",
        ...(suffix === "/work"
          ? scenario.roles.map((r) => r.name)
          : scenario.bindings.map((b) => b.role)),
      ].includes(params.get("role")!)) &&
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
  const origins = useRef<
    Record<string, { destination: string; source: string }[]>
  >({});
  const scenario = resolveScenario(path)!;
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
  const open = (next: string) => {
    const destination = base + next.split("?")[0];
    if (destination === pathname) return;
    const key = persona?.workerId ?? "";
    (origins.current[key] ??= []).push({ destination, source: path });
    onRoute(qualify(next));
  };
  const back = () => {
    const trail = origins.current[persona?.workerId ?? ""] ?? [];
    let index = trail.length - 1;
    while (index >= 0 && trail[index].destination !== pathname) index--;
    const source = index >= 0 ? trail[index].source : qualify("");
    if (index >= 0) trail.splice(index);
    onRoute(source);
  };
  const filter = (kind: string, values: Record<string, string>) => {
    const p = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v && v !== "All" && v !== "all") p.set(k, v);
    });
    onRoute(qualify(`/${kind}${p.size ? `?${p}` : ""}`), true);
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
      {scenario.personas && (
        <section
          className="panel stream-directory-filters org-overview-section"
          aria-label="Sample persona"
        >
          <label>
            Sample persona
            <select
              value={persona!.workerId}
              onChange={(e) => {
                const p = new URLSearchParams(query);
                p.set("persona", e.target.value);
                if (suffix === "/work")
                  for (const key of ["q", "role", "stream", "status"])
                    p.delete(key);
                onRoute(`${pathname}?${p}`);
              }}
            >
              {scenario.personas.map((p) => (
                <option key={p.workerId} value={p.workerId}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <p>
            Authored persona preview; this selector does not sign in or grant
            permissions.
          </p>
          {suffix !== "/work" && (
            <button
              className="button secondary"
              onClick={() => onRoute(qualify("/work"))}
            >
              Open My Work · {person?.name}
            </button>
          )}
        </section>
      )}
      {suffix === "/work" ? (
        <ScenarioMyWork
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
      ) : suffix === "/roles" ? (
        <RolesDirectory
          scenario={scenario}
          filters={{
            query: params.get("q") ?? "",
            view: params.get("view") === "scope" ? "scope" : undefined,
            scope: params.get("scope") ?? undefined,
            coverage: (params.get("coverage") ??
              "all") as RoleFilters["coverage"],
          }}
          onFilters={(f) =>
            filter("roles", {
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
          onBack={() => onRoute(qualify(""))}
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
                <CoordinationInputs
                  scenario={scenario}
                  streamId={stream.id}
                  onAssignment={(id) => open(`/assignments/${id}`)}
                  onWorker={(id) => open(`/workers/${id}`)}
                />
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

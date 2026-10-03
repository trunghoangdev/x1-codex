import { useState } from "react";
import { DetailBackButton, DetailEmptyState } from "./DetailPresentation";
import {
  scenarioWorkers as workers,
  scenarioStreams as streams,
  scenarioAssignments as assignments,
  scenarioBindings as bindings,
} from "./data/largeOrganization";

export function LargeOrganizationDemo({ onBack }: { onBack: () => void }) {
  const [streamId, setStreamId] = useState(streams[0].id);
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("all");
  const [state, setState] = useState("all");
  const stream = streams.find((s) => s.id === streamId)!;
  const workerName = (id?: string) =>
    workers.find((w) => w.id === id)?.name ?? "Unassigned";
  const matching = assignments.filter(
    (a) =>
      (owner === "all" ||
        (owner === "unassigned" ? !a.workerId : a.workerId === owner)) &&
      (state === "all" || a.state === state) &&
      `${a.id} ${a.title} ${a.role} ${workerName(a.workerId)}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="detail-page">
      <DetailBackButton onClick={onBack}>Back to Demos</DetailBackButton>
      <div className="page-heading workstream-heading">
        <div>
          <div className="eyebrow">INDEPENDENT ORGANIZATION SCENARIO</div>
          <h1 tabIndex={-1}>A larger collaborating organization</h1>
          <p>
            {streams.length} parallel workstreams · {workers.length} workers ·{" "}
            {bindings.length} scoped bindings · {assignments.length} assignments
          </p>
        </div>
      </div>
      <div className="org-banner">
        <div>
          <h2>Explore coordination at a larger scale</h2>
          <p>
            Fictional states and identities. This scenario is separate from My
            Work and records no responses, runtime health or verified outcomes.
          </p>
        </div>
      </div>
      <section
        aria-label="Scenario workstreams"
        className="org-overview-section"
      >
        <h2>Parallel workstreams</h2>
        <p>
          Select a stream to inspect its responsibilities and coordination. Card
          order does not establish a dependency.
        </p>
        <div className="role-grid">
          {streams.map((s) => (
            <button
              className="panel org-stream scenario-stream"
              key={s.id}
              aria-pressed={streamId === s.id}
              onClick={() => setStreamId(s.id)}
            >
              <span className="section-label">
                {s.id} · {s.project}
              </span>
              <strong>{s.name}</strong>
              <span>
                {assignments.filter((a) => a.streamId === s.id).length} sample
                assignments · outcome unverified
              </span>
            </button>
          ))}
        </div>
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Selected scenario workstream"
        tabIndex={-1}
      >
        <h2>{stream.name}</h2>
        <p>{stream.goal}</p>
        <p>
          {stream.id === "L-03"
            ? "Revision loop: developer revises the candidate, then reviewer assesses the new subject. Earlier assessments do not transfer."
            : stream.id === "L-02"
              ? "Coordination gap: the reviewer assignment is unassigned. A planner must identify the responsible worker before assessment can proceed."
              : "Developer and reviewer coordinate on an exact candidate. Authority decides a separately scoped subject when its prerequisites are available."}
        </p>
        <p>
          These authored states are not a sequential execution log.
          Authorization is requested in the scenario; no prerequisite readiness
          or effect is established.
        </p>
        {assignments
          .filter((a) => a.streamId === streamId)
          .map((a) => (
            <article className="org-stream-assignment" key={a.id}>
              <h3>
                {a.id} · {a.role}
              </h3>
              <p>
                {workerName(a.workerId)} · {a.state}
              </p>
            </article>
          ))}
      </section>
      <section
        className="panel org-stream org-overview-section"
        aria-label="Scenario assignment directory"
      >
        <h2>Assignments across workers</h2>
        <div className="org-filters">
          <label>
            Search
            <input
              type="search"
              aria-label="Search scenario assignments"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            Worker
            <select
              aria-label="Scenario worker"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            >
              <option value="all">All workers</option>
              <option value="unassigned">Unassigned</option>
              {workers.map((w) => (
                <option value={w.id} key={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            State
            <select
              aria-label="Scenario assignment state"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <option value="all">All states</option>
              {[...new Set(assignments.map((a) => a.state))].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setOwner("all");
              setState("all");
            }}
          >
            Reset scenario filters
          </button>
        </div>
        <p role="status">
          {matching.length} matching assignments · bounded sample
        </p>
        {matching.map((a) => (
          <article className="org-stream-assignment" key={a.id}>
            <h3>
              {a.id} · {a.title}
            </h3>
            <p>
              {workerName(a.workerId)} · {a.role} · {a.state}
            </p>
            <button
              className="text-link"
              onClick={() => {
                setStreamId(a.streamId);
                const heading = document.querySelector<HTMLElement>(
                  '[aria-label="Selected scenario workstream"]',
                );
                heading?.focus();
                heading?.scrollIntoView({ block: "start" });
              }}
            >
              Inspect scenario stream · {a.id}
            </button>
          </article>
        ))}
        {matching.length === 0 && (
          <DetailEmptyState>
            No assignments match these filters. This does not imply idle
            capacity.
          </DetailEmptyState>
        )}
      </section>
      <section
        className="panel org-stream"
        aria-label="Scenario workers and bindings"
      >
        <h2>Worker responsibilities</h2>
        <p>
          One worker may hold the same role in several scopes. Bindings describe
          responsibility; they do not establish effective permission or
          availability.
        </p>
        <div className="org-stream-grid">
          {workers.map((w) => (
            <article className="org-stream-assignment" key={w.id}>
              <h3>{w.name}</h3>
              <p>
                {w.type} ·{" "}
                {assignments.filter((a) => a.workerId === w.id).length} linked
                sample assignments
              </p>
              <ul>
                {bindings
                  .filter((b) => b.workerId === w.id)
                  .map((b) => (
                    <li key={`${b.role}-${b.streamId}`}>
                      {b.role} · {b.streamId}
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

import { useEffect, useRef } from "react";
import type { KnowledgeWorkspace } from "./data/knowledgeCheckpoint";
import {
  knowledgeTimeline,
  timelineKinds,
  timelinePage,
  type TimelineFilters,
} from "./data/knowledgeTimeline";
export function KnowledgeTimeline({
  state,
  filters,
  onFilters,
  onSource,
  onBack,
}: {
  state: KnowledgeWorkspace;
  filters: TimelineFilters;
  onFilters: (f: TimelineFilters) => void;
  onSource: (path: string) => void;
  onBack: () => void;
}) {
  const all = knowledgeTimeline(state),
    view = timelinePage(all, filters),
    selected = all.find((e) => e.key === filters.event),
    heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (filters.event) {
      heading.current?.focus();
      heading.current?.scrollIntoView({ block: "start" });
    }
  }, [filters.event, selected?.key]);
  const change = (fields: Partial<TimelineFilters>) =>
    onFilters({ ...filters, ...fields, page: 1, event: undefined });
  const inspect = (key: string) =>
    onFilters({
      stream: "all",
      kind: "all",
      query: "",
      page: Math.floor(all.findIndex((e) => e.key === key) / 20) + 1,
      event: key,
    });
  return (
    <div className="detail-page knowledge-timeline">
      <button className="button secondary" onClick={onBack}>
        Back to Knowledge context
      </button>
      <h1 tabIndex={-1}>Knowledge timeline</h1>
      <p>
        Recorded local responsibility, handoff, contribution, assessment, scope
        and use history across K-01 and K-02. Restoring a checkpoint rebuilds
        this view from retained records.
      </p>
      <p>
        Newest recorded times first. Equal timestamps retain a stable display
        order and do not establish causality; inspect record references. Command
        rows show their current status, not a complete status-change log. Unsent
        preparation, missing actions and recovery operations are not invented as
        events.
      </p>
      <button
        className="text-link"
        onClick={() => onSource("/organizations/knowledge/activity")}
      >
        Inspect separate authored activity examples
      </button>
      <section className="panel timeline-filters" aria-label="Timeline filters">
        <label>
          Timeline workstream
          <select
            value={filters.stream}
            onChange={(e) => change({ stream: e.target.value })}
          >
            <option value="all">All workstreams</option>
            <option>K-01</option>
            <option>K-02</option>
          </select>
        </label>
        <label>
          Timeline stage
          <select
            value={filters.kind}
            onChange={(e) => change({ kind: e.target.value })}
          >
            <option value="all">All stages</option>
            {timelineKinds.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label>
          Search timeline
          <input
            value={filters.query}
            maxLength={500}
            onChange={(e) => change({ query: e.target.value })}
            placeholder="Person, record, version or decision"
          />
        </label>
        <button
          className="button secondary"
          onClick={() =>
            onFilters({ stream: "all", kind: "all", query: "", page: 1 })
          }
        >
          Reset timeline filters
        </button>
      </section>
      <p role="status">
        {view.matched.length} matching events · {all.length} recorded events ·
        page {view.page} of {view.pages}
      </p>
      {filters.event && (
        <section
          className="panel org-stream"
          aria-label="Timeline record detail"
        >
          <h2 ref={heading} tabIndex={-1}>
            {selected
              ? selected.title
              : "Record unavailable in current workspace"}
          </h2>
          {selected ? (
            <>
              <p>
                {selected.id} · {selected.actor} ·{" "}
                <time dateTime={selected.at}>{selected.at}</time> ·{" "}
                {selected.stream} · {selected.version}
              </p>
              <p>{selected.detail}</p>
              <h3>Recorded references</h3>
              {selected.references.length ? (
                <ul>
                  {selected.references.map((id) => {
                    const e = all.find((x) => x.id === id);
                    return (
                      <li key={id}>
                        {e ? (
                          <button
                            className="text-link"
                            onClick={() => inspect(e.key)}
                          >
                            Inspect related record · {id}
                          </button>
                        ) : (
                          <span>
                            {id} · referenced record is not present in this
                            workspace.
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No related record reference is stored.</p>
              )}
              <button
                className="button secondary"
                onClick={() => onSource(selected.destination)}
              >
                Open source workspace
              </button>
              <details>
                <summary>Inspect exact retained record</summary>
                <pre>{JSON.stringify(selected.record, null, 2)}</pre>
              </details>
              {selected.frozenSubject !== undefined && (
                <details>
                  <summary>Inspect exact frozen source</summary>
                  <pre>{JSON.stringify(selected.frozenSubject, null, 2)}</pre>
                </details>
              )}
            </>
          ) : (
            <p>
              The selected record may belong to a different checkpoint. Its
              identifier is {filters.event}; no replacement event is inferred.
            </p>
          )}
        </section>
      )}
      {!view.rows.length && (
        <section className="panel org-stream">
          <h2>
            {all.length
              ? "No events match these filters"
              : "No local timeline records yet"}
          </h2>
          <p>
            {all.length
              ? "Reset or change filters to inspect retained history."
              : "Start a responsibility offer, record a contribution or deliver a workshop brief. Authored examples are separate from these local records."}
          </p>
        </section>
      )}
      <ol
        className="knowledge-timeline-list"
        aria-label="Recorded Knowledge events"
      >
        {view.rows.map((e) => (
          <li className="panel org-stream" key={e.key}>
            <div className="eyebrow">
              {e.stream} · {e.kind}
            </div>
            <h2>{e.title}</h2>
            <p>
              {e.actor} · <time dateTime={e.at}>{e.at}</time> · {e.version}
            </p>
            <p>{e.detail}</p>
            <p>Record: {e.id}</p>
            <button className="button secondary" onClick={() => inspect(e.key)}>
              Inspect timeline record · {e.id}
            </button>
          </li>
        ))}
      </ol>
      {view.pages > 1 && (
        <nav aria-label="Timeline pages">
          <button
            className="button secondary"
            disabled={view.page === 1}
            onClick={() =>
              onFilters({ ...filters, page: view.page - 1, event: undefined })
            }
          >
            Previous timeline page
          </button>{" "}
          <button
            className="button secondary"
            disabled={view.page === view.pages}
            onClick={() =>
              onFilters({ ...filters, page: view.page + 1, event: undefined })
            }
          >
            Next timeline page
          </button>
        </nav>
      )}
    </div>
  );
}

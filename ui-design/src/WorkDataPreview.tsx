import { useEffect, useRef, useState, type ReactNode } from "react";

export type WorkDataState = "ready" | "loading" | "empty" | "error";

/** UI scenarios only; no request or server state is represented here. */
export function WorkDataPreview({
  children,
  state,
  setState,
}: {
  children: ReactNode;
  state: WorkDataState;
  setState: (state: WorkDataState) => void;
}) {
  const [retrying, setRetrying] = useState(false);
  const selector = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (!retrying) return;
    const timer = window.setTimeout(() => {
      setState("ready");
      setRetrying(false);
      selector.current?.focus();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [retrying]);
  return (
    <>
      <section className="data-preview" aria-label="My Work data preview">
        <label htmlFor="work-data-state">Data preview</label>
        <select
          id="work-data-state"
          ref={selector}
          value={state}
          onChange={(event) => {
            setRetrying(false);
            setState(event.target.value as WorkDataState);
          }}
        >
          <option value="ready">Loaded sample work</option>
          <option value="loading">Loading</option>
          <option value="empty">No assigned work</option>
          <option value="error">Load failed</option>
        </select>
        <p>
          Sample scenarios only. Retry simulates a successful load; no SF
          request is sent.
        </p>
      </section>
      <div role="status" className="data-load-announcement">
        {state === "loading"
          ? "Loading sample work…"
          : retrying
            ? ""
            : state === "ready"
              ? "Sample work loaded."
              : ""}
      </div>
      {state === "ready" ? (
        children
      ) : (
        <section
          className="panel data-state"
          aria-label="My Work loading state"
          aria-busy={state === "loading"}
        >
          <h1 tabIndex={-1}>My Work</h1>
          {state === "loading" && (
            <>
              <h2>Loading assignments…</h2>
              <p>
                Assignment counts and review shortcuts will appear when data is
                available.
              </p>
              <p>
                {retrying
                  ? "Simulating a successful retry…"
                  : "This preview stays loading until you select another scenario."}
              </p>
            </>
          )}
          {state === "error" && (
            <>
              <div role="alert">
                <h2>Could not load your work</h2>
                <p>
                  Your assignment count is unknown. This does not mean you have
                  no assigned work.
                </p>
              </div>
              <button
                className="button primary"
                onClick={() => {
                  setState("loading");
                  setRetrying(true);
                }}
              >
                Retry sample load
              </button>
            </>
          )}
          {state === "empty" && (
            <>
              <h2>No work assigned to you</h2>
              <p>
                This sample load succeeded with no assignments. This is
                different from a filtered list with no matches.
              </p>
              <button
                className="button secondary"
                onClick={() => {
                  setState("ready");
                  selector.current?.focus();
                }}
              >
                Restore sample work
              </button>
            </>
          )}
          <p>Existing filters, drafts and decisions stay in this session.</p>
        </section>
      )}
    </>
  );
}

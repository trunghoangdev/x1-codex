import { useRef, useState } from "react";
import {
  caseActors,
  caseEvidence,
  caseProgress,
  recordCaseEvent,
  type CaseAction,
  type CaseContext,
  type CaseEvent,
} from "./data/caseLifecycle";
export function CaseLifecycle({
  events,
  context,
  onChange,
}: {
  events: CaseEvent[];
  context: CaseContext;
  onChange: (events: CaseEvent[]) => void;
}) {
  const [actor, setActor] = useState<"leo" | "maya">("leo");
  const [action, setAction] = useState<CaseAction>("Accept responsibility");
  const [rationale, setRationale] = useState("");
  const [preview, setPreview] = useState<{
    identity: string;
    events: CaseEvent[];
  }>();
  const heading = useRef<HTMLHeadingElement>(null);
  const progress = caseProgress(events, context);
  const options: CaseAction[] = !events.length
    ? actor === "leo"
      ? ["Accept responsibility"]
      : []
    : progress.stale || progress.resolved
      ? ["Reopen case"]
      : progress.pending
        ? actor === "maya"
          ? ["Approve resolution", "Request further work"]
          : []
        : actor === "leo"
          ? [
              "Update follow-up",
              ...(caseEvidence(context) ? ["Propose resolution" as const] : []),
            ]
          : [];
  const selected = options.includes(action) ? action : options[0];
  const identity = JSON.stringify({
    events,
    context,
    actor,
    selected,
    rationale,
  });
  return (
    <section
      className="panel org-stream material-use-start case-lifecycle"
      aria-label="Local coordination case lifecycle"
    >
      <h2 ref={heading} tabIndex={-1}>
        {progress.status}
      </h2>
      <p>{progress.nextStep}</p>
      {events.at(-1) && (
        <p>Latest recorded update: {events.at(-1)!.rationale}</p>
      )}
      <p role="status">
        Next responsible person:{" "}
        {progress.actor ? caseActors[progress.actor] : "No pending case action"}
        .
      </p>
      <p>
        Leo accepts the authored follow-up nomination. Maya separately reviews
        case resolution in this local exercise. These controls do not
        authenticate people, allocate workshop delivery or grant publication
        authority.
      </p>
      <p>
        Closure requires the latest brief's exact delivery and receipt; linked
        K-01 input must remain applicable. The reviewer must inspect whether its
        audience/schedule content satisfies the stated requirements. Receipt
        alone never closes the case or verifies workshop outcomes.
      </p>
      {progress.stale && (
        <p role="alert">
          The proposed or approved source is no longer current. Reopen the case
          before proposing another resolution. Earlier decisions remain in
          history.
        </p>
      )}
      {!caseEvidence(context) && (
        <p>
          No current received brief is available for resolution. Coordinate
          preparation/delivery/receipt or correct the linked guide input first.
        </p>
      )}
      <label>
        Case acting person
        <select
          aria-label="Case acting person"
          value={actor}
          onChange={(e) => setActor(e.target.value as "leo" | "maya")}
        >
          {Object.entries(caseActors).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {events.length >= 40 ? (
        <p>
          Forty-record local history limit reached. Retained decisions remain
          available; this exercise cannot record further transitions.
        </p>
      ) : options.length ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next = recordCaseEvent(
              events,
              context,
              actor,
              selected,
              rationale,
              new Date().toISOString(),
            );
            if (next !== events) setPreview({ identity, events: next });
          }}
        >
          <label>
            Case action
            <select
              aria-label="Case action"
              value={selected}
              onChange={(e) => setAction(e.target.value as CaseAction)}
            >
              {options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Case rationale and remaining conditions
            <textarea
              aria-label="Case rationale and remaining conditions"
              required
              maxLength={3000}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>
          <button className="button secondary">Review case change</button>
        </form>
      ) : (
        <p>
          This person has no action at this stage. Inspect the next responsible
          person above.
        </p>
      )}
      {preview?.identity === identity && (
        <section aria-label="Confirm coordination case change">
          <h3>Confirm {selected}</h3>
          <p>
            {caseActors[actor]} · {rationale}
          </p>
          <p>
            Only this case's coordination status changes. Source records and
            workstream outcomes remain separate.
          </p>
          <details>
            <summary>Exact proposed record and source context</summary>
            <pre>{JSON.stringify(preview.events.at(-1), null, 2)}</pre>
          </details>
          <button
            className="button primary"
            onClick={() => {
              onChange(preview.events);
              setPreview(undefined);
              setRationale("");
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            Record case change locally
          </button>
          <button
            className="button secondary"
            onClick={() => setPreview(undefined)}
          >
            Cancel case change
          </button>
        </section>
      )}
      <details>
        <summary>Inspect current resolution evidence</summary>
        {context.brief.versions.at(-1) ? (
          <>
            <h3>Workshop brief · v{context.brief.versions.at(-1)!.version}</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {context.brief.versions.at(-1)!.body}
            </p>
            <p>
              {context.brief.versions.at(-1)!.receipt
                ? `Receipt: ${context.brief.versions.at(-1)!.receipt!.id}`
                : "No receipt for this version"}
            </p>
            <p>
              {caseEvidence(context)
                ? "Current source available for a separate case-resolution decision."
                : "This source cannot support case resolution yet."}
            </p>
          </>
        ) : (
          <p>No brief delivery recorded.</p>
        )}
        <details>
          <summary>Exact source identities and frozen input</summary>
          <pre>{caseEvidence(context) ?? "No current received source"}</pre>
        </details>
      </details>
      {!!events.length && (
        <details>
          <summary>Retained case history · {events.length} records</summary>
          {events.map((event) => (
            <article key={event.id}>
              <h3>
                {event.action} · {caseActors[event.actor]}
              </h3>
              <p>
                {event.at} · {event.id}
                {event.proposalId ? ` · proposal ${event.proposalId}` : ""}
              </p>
              <p>{event.rationale}</p>
              <details>
                <summary>Exact historical context · {event.id}</summary>
                <pre>{JSON.stringify(event, null, 2)}</pre>
              </details>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
export function CaseStatus({
  events,
  context,
  actor,
  onOpen,
}: {
  events: CaseEvent[];
  context: CaseContext;
  actor?: string;
  onOpen: () => void;
}) {
  if (!events.length) return null;
  const progress = caseProgress(events, context);
  if (actor && actor !== "leo" && actor !== progress.actor) return null;
  return (
    <section
      className="panel org-stream"
      aria-label="Workshop brief case progress"
    >
      <h2>Workshop brief · coordination case</h2>
      <p>{progress.status}</p>
      <p>{progress.nextStep}</p>
      <p>
        {progress.actor
          ? `Next responsibility: ${caseActors[progress.actor]}`
          : "No pending case action"}
        . Separate from assignment counts and workshop outcome.
      </p>
      <button className="button secondary" onClick={onOpen}>
        Inspect workshop brief case
      </button>
    </section>
  );
}

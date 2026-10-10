import { useState } from "react";
import { workshopActors } from "./data/workshop";
import {
  exceptionSources,
  exceptionTickets,
  exceptionActions,
  exceptionProgress,
  recordException,
  type ExceptionEvent,
  type ExceptionContext,
  type ExceptionAction,
} from "./data/exceptionLoop";
export function ExceptionLoop({
  events,
  context,
  onChange,
  initialActor,
  initialTicket,
  onSource,
}: {
  initialActor?: ExceptionEvent["actor"];
  initialTicket?: string;
  events: ExceptionEvent[];
  context: ExceptionContext;
  onChange: (events: ExceptionEvent[]) => void;
  onSource: (path: string) => void;
}) {
  const tickets = exceptionTickets(events),
    sources = exceptionSources(context).filter(
      (source) =>
        !tickets.some((id) => {
          const p = exceptionProgress(events, id, context);
          return (
            !p.closed &&
            p.source?.id === source.id &&
            p.source.snapshot === source.snapshot
          );
        }),
    );
  const [ticket, setTicket] = useState(initialTicket ?? ""),
    [sourceId, setSourceId] = useState(""),
    [actor, setActor] = useState<ExceptionEvent["actor"]>(initialActor ?? "owner"),
    [action, setAction] = useState<ExceptionAction>("Open exception"),
    [assignee, setAssignee] = useState<"leo" | "maya">("leo"),
    [body, setBody] = useState("");
  const [preview, setPreview] = useState<{
    identity: string;
    events: ExceptionEvent[];
  }>();
  const selectedTicket = tickets.includes(ticket)
      ? ticket
      : (initialTicket ? "" : tickets.at(-1) ?? ""),
    p = exceptionProgress(events, selectedTicket, context);
  const options: ExceptionAction[] = [
    ...(actor === "owner" && sources.length ? ["Open exception" as const] : []),
    ...exceptionActions(events, selectedTicket, context, actor),
  ];
  const selected = options.includes(action) ? action : options[0],
    source = sources.find((s) => s.id === sourceId) ?? sources[0];
  const identity = JSON.stringify({
    events,
    context,
    selectedTicket,
    source,
    actor,
    selected,
    assignee,
    body,
  });
  return (
    <section className="panel" aria-label="Local exception lifecycle">
      <h2 tabIndex={-1} data-next-action={initialActor ? "true" : undefined}>Exception handling</h2>
      <p>
        Open an observed issue explicitly; detection does not allocate work.
        Demo actor selection is not authentication. Handling responsibilities
        are separate from authored assignment counts. Closing an exception never
        grants authority or establishes workshop learning outcomes.
      </p>
      <h3>Observed K-02 conditions</h3>
      {sources.length ? (
        <ul>
          {sources.map((s) => (
            <li key={s.id}>
              {s.kind}: {s.title}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No new untracked exception condition available. Existing tickets still
          require their separate review.
        </p>
      )}
      {initialTicket && !tickets.includes(initialTicket) && <p role="status">The requested exception ticket is not in this workspace. Select a recorded ticket explicitly.</p>}
      <label>
        Exception ticket
        <select
          aria-label="Exception ticket"
          value={selectedTicket}
          onChange={(e) => {
            setTicket(e.target.value);
            setPreview(undefined);
          }}
        >
          {(!tickets.length || !selectedTicket) && <option value="">{tickets.length ? "Select a recorded ticket" : "No recorded tickets"}</option>}
          {tickets.map((id) => (
            <option key={id}>{id}</option>
          ))}
        </select>
      </label>
      {p.first && (
        <>
          <h3>{p.source!.title}</h3>
          <p>{p.status}</p>
          <p>
            Next responsible: {p.actor ? workshopActors[p.actor] : "None"}.{" "}
            {p.next}
          </p>
          <p>
            {p.currentResolution
              ? "A represented remedy is available for separate response and review."
              : "No qualifying current remedy. Operational work remains separate."}
          </p>
          <button
            className="text-link"
            onClick={() => onSource(p.source!.destination)}
          >
            Inspect underlying issue
          </button>
        </>
      )}
      <label>
        Exception actor
        <select
          aria-label="Exception actor"
          value={actor}
          onChange={(e) => {
            setActor(e.target.value as ExceptionEvent["actor"]);
            setPreview(undefined);
          }}
        >
          {Object.entries(workshopActors).map(([id, label]) => (
            <option value={id} key={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Exception action
        <select
          aria-label="Exception action"
          value={selected ?? ""}
          onChange={(e) => {
            setAction(e.target.value as ExceptionAction);
            setPreview(undefined);
          }}
        >
          {!options.length && (
            <option value="">No available action for this actor</option>
          )}
          {options.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      {selected === "Open exception" && (
        <label>
          Observed issue
          <select
            aria-label="Observed exception issue"
            value={source?.id ?? ""}
            onChange={(e) => {
              setSourceId(e.target.value);
              setPreview(undefined);
            }}
          >
            {sources.map((s) => (
              <option value={s.id} key={s.id}>
                {s.kind} · {s.title}
              </option>
            ))}
          </select>
        </label>
      )}
      {selected === "Offer handling" && (
        <label>
          Proposed handler
          <select
            aria-label="Proposed exception handler"
            value={assignee}
            onChange={(e) => {
              setAssignee(e.target.value as "leo" | "maya");
              setPreview(undefined);
            }}
          >
            <option value="leo">Leo</option>
            <option value="maya">Maya</option>
          </select>
        </label>
      )}
      <label>
        Response, evidence and rationale
        <textarea
          aria-label="Exception response and rationale"
          maxLength={3000}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setPreview(undefined);
          }}
          placeholder="Explain the observed issue, exact handling scope, remedy or review findings."
        />
      </label>
      <button
        className="button secondary"
        disabled={!selected || !body.trim() || events.length >= 40}
        onClick={() => {
          const next = recordException(
            events,
            context,
            actor,
            selected,
            selectedTicket,
            body,
            new Date().toISOString(),
            selected === "Open exception" ? source?.id : undefined,
            selected === "Offer handling" ? assignee : undefined,
          );
          if (next !== events) setPreview({ identity, events: next });
        }}
      >
        Review exception record
      </button>
      {preview && (
        <section aria-label="Exception record preview">
          <h3>Review exact exception record</h3>
          <p>
            {preview.events.at(-1)!.ticketId} · {workshopActors[actor]} ·{" "}
            {selected}
          </p>
          <p>{body}</p>
          <p>
            {selected === "Offer handling"
              ? `Offer to ${workshopActors[assignee]}; acceptance remains separate.`
              : "No operational source, assignment or goal decision is changed."}
          </p>
          <details>
            <summary>Frozen issue, remedy and context</summary>
            <pre>{JSON.stringify(preview.events.at(-1), null, 2)}</pre>
          </details>
          <button
            className="button"
            disabled={preview.identity !== identity}
            onClick={() => {
              if (preview.identity === identity) {
                onChange(preview.events);
                setTicket(preview.events.at(-1)!.ticketId);
                setPreview(undefined);
                setBody("");
              }
            }}
          >
            Confirm exception record
          </button>
        </section>
      )}
      <h3>Retained history · {events.length}/40 records</h3>
      <p>
        Missing brief: deliver and receive a current usable brief. Declined
        allocation: a later cycle must have an accepted facilitator. Failed
        session: a later cycle must record successful simulated execution. Each
        remedy requires a separate handler response and owner review.
      </p>
      <details>
        <summary>Exception history</summary>
        {events.map((e) => (
          <article key={e.id}>
            <h3>
              {e.ticketId} · {e.action}
            </h3>
            <p>
              {e.id} · {workshopActors[e.actor]} · {e.at}
            </p>
            <p>{e.body}</p>
            <pre>{JSON.stringify(e, null, 2)}</pre>
          </article>
        ))}
      </details>
    </section>
  );
}
export function ExceptionStatus({
  events,
  context,
  actor,
  onOpen,
}: {
  events: ExceptionEvent[];
  context: ExceptionContext;
  actor?: string;
  onOpen: () => void;
}) {
  const active = exceptionTickets(events)
    .map((id) => exceptionProgress(events, id, context))
    .filter((p) => !p.closed && (!actor || p.actor === actor));
  if (actor && !active.length) return null;
  return (
    <section className="panel" aria-label="Exception responsibilities">
      <h2>K-02 · exception follow-up</h2>
      <p>
        {active.length} pending local handling responsibilities
        {actor ? " for this actor" : ""}. These are separate from assignment
        counts.
      </p>
      {active.map((p) => (
        <p key={p.first!.ticketId}>
          {p.first!.ticketId}: {p.status} ·{" "}
          {p.actor ? workshopActors[p.actor] : "Unallocated"}. {p.next}
        </p>
      ))}
      <button className="text-link" onClick={onOpen}>
        Open exception handling
      </button>
    </section>
  );
}

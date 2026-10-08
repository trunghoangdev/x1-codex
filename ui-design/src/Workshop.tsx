import { useState } from "react";
import {
  availableWorkshopActions,
  recordWorkshopEvent,
  workshopActors,
  workshopProgress,
  type WorkshopActor,
  type WorkshopAction,
  type WorkshopContext,
  type WorkshopEvent,
} from "./data/workshop";
export function Workshop({
  events,
  context,
  onChange,
}: {
  events: WorkshopEvent[];
  context: WorkshopContext;
  onChange: (events: WorkshopEvent[]) => void;
}) {
  const [actor, setActor] = useState<WorkshopActor>("owner");
  const [action, setAction] = useState<WorkshopAction>("Offer facilitation");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState<{
    identity: string;
    events: WorkshopEvent[];
  }>();
  const p = workshopProgress(events, context),
    options = availableWorkshopActions(events, context, actor);
  const selected = options.includes(action) ? action : options[0];
  const identity = JSON.stringify({ events, context, actor, selected, body });
  const brief =
    p.cycle[0]?.context.brief.versions.at(-1) ?? context.brief.versions.at(-1);
  const preparation = [...p.cycle]
    .reverse()
    .find((e) => e.action === "Submit preparation");
  const observations = p.cycle.find((e) => e.action === "Record observations");
  return (
    <section className="panel org-stream" aria-label="Local workshop lifecycle">
      <h2>{p.status}</h2>
      <p>{p.nextStep}</p>
      <p>
        Local simulation only. Selecting an actor is a demo control, not
        authentication. No invitations, scheduling, external execution or real
        participant results are created. Leo’s Coordinator role does not confer
        facilitation; acceptance creates a separate K-02 responsibility. Maya
        reviews independently.
      </p>
      <p>
        Criterion: members demonstrate applying the welcome guide in the
        practical exercise described in the preparation plan. Record audience,
        exercise, evidence and limitations in each relevant step.
      </p>
      <div aria-label="Workshop source and evidence">
        <h3>{p.last ? "Retained cycle source" : "Current brief"}</h3>
        {brief ? (
          <>
            <p>
              brief-v{brief.version} ·{" "}
              {brief.receipt
                ? `Receipt ${brief.receipt.id}`
                : "Receipt missing"}
            </p>
            <p>{brief.body}</p>
          </>
        ) : (
          <p>No delivered brief.</p>
        )}
        {preparation && (
          <>
            <h3>Latest preparation plan</h3>
            <p>{preparation.body}</p>
          </>
        )}
        {p.execution && (
          <>
            <h3>Simulated session result</h3>
            <p>
              {p.execution.action}: {p.execution.body}
            </p>
          </>
        )}
        {observations && (
          <>
            <h3>Separate observations and limitations</h3>
            <p>{observations.body}</p>
          </>
        )}
      </div>
      {p.stale && (
        <p role="status">
          The retained brief or case resolution differs from the current source.{" "}
          {p.closed
            ? "This cycle is complete; a new cycle requires a current resolved brief and fresh allocation."
            : p.execution
              ? "Only observations and assessment of the already simulated session may continue."
              : "Cancel before starting a fresh allocation."}
        </p>
      )}
      <label>
        Workshop actor
        <select
          aria-label="Workshop actor"
          value={actor}
          onChange={(e) => {
            setActor(e.target.value as WorkshopActor);
            setPreview(undefined);
          }}
        >
          {Object.entries(workshopActors).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Workshop action
        <select
          aria-label="Workshop action"
          value={selected ?? ""}
          onChange={(e) => {
            setAction(e.target.value as WorkshopAction);
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
      {!events.length && !options.length && (
        <p>
          Receive the latest brief and approve its separate coordination-case
          resolution before offering facilitation.
        </p>
      )}
      <label>
        Evidence and rationale
        <textarea
          aria-label="Workshop evidence and rationale"
          maxLength={3000}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setPreview(undefined);
          }}
          placeholder="Plan, audience, exercise, stated criterion, observed result and limitations, as appropriate to this step."
        />
      </label>
      <button
        className="button secondary"
        disabled={!selected || !body.trim() || events.length >= 40}
        onClick={() => {
          const next = recordWorkshopEvent(
            events,
            context,
            actor,
            selected,
            body,
            new Date().toISOString(),
          );
          if (next !== events) setPreview({ identity, events: next });
        }}
      >
        Review workshop record
      </button>
      {preview && (
        <div role="region" aria-label="Workshop record preview">
          <h3>Review exact workshop record</h3>
          <p>
            {workshopActors[actor]} · {selected}
          </p>
          <p>{body}</p>
          <p>
            Cycle {preview.events.at(-1)!.cycle} · {preview.events.at(-1)!.id}
          </p>
          <details>
            <summary>Frozen source and record</summary>
            <pre>{JSON.stringify(preview.events.at(-1), null, 2)}</pre>
          </details>
          <button
            className="button"
            disabled={preview.identity !== identity}
            onClick={() => {
              if (preview.identity === identity) {
                onChange(preview.events);
                setPreview(undefined);
                setBody("");
              }
            }}
          >
            Confirm workshop record
          </button>
        </div>
      )}
      <h3>Retained workshop history · {events.length}/40 records</h3>
      <p>
        New cycles require fresh allocation, acceptance and preparation.
        Previous reviews never authorize a new brief. Cancelled and declined
        records remain visible.
      </p>
      {events.map((e) => (
        <details key={e.id}>
          <summary>
            Cycle {e.cycle} · {e.action} · {workshopActors[e.actor]}
          </summary>
          <p>
            {e.id} · {e.at}
          </p>
          <p>{e.body}</p>
          <pre>{JSON.stringify(e, null, 2)}</pre>
        </details>
      ))}
    </section>
  );
}
export function WorkshopStatus({
  events,
  context,
  actor,
  onOpen,
}: {
  events: WorkshopEvent[];
  context: WorkshopContext;
  actor?: string;
  onOpen: () => void;
}) {
  const p = workshopProgress(events, context);
  if (actor && p.actor !== actor) return null;
  return (
    <section className="panel" aria-label="Workshop progress">
      <h2>K-02 · workshop delivery</h2>
      <p>{p.status}</p>
      <p>Next responsible: {p.actor ? workshopActors[p.actor] : "None"}</p>
      <p>{p.nextStep}</p>
      <p>
        {p.accepted
          ? "Leo accepted a separate local facilitator allocation."
          : "No accepted facilitator allocation in this cycle."}{" "}
        Session and outcome remain separate records.
      </p>
      <button className="text-link" onClick={onOpen}>
        Open workshop delivery
      </button>
    </section>
  );
}

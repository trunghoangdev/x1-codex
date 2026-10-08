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
  type WorkshopAllocation,
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
  const [facilitator, setFacilitator] = useState<"leo" | "maya">("leo");
  const [reviewer, setReviewer] = useState<WorkshopActor>("maya");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState<{
    identity: string;
    events: WorkshopEvent[];
  }>();
  const p = workshopProgress(events, context),
    options = availableWorkshopActions(events, context, actor);
  const selected = options.includes(action) ? action : options[0];
  const allocation: WorkshopAllocation | undefined =
    selected === "Offer facilitation"
      ? { facilitator, reviewer }
      : selected === "Propose facilitator handoff"
        ? { facilitator, reviewer: p.reviewer }
        : undefined;
  const eligible =
    !allocation ||
    (allocation.facilitator !== allocation.reviewer &&
      (selected !== "Propose facilitator handoff" ||
        allocation.facilitator !== p.facilitator));
  const identity = JSON.stringify({
    events,
    context,
    actor,
    selected,
    body,
    allocation,
  });
  const brief =
    p.cycle[0]?.context.brief.versions.at(-1) ?? context.brief.versions.at(-1);
  const preparation = [...p.activeRecords]
    .reverse()
    .find((e) => e.action === "Submit preparation");
  const observations = p.activeRecords.find(
    (e) => e.action === "Record observations",
  );
  return (
    <section className="panel org-stream" aria-label="Local workshop lifecycle">
      <h2>{p.status}</h2>
      <p>{p.nextStep}</p>
      <p>
        Local simulation only. Selecting an actor is a demo control, not
        authentication. No invitations, scheduling, external execution or real
        participant results are created. Leo’s Coordinator role does not confer
        facilitation; acceptance creates a separate K-02 responsibility. The
        chosen reviewer must remain independent from every facilitator accepted
        in this cycle.
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
      <p>
        Current facilitator:{" "}
        {p.accepted ? workshopActors[p.facilitator] : "Not accepted"}. Reviewer:{" "}
        {workshopActors[p.reviewer]}.{" "}
        {p.pending
          ? `Pending recipient: ${workshopActors[p.pending.allocation!.facilitator]}. Responsibility has not transferred.`
          : ""}
      </p>
      {(selected === "Offer facilitation" ||
        selected === "Propose facilitator handoff") && (
        <>
          <label>
            Proposed facilitator
            <select
              aria-label="Proposed facilitator"
              value={facilitator}
              onChange={(e) => {
                setFacilitator(e.target.value as "leo" | "maya");
                setPreview(undefined);
              }}
            >
              <option value="leo">Leo</option>
              <option value="maya">Maya</option>
            </select>
          </label>
          {selected === "Offer facilitation" ? (
            <label>
              Independent workshop reviewer
              <select
                aria-label="Independent workshop reviewer"
                value={reviewer}
                onChange={(e) => {
                  setReviewer(e.target.value as WorkshopActor);
                  setPreview(undefined);
                }}
              >
                <option value="maya">Maya</option>
                <option value="leo">Leo</option>
                <option value="owner">
                  Demo organization owner · local reviewer
                </option>
              </select>
            </label>
          ) : (
            <p>
              Reviewer stays {workshopActors[p.reviewer]}. The target cannot be
              the reviewer or the current facilitator.
            </p>
          )}
          <p>
            Review candidate capability, availability and constraints above.
            Maya has no declared facilitation capability and only a review
            availability example; an offer is a local proposal requiring
            explicit rationale and acceptance, not verified readiness.
          </p>
          {!eligible && (
            <p role="status">
              Choose a distinct facilitator and reviewer. For handoff between
              Leo and Maya, start a cycle with the demo owner as independent
              reviewer.
            </p>
          )}
        </>
      )}
      {p.accepted && !p.execution && p.reviewer !== "owner" && (
        <p>
          Current reviewer is the other human candidate. Handoff to that
          reviewer is blocked; cancel and offer a fresh cycle with an
          independent reviewer if needed.
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
        disabled={!selected || !body.trim() || !eligible || events.length >= 40}
        onClick={() => {
          const next = recordWorkshopEvent(
            events,
            context,
            actor,
            selected,
            body,
            new Date().toISOString(),
            allocation,
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
          {allocation && (
            <p>
              Offer to {workshopActors[allocation.facilitator]} · independent
              reviewer {workshopActors[allocation.reviewer]}. No transfer until
              acceptance.
            </p>
          )}
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
          ? `${workshopActors[p.facilitator]} accepted a separate local facilitator allocation.`
          : "No accepted facilitator allocation in this cycle."}{" "}
        Session and outcome remain separate records.
      </p>
      <button className="text-link" onClick={onOpen}>
        Open workshop delivery
      </button>
    </section>
  );
}

import { ResponsibilityLifecycle } from "./ResponsibilityLifecycle";
import { responsibilityState } from "./data/responsibilityLifecycle";
import { useState } from "react";
import {
  allocationPreview,
  type ResponsibilityProposal,
} from "./data/responsibilityProposals";
import { workers } from "./data/organizationOverview";
export function LocalResponsibilities({
  onChange,
  proposals,
  workerId,
  streamId,
  personal = false,
  onInspect,
}: {
  onChange: (p: Record<string, ResponsibilityProposal>) => void;
  proposals: Record<string, ResponsibilityProposal>;
  workerId?: string;
  streamId?: string;
  personal?: boolean;
  onInspect: (gapId: string) => void;
}) {
  const [person, setPerson] = useState("alex");
  const allocations = Object.values(proposals).filter(
    (p) =>
      p.allocation &&
      (!workerId ||
        responsibilityState(p).workerId === workerId ||
        p.workerId === workerId ||
        p.responsibilityHistory?.some(
          (e) => e.kind === "Accept transfer" && e.actorId === workerId,
        ) ||
        responsibilityState(p).pending?.targetWorkerId === workerId) &&
      (!streamId || p.allocation.streamId === streamId) &&
      (!personal ||
        responsibilityState(p).workerId === person ||
        p.workerId === person ||
        p.responsibilityHistory?.some(
          (e) => e.kind === "Accept transfer" && e.actorId === person,
        ) ||
        responsibilityState(p).pending?.targetWorkerId === person),
  );
  if (!Object.values(proposals).some((p) => p.allocation)) return null;
  return (
    <section
      className="panel org-stream"
      aria-label="Local allocated responsibilities"
    >
      <h2>
        {personal
          ? "Local assignment inbox"
          : "Local allocated responsibilities"}
      </h2>
      {personal && (
        <label>
          Sample worker for local assignments
          <select value={person} onChange={(e) => setPerson(e.target.value)}>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <p>
        Recorded local allocations, separate from authored assignment counters.
        Sample-worker inspection does not sign in or grant permission. No
        execution or effective permission is established; acceptance is recorded
        separately below.
      </p>
      {!allocations.length && <p>No local allocations in this selection.</p>}
      {allocations.map((p) => (
        <article key={p.allocation!.id} aria-label={p.allocation!.assignmentId}>
          <h3>{allocationPreview(p).assignment}</h3>
          <p>
            {p.allocation!.assignmentId} ·{" "}
            {
              workers.find((w) => w.id === responsibilityState(p).workerId)
                ?.name
            }{" "}
            · {p.role} · {p.scope} · WS-02.
          </p>
          <p>
            Allocated locally · prerequisites pending.{" "}
            {allocationPreview(p).prerequisites}
          </p>
          <p>
            Current binding: {responsibilityState(p).bindingId} · original
            allocation binding {p.allocation!.bindingId} ·{" "}
            {p.allocation!.bindingMode}. Original gap: {p.gapId} → local
            resolution {p.allocation!.id}.
          </p>
          <p>
            {(personal ? person : workerId) &&
            (personal ? person : workerId) !== responsibilityState(p).workerId
              ? responsibilityState(p).pending?.targetWorkerId ===
                (personal ? person : workerId)
                ? "Offered transfer · not current ownership"
                : "Historical ownership · no current assignment for this selection"
              : "Current local assignment · work prerequisites still pending"}
          </p>
          <ResponsibilityLifecycle
            actorContext={personal ? person : workerId}
            proposal={p}
            proposals={proposals}
            onChange={onChange}
          />
          <button
            className="button secondary"
            onClick={() => onInspect(p.gapId)}
          >
            Inspect allocation · {p.allocation!.assignmentId}
          </button>
        </article>
      ))}
    </section>
  );
}

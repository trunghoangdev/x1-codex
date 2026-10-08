import { useState } from "react";
import {
  allocationPreview,
  type ResponsibilityProposal,
} from "./data/responsibilityProposals";
import { workers } from "./data/organizationOverview";
export function LocalResponsibilities({
  proposals,
  workerId,
  streamId,
  personal = false,
  onInspect,
}: {
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
      (!workerId || p.workerId === workerId) &&
      (!streamId || p.allocation.streamId === streamId) &&
      (!personal || p.workerId === person),
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
        execution or performer acceptance is established.
      </p>
      {!allocations.length && <p>No local allocations in this selection.</p>}
      {allocations.map((p) => (
        <article key={p.allocation!.id} aria-label={p.allocation!.assignmentId}>
          <h3>{allocationPreview(p).assignment}</h3>
          <p>
            {p.allocation!.assignmentId} ·{" "}
            {workers.find((w) => w.id === p.workerId)?.name} · {p.role} ·{" "}
            {p.scope} · WS-02.
          </p>
          <p>
            Allocated locally · prerequisites pending.{" "}
            {allocationPreview(p).prerequisites}
          </p>
          <p>
            Binding: {p.allocation!.bindingId} · {p.allocation!.bindingMode}.
            Original gap: {p.gapId} → local resolution {p.allocation!.id}.
          </p>
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

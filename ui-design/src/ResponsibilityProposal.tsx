import { useEffect, useRef, useState } from "react";
import { responsibilityGaps } from "./data/workerDetails";
import { workers } from "./data/organizationOverview";
import {
  proposalRequirements,
  type ResponsibilityProposal as Proposal,
} from "./data/responsibilityProposals";

export function ResponsibilityProposal({
  gapId,
  proposal,
  onRecord,
  onRemove,
}: {
  gapId: string;
  proposal?: Proposal;
  onRecord: (proposal: Proposal) => void;
  onRemove: () => void;
}) {
  const receiptHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (proposal) receiptHeading.current?.focus();
  }, [proposal]);
  const gap = responsibilityGaps.find((gap) => gap.id === gapId)!;
  const requirement = proposalRequirements[gapId];
  const [workerId, setWorkerId] = useState("");
  const [rationale, setRationale] = useState("");
  return (
    <>
      <div className="modal-kicker">LOCAL COORDINATION PROPOSAL</div>
      <h3>{gap.title}</h3>
      <p>{requirement.note}</p>
      <dl className="artifact-properties">
        <dt>Role</dt>
        <dd>{requirement.role}</dd>
        <dt>Scope</dt>
        <dd>{requirement.scope}</dd>
      </dl>
      {proposal ? (
        <section aria-label="Recorded responsibility proposal">
          <h3 ref={receiptHeading} tabIndex={-1}>
            Proposal recorded · awaiting allocation
          </h3>
          <p>
            {workers.find((w) => w.id === proposal.workerId)?.name} ·{" "}
            {proposal.role}
          </p>
          <p>{proposal.scope}</p>
          <p>{proposal.rationale}</p>
          <p>
            <time dateTime={proposal.recordedAt}>
              {new Date(proposal.recordedAt).toLocaleString()}
            </time>
          </p>
          <p>
            No worker binding, assignment or permission was changed. The
            responsibility gap remains open.
          </p>
          <button className="button secondary" onClick={onRemove}>
            Remove local proposal
          </button>
        </section>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!requirement.workerIds.includes(workerId) || !rationale.trim())
              return;
            onRecord({
              id: `proposal-${crypto.randomUUID()}`,
              gapId,
              workerId,
              role: requirement.role,
              scope: requirement.scope,
              rationale: rationale.trim(),
              recordedAt: new Date().toISOString(),
            });
          }}
        >
          <label className="proposal-field">
            Proposed worker
            <select
              aria-label="Proposed worker"
              data-initial-focus
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              required
            >
              <option value="">Choose a sample worker</option>
              {requirement.workerIds.map((id) => {
                const worker = workers.find((w) => w.id === id)!;
                return (
                  <option key={id} value={id}>
                    {worker.name} · {worker.type}
                  </option>
                );
              })}
            </select>
          </label>
          <p>
            Candidate choices are authored examples. Availability, capability
            and effective permissions have not been verified.
          </p>
          <label className="proposal-field">
            Reason for proposal
            <textarea
              aria-label="Reason for proposal"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              required
              rows={4}
            />
          </label>
          <p>
            Recording saves a proposal in this browser session for review.
            Allocation requires a separate decision; refresh clears proposals.
          </p>
          <button
            className="button primary"
            type="submit"
            disabled={!workerId || !rationale.trim()}
          >
            Record local proposal
          </button>
        </form>
      )}
    </>
  );
}

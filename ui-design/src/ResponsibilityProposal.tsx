import { useEffect, useRef, useState } from "react";
import { responsibilityGaps } from "./data/workerDetails";
import { workers } from "./data/organizationOverview";
import {
  allocationPreview,
  proposalRequirements,
  type ResponsibilityProposal as Proposal,
} from "./data/responsibilityProposals";

export function ResponsibilityProposal({
  gapId,
  proposal,
  onRecord,
  onDecide,
  onRemove,
}: {
  gapId: string;
  proposal?: Proposal;
  onRecord: (proposal: Proposal) => void;
  onDecide: (decision: NonNullable<Proposal["decision"]>) => void;
  onRemove: () => void;
}) {
  const receiptHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (proposal) receiptHeading.current?.focus();
  }, [proposal]);
  const gap = responsibilityGaps.find((gap) => gap.id === gapId)!;
  const requirement = proposalRequirements[gapId];
  const [reviewing, setReviewing] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionOutcome, setDecisionOutcome] = useState<
    "Accepted" | "Rejected"
  >("Accepted");
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (reviewing) reviewHeading.current?.focus();
  }, [reviewing]);
  const [workerId, setWorkerId] = useState("");
  const [rationale, setRationale] = useState("");
  return (
    <div className="proposal-content">
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
            {proposal.decision
              ? `${proposal.decision.outcome} locally · ${proposal.decision.outcome === "Accepted" ? "allocation pending" : "no allocation planned"}`
              : "Proposal recorded · awaiting allocation"}
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
          {proposal.decision ? (
            <section aria-label="Allocation decision receipt">
              <h4>Local allocation decision</h4>
              <p>
                {proposal.decision.reviewer} · {proposal.decision.outcome}
              </p>
              <p>{proposal.decision.rationale}</p>
              <p>
                <time dateTime={proposal.decision.recordedAt}>
                  {new Date(proposal.decision.recordedAt).toLocaleString()}
                </time>
              </p>
              <p>
                {proposal.decision.outcome === "Accepted"
                  ? "The plan was accepted in this demo. Binding and assignment creation remain pending; the worker has not been allocated."
                  : "The plan was rejected in this demo. No binding or assignment creation is planned."}
              </p>
            </section>
          ) : !reviewing ? (
            <button
              className="button primary"
              onClick={() => setReviewing(true)}
            >
              Review allocation plan
            </button>
          ) : null}
          {(reviewing || proposal.decision) && (
            <section aria-label="Proposed allocation changes">
              <h3 ref={reviewHeading} tabIndex={-1}>
                Allocation preview
              </h3>
              <p>
                Demo reviewer: Jamie Chen · Planner. This authored review role
                does not establish live allocation authority or change the
                signed-in user.
              </p>
              <dl className="artifact-properties">
                <dt>Worker</dt>
                <dd>{workers.find((w) => w.id === proposal.workerId)?.name}</dd>
                <dt>Role and scope</dt>
                <dd>
                  {proposal.role} · {proposal.scope}
                </dd>
                <dt>Binding plan</dt>
                <dd>{allocationPreview(proposal).binding}</dd>
                <dt>Assignment to create</dt>
                <dd>{allocationPreview(proposal).assignment}</dd>
                <dt>Before work can start</dt>
                <dd>{allocationPreview(proposal).prerequisites}</dd>
              </dl>
              <p>
                No assignment ID is reserved. Validation and allocation would be
                separate steps; accepting this plan does not create work or
                close the gap.
              </p>
            </section>
          )}
          {reviewing && !proposal.decision && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!decisionReason.trim()) return;
                onDecide({
                  outcome: decisionOutcome,
                  rationale: decisionReason.trim(),
                  recordedAt: new Date().toISOString(),
                  reviewer: "Jamie Chen · Planner (demo reviewer)",
                });
                setReviewing(false);
              }}
            >
              <label className="proposal-field">
                Allocation decision
                <select
                  aria-label="Allocation decision"
                  value={decisionOutcome}
                  onChange={(event) =>
                    setDecisionOutcome(
                      event.target.value as "Accepted" | "Rejected",
                    )
                  }
                >
                  <option value="Accepted">Accept plan locally</option>
                  <option value="Rejected">Reject plan locally</option>
                </select>
              </label>
              <label className="proposal-field">
                Decision reason
                <textarea
                  aria-label="Decision reason"
                  required
                  rows={3}
                  value={decisionReason}
                  onChange={(event) => setDecisionReason(event.target.value)}
                />
              </label>
              <div className="workstream-actions">
                <button
                  className="button primary"
                  type="submit"
                  disabled={!decisionReason.trim()}
                >
                  Record allocation decision
                </button>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => {
                    setReviewing(false);
                    setDecisionReason("");
                    setDecisionOutcome("Accepted");
                  }}
                >
                  Cancel review
                </button>
              </div>
            </form>
          )}
          <button className="button secondary" onClick={onRemove}>
            {proposal.decision
              ? "Remove local proposal and decision"
              : "Remove local proposal"}
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
    </div>
  );
}

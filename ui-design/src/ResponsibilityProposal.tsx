import { WorkerCapability } from "./WorkerCapability";
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
  onAllocate,
}: {
  gapId: string;
  proposal?: Proposal;
  onRecord: (proposal: Proposal) => void;
  onDecide: (decision: NonNullable<Proposal["decision"]>) => void;
  onRemove: () => void;
  onAllocate: () => void;
}) {
  const receiptHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!proposal) return;
    const frame = requestAnimationFrame(() => receiptHeading.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [proposal]);
  const gap = responsibilityGaps.find((gap) => gap.id === gapId)!;
  const requirement = proposalRequirements[gapId];
  const [confirmAllocation, setConfirmAllocation] = useState(false);
  const allocationHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (confirmAllocation) allocationHeading.current?.focus();
  }, [confirmAllocation]);
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
      {!reviewing && !proposal?.decision && (
        <>
          <p>{requirement.note}</p>
          <dl className="artifact-properties">
            <dt>Role</dt>
            <dd>{requirement.role}</dd>
            <dt>Scope</dt>
            <dd>{requirement.scope}</dd>
          </dl>
        </>
      )}
      {(proposal?.workerId || workerId) && (
        <details className="directory-record-details">
          <summary>Inspect candidate capability and availability</summary>
          <WorkerCapability workerId={proposal?.workerId || workerId} />
        </details>
      )}
      {proposal ? (
        <section aria-label="Recorded responsibility proposal">
          <h3 ref={receiptHeading} tabIndex={-1}>
            {proposal.allocation
              ? "Allocation recorded locally · work prerequisites pending"
              : proposal.decision
                ? `${proposal.decision.outcome} locally · ${proposal.decision.outcome === "Accepted" ? "allocation pending" : "no allocation planned"}`
                : "Proposal recorded · awaiting allocation"}
          </h3>
          <p>
            {workers.find((w) => w.id === proposal.workerId)?.name} ·{" "}
            {proposal.role}
          </p>
          {reviewing || proposal.decision ? (
            <details className="proposal-original">
              <summary>Original proposal reason and time</summary>{" "}
              <p>{proposal.scope}</p>
              <p>{proposal.rationale}</p>
              <p>
                <time dateTime={proposal.recordedAt}>
                  {new Date(proposal.recordedAt).toLocaleString()}
                </time>
              </p>
            </details>
          ) : (
            <>
              {" "}
              <p>{proposal.scope}</p>
              <p>{proposal.rationale}</p>
              <p>
                <time dateTime={proposal.recordedAt}>
                  {new Date(proposal.recordedAt).toLocaleString()}
                </time>
              </p>
            </>
          )}
          {proposal.allocation ? (
            <section aria-label="Recorded local allocation">
              <h4>Local responsibility allocated</h4>
              <p>
                {proposal.allocation.id} · from {proposal.allocation.proposalId}
              </p>
              <p>
                Assignment: {proposal.allocation.assignmentId} ·{" "}
                {proposal.workerId} · {proposal.role} · {proposal.scope}.
              </p>
              <p>
                Binding: {proposal.allocation.bindingId} ·{" "}
                {proposal.allocation.bindingMode} ·{" "}
                {proposal.allocation.recordedAt} ·{" "}
                {proposal.allocation.allocator}.
              </p>
              <p>
                The original gap is preserved with this local resolution
                reference. Performer acceptance, capability, capacity and
                effective permission remain unverified. Work prerequisites still
                apply.
              </p>
            </section>
          ) : (
            <p>
              No worker binding, assignment or permission was changed. The
              responsibility gap remains open.
            </p>
          )}
          {proposal.decision?.outcome === "Accepted" &&
            !proposal.allocation &&
            (!confirmAllocation ? (
              <button
                className="button primary"
                onClick={() => setConfirmAllocation(true)}
              >
                Prepare local allocation
              </button>
            ) : (
              <section aria-label="Confirm local allocation">
                <h4 ref={allocationHeading} tabIndex={-1}>
                  Confirm separate allocation
                </h4>
                <p>
                  Create one local assignment for {proposal.workerId} in WS-02.{" "}
                  {allocationPreview(proposal).binding} This does not start
                  execution or establish performer acceptance. It will appear in
                  local responsibilities and role/workstream views.
                </p>
                <button
                  className="button primary"
                  onClick={() => {
                    onAllocate();
                    setConfirmAllocation(false);
                  }}
                >
                  Record local allocation
                </button>{" "}
                <button
                  className="button secondary"
                  onClick={() => {
                    setConfirmAllocation(false);
                    receiptHeading.current?.focus();
                  }}
                >
                  Cancel allocation
                </button>
              </section>
            ))}
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
                {proposal.allocation
                  ? "This plan was accepted earlier; a separate local allocation is now recorded. The decision alone did not create it."
                  : proposal.decision.outcome === "Accepted"
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
                {proposal.allocation
                  ? "The allocation record above names the created assignment; this section retains the original plan."
                  : "No assignment ID is reserved. Validation and allocation would be separate steps; accepting this plan does not create work or close the gap."}
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
          <button
            className="button secondary"
            disabled={!!proposal.allocation}
            onClick={onRemove}
          >
            {proposal.allocation
              ? "Allocated proposal retained"
              : proposal.decision
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
              proposer: "Alex Morgan (demo proposer)",
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
            Allocation requires a separate decision. Save from Demos → Demo
            continuity to retain recorded proposals after reload.
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

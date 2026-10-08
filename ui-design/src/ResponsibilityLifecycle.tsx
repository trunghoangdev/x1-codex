import { useEffect, useRef, useState } from "react";
import {
  proposalRequirements,
  type ResponsibilityProposal,
} from "./data/responsibilityProposals";
import {
  recordResponsibilityEvent,
  responsibilityState,
  type ResponsibilityEvent,
} from "./data/responsibilityLifecycle";
export function ResponsibilityLifecycle({
  proposal,
  proposals,
  onChange,
  actorContext,
}: {
  actorContext?: string;
  proposal: ResponsibilityProposal;
  proposals: Record<string, ResponsibilityProposal>;
  onChange: (p: Record<string, ResponsibilityProposal>) => void;
}) {
  const current = responsibilityState(proposal),
    [kind, setKind] = useState<ResponsibilityEvent["kind"]>(
      "Accept responsibility",
    ),
    [rationale, setRationale] = useState(""),
    [handoff, setHandoff] = useState(""),
    [target, setTarget] = useState(""),
    [confirm, setConfirm] = useState(false);
  const result = useRef<HTMLHeadingElement>(null),
    preview = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    setConfirm(false);
  }, [proposal, kind, target, rationale, handoff, actorContext]);
  useEffect(() => {
    if (confirm) preview.current?.focus();
  }, [confirm]);
  const actor =
    kind === "Propose transfer" || kind === "Cancel transfer"
      ? "jamie"
      : kind.includes("transfer")
        ? current.pending?.targetWorkerId
        : current.workerId;
  const allOptions: ResponsibilityEvent["kind"][] = [
    "Accept responsibility",
    "Request clarification",
    "Decline responsibility",
    ...(current.pending
      ? (["Accept transfer", "Decline transfer", "Cancel transfer"] as const)
      : (["Propose transfer"] as const)),
  ];
  const options = allOptions.filter(
    (action) =>
      !actorContext ||
      ([
        "Accept responsibility",
        "Request clarification",
        "Decline responsibility",
      ].includes(action)
        ? actorContext === current.workerId
        : ["Propose transfer", "Cancel transfer"].includes(action)
          ? actorContext === "jamie"
          : actorContext === current.pending?.targetWorkerId),
  );
  useEffect(() => {
    if (!options.includes(kind) && options[0]) setKind(options[0]);
  }, [actorContext, current.workerId, current.pending?.id, kind]);
  return (
    <section aria-label={`Responsibility lifecycle ${proposal.gapId}`}>
      <h4 ref={result} tabIndex={-1}>
        {current.status} · current performer {current.workerId}
      </h4>
      <p>
        Allocation is separate from acceptance. Capacity, effective permission
        and execution remain unverified. Controls act as named demo
        participants, not authenticated identities.
      </p>
      {current.pending && (
        <p>
          Transfer proposed to {current.pending.targetWorkerId}; ownership stays
          with {current.workerId} until the proposed recipient explicitly
          accepts. Pending work/input context: {current.pending.handoff}
        </p>
      )}
      {options.length > 0 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setConfirm(true);
          }}
        >
          <label>
            Responsibility action
            <select
              value={kind}
              onChange={(e) =>
                setKind(e.target.value as ResponsibilityEvent["kind"])
              }
            >
              {options.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <p>Acting demo participant: {actor ?? "select a pending transfer"}</p>
          {kind === "Propose transfer" && (
            <>
              <label>
                Proposed recipient
                <select
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="">Choose performer</option>
                  {proposalRequirements[proposal.gapId].workerIds
                    .filter((id) => id !== current.workerId)
                    .map((id) => (
                      <option key={id}>{id}</option>
                    ))}
                </select>
              </label>
              <label>
                Pending work, exact inputs and decision history to inspect
                <textarea
                  required
                  maxLength={3000}
                  value={handoff}
                  onChange={(e) => setHandoff(e.target.value)}
                />
              </label>
            </>
          )}
          <label>
            Responsibility rationale
            <textarea
              required
              maxLength={3000}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>
          <p>
            Handoff transfers this local assignment only.
            Criteria/candidate/checks must still be supplied and inspected;
            prior reviews, exact input receipt and authorization are not
            transferred or approved.
          </p>
          <button
            className="button secondary"
            disabled={
              !actor ||
              !rationale.trim() ||
              (kind === "Propose transfer" && (!target || !handoff.trim()))
            }
          >
            Prepare responsibility action
          </button>
        </form>
      ) : (
        <p>
          Historical context only for this worker; no current responsibility
          action is offered.
        </p>
      )}
      {confirm && options.includes(kind) && (
        <section aria-label="Confirm responsibility action">
          <h4 ref={preview} tabIndex={-1}>
            Confirm {kind}
          </h4>
          <p>
            {actor} · {rationale} ·{" "}
            {target && kind === "Propose transfer" ? `Recipient ${target}` : ""}
          </p>
          <p>
            {kind === "Propose transfer" ? handoff : current.pending?.handoff}
          </p>
          <button
            className="button primary"
            onClick={() => {
              onChange(
                recordResponsibilityEvent(
                  proposals,
                  proposal.gapId,
                  kind,
                  actor!,
                  rationale,
                  new Date().toISOString(),
                  target,
                  handoff,
                ),
              );
              setConfirm(false);
              setRationale("");
              setKind("Accept responsibility");
              requestAnimationFrame(() => result.current?.focus());
            }}
          >
            Record responsibility action
          </button>
          <button
            className="button secondary"
            onClick={() => {
              setConfirm(false);
              result.current?.focus();
            }}
          >
            Cancel responsibility action
          </button>
        </section>
      )}
      {!!proposal.responsibilityHistory?.length && (
        <details>
          <summary>
            Responsibility history · {proposal.responsibilityHistory.length}{" "}
            records
          </summary>
          {proposal.responsibilityHistory.map((e) => (
            <article key={e.id}>
              <h5>
                {e.kind} · {e.id}
              </h5>
              <p>
                {e.actorId} · {e.at} · {e.rationale}
              </p>
              <p>
                {e.targetWorkerId
                  ? `Proposed recipient: ${e.targetWorkerId}`
                  : ""}{" "}
                {e.handoff}
              </p>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}

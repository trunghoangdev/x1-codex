import { useEffect, useRef, useState } from "react";
import type { HumanContributionState } from "./data/humanContribution";
import {
  contributionPerformer,
  contributorNames,
  pendingKnowledgeHandoff,
  handoffIsCurrent,
  proposeKnowledgeHandoff,
  respondKnowledgeHandoff,
  type ContributorActor,
} from "./data/knowledgeHandoff";
import { knowledgeResponsibilityStatus } from "./data/knowledgeResponsibility";
export function KnowledgeHandoff({
  state,
  onChange,
  actor,
  onActor,
  onContribution,
}: {
  state: HumanContributionState;
  onChange: (s: HumanContributionState) => void;
  actor?: string;
  onActor: (a: "owner" | ContributorActor) => void;
  onContribution: (a: ContributorActor) => void;
}) {
  const [remaining, setRemaining] = useState(""),
    [reason, setReason] = useState(""),
    [decision, setDecision] = useState<"Accepted" | "Declined">("Accepted");
  const [inputRead, setInputRead] = useState(false),
    [workRead, setWorkRead] = useState(false),
    [authorityRead, setAuthorityRead] = useState(false),
    [reviewed, setReviewed] = useState<string>();
  const [proposedAt, setProposedAt] = useState<string>();
  const result = useRef<HTMLHeadingElement>(null),
    preview = useRef<HTMLHeadingElement>(null);
  const performer = contributionPerformer(state),
    pending = pendingKnowledgeHandoff(state),
    last = state.handoffs?.at(-1),
    to: ContributorActor = performer === "leo" ? "delegate" : "leo";
  const latestId = last
    ? `${last.id}:${last.response?.decision ?? "pending"}`
    : "";
  const previous = useRef(latestId);
  useEffect(() => {
    if (previous.current !== latestId) {
      previous.current = latestId;
      result.current?.focus();
    }
  }, [latestId]);
  useEffect(() => {
    setReason("");
    setRemaining("");
    setReviewed(undefined);
    setInputRead(false);
    setWorkRead(false);
    setAuthorityRead(false);
    setDecision("Accepted");
  }, [actor, latestId]);
  const canPropose =
    actor === "owner" &&
    !pending &&
    knowledgeResponsibilityStatus(state) === "Accepted locally" &&
    !state.contributions.at(-1)!.delivery &&
    !state.commands?.some((c) => c.status !== "rejected" && !c.projected);
  const canRespond = !!pending && (actor === "owner" || actor === pending.to);
  const current = !!pending && handoffIsCurrent(state, pending),
    ack = inputRead && workRead && authorityRead;
  const action = canPropose
    ? "Propose handoff"
    : actor === "owner"
      ? "Cancelled"
      : decision;
  const identity = JSON.stringify({
    state,
    actor,
    action,
    remaining,
    reason,
    ack,
  });
  const confirm = reviewed === identity;
  const proposed =
    canPropose && proposedAt
      ? proposeKnowledgeHandoff(
          state,
          actor!,
          to,
          remaining,
          reason,
          proposedAt,
        )
      : undefined;
  const packagePreview = proposed?.handoffs?.at(-1);
  useEffect(() => {
    if (confirm) preview.current?.focus();
  }, [confirm]);
  return (
    <section
      className="panel org-stream knowledge-handoff"
      aria-label="Knowledge input and authority handoff"
    >
      <h2 ref={result} tabIndex={-1}>
        Input and authority handoff · K-01-H
      </h2>
      <p role="status">
        Current contributor: {contributorNames[performer]}.{" "}
        {pending
          ? `Transfer pending · ${contributorNames[pending.from]} retains responsibility until ${contributorNames[pending.to]} accepts the exact package.`
          : "No pending transfer."}
      </p>
      <p>
        Demo delegate is a local contributor principal, separate from authored
        worker membership and Maya’s editor role. Preparation and submission
        rights alone are represented; no real permission or capacity is
        verified.
      </p>
      <button className="button secondary" onClick={() => onActor("owner")}>
        Inspect handoff · demo owner
      </button>{" "}
      <button
        className="button secondary"
        onClick={() => onActor(pending?.to ?? to)}
      >
        Inspect handoff recipient · {contributorNames[pending?.to ?? to]}
      </button>{" "}
      <button
        className="button secondary"
        onClick={() => onContribution(performer)}
      >
        Open current contributor · {contributorNames[performer]}
      </button>
      {canPropose && (
        <>
          <h3>Propose transfer to {contributorNames[to]}</h3>
          <p>
            The package freezes input-access-brief-v1, the exact current
            preparation and the bounded Coordinator contribution rights. Earlier
            deliveries, assessments and publication authority stay unchanged.
          </p>
          <label>
            Remaining work
            <textarea
              maxLength={3000}
              value={remaining}
              onChange={(e) => setRemaining(e.target.value)}
            />
          </label>
        </>
      )}
      {pending && (
        <>
          <h3>Pending package · {pending.id}</h3>
          <p>
            {current
              ? "Exact package still matches current work."
              : "Package is stale: work or submission changed. Acceptance is blocked; owner can cancel and prepare a new package."}
          </p>
          <Package h={pending} />
        </>
      )}
      {canRespond && actor === pending?.to && (
        <>
          <label>
            Handoff response
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as typeof decision)}
            >
              <option value="Accepted">Accept handoff</option>
              <option value="Declined">Decline handoff</option>
            </select>
          </label>
          {decision === "Accepted" && (
            <>
              <label>
                <input
                  type="checkbox"
                  checked={inputRead}
                  onChange={(e) => setInputRead(e.target.checked)}
                />
                I inspected the exact input version and content.
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={workRead}
                  onChange={(e) => setWorkRead(e.target.checked)}
                />
                I inspected the frozen draft and remaining work.
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={authorityRead}
                  onChange={(e) => setAuthorityRead(e.target.checked)}
                />
                I acknowledge the bounded rights and excluded authority.
              </label>
            </>
          )}
        </>
      )}
      {(canPropose || canRespond) && (
        <>
          <label>
            Handoff rationale
            <textarea
              maxLength={3000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button
            className="button primary"
            disabled={
              !reason.trim() ||
              (canPropose && !remaining.trim()) ||
              (action === "Accepted" && (!ack || !current))
            }
            onClick={() => {
              setProposedAt(new Date().toISOString());
              setReviewed(identity);
            }}
          >
            Review handoff action
          </button>
          {confirm && (
            <section aria-label="Handoff action preview">
              <h3 ref={preview} tabIndex={-1}>
                Confirm exact handoff action
              </h3>
              <p>
                {action} · {actor} ·{" "}
                {pending?.id ?? `To ${contributorNames[to]}`}
              </p>
              <p>{reason}</p>
              {canPropose && packagePreview && <Package h={packagePreview} />}
              {canPropose && (
                <p>
                  Remaining work: {remaining}. Input-access-brief-v1 and exact
                  current draft will be frozen. Contribution
                  preparation/submission only; no assessment or publication
                  authority.
                </p>
              )}
              <button
                className="button primary"
                onClick={() =>
                  onChange(
                    canPropose
                      ? proposed!
                      : respondKnowledgeHandoff(
                          state,
                          actor!,
                          action as "Accepted" | "Declined" | "Cancelled",
                          reason,
                          ack,
                          new Date().toISOString(),
                        ),
                  )
                }
              >
                Confirm handoff action
              </button>{" "}
              <button
                className="button secondary"
                onClick={() => setReviewed(undefined)}
              >
                Keep handoff unchanged
              </button>
            </section>
          )}
        </>
      )}
      {!state.responsibility && (
        <p>
          Start and accept a local responsibility offer before using this
          handoff exercise.
        </p>
      )}
      {state.handoffs && (
        <details>
          <summary>Handoff history · {state.handoffs.length} packages</summary>
          {state.handoffs.map((h) => (
            <article key={h.id}>
              <h3>
                {h.id} · {h.response?.decision ?? "Pending"}
              </h3>
              <Package h={h} />
              {h.response && (
                <p>
                  {h.response.actor} · {h.response.decision} · {h.response.at} ·{" "}
                  {h.response.rationale}.{" "}
                  {h.response.acknowledged &&
                    "Exact input, work and bounded authority acknowledged."}
                </p>
              )}
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
function Package({
  h,
}: {
  h: NonNullable<HumanContributionState["handoffs"]>[number];
}) {
  return (
    <>
      <p>
        {contributorNames[h.from]} → {contributorNames[h.to]} · proposed by{" "}
        {h.proposedBy} · {h.at} · {h.rationale}
      </p>
      <h4>Exact input · {h.input.id}</h4>
      <p>{h.input.body}</p>
      <h4>Frozen preparation · draft-0{h.draft.version}</h4>
      <pre className="human-contribution-text">
        {h.draft.body || "(empty preparation)"}
      </pre>
      <p>
        Note: {h.draft.note || "(empty note)"} · citation:{" "}
        {h.draft.citesInput ? "selected" : "not selected"} · request:{" "}
        {h.requestId ?? "initial contribution"}
      </p>
      <p>Remaining work: {h.pendingWork}</p>
      <p>
        Role: {h.authority.role}. Allowed: {h.authority.allowed.join("; ")}.
        Excluded: {h.authority.excluded.join("; ")}.
      </p>
    </>
  );
}

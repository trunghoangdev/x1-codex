import { useRef, useState } from "react";
import type { AuthorizedUse } from "./data/authorizedUse";
import {
  pendingReviewHandoff,
  proposeReviewHandoff,
  respondReviewHandoff,
  reviewOwner,
  reviewRoleOpen,
  reviewPackage,
  reviewRoles,
  reviewRights,
  reviewPrincipals,
  roleCandidates,
  type ReviewRole,
  type ReviewPrincipal,
} from "./data/reviewHandoffs";
export function ReviewHandoffs({
  state,
  subject,
  onChange,
}: {
  state: AuthorizedUse;
  subject?: string;
  onChange: (s: AuthorizedUse) => void;
}) {
  const [actor, setActor] = useState<ReviewPrincipal | "owner">("owner"),
    [role, setRole] = useState<ReviewRole>("publicationReview"),
    [rationale, setRationale] = useState(""),
    [ack, setAck] = useState(false),
    [response, setResponse] = useState<"Accepted" | "Declined">("Accepted");
  const [preview, setPreview] = useState<{
    identity: string;
    next: AuthorizedUse;
  }>();
  const heading = useRef<HTMLHeadingElement>(null);
  const pending = pendingReviewHandoff(state),
    to = roleCandidates[role].find((p) => p !== reviewOwner(state, role))!,
    stale =
      subject !== state.subject ||
      (!!pending && pending.package !== reviewPackage(state, pending.role));
  const identity = JSON.stringify({
    state,
    subject,
    actor,
    role,
    rationale,
    ack,
    response,
  });
  const prepare = () =>
    actor === "owner"
      ? pending
        ? respondReviewHandoff(
            state,
            subject,
            actor,
            "Cancelled",
            rationale,
            new Date().toISOString(),
          )
        : proposeReviewHandoff(
            state,
            subject,
            role,
            to,
            rationale,
            new Date().toISOString(),
          )
      : respondReviewHandoff(
          state,
          subject,
          actor,
          response,
          rationale,
          new Date().toISOString(),
          ack,
        );
  return (
    <section
      className="panel org-stream material-use-start"
      aria-label="Review responsibility handoff"
    >
      <h2 ref={heading} tabIndex={-1}>
        Review and decision responsibility handoff
      </h2>
      <p>
        Local demo principals only. The owner proposes; the named recipient
        accepts exact input, remaining work and bounded decision rights.
        Proposal alone does not transfer responsibility. Existing assessments,
        grants and outcomes retain their original actors. Fresh material/cycles
        need their own responsibility arrangement.
      </p>
      {(Object.keys(reviewRoles) as ReviewRole[]).map((r) => (
        <p key={r}>
          {reviewRoles[r]}: {reviewPrincipals[reviewOwner(state, r)]}.{" "}
          {reviewRights[r]}
        </p>
      ))}
      {pending && (
        <p role="status">
          Pending {reviewRoles[pending.role]}: {reviewPrincipals[pending.from]}{" "}
          → {reviewPrincipals[pending.to]}.{" "}
          {stale
            ? "Package changed or source is no longer current. Acceptance blocked; owner must cancel and prepare a fresh package."
            : "Recipient acceptance required; current holder remains responsible."}
        </p>
      )}
      {pending && (
        <details>
          <summary>Inspect pending input, remaining work and rights</summary>
          <pre>{JSON.stringify(JSON.parse(pending.package), null, 2)}</pre>
        </details>
      )}
      <label>
        Review handoff actor
        <select
          aria-label="Review handoff actor"
          value={actor}
          onChange={(e) => {
            setActor(e.target.value as ReviewPrincipal | "owner");
            setAck(false);
          }}
        >
          <option value="owner">Demo organization owner</option>
          {Object.entries(reviewPrincipals).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {(actor === "owner" || pending?.to === actor) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next = prepare();
            if (next !== state) setPreview({ identity, next });
          }}
        >
          {actor === "owner" && !pending && (
            <label>
              Responsibility to hand over
              <select
                aria-label="Responsibility to hand over"
                value={role}
                onChange={(e) => setRole(e.target.value as ReviewRole)}
              >
                {Object.entries(reviewRoles).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {actor === "owner" && !pending && (
            <p>
              Recipient: {reviewPrincipals[to]} · {reviewRights[role]}.
              Completed decision stages cannot be transferred. Maximum 20
              proposals / 40 retained events per cycle.
            </p>
          )}
          {actor !== "owner" && (
            <>
              <label>
                Review handoff response
                <select
                  aria-label="Review handoff response"
                  value={response}
                  onChange={(e) =>
                    setResponse(e.target.value as "Accepted" | "Declined")
                  }
                >
                  <option>Accepted</option>
                  <option>Declined</option>
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                />
                I inspected exact input, remaining work and bounded decision
                rights
              </label>
            </>
          )}
          <label>
            Review handoff rationale
            <textarea
              aria-label="Review handoff rationale"
              required
              maxLength={3000}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>
          <button
            className="button secondary"
            disabled={
              !rationale.trim() ||
              (actor !== "owner" &&
                response === "Accepted" &&
                (!ack || stale)) ||
              (actor === "owner" &&
                !pending &&
                (subject !== state.subject ||
                  !reviewRoleOpen(state, role) ||
                  (state.reviewHandoffs?.length ?? 0) >= 39))
            }
          >
            Review responsibility change
          </button>
        </form>
      )}
      {preview?.identity === identity && (
        <section aria-label="Confirm review responsibility change">
          <h3>Confirm {preview.next.reviewHandoffs!.at(-1)!.action}</h3>
          <p>{rationale}</p>
          <details open>
            <summary>Exact handoff package</summary>
            <pre>
              {JSON.stringify(
                JSON.parse(preview.next.reviewHandoffs!.at(-1)!.package),
                null,
                2,
              )}
            </pre>
          </details>
          <button
            className="button primary"
            onClick={() => {
              onChange(preview.next);
              setPreview(undefined);
              setRationale("");
              setAck(false);
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            Record review responsibility change locally
          </button>
          <button
            className="button secondary"
            onClick={() => setPreview(undefined)}
          >
            Cancel responsibility change
          </button>
        </section>
      )}
      {!!state.reviewHandoffs?.length && (
        <details>
          <summary>
            Retained review responsibility history ·{" "}
            {state.reviewHandoffs.length} events
          </summary>
          {state.reviewHandoffs.map((e) => (
            <article key={e.id}>
              <h3>
                {reviewRoles[e.role]} · {e.action}
              </h3>
              <p>
                {e.id} ·{" "}
                {e.actor === "owner"
                  ? "Demo organization owner"
                  : reviewPrincipals[e.actor]}{" "}
                · {e.at}
              </p>
              <p>
                {reviewPrincipals[e.from]} → {reviewPrincipals[e.to]} ·{" "}
                {e.rationale}
              </p>
              <p>
                Work anchor: {e.afterRecordId} · control count {e.controlCount}{" "}
                · proposal {e.proposalId ?? e.id}
              </p>
              <details>
                <summary>Frozen package</summary>
                <pre>{JSON.stringify(JSON.parse(e.package), null, 2)}</pre>
              </details>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}

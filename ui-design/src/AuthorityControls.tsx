import { useRef, useState } from "react";
import {
  authorityStatus,
  controlAuthority,
  type AuthorizedUse,
  type AuthorityAction,
} from "./data/authorizedUse";
export function AuthorityControls({
  state,
  onChange,
  canResume,
}: {
  state: AuthorizedUse;
  onChange: (s: AuthorizedUse) => void;
  canResume: boolean;
}) {
  const [action, setAction] = useState<AuthorityAction>("Suspend");
  const [rationale, setRationale] = useState("");
  const [conditions, setConditions] = useState("");
  const [reviewed, setReviewed] = useState<string>();
  const heading = useRef<HTMLHeadingElement>(null);
  if (state.authorization?.decision !== "Allowed") return null;
  const status = authorityStatus(state);
  const identity = JSON.stringify({
    state,
    action,
    rationale,
    conditions,
    canResume,
  });
  const valid =
    status !== "Revoked" &&
    (state.authorityHistory?.length ?? 0) < 20 &&
    (action === "Revoke" ||
      (action === "Suspend"
        ? status === "Active"
        : status === "Suspended" && canResume));
  return (
    <section
      aria-label="Use authority controls"
      className="org-stream material-use-start"
    >
      <h3 ref={heading} tabIndex={-1}>
        Use authority · {status}
      </h3>
      <p>
        Sam · demo bounded-use authorizer. Local simulation only. Suspension and
        revocation block future execution; earlier observations remain. Resume
        requires unchanged suitable material, applicable scope and a separate
        decision that conditions are met. Revocation is final for this cycle;
        changed material needs a fresh mandate. Maximum 20 control records per
        cycle.
      </p>
      {state.authorityHistory?.map((r) => (
        <article key={r.id}>
          <h4>
            {r.action} · {r.id}
          </h4>
          <p>
            {r.actor} · {r.at}
          </p>
          <p>{r.rationale}</p>
          <p>Conditions / verification: {r.conditions}</p>
          <p>
            Previous decision: {r.sourceId} · After record: {r.afterRecordId}
          </p>
        </article>
      ))}
      {status !== "Revoked" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && rationale.trim() && conditions.trim())
              setReviewed(identity);
          }}
        >
          <label>
            Authority action
            <select
              aria-label="Authority action"
              value={action}
              onChange={(e) => setAction(e.target.value as AuthorityAction)}
            >
              <option>Suspend</option>
              <option>Resume</option>
              <option>Revoke</option>
            </select>
          </label>
          <label>
            Authority decision rationale
            <textarea
              required
              maxLength={3000}
              aria-label="Authority decision rationale"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>
          <label>
            Conditions to resume or verification of resolution
            <textarea
              required
              maxLength={3000}
              aria-label="Conditions to resume or verification of resolution"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
            />
          </label>
          <button className="button secondary" disabled={!valid}>
            Review authority decision
          </button>
        </form>
      )}
      {reviewed === identity && valid && (
        <section aria-label="Confirm authority decision">
          <h4>
            Confirm {action} · {state.authorization.id}
          </h4>
          <p>Audience: {state.audience}</p>
          <details>
            <summary>Exact authorized material</summary>
            <pre>{state.subject}</pre>
          </details>
          <p>{rationale}</p>
          <p>{conditions}</p>
          <button
            className="button primary"
            onClick={() => {
              onChange(
                controlAuthority(
                  state,
                  action,
                  rationale,
                  conditions,
                  new Date().toISOString(),
                ),
              );
              setReviewed(undefined);
              setRationale("");
              setConditions("");
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            Record authority decision locally
          </button>
          <button
            className="button secondary"
            onClick={() => setReviewed(undefined)}
          >
            Cancel authority decision
          </button>
        </section>
      )}
    </section>
  );
}

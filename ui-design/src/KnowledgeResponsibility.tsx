import { useEffect, useRef, useState } from "react";
import type { HumanContributionState } from "./data/humanContribution";
import {
  knowledgeResponsibilityStatus,
  recordKnowledgeResponsibility,
  type KnowledgeResponsibilityEvent,
} from "./data/knowledgeResponsibility";

export function KnowledgeResponsibility({
  state,
  onChange,
  actor,
  onActor,
}: {
  state: HumanContributionState;
  onChange: (state: HumanContributionState) => void;
  actor?: string;
  onActor: (actor: "owner" | "leo") => void;
}) {
  const [rationale, setRationale] = useState("");
  const [action, setAction] = useState<KnowledgeResponsibilityEvent["action"]>(
    "Accept responsibility",
  );
  const [reviewed, setReviewed] = useState<string>();
  const result = useRef<HTMLHeadingElement>(null);
  const preview = useRef<HTMLHeadingElement>(null);
  const last = state.responsibility?.events.at(-1);
  const previous = useRef(last?.id);
  useEffect(() => {
    if (previous.current !== last?.id) {
      previous.current = last?.id;
      result.current?.focus();
    }
  }, [last?.id]);
  const status = knowledgeResponsibilityStatus(state);
  const canOffer =
    actor === "owner" &&
    !state.commands?.length &&
    !state.contributions.some((c) => c.delivery) &&
    (!state.responsibility ||
      ["Clarification requested", "Declined · coordination needed"].includes(
        status,
      ));
  const canRespond = actor === "leo" && status === "Acceptance pending";
  const selected = canOffer ? "Offer responsibility" : action;
  const identity = JSON.stringify({ state, actor, selected, rationale });
  const confirm = reviewed === identity;
  const pending = status === "Acceptance pending";
  useEffect(() => {
    if (confirm) preview.current?.focus();
  }, [confirm]);
  useEffect(() => {
    setReviewed(undefined);
    setRationale("");
    setAction("Accept responsibility");
  }, [actor]);
  return (
    <section
      className="panel org-stream"
      aria-label="Knowledge contribution responsibility"
    >
      <div className="eyebrow">LOCAL RESPONSIBILITY · K-01-H</div>
      <h2 ref={result} tabIndex={-1}>
        Guide contribution · allocation and acceptance
      </h2>
      <p role="status">{status}</p>
      <p>
        Coordinator role · guide contribution: Leo → receiver/editor: Maya.
        Input: input-access-brief-v1. Scope: prepare the fictional cohort’s
        access guide; assessment, publication authority and outcome remain
        separate.
      </p>
      <p>
        <strong>Next responsibility:</strong>{" "}
        {pending
          ? "Leo · inspect the offer and respond before submission."
          : [
                "Clarification requested",
                "Declined · coordination needed",
              ].includes(status)
            ? "Demo organization owner · resolve the response and issue a new offer."
            : status === "Accepted locally"
              ? "Leo · prepare the contribution; Maya receives and assesses each delivered version separately."
              : "Demo organization owner · issue a local offer before starting the allocation exercise."}
      </p>
      {!state.responsibility && (
        <p>
          The existing authored assignment remains available for the original
          contribution exercise. It is not evidence of acceptance. A local offer
          activates the acceptance gate; it can only be started before any
          submission.
        </p>
      )}
      <button className="button secondary" onClick={() => onActor("owner")}>
        Inspect allocation · demo owner
      </button>{" "}
      <button className="button secondary" onClick={() => onActor("leo")}>
        Inspect responsibility · Leo
      </button>
      <p>
        Sample-persona navigation only; these controls do not authenticate
        users, grant real permissions or verify capacity.
      </p>
      {(canOffer || canRespond) && (
        <>
          <h3>
            {canOffer
              ? "Offer Guide contributor responsibility to Leo"
              : "Respond to responsibility offer · Leo"}
          </h3>
          {canRespond && (
            <label>
              Responsibility response
              <select
                value={action}
                onChange={(e) => {
                  setAction(e.target.value as typeof action);
                  setReviewed(undefined);
                }}
              >
                <option>Accept responsibility</option>
                <option>Request clarification</option>
                <option>Decline responsibility</option>
              </select>
            </label>
          )}
          <label>
            Responsibility rationale
            <textarea
              maxLength={3000}
              value={rationale}
              onChange={(e) => {
                setRationale(e.target.value);
                setReviewed(undefined);
              }}
            />
          </label>
          <button
            className="button primary"
            disabled={!rationale.trim()}
            onClick={() => setReviewed(identity)}
          >
            Review responsibility action
          </button>
          {confirm && (
            <section aria-label="Responsibility action preview">
              <h3 ref={preview} tabIndex={-1}>
                Confirm exact responsibility action
              </h3>
              <p>
                {selected} · {actor} · K-01-H · Leo · Guide contributor ·
                input-access-brief-v1
              </p>
              <p>{rationale}</p>
              <p>
                {canOffer
                  ? "This creates a pending offer. It does not record Leo’s acceptance."
                  : selected === "Accept responsibility"
                    ? "Acceptance enables contribution submission; it does not record delivery or completion."
                    : "Submission remains blocked. The owner must resolve this response and issue a new offer."}
              </p>
              <button
                className="button primary"
                onClick={() => {
                  onChange(
                    recordKnowledgeResponsibility(
                      state,
                      selected,
                      actor as "owner" | "leo",
                      rationale,
                      new Date().toISOString(),
                    ),
                  );
                  setReviewed(undefined);
                  setRationale("");
                }}
              >
                Confirm responsibility action
              </button>{" "}
              <button
                className="button secondary"
                onClick={() => setReviewed(undefined)}
              >
                Cancel responsibility action
              </button>
            </section>
          )}
        </>
      )}
      {actor === "owner" &&
        !state.responsibility &&
        ((state.commands?.length ?? 0) > 0 ||
          state.contributions.some((c) => c.delivery)) && (
          <p>
            Contribution submission has already started. This exercise cannot
            retroactively allocate or rewrite the existing work.
          </p>
        )}
      {last && (
        <p>
          Latest response: {last.actor} · {last.action} · {last.rationale} ·{" "}
          {last.at}
        </p>
      )}
      {state.responsibility && (
        <details>
          <summary>
            Responsibility history · {state.responsibility.events.length} events
          </summary>
          <ol>
            {state.responsibility.events.map((e) => (
              <li key={e.id}>
                {e.id} · {e.actor} · {e.action} · {e.at}
                <p>{e.rationale}</p>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

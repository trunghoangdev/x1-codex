import { useVersion } from "./data/authorizedUse";
import type { ApplicabilityScope } from "./data/scopeApplicability";
import { useProgress, useActors, type UseActor } from "./data/useProgress";
import type { AuthorizedUse } from "./data/authorizedUse";
import type { HumanContributionState } from "./data/humanContribution";
export function UseProgress({
  scope,
  contribution,
  state,
  actor,
  onActor,
  onInspect,
  inspectLabel,
  onInbox,
}: {
  scope?: ApplicabilityScope;
  contribution: HumanContributionState;
  state?: AuthorizedUse;
  actor?: UseActor;
  onActor?: (actor: UseActor) => void;
  inspectLabel?: string;
  onInspect: () => void;
  onInbox?: (actor: UseActor) => void;
}) {
  const view = useProgress(contribution, state, scope);
  const personal = !!onActor;
  const mine = !!actor && view.actor === actor;
  return (
    <section
      className="panel org-stream"
      aria-label={
        personal ? "Local use responsibility inbox" : "Local use progress"
      }
    >
      <h2>
        {personal
          ? "Local use responsibilities"
          : "Bounded use · next responsibility"}
      </h2>
      <p>
        Separate local exercise · human-guide-example · draft-0
        {useVersion(state?.subject) ?? stateVersion(contribution)}. Authored
        assignment counts remain separate. Actor inspection does not grant
        permission.
      </p>
      {personal && (
        <label>
          Local responsibility actor
          <select
            value={actor}
            onChange={(e) => onActor?.(e.target.value as UseActor)}
          >
            {Object.entries(useActors).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}
      {personal && (
        <p>
          {mine
            ? "1 pending local responsibility"
            : "No pending local use responsibility for this actor."}
        </p>
      )}
      {(!personal || mine) && (
        <>
          <h3>{view.title}</h3>
          <p>{view.detail}</p>
          <p>
            Next performer:{" "}
            {view.actor
              ? useActors[view.actor]
              : "None allocated for a subsequent step"}
          </p>
        </>
      )}
      {personal && !mine && (
        <p>
          Shared status: {view.title}.{" "}
          {view.actor
            ? `Next responsibility belongs to ${useActors[view.actor]}.`
            : view.detail}
        </p>
      )}
      <button className="button secondary" onClick={onInspect}>
        {inspectLabel ??
          (mine
            ? "Open my exact use responsibility"
            : "Inspect bounded-use source and history")}
      </button>
      {view.actor && onInbox && (
        <button className="text-link" onClick={() => onInbox(view.actor!)}>
          Open local inbox · {useActors[view.actor]}
        </button>
      )}
    </section>
  );
}

function stateVersion(c: HumanContributionState) {
  return c.contributions.at(-1)?.version ?? 2;
}

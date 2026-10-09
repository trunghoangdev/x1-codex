import { personalNextSteps, type PersonalStep } from "./data/personalNextSteps";
import type { KnowledgeWorkspace } from "./data/knowledgeCheckpoint";
import type { ApplicabilityScope } from "./data/scopeApplicability";
export function PersonalNextSteps({
  state,
  actor,
  scope,
  onOpen,
}: {
  state: KnowledgeWorkspace;
  actor: string;
  scope?: ApplicabilityScope;
  onOpen: (step: PersonalStep) => void;
}) {
  const steps = personalNextSteps(state, actor, scope),
    actionable = steps.filter((s) => s.group !== "waiting");
  return (
    <section
      className="panel personal-next-steps"
      aria-label="Personal next steps"
    >
      <h2>Next steps</h2>
      <p>
        Represented follow-ups for this actor. Shown in source order,
        independently of assignment filters; these are not additional
        assignments or an urgency ranking.
      </p>
      {!actionable.length && (
        <p>
          No next action represented for you in these local flows. Inspect your
          assigned work below; this does not establish that all work is
          complete.
        </p>
      )}
      {(["work", "review"] as const)
        .filter((group) => steps.some((s) => s.group === group))
        .map((group) => (
          <section
            key={group}
            aria-label={
              group === "review" ? "Ready for your review" : "Work to continue"
            }
          >
            <h3>
              {group === "review"
                ? "Ready for your review"
                : "Work to continue"}{" "}
              · {steps.filter((s) => s.group === group).length}
            </h3>
            <ul>
              {steps
                .filter((s) => s.group === group)
                .map((s) => (
                  <li key={s.id}>
                    <strong>{s.title}</strong>
                    <span>{s.source}</span>
                    <p>{s.detail}</p>
                    <button
                      className="button secondary"
                      onClick={() => onOpen(s)}
                    >
                      Continue · {s.id}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      <details className="personal-waiting">
        <summary>
          Waiting for others ·{" "}
          {steps.filter((s) => s.group === "waiting").length}
        </summary>
        <ul>
          {steps
            .filter((s) => s.group === "waiting")
            .map((s) => (
              <li key={s.id}>
                <strong>{s.title}</strong>
                <span>{s.source}</span>
                <p>{s.detail}</p>
                <button className="text-link" onClick={() => onOpen(s)}>
                  Inspect waiting context · {s.id}
                </button>
              </li>
            ))}
        </ul>
        {!steps.some((s) => s.group === "waiting") && (
          <p>No waiting follow-up represented in these local flows.</p>
        )}
      </details>
    </section>
  );
}

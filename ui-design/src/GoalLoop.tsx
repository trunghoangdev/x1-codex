import { useRef, useState } from "react";
import type { AuthorizedUse } from "./data/authorizedUse";
import {
  reviewGoal,
  respondGoalTask,
  deliverGoalTask,
  assessGoalTask,
  cancelGoalTask,
  goalActors,
  goalProgress,
  goalTaskState,
  openGoalTask,
  type GoalActor,
  type GoalDecision,
  type GoalTask,
} from "./data/goalLoop";
export function GoalLoop({
  state,
  subject,
  onChange,
}: {
  state: AuthorizedUse;
  subject?: string;
  onChange: (s: AuthorizedUse) => void;
}) {
  const [actor, setActor] = useState<GoalActor>("owner"),
    [action, setAction] = useState("Review goal"),
    [decision, setDecision] = useState<GoalDecision>("Evidence gap"),
    [assignee, setAssignee] = useState<Exclude<GoalActor, "owner">>("leo"),
    [response, setResponse] = useState<
      "Accepted" | "Clarification requested" | "Declined"
    >("Accepted"),
    [resultDecision, setResultDecision] = useState<
      "Accepted result" | "Revision needed"
    >("Accepted result");
  const [rationale, setRationale] = useState(""),
    [limits, setLimits] = useState(""),
    [title, setTitle] = useState(""),
    [expected, setExpected] = useState(""),
    [body, setBody] = useState(""),
    [ack, setAck] = useState(false),
    [preview, setPreview] = useState<{
      identity: string;
      next: AuthorizedUse;
    }>();
  const heading = useRef<HTMLHeadingElement>(null);
  if (!state.outcome) return null;
  const task = state.goalReviews?.at(-1)?.followUp,
    status = task ? goalTaskState(task) : undefined,
    current = subject === state.subject,
    progress = goalProgress(state)!;
  const options =
    actor === "owner"
      ? [
          ...(current &&
          !openGoalTask(state) &&
          (state.goalReviews?.length ?? 0) < 10
            ? ["Review goal"]
            : []),
          ...(current && status === "Submitted"
            ? ["Review follow-up result"]
            : []),
          ...(openGoalTask(state) ? ["Cancel follow-up"] : []),
        ]
      : task?.assignee === actor
        ? status === "Offered"
          ? ["Respond to follow-up"]
          : status === "Accepted" && current
            ? ["Deliver follow-up"]
            : []
        : [];
  const selected = options.includes(action) ? action : options[0];
  const identity = JSON.stringify({
    state,
    subject,
    actor,
    selected,
    decision,
    assignee,
    response,
    resultDecision,
    rationale,
    limits,
    title,
    expected,
    body,
    ack,
  });
  const prepare = (at: string) =>
    selected === "Review goal"
      ? reviewGoal(
          state,
          subject,
          decision,
          rationale,
          limits,
          at,
          decision === "Goal met in simulation"
            ? undefined
            : { title, assignee, expectedResult: expected },
        )
      : selected === "Respond to follow-up"
        ? respondGoalTask(state, subject, actor, response, rationale, at, ack)
        : selected === "Deliver follow-up"
          ? deliverGoalTask(state, subject, actor, body, at)
          : selected === "Review follow-up result"
            ? assessGoalTask(state, subject, resultDecision, rationale, at)
            : cancelGoalTask(state, rationale, at);
  return (
    <section
      className="panel org-stream material-use-start"
      aria-label="Goal outcome and follow-up"
    >
      <h2 ref={heading} tabIndex={-1}>
        Outcome → organizational goal → next work
      </h2>
      <p>
        K-01-goal · members can find reliable answers and identify next steps.
        This exercise evaluates one exact material, audience and use cycle; it
        does not establish organization-wide or real-world success.
      </p>
      <p>
        Outcome source: {state.outcome.id} · {state.outcome.conclusion} ·
        reviewer {state.outcome.actor}. Audience: {state.audience}.
      </p>
      <h3>{progress.title}</h3>
      <p role="status">{progress.detail}</p>
      <p>
        Next responsible person:{" "}
        {progress.actor ? goalActors[progress.actor] : "No pending goal action"}
        . Decisions, work offers and results remain separate. Maximum ten goal
        reviews per cycle.
      </p>
      {!current && (
        <p role="alert">
          Source changed or is under revision. New goal decisions, acceptance
          and delivery are blocked. The owner can cancel open follow-up before
          starting a new material or use cycle; historical records remain.
        </p>
      )}
      <details>
        <summary>Exact outcome, material and evidence</summary>
        <pre>
          {JSON.stringify(
            {
              subject: JSON.parse(state.subject),
              outcome: state.outcome,
              execution: state.execution,
              readerEvidence: state.readerEvidence,
            },
            null,
            2,
          )}
        </pre>
      </details>
      {task && (
        <article className="org-stream-assignment">
          <h3>
            {task.title} · {status}
          </h3>
          <p>
            {task.id} · offered to {goalActors[task.assignee]}
          </p>
          <p>Expected result / acceptance criterion: {task.expectedResult}</p>
          {task.response && (
            <p>
              {task.response.decision} · {task.response.rationale}
            </p>
          )}
          {task.delivery && (
            <p style={{ whiteSpace: "pre-wrap" }}>
              Delivered result: {task.delivery.body}
            </p>
          )}
          {task.review && (
            <p>
              Owner review: {task.review.decision} · {task.review.rationale}
            </p>
          )}
          {task.cancellation && <p>Cancelled: {task.cancellation.rationale}</p>}
        </article>
      )}
      <label>
        Goal loop actor
        <select
          aria-label="Goal loop actor"
          value={actor}
          onChange={(e) => {
            setActor(e.target.value as GoalActor);
            setAck(false);
          }}
        >
          {Object.entries(goalActors).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      {!!options.length && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next = prepare(new Date().toISOString());
            if (next !== state) setPreview({ identity, next });
          }}
        >
          <label>
            Goal loop action
            <select
              aria-label="Goal loop action"
              value={selected}
              onChange={(e) => setAction(e.target.value)}
            >
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          {selected === "Review goal" && (
            <>
              <label>
                Goal decision
                <select
                  aria-label="Goal decision"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as GoalDecision)}
                >
                  <option>Evidence gap</option>
                  <option>Further work required</option>
                  <option
                    disabled={
                      state.outcome.conclusion !== "Criterion met in simulation"
                    }
                  >
                    Goal met in simulation
                  </option>
                </select>
              </label>
              <label>
                Goal scope limits and remaining uncertainty
                <textarea
                  aria-label="Goal scope limits and remaining uncertainty"
                  required
                  maxLength={3000}
                  value={limits}
                  onChange={(e) => setLimits(e.target.value)}
                />
              </label>
              {decision !== "Goal met in simulation" && (
                <>
                  <label>
                    Follow-up title
                    <input
                      aria-label="Follow-up title"
                      required
                      maxLength={500}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </label>
                  <label>
                    Follow-up recipient
                    <select
                      aria-label="Follow-up recipient"
                      value={assignee}
                      onChange={(e) =>
                        setAssignee(
                          e.target.value as Exclude<GoalActor, "owner">,
                        )
                      }
                    >
                      {Object.entries(goalActors)
                        .filter(([id]) => id !== "owner")
                        .map(([id, name]) => (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Follow-up expected result and acceptance criterion
                    <textarea
                      aria-label="Follow-up expected result and acceptance criterion"
                      required
                      maxLength={3000}
                      value={expected}
                      onChange={(e) => setExpected(e.target.value)}
                    />
                  </label>
                </>
              )}
            </>
          )}
          {selected === "Respond to follow-up" && (
            <>
              <label>
                Goal follow-up response
                <select
                  aria-label="Goal follow-up response"
                  value={response}
                  onChange={(e) =>
                    setResponse(e.target.value as typeof response)
                  }
                >
                  <option>Accepted</option>
                  <option>Clarification requested</option>
                  <option>Declined</option>
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                />
                I inspected the exact goal, outcome, expected result and scope
                limits
              </label>
            </>
          )}
          {selected === "Review follow-up result" && (
            <label>
              Follow-up result decision
              <select
                aria-label="Follow-up result decision"
                value={resultDecision}
                onChange={(e) =>
                  setResultDecision(e.target.value as typeof resultDecision)
                }
              >
                <option>Accepted result</option>
                <option>Revision needed</option>
              </select>
            </label>
          )}
          {selected === "Deliver follow-up" ? (
            <label>
              Follow-up result and limitations
              <textarea
                aria-label="Follow-up result and limitations"
                required
                maxLength={6000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </label>
          ) : (
            <label>
              Goal loop rationale
              <textarea
                aria-label="Goal loop rationale"
                required
                maxLength={3000}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
              />
            </label>
          )}
          <button
            className="button secondary"
            disabled={
              selected === "Respond to follow-up" &&
              response === "Accepted" &&
              (!ack || !current)
            }
          >
            Review goal loop record
          </button>
        </form>
      )}
      {preview?.identity === identity && (
        <section aria-label="Confirm goal loop record">
          <h3>Confirm {selected}</h3>
          <p>{rationale || body}</p>
          <details open>
            <summary>Exact goal review and follow-up</summary>
            <pre>
              {JSON.stringify(preview.next.goalReviews!.at(-1), null, 2)}
            </pre>
          </details>
          <button
            className="button primary"
            onClick={() => {
              onChange(preview.next);
              setPreview(undefined);
              setRationale("");
              setBody("");
              setAck(false);
              requestAnimationFrame(() => heading.current?.focus());
            }}
          >
            Record goal loop change locally
          </button>
          <button
            className="button secondary"
            onClick={() => setPreview(undefined)}
          >
            Cancel goal loop record
          </button>
        </section>
      )}
      {!!state.goalReviews?.length && (
        <details>
          <summary>
            Retained goal decision history · {state.goalReviews.length} reviews
          </summary>
          {state.goalReviews.map((r) => (
            <article key={r.id}>
              <h3>
                {r.decision} · {r.id}
              </h3>
              <p>
                Demo organization owner · {r.at} · outcome {r.outcomeId}
              </p>
              <p>{r.rationale}</p>
              <p>Scope limits: {r.limitations}</p>
              <pre>
                {JSON.stringify(r.followUp ?? { noFollowUp: true }, null, 2)}
              </pre>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}

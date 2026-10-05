import {
  commandBlocksEditing,
  submitContributionCommand,
  resolveContributionCommand,
  projectContributionCommand,
  type CommandPreview,
} from "./data/contributionCommand";
import { useState } from "react";
import {
  assessContribution,
  contributionResponsibility as responsibility,
  receiveContribution,
  reviseContribution,
  type HumanContributionState,
} from "./data/humanContribution";
export function HumanContribution({
  state,
  onChange,
  onBack,
}: {
  state: HumanContributionState;
  onChange: (state: HumanContributionState) => void;
  onBack: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [preview, setPreview] = useState<CommandPreview>("projected");
  const command = state.commands?.at(-1);
  const locked = commandBlocksEditing(state);
  const current = state.contributions.at(-1)!;
  const update = (fields: Partial<typeof current>) => {
    if (!current.delivery && !locked)
      onChange({
        ...state,
        contributions: state.contributions.map((c) =>
          c === current ? { ...c, ...fields } : c,
        ),
      });
  };
  const ready =
    !!current.body.trim() && !!current.note.trim() && current.citesInput;
  return (
    <div className="detail-page human-contribution-page">
      <button className="button secondary" onClick={onBack}>
        Back to Demos
      </button>
      <div className="page-heading">
        <div>
          <div className="eyebrow">HUMAN WORK · INTERACTIVE DEMO</div>
          <h1 tabIndex={-1}>Prepare and deliver a contribution</h1>
          <p>
            One responsibility, exact revisions and separate receiver responses.
          </p>
        </div>
      </div>
      <div className="org-banner">
        <p>
          Local session only. No upload, real receiver, server admission or
          publication. Leaving this screen preserves this session; reload clears
          it. Demo continuity does not save this exercise.
        </p>
      </div>
      <section className="panel org-stream">
        <h2>Your responsibility</h2>
        <p>
          <strong>{responsibility.actor}</strong> → {responsibility.receiver}
        </p>
        <p>
          Assignment: {responsibility.assignment}
          <br />
          Subject: {responsibility.subject} / draft-0{current.version}
        </p>
        <p>
          Prepare a short onboarding guide with a clear next step and a citation
          to the supplied brief. Deliver a text contribution plus a note
          explaining its scope; for a revision, explain the response to the
          assessment.
        </p>
        <p>
          Scope: preparation and revision only. Publication permission and
          verified cohort usefulness are not established.
        </p>
        <details open>
          <summary>Inspect input · {responsibility.input}</summary>
          <p>{responsibility.inputText}</p>
        </details>
      </section>
      {!current.delivery && !locked && (
        <section className="panel org-stream">
          <h2>Prepare draft-0{current.version}</h2>
          {current.version === 2 && (
            <p>
              Responding to {state.contributions[0].assessment?.id}. Earlier
              content and decisions remain attached to draft-01.
            </p>
          )}
          <label htmlFor="human-contribution-body">Contribution text</label>
          <textarea
            id="human-contribution-body"
            rows={8}
            maxLength={12000}
            value={current.body}
            onChange={(e) => {
              setConfirm(false);
              update({ body: e.target.value });
            }}
          />
          <label htmlFor="human-contribution-note">
            {current.version === 2 ? "Revision response" : "Delivery note"}
          </label>
          <textarea
            id="human-contribution-note"
            rows={3}
            maxLength={3000}
            value={current.note}
            onChange={(e) => {
              setConfirm(false);
              update({ note: e.target.value });
            }}
          />
          <label>
            <input
              type="checkbox"
              checked={current.citesInput}
              onChange={(e) => {
                setConfirm(false);
                update({ citesInput: e.target.checked });
              }}
            />{" "}
            Cite {responsibility.input} as supporting input
          </label>
          <p>
            A citation records what you relied on; it does not prove the guide
            meets the requirements.
          </p>
          <details>
            <summary>Command delivery simulation</summary>
            <label htmlFor="contribution-command-preview">
              Submission result
            </label>
            <select
              id="contribution-command-preview"
              value={preview}
              onChange={(e) => {
                setPreview(e.target.value as CommandPreview);
                setConfirm(false);
              }}
            >
              <option value="projected">Admitted and projection updated</option>
              <option value="pending">Acknowledged; admission pending</option>
              <option value="unknown">Acknowledgement unknown</option>
              <option value="rejected">Rejected: permission denied</option>
              <option value="conflict">Rejected: revision conflict</option>
              <option value="admitted-lag">
                Admitted; projection not updated
              </option>
            </select>
            <p>
              Authored local outcomes; no backend or actual permission check.
            </p>
          </details>
          <button
            className="button primary"
            disabled={!ready || confirm}
            onClick={() => setConfirm(true)}
          >
            Review delivery
          </button>
          {!ready && (
            <p>
              Provide contribution text, a note and the supporting input
              citation before delivery.
            </p>
          )}
          {confirm && (
            <section aria-label="Confirm contribution delivery">
              <h3>Confirm exact delivery</h3>
              <p>
                {responsibility.subject} / draft-0{current.version} →{" "}
                {responsibility.receiver}
              </p>
              <pre className="human-contribution-text">{current.body}</pre>
              <p>{current.note}</p>
              <p>
                Input: {responsibility.input}. This freezes a local copy; it
                does not acknowledge receipt.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  onChange(
                    submitContributionCommand(
                      state,
                      preview,
                      new Date().toISOString(),
                    ),
                  );
                  setConfirm(false);
                }}
              >
                Record local delivery
              </button>{" "}
              <button
                className="button secondary"
                onClick={() => setConfirm(false)}
              >
                Keep editing
              </button>
            </section>
          )}
        </section>
      )}
      {command && (
        <section
          className="panel org-stream"
          aria-label="Contribution command status"
        >
          <h2>Submission status</h2>
          <p role="status">
            Command: {command.status}. Delivery projection:{" "}
            {command.projected ? "updated" : "not updated"}.
          </p>
          <p>
            Subject: {command.subject} / draft-0{command.version}.{" "}
            {command.rejection &&
              `Rejection: ${command.rejection}. The draft is retained; no delivery was created.`}
          </p>
          {["pending", "unknown"].includes(command.status) && (
            <>
              <p>
                Keep the submitted payload unchanged. Query this command; do not
                submit a duplicate.
              </p>
              <button
                className="button secondary"
                onClick={() =>
                  onChange(
                    resolveContributionCommand(
                      state,
                      "admitted",
                      new Date().toISOString(),
                    ),
                  )
                }
              >
                Simulate status query: admitted
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  onChange(
                    resolveContributionCommand(
                      state,
                      "rejected",
                      new Date().toISOString(),
                    ),
                  )
                }
              >
                Simulate status query: rejected
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  onChange(
                    resolveContributionCommand(
                      state,
                      "unknown",
                      new Date().toISOString(),
                    ),
                  )
                }
              >
                Simulate status query: still unknown
              </button>
            </>
          )}
          {command.status === "admitted" && !command.projected && (
            <>
              <p>
                Admission is recorded in this simulation. The delivery view has
                not caught up; do not resend.
              </p>
              <button
                className="button secondary"
                onClick={() => onChange(projectContributionCommand(state))}
              >
                Simulate delivery projection refresh
              </button>
            </>
          )}
          <details>
            <summary>Inspect local command envelope</summary>
            <p>
              {command.id} · Idempotency key: {command.idempotencyKey}
              <br />
              Expected revision: {command.expectedRevision}
              <br />
              Submitted: {command.submittedAt}
            </p>
            <pre className="human-contribution-text">{command.body}</pre>
            <p>
              Actor and effective permission must come from the server in a real
              integration; these tokens are demo-only.
            </p>
          </details>
          <details>
            <summary>Prior command attempts</summary>
            {state.commands?.map((c) => (
              <p key={c.id}>
                {c.id} · draft-0{c.version} · {c.status} · projection{" "}
                {c.projected ? "updated" : "not updated"}
              </p>
            ))}
          </details>
        </section>
      )}
      <section className="panel org-stream">
        <h2>Delivery and receiver response</h2>
        {!current.delivery ? (
          <p>No delivery recorded for draft-0{current.version}.</p>
        ) : (
          <>
            <p>
              Delivered locally: {current.delivery.id}. Receipt:{" "}
              {current.receipt?.id ?? "not recorded"}. Assessment:{" "}
              {current.assessment?.conclusion ?? "not recorded"}.
            </p>
            <h3>Receiver simulation · Maya</h3>
            <p>
              These explicit demo controls represent a separate receiver.
              Delivery alone never creates receipt or assessment.
            </p>
            <button
              className="button secondary"
              disabled={!!current.receipt}
              onClick={() =>
                onChange(receiveContribution(state, new Date().toISOString()))
              }
            >
              Simulate receiver receipt
            </button>
            {current.version === 1 && (
              <button
                className="button secondary"
                disabled={!current.receipt || !!current.assessment}
                onClick={() =>
                  onChange(assessContribution(state, new Date().toISOString()))
                }
              >
                Simulate revision request
              </button>
            )}
            {current.assessment && (
              <>
                <p>{current.assessment.rationale}</p>
                <button
                  className="button primary"
                  onClick={() => onChange(reviseContribution(state))}
                >
                  Prepare draft-02
                </button>
              </>
            )}
            {current.version === 2 && (
              <p>
                Reassessment is pending. Receipt does not accept draft-02,
                authorize publication or verify the shared outcome.
              </p>
            )}
          </>
        )}
      </section>
      <section className="panel org-stream">
        <h2>Version history</h2>
        {state.contributions.map((c) => (
          <article key={c.version}>
            <h3>
              {responsibility.subject} / draft-0{c.version}
            </h3>
            {c.delivery ? (
              <>
                <pre className="human-contribution-text">{c.delivery.body}</pre>
                <p>
                  Delivery: {c.delivery.id} · {c.delivery.at}
                  <br />
                  Note: {c.delivery.note}
                  <br />
                  Input: {c.delivery.input}
                </p>
                {c.delivery.respondsTo && (
                  <p>Responds to: {c.delivery.respondsTo}</p>
                )}
                {c.receipt && (
                  <p>
                    Receipt: {c.receipt.id} → {c.receipt.deliveryId} ·{" "}
                    {c.receipt.at}
                  </p>
                )}
                {c.assessment && (
                  <p>
                    Assessment: {c.assessment.id} → {c.assessment.receiptId} ·{" "}
                    {c.assessment.at}
                    <br />
                    {c.assessment.conclusion}: {c.assessment.rationale}
                  </p>
                )}
              </>
            ) : (
              <p>Editable draft; no delivery or receiving record.</p>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

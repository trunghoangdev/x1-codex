import {
  maxContributionVersions,
  revisionRequest,
} from "./data/humanContribution";
import { ContributionComparison } from "./ContributionComparison";
import { contributionView } from "./data/contributionView";
import {
  commandBlocksEditing,
  submitContributionCommand,
  resolveContributionCommand,
  projectContributionCommand,
  type CommandPreview,
} from "./data/contributionCommand";
import { useEffect, useRef, useState } from "react";
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
  workspace,
}: {
  state: HumanContributionState;
  onChange: (state: HumanContributionState) => void;
  onBack: () => void;
  workspace?: { onOrganization: () => void; onWorkstream: () => void };
}) {
  const [reviewed, setReviewed] = useState<string>();
  const [preview, setPreview] = useState<CommandPreview>("projected");
  // A confirmation authorizes only the exact state and simulation reviewed.
  const reviewIdentity = JSON.stringify({ state, preview });
  const confirm = reviewed === reviewIdentity;
  const setConfirm = (value: boolean) => {
    setReviewed(value ? reviewIdentity : undefined);
    setInterruptedReview(false);
  };
  const [interruptedReview, setInterruptedReview] = useState(false);
  useEffect(() => {
    if (reviewed !== undefined && reviewed !== reviewIdentity) {
      setReviewed(undefined);
      setInterruptedReview(true);
    }
  }, [reviewed, reviewIdentity]);
  const command = state.commands?.at(-1);
  const view = contributionView(state);
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
  const focusStage = `${current.version}:${confirm}:${command?.id ?? ""}:${command?.status ?? ""}:${!!command?.projected}:${!!current.receipt}:${!!current.assessment}`;
  const previousStage = useRef(focusStage);
  useEffect(() => {
    if (previousStage.current === focusStage) return;
    const previous = previousStage.current;
    previousStage.current = focusStage;
    const versionChanged = previous.split(":")[0] !== String(current.version);
    const receiverChanged =
      previous.split(":")[5] !== focusStage.split(":")[5] ||
      previous.split(":")[6] !== focusStage.split(":")[6];
    const commandChanged =
      !!command &&
      (previous.split(":")[2] !== command.id ||
        previous.split(":")[3] !== command.status);
    const target = versionChanged
      ? "human-contribution-body"
      : confirm
        ? "human-delivery-confirm-heading"
        : commandChanged
          ? "human-command-status-heading"
          : previous.split(":")[1] === "true" && !locked && !current.delivery
            ? "human-contribution-body"
            : receiverChanged
              ? "human-receiver-heading"
              : command
                ? "human-command-status-heading"
                : "human-receiver-heading";
    document.getElementById(target)?.focus();
  }, [focusStage, current.version, confirm, locked, current.delivery, command]);
  const ready =
    !!current.body.trim() && !!current.note.trim() && current.citesInput;
  return (
    <div className="detail-page human-contribution-page">
      <button className="button secondary" onClick={onBack}>
        {workspace ? "Back to My Work · Leo" : "Back to Demos"}
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
      {workspace && (
        <section
          className="panel org-stream"
          aria-label="Current contribution task"
        >
          <h2>Current task · draft-0{current.version}</h2>
          <p>
            <strong>Deliverable:</strong> cited access-guide text plus a scope
            or revision note.
          </p>
          <p role="status">
            {confirm && !locked && !current.delivery
              ? "Review the exact version and content below before recording a local delivery."
              : view.contributorNext}
          </p>
          {!current.delivery && !locked && !confirm && (
            <button
              className="button primary"
              onClick={() =>
                document.getElementById("human-contribution-body")?.focus()
              }
            >
              Continue preparing · draft-0{current.version}
            </button>
          )}
          {locked && (
            <button
              className="button secondary"
              onClick={() =>
                document.getElementById("human-command-status-heading")?.focus()
              }
            >
              Inspect unresolved command
            </button>
          )}
        </section>
      )}
      {workspace && (
        <section
          className="panel org-stream"
          aria-label="Contribution workspace context"
        >
          <h2>Knowledge Operations · Welcome guide</h2>
          <details>
            <summary>Assignment context</summary>
            <p>
              K-01-H · Leo · preparation and revision. This sample assignment is
              separate from the authored researcher and distribution
              responsibilities.
            </p>
          </details>
          <button
            className="button secondary"
            onClick={workspace.onOrganization}
          >
            View Organization
          </button>{" "}
          <button className="button secondary" onClick={workspace.onWorkstream}>
            View workstream · K-01
          </button>
        </section>
      )}
      <div className="org-banner contribution-session-note">
        <p>
          Local demo · no upload or publication. Reload starts empty; recover a
          saved checkpoint explicitly.
        </p>
        <details>
          <summary>Session storage and demo boundaries</summary>
          <p>
            Leaving this screen preserves this session.{" "}
            {workspace
              ? "Use Save or restore Knowledge contribution to save and explicitly restore a browser checkpoint. Demos continuity remains separate."
              : "Demo continuity does not save this exercise; reload clears it."}{" "}
            No real receiver or server admission is established.
          </p>
        </details>
      </div>
      {interruptedReview && (
        <p role="status">
          Work changed after the delivery review. The previous confirmation is
          cancelled; inspect the current draft and review again. No command was
          submitted by that cancelled confirmation.
        </p>
      )}
      <section className="panel org-stream">
        <h2>Your responsibility</h2>
        <p>
          <strong>{responsibility.actor}</strong> → {responsibility.receiver}
        </p>
        <p>
          Assignment: {workspace ? "K-01-H" : responsibility.assignment}
          <br />
          Subject: {responsibility.subject} / draft-0{current.version}
        </p>
        <details>
          <summary>Responsibility and publication scope</summary>
          <p>
            Prepare a short onboarding guide with a clear next step and a
            citation to the supplied brief. Deliver a text contribution plus a
            note explaining its scope; for a revision, explain the response to
            the assessment.
          </p>
          <p>
            Scope: preparation and revision only. Publication permission and
            verified cohort usefulness are not established.
          </p>
        </details>
        <details open>
          <summary>Inspect input · {responsibility.input}</summary>
          <p>{responsibility.inputText}</p>
        </details>
      </section>
      {!current.delivery && !locked && (
        <section className="panel org-stream">
          <h2>Prepare draft-0{current.version}</h2>
          {current.version > 1 && (
            <p>
              Responding to {revisionRequest(state.contributions.at(-2))?.id}.
              Earlier content and decisions remain attached to their original
              versions.
            </p>
          )}
          <p id="human-contribution-requirement">
            Required: contribution text, delivery or revision note, and a
            citation to the supplied input. Nothing is uploaded.
          </p>
          <label htmlFor="human-contribution-body">Contribution text</label>
          <textarea
            id="human-contribution-body"
            aria-describedby="human-contribution-requirement"
            rows={8}
            maxLength={12000}
            value={current.body}
            onChange={(e) => {
              setConfirm(false);
              update({ body: e.target.value });
            }}
          />
          <label htmlFor="human-contribution-note">
            {current.version > 1 ? "Revision response" : "Delivery note"}
          </label>
          <textarea
            id="human-contribution-note"
            aria-describedby="human-contribution-requirement"
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
              Still needed:{" "}
              {[
                !current.body.trim() && "contribution text",
                !current.note.trim() &&
                  (current.version > 1 ? "revision response" : "delivery note"),
                !current.citesInput && "supporting input citation",
              ]
                .filter(Boolean)
                .join(", ")}
              . Your draft stays editable; no command has been submitted for
              this preparation.
            </p>
          )}
          {confirm && (
            <section aria-label="Confirm contribution delivery">
              <h3 id="human-delivery-confirm-heading" tabIndex={-1}>
                Confirm exact delivery
              </h3>
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
          <h2 id="human-command-status-heading" tabIndex={-1}>
            Submission status
          </h2>
          <p role="status">
            Command: {command.status}. Delivery projection:{" "}
            {command.projected ? "updated" : "not updated"}.
          </p>
          <p>
            Subject: {command.subject} / draft-0{command.version}.{" "}
            {command.rejection &&
              `Rejection: ${command.rejection}. The draft is retained; no delivery was created.`}
          </p>
          {command.status === "rejected" && <p>{view.contributorNext}</p>}
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
        <h2 id="human-receiver-heading" tabIndex={-1}>
          Delivery and receiver response
        </h2>
        {!current.delivery ? (
          <p>No delivery recorded for draft-0{current.version}.</p>
        ) : (
          <>
            <p role="status" aria-live="polite">
              Delivered locally: {current.delivery.id}. Receipt:{" "}
              {current.receipt?.id ?? "not recorded"}. Assessment:{" "}
              {current.reassessment?.conclusion ??
                current.assessment?.conclusion ??
                "not recorded"}
              .
            </p>
            {!workspace && (
              <>
                <h3>Receiver simulation · Maya</h3>
                <p>
                  These explicit demo controls represent a separate receiver.
                  Delivery alone never creates receipt or assessment.
                </p>
                <button
                  className="button secondary"
                  disabled={!!current.receipt}
                  onClick={() =>
                    onChange(
                      receiveContribution(state, new Date().toISOString()),
                    )
                  }
                >
                  Simulate receiver receipt
                </button>
                {current.version === 1 && (
                  <button
                    className="button secondary"
                    disabled={!current.receipt || !!current.assessment}
                    onClick={() =>
                      onChange(
                        assessContribution(state, new Date().toISOString()),
                      )
                    }
                  >
                    Simulate revision request
                  </button>
                )}
              </>
            )}
            {workspace && (
              <p>
                Receiver actions are in Maya’s My Work. Switch sample persona to
                Maya to record a receipt or request a revision.
              </p>
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
            {current.reassessment && (
              <p>
                Reassessment: {current.reassessment.id} →{" "}
                {current.reassessment.receiptId} →{" "}
                {current.reassessment.deliveryId} ·{" "}
                {current.reassessment.assessor}.{" "}
                {current.reassessment.conclusion}:{" "}
                {current.reassessment.rationale}. Publication authority and
                outcome verification remain separate.
              </p>
            )}
            {current.reassessment?.conclusion === "Further revision needed" &&
              current.version < maxContributionVersions && (
                <button
                  className="button primary"
                  onClick={() => onChange(reviseContribution(state))}
                >
                  Prepare draft-0{current.version + 1}
                </button>
              )}
            {current.version >= maxContributionVersions &&
              current.reassessment?.conclusion ===
                "Further revision needed" && (
                <p>
                  This local exercise supports up to draft-09. Coordinate
                  further work separately.
                </p>
              )}
            {current.version > 2 && (
              <p>
                Changed material requires its own assessment and use mandate.
                Draft-02 use authorization does not apply to this revision; the
                use exercise currently supports draft-02 only.
              </p>
            )}
            {current.version > 1 && !current.reassessment && (
              <p>
                Reassessment is pending. Receipt does not accept draft-0
                {current.version}, authorize publication or verify the shared
                outcome.
              </p>
            )}
          </>
        )}
      </section>
      <ContributionComparison state={state} />
      <details className="panel org-stream" open={!workspace}>
        <summary>
          Version history · {state.contributions.length} versions
        </summary>
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
                {c.reassessment && (
                  <p>
                    Reassessment: {c.reassessment.id} →{" "}
                    {c.reassessment.receiptId} → {c.reassessment.deliveryId} ·{" "}
                    {c.reassessment.assessor} · {c.reassessment.at}.{" "}
                    {c.reassessment.conclusion}: {c.reassessment.rationale}
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
      </details>
    </div>
  );
}

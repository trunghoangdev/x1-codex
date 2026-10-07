import { useEffect, useRef, useState } from "react";
import { ContributionComparison } from "./ContributionComparison";
import { contributionView } from "./data/contributionView";
import {
  reassessContribution,
  assessContribution,
  receiveContribution,
  type HumanContributionState,
} from "./data/humanContribution";

export function ContributionExchange({
  state,
  receiver = false,
  onChange,
  onOpen,
}: {
  state: HumanContributionState;
  receiver?: boolean;
  onChange?: (state: HumanContributionState) => void;
  onOpen?: () => void;
}) {
  const [conclusion, setConclusion] = useState<
    "Suitable for stated scope" | "Further revision needed"
  >("Suitable for stated scope");
  const [rationale, setRationale] = useState("");
  const view = contributionView(state);
  const current = state.contributions.at(-1)!;
  const delivered = state.contributions.filter((c) => c.delivery);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const pendingResult = useRef<string | undefined>(undefined);
  const resultId =
    current.reassessment?.id ?? current.assessment?.id ?? current.receipt?.id;
  useEffect(() => {
    if (
      receiver &&
      pendingResult.current &&
      pendingResult.current === resultId
    ) {
      pendingResult.current = undefined;
      resultHeading.current?.focus();
    }
  }, [state, receiver, resultId]);
  const record = (next: HumanContributionState) => {
    if (!onChange || next === state) return;
    const changed = next.contributions.at(-1)!;
    pendingResult.current =
      changed.reassessment?.id ?? changed.assessment?.id ?? changed.receipt?.id;
    onChange(next);
  };
  return (
    <section
      className="panel org-stream"
      aria-label={
        receiver
          ? "Maya contribution inbox"
          : "Shared contribution observations"
      }
    >
      <h2>
        {receiver ? "Contribution for Maya" : "Contribution exchange · K-01-H"}
      </h2>
      <p>Knowledge Operations · K-01 · Leo → Maya · local demo.</p>
      <details>
        <summary>Source, recovery and outcome boundaries</summary>
        <p>
          Local session sample; reload starts empty; explicitly restore a saved
          contribution checkpoint to resume. No publication authority or
          verified outcome is established.
        </p>
      </details>
      <p role="status">{view.summary}</p>
      {receiver && !current.receipt && (
        <p>
          <strong>Next step:</strong> {view.receiverNext}
        </p>
      )}
      {receiver && current.receipt && (
        <section aria-label="Receiver action result" className="org-banner">
          <h3 ref={resultHeading} tabIndex={-1}>
            Receiver result · draft-0{current.version}
          </h3>
          <p role="status">
            {current.reassessment
              ? "Sample reassessment recorded"
              : current.assessment
                ? "Sample revision request recorded"
                : "Sample receipt recorded"}{" "}
            · draft-0{current.version}.
          </p>
          <p>
            Receipt: {current.receipt.id} → {current.receipt.deliveryId} ·{" "}
            {current.receipt.at}.
          </p>
          {current.assessment && (
            <>
              <p>
                Assessment: {current.assessment.id} →{" "}
                {current.assessment.receiptId} · {current.assessment.at}.
              </p>
              <details>
                <summary>Inspect recorded revision guidance</summary>
                <p>{current.assessment.rationale}</p>
              </details>
            </>
          )}
          {current.reassessment && (
            <>
              <p>
                Reassessment: {current.reassessment.id} →{" "}
                {current.reassessment.receiptId} →{" "}
                {current.reassessment.deliveryId} ·{" "}
                {current.reassessment.assessor} · {current.reassessment.at}.
              </p>
              <p>
                {current.reassessment.conclusion}:{" "}
                {current.reassessment.rationale}
              </p>
            </>
          )}
          <p>
            <strong>Next step:</strong> {view.receiverNext}
          </p>
          <p>
            Local sample record. Receipt does not establish acceptance,
            publication permission or a verified outcome.
          </p>
        </section>
      )}
      {delivered.length === 0 && (
        <p>No delivered contribution is available to receive.</p>
      )}
      {[...delivered].reverse().map((c) => (
        <article key={c.version}>
          <details open={!receiver || c.version === current.version}>
            <summary>
              {c.version === current.version
                ? "Current delivered revision"
                : "Earlier delivered revision"}{" "}
              · draft-0{c.version}
            </summary>
            <h3>
              draft-0{c.version} · {c.delivery!.id}
            </h3>
            <p>
              Subject: human-guide-example / draft-0{c.version} · delivered{" "}
              {c.delivery!.at}
            </p>
            <details open={receiver && c.version === current.version}>
              <summary>
                Inspect exact delivered contribution · draft-0{c.version}
              </summary>
              <pre className="human-contribution-text">{c.delivery!.body}</pre>
              <p>Scope note: {c.delivery!.note}</p>
              <p>Input: {c.delivery!.input}</p>
              {c.delivery!.respondsTo && (
                <p>Responds to: {c.delivery!.respondsTo}</p>
              )}
            </details>
            <p>
              Receipt:{" "}
              {c.receipt
                ? `${c.receipt.id} → ${c.receipt.deliveryId} · ${c.receipt.at}`
                : "not recorded"}
            </p>
            <p>
              Assessment:{" "}
              {c.assessment
                ? `${c.assessment.id} → ${c.assessment.receiptId} · ${c.assessment.conclusion}`
                : "not recorded"}
            </p>
            {c.assessment && <p>{c.assessment.rationale}</p>}
            {c.reassessment && (
              <p>
                Reassessment: {c.reassessment.id} → {c.reassessment.receiptId} →{" "}
                {c.reassessment.deliveryId} · {c.reassessment.assessor} ·{" "}
                {c.reassessment.at}. {c.reassessment.conclusion}:{" "}
                {c.reassessment.rationale}
              </p>
            )}
          </details>
        </article>
      ))}
      <ContributionComparison state={state} deliveredOnly />
      {receiver && current.delivery && (
        <>
          <details>
            <summary>About sample receiver actions</summary>
            <p>
              Sample receiver actions · Maya. These local records are not
              server-admitted decisions. The revision request uses authored
              guidance; it does not evaluate your text.
            </p>
          </details>
          <button
            className="button secondary"
            disabled={!onChange || !!current.receipt}
            onClick={() =>
              record(receiveContribution(state, new Date().toISOString()))
            }
          >
            Record sample receipt · draft-0{current.version}
          </button>{" "}
          {current.version === 1 && (
            <button
              className="button secondary"
              disabled={!onChange || !current.receipt || !!current.assessment}
              onClick={() =>
                record(assessContribution(state, new Date().toISOString()))
              }
            >
              Request sample revision · draft-01
            </button>
          )}
          {current.version === 2 &&
            current.receipt &&
            !current.reassessment && (
              <section aria-label="Reassess draft-02">
                <h3>Assess received draft-02</h3>
                <p>
                  Maya’s local sample judgement of {current.receipt.id} →{" "}
                  {current.delivery.id}. Inspect the delivered text and
                  comparison before recording. This does not authorize
                  publication.
                </p>
                <label>
                  Reassessment conclusion
                  <select
                    value={conclusion}
                    onChange={(e) =>
                      setConclusion(e.target.value as typeof conclusion)
                    }
                  >
                    <option>Suitable for stated scope</option>
                    <option>Further revision needed</option>
                  </select>
                </label>
                <label>
                  Reassessment rationale
                  <textarea
                    value={rationale}
                    maxLength={3000}
                    onChange={(e) => setRationale(e.target.value)}
                  />
                </label>
                <button
                  className="button secondary"
                  disabled={!onChange || !rationale.trim()}
                  onClick={() => {
                    record(
                      reassessContribution(
                        state,
                        conclusion,
                        rationale,
                        new Date().toISOString(),
                      ),
                    );
                    setRationale("");
                  }}
                >
                  Record sample reassessment · draft-02
                </button>
                {!rationale.trim() && (
                  <p>
                    A rationale is required. Nothing is recorded until you
                    submit.
                  </p>
                )}
              </section>
            )}
          {current.version === 2 && !current.reassessment && (
            <p>
              Reassessment remains pending. A receipt does not accept this
              revision.
            </p>
          )}
        </>
      )}
      {onOpen && (
        <button className="button secondary" onClick={onOpen}>
          Open receiver inbox · Maya
        </button>
      )}
    </section>
  );
}

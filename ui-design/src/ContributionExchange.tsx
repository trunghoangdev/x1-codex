import { useEffect, useRef } from "react";
import { ContributionComparison } from "./ContributionComparison";
import { contributionView } from "./data/contributionView";
import {
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
  const view = contributionView(state);
  const current = state.contributions.at(-1)!;
  const delivered = state.contributions.filter((c) => c.delivery);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const pendingResult = useRef<string | undefined>(undefined);
  const resultId = current.assessment?.id ?? current.receipt?.id;
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
    pendingResult.current = changed.assessment?.id ?? changed.receipt?.id;
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
      <p>
        Knowledge Operations · K-01 · Leo → Maya. Local session sample; reload
        starts empty; explicitly restore a saved contribution checkpoint to
        resume. No publication authority or verified outcome is established.
      </p>
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
            {current.assessment
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
              <p>{current.assessment.rationale}</p>
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
          </details>
        </article>
      ))}
      <ContributionComparison state={state} deliveredOnly />
      {receiver && current.delivery && (
        <>
          <p>
            Sample receiver actions · Maya. These local records are not
            server-admitted decisions. The revision request uses authored
            guidance; it does not evaluate your text.
          </p>
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
          {current.version === 2 && (
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

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
  const current = state.contributions.at(-1)!;
  const delivered = state.contributions.filter((c) => c.delivery);
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
        clears these records. No publication authority or verified outcome is
        established.
      </p>
      <p role="status">
        {current.delivery
          ? `draft-0${current.version}: delivered locally · ${current.receipt ? "receipt recorded" : "awaiting receiver receipt"} · ${current.assessment ? "revision requested" : "assessment not recorded"}`
          : `draft-0${current.version}: preparation · no delivery recorded`}
      </p>
      {delivered.length === 0 && (
        <p>No delivered contribution is available to receive.</p>
      )}
      {delivered.map((c) => (
        <article key={c.version}>
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
        </article>
      ))}
      {receiver && current.delivery && (
        <>
          <p>
            Sample receiver actions · Maya. These local records are not
            server-admitted decisions. The revision request uses authored
            guidance; it does not evaluate your text.
          </p>
          <button
            className="button secondary"
            disabled={!!current.receipt}
            onClick={() =>
              onChange?.(receiveContribution(state, new Date().toISOString()))
            }
          >
            Record sample receipt · draft-0{current.version}
          </button>{" "}
          {current.version === 1 && (
            <button
              className="button secondary"
              disabled={!current.receipt || !!current.assessment}
              onClick={() =>
                onChange?.(assessContribution(state, new Date().toISOString()))
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

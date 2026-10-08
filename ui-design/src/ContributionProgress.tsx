import type { HumanContributionState } from "./data/humanContribution";
import { contributionView } from "./data/contributionView";

export function ContributionProgress({
  state,
  onContributor,
  onReceiver,
}: {
  state: HumanContributionState;
  onContributor: () => void;
  onReceiver: () => void;
}) {
  const view = contributionView(state);
  const [first, second] = state.contributions;
  const next =
    view.attention === "allocation"
      ? view.contributorNext
      : view.attention === "receipt"
        ? "Maya · inspect the delivered version and record its sample receipt"
        : view.attention === "allocation" ||
            view.attention === "revision" ||
            view.attention === "command" ||
            view.attention === "correction" ||
            !state.contributions.at(-1)?.delivery
          ? `Leo · ${view.contributorNext}`
          : state.contributions.at(-1)?.reassessment
            ? view.contributorNext
            : "No further action owner is established by the current records; assessment remains separate.";
  return (
    <section
      className="panel org-stream"
      aria-label="Local contribution progress"
    >
      <div className="eyebrow">LOCAL EXERCISE · K-01-H · LEO → MAYA</div>
      <h2>Contribution progress · Welcome guide</h2>
      <p>
        This lane follows local contribution records, including explicit
        restore/import. It does not advance the authored workflow, resolve
        responsibility gaps or verify the organization’s outcome.
      </p>
      <p role="status">
        {view.summary} · {view.stage}.
      </p>
      <p>
        <strong>Next responsibility:</strong> {next}
      </p>
      <ol>
        <li>
          <strong>Leo · prepare draft-01</strong>
          <p>
            {first.delivery
              ? "Frozen in the original delivery below."
              : first.body.trim()
                ? "Text in preparation; no delivery recorded."
                : "Preparation not yet recorded."}
          </p>
        </li>
        <li>
          <strong>Leo → Maya · deliver draft-01</strong>
          <p>
            {first.delivery
              ? `${first.delivery.id} · ${first.delivery.at}`
              : "No delivery recorded. A pending or unknown command is not a delivery."}
          </p>
        </li>
        <li>
          <strong>Maya · receive draft-01</strong>
          <p>
            {first.receipt
              ? `${first.receipt.id} → ${first.receipt.deliveryId} · ${first.receipt.at}`
              : "Receipt not recorded."}
          </p>
        </li>
        <li>
          <strong>Maya → Leo · request revision</strong>
          <p>
            {first.assessment
              ? `${first.assessment.id} → ${first.assessment.receiptId} · ${first.assessment.at}`
              : "Revision request not recorded; it is not inferred from receipt."}
          </p>
          {first.assessment && (
            <details>
              <summary>Inspect original revision request</summary>
              <p>{first.assessment.rationale}</p>
            </details>
          )}
        </li>
        <li>
          <strong>Leo · prepare and deliver draft-02</strong>
          <p>
            {second?.delivery
              ? `${second.delivery.id} · responds to ${second.delivery.respondsTo} · ${second.delivery.at}`
              : second
                ? `Revision preparation started in response to ${first.assessment?.id}; no revised delivery recorded.`
                : "Revision preparation not started."}
          </p>
        </li>
        <li>
          <strong>Maya · receive draft-02 and reassess separately</strong>
          <p>
            {second?.receipt
              ? `${second.receipt.id} → ${second.receipt.deliveryId} · ${second.receipt.at}. ${second.reassessment ? `${second.reassessment.id} · ${second.reassessment.assessor} · ${second.reassessment.conclusion}` : "Reassessment pending."}`
              : "Revised receipt not recorded. No reassessment or acceptance is established."}
          </p>
        </li>
        {state.contributions.slice(2).map((c) => (
          <li key={c.version}>
            <strong>Leo → Maya · draft-0{c.version}</strong>
            <p>
              {c.delivery
                ? `${c.delivery.id} · responds to ${c.delivery.respondsTo}`
                : "Revision preparation; no delivery recorded."}
            </p>
            <p>
              {c.receipt
                ? `${c.receipt.id} → ${c.receipt.deliveryId}`
                : "Receipt not recorded."}
            </p>
            <p>
              {c.reassessment
                ? `${c.reassessment.id} · ${c.reassessment.conclusion}: ${c.reassessment.rationale}`
                : "Reassessment not recorded."}
            </p>
          </li>
        ))}
      </ol>
      <button className="button secondary" onClick={onContributor}>
        Inspect contribution · Leo
      </button>{" "}
      <button className="button secondary" onClick={onReceiver}>
        Inspect receiver inbox · Maya
      </button>
      <p>
        Sample-persona navigation only. Receipt, assessment, publication
        authority and verified outcome remain distinct.
      </p>
    </section>
  );
}

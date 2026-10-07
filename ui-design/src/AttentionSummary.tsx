import {
  organizationAttention,
  type AttentionCategory,
  type AttentionItem,
} from "./data/organizationAttention";
import type { Readiness } from "./data/models";
export function AttentionSummary({
  attentionItems,
  completed,
  readiness,
  onOpen,
}: {
  attentionItems?: AttentionItem[];
  completed: Record<string, string>;
  readiness: Readiness;
  onOpen: (category: AttentionCategory | "All") => void;
}) {
  const items = attentionItems ?? organizationAttention(completed, readiness);
  return (
    <section
      className="panel org-stream org-overview-section"
      aria-label="Organization attention summary"
    >
      <h2 id="org-attention" tabIndex={-1}>
        Organization attention
      </h2>
      <p>
        {items.length} known sample signals across responsibility, pending
        responses, missing inputs and unverified outcomes.
      </p>
      <div className="attention-summary-grid">
        {(["Responsibility", "Response", "Input", "Outcome"] as const).map(
          (category) => (
            <button
              className="attention-summary-button"
              key={category}
              onClick={() => onOpen(category)}
            >
              <strong>
                {items.filter((item) => item.category === category).length}
              </strong>
              <span>{category}</span>
            </button>
          ),
        )}
      </div>
      <p>
        Counts describe signals, not assignments or progress. A recorded
        response does not verify a goal.
      </p>
      {items.length > 0 && items.every(item => item.source) && <p aria-label="Attention counter sources">
        Source scope: {items.filter(item => item.source === "authored").length} authored scenario signals · {items.filter(item => item.source === "session").length} local session signals. These totals follow the attention list. Local signals follow this sample’s save/reload rules. Neither source is live organizational data.
      </p>}
      <button className="button secondary" onClick={() => onOpen("All")}>
        View all organization attention
      </button>
    </section>
  );
}

import type { CoordinationNeed } from "./data/actionableAttention";
export function CoordinationNeeds({
  items,
  onOpen,
  compact = false,
}: {
  items: CoordinationNeed[];
  onOpen: (item: CoordinationNeed) => void;
  compact?: boolean;
}) {
  return (
    <section
      className="panel org-stream"
      aria-label="Concrete coordination needs"
    >
      <h2>Coordination needs to inspect</h2>
      <p>
        Suggested next steps from represented records. These signals can
        overlap; they are not unique tasks, urgency rankings or progress.
      </p>
      {compact && (
        <p>
          Showing the first {Math.min(3, items.length)} of {items.length}{" "}
          signals in source order. Open all attention for the complete list.
        </p>
      )}
      {(compact ? items.slice(0, 3) : items).map((item) => (
        <article className="org-stream-assignment" key={item.id}>
          <h3>{item.title}</h3>
          <span className="badge neutral">{item.category}</span>
          <p>
            <strong>Affected subject:</strong> {item.target.id}
          </p>
          <p>
            <strong>Why it needs attention:</strong> {item.detail}
          </p>
          <p>
            <strong>Known responsibility:</strong> {item.responsibility}
          </p>
          <p>
            <strong>Suggested next step:</strong> {item.nextStep}
          </p>
          <button className="button secondary" onClick={() => onOpen(item)}>
            {item.destination
              ? `Open next step · ${item.owner}`
              : `Inspect ${item.target.kind} · ${item.target.id}`}
          </button>
        </article>
      ))}
      {items.length === 0 && (
        <p>
          No matching represented signals. This does not establish organization
          health.
        </p>
      )}
    </section>
  );
}

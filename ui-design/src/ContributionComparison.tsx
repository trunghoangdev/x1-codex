import type { HumanContributionState } from "./data/humanContribution";

// Mark one changed passage bounded by equal lines. Linear work even for long text;
// this is an exact text comparison, not a semantic assessment or minimal edit diff.
export function contributionTextChange(before: string, after: string) {
  const left = before.split("\n");
  const right = after.split("\n");
  let start = 0;
  while (
    start < left.length &&
    start < right.length &&
    left[start] === right[start]
  )
    start++;
  let end = 0;
  while (
    end < left.length - start &&
    end < right.length - start &&
    left[left.length - 1 - end] === right[right.length - 1 - end]
  )
    end++;
  return {
    prefix: left.slice(0, start),
    removed: left.slice(start, left.length - end),
    added: right.slice(start, right.length - end),
    suffix: end ? left.slice(left.length - end) : [],
  };
}
export function ContributionComparison({
  state,
  deliveredOnly = false,
}: {
  state: HumanContributionState;
  deliveredOnly?: boolean;
}) {
  const [first, second] = state.contributions;
  if (
    !first?.delivery ||
    !first.assessment ||
    !second ||
    (deliveredOnly && !second.delivery)
  )
    return null;
  const before = first.delivery;
  const body = second.delivery?.body ?? second.body;
  const note = second.delivery?.note ?? second.note;
  const change = contributionTextChange(before.body, body);
  const changed = before.body !== body;
  const render = (version: 1 | 2) => (
    <>
      {change.prefix.map((line, i) => (
        <span key={`p${i}`}>
          {line}
          {"\n"}
        </span>
      ))}
      {(version === 1 ? change.removed : change.added).map((line, i) =>
        version === 1 ? (
          <del key={i}>
            {line}
            {"\n"}
          </del>
        ) : (
          <ins key={i}>
            {line}
            {"\n"}
          </ins>
        ),
      )}
      {change.suffix.map((line, i) => (
        <span key={`s${i}`}>
          {line}
          {"\n"}
        </span>
      ))}
    </>
  );
  return (
    <details className="panel org-stream contribution-comparison">
      <summary>Compare draft-01 and draft-02</summary>
      <section aria-label="Contribution version comparison">
        <h2>Revision comparison</h2>
        <p>
          draft-01 is the frozen delivery. draft-02 is{" "}
          {second.delivery
            ? "the frozen revised delivery"
            : "current preparation, not delivered"}
          . Highlighting marks a changed passage between equal lines; it does
          not evaluate whether the request was satisfied.
        </p>
        <h3>Request attached to draft-01</h3>
        <p>
          {first.assessment.id} → {first.assessment.receiptId} → {before.id} ·
          draft-01.
        </p>
        <p>{first.assessment.rationale}</p>
        <p>
          draft-02{" "}
          {second.delivery
            ? `delivery responds to ${second.delivery.respondsTo}`
            : `is being prepared in response to ${first.assessment.id}`}
          . The original assessment does not assess draft-02.
        </p>
        <p>
          Text: {changed ? "changed" : "unchanged"}. Note:{" "}
          {before.note === note ? "unchanged" : "changed"}.{" "}
          {second.delivery
            ? "Reassessment remains pending; delivery and receipt do not establish acceptance."
            : "Preparation can still change; no revised delivery or reassessment is recorded."}
        </p>
        <div className="contribution-comparison-columns">
          <article aria-label="Comparison draft-01">
            <h3>draft-01 · delivered</h3>
            <p>Removed or replaced passage is struck through.</p>
            <pre className="human-contribution-text">{render(1)}</pre>
            <h4>Original scope note</h4>
            <p>{before.note}</p>
            <p>Input: {before.input}</p>
          </article>
          <article aria-label="Comparison draft-02">
            <h3>draft-02 · {second.delivery ? "delivered" : "preparation"}</h3>
            <p>Added or replacement passage is underlined.</p>
            <pre className="human-contribution-text">{render(2)}</pre>
            <h4>Contributor revision response</h4>
            <p>{note.trim() ? note : "No revision response written yet."}</p>
            <p>
              Input:{" "}
              {second.delivery?.input ??
                (second.citesInput ? before.input : "citation not selected")}
            </p>
            <p>
              This response is Leo’s explanation, not confirmation that Maya’s
              request has been satisfied.
            </p>
          </article>
        </div>
      </section>
    </details>
  );
}

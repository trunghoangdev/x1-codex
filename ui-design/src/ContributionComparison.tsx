import { diffLines, type Row } from "./diff";
import type { HumanContributionState } from "./data/humanContribution";

// Reuse the exact line diff only within a bounded middle; very large edits
// retain an explicitly labelled coarse passage rather than allocating a huge matrix.
export function contributionTextChange(before: string, after: string) {
  const left = before.split("\n"),
    right = after.split("\n");
  let start = 0,
    end = 0;
  while (
    start < left.length &&
    start < right.length &&
    left[start] === right[start]
  )
    start++;
  while (
    end < left.length - start &&
    end < right.length - start &&
    left[left.length - 1 - end] === right[right.length - 1 - end]
  )
    end++;
  const removed = left.slice(start, left.length - end),
    added = right.slice(start, right.length - end);
  const coarse = (removed.length + 1) * (added.length + 1) > 250_000;
  const rows: Row[] = [
    ...left.slice(0, start).map((text) => ({ kind: "context" as const, text })),
    ...(coarse
      ? [
          ...removed.map((text) => ({ kind: "removed" as const, text })),
          ...added.map((text) => ({ kind: "added" as const, text })),
        ]
      : diffLines(removed, added)),
    ...(end
      ? left
          .slice(left.length - end)
          .map((text) => ({ kind: "context" as const, text }))
      : []),
  ];
  const regions = rows.filter(
    (row, i) =>
      row.kind !== "context" && (i === 0 || rows[i - 1].kind === "context"),
  ).length;
  return { rows, coarse, regions };
}
export function ContributionComparison({
  state,
  deliveredOnly = false,
}: {
  state: HumanContributionState;
  deliveredOnly?: boolean;
}) {
  const first = state.contributions.at(-2),
    second = state.contributions.at(-1);
  const request =
    first?.revisionRequest ?? first?.assessment ?? first?.reassessment;
  if (
    !first?.delivery ||
    !request ||
    !second ||
    (deliveredOnly && !second.delivery)
  )
    return null;
  const before = first.delivery;
  const body = second.delivery?.body ?? second.body;
  const note = second.delivery?.note ?? second.note;
  const change = contributionTextChange(before.body, body);
  const changed = before.body !== body;
  const render = (version: 1 | 2) => {
    const rows = change.rows.filter(
      (row) =>
        row.kind === "context" ||
        row.kind === (version === 1 ? "removed" : "added"),
    );
    return rows.map((row, i) => {
      const text = row.text + (i < rows.length - 1 ? "\n" : "");
      return row.kind === "removed" ? (
        <del key={i}>{text}</del>
      ) : row.kind === "added" ? (
        <ins key={i}>{text}</ins>
      ) : (
        <span key={i}>{text}</span>
      );
    });
  };
  return (
    <details className="panel org-stream contribution-comparison">
      <summary>
        Compare draft-0{first.version} and draft-0{second.version}
      </summary>
      <section aria-label="Contribution version comparison">
        <h2>Revision comparison</h2>
        <p>
          {change.regions} changed{" "}
          {change.regions === 1 ? "passage" : "passages"} ·{" "}
          {change.coarse
            ? "Coarse comparison for a large edit; unchanged lines inside the marked passage may also be highlighted."
            : "Separate changes are marked; matching lines between them remain unmarked."}
        </p>
        <p>
          draft-0{first.version} is the frozen delivery. draft-0{second.version}{" "}
          is{" "}
          {second.delivery
            ? "the frozen revised delivery"
            : "current preparation, not delivered"}
          .
        </p>
        <details>
          <summary>How to read this comparison</summary>
          <p>
            Highlighting compares exact lines, not meaning; it does not evaluate
            whether the request was satisfied. Removed or replaced passages are
            struck through; added or replacement passages are underlined. Leo’s
            revision response is an explanation, not confirmation that Maya’s
            request has been satisfied.
          </p>
        </details>
        <h3>Request attached to draft-0{first.version}</h3>
        <p>
          {request.id} → {request.receiptId} → {before.id} · draft-0
          {first.version}.
        </p>
        <p>{request.rationale}</p>
        <p>
          draft-0{second.version}{" "}
          {second.delivery
            ? `delivery responds to ${second.delivery.respondsTo}`
            : `is being prepared in response to ${request.id}`}
          . The original assessment does not assess draft-0{second.version}.
        </p>
        <p>
          Text: {changed ? "changed" : "unchanged"}. Note:{" "}
          {before.note === note ? "unchanged" : "changed"}.{" "}
          {second.reassessment
            ? `Reassessment: ${second.reassessment.id} → ${second.reassessment.receiptId} → ${second.reassessment.deliveryId} · ${second.reassessment.assessor}. ${second.reassessment.conclusion}: ${second.reassessment.rationale}. Publication authority and outcome verification remain separate.`
            : second.delivery
              ? "Reassessment remains pending; delivery and receipt do not establish acceptance."
              : "Preparation can still change; no revised delivery or reassessment is recorded."}
        </p>
        <div className="contribution-comparison-columns">
          <article aria-label={`Comparison draft-0${first.version}`}>
            <h3>draft-0{first.version} · delivered</h3>
            <pre className="human-contribution-text">{render(1)}</pre>
            <h4>Original scope note</h4>
            <p>{before.note}</p>
            <p>Input: {before.input}</p>
          </article>
          <article aria-label={`Comparison draft-0${second.version}`}>
            <h3>
              draft-0{second.version} ·{" "}
              {second.delivery ? "delivered" : "preparation"}
            </h3>
            <pre className="human-contribution-text">{render(2)}</pre>
            <h4>Contributor revision response</h4>
            <p>{note.trim() ? note : "No revision response written yet."}</p>
            <p>
              Input:{" "}
              {second.delivery?.input ??
                (second.citesInput ? before.input : "citation not selected")}
            </p>
          </article>
        </div>
      </section>
    </details>
  );
}

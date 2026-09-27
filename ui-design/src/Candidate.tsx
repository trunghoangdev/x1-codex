import { useState } from "react";
import { FileCode2, GitBranch } from "lucide-react";
import { sampleCandidate } from "./candidateData";

type Row = {
  kind: "context" | "removed" | "added";
  text: string;
  old?: number;
  next?: number;
};
// Longest-common-subsequence diff over the small, complete fixture files.
export function diffLines(before: string[], after: string[]): Row[] {
  const lengths = Array.from({ length: before.length + 1 }, () =>
    Array(after.length + 1).fill(0),
  );
  for (let i = before.length - 1; i >= 0; i--)
    for (let j = after.length - 1; j >= 0; j--)
      lengths[i][j] =
        before[i] === after[j]
          ? 1 + lengths[i + 1][j + 1]
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
  const rows: Row[] = [];
  let i = 0,
    j = 0;
  while (i < before.length || j < after.length) {
    if (i < before.length && j < after.length && before[i] === after[j]) {
      rows.push({ kind: "context", text: before[i], old: ++i, next: ++j });
    } else if (
      i < before.length &&
      (j === after.length || lengths[i + 1][j] >= lengths[i][j + 1])
    ) {
      rows.push({ kind: "removed", text: before[i], old: ++i });
    } else {
      rows.push({ kind: "added", text: after[j], next: ++j });
    }
  }
  return rows;
}
export function Candidate({ assignmentId }: { assignmentId: string }) {
  const [index, setIndex] = useState(0);
  if (assignmentId !== sampleCandidate.assignmentId)
    return (
      <div className="empty-state">
        <FileCode2 size={28} />
        <h3>No sample candidate for this assignment</h3>
        <p>
          Production candidates are not connected. No conclusion about actual
          work can be drawn from this view.
        </p>
      </div>
    );
  const candidate = sampleCandidate,
    file = candidate.files[index],
    rows = diffLines(file.before, file.after);
  const additions = rows.filter((r) => r.kind === "added").length,
    removals = rows.filter((r) => r.kind === "removed").length;
  return (
    <div className="candidate-view">
      <div className="section-label">CANDIDATE & DIFF · SAMPLE DATA</div>
      <h2>Inspect what this candidate changes.</h2>
      <p className="summary">
        Complete illustrative files compared with a fixed sample base. These
        snippets are a review example, not a verified implementation or live
        repository diff.
      </p>
      <dl className="candidate-identity">
        <div>
          <dt>Candidate</dt>
          <dd>{candidate.label}</dd>
        </div>
        <div>
          <dt>Produced by</dt>
          <dd>{candidate.attemptId}</dd>
        </div>
        <div>
          <dt>
            <GitBranch size={13} />
            Base revision · synthetic
          </dt>
          <dd>
            <code>{candidate.baseRevision}</code>
          </dd>
        </div>
        <div>
          <dt>Artifact · synthetic, not verified</dt>
          <dd>
            <code>{candidate.artifactDigest}</code>
          </dd>
        </div>
      </dl>
      <h3>
        Changed files{" "}
        <span className="count-badge">{candidate.files.length}</span>
      </h3>
      <div className="candidate-files" aria-label="Changed files">
        {candidate.files.map((f, n) => (
          <button
            key={f.path}
            aria-pressed={index === n}
            className={index === n ? "selected" : ""}
            onClick={() => setIndex(n)}
          >
            <FileCode2 size={16} />
            <span>{f.path}</span>
            <small>{f.operation}</small>
          </button>
        ))}
      </div>
      <section className="diff-panel" aria-label={`Diff for ${file.path}`}>
        <div className="diff-heading">
          <strong>{file.path}</strong>
          <span>
            {additions} added · {removals} removed
          </span>
        </div>
        <div
          className="diff-scroll"
          tabIndex={0}
          role="region"
          aria-label="Scrollable line diff"
        >
          <table className="diff-table">
            <caption className="sr-only">
              Base and candidate line numbers; plus means added, minus means
              removed.
            </caption>
            <thead>
              <tr>
                <th scope="col">Base</th>
                <th scope="col">New</th>
                <th scope="col">Change</th>
                <th scope="col">Content</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, n) => (
                <tr key={n} className={`diff-${r.kind}`}>
                  <td>{r.old ?? "—"}</td>
                  <td>{r.next ?? "—"}</td>
                  <td>
                    <span aria-label={r.kind}>
                      {r.kind === "added"
                        ? "+"
                        : r.kind === "removed"
                          ? "−"
                          : " "}
                    </span>
                  </td>
                  <td>
                    <code>{r.text || " "}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="inline-note">
        <FileCode2 size={17} />
        <p>
          Inspecting changes does not validate, approve, or apply them. The
          candidate remains separate from the authoritative repository.
        </p>
      </div>
    </div>
  );
}

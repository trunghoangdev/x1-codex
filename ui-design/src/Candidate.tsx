import { diffLines, splitRows } from "./diff";
import { RelatedRecords, type NavigateRelated } from "./RelatedRecords";
import { useState } from "react";
import { FileCode2, GitBranch } from "lucide-react";
import { sampleCandidate } from "./data/candidate";

export function Candidate({
  assignmentId,
  onNavigate,
}: {
  assignmentId: string;
  onNavigate: NavigateRelated;
}) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"unified" | "split">("unified");
  const [fileQuery, setFileQuery] = useState("");
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
      <RelatedRecords
        onNavigate={onNavigate}
        links={[
          { tab: "Attempts", label: "View producing attempt" },
          { tab: "Checks", label: "Review candidate checks" },
        ]}
      />
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
      <label className="diff-file-search">
        Find a changed file
        <input
          value={fileQuery}
          onChange={(e) => setFileQuery(e.target.value)}
          placeholder="Filter by path…"
        />
      </label>
      <p className="demo-note">
        Filtering the list keeps the currently open diff selected.
      </p>
      {candidate.files.every(
        (f) => !f.path.toLowerCase().includes(fileQuery.toLowerCase()),
      ) && (
        <div className="diff-empty" role="status">
          <p>No matching files. The open diff below is unchanged.</p>
          <button className="button secondary" onClick={() => setFileQuery("")}>
            Clear file filter
          </button>
        </div>
      )}
      <div className="candidate-files" aria-label="Changed files">
        {candidate.files.map((f, n) =>
          f.path.toLowerCase().includes(fileQuery.toLowerCase()) ? (
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
          ) : null,
        )}
      </div>
      <div className="diff-mode" role="group" aria-label="Diff layout">
        <button
          className="button secondary"
          aria-pressed={mode === "unified"}
          onClick={() => setMode("unified")}
        >
          Unified
        </button>
        <button
          className="button secondary"
          aria-pressed={mode === "split"}
          onClick={() => setMode("split")}
        >
          Side by side
        </button>
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
          {mode === "split" ? (
            <table className="diff-table split-diff">
              <caption className="sr-only">
                Side-by-side base and candidate. Minus marks removed lines; plus
                marks added lines.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Base line</th>
                  <th scope="col">Base content</th>
                  <th scope="col">Candidate line</th>
                  <th scope="col">Candidate content</th>
                </tr>
              </thead>
              <tbody>
                {splitRows(rows).map(({ left, right }, n) => (
                  <tr key={n}>
                    <td>{left?.old ?? "—"}</td>
                    <td className={left ? `diff-${left.kind}` : "diff-absent"}>
                      {left ? (
                        <code>
                          {left.kind === "removed" ? "− " : "  "}
                          {left.text || " "}
                        </code>
                      ) : (
                        <span className="sr-only">No base line</span>
                      )}
                    </td>
                    <td>{right?.next ?? "—"}</td>
                    <td
                      className={right ? `diff-${right.kind}` : "diff-absent"}
                    >
                      {right ? (
                        <code>
                          {right.kind === "added" ? "+ " : "  "}
                          {right.text || " "}
                        </code>
                      ) : (
                        <span className="sr-only">No candidate line</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
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
          )}
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

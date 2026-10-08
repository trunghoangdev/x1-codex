import {
  reviewOwner,
  reviewPrincipals,
  reviewRoles,
  type ReviewRole,
} from "./data/reviewHandoffs";
import { currentGuideSubject, guideInputStatus } from "./data/workstreamInputs";
import {
  contributionPerformer,
  contributorNames,
} from "./data/knowledgeHandoff";
import { knowledgeResponsibilityStatus } from "./data/knowledgeResponsibility";
import { useEffect, useRef, useState } from "react";
import {
  encodeKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  parseKnowledgeCheckpoint,
  parseKnowledgeImport,
  replaceKnowledge,
  sameKnowledgeValue,
  type KnowledgeWorkspace,
  type KnowledgeImport,
} from "./data/knowledgeCheckpoint";
import { useProgress } from "./data/useProgress";
import { briefInputSummary } from "./data/briefHandoff";
export function KnowledgeRecovery({
  state,
  onChange,
}: {
  state: KnowledgeWorkspace;
  onChange: (s: KnowledgeWorkspace) => void;
}) {
  const [saved, setSaved] = useState<KnowledgeWorkspace>();
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [incoming, setIncoming] = useState<KnowledgeImport>();
  const [operation, setOperation] = useState<"save" | "remove">();
  const [reading, setReading] = useState(false);
  const token = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null),
    preview = useRef<HTMLHeadingElement>(null);
  const next = incoming ? replaceKnowledge(state, incoming) : undefined;
  const run = (action: () => void) => {
    try {
      setError("");
      action();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Workspace recovery unavailable. Current work unchanged.",
      );
    }
  };
  useEffect(() => {
    run(() => {
      const raw = localStorage.getItem(knowledgeCheckpointKey);
      setAvailable(!!raw);
      if (raw) setSaved(parseKnowledgeCheckpoint(raw).state);
    });
    return () => {
      token.current++;
    };
  }, []);
  useEffect(() => {
    if (incoming || operation) preview.current?.focus();
  }, [incoming, operation]);
  const clear = () => {
    token.current++;
    setReading(false);
    setIncoming(undefined);
    setOperation(undefined);
  };
  const finish = (message: string) => {
    clear();
    setNotice(message);
    requestAnimationFrame(() => heading.current?.focus());
  };
  const stage = (s: KnowledgeWorkspace) =>
    useProgress(s.contribution, s.use, {
      adoptions: s.adoptions,
      checks: s.applicability ?? [],
    });
  return (
    <section aria-label="Knowledge workspace recovery">
      <p role="status" aria-label="Workspace save status">
        {saved
          ? sameKnowledgeValue(
              { ...saved, applicability: saved.applicability ?? [] },
              { ...state, applicability: state.applicability ?? [] },
            )
            ? "Whole workspace matches saved checkpoint."
            : "Saved workspace differs from current work; restore is explicit."
          : available
            ? "Saved workspace is invalid or unavailable."
            : error
              ? "Workspace checkpoint status unavailable; inspect recovery details."
              : "No whole workspace checkpoint saved."}{" "}
        Contribution-only checkpoints are separate.
      </p>
      <details>
        <summary>Save or restore whole Knowledge workspace</summary>
        <h2 ref={heading} tabIndex={-1}>
          Knowledge workspace checkpoint
        </h2>
        <p>
          Includes contribution, local responsibility offers/responses and
          versioned handoffs, K-02 brief delivery/receipt and K-01 → K-02 input
          handoffs, scope applicability and K-01 agreement decisions and exact
          bounded-use records. Local browser/file recovery only; no shared
          backend storage or automatic restore. Main software snapshots remain
          separate.
        </p>
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        <button
          className="button secondary"
          disabled={reading}
          onClick={() => {
            clear();
            setOperation("save");
          }}
        >
          Save workspace checkpoint
        </button>
        <button
          className="button secondary"
          disabled={reading}
          onClick={() => {
            clear();
            run(() => {
              const raw = localStorage.getItem(knowledgeCheckpointKey);
              if (!raw) throw Error("No saved workspace checkpoint.");
              setIncoming({
                kind: "workspace",
                checkpoint: parseKnowledgeCheckpoint(raw),
              });
            });
          }}
        >
          Review saved workspace
        </button>
        <button
          className="text-link"
          disabled={reading}
          onClick={() => {
            clear();
            setOperation("remove");
          }}
        >
          Remove saved workspace
        </button>
        <button
          className="button secondary"
          onClick={() =>
            run(() => {
              const raw = encodeKnowledgeCheckpoint(state);
              const url = URL.createObjectURL(
                new Blob([raw], { type: "application/json" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "knowledge-workspace.json";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
              setNotice(
                "Whole workspace exported; browser checkpoint unchanged.",
              );
            })
          }
        >
          Export whole workspace
        </button>
        <label>
          Import Knowledge checkpoint
          <input
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              clear();
              const current = ++token.current;
              setReading(true);
              setError("");
              try {
                if (file.size > 4_000_000)
                  throw Error("Checkpoint exceeds the 4 MB limit.");
                const raw = await file.text();
                if (current !== token.current) return;
                setIncoming(parseKnowledgeImport(raw));
              } catch (err) {
                if (current === token.current)
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Cannot read checkpoint.",
                  );
              } finally {
                if (current === token.current) setReading(false);
              }
            }}
          />
        </label>
        {reading && (
          <p role="status">Reading checkpoint; current work unchanged.</p>
        )}
        {operation && (
          <section aria-label="Confirm workspace storage">
            <h3 ref={preview} tabIndex={-1}>
              {operation === "save"
                ? "Save current whole workspace?"
                : "Remove saved whole workspace?"}
            </h3>
            <p>
              {operation === "save"
                ? "Overwrites the browser workspace checkpoint with current records. Contribution-only checkpoints are retained."
                : "Removes only the browser workspace checkpoint. Current session and contribution-only checkpoint remain intact."}
            </p>
            {operation === "save" && (
              <details>
                <summary>Inspect current workspace to save</summary>
                <pre
                  style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {JSON.stringify(state, null, 2)}
                </pre>
              </details>
            )}
            <button
              className="button primary"
              onClick={() =>
                run(() => {
                  if (operation === "save") {
                    const raw = encodeKnowledgeCheckpoint(state);
                    localStorage.setItem(knowledgeCheckpointKey, raw);
                    setSaved(parseKnowledgeCheckpoint(raw).state);
                    setAvailable(true);
                    finish("Whole workspace saved locally.");
                  } else {
                    localStorage.removeItem(knowledgeCheckpointKey);
                    setSaved(undefined);
                    setAvailable(false);
                    finish(
                      "Saved workspace removed; current session unchanged.",
                    );
                  }
                })
              }
            >
              {operation === "save"
                ? "Confirm save workspace"
                : "Confirm remove workspace"}
            </button>
            <button
              className="button secondary"
              onClick={() => finish("Storage change cancelled.")}
            >
              Cancel storage change
            </button>
          </section>
        )}
        {next && incoming && (
          <section aria-label="Workspace replacement preview">
            <h3 ref={preview} tabIndex={-1}>
              {incoming.kind === "workspace"
                ? "Whole workspace replacement"
                : "Contribution-only replacement"}
            </h3>
            <p>
              {incoming.kind === "workspace"
                ? "Replaces all Knowledge slices together. No merge or automatic save."
                : "Replaces contribution and its local responsibility history. Brief, adopted scope and use-chain history are retained; exact-source mismatch can block continuation."}
            </p>
            {(
              [
                "contribution",
                "brief",
                "adoptions",
                "use",
                "applicability",
              ] as const
            ).map((key) => (
              <p key={key}>
                {key}:{" "}
                {sameKnowledgeValue(state[key], next[key])
                  ? "unchanged"
                  : "replaced · inspect removed and incoming records below"}
              </p>
            ))}
            <p>
              Current use: {stage(state).title}. Incoming use:{" "}
              {stage(next).title}. {stage(next).detail}
            </p>
            <p>
              Responsibility:{" "}
              {knowledgeResponsibilityStatus(state.contribution)} →{" "}
              {knowledgeResponsibilityStatus(next.contribution)}. Legacy
              replacements can remove local offers and acceptance; inspect exact
              history below.
            </p>
            {next.use && (
              <p>
                Incoming decision responsibility:{" "}
                {(Object.keys(reviewRoles) as ReviewRole[])
                  .map(
                    (role) =>
                      `${reviewRoles[role]}: ${reviewPrincipals[reviewOwner(next.use!, role)]}`,
                  )
                  .join("; ")}
                . Whole replacement may remove accepted review handoffs;
                contribution-only replacement retains use-role history.
              </p>
            )}
            <p>
              Current contributor:{" "}
              {contributorNames[contributionPerformer(state.contribution)]} →{" "}
              {contributorNames[contributionPerformer(next.contribution)]}.
              Handoff history is replaced with contribution state; legacy
              imports can remove it.
            </p>
            <p>
              Cross-workstream packages:{" "}
              {state.brief.guideHandoffs?.length ?? 0} →{" "}
              {next.brief.guideHandoffs?.length ?? 0}.{" "}
              {
                guideInputStatus(
                  next.brief.guideHandoffs ?? [],
                  currentGuideSubject(next.contribution),
                ).reason
              }{" "}
              Contribution-only replacement preserves these packages and may
              leave their source stale.
            </p>
            <p>
              Incoming review input:{" "}
              {briefInputSummary(next.brief, next.contribution)}
            </p>
            <p>
              Incoming adopted scope:{" "}
              {next.adoptions.at(-1)?.versionId ?? "none"} ·{" "}
              {next.adoptions.at(-1)?.audience ?? "not recorded"}
            </p>
            <details>
              <summary>Inspect current and incoming exact records</summary>
              <h4>Current</h4>
              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {JSON.stringify(state, null, 2)}
              </pre>
              <h4>Incoming</h4>
              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {JSON.stringify(next, null, 2)}
              </pre>
            </details>
            <button
              className="button primary"
              onClick={() => {
                onChange(next);
                finish(
                  "Replacement applied to session; saved checkpoints unchanged.",
                );
              }}
            >
              Confirm workspace replacement
            </button>
            <button
              className="button secondary"
              onClick={() =>
                finish("Replacement cancelled; current workspace unchanged.")
              }
            >
              Cancel workspace replacement
            </button>
          </section>
        )}
      </details>
    </section>
  );
}

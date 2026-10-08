import { useRef, useState } from "react";
import {
  demoStorageKey,
  parseDemoSnapshot,
  type DemoSnapshot,
} from "./data/demoSnapshot";
export function DemoContinuity({
  current,
  restoredAt,
  initialError,
  onRestore,
}: {
  current: Omit<DemoSnapshot, "savedAt">;
  restoredAt?: string;
  initialError?: string;
  onRestore: (snapshot: DemoSnapshot) => void;
}) {
  const [message, setMessage] = useState(
    initialError ??
      (restoredAt
        ? `Restored local demo saved at ${restoredAt}.`
        : "No saved demo restored."),
  );
  const [preview, setPreview] = useState<DemoSnapshot>();
  const [resetting, setResetting] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const snapshot = (): DemoSnapshot => ({
    ...current,
    savedAt: new Date().toISOString(),
  });
  return (
    <section
      className="panel org-stream org-overview-section"
      aria-label="Demo continuity"
    >
      <h2>Demo continuity</h2>
      <p>
        Save this browser’s demo or export it to another machine. Changes after
        saving are not saved automatically.
      </p>
      <details className="directory-record-details">
        <summary>What is saved and restored?</summary>
        <p>
          Main-sample text drafts, structured assessment/reconciliation drafts,
          local response receipts, recorded responsibility proposals, local allocations and performer/transfer history are
          included.
        </p>
        <p>
          Simulation controls, unrecorded proposal forms and navigation are
          excluded. This is local demo data; no shared server state,
          permissions, live SF evidence or execution is restored.
        </p>
      </details>
      <p>
        <button
          className="button secondary"
          onClick={() => {
            try {
              const value = snapshot();
              const raw = JSON.stringify(value);
              parseDemoSnapshot(raw);
              localStorage.setItem(demoStorageKey, raw);
              setMessage(
                `Saved local snapshot at ${value.savedAt}. Reload restores this saved snapshot.`,
              );
            } catch {
              setMessage(
                "Could not save locally. Current work is unchanged; use export to keep a file.",
              );
            }
          }}
        >
          Save local snapshot
        </button>{" "}
        <button
          className="button secondary"
          onClick={() => {
            const raw = JSON.stringify(snapshot(), null, 2);
            try {
              parseDemoSnapshot(raw);
              const url = URL.createObjectURL(
                new Blob([raw], { type: "application/json" }),
              );
              const link = document.createElement("a");
              link.href = url;
              link.download = "forge-ui-demo-v1.json";
              link.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
              setMessage(
                "Exported current demo state. Keep the file to move between machines.",
              );
            } catch {
              setMessage(
                "Could not export this snapshot. Current work is unchanged.",
              );
            }
          }}
        >
          Export demo snapshot
        </button>
      </p>
      <label htmlFor="demo-import">Import demo snapshot</label>
      <input
        id="demo-import"
        ref={file}
        type="file"
        accept="application/json,.json"
        onChange={async (e) => {
          const selected = e.target.files?.[0];
          setPreview(undefined);
          if (!selected) return;
          try {
            if (selected.size > 1000000)
              throw new Error("Snapshot exceeds the 1 MB demo limit.");
            const value = parseDemoSnapshot(await selected.text());
            setPreview(value);
            setMessage(
              "Valid snapshot ready for review. Current work has not changed.",
            );
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Import failed. Current work is unchanged.",
            );
          } finally {
            if (file.current) file.current.value = "";
          }
        }}
      />
      {preview && (
        <section aria-label="Import snapshot preview">
          <h3>Review replacement snapshot</h3>
          <p>
            Saved at {preview.savedAt} ·{" "}
            {Object.keys(preview.drafts.text).length} assignments with text
            drafts · {preview.receipts.length} local responses ·{" "}
            {Object.keys(preview.proposals).length} recorded proposals.
            Structured drafts are included.
          </p>
          <p>
            Applying replaces current main-sample demo work and saves the
            imported snapshot locally. Export current work first if you need to
            retain it.
          </p>
          <button
            className="button secondary"
            onClick={() => {
              try {
                localStorage.setItem(demoStorageKey, JSON.stringify(preview));
              } catch {
                setMessage(
                  "Import was not applied: browser storage is unavailable. Current work is unchanged.",
                );
                return;
              }
              onRestore(preview);
              setPreview(undefined);
              setMessage(
                "Imported snapshot applied and saved locally. No external action occurred.",
              );
            }}
          >
            Apply imported snapshot
          </button>{" "}
          <button
            className="button secondary"
            onClick={() => {
              setPreview(undefined);
              setMessage("Import cancelled. Current work is unchanged.");
            }}
          >
            Cancel import
          </button>
        </section>
      )}
      <p>
        <button className="button secondary" onClick={() => setResetting(true)}>
          Reset local demo
        </button>
      </p>
      {resetting && (
        <div>
          <p>
            Clear current drafts, responses, recorded proposals and this
            browser's saved snapshot? Export first to retain them.
          </p>
          <button
            className="button secondary"
            onClick={() => {
              try {
                localStorage.removeItem(demoStorageKey);
              } catch {
                setMessage(
                  "Reset failed: saved browser state could not be removed. Current work is unchanged.",
                );
                return;
              }
              onRestore({
                ...current,
                savedAt: new Date().toISOString(),
                drafts: {
                  text: {},
                  assessmentConclusion: "",
                  assessmentEvidence: [],
                  criterionReviews: {},
                  reconciliationConclusion: "",
                },
                receipts: [],
                proposals: {},
              });
              setPreview(undefined);
              setResetting(false);
              setMessage(
                "Current and saved local demo cleared. Authored samples remain available.",
              );
            }}
          >
            Clear current and saved demo
          </button>{" "}
          <button
            className="button secondary"
            onClick={() => setResetting(false)}
          >
            Keep local demo
          </button>
        </div>
      )}
      <p role="status">{message}</p>
    </section>
  );
}

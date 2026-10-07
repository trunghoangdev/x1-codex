import { useEffect, useRef, useState } from "react";
import {
  emptyContribution,
  type HumanContributionState,
} from "./data/humanContribution";
import {
  contributionCheckpointKey as key,
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
  type ContributionCheckpoint,
} from "./data/contributionCheckpoint";
type SavedStatus = {
  checkpoint?: ContributionCheckpoint;
  unavailable?: boolean;
};
function readCheckpointStatus(): SavedStatus {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { checkpoint: parseContributionCheckpoint(raw) } : {};
  } catch {
    return { unavailable: true };
  }
}
function stateIdentity(state: HumanContributionState) {
  return JSON.stringify(
    { ...state, commands: state.commands ?? [] },
    (_key, value) =>
      value && typeof value === "object" && !Array.isArray(value)
        ? Object.fromEntries(
            Object.keys(value)
              .sort()
              .map((k) => [k, value[k]]),
          )
        : value,
  );
}
export function ContributionRecovery({
  state,
  onChange,
}: {
  state: HumanContributionState;
  onChange: (state: HumanContributionState) => void;
}) {
  const [saved, setSaved] = useState<SavedStatus>(readCheckpointStatus);
  useEffect(() => {
    const refresh = () => setSaved(readCheckpointStatus());
    const storage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) refresh();
    };
    window.addEventListener("storage", storage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  const matches =
    saved.checkpoint &&
    stateIdentity(saved.checkpoint.state) === stateIdentity(state);
  const empty = stateIdentity(state) === stateIdentity(emptyContribution());
  const saveStatus = saved.unavailable
    ? "Save status unavailable · checkpoint storage is blocked or invalid."
    : !saved.checkpoint
      ? "Not saved · no contribution checkpoint in this browser."
      : matches
        ? `Current work matches checkpoint · saved at ${saved.checkpoint.savedAt}`
        : empty
          ? `Saved checkpoint available · not restored. Saved at ${saved.checkpoint.savedAt}`
          : `Unsaved changes · current work differs from checkpoint saved at ${saved.checkpoint.savedAt}`;
  const fileRead = useRef(0);
  useEffect(
    () => () => {
      fileRead.current++;
    },
    [],
  );
  const [reading, setReading] = useState(false);
  const [imported, setImported] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<ContributionCheckpoint>();
  const [confirm, setConfirm] = useState<"save" | "remove">();
  const run = (fn: () => void) => {
    try {
      fn();
    } catch {
      setSaved(readCheckpointStatus());
      setNotice(
        "Checkpoint unavailable or invalid. Current work is unchanged; browser storage may be blocked or full.",
      );
      setPreview(undefined);
      setConfirm(undefined);
    }
  };
  return (
    <>
      <p role="status" aria-label="Contribution save status">
        {saveStatus}
      </p>
      <details className="organization-disclosure org-overview-section">
        <summary>Save or restore Knowledge contribution</summary>
        <section
          className="panel org-stream"
          aria-label="Knowledge contribution recovery"
        >
          <h2 ref={heading} tabIndex={-1}>
            Contribution checkpoint
          </h2>
          <p>
            Save this Knowledge exercise in this browser. Reload starts empty;
            restore the last saved checkpoint explicitly. Unsaved edits are not
            recovered. This is local demo storage, not shared organization
            persistence; Demos continuity remains separate.
          </p>
          <button
            className="button secondary"
            disabled={reading}
            onClick={() => {
              setPreview(undefined);
              setConfirm("save");
              setNotice(
                "Saving replaces this browser’s previous Knowledge contribution checkpoint.",
              );
            }}
          >
            Save contribution checkpoint
          </button>{" "}
          <button
            className="button secondary"
            disabled={reading}
            onClick={() =>
              run(() => {
                setConfirm(undefined);
                const raw = localStorage.getItem(key);
                if (!raw) {
                  setSaved({});
                  setPreview(undefined);
                  setNotice(
                    "No saved contribution checkpoint in this browser.",
                  );
                  return;
                }
                const parsed = parseContributionCheckpoint(raw);
                setSaved({ checkpoint: parsed });
                setImported(false);
                setPreview(parsed);
                setNotice(
                  "Review the checkpoint before replacing current work.",
                );
              })
            }
          >
            Review saved contribution
          </button>{" "}
          <button
            className="text-link"
            disabled={reading}
            onClick={() => {
              setPreview(undefined);
              setConfirm("remove");
              setNotice(
                "Remove the saved checkpoint only; current session work will remain.",
              );
            }}
          >
            Remove saved checkpoint
          </button>
          <details>
            <summary>Move contribution between machines</summary>
            <p>
              Export the current exercise, including contribution text and local
              command/receiver records. On another machine, import the file and
              review before replacing current work. Export does not save a
              browser checkpoint; import does not write one. Save explicitly
              afterward if needed.
            </p>
            <button
              className="button secondary"
              disabled={reading}
              onClick={() =>
                run(() => {
                  const raw = encodeContributionCheckpoint(state);
                  const url = URL.createObjectURL(
                    new Blob([raw], { type: "application/json" }),
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "forge-knowledge-contribution.json";
                  document.body.appendChild(link);
                  try {
                    link.click();
                  } finally {
                    link.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  }
                  setNotice(
                    "Export download requested for current contribution. Browser checkpoint is unchanged.",
                  );
                })
              }
            >
              Export current contribution
            </button>
            <label>
              Import contribution file
              <input
                type="file"
                accept=".json,application/json"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  const request = ++fileRead.current;
                  setReading(true);
                  setPreview(undefined);
                  setConfirm(undefined);
                  setNotice(
                    "Reading contribution file; current work is unchanged.",
                  );
                  try {
                    if (file.size > 2_000_000)
                      throw new Error("File too large");
                    const parsed = parseContributionCheckpoint(
                      await file.text(),
                    );
                    if (request !== fileRead.current) return;
                    setImported(true);
                    setPreview(parsed);
                    setNotice(
                      "Import validated. Review before replacing current contribution; browser checkpoint is unchanged.",
                    );
                  } catch {
                    if (request !== fileRead.current) return;
                    setNotice(
                      "Contribution import rejected: invalid, unsupported, unreadable or oversized file. Current work and saved checkpoint are unchanged.",
                    );
                  } finally {
                    if (request === fileRead.current) setReading(false);
                  }
                }}
              />
            </label>
          </details>
          <p role="status">{notice}</p>
          {confirm && (
            <div>
              <button
                className="button secondary"
                onClick={() =>
                  run(() => {
                    if (confirm === "save") {
                      const raw = encodeContributionCheckpoint(state);
                      localStorage.setItem(key, raw);
                      setSaved({
                        checkpoint: parseContributionCheckpoint(raw),
                      });
                      setNotice(
                        `Checkpoint saved · ${parseContributionCheckpoint(raw).savedAt}. Later edits require another save.`,
                      );
                    } else {
                      localStorage.removeItem(key);
                      setSaved({});
                      setNotice(
                        "Saved checkpoint removed. Current work remains.",
                      );
                    }
                    setConfirm(undefined);
                    heading.current?.focus();
                  })
                }
              >
                {confirm === "save"
                  ? "Confirm save checkpoint"
                  : "Confirm remove checkpoint"}
              </button>{" "}
              <button
                className="button secondary"
                onClick={() => {
                  setConfirm(undefined);
                  setNotice("Cancelled. Current work is unchanged.");
                  heading.current?.focus();
                }}
              >
                Cancel checkpoint action
              </button>
            </div>
          )}
          {preview && (
            <div>
              <h3>{imported ? "Import preview" : "Restore preview"}</h3>
              <p>
                {imported ? "File captured" : "Saved"}: {preview.savedAt} ·{" "}
                {preview.state.contributions.length} versions ·{" "}
                {preview.state.commands?.length ?? 0} commands.
              </p>
              <p>
                Latest command:{" "}
                {preview.state.commands?.at(-1)?.status ?? "none"}.
                Unknown/pending acknowledgements and projection locks remain
                unchanged. This replaces current Knowledge work, including
                unsaved changes.
              </p>
              <button
                className="button secondary"
                onClick={() => {
                  onChange(preview.state);
                  setPreview(undefined);
                  setNotice(
                    imported
                      ? "Contribution imported into current session. Browser checkpoint is unchanged; save explicitly to keep it after reload."
                      : "Checkpoint restored. This is local demo state; no server status was queried.",
                  );
                  heading.current?.focus();
                }}
              >
                {imported
                  ? "Confirm import contribution"
                  : "Confirm restore contribution"}
              </button>{" "}
              <button
                className="button secondary"
                onClick={() => {
                  setPreview(undefined);
                  setNotice(
                    imported
                      ? "Import cancelled. Current work and browser checkpoint are unchanged."
                      : "Restore cancelled. Current work is unchanged.",
                  );
                  heading.current?.focus();
                }}
              >
                {imported ? "Cancel import" : "Cancel restore"}
              </button>
            </div>
          )}
        </section>
      </details>
    </>
  );
}

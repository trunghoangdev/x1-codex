import { useRef, useState } from "react";
import type { HumanContributionState } from "./data/humanContribution";
import {
  contributionCheckpointKey as key,
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
  type ContributionCheckpoint,
} from "./data/contributionCheckpoint";
export function ContributionRecovery({
  state,
  onChange,
}: {
  state: HumanContributionState;
  onChange: (state: HumanContributionState) => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<ContributionCheckpoint>();
  const [confirm, setConfirm] = useState<"save" | "remove">();
  const run = (fn: () => void) => {
    try {
      fn();
    } catch {
      setNotice(
        "Checkpoint unavailable or invalid. Current work is unchanged; browser storage may be blocked or full.",
      );
      setPreview(undefined);
      setConfirm(undefined);
    }
  };
  return (
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
        onClick={() =>
          run(() => {
            setConfirm(undefined);
            const raw = localStorage.getItem(key);
            if (!raw) {
              setPreview(undefined);
              setNotice("No saved contribution checkpoint in this browser.");
              return;
            }
            setPreview(parseContributionCheckpoint(raw));
            setNotice("Review the checkpoint before replacing current work.");
          })
        }
      >
        Review saved contribution
      </button>{" "}
      <button
        className="text-link"
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
                  setNotice(
                    `Checkpoint saved · ${parseContributionCheckpoint(raw).savedAt}. Later edits require another save.`,
                  );
                } else {
                  localStorage.removeItem(key);
                  setNotice("Saved checkpoint removed. Current work remains.");
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
          <h3>Restore preview</h3>
          <p>
            Saved: {preview.savedAt} · {preview.state.contributions.length}{" "}
            versions · {preview.state.commands?.length ?? 0} commands.
          </p>
          <p>
            Latest command: {preview.state.commands?.at(-1)?.status ?? "none"}.
            Unknown/pending acknowledgements and projection locks remain
            unchanged. This replaces current Knowledge work, including unsaved
            changes.
          </p>
          <button
            className="button secondary"
            onClick={() => {
              onChange(preview.state);
              setPreview(undefined);
              setNotice(
                "Checkpoint restored. This is local demo state; no server status was queried.",
              );
              heading.current?.focus();
            }}
          >
            Confirm restore contribution
          </button>{" "}
          <button
            className="button secondary"
            onClick={() => {
              setPreview(undefined);
              setNotice("Restore cancelled. Current work is unchanged.");
              heading.current?.focus();
            }}
          >
            Cancel restore
          </button>
        </div>
      )}
    </section>
  );
}

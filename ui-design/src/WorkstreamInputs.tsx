import { useRef, useState } from "react";
import type { BriefHandoffState } from "./data/briefHandoff";
import type { HumanContributionState } from "./data/humanContribution";
import {
  assessGuideInput,
  currentGuideSubject,
  guideInputStatus,
  offerGuideInput,
  respondGuideInput,
  type GuideHandoff,
  type GuideInputConclusion,
  type GuideInputResponse,
} from "./data/workstreamInputs";
export function WorkstreamInputs({
  state,
  contribution,
  persona,
  onChange,
}: {
  state: BriefHandoffState;
  contribution: HumanContributionState;
  persona?: string;
  onChange: (s: BriefHandoffState) => void;
}) {
  const history = state.guideHandoffs ?? [],
    last = history.at(-1),
    source = currentGuideSubject(contribution),
    view = guideInputStatus(history, source);
  const [action, setAction] = useState("Offer"),
    [rationale, setRationale] = useState(""),
    [purpose, setPurpose] = useState("");
  const [preview, setPreview] = useState<{
    identity: string;
    next: GuideHandoff[];
  }>();
  const result = useRef<HTMLHeadingElement>(null);
  const options =
    persona === "maya"
      ? !last || last.response
        ? ["Offer"]
        : ["Cancelled"]
      : persona === "leo" && last
        ? !last.response
          ? ["Received", "Clarification requested", "Declined"]
          : last.response.decision === "Received" && last.subject === source
            ? ["Applicable", "Needs adaptation", "Not applicable"]
            : []
        : [];
  const selected = options.includes(action) ? action : options[0];
  const identity = JSON.stringify({
    state,
    source,
    persona,
    selected,
    rationale,
    purpose,
  });
  const mutate = (at: string) =>
    selected === "Offer"
      ? offerGuideInput(
          history,
          source,
          rationale,
          purpose,
          at,
          state.versions.length,
        )
      : ["Applicable", "Needs adaptation", "Not applicable"].includes(selected)
        ? assessGuideInput(
            history,
            last!.id,
            source,
            selected as GuideInputConclusion,
            rationale,
            at,
          )
        : respondGuideInput(
            history,
            last!.id,
            selected as GuideInputResponse,
            rationale,
            at,
          );
  return (
    <section
      className="panel org-stream material-use-start"
      aria-label="Cross-workstream guide input"
    >
      <h2>K-01 → K-02 · guide input handoff</h2>
      <p>
        Local exercise · Maya / K-01 editorial result → Leo / K-02-C workshop
        preparation. Receipt and applicability are separate. No publication
        authority, workshop approval or facilitation responsibility transfers.
      </p>
      <h3 ref={result} tabIndex={-1}>
        Workshop preparation input
      </h3>
      <p role="status">{view.reason}</p>
      <p>
        Next responsible person: {view.actor}. Once this exercise starts, new
        briefs require the current suitable guide, receipt and Applicable
        decision. Earlier briefs keep their exact input. Maximum 20 packages and
        10 applicability decisions per package.
      </p>
      <p>
        <a href="#/organizations/knowledge/work?persona=maya">
          Open Maya’s handoff work
        </a>{" "}
        ·{" "}
        <a href="#/organizations/knowledge/workstreams/K-02?persona=leo">
          Open Leo’s workshop work
        </a>{" "}
        ·{" "}
        <a href="#/organizations/knowledge/contributions/K-01-H?persona=leo">
          Inspect source contribution
        </a>
      </p>
      {options.length > 0 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next = mutate(new Date().toISOString());
            if (next !== history) setPreview({ identity, next });
          }}
        >
          <label>
            Input handoff action
            <select
              aria-label="Input handoff action"
              value={selected}
              onChange={(e) => setAction(e.target.value)}
            >
              {options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          {selected === "Offer" && (
            <label>
              Purpose and scope for K-02
              <textarea
                aria-label="Purpose and scope for K-02"
                required
                maxLength={3000}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </label>
          )}
          <label>
            Cross-workstream decision rationale
            <textarea
              aria-label="Cross-workstream decision rationale"
              required
              maxLength={3000}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </label>
          <button
            className="button secondary"
            disabled={
              !rationale.trim() ||
              (selected === "Offer" &&
                (!source || !purpose.trim() || history.length >= 20)) ||
              (["Applicable", "Needs adaptation", "Not applicable"].includes(
                selected,
              ) &&
                (last?.applicability?.length ?? 0) >= 10)
            }
          >
            Review input handoff decision
          </button>
        </form>
      )}
      {preview?.identity === identity && (
        <section aria-label="Confirm cross-workstream input">
          <h3>Confirm {selected} · K-01 → K-02</h3>
          <p>{selected === "Offer" ? purpose : last?.purpose}</p>
          <p>{rationale}</p>
          <details>
            <summary>
              Inspect exact guide delivery, receipt and assessment
            </summary>
            <pre>
              {JSON.stringify(
                JSON.parse(selected === "Offer" ? source! : last!.subject),
                null,
                2,
              )}
            </pre>
          </details>
          <button
            className="button primary"
            onClick={() => {
              onChange({ ...state, guideHandoffs: preview.next });
              setPreview(undefined);
              setRationale("");
              setPurpose("");
              requestAnimationFrame(() => result.current?.focus());
            }}
          >
            Record input handoff decision locally
          </button>
          <button
            className="button secondary"
            onClick={() => {
              setPreview(undefined);
              result.current?.focus();
            }}
          >
            Cancel input handoff decision
          </button>
        </section>
      )}
      {history.length > 0 && (
        <details>
          <summary>
            Retained cross-workstream input history · {history.length} packages
          </summary>
          {history.map((h) => (
            <article className="org-stream-assignment" key={h.id}>
              <h3>{h.id}</h3>
              <p>Maya → Leo · {h.at} · K-01 → K-02</p>
              <p>{h.purpose}</p>
              <p>{h.rationale}</p>
              <details>
                <summary>Frozen assessed guide source</summary>
                <pre>{JSON.stringify(JSON.parse(h.subject), null, 2)}</pre>
              </details>
              <p>
                {h.response
                  ? `${h.response.actor} · ${h.response.decision} · ${h.response.id} · ${h.response.at} · ${h.response.rationale}`
                  : "Receipt pending"}
              </p>
              {h.applicability?.map((a) => (
                <p key={a.id}>
                  {a.actor} · {a.conclusion} · {a.id} · source {a.sourceId} ·{" "}
                  {a.at} · {a.rationale}
                </p>
              ))}
            </article>
          ))}
        </details>
      )}
    </section>
  );
}

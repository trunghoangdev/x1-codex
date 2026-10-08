import { useRef, useState } from "react";
import {
  briefInputSummary,
  deliverBrief,
  receiveBrief,
  receivedBrief,
  type BriefHandoffState,
} from "./data/briefHandoff";
export function BriefHandoff({
  state,
  onChange,
  persona,
}: {
  state: BriefHandoffState;
  onChange: (s: BriefHandoffState) => void;
  persona?: string;
}) {
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<number>();
  const result = useRef<HTMLHeadingElement>(null);
  const received = receivedBrief(state);
  const pending = state.versions.find(
    (v) =>
      v.version === selected &&
      !v.receipt &&
      (!received || v.version > received.version),
  );
  const finish = (next: BriefHandoffState) => {
    onChange(next);
    setSelected(undefined);
    requestAnimationFrame(() => result.current?.focus());
  };
  return (
    <section className="panel org-stream" aria-label="Workshop brief handoff">
      <h2>Workshop brief · exact version handoff</h2>
      <p>
        Local session demo · workshop-brief-input · Leo / K-02-C → Maya /
        K-02-E. Reload clears this exchange; contribution checkpoints do not
        include it. Persona selection is a demonstration, not authentication.
      </p>
      <h3 ref={result} tabIndex={-1}>
        Receiving review input
      </h3>
      <p role="status">{briefInputSummary(state)}</p>
      <p>
        Receipt records input availability only. It does not complete the
        review, approve the workshop or resolve the facilitator gap. Earlier
        reviews retain their original input version; review migration and
        applicability assessment are not implemented.
      </p>
      {persona === "leo" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const next = deliverBrief(state, body, new Date().toISOString());
            if (next !== state) {
              finish(next);
              setBody("");
            }
          }}
        >
          <label>
            Brief content · audience, schedule options and outstanding inputs
            <textarea
              required
              maxLength={6000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <button className="button primary" disabled={!body.trim()}>
            Deliver brief-v{state.versions.length + 1} locally
          </button>
        </form>
      )}
      {persona !== "leo" && (
        <p>Open this workstream as Leo to deliver a new version.</p>
      )}
      {state.versions.map((v) => (
        <article
          className="org-stream-assignment"
          key={v.version}
          aria-label={`brief-v${v.version}`}
        >
          <h3>brief-v{v.version}</h3>
          <p>
            Delivery · workshop-brief-delivery-v{v.version} · {v.deliveredAt}
          </p>
          <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {v.body}
          </p>
          <p>
            {v.receipt
              ? `Maya receipt · ${v.receipt.id} · ${v.receipt.at}`
              : "No receiver receipt"}
          </p>
          {persona === "maya" &&
            !v.receipt &&
            (!received || v.version > received.version) && (
              <button
                className="button secondary"
                onClick={() => setSelected(v.version)}
              >
                Inspect receipt for brief-v{v.version}
              </button>
            )}
        </article>
      ))}
      {pending && persona === "maya" && (
        <section aria-label="Confirm exact brief receipt">
          <h3>Confirm receipt · brief-v{pending.version}</h3>
          <p>
            Receive this exact delivery as input for K-02-E. Prior delivery and
            receipt records remain unchanged.
          </p>
          <p style={{ whiteSpace: "pre-wrap" }}>{pending.body}</p>
          <button
            className="button primary"
            onClick={() =>
              finish(
                receiveBrief(state, pending.version, new Date().toISOString()),
              )
            }
          >
            Record receipt for brief-v{pending.version}
          </button>
          <button
            className="button secondary"
            onClick={() => {
              setSelected(undefined);
              result.current?.focus();
            }}
          >
            Cancel receipt
          </button>
        </section>
      )}
    </section>
  );
}

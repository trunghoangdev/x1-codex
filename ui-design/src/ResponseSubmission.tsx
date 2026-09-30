import { DemoControls } from "./DemoControls";
import type { useResponseSubmission } from "./useResponseSubmission";
export function ResponseSubmission({
  submission,
}: {
  submission: ReturnType<typeof useResponseSubmission>;
}) {
  const { state, scenario, setScenario, resolveNotReceived } = submission;
  return (
    <section aria-label="Response delivery preview">
      <DemoControls context="Response delivery">
        <label className="record-filter">
          Delivery scenario
          <select
            aria-label="Delivery scenario"
            value={scenario}
            disabled={state === "sending" || state === "unknown"}
            onChange={(e) => setScenario(e.target.value)}
          >
            <option value="success">Receipt confirmed · sample</option>
            <option value="rejected">Response rejected</option>
            <option value="offline">Offline before sending</option>
            <option value="unknown">Acknowledgement lost</option>
          </select>
        </label>
        <p className="demo-note">
          Simulated delivery only. No network request, server admission or
          durable deduplication.
        </p>
      </DemoControls>
      <p role="status">
        {state === "sending"
          ? "Sending sample response… Editing and repeat submission are locked."
          : state === "unknown"
            ? "Receipt status unknown. Do not resend until status is resolved. Your draft is retained."
            : state === "rejected"
              ? "Sample response rejected. No receipt created; review your draft before retrying."
              : state === "offline"
                ? "Offline before sending · simulation. No response was sent. Your draft is retained."
                : ""}
      </p>
      {state === "unknown" && (
        <button className="button secondary" onClick={resolveNotReceived}>
          Simulate status check: not received
        </button>
      )}
      {state === "unknown" && (
        <p className="demo-note">
          This explicit sample resolution unlocks editing and retry. It does not
          query SF or prove a real delivery outcome.
        </p>
      )}
    </section>
  );
}

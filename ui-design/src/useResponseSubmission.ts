import { useEffect, useRef, useState } from "react";
export type SubmissionState =
  "idle" | "sending" | "rejected" | "offline" | "unknown";
export function useResponseSubmission(key: string, commit: () => void) {
  const [states, setStates] = useState<Record<string, SubmissionState>>({});
  const [scenario, setScenario] = useState("success");
  const pending = useRef<{ key: string; timer: number } | null>(null);
  const state = states[key] ?? "idle";
  useEffect(
    () => () => {
      if (pending.current?.key === key) {
        clearTimeout(pending.current.timer);
        pending.current = null;
        setStates((old) => ({ ...old, [key]: "unknown" }));
      }
    },
    [key],
  );
  function send() {
    if (!key || pending.current || state === "unknown" || state === "sending")
      return;
    setStates((old) => ({ ...old, [key]: "sending" }));
    pending.current = {
      key,
      timer: window.setTimeout(() => {
        pending.current = null;
        const result =
          scenario === "success" ? "idle" : (scenario as SubmissionState);
        setStates((old) => ({ ...old, [key]: result }));
        if (scenario === "success") commit();
      }, 700),
    };
  }
  return {
    state,
    scenario,
    setScenario,
    send,
    resolveNotReceived: () => setStates((old) => ({ ...old, [key]: "idle" })),
  };
}

// Alternative synthetic previews, not chronological production observations.
import type { Scenario, Observation } from "./models";
export const observations: Record<Scenario, Observation> = {
  passed: {
    executed: true,
    exit_code: 0,
    termination: "exit status 0",
    diagnostics:
      "Sample: the declared retry-delay check passed. This does not assess the entire assignment objective.",
  },
  refused: {
    executed: true,
    exit_code: 1,
    termination: "exit status 1",
    diagnostics:
      "Sample: the retry interval exceeded the declared upper bound.",
  },
  unavailable: {
    executed: false,
    diagnostics:
      "Sample: the validator could not be launched. No candidate verdict was observed.",
  },
};

import { parseContributionCheckpoint } from "../data/contributionCheckpoint";
import type { HumanContributionState } from "../data/humanContribution";

// Frontend-only seam. No approved backend schema, endpoint or permission model.
export const contributionScope = {
  organization: "knowledge",
  assignment: "K-01-H",
} as const;
export type ContributionScope = { organization: string; assignment: string };
export type ReadResult =
  | {
      state: "available";
      source: "local-demo-checkpoint";
      capturedAt: string;
      value: HumanContributionState;
    }
  | {
      state:
        "unsupported" | "invalid" | "unavailable" | "aborted" | "superseded";
      reason: string;
    };
export type UnsupportedOperation = { state: "unsupported"; reason: string };
export type ContributionOperation =
  "submit" | "query-command" | "record-receipt" | "record-assessment";
export interface ContributionPort {
  read(scope: ContributionScope, signal?: AbortSignal): Promise<ReadResult>;
  // Deliberately no invented command payload or successful response schema.
  operation(name: ContributionOperation): Promise<UnsupportedOperation>;
}
export type DemoCheckpointSource = (signal?: AbortSignal) => Promise<string>;
export function createDemoContributionPort(
  load: DemoCheckpointSource,
): ContributionPort {
  return {
    async read(scope, signal) {
      if (
        scope.organization !== contributionScope.organization ||
        scope.assignment !== contributionScope.assignment
      )
        return {
          state: "unsupported",
          reason:
            "This adapter only represents the fictional Knowledge K-01-H exercise.",
        };
      if (signal?.aborted)
        return {
          state: "aborted",
          reason: "Read cancelled; keep current work.",
        };
      let raw: string;
      try {
        raw = await load(signal);
      } catch {
        return signal?.aborted
          ? { state: "aborted", reason: "Read cancelled; keep current work." }
          : {
              state: "unavailable",
              reason:
                "Source unavailable; keep current work and retry reading, not submitting.",
            };
      }
      if (signal?.aborted)
        return {
          state: "aborted",
          reason: "Read cancelled; keep current work.",
        };
      try {
        const parsed = parseContributionCheckpoint(raw);
        return {
          state: "available",
          source: "local-demo-checkpoint",
          capturedAt: parsed.savedAt,
          value: parsed.state,
        };
      } catch {
        return {
          state: "invalid",
          reason:
            "Unsupported or invalid checkpoint; keep current work. No projection was accepted.",
        };
      }
    },
    async operation(name) {
      return {
        state: "unsupported",
        reason: `${name} has no approved application backend contract. No command was sent; use the explicit local simulator separately.`,
      };
    },
  };
}

// A late response must not replace a newer scope/read. Error results never carry
// an empty state that a caller could mistake for permission to erase local work.
export function latestContributionReader(port: ContributionPort) {
  let generation = 0;
  return {
    invalidate() {
      generation++;
    },
    async read(
      scope: ContributionScope,
      signal?: AbortSignal,
    ): Promise<ReadResult> {
      const request = ++generation;
      const result = await port.read(scope, signal);
      return request === generation
        ? result
        : {
            state: "superseded",
            reason:
              "A newer read or navigation replaced this request; ignore this response.",
          };
    },
  };
}

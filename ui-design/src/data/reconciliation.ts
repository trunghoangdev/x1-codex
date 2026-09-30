// Independent synthetic staging subject, not the A-1041 production release.
export const reconciliationSnapshot = {
  target: "Staging · Payments API",
  expected:
    "The staging service should run the requested artifact and pass its health check.",
  expectedDigest: "d".repeat(64),
  observed:
    "Observation 238 records request acceptance only. Running artifact and health are not connected.",
  missing:
    "A target-specific running-artifact reference, health observation and observation time are missing.",
};

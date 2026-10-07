import { test, expect } from "@playwright/test";
import {
  createDemoContributionPort,
  latestContributionReader,
  contributionScope,
} from "../src/integration/contributionPort";
import { emptyContribution } from "../src/data/humanContribution";
import { encodeContributionCheckpoint } from "../src/data/contributionCheckpoint";
import { submitContributionCommand } from "../src/data/contributionCommand";

test("adapter validates local source and preserves unknown commands without granting backend operations", async () => {
  const initial = emptyContribution();
  initial.contributions[0] = {
    ...initial.contributions[0],
    body: "Guide",
    note: "Scope",
    citesInput: true,
  };
  const unknown = submitContributionCommand(
    initial,
    "unknown",
    "2026-10-07T12:00:00Z",
  );
  let reads = 0;
  const port = createDemoContributionPort(async () => {
    reads++;
    return encodeContributionCheckpoint(unknown);
  });
  const result = await port.read(contributionScope);
  expect(result.state).toBe("available");
  if (result.state !== "available")
    throw new Error("Expected validated fixture");
  expect(result.source).toBe("local-demo-checkpoint");
  expect(result.value).toEqual(unknown);
  for (const operation of [
    "submit",
    "query-command",
    "record-receipt",
    "record-assessment",
  ] as const)
    expect((await port.operation(operation)).state).toBe("unsupported");
  expect(reads).toBe(1);
  expect(
    (await port.read({ ...contributionScope, organization: "another" })).state,
  ).toBe("unsupported");
  expect(reads).toBe(1);
});

test("invalid, unavailable and cancelled reads never masquerade as empty records", async () => {
  for (const raw of [
    "{}",
    "{",
    encodeContributionCheckpoint(emptyContribution()).replace(
      "forge.knowledge-contribution.v1",
      "future.v9",
    ),
  ]) {
    const result = await createDemoContributionPort(async () => raw).read(
      contributionScope,
    );
    expect(result.state).toBe("invalid");
    expect(result).not.toHaveProperty("value");
  }
  const result = await createDemoContributionPort(async () => {
    throw new Error("offline");
  }).read(contributionScope);
  expect(result.state).toBe("unavailable");
  expect(result).not.toHaveProperty("value");
  const abort = new AbortController();
  const port = createDemoContributionPort(async () => {
    abort.abort();
    return encodeContributionCheckpoint(emptyContribution());
  });
  expect((await port.read(contributionScope, abort.signal)).state).toBe(
    "aborted",
  );
});

test("late read and navigation invalidation cannot replace a newer projection", async () => {
  let release!: (raw: string) => void;
  let count = 0;
  const reader = latestContributionReader(
    createDemoContributionPort(() =>
      ++count === 1
        ? new Promise((resolve) => {
            release = resolve;
          })
        : Promise.resolve(encodeContributionCheckpoint(emptyContribution())),
    ),
  );
  const old = reader.read(contributionScope);
  expect((await reader.read(contributionScope)).state).toBe("available");
  release(encodeContributionCheckpoint(emptyContribution()));
  expect((await old).state).toBe("superseded");
  const pending = reader.read(contributionScope);
  reader.invalidate();
  expect((await pending).state).toBe("superseded");
});

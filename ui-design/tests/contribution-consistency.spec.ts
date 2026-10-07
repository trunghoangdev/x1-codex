import { test, expect } from "@playwright/test";
import { contributionView } from "../src/data/contributionView";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
} from "../src/data/humanContribution";
import {
  submitContributionCommand,
  resolveContributionCommand,
  projectContributionCommand,
} from "../src/data/contributionCommand";
import {
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
} from "../src/data/contributionCheckpoint";
import { actionableAttention } from "../src/data/actionableAttention";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
const at = "2026-10-07T12:00:00Z";
test("shared stage and attention survive checkpoint/file round trips throughout the lifecycle", () => {
  const ready = {
    contributions: [
      {
        ...emptyContribution().contributions[0],
        body: "first",
        note: "scope",
        citesInput: true,
      },
    ],
  };
  const unknown = submitContributionCommand(ready, "unknown", at);
  const admitted = resolveContributionCommand(unknown, "admitted", at);
  const delivered = projectContributionCommand(admitted);
  const received = receiveContribution(delivered, at);
  const assessed = assessContribution(received, at);
  const revision = reviseContribution(assessed);
  const second = submitContributionCommand(
    {
      ...revision,
      contributions: revision.contributions.map((c) =>
        c.version === 2
          ? { ...c, body: "second", note: "revision", citesInput: true }
          : c,
      ),
    },
    "projected",
    at,
  );
  const cases = [
    [emptyContribution(), "Preparing contribution", undefined],
    [
      submitContributionCommand(ready, "pending", at),
      "Admission pending",
      "command",
    ],
    [unknown, "Acknowledgement unknown", "command"],
    [admitted, "Awaiting delivery projection", "command"],
    [
      submitContributionCommand(ready, "conflict", at),
      "Submission rejected",
      "correction",
    ],
    [delivered, "Awaiting receiver receipt", "receipt"],
    [received, "Receipt recorded · assessment pending", undefined],
    [assessed, "Revision requested", "revision"],
    [revision, "Preparing revision", undefined],
    [second, "Awaiting receiver receipt", "receipt"],
    [
      receiveContribution(second, at),
      "Receipt recorded · assessment pending",
      undefined,
    ],
  ] as const;
  for (const [state, stage, attention] of cases) {
    const restored = parseContributionCheckpoint(
      encodeContributionCheckpoint(state),
    ).state;
    expect(contributionView(restored)).toEqual(contributionView(state));
    expect(contributionView(restored).stage).toBe(stage);
    expect(contributionView(restored).attention).toBe(attention);
    expect(
      actionableAttention(knowledgeOrganization, restored).some(
        (x) => x.id === "local-K-01-H",
      ),
    ).toBe(!!attention);
  }
  expect(second.contributions[0]).toEqual(assessed.contributions[0]);
});
for (const width of [390, 1440])
  test(`uncertain command has one consistent personal and shared explanation ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
    );
    await page.getByLabel("Contribution text").fill("Current contribution.");
    await page.getByLabel("Delivery note", { exact: true }).fill("scope");
    await page.getByRole("checkbox").check();
    await page
      .getByText("Command delivery simulation", { exact: true })
      .click();
    await page.getByLabel("Submission result").selectOption("unknown");
    await page.getByRole("button", { name: "Review delivery" }).click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    await page.getByRole("button", { name: "Back to My Work · Leo" }).click();
    const assignment = page.getByRole("article", {
      name: "K-01-H",
      exact: true,
    });
    await expect(assignment).toContainText("Acknowledgement unknown");
    await expect(assignment).toContainText("do not submit again");
    await expect(assignment).not.toContainText("Prepare your current draft");
    await page
      .getByRole("button", { name: "Inspect my assignment · K-01-H" })
      .click();
    await expect(
      page.getByText(
        "draft-01: acknowledgement unknown · no delivery recorded",
        { exact: true },
      ),
    ).toBeVisible();
    await page.goto("/#/organizations/knowledge?persona=leo");
    await expect(
      page.getByRole("region", { name: "Concrete coordination needs" }),
    ).toContainText("Do not resend");
    await page
      .getByText("Contribution exchange history · K-01-H", { exact: true })
      .click();
    await expect(
      page
        .getByRole("region", { name: "Shared contribution observations" })
        .getByRole("status"),
    ).toHaveText("draft-01: acknowledgement unknown · no delivery recorded");
  });

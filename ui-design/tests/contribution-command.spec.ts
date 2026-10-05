import { test, expect } from "@playwright/test";
import { emptyContribution } from "../src/data/humanContribution";
import {
  submitContributionCommand,
  resolveContributionCommand,
  projectContributionCommand,
} from "../src/data/contributionCommand";
test("unknown acknowledgement blocks duplicate submission; admission and projection are independent", () => {
  const state = emptyContribution();
  state.contributions[0] = {
    ...state.contributions[0],
    body: "text",
    note: "note",
    citesInput: true,
  };
  const unknown = submitContributionCommand(state, "unknown", "submitted");
  expect(submitContributionCommand(unknown, "projected", "retry")).toBe(
    unknown,
  );
  expect(projectContributionCommand(unknown)).toBe(unknown);
  const admitted = resolveContributionCommand(
    unknown,
    "admitted",
    "admitted-time",
  );
  expect(admitted.contributions[0].delivery).toBeUndefined();
  expect(admitted.commands?.[0].idempotencyKey).toBe(
    unknown.commands?.[0].idempotencyKey,
  );
  const projected = projectContributionCommand(admitted);
  expect(projected.contributions[0].delivery?.body).toBe("text");
  expect(projected.contributions[0].receipt).toBeUndefined();
  expect(projectContributionCommand(projected)).toBe(projected);
  const changed = {
    ...admitted,
    contributions: [{ ...admitted.contributions[0], body: "different" }],
  };
  expect(projectContributionCommand(changed)).toBe(changed);
});
for (const width of [390, 1440])
  test(`unknown acknowledgement and delayed projection ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/demos/human-contribution");
    await page.getByLabel("Contribution text").fill("Prepared guide.");
    await page
      .getByLabel("Delivery note", { exact: true })
      .fill("Ready for review.");
    await page.getByRole("checkbox").check();
    await page
      .getByText("Command delivery simulation", { exact: true })
      .click();
    await page.getByLabel("Submission result").selectOption("unknown");
    await page.getByRole("button", { name: "Review delivery" }).click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    await expect(page.getByLabel("Contribution text")).toHaveCount(0);
    await expect(
      page.getByText("No delivery recorded for draft-01.", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Simulate status query: still unknown" })
      .click();
    await page
      .getByRole("button", {
        name: "Simulate status query: admitted",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("No delivery recorded for draft-01.", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Simulate delivery projection refresh" })
      .click();
    await expect(
      page.getByRole("button", { name: "Simulate receiver receipt" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Simulate revision request" }),
    ).toBeDisabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("rejected submission preserves draft and issues a distinct command on correction", async ({
  page,
}) => {
  await page.goto("/#/demos/human-contribution");
  await page.getByLabel("Contribution text").fill("Draft preserved.");
  await page
    .getByLabel("Delivery note", { exact: true })
    .fill("First attempt.");
  await page.getByRole("checkbox").check();
  await page.getByText("Command delivery simulation", { exact: true }).click();
  await page.getByLabel("Submission result").selectOption("rejected");
  await page.getByRole("button", { name: "Review delivery" }).click();
  await page.getByRole("button", { name: "Record local delivery" }).click();
  await expect(page.getByLabel("Contribution text")).toHaveValue(
    "Draft preserved.",
  );
  await expect(
    page.getByText("Rejection: permission-denied", { exact: false }),
  ).toBeVisible();
  await page
    .getByLabel("Delivery note", { exact: true })
    .fill("Corrected intent.");
  await page.getByLabel("Submission result").selectOption("admitted-lag");
  await page.getByRole("button", { name: "Review delivery" }).click();
  await page.getByRole("button", { name: "Record local delivery" }).click();
  await page
    .getByText("Inspect local command envelope", { exact: true })
    .click();
  await expect(
    page.getByText("demo-command-2 · Idempotency key: demo-command-2-key", {
      exact: false,
    }),
  ).toBeVisible();
});

import { test, expect } from "@playwright/test";
import {
  contributionCheckpointKey,
  encodeContributionCheckpoint,
} from "../src/data/contributionCheckpoint";
import { emptyContribution } from "../src/data/humanContribution";
for (const width of [390, 1440])
  test(`contribution transfer across browsers preserves uncertainty ${width}`, async ({
    page,
    browser,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
    );
    await page.getByLabel("Contribution text").fill("Portable unsaved draft.");
    await page
      .getByLabel("Delivery note", { exact: true })
      .fill("Portable scope.");
    await page.getByRole("checkbox").check();
    await page
      .getByText("Command delivery simulation", { exact: true })
      .click();
    await page.getByLabel("Submission result").selectOption("unknown");
    await page.getByRole("button", { name: "Review delivery" }).click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await page
      .getByText("Move contribution between machines", { exact: true })
      .click();
    const downloaded = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export current contribution" })
      .click();
    const file = await downloaded;
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        contributionCheckpointKey,
      ),
    ).toBeNull();
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
    });
    try {
      const destination = await context.newPage();
      await destination.goto(
        "http://127.0.0.1:4173/#/organizations/knowledge/contributions/K-01-H?persona=leo",
      );
      await destination
        .getByLabel("Contribution text")
        .fill("Destination unsaved draft.");
      const saved = encodeContributionCheckpoint(emptyContribution());
      await destination.evaluate(
        ({ key, saved }) => localStorage.setItem(key, saved),
        { key: contributionCheckpointKey, saved },
      );
      await destination
        .getByText("Save or restore Knowledge contribution", { exact: true })
        .click();
      await destination
        .getByText("Move contribution between machines", { exact: true })
        .click();
      await destination
        .getByLabel("Import contribution file")
        .setInputFiles((await file.path())!);
      await expect(
        destination.getByRole("heading", { name: "Import preview" }),
      ).toBeVisible();
      await expect(destination.getByLabel("Contribution text")).toHaveValue(
        "Destination unsaved draft.",
      );
      await destination
        .getByRole("button", { name: "Cancel import", exact: true })
        .click();
      await expect(destination.getByLabel("Contribution text")).toHaveValue(
        "Destination unsaved draft.",
      );
      await destination
        .getByLabel("Import contribution file")
        .setInputFiles((await file.path())!);
      await destination
        .getByRole("button", { name: "Confirm import contribution" })
        .click();
      await expect(destination.getByLabel("Contribution text")).toHaveCount(0);
      await expect(
        destination.getByRole("region", { name: "Current contribution task" }),
      ).toContainText("do not submit again");
      await destination
        .getByText("Inspect local command envelope", { exact: true })
        .click();
      await expect(
        destination.getByText(
          /demo-command-1 · Idempotency key: demo-command-1-key/,
        ),
      ).toBeVisible();
      expect(
        await destination.evaluate(
          (key) => localStorage.getItem(key),
          contributionCheckpointKey,
        ),
      ).toBe(saved);
      await destination
        .getByRole("button", {
          name: "Save contribution checkpoint",
          exact: true,
        })
        .click();
      await destination
        .getByRole("button", { name: "Confirm save checkpoint" })
        .click();
      await expect(
        destination.getByRole("status", { name: "Contribution save status" }),
      ).toContainText("Current work matches checkpoint");
      expect(
        await destination.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    } finally {
      await context.close();
    }
  });
test("invalid and oversized contribution files preserve work and checkpoint", async ({
  page,
}) => {
  await page.goto(
    "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
  );
  await page.getByLabel("Contribution text").fill("Keep my work.");
  await page
    .getByText("Save or restore Knowledge contribution", { exact: true })
    .click();
  await page
    .getByText("Move contribution between machines", { exact: true })
    .click();
  const saved = encodeContributionCheckpoint(emptyContribution());
  await page.evaluate(({ key, saved }) => localStorage.setItem(key, saved), {
    key: contributionCheckpointKey,
    saved,
  });
  for (const content of [
    "{",
    JSON.stringify({ format: "forge.demo.v1" }),
    "x".repeat(2_000_001),
  ]) {
    await page
      .getByLabel("Import contribution file")
      .setInputFiles({
        name: "bad.json",
        mimeType: "application/json",
        buffer: Buffer.from(content),
      });
    await expect(
      page
        .getByRole("region", { name: "Knowledge contribution recovery" })
        .getByRole("status"),
    ).toContainText("import rejected");
    await expect(
      page.getByRole("button", { name: "Confirm import contribution" }),
    ).toHaveCount(0);
    await expect(page.getByLabel("Contribution text")).toHaveValue(
      "Keep my work.",
    );
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        contributionCheckpointKey,
      ),
    ).toBe(saved);
  }
});

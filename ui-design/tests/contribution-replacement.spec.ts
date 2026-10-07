import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import { encodeContributionCheckpoint } from "../src/data/contributionCheckpoint";

for (const width of [320, 1440])
  test(`replacement previews rollback and unsaved text before cancel or confirm ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
    );
    const at = "2026-10-07T12:00:00Z";
    const first = emptyContribution();
    first.contributions[0] = {
      ...first.contributions[0],
      body: "Original guide",
      note: "scope",
      citesInput: true,
    };
    const current = reviseContribution(
      assessContribution(
        receiveContribution(
          submitContributionCommand(first, "projected", at),
          at,
        ),
        at,
      ),
    );
    current.contributions[1] = {
      ...current.contributions[1],
      body: "Unsent revision",
      note: "response",
      citesInput: true,
    };
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await page
      .getByText("Move contribution between machines", { exact: true })
      .click();
    const file = page.getByLabel("Import contribution file");
    await file.setInputFiles({
      name: "two.json",
      mimeType: "application/json",
      buffer: Buffer.from(encodeContributionCheckpoint(current)),
    });
    await page
      .getByRole("button", { name: "Confirm import contribution" })
      .click();
    await page
      .getByRole("button", {
        name: "Save contribution checkpoint",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Confirm save checkpoint" }).click();
    await page
      .getByLabel("Contribution text")
      .fill("Unsaved revision with long token " + "context".repeat(100));
    await file.setInputFiles({
      name: "rollback.json",
      mimeType: "application/json",
      buffer: Buffer.from(encodeContributionCheckpoint(first)),
    });
    const impact = page.getByRole("region", {
      name: "Contribution replacement impact",
    });
    await expect(impact).toContainText(
      "Current work differs from the saved browser checkpoint",
    );
    await expect(impact).toContainText(
      "draft-02: removed from current session",
    );
    await expect(impact).toContainText(
      "draft-01: replaced fields: delivery, receipt, assessment",
    );
    await expect(impact).toContainText("1 current → 0 incoming");
    await impact
      .getByText("Inspect current work to replace", { exact: true })
      .click();
    await expect(
      impact.getByRole("article", { name: "Current work to replace draft-02" }),
    ).toContainText("Unsaved revision");
    await impact
      .getByText("Inspect incoming replacement", { exact: true })
      .click();
    await expect(
      impact.getByRole("article", { name: "Incoming replacement draft-01" }),
    ).toContainText("Original guide");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Cancel import" }).click();
    await expect(page.getByLabel("Contribution text")).toHaveValue(
      /Unsaved revision/,
    );
    await page
      .getByRole("button", { name: "Review saved contribution" })
      .click();
    await expect(impact).toContainText("draft-02: replaced fields: text");
    await expect(impact).toContainText("Command history: unchanged");
    await page
      .getByRole("button", { name: "Confirm restore contribution" })
      .click();
    await expect(page.getByLabel("Contribution text")).toHaveValue(
      "Unsent revision",
    );
    await expect(
      page.getByRole("status", { name: "Contribution save status" }),
    ).toContainText("Current work matches checkpoint");
  });

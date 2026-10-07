import { test, expect } from "@playwright/test";
import { emptyContribution } from "../src/data/humanContribution";
import { encodeContributionCheckpoint } from "../src/data/contributionCheckpoint";

for (const width of [390, 1440]) {
  test(`missing fields, rejection recovery and interrupted review ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
    );
    const review = page.getByRole("button", {
      name: "Review delivery",
      exact: true,
    });
    await expect(review).toBeDisabled();
    await expect(
      page.getByText("Still needed:", { exact: false }),
    ).toContainText(
      "contribution text, delivery note, supporting input citation",
    );
    await page.getByLabel("Contribution text").fill("Preserved guide");
    await page.getByLabel("Delivery note", { exact: true }).fill("scope");
    await page.getByRole("checkbox").check();
    await page
      .getByText("Command delivery simulation", { exact: true })
      .click();
    await page.getByLabel("Submission result").selectOption("rejected");
    await review.click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    const status = page.getByRole("region", {
      name: "Contribution command status",
    });
    await expect(status).toContainText(
      "editing text does not grant permission",
    );
    await expect(page.getByLabel("Contribution text")).toHaveValue(
      "Preserved guide",
    );
    await page.getByLabel("Submission result").selectOption("conflict");
    await review.click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    await expect(status).toContainText(
      "Compare the current assignment revision",
    );
    await expect(status).toContainText("no server revision to fetch");
    await review.click();
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    const replacement = emptyContribution();
    replacement.contributions[0] = {
      ...replacement.contributions[0],
      body: "Imported guide",
      note: "new scope",
      citesInput: true,
    };
    await page
      .getByLabel("Import contribution file")
      .setInputFiles({
        name: "replacement.json",
        mimeType: "application/json",
        buffer: Buffer.from(encodeContributionCheckpoint(replacement)),
      });
    await page
      .getByRole("button", { name: "Confirm import contribution" })
      .click();
    await expect(
      page.getByRole("button", { name: "Record local delivery" }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Work changed after the delivery review.", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(page.getByLabel("Contribution text")).toHaveValue(
      "Imported guide",
    );
    await expect(
      page.getByRole("region", { name: "Contribution command status" }),
    ).toHaveCount(0);
    await review.click();
    await expect(
      page.getByRole("region", { name: "Confirm contribution delivery" }),
    ).toContainText("Imported guide");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

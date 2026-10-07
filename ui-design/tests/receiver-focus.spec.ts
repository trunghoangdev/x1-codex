import { test, expect, firefox } from "@playwright/test";
import { emptyContribution } from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import {
  contributionCheckpointKey,
  encodeContributionCheckpoint,
} from "../src/data/contributionCheckpoint";

test("Firefox receiver keyboard results and returning to existing records", async () => {
  const browser = await firefox.launch({ channel: "firefox" });
  try {
    const page = await browser.newPage({
      baseURL: "http://127.0.0.1:4173",
      viewport: { width: 320, height: 900 },
    });
    const initial = emptyContribution();
    initial.contributions[0] = {
      ...initial.contributions[0],
      body: "Guide",
      note: "Scope",
      citesInput: true,
    };
    const delivered = submitContributionCommand(
      initial,
      "projected",
      "2026-10-07T12:00:00Z",
    );
    await page.goto("/#/organizations/knowledge/work?persona=maya");
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
      key: contributionCheckpointKey,
      raw: encodeContributionCheckpoint(delivered),
    });
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review saved contribution" })
      .click();
    await page
      .getByRole("button", { name: "Confirm restore contribution" })
      .click();
    const result = page.getByRole("region", { name: "Receiver action result" });
    await expect(result).toHaveCount(0);
    await page
      .getByRole("button", { name: "Record sample receipt · draft-01" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(result.getByRole("heading")).toBeFocused();
    await expect(result).toContainText("human-receipt-v1 → human-delivery-v1");
    await page
      .getByRole("button", { name: "Request sample revision · draft-01" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(result.getByRole("heading")).toBeFocused();
    await expect(result).toContainText("Wait for Leo’s next delivery");
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("leo");
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("maya");
    await expect(
      page.getByRole("heading", { name: "My Work · Maya Patel", exact: true }),
    ).toBeFocused();
    await expect(result).toContainText("human-assessment-v1");
    await expect(
      page.getByRole("button", { name: "Request sample revision · draft-01" }),
    ).toBeDisabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await browser.close();
  }
});

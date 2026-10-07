import { submitContributionCommand } from "../src/data/contributionCommand";
import { test, expect } from "@playwright/test";
import { contributionTextChange } from "../src/ContributionComparison";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
} from "../src/data/humanContribution";
import {
  encodeContributionCheckpoint,
  contributionCheckpointKey,
} from "../src/data/contributionCheckpoint";

test("changed passage preserves equal boundaries and exact content", () => {
  for (const [before, after] of [
    ["a\nb\nc", "a\nx\nc"],
    ["same", "same"],
    ["", "new"],
    ["a\nb", "a"],
    ["a", "a\nb"],
    ["a\n", "a"],
  ]) {
    const diff = contributionTextChange(before, after);
    expect([...diff.prefix, ...diff.removed, ...diff.suffix].join("\n")).toBe(
      before,
    );
    expect([...diff.prefix, ...diff.added, ...diff.suffix].join("\n")).toBe(
      after,
    );
  }
});
for (const width of [320, 1440])
  test(`comparison binds assessment and hides unsent revision from receiver ${width}`, async ({
    page,
  }) => {
    const at = "2026-10-07T12:00:00Z";
    const first = emptyContribution();
    first.contributions[0] = {
      ...first.contributions[0],
      body: "Welcome\nOld next step\nShared context",
      note: "Original scope",
      citesInput: true,
    };
    const assessed = assessContribution(
      receiveContribution(
        submitContributionCommand(first, "projected", at),
        at,
      ),
      at,
    );
    const revision = reviseContribution(assessed);
    revision.contributions[1] = {
      ...revision.contributions[1],
      body: "Welcome\nContact onboarding with account context\nShared context",
      note: "Made the contact and required context explicit.",
      citesInput: true,
    };
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
    );
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
      key: contributionCheckpointKey,
      raw: encodeContributionCheckpoint(revision),
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
    const summary = page.getByText("Compare draft-01 and draft-02", {
      exact: true,
    });
    await summary.focus();
    await page.keyboard.press("Enter");
    const comparison = page.getByRole("region", {
      name: "Contribution version comparison",
    });
    await expect(comparison).toContainText(
      "current preparation, not delivered",
    );
    await expect(comparison).toContainText(
      "human-assessment-v1 → human-receipt-v1 → human-delivery-v1",
    );
    await expect(comparison.locator("del")).toHaveText("Old next step\n");
    await expect(comparison.locator("ins")).toHaveText(
      "Contact onboarding with account context\n",
    );
    await expect(comparison).toContainText(
      "Made the contact and required context explicit.",
    );
    await page.goto("/#/organizations/knowledge/work?persona=maya");
    await expect(summary).toHaveCount(0);
    await page.goto(
      "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
    );
    await page
      .getByRole("button", { name: "Review delivery", exact: true })
      .click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    await page.goto("/#/organizations/knowledge/work?persona=maya");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(comparison).toContainText("the frozen revised delivery");
    await expect(comparison).toContainText(
      "The original assessment does not assess draft-02.",
    );
    await expect(comparison).toContainText("Reassessment remains pending");
    await expect(
      comparison.getByRole("article", { name: "Comparison draft-01" }),
    ).toContainText("Original scope");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

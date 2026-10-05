import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  deliverContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
} from "../src/data/humanContribution";
test("delivery and revision preserve exact subjects and independent receiving state", () => {
  const empty = emptyContribution();
  expect(deliverContribution(empty, "now")).toBe(empty);
  expect(receiveContribution(empty, "now")).toBe(empty);
  const ready = {
    contributions: [
      {
        ...empty.contributions[0],
        body: "first",
        note: "scope",
        citesInput: true,
      },
    ],
  };
  const delivered = deliverContribution(ready, "first-time");
  expect(delivered.contributions[0].receipt).toBeUndefined();
  expect(assessContribution(delivered, "now")).toBe(delivered);
  const assessed = assessContribution(
    receiveContribution(delivered, "receipt-time"),
    "review-time",
  );
  const revised = reviseContribution(assessed);
  revised.contributions[1] = {
    ...revised.contributions[1],
    body: "second",
    note: "responds to review",
    citesInput: true,
  };
  const second = deliverContribution(revised, "second-time");
  expect(second.contributions[0]).toEqual(assessed.contributions[0]);
  expect(second.contributions[1].delivery?.respondsTo).toBe(
    "human-assessment-v1",
  );
  expect(second.contributions[1].receipt).toBeUndefined();
  expect(second.contributions[1].assessment).toBeUndefined();
});
for (const width of [390, 1440])
  test(`human contribution delivery and revision ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/demos");
    await page.getByRole("button", { name: "Try human contribution" }).click();
    await expect(
      page.getByRole("button", { name: "Review delivery" }),
    ).toBeDisabled();
    await page
      .getByLabel("Contribution text")
      .fill("Contact onboarding with your cohort and access question.");
    await page
      .getByLabel("Delivery note", { exact: true })
      .fill("Single-cohort draft prepared for review.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Back to Demos" }).click();
    await page.getByRole("button", { name: "Try human contribution" }).click();
    await expect(page.getByLabel("Contribution text")).toHaveValue(
      "Contact onboarding with your cohort and access question.",
    );
    await page.getByRole("button", { name: "Review delivery" }).click();
    await page.getByRole("button", { name: "Keep editing" }).click();
    await page.getByRole("button", { name: "Review delivery" }).click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    await expect(
      page.getByRole("button", { name: "Simulate revision request" }),
    ).toBeDisabled();
    await expect(
      page.getByText("Receipt: not recorded", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Simulate receiver receipt" })
      .click();
    await page
      .getByRole("button", { name: "Simulate revision request" })
      .click();
    await page.getByRole("button", { name: "Prepare draft-02" }).click();
    await expect(page.getByLabel("Contribution text")).toHaveValue(
      "Contact onboarding with your cohort and access question.",
    );
    await page
      .getByLabel("Contribution text")
      .fill(
        "Revised next step: contact onboarding with cohort, account and access question.",
      );
    await page
      .getByLabel("Revision response")
      .fill("Added context requested by the illustrative reviewer.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Review delivery" }).click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    await page
      .getByRole("button", { name: "Simulate receiver receipt" })
      .click();
    await expect(
      page.getByText("Reassessment is pending", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("Responds to: human-assessment-v1", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Prepare draft-01", exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Contribution text")).toHaveValue("");
  });

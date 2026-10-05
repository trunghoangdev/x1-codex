import { test, expect } from "@playwright/test";
for (const width of [390, 1440])
  test(`shared contributor receiver revision loop ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/work?persona=maya");
    await expect(
      page.getByText("No delivered contribution is available to receive."),
    ).toBeVisible();
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("leo");
    await page
      .getByRole("button", { name: "Open contribution · K-01-H" })
      .click();
    await page
      .getByLabel("Contribution text")
      .fill("Original exact contribution.");
    await page
      .getByLabel("Delivery note", { exact: true })
      .fill("Original scope.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Review delivery" }).click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    await expect(
      page.getByRole("button", { name: "Simulate receiver receipt" }),
    ).toHaveCount(0);
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("maya");
    const inbox = page.getByRole("region", { name: "Maya contribution inbox" });
    await expect(
      inbox.getByText("Original exact contribution.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Request sample revision · draft-01" }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "Record sample receipt · draft-01" })
      .click();
    await page
      .getByRole("button", { name: "Request sample revision · draft-01" })
      .click();
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("leo");
    await expect(
      page.getByText(
        "Maya requested a revision · human-assessment-v1. Open contribution to prepare draft-02.",
      ),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Open contribution · K-01-H" })
      .click();
    await page.getByRole("button", { name: "Prepare draft-02" }).click();
    await page
      .getByLabel("Contribution text")
      .fill("Revised exact contribution.");
    await page.getByLabel("Revision response").fill("Responds to Maya.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Review delivery" }).click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("maya");
    await expect(
      inbox.getByText("Revised exact contribution.", { exact: true }),
    ).toBeVisible();
    await expect(
      inbox.getByText("Original exact contribution.", { exact: true }),
    ).toHaveCount(1);
    await page
      .getByRole("button", { name: "Record sample receipt · draft-02" })
      .click();
    await expect(
      page.getByText(
        "Reassessment remains pending. A receipt does not accept this revision.",
      ),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to Organization", exact: true })
      .click();
    const observations = page.getByRole("region", {
      name: "Shared contribution observations",
    });
    await expect(observations.getByRole("status")).toHaveText(
      "draft-02: delivered locally · receipt recorded · assessment not recorded",
    );
    await expect(
      observations.getByText(
        "Assessment: human-assessment-v1 → human-receipt-v1 · Revision requested",
      ),
    ).toBeVisible();
    await page.reload();
    await expect(
      page
        .getByRole("region", { name: "Shared contribution observations" })
        .getByRole("status"),
    ).toHaveText("draft-01: preparation · no delivery recorded");
  });

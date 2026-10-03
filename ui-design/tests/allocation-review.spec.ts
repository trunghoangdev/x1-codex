import { test, expect } from "@playwright/test";
for (const width of [1440, 390]) {
  test(`allocation review records bounded decisions at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organization/attention/responsibility");
    await page
      .getByRole("button", {
        name: "Propose responsibility · Invitation implementation",
        exact: true,
      })
      .click();
    await page.getByLabel("Proposed worker").selectOption("codex");
    await page
      .getByLabel("Reason for proposal")
      .fill("Propose a bounded invitation implementation.");
    await page
      .getByRole("button", { name: "Record local proposal", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review allocation plan", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Allocation preview", exact: true }),
    ).toBeFocused();
    await expect(
      page.getByRole("region", { name: "Proposed allocation changes" }),
    ).toContainText("Create a Developer binding");
    await expect(
      page.getByRole("region", { name: "Proposed allocation changes" }),
    ).toContainText("Await agreed criteria");
    await expect(
      page.getByRole("button", {
        name: "Record allocation decision",
        exact: true,
      }),
    ).toBeDisabled();
    await page.getByLabel("Decision reason", { exact: true }).fill("   ");
    await expect(
      page.getByRole("button", {
        name: "Record allocation decision",
        exact: true,
      }),
    ).toBeDisabled();
    await page
      .getByLabel("Decision reason", { exact: true })
      .fill("Accept this scope for later validation and allocation.");
    await page
      .getByRole("button", { name: "Record allocation decision", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Accepted locally · allocation pending",
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.getByRole("region", { name: "Allocation decision receipt" }),
    ).toContainText("worker has not been allocated");
    const original = page.locator("details.proposal-original");
    await expect(original).not.toHaveAttribute("open", "");
    await original.locator("summary").click();
    await expect(original).toHaveAttribute("open", "");
    await expect(original).toContainText(
      "Propose a bounded invitation implementation.",
    );
    await original.locator("summary").click();
    await expect(
      page.getByRole("button", {
        name: "Record allocation decision",
        exact: true,
      }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("article", {
        name: "Invitation implementation",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "View proposal · Invitation implementation",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", { name: "Allocation decision receipt" }),
    ).toContainText("Accept this scope for later validation");
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", {
        name: "Propose responsibility · Invitation assessment assignment",
        exact: true,
      })
      .click();
    await page.getByLabel("Proposed worker").selectOption("alex");
    await page
      .getByLabel("Reason for proposal")
      .fill("Propose an invitation assessment.");
    await page
      .getByRole("button", { name: "Record local proposal", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review allocation plan", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Proposed allocation changes" }),
    ).toContainText("Reuse Alex's existing Reviewer binding");
    await page
      .getByLabel("Decision reason", { exact: true })
      .fill("Draft that will be canceled.");
    await page
      .getByRole("button", { name: "Cancel review", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review allocation plan", exact: true })
      .click();
    await expect(
      page.getByLabel("Decision reason", { exact: true }),
    ).toHaveValue("");
    await page
      .getByLabel("Allocation decision", { exact: true })
      .selectOption("Rejected");
    await page
      .getByLabel("Decision reason", { exact: true })
      .fill("No identifiable invitation candidate is available.");
    await page
      .getByRole("button", { name: "Record allocation decision", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Rejected locally · no allocation planned",
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.getByRole("region", { name: "Allocation decision receipt" }),
    ).toContainText("No binding or assignment creation is planned");
    await page
      .getByRole("button", {
        name: "Remove local proposal and decision",
        exact: true,
      })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: "Propose responsibility · Invitation assessment assignment",
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", {
        name: "Propose responsibility · Invitation implementation",
        exact: true,
      }),
    ).toBeVisible();
  });
}

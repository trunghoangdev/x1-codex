import { test, expect } from "@playwright/test";
for (const width of [1440, 390]) {
  test(`organization activity scopes proposal and decision records at ${width}px`, async ({
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
      .fill("Coordinate invitation implementation.");
    await page
      .getByRole("button", { name: "Record local proposal", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review allocation plan", exact: true })
      .click();
    const outcome = width === 1440 ? "Accepted" : "Rejected";
    await page
      .getByLabel("Allocation decision", { exact: true })
      .selectOption(outcome);
    await page
      .getByLabel("Decision reason", { exact: true })
      .fill("Plan review remains separate from allocation.");
    await page
      .getByRole("button", { name: "Record allocation decision", exact: true })
      .click();
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Back to Organization", exact: true })
      .click();
    await page
      .getByRole("button", { name: "View organization activity", exact: true })
      .click();
    await page.getByLabel("Activity scope").selectOption("WS-02");
    const coordination = page.getByRole("region", {
      name: "Organization coordination records",
    });
    await expect(page.getByRole("status")).toContainText("2 matching records");
    await expect(coordination.getByRole("article").first()).toContainText(
      `${outcome} allocation plan`,
    );
    await expect(coordination).toContainText("Alex Morgan (demo proposer)");
    await expect(coordination).toContainText(
      "Jamie Chen · Planner (demo reviewer)",
    );
    await expect(coordination).toContainText(
      "Proposed worker: Codex worker · Developer",
    );
    await expect(coordination).toContainText(
      outcome === "Accepted" ? "Allocation pending" : "Plan rejected",
    );
    await page
      .getByLabel("Organization activity type")
      .selectOption("proposals");
    await expect(page.getByRole("status")).toContainText("1 matching records");
    await expect(coordination.getByRole("article")).toHaveCount(1);
    await page
      .getByLabel("Organization activity type")
      .selectOption("decisions");
    await expect(page.getByRole("status")).toContainText("1 matching records");
    const inspect = coordination.getByRole("button", {
      name: /Inspect coordination receipt/,
    });
    await inspect.click();
    await expect(
      page.getByRole("region", { name: "Allocation decision receipt" }),
    ).toContainText("Plan review remains separate from allocation.");
    await expect(page).toHaveURL(/#\/organization\/activity$/);
    await page.keyboard.press("Escape");
    await expect(inspect).toBeFocused();
    await expect(page.getByLabel("Organization activity type")).toHaveValue(
      "decisions",
    );
    await page.getByLabel("Activity scope").selectOption("WS-01");
    await expect(page.getByRole("status")).toContainText("0 matching records");
    await page.getByLabel("Activity scope").selectOption("WS-02");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await inspect.click();
    await page
      .getByRole("button", {
        name: "Remove local proposal and decision",
        exact: true,
      })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        name: "Records across the organization",
        exact: true,
      }),
    ).toBeFocused();
    await expect(page.getByRole("status")).toContainText("0 matching records");
    await page
      .getByLabel("Organization activity type")
      .selectOption("proposals");
    await expect(page.getByRole("status")).toContainText("0 matching records");
    await page.reload();
    await expect(coordination).toContainText("No local coordination records");
  });
}

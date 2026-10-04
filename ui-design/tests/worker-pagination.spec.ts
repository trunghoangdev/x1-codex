import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`bounded worker directory at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/#/organizations/large/workers?persona=sam");
    const rows = page.locator(".org-stream-grid article");
    await expect(rows).toHaveCount(6);
    await expect(page.getByRole("status")).toContainText(
      "9 of 9 workers · Showing 1–6 · Page 1 of 2",
    );
    await expect(
      page.getByRole("button", { name: "Previous workers" }),
    ).toBeDisabled();
    const first = rows.first();
    await expect(first.locator("details")).not.toHaveAttribute("open", "");
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(first.locator("details")).toHaveAttribute("open", "");
    await page.getByRole("button", { name: "Next workers" }).click();
    await expect(page.getByRole("status")).toBeFocused();
    await expect(rows).toHaveCount(3);
    await expect(page).toHaveURL(/page=2/);
    await expect(page).toHaveURL(/persona=sam/);
    await expect(page.getByRole("status")).toContainText("Showing 7–9");
    await expect(
      page.getByRole("button", { name: "Next workers" }),
    ).toBeDisabled();
    const source = page.url();
    await page.reload();
    await expect(rows).toHaveCount(3);
    await page
      .getByRole("button", { name: "Open worker · Codex worker", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(source);
    await expect(rows).toHaveCount(3);
    await page.getByRole("searchbox", { name: "Search workers" }).fill("Sam");
    await expect(rows).toHaveCount(1);
    await expect(page).not.toHaveURL(/page=/);
    await expect(page.getByRole("status")).toContainText("1 of 9 workers");
    await page
      .getByRole("searchbox", { name: "Search workers" })
      .fill("no-such-person");
    await expect(rows).toHaveCount(0);
    await page.getByRole("button", { name: "Show all workers" }).click();
    await expect(
      page.getByRole("searchbox", { name: "Search workers" }),
    ).toBeFocused();
    await expect(rows).toHaveCount(6);
    await page.goto("/#/organizations/large/workers?page=999");
    await expect(page.getByRole("status")).toContainText("Page 2 of 2");
    await expect(rows).toHaveCount(3);
    await page.getByRole("button", { name: "Previous workers" }).click();
    await expect(rows).toHaveCount(6);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const route of [
      "/organizations/large/workers?page=0",
      "/organization/workers?page=abc",
      "/organization/workers?page=1.5",
    ]) {
      await page.goto(`/#${route}`);
      await expect(page.getByRole("alert")).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`bounded workstream directory at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/#/organizations/large/workstreams?persona=sam");
    const rows = page.locator(".org-stream-grid article");
    await expect(rows).toHaveCount(4);
    await expect(page.getByRole("status")).toContainText(
      "6 of 6 workstreams · Showing 1–4 · Page 1 of 2",
    );
    await expect(
      page.getByRole("button", { name: "Previous workstreams" }),
    ).toBeDisabled();
    const first = rows.first();
    await expect(first.locator("details")).not.toHaveAttribute("open", "");
    await first.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(first.locator("details")).toHaveAttribute("open", "");
    await page.getByRole("button", { name: "Next workstreams" }).click();
    await expect(page.getByRole("status")).toBeFocused();
    await expect(rows).toHaveCount(2);
    await expect(page).toHaveURL(/page=2/);
    await expect(page).toHaveURL(/persona=sam/);
    await expect(page.getByRole("status")).toContainText("Showing 5–6");
    await expect(
      page.getByRole("button", { name: "Next workstreams" }),
    ).toBeDisabled();
    const source = page.url();
    await page.reload();
    await expect(rows).toHaveCount(2);
    await page
      .getByRole("button", { name: "Open workstream · L-05", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(source);
    await expect(rows).toHaveCount(2);
    await page
      .getByRole("searchbox", { name: "Search workstreams" })
      .fill("L-05");
    await expect(rows).toHaveCount(1);
    await expect(page).not.toHaveURL(/page=/);
    await expect(page.getByRole("status")).toContainText("1 of 6 workstreams");
    await page
      .getByRole("searchbox", { name: "Search workstreams" })
      .fill("no-such-person");
    await expect(rows).toHaveCount(0);
    await page.getByRole("button", { name: "Show all workstreams" }).click();
    await expect(
      page.getByRole("searchbox", { name: "Search workstreams" }),
    ).toBeFocused();
    await expect(rows).toHaveCount(4);
    await page.goto("/#/organizations/large/workstreams?page=999");
    await expect(page.getByRole("status")).toContainText("Page 2 of 2");
    await expect(rows).toHaveCount(2);
    await page.getByRole("button", { name: "Previous workstreams" }).click();
    await expect(rows).toHaveCount(4);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const route of [
      "/organizations/large/workstreams?page=0",
      "/organization/workstreams?page=abc",
      "/organization/workstreams?page=1.5",
    ]) {
      await page.goto(`/#${route}`);
      await expect(page.getByRole("alert")).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

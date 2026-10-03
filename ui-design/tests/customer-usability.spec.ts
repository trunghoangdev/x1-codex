import { test, expect } from "@playwright/test";
for (const width of [1440, 390]) {
  test(`customer terminology and empty-list recovery at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organization");
    const guide = page.locator("details.workspace-guide");
    await expect(guide).not.toHaveAttribute("open", "");
    const summary = guide.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(guide).toHaveAttribute("open", "");
    await expect(guide).toContainText(
      "does not automatically create an assignment",
    );
    await expect(guide).toContainText(
      "recorded response alone does not prove success",
    );
    await page.keyboard.press("Enter");
    await expect(guide).not.toHaveAttribute("open", "");
    await page
      .getByRole("button", { name: "Browse workers", exact: true })
      .click();
    await page
      .getByRole("searchbox", { name: "Search workers", exact: true })
      .fill("no matching person");
    await page
      .getByRole("button", { name: "Show all workers", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("4 of 4 workers");
    await expect(
      page.getByRole("searchbox", { name: "Search workers", exact: true }),
    ).toBeFocused();
    await expect(page).toHaveURL(/#\/organization\/workers$/);
    await page
      .getByRole("button", { name: "Back to Organization", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Browse workstreams", exact: true })
      .click();
    await page
      .getByRole("searchbox", { name: "Search workstreams", exact: true })
      .fill("no matching goal");
    await page
      .getByRole("button", { name: "Show all workstreams", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("2 of 2 workstreams");
    await expect(
      page.getByRole("searchbox", { name: "Search workstreams", exact: true }),
    ).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

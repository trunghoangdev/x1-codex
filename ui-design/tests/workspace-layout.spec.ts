import { test, expect } from "@playwright/test";
for (const width of [390, 1440])
  test(`overview prioritizes organization context and keeps tools reachable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/organizations/knowledge?persona=leo");
    const heading = page.getByRole("heading", {
      name: "One team. Clear responsibility.",
      exact: true,
    });
    await expect(heading).toBeVisible();
    const tools = page.locator("#knowledge-operating-tools");
    await expect(tools).not.toHaveAttribute("open", "");
    await expect(
      page.getByRole("button", {
        name: "Open exception handling",
        exact: true,
      }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Open personal inbox · Leo Rivera",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Open operating tools", exact: true })
      .click();
    await expect(tools).toHaveAttribute("open", "");
    await expect(tools.locator(":scope > summary")).toBeFocused();
    await page
      .getByRole("button", { name: "Open exception handling", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "K-02 · exception handling",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/knowledge\?persona=leo$/);
    await page
      .getByRole("button", {
        name: "Open personal inbox · Leo Rivera",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/work\?persona=leo/);
    const actions = page.getByRole("region", { name: "Current work actions" });
    await expect(actions).toBeVisible();
    expect(
      await page.evaluate(() => {
        const h = document.querySelector(".coordination-workspace h1"),
          a = document.querySelector('[aria-label="Current work actions"]');
        return (
          !!h &&
          !!a &&
          !!(h.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING)
        );
      }),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

import { test, expect } from "@playwright/test";
for (const width of [640, 320])
  test(`worker reviewer operator reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/demos/human-contribution");
    await page
      .getByLabel("Contribution text")
      .fill("A readable guide with next steps.");
    await page.getByLabel("Delivery note", { exact: true }).fill("For review.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Review delivery" }).click();
    await expect(page.locator("#human-delivery-confirm-heading")).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/#/assignments/A-1042/overview");
    await page
      .getByRole("button", { name: "Submit assessment", exact: true })
      .click();
    await page
      .getByLabel("Decision rationale")
      .fill("Evidence still needs review.");
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Submit assessment", exact: true }),
    ).toBeFocused();
    await page.goto("/#/demos/sf-retained/20260913T153424Z-eb63b7bd05303482");
    await page
      .getByRole("button", {
        name: "Inspect source · Work-product response",
        exact: true,
      })
      .click();
    await expect(page.locator("#sf-source-product")).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
test("forced colors retain keyboard and decision boundaries", async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/#/demos/human-contribution");
  await page.getByLabel("Contribution text").focus();
  expect(
    await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
  ).toBe(true);
  await expect(page.getByLabel("Contribution text")).toBeFocused();
  const outline = await page
    .getByLabel("Contribution text")
    .evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none");
  await page.goto("/#/demos/sf-retained/20260913T153424Z-eb63b7bd05303482");
  await expect(
    page
      .getByRole("region", { name: "Accountability trace" })
      .getByText("Platform state admitted is not publication authorization.", {
        exact: false,
      }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Inspect source · Assignment", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#sf-source-assignment")).toBeFocused();
});

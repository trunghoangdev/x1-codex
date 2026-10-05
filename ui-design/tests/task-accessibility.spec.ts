import { test, expect } from "@playwright/test";
for (const width of [390, 1440])
  test(`worker keyboard focus survives confirmation delivery and revision ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/demos/human-contribution");
    const body = page.getByLabel("Contribution text");
    await body.fill("A guide with a next step.");
    await expect(body).toHaveAttribute(
      "aria-describedby",
      "human-contribution-requirement",
    );
    await page
      .getByLabel("Delivery note", { exact: true })
      .fill("Prepared for review.");
    await page.getByRole("checkbox").focus();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "Review delivery" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#human-delivery-confirm-heading")).toBeFocused();
    await page.getByRole("button", { name: "Keep editing" }).focus();
    await page.keyboard.press("Enter");
    await expect(body).toBeFocused();
    await page.getByRole("button", { name: "Review delivery" }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Record local delivery" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#human-command-status-heading")).toBeFocused();
    await page
      .getByRole("button", { name: "Simulate receiver receipt" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#human-receiver-heading")).toBeFocused();
    await expect(
      page.getByRole("status").filter({ hasText: "Delivered locally:" }),
    ).toContainText("human-receipt-v1");
    await page
      .getByRole("button", { name: "Simulate revision request" })
      .focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Prepare draft-02" }).focus();
    await page.keyboard.press("Enter");
    await expect(body).toBeFocused();
    await expect(body).toHaveValue("A guide with a next step.");
  });
test("operator trace source links preserve keyboard destination and do not imply authorization", async ({
  page,
}) => {
  await page.goto("/#/demos/sf-retained/20260913T153424Z-eb63b7bd05303482");
  const trace = page.getByRole("region", { name: "Accountability trace" });
  await trace
    .getByRole("button", { name: "Inspect source · Attempt", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#sf-source-attempt")).toBeFocused();
  await trace
    .getByRole("button", {
      name: "Inspect source · Work-product response",
      exact: true,
    })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#sf-source-product")).toBeFocused();
  await expect(
    trace.getByText(
      "Platform state admitted is not publication authorization.",
      { exact: false },
    ),
  ).toBeVisible();
});

import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`workstreams directory preserves filters and explicit signals at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organization");
    await page.getByRole("button", { name: "Browse workstreams" }).click();
    await expect(page).toHaveURL(/#\/organization\/workstreams$/);
    await expect(
      page.getByRole("heading", { name: "Workstreams", exact: true }),
    ).toBeFocused();
    await expect(page.getByRole("status")).toContainText("2 of 2 workstreams");
    await page
      .getByRole("combobox", { name: "Attention signal", exact: true })
      .selectOption("responsibility");
    await expect(page.getByRole("status")).toContainText("1 of 2 workstreams");
    await expect(
      page.getByRole("article", { name: "Team invitation improvements" }),
    ).toContainText("2 explicit gaps");
    await page
      .getByRole("combobox", { name: "Project", exact: true })
      .selectOption("Payments API");
    await expect(
      page.getByText("No matching workstreams.", { exact: false }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page
      .getByRole("combobox", { name: "Attention signal", exact: true })
      .selectOption("outcome");
    await expect(page.getByRole("status")).toContainText("2 of 2 workstreams");
    await page
      .getByRole("combobox", { name: "Project", exact: true })
      .selectOption("Team Workspace");
    await page
      .getByLabel("Search workstreams", { exact: true })
      .fill("expired");
    await expect(page.getByRole("status")).toContainText("1 of 2 workstreams");
    const filteredUrl = page.url();
    await page.reload();
    await expect(
      page.getByLabel("Search workstreams", { exact: true }),
    ).toHaveValue("expired");
    await expect(
      page.getByRole("combobox", { name: "Project", exact: true }),
    ).toHaveValue("Team Workspace");
    await expect(
      page.getByRole("combobox", { name: "Attention signal", exact: true }),
    ).toHaveValue("outcome");
    await page
      .getByRole("button", { name: "Open workstream · WS-02", exact: true })
      .click();
    await expect(page).toHaveURL(/#\/workstreams\/WS-02$/);
    await page
      .getByRole("button", { name: "Back to Workstreams", exact: true })
      .click();
    await expect(page).toHaveURL(filteredUrl);
    await expect(page.getByRole("status")).toContainText("1 of 2 workstreams");
    await page.goBack();
    await expect(page).toHaveURL(/#\/workstreams\/WS-02$/);
    await page.goBack();
    await expect(page).toHaveURL(filteredUrl);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(
      page.getByRole("article", { name: "Payment webhook reliability" }),
    ).toContainText("No explicit gap recorded");
    await page
      .getByRole("button", { name: "Open workstream · WS-01", exact: true })
      .click();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Back to Organization", exact: true }),
    ).toBeVisible();
    await page.goto("/#/organization/workstreams?signal=verified");
    await expect(page.getByRole("alert")).toContainText(
      "This link does not match",
    );
  });
}

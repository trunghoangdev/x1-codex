import { test, expect } from "@playwright/test";

for (const width of [320, 1440]) {
  test(`overview exposes goals, blockers and responsible people ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/organizations/knowledge");
    const overview = page.getByRole("region", {
      name: "Organization at a glance",
      exact: true,
    });
    await expect(overview).toBeVisible();
    await expect(
      page
        .getByText("Inspect detailed workstream coordination", { exact: true })
        .locator(".."),
    ).not.toHaveAttribute("open", "");
    await expect(overview.getByRole("article")).toHaveCount(2);
    const guide = overview.getByRole("article", {
      name: "Summary · K-01",
      exact: true,
    });
    await expect(guide).toContainText("Goal");
    await expect(guide).toContainText("Recorded outcome");
    await expect(guide).toContainText("Response pending:");
    await expect(guide).toContainText("known responsibility gap");
    const workshop = overview.getByRole("article", {
      name: "Summary · K-02",
      exact: true,
    });
    await expect(workshop).toContainText("Input missing:");
    await expect(workshop).toContainText("Leo");
    await expect(overview).toContainText("not urgency");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await workshop
      .getByRole("button", { name: "Inspect workstream · K-02", exact: true })
      .click();
    await expect(page).toHaveURL(/\/workstreams\/K-02/);
    await page.goBack();
    await overview
      .getByRole("button", {
        name: "Open complete workstream directory",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/workstreams(?:\?|$)/);
  });
}

test("larger overview bounds the scan and section navigation opens exact coordination", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/#/organizations/large");
  const overview = page.getByRole("region", {
    name: "Organization at a glance",
    exact: true,
  });
  await expect(overview.getByRole("article")).toHaveCount(4);
  await expect(overview).toContainText(
    "Showing 4 of 6 streams in source order",
  );
  await page
    .getByRole("navigation", { name: "Organization sections", exact: true })
    .getByRole("button", { name: "Goals & workstreams", exact: true })
    .click();
  await expect(page.locator("#org-goals")).toBeFocused();
  await expect(
    page
      .getByText("Inspect detailed workstream coordination", { exact: true })
      .locator(".."),
  ).toHaveAttribute("open", "");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

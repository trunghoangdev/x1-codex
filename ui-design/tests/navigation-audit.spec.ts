import { test, expect } from "@playwright/test";

for (const width of [320, 1440]) {
  test(`invalid links recover organization scope and empty lists remain navigable ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/#/organizations/knowledge/workflows/missing?persona=leo&coordQ=invalid",
    );
    await expect(
      page.getByRole("heading", {
        name: "This link does not match an available screen.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Good morning, Alex/ }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "Return to organization overview",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/knowledge\?persona=leo$/);
    await page.goto("/#/organizations/knowledge/workers?persona=leo");
    await page
      .getByRole("searchbox", { name: "Search workers", exact: true })
      .fill("missing-worker");
    await expect(page.getByText(/No matching workers/)).toBeVisible();
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await expect(
      page.getByRole("searchbox", { name: "Search workers", exact: true }),
    ).toHaveValue("");
    await page.goto("/#/organizations/unknown/outcomes/missing");
    await expect(
      page.getByRole("button", {
        name: "Return to organization overview",
        exact: true,
      }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "Open Software Factory overview",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/#\/organization$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
  test(`bounded use preserves persona and local inbox has an organization exit ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/use/K-01?persona=leo");
    await page
      .getByRole("button", { name: "Inspect K-01 workstream", exact: true })
      .click();
    await expect(page).toHaveURL(/workstreams\/K-01\?persona=leo$/);
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/use\/K-01\?persona=leo$/);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/workstreams\/K-01\?persona=leo$/);
    await page.goto(
      "/#/organizations/knowledge/work?persona=maya&useActor=owner",
    );
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/knowledge\?persona=maya$/);
  });
}

test("mobile navigation dismisses with Escape and closes after destination selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/#/organizations/knowledge/work?persona=leo");
  const toggle = page.getByRole("button", {
    name: "Toggle navigation",
    exact: true,
  });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Organization", exact: true })
    .click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/knowledge\?persona=leo$/);
});

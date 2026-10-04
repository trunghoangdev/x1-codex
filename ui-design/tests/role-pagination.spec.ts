import { test, expect } from "@playwright/test";
for (const width of [390, 1440]) {
  test(`role and nested records preserve context at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/#/organization/roles");
    await expect(page.locator(".org-stream-grid > article")).toHaveCount(4);
    await expect(page.getByRole("status")).toContainText(
      "7 of 7 roles · Showing 1–4",
    );
    await page.getByRole("button", { name: "Next roles", exact: true }).click();
    await expect(page.getByRole("status")).toBeFocused();
    await expect(page.locator(".org-stream-grid > article")).toHaveCount(3);
    const source = page.url();
    await page.reload();
    await expect(page).toHaveURL(source);
    await page
      .getByRole("button", {
        name: "Inspect role records · Release authority",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "A-1041", exact: false }).click();
    await page
      .getByRole("button", { name: "Back to Roles", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Inspect role records · Release authority",
        exact: true,
      }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(page).toHaveURL(/page=2/);
    await page
      .getByRole("searchbox", { name: "Search roles" })
      .fill("Developer");
    await expect(page).not.toHaveURL(/page=|detail=/);
    await expect(page.locator(".org-stream-grid > article")).toHaveCount(1);
    await page.goto("/#/organizations/large/roles?persona=sam&q=Reviewer");
    await page
      .getByRole("button", {
        name: "Inspect role records · Reviewer",
        exact: true,
      })
      .focus();
    await page.keyboard.press("Enter");
    const assignments = page.getByRole("region", {
      name: "Assignments",
      exact: true,
    });
    const bindings = page.getByRole("region", {
      name: "Bindings",
      exact: true,
    });
    await expect(assignments.locator(".org-stream-assignment")).toHaveCount(4);
    await expect(assignments).toContainText("6 records · Showing 1–4");
    await page
      .getByRole("button", { name: "Next assignments", exact: true })
      .click();
    await expect(assignments.locator(".org-stream-assignment")).toHaveCount(2);
    await expect(assignments.locator("p").first()).toBeFocused();
    await page
      .getByRole("button", { name: "Next bindings", exact: true })
      .click();
    await expect(bindings).toContainText("5 records · Showing 5–5");
    const nestedSource = page.url();
    await page.reload();
    await expect(assignments).toContainText("Showing 5–6");
    await expect(bindings).toContainText("Showing 5–5");
    await page.getByRole("button", { name: "L-05-R", exact: false }).click();
    await page
      .getByRole("button", { name: "Back to scenario context" })
      .click();
    await expect(page).toHaveURL(nestedSource);
    await expect(assignments).toContainText("Showing 5–6");
    await bindings.getByRole("button").first().click();
    await page
      .getByRole("button", { name: "Back to scenario context" })
      .click();
    await expect(page).toHaveURL(nestedSource);
    await page
      .getByRole("searchbox", { name: "Search roles" })
      .fill("missing-role");
    await page
      .getByRole("button", { name: "Show all roles", exact: true })
      .click();
    await expect(
      page.getByRole("searchbox", { name: "Search roles" }),
    ).toBeFocused();
    await expect(page.locator(".org-stream-grid > article")).toHaveCount(4);
    await page.goto("/#/organizations/large/roles?view=scope&persona=sam");
    await expect(page.locator(".org-stream-grid > article")).toHaveCount(4);
    await page
      .getByRole("button", { name: "Next scoped roles", exact: true })
      .click();
    await expect(page.getByRole("status")).toBeFocused();
    await page.reload();
    await expect(page).toHaveURL(/page=2/);
    await page
      .getByRole("combobox", { name: "Coverage workstream" })
      .selectOption("scope-L-02");
    await expect(page).not.toHaveURL(/page=/);
    await expect(page.getByRole("status")).toContainText(
      "4 of 4 scoped role requirements",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const path of [
      "/organization/roles?page=0",
      "/organizations/large/roles?assignmentsPage=1.5",
      "/organizations/knowledge/roles?detail=Reviewer",
    ]) {
      await page.goto(`/#${path}`);
      await expect(page.getByRole("alert")).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

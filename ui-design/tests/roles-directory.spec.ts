import { test, expect } from "@playwright/test";
import {
  mainOrganization,
  largeOrganization,
} from "../src/data/organizationScenario";
import { scenarioRoleRows } from "../src/data/roleDirectory";
test("role catalog keeps unbound definitions and explicit gap references", () => {
  for (const scenario of [mainOrganization, largeOrganization]) {
    const names = scenario.roles.map((r) => r.name);
    expect(new Set(names).size).toBe(names.length);
    for (const b of scenario.bindings) expect(names).toContain(b.role);
    for (const a of scenario.assignments) expect(names).toContain(a.role);
    for (const link of scenario.roleGaps) {
      expect(names).toContain(link.role);
      expect(scenario.gaps.map((g) => g.id)).toContain(link.gapId);
    }
  }
  const synthetic = {
    ...mainOrganization,
    roles: [
      ...mainOrganization.roles,
      {
        name: "Unallocated responsibility",
        purpose: "Test catalog independence",
      },
    ],
  };
  const row = scenarioRoleRows(synthetic).find(
    (r) => r.name === "Unallocated responsibility",
  )!;
  expect(row.bindings).toHaveLength(0);
  expect(row.assignments).toHaveLength(0);
});
for (const width of [390, 1440])
  test(`role responsibility navigation ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organization");
    await page
      .getByRole("button", { name: "Browse roles", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Roles", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toContainText("7 of 7 roles");
    await page.getByLabel("Responsibility coverage").selectOption("gaps");
    await expect(page.getByRole("status")).toContainText("2 of 7 roles");
    const developer = page.getByRole("article", {
      name: "Developer",
      exact: true,
    });
    await developer
      .getByRole("button", {
        name: "Inspect role records · Developer",
        exact: true,
      })
      .click();
    await expect(developer).toContainText("Payment webhook reliability");
    await expect(developer).toContainText("Invitation implementation");
    await developer
      .getByRole("button", { name: "Inspect gap workstream" })
      .click();
    await page
      .getByRole("button", { name: "Back to Roles", exact: true })
      .click();
    await expect(page.getByLabel("Responsibility coverage")).toHaveValue(
      "gaps",
    );
    await page
      .getByRole("button", {
        name: "Inspect role records · Reviewer",
        exact: true,
      })
      .click();
    await page
      .getByRole("article", { name: "Reviewer", exact: true })
      .getByRole("button", { name: "Alex Morgan" })
      .click();
    await page
      .getByRole("button", { name: "Back to Roles", exact: true })
      .click();
    await page.getByRole("button", { name: "A-1042", exact: false }).click();
    await page
      .getByRole("button", { name: "Back to Roles", exact: true })
      .click();
    await page.reload();
    await expect(page.getByLabel("Responsibility coverage")).toHaveValue(
      "gaps",
    );
    await page
      .getByLabel("Responsibility coverage")
      .selectOption("no-assignments");
    await expect(page.getByRole("status")).toContainText("3 of 7 roles");
    await page.getByLabel("Search roles").pressSequentially("impossible");
    await expect(page.getByLabel("Search roles")).toBeFocused();
    await page.getByRole("button", { name: "Show all roles" }).click();
    await expect(page.getByLabel("Search roles")).toBeFocused();
    await page.goto("/#/organizations/large");
    await page
      .getByRole("button", { name: "Browse roles", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("5 of 5 roles");
    await page.getByLabel("Responsibility coverage").selectOption("gaps");
    await expect(page.getByRole("status")).toContainText("1 of 5 roles");
    await page
      .getByRole("button", {
        name: "Inspect role records · Reviewer",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("article", { name: "Reviewer", exact: true }),
    ).toContainText("Unassigned");
    await page.getByRole("button", { name: "L-02-R", exact: false }).click();
    await expect(page).toHaveURL(/organizations\/large\/assignments\/L-02-R/);
    await page
      .getByRole("button", { name: "Back to scenario context" })
      .click();
    await expect(page.getByLabel("Responsibility coverage")).toHaveValue(
      "gaps",
    );
    await page.reload();
    await expect(page.getByRole("status")).toContainText("1 of 5 roles");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/#/organization/roles?coverage=invalid");
    await expect(
      page.getByRole("heading", { name: "Roles", exact: true }),
    ).toHaveCount(0);
  });

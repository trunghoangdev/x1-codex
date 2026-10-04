import { test, expect } from "@playwright/test";
import { validScenarioPath } from "../src/ScenarioWorkspace";

test("scenario evidence routes validate selected persona and scope", () => {
  expect(
    validScenarioPath("/organizations/knowledge/evidence?persona=leo"),
  ).toBe(true);
  expect(validScenarioPath("/organizations/large/evidence?persona=sam")).toBe(
    true,
  );
  expect(
    validScenarioPath("/organizations/knowledge/evidence?persona=sam"),
  ).toBe(false);
  expect(validScenarioPath("/organizations/knowledge/evidence/A-1042")).toBe(
    false,
  );
});
for (const width of [390, 1440]) {
  test(`scenario switch, evidence and durable return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/#/organizations/knowledge/work?persona=leo");
    if (width === 390)
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: "Evidence", exact: true })
      .click();
    await expect(page).toHaveURL(/knowledge\/evidence\?persona=leo$/);
    await expect(
      page.getByRole("heading", { name: "No evidence artifacts represented" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Evidence, connected." }),
    ).toHaveCount(0);
    await page.reload();
    await expect(
      page.getByRole("combobox", { name: "Sample persona", exact: true }),
    ).toHaveValue("leo");
    await page
      .getByRole("combobox", { name: "Sample organization", exact: true })
      .selectOption("large");
    await expect(page).toHaveURL(/large\/evidence\?persona=sam$/);
    await expect(
      page.getByRole("region", { name: "Scenario evidence" }),
    ).toContainText("Larger sample organization");
    await page
      .getByRole("combobox", { name: "Sample organization", exact: true })
      .selectOption("main");
    await expect(page).toHaveURL(/#\/evidence$/);
    await expect(
      page.getByRole("heading", { name: "Evidence, connected." }),
    ).toBeVisible();
    await page
      .getByRole("combobox", { name: "Sample organization", exact: true })
      .selectOption("knowledge");
    await expect(page).toHaveURL(/knowledge\/evidence\?persona=maya$/);
    await page
      .getByRole("button", {
        name: "Browse evidence requirements",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/knowledge\/workstreams\?persona=maya$/);
    await page
      .getByRole("combobox", { name: "Sample organization", exact: true })
      .selectOption("large");
    await expect(page).toHaveURL(/large\?persona=sam$/);
    await page.goto(
      "/#/organizations/knowledge/work?persona=maya&status=waiting",
    );
    const queue = page.url();
    await page
      .getByRole("button", {
        name: "Inspect my assignment · K-02-E",
        exact: true,
      })
      .click();
    const assignment = page.url();
    await page
      .getByRole("button", { name: "Inspect scenario workstream", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Inspect scenario assignment · K-02-E",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/workstreams\/K-02\?persona=maya$/);
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(assignment);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(queue);
    // Fresh direct-link fallbacks, with no remembered source for this persona.
    await page.goto(
      "/#/organizations/knowledge/assignments/K-02-C?persona=leo",
    );
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/workstreams\/K-02\?persona=leo$/);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/workstreams\?persona=leo$/);
    await page.goto("/#/organizations/knowledge/workers/maya?persona=leo");
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/workers\?persona=leo$/);
    // Foreign or malformed storage must never restore another organization.
    await page.evaluate(() =>
      sessionStorage.setItem(
        "forge-scenario-return-v1:knowledge:leo",
        JSON.stringify([
          {
            destination: "/organizations/knowledge/assignments/K-02-C",
            source: "/organizations/large/work?persona=sam",
          },
        ]),
      ),
    );
    await page.goto(
      "/#/organizations/knowledge/assignments/K-02-C?persona=leo",
    );
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/knowledge\/workstreams\/K-02\?persona=leo$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

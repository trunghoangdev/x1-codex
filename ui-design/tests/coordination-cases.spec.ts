import { test, expect } from "@playwright/test";
import { knowledgeOrganization as scenario } from "../src/data/knowledgeOrganization";
import { mainOrganization } from "../src/data/organizationScenario";
import {
  coordinationCases,
  filteredCases,
  defaultCaseFilters,
} from "../src/data/coordinationCases";
import { validScenarioPath } from "../src/ScenarioWorkspace";
test("cases keep follow-up ownership and closure distinct from allocation and history", () => {
  const cases = coordinationCases(scenario);
  expect(cases).toHaveLength(2);
  expect(cases[0].owner.state).toBe("assigned");
  expect(cases[1].owner.state).toBe("unknown");
  expect(coordinationCases({ ...scenario, bindings: [] })).toEqual(cases);
  expect(coordinationCases(mainOrganization)).toEqual([]);
  expect(
    filteredCases(scenario, { ...defaultCaseFilters, owner: "unknown" }).map(
      (c) => c.id,
    ),
  ).toEqual(["guide-publication-policy"]);
  expect(scenario.dependencies[0].receipt).toBe("unconfirmed");
  expect(
    validScenarioPath(
      "/organizations/knowledge/cases/current-workshop-brief?persona=leo",
    ),
  ).toBe(true);
  for (const path of [
    "/organizations/large/cases",
    "/organizations/knowledge/cases/not-a-case",
    "/organizations/knowledge/cases?caseOwner=available",
    "/organizations/knowledge/work?caseNeed=input",
  ])
    expect(validScenarioPath(path)).toBe(false);
});
for (const width of [390, 1440])
  test(`case source, filters and refreshed return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge?persona=leo&coordSignal=input");
    const overview = page.url();
    await page
      .getByRole("button", { name: "Browse coordination cases", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Coordination cases", exact: true }),
    ).toBeFocused();
    await page
      .getByRole("combobox", { name: "Follow-up ownership", exact: true })
      .selectOption("assigned");
    const source = page.url();
    await page
      .getByRole("button", {
        name: "Inspect coordination case · current-workshop-brief",
        exact: true,
      })
      .click();
    const detail = page.url();
    await expect(
      page.getByRole("region", { name: "Case follow-up" }),
    ).toContainText("Leo Rivera");
    await expect(
      page.getByRole("region", { name: "Case closure requirements" }),
    ).toContainText("workshop-brief-v0");
    await page
      .getByRole("button", {
        name: "Inspect supplying responsibility · K-02-C",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(detail);
    await page
      .getByRole("button", { name: "Inspect follow-up owner", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(source);
    await page.reload();
    await expect(
      page.getByRole("combobox", { name: "Follow-up ownership", exact: true }),
    ).toHaveValue("assigned");
    await page
      .getByRole("combobox", { name: "Follow-up ownership", exact: true })
      .selectOption("unknown");
    await page
      .getByRole("button", {
        name: "Inspect coordination case · guide-publication-policy",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", { name: "Case follow-up" }),
    ).toContainText("Follow-up owner unknown");
    await page
      .getByRole("button", {
        name: "Inspect decision requirement · guide-publication-responsibility",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/cases\/guide-publication-policy/);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await page
      .getByRole("searchbox", {
        name: "Search coordination cases",
        exact: true,
      })
      .fill("no matching case");
    await page
      .getByRole("button", { name: "Show all cases", exact: true })
      .click();
    await expect(
      page.getByRole("searchbox", {
        name: "Search coordination cases",
        exact: true,
      }),
    ).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(overview);
    await page.goto("/#/organizations/knowledge/cases/current-workshop-brief");
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/knowledge\/cases/);
  });

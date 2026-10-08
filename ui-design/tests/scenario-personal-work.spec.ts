import { test, expect } from "@playwright/test";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { largeOrganization } from "../src/data/organizationScenario";
import {
  defaultScenarioWorkFilters as defaults,
  scenarioPersonalWork,
} from "../src/data/scenarioWork";
import { validScenarioPath } from "../src/ScenarioWorkspace";
test("personal work uses explicit allocations and overlapping flags", () => {
  expect(
    scenarioPersonalWork(knowledgeOrganization, "maya").allocated.map(
      (a) => a.id,
    ),
  ).toEqual(["K-01-E", "K-02-E"]);
  expect(
    scenarioPersonalWork(knowledgeOrganization, "maya", {
      ...defaults,
      status: "waiting",
    }).shown.map((a) => a.id),
  ).toEqual(["K-02-E"]);
  expect(
    scenarioPersonalWork(largeOrganization, "sam").allocated.map((a) => a.id),
  ).toEqual(["L-03-R", "L-06-R"]);
  expect(scenarioPersonalWork(largeOrganization, "sam").response).toBe(2);
  expect(
    scenarioPersonalWork(largeOrganization, "jamie").allocated,
  ).toHaveLength(0);
  for (const p of largeOrganization.personas!)
    expect(
      largeOrganization.workers.find((w) => w.id === p.workerId)?.category,
    ).toBe("human");
  const overlapping = {
    ...knowledgeOrganization,
    assignments: knowledgeOrganization.assignments.map((a) =>
      a.id === "K-02-E" ? { ...a, responseNeeded: true } : a,
    ),
  };
  const result = scenarioPersonalWork(overlapping, "maya", {
    ...defaults,
    status: "both",
  });
  expect(result.allocated).toHaveLength(2);
  expect(result.response).toBe(2);
  expect(result.waiting).toBe(1);
  expect(result.both).toBe(1);
  expect(result.shown.map((a) => a.id)).toEqual(["K-02-E"]);
  expect(scenarioPersonalWork(knowledgeOrganization, "maya").response).toBe(1);
  expect(
    validScenarioPath(
      "/organizations/large/work?persona=sam&role=Reviewer&stream=L-06&status=response",
    ),
  ).toBe(true);
  for (const path of [
    "/organizations/knowledge/work?status=invalid",
    "/organizations/knowledge/work?role=Reviewer",
    "/organizations/knowledge/work?stream=L-06",
    "/organizations/large/work?persona=maya",
  ]) {
    expect(validScenarioPath(path)).toBe(false);
  }
});
for (const width of [390, 1440])
  test(`shared personal queue filters and empty allocation ${width}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/work?persona=maya");
    const results = page.locator(".personal-queue-results"),
      search = page.getByRole("searchbox", {
        name: "Search my work",
        exact: true,
      });
    await expect(results).toHaveText("2 of 2 allocated assignments shown");
    await expect(page.locator(".personal-queue-note")).toContainText(
      "they are not added together",
    );
    await page
      .getByRole("combobox", { name: "Work attention", exact: true })
      .selectOption("waiting");
    await page
      .getByRole("combobox", { name: "Assignment role", exact: true })
      .selectOption("Editor");
    await page
      .getByRole("combobox", { name: "Workstream", exact: true })
      .selectOption("K-02");
    await search.pressSequentially("outline");
    await expect(search).toBeFocused();
    await expect(results).toHaveText("1 of 2 allocated assignments shown");
    await expect(page).toHaveURL(/status=waiting/);
    await page
      .getByRole("button", {
        name: "Inspect my assignment · K-02-E",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(search).toHaveValue("outline");
    await expect(
      page.getByRole("combobox", { name: "Work attention", exact: true }),
    ).toHaveValue("waiting");
    await page
      .getByRole("button", { name: "View shared goal · K-02", exact: true })
      .click();
    await page.goBack();
    await expect(
      page.getByRole("combobox", { name: "Workstream", exact: true }),
    ).toHaveValue("K-02");
    await page.reload();
    await expect(search).toHaveValue("outline");
    await expect(results).toHaveText("1 of 2 allocated assignments shown");
    await search.fill("no matching request");
    await expect(results).toHaveText("0 of 2 allocated assignments shown");
    await page
      .getByRole("button", { name: "Show all my work", exact: true })
      .click();
    await expect(search).toBeFocused();
    await expect(results).toHaveText("2 of 2 allocated assignments shown");
    await expect(page).toHaveURL(/work\?persona=maya$/);
    await page
      .getByRole("combobox", { name: "Work attention", exact: true })
      .selectOption("both");
    await expect(results).toHaveText("0 of 2 allocated assignments shown");
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("leo");
    await expect(
      page.getByRole("heading", { name: "My Work · Leo Rivera", exact: true }),
    ).toBeFocused();
    await expect(
      page.getByRole("combobox", { name: "Work attention", exact: true }),
    ).toHaveValue("all");
    await expect(results).toHaveText("3 of 3 allocated assignments shown");
    await expect(
      page.getByRole("article", { name: "K-02-E", exact: true }),
    ).toHaveCount(0);
    await page.goto("/#/organizations/large");
    await page
      .getByRole("button", {
        name: "Open My Work · Sam Rivera",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: "My Work · Sam Rivera", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("region", {
          name: "Personal workspace context",
          exact: true,
        })
        .getByRole("status"),
    ).toHaveText(
      "2 assignments · 2 awaiting your response · 0 waiting for input",
    );
    await expect(
      page.getByRole("article", { name: "L-06-R", exact: true }),
    ).toContainText("No input records represented");
    await page
      .getByRole("combobox", { name: "Work attention", exact: true })
      .selectOption("response");
    await page
      .getByRole("combobox", { name: "Workstream", exact: true })
      .selectOption("L-06");
    await expect(results).toHaveText("1 of 2 allocated assignments shown");
    await page
      .getByRole("button", {
        name: "Inspect my assignment · L-06-R",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", { name: "Submit assessment", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Workstream", exact: true }),
    ).toHaveValue("L-06");
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("jamie");
    await expect(
      page.getByRole("region", { name: "No allocated work", exact: true }),
    ).toContainText("does not mean you are idle or available");
    await expect(results).toHaveText("0 of 0 allocated assignments shown");
    await expect(
      page.getByRole("combobox", { name: "Work attention", exact: true }),
    ).toHaveValue("all");
    await page
      .getByRole("button", { name: "Inspect my responsibilities", exact: true })
      .click();
    await expect(
      page.getByText("Planner · All streams", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await page.reload();
    await expect(
      page.getByRole("combobox", { name: "Sample persona", exact: true }),
    ).toHaveValue("jamie");
    if (width === 390)
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .click();
    await page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("button", { name: "Organization", exact: true })
      .click();
    await expect(page).toHaveURL(/large\?persona=jamie$/);
    if (width === 390)
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .click();
    await page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("button", { name: /My Work/ })
      .click();
    await expect(
      page.getByRole("heading", { name: "My Work · Jamie Chen", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".tiny-avatar")).toHaveText("JC");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Return to main organization", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Open My Work · Alex", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: /A-1042.*Review retry/ }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });

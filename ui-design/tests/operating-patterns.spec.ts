import { test, expect } from "@playwright/test";
import { operatingPattern } from "../src/data/operatingPatterns";
import { knowledgeOrganization as scenario } from "../src/data/knowledgeOrganization";
import { mainOrganization } from "../src/data/organizationScenario";
import { validScenarioPath } from "../src/ScenarioWorkspace";

test("patterns use explicit scoped associations and supply no inferred policy", () => {
  const guide = operatingPattern(scenario, "K-01")!;
  const workshop = operatingPattern(scenario, "K-02")!;
  expect(guide.pattern.id).not.toBe(workshop.pattern.id);
  expect(guide.parallelIds).toEqual(["guide-research-and-criteria"]);
  expect(workshop.dependencyIds).toEqual(["workshop-brief-input"]);
  expect(guide.pattern.policy.state).toBe("unknown");
  expect(operatingPattern({ ...scenario, bindings: [] }, "K-01")).toEqual(
    guide,
  );
  expect(operatingPattern(mainOrganization, "K-01")).toBeUndefined();
  expect(operatingPattern(scenario, "missing")).toBeUndefined();
  expect(scenario.dependencies[0].receipt).toBe("unconfirmed");
  expect(
    validScenarioPath("/organizations/knowledge/patterns/K-01?persona=leo"),
  ).toBe(true);
  for (const path of [
    "/organizations/large/patterns/K-01",
    "/organizations/knowledge/patterns/missing",
    "/organizations/knowledge/patterns/K-01?agreementVersion=brief-v1",
  ])
    expect(validScenarioPath(path)).toBe(false);
});
for (const width of [390, 1440])
  test(`pattern comparison and refreshed source return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/workflows/K-01?persona=leo");
    const workflow = page.url();
    await page
      .getByRole("button", {
        name: "Inspect operating pattern and policy",
        exact: true,
      })
      .click();
    const detail = page.url();
    await expect(
      page.getByRole("heading", {
        name: "Operating pattern · Research and editorial preparation",
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.getByRole("region", { name: "Pattern and instance comparison" }),
    ).toContainText("guide-research-and-criteria");
    await expect(
      page.getByRole("region", { name: "Decision and escalation policy" }),
    ).toContainText("recipient not supplied");
    await page
      .getByRole("button", {
        name: "Inspect related assignment · K-01-D",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(detail);
    await page
      .getByRole("button", {
        name: "Inspect publication decision requirement",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(detail);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(workflow);
    await page.goto("/#/organizations/knowledge/patterns/K-02?persona=leo");
    const workshop = page.url();
    await expect(
      page.getByRole("region", { name: "Pattern and instance comparison" }),
    ).toContainText("missing · receipt · unconfirmed");
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
    await expect(page).toHaveURL(workshop);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/knowledge\/workstreams\/K-02/);
  });

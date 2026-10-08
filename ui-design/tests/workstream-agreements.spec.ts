import { test, expect } from "@playwright/test";
import { validScenarioPath } from "../src/ScenarioWorkspace";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { agreementVersions } from "../src/data/workstreamAgreements";

test("agreement routes isolate scope and reject foreign versions", () => {
  expect(agreementVersions[1].previousId).toBe(agreementVersions[0].id);
  expect(knowledgeOrganization.evidence).toEqual([]);
  expect(
    validScenarioPath(
      "/organizations/knowledge/agreements/K-01?agreementVersion=brief-v1&compare=yes&persona=leo",
    ),
  ).toBe(true);
  for (const path of [
    "/organizations/large/agreements/K-01",
    "/organizations/knowledge/agreements/K-02",
    "/organizations/knowledge/agreements/K-01?agreementVersion=workshop-brief-v0",
    "/organizations/knowledge/agreements/K-01?compare=approved",
    "/organizations/knowledge/work?agreementVersion=brief-v1",
  ])
    expect(validScenarioPath(path)).toBe(false);
});
for (const width of [390, 1440])
  test(`agreement comparison and refreshed source return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/workstreams/K-01?persona=leo");
    const origin = page.url();
    await page
      .getByRole("button", {
        name: "Inspect proposed workstream agreement",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Proposed workstream agreement",
        exact: true,
      }),
    ).toBeFocused();
    await page
      .getByRole("combobox", { name: "Comparison", exact: true })
      .selectOption("yes");
    await expect(
      page.getByRole("region", { name: "Scope brief-v1", exact: true }),
    ).toContainText("one internal onboarding cohort");
    await expect(
      page.getByRole("region", { name: "Scope brief-v2", exact: true }),
    ).toContainText("several internal teams");
    await expect(
      page.getByRole("region", { name: "Version applicability", exact: true }),
    ).toContainText("No assignment or evidence applicability mapping");
    const agreement = page.url();
    await page
      .getByRole("button", {
        name: "Inspect assignment context · K-01-E",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(agreement);
    await page
      .getByRole("button", {
        name: "Inspect outcome requirements",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(agreement);
    await page
      .getByRole("combobox", { name: "Proposed brief version", exact: true })
      .selectOption("brief-v1");
    await expect(page.getByRole("status", { name: "Agreement selection" })).toContainText(
      "No authored predecessor",
    );
    await expect(
      page.getByRole("region", { name: "Scope brief-v2", exact: true }),
    ).toHaveCount(0);
    await page.reload();
    await expect(
      page.getByRole("combobox", {
        name: "Proposed brief version",
        exact: true,
      }),
    ).toHaveValue("brief-v1");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(origin);
  });

import { test, expect } from "@playwright/test";
import { decisionRequests } from "../src/data/decisionRequests";
import {
  mainOrganization,
  largeOrganization,
} from "../src/data/organizationScenario";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { validScenarioPath } from "../src/ScenarioWorkspace";
test("decision requests are authored, scoped and distinguish absent policy from gaps", () => {
  const main = decisionRequests(mainOrganization),
    knowledge = decisionRequests(knowledgeOrganization);
  expect(main[0].allocation).toEqual({
    state: "allocated",
    workerId: "alex",
    role: "Release authority",
    assignmentId: "A-1041",
  });
  expect(knowledge[0].allocation.state).toBe("unknown");
  expect(knowledge[0].policy.state).toBe("unknown");
  expect(knowledge[0].source.gapId).toBe("knowledge-publication");
  expect(main[0].escalation).toBeUndefined();
  expect(knowledge[0].requester).toBeUndefined();
  expect(decisionRequests({ ...knowledgeOrganization, bindings: [] })).toEqual(
    knowledge,
  );
  expect(decisionRequests(largeOrganization)).toEqual([]);
  expect(
    validScenarioPath("/organizations/knowledge/decisions?persona=leo"),
  ).toBe(true);
});
for (const width of [390, 1440]) {
  test(`knowledge decision source and empty larger ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/#/organizations/knowledge?persona=leo&coordSignal=responsibility",
    );
    const overview = page.url();
    await page
      .getByRole("button", {
        name: "Inspect decision responsibility",
        exact: true,
      })
      .click();
    const directory = page.url();
    await expect(
      page.getByRole("heading", {
        name: "Decision responsibility",
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.getByRole("region", { name: "Decision allocation" }),
    ).toContainText("Decision allocation unknown");
    await expect(
      page.getByRole("region", { name: "Decision policy" }),
    ).toContainText("Policy unknown");
    await expect(
      page.getByRole("region", { name: "Decision escalation" }),
    ).toContainText("Escalation contact and policy not represented");
    await page
      .getByText("Inspect decision source · guide-publication-responsibility", {
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "Inspect decision requirement source · knowledge-publication",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(directory);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(overview);
    await page.goto("/#/organizations/large/decisions?persona=sam");
    await expect(
      page.getByRole("heading", {
        name: "No decision records represented",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
  test(`main decision subject, readiness and source return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organization?coordQ=payment");
    const overview = page.url();
    await page
      .getByRole("button", {
        name: "Inspect decision responsibility",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", { name: "Decision subject" }),
    ).toContainText("Production · Payments API");
    await expect(
      page.getByRole("region", { name: "Decision allocation" }),
    ).toContainText("Alex Morgan");
    await page
      .getByRole("button", {
        name: "Inspect decision worker · Alex Morgan",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "Back to Decision responsibility",
        exact: true,
      })
      .click();
    await page
      .getByText("Inspect decision source · release-v182-decision", {
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "Inspect decision assignment · A-1041",
        exact: true,
      })
      .click();
    await page
      .getByLabel("Preview release prerequisites")
      .locator("xpath=ancestor::details[1]")
      .locator("summary")
      .click();
    await page
      .getByLabel("Preview release prerequisites")
      .selectOption("revoked");
    await page
      .getByRole("button", {
        name: "Back to Decision responsibility",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", { name: "Decision allocation" }),
    ).toContainText("release authority is no longer valid");
    await page
      .getByRole("button", { name: "Back to Organization", exact: true })
      .click();
    await expect(page).toHaveURL(overview);
    await page.goto("/#/organization/decisions");
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "Decision responsibility",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

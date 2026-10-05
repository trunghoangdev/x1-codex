import { test, expect } from "@playwright/test";
import { knowledgeOrganization as scenario } from "../src/data/knowledgeOrganization";
import { mainOrganization } from "../src/data/organizationScenario";
import { workflowMap } from "../src/data/workflowMap";
import { validScenarioPath } from "../src/ScenarioWorkspace";

test("workflow links use explicit references, never card order or gap-created tasks", () => {
  const guide = workflowMap(scenario, "K-01"),
    workshop = workflowMap(scenario, "K-02");
  expect(guide.dependencies).toHaveLength(0);
  expect(guide.parallelWork[0].assignmentIds).toEqual(["K-01-D", "K-01-E"]);
  expect(guide.assignments).toHaveLength(3);
  expect(guide.gaps.map((g) => g.id)).toEqual(["knowledge-publication"]);
  expect(
    workshop.dependencies.map((d) => [
      d.id,
      d.provider,
      d.receiverAssignmentId,
    ]),
  ).toEqual([["workshop-brief-input", { assignmentId: "K-02-C" }, "K-02-E"]]);
  expect(
    workshop.assignments.find((a) => a.id === "K-02-F")?.workerId,
  ).toBeUndefined();
  const reordered = {
    ...scenario,
    assignments: [...scenario.assignments].reverse(),
    flows: {},
  };
  expect(workflowMap(reordered, "K-02").dependencies).toEqual(
    workshop.dependencies,
  );
  expect(
    workflowMap({ ...scenario, dependencies: [] }, "K-02").dependencies,
  ).toHaveLength(0);
  expect(
    workflowMap({ ...scenario, assignments: [] }, "K-02").dependencies,
  ).toHaveLength(0);
  expect(
    workflowMap(mainOrganization, "WS-01").dependencies[0].provider,
  ).toEqual({ workerId: "codex", role: "Developer" });
  expect(
    validScenarioPath("/organizations/knowledge/workflows/K-02?persona=leo"),
  ).toBe(true);
  expect(validScenarioPath("/organizations/knowledge/workflows/WS-01")).toBe(
    false,
  );
  expect(validScenarioPath("/organizations/large/workflows/L-01")).toBe(true);
});
for (const width of [390, 1440]) {
  test(`knowledge workflow map relationships and refreshed return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/#/organizations/knowledge?persona=leo&coordSignal=input");
    const overview = page.url();
    await page
      .getByRole("button", { name: "Explore workstream · K-02", exact: true })
      .click();
    const stream = page.url();
    await page
      .getByRole("button", {
        name: "Explore workflow & exchanges",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Workflow · Member learning workshop",
        exact: true,
      }),
    ).toBeFocused();
    const map = page.url();
    const nodes = page
      .getByRole("region", { name: "Workflow responsibilities" })
      .getByRole("listitem");
    await expect(nodes).toHaveCount(3);
    await expect(nodes.filter({ hasText: "K-02-F" })).toContainText(
      "Unassigned",
    );
    const exchanges = page.getByRole("region", {
      name: "Coordination inputs",
      exact: true,
    });
    await expect(exchanges).toContainText("Delivery / receipt: Unconfirmed");
    await exchanges
      .getByRole("button", {
        name: "Inspect supplying assignment · K-02-C",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(map);
    await exchanges
      .getByRole("button", {
        name: "Inspect receiving assignment · K-02-E",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Inspect map worker · Maya Patel",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(map);
    await page
      .getByRole("button", {
        name: "Review workflow outcome evidence",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(map);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(stream);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(overview);
    await page.goto("/#/organizations/knowledge/workflows/K-01?persona=maya");
    await expect(
      page.getByRole("region", { name: "Workflow relationships" }),
    ).toContainText(
      "0 explicit input relationships · 1 declared parallel groups",
    );
    await expect(
      page.getByRole("region", { name: "Workflow responsibility gaps" }),
    ).toContainText("Publication review responsibility");
    await expect(
      page
        .getByRole("region", { name: "Workflow responsibilities" })
        .getByRole("listitem"),
    ).toHaveCount(3);
    await page
      .getByRole("button", {
        name: "Inspect map assignment · K-01-E",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/workflows\/K-01/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/workstreams\/K-01/);
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`larger software workflow source return ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/large?persona=sam&coordQ=invitation");
    const overview = page.url();
    await page
      .getByRole("button", { name: "Explore workstream · L-02", exact: true })
      .click();
    const stream = page.url();
    await page
      .getByRole("button", {
        name: "Explore workflow & exchanges",
        exact: true,
      })
      .click();
    const map = page.url();
    await expect(
      page.getByRole("region", { name: "Workflow responsibilities" }),
    ).toContainText("Unassigned");
    await expect(
      page.getByRole("region", { name: "Workflow relationships" }),
    ).toContainText("0 explicit input relationships");
    await page
      .getByRole("button", {
        name: "Inspect map assignment · L-02-R",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(map);
    await page
      .getByRole("button", { name: /Inspect gap source/ })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(map);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(stream);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(overview);
    await page.goto("/#/organizations/large/workflows/L-01?persona=sam");
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(/workstreams\/L-01/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
  test(`main software workflow local response and provider ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organization?coordQ=payment&coordSignal=response");
    const source = page.url();
    await page
      .getByRole("button", { name: "Explore workstream · WS-01", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Explore workflow & exchanges",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/workflows\/WS-01/);
    await expect(page.locator("header.topbar")).toContainText(
      "Workflow · Payment webhook reliability",
    );
    await expect(
      page
        .getByRole("region", { name: "Workflow responsibilities" })
        .getByRole("listitem"),
    ).toHaveCount(1);
    const inputs = page.getByRole("region", {
      name: "Coordination inputs",
      exact: true,
    });
    await expect(inputs).toContainText("No provider assignment represented.");
    await inputs
      .getByRole("button", {
        name: "Inspect provider worker · Codex worker",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to Workflow", exact: true })
      .click();
    await expect(page).toHaveURL(/workflows\/WS-01/);
    await page
      .getByRole("button", {
        name: "Inspect map assignment · A-1042",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Submit assessment", exact: true })
      .click();
    await page
      .getByLabel("Decision rationale")
      .fill(
        "Assessment recorded; transfer and production outcome remain unconfirmed.",
      );
    await page
      .getByLabel("Assessment conclusion", { exact: true })
      .selectOption("Meets criteria");
    await page.getByRole("button", { name: "Record assessment" }).click();
    await page
      .getByRole("button", { name: "Back to Workflow", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Workflow responsibilities" }),
    ).toContainText("Local response recorded · flow has not advanced");
    await expect(inputs).toContainText(
      "Local response recorded; this does not establish input delivery or receipt.",
    );
    await expect(inputs).toContainText("Delivery / receipt: Unconfirmed");
    await page
      .getByRole("button", {
        name: "Inspect map response · A-1042",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/assignments\/A-1042\/activity/);
    await page
      .getByRole("button", { name: "Back to Workflow", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Review workflow outcome evidence",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: "Not verified", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to Workflow", exact: true })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Back to workstream", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Back to Organization", exact: true })
      .click();
    await expect(page).toHaveURL(source);
    await page.goto("/#/workflows/WS-02");
    await page
      .getByRole("button", { name: /Inspect gap source/ })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Back to Workflow", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Back to workstream", exact: true })
      .click();
    await expect(page).toHaveURL(/workstreams\/WS-02/);
    await page
      .getByRole("button", { name: "Back to Organization", exact: true })
      .click();
    await expect(page).toHaveURL(/organization$/);
    await page.goto("/#/workflows/not-a-stream");
    await expect(page.getByRole("alert")).toBeVisible();
  });
}

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
  expect(validScenarioPath("/organizations/large/workflows/L-01")).toBe(false);
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

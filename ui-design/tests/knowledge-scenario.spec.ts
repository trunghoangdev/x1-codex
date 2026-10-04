import { test, expect } from "@playwright/test";
import { knowledgeOrganization as scenario } from "../src/data/knowledgeOrganization";
import { validScenarioPath } from "../src/ScenarioWorkspace";
import { scenarioRoleRows } from "../src/data/roleDirectory";
import { scenarioAttention } from "../src/data/scenarioAttention";
test("knowledge scenario uses explicit references and personal allocations", () => {
  const workers = scenario.workers.map((w) => w.id),
    roles = scenario.roles.map((r) => r.name),
    streams = scenario.streams.map((s) => s.id),
    ids = scenario.assignments.map((a) => a.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const p of scenario.personas!) expect(workers).toContain(p.workerId);
  for (const b of scenario.bindings) {
    expect(workers).toContain(b.workerId);
    expect(roles).toContain(b.role);
  }
  for (const a of scenario.assignments) {
    expect(roles).toContain(a.role);
    expect(streams).toContain(a.streamId);
    if (a.workerId) expect(workers).toContain(a.workerId);
    expect(a.input).toBeTruthy();
    expect(a.expectedResponse).toBeTruthy();
  }
  for (const s of scenario.streams)
    for (const id of s.assignmentIds)
      expect(scenario.assignments.find((a) => a.id === id)?.streamId).toBe(
        s.id,
      );
  for (const g of scenario.roleGaps) {
    expect(roles).toContain(g.role);
    expect(scenario.gaps.map((g) => g.id)).toContain(g.gapId);
  }
  for (const o of scenario.outcomes) expect(streams).toContain(o.streamId);
  for (const [id, steps] of Object.entries(scenario.flows)) {
    expect(streams).toContain(id);
    for (const step of steps) expect(ids).toContain(step.assignmentId);
  }
  expect(
    scenarioRoleRows(scenario)
      .filter((r) => !r.bindings.length)
      .map((r) => r.name),
  ).toEqual(["Publication reviewer", "Facilitator"]);
  expect(
    scenarioAttention(scenario).filter((a) => a.category === "Response"),
  ).toHaveLength(3);
  expect(validScenarioPath("/organizations/knowledge/work?persona=leo")).toBe(
    true,
  );
  for (const path of [
    "/organizations/knowledge/work?persona=alex",
    "/organizations/large/work?persona=maya",
    "/organizations/knowledge/assignments/A-1042",
    "/organizations/unknown",
  ])
    expect(validScenarioPath(path)).toBe(false);
});
for (const width of [390, 1440])
  test(`knowledge organization and personal inbox ${width}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/demos");
    await page
      .getByRole("button", {
        name: "Open knowledge scenario workspace",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: scenario.purpose, exact: true }),
    ).toBeVisible();
    await expect(page.locator(".overview-workers article")).toHaveCount(3);
    await page
      .getByRole("button", { name: "Browse roles", exact: true })
      .click();
    await page.getByLabel("Responsibility coverage").selectOption("unbound");
    await expect(page.getByRole("status")).toContainText("2 of 6 roles");
    await expect(
      page.getByRole("article", { name: "Publication reviewer", exact: true }),
    ).toContainText("No binding represented");
    await page.reload();
    await expect(page.getByLabel("Responsibility coverage")).toHaveValue(
      "unbound",
    );
    await expect(
      page.getByRole("combobox", { name: "Sample persona", exact: true }),
    ).toHaveValue("maya");
    await page
      .getByRole("button", { name: "Open My Work · Maya Patel", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "My Work · Maya Patel", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".org-overview-section[role=status]")).toHaveText(
      "2 assignments · 1 awaiting your response · 1 waiting for input",
    );
    await expect(
      page.getByRole("article", { name: "K-02-E", exact: true }),
    ).toContainText("Waiting for brief");
    await expect(
      page.getByRole("article", { name: "K-02-C", exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "Inspect my assignment · K-01-E",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Input & expected response",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Submit|Authorize|Publish/ }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "My Work · Maya Patel", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("leo");
    await expect(
      page.getByRole("heading", { name: "My Work · Leo Rivera", exact: true }),
    ).toBeFocused();
    await expect(page.locator(".org-overview-section[role=status]")).toHaveText(
      "2 assignments · 2 awaiting your response · 0 waiting for input",
    );
    await expect(
      page.getByRole("article", { name: "K-01-E", exact: true }),
    ).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".tiny-avatar")).toHaveText("LR");
    await expect(
      page.getByRole("combobox", { name: "Sample persona", exact: true }),
    ).toHaveValue("leo");
    await page
      .getByRole("button", { name: "View shared goal · K-02", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Member learning workshop",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Not verified · no participant observations represented", {
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "My Work · Leo Rivera", exact: true }),
    ).toBeVisible();
    if (width === 390)
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .click();
    await page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("button", { name: "Organization", exact: true })
      .click();
    await expect(page).toHaveURL(/knowledge\?persona=leo$/);
    if (width === 390)
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .click();
    await page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("button", { name: /My Work/ })
      .click();
    await expect(
      page.getByRole("heading", { name: "My Work · Leo Rivera", exact: true }),
    ).toBeVisible();
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
    await page.goto("/#/organizations/knowledge/work?persona=alex");
    await expect(page.getByRole("alert")).toContainText(
      "This link does not match",
    );
    expect(errors).toEqual([]);
  });

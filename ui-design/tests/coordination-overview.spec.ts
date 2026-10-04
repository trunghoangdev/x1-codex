import { test, expect } from "@playwright/test";
import { knowledgeOrganization as scenario } from "../src/data/knowledgeOrganization";
import {
  coordinationRows,
  filteredCoordinationRows,
} from "../src/data/coordinationOverview";
import { validScenarioPath } from "../src/ScenarioWorkspace";

test("coordination projection uses authored references and independent signals", () => {
  const rows = coordinationRows(scenario);
  expect(
    rows.map((r) => [
      r.stream.id,
      r.gaps.length,
      r.inputs.length,
      r.responses.length,
      r.criteria.length,
    ]),
  ).toEqual([
    ["K-01", 1, 0, 2, 1],
    ["K-02", 1, 1, 1, 1],
  ]);
  expect(rows[1].inputs[0].provider).toEqual({ assignmentId: "K-02-C" });
  expect(rows[1].inputs[0].receiverAssignmentId).toBe("K-02-E");
  const renamed = {
    ...scenario,
    streams: scenario.streams.map((s) => ({
      ...s,
      name: "Different label",
      goal: "Different goal",
    })),
  };
  expect(
    coordinationRows(renamed).map((r) => r.responses.map((a) => a.id)),
  ).toEqual(rows.map((r) => r.responses.map((a) => a.id)));
  const unknown = {
    ...scenario,
    assignments: scenario.assignments.map((a) => ({
      ...a,
      responseNeeded: undefined,
      state: "Awaiting response",
    })),
  };
  expect(coordinationRows(unknown).every((r) => r.responses.length === 0)).toBe(
    true,
  );
  expect(
    coordinationRows({ ...scenario, dependencies: [] })[1].inputs,
  ).toHaveLength(0);
  expect(
    filteredCoordinationRows(scenario, { query: "", signal: "input" }).map(
      (r) => r.stream.id,
    ),
  ).toEqual(["K-02"]);
  expect(
    validScenarioPath(
      "/organizations/knowledge?coordSignal=input&coordPage=2&persona=leo",
    ),
  ).toBe(true);
  for (const path of [
    "/organizations/knowledge?coordSignal=healthy",
    "/organizations/knowledge?coordPage=0",
    "/organizations/knowledge/work?coordSignal=input",
  ])
    expect(validScenarioPath(path)).toBe(false);
});
for (const width of [390, 1440]) {
  test(`knowledge coordination overview retains sources and context ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/#/organizations/knowledge?persona=maya");
    await expect(
      page.getByRole("combobox", { name: "Sample persona", exact: true }),
    ).toHaveCount(1);
    await expect(
      page.getByRole("region", { name: "Scenario boundary" }),
    ).not.toHaveAttribute("open", "");
    await expect(
      page.getByRole("heading", {
        name: "Coordination by workstream",
        exact: true,
      }),
    ).toBeVisible();
    const cards = page
      .getByRole("region", { name: "Organization workstreams" })
      .getByRole("article");
    await expect(cards).toHaveCount(2);
    await expect(page.locator(".overview-workers article")).toHaveCount(3);
    const guide = page.getByRole("article", {
      name: "New member welcome guide",
      exact: true,
    });
    await guide.locator("summary").click();
    await expect(guide).toContainText("Publication review");
    await guide
      .getByRole("button", {
        name: "Inspect responsibility source",
        exact: false,
      })
      .click();
    await expect(
      page.getByRole("region", { name: "Workstream responsibility sources" }),
    ).toContainText("Publication review");
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Coordination need", exact: true })
      .selectOption("input");
    await page
      .getByRole("searchbox", { name: "Search coordination", exact: true })
      .fill("workshop");
    await expect(cards).toHaveCount(1);
    await expect(page.getByRole("status")).toContainText("1 of 2 workstreams");
    const source = page.url();
    await expect(cards).toContainText("Maya Patel waits for");
    await expect(cards).toContainText("Leo Rivera");
    await page
      .getByRole("button", {
        name: "Inspect input provider · K-02-C",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Confirm workshop brief",
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(source);
    await expect(
      page.getByRole("searchbox", { name: "Search coordination", exact: true }),
    ).toHaveValue("workshop");
    await page
      .getByRole("button", {
        name: "Inspect waiting assignment · K-02-E",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(source);
    await page.reload();
    await expect(cards).toHaveCount(1);
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("leo");
    await expect(
      page.getByRole("combobox", { name: "Coordination need", exact: true }),
    ).toHaveValue("input");
    await page
      .getByRole("searchbox", { name: "Search coordination", exact: true })
      .fill("unknown-stream");
    await expect(cards).toHaveCount(0);
    await page
      .getByRole("button", { name: "Show all coordination", exact: true })
      .click();
    await expect(
      page.getByRole("searchbox", { name: "Search coordination", exact: true }),
    ).toBeFocused();
    await expect(cards).toHaveCount(2);
    await page
      .getByRole("combobox", { name: "Coordination need", exact: true })
      .selectOption("outcome");
    const workshop = page.getByRole("article", {
      name: "Member learning workshop",
      exact: true,
    });
    await workshop.locator("summary").click();
    await workshop
      .getByRole("button", {
        name: "Inspect outcome requirement · K-02-goal",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Criterion · K-02-goal", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Coordination need", exact: true }),
    ).toHaveValue("outcome");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(`larger coordination paging and source return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/large?persona=sam");
    const cards = page
      .getByRole("region", { name: "Organization workstreams" })
      .getByRole("article");
    await expect(cards).toHaveCount(4);
    await expect(page.locator(".overview-workers article")).toHaveCount(3);
    await expect(
      page.getByRole("combobox", { name: "Sample persona", exact: true }),
    ).toHaveCount(1);
    await page
      .getByRole("button", { name: "Next coordination", exact: true })
      .click();
    await expect(cards).toHaveCount(2);
    await expect(page.locator("#coordination-results")).toBeFocused();
    const source = page.url();
    await page.reload();
    await expect(cards).toHaveCount(2);
    await cards
      .first()
      .getByRole("button", { name: "Explore workstream", exact: false })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(source);
    await page
      .getByRole("combobox", { name: "Coordination need", exact: true })
      .selectOption("input");
    await expect(cards).toHaveCount(0);
    await expect(
      page.getByText("No matching workstreams.", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Show all coordination", exact: true })
      .click();
    await expect(cards).toHaveCount(4);
    await expect(
      page.getByRole("searchbox", { name: "Search coordination", exact: true }),
    ).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

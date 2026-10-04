import { test, expect } from "@playwright/test";
import {
  mainOrganization,
  largeOrganization,
} from "../src/data/organizationScenario";

test("shared scenario references remain internally scoped", () => {
  for (const scenario of [mainOrganization, largeOrganization]) {
    const workers = scenario.workers.map((w) => w.id),
      streams = scenario.streams.map((s) => s.id),
      assignments = scenario.assignments.map((a) => a.id);
    expect(new Set(workers).size).toBe(workers.length);
    expect(new Set(assignments).size).toBe(assignments.length);
    for (const binding of scenario.bindings)
      expect(workers).toContain(binding.workerId);
    for (const assignment of scenario.assignments) {
      if (assignment.workerId) expect(workers).toContain(assignment.workerId);
      if (assignment.streamId) expect(streams).toContain(assignment.streamId);
    }
    for (const stream of scenario.streams)
      for (const id of stream.assignmentIds)
        expect(scenario.assignments.find((a) => a.id === id)?.streamId).toBe(
          stream.id,
        );
    for (const gap of scenario.gaps)
      expect(streams).toContain(gap.workstreamId);
    for (const outcome of scenario.outcomes)
      expect(streams).toContain(outcome.streamId);
    for (const evidence of scenario.evidence)
      expect(assignments).toContain(evidence.assignmentId);
    for (const [streamId, steps] of Object.entries(scenario.flows)) {
      expect(streams).toContain(streamId);
      for (const step of steps)
        if (step.assignmentId)
          expect(
            scenario.streams.find((s) => s.id === streamId)?.assignmentIds,
          ).toContain(step.assignmentId);
    }
  }
});
for (const width of [1440, 390]) {
  test(`larger scenario uses shared organization screens at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/#/organization/attention/responsibility");
    await page
      .getByRole("button", {
        name: "Propose responsibility · Invitation implementation",
        exact: true,
      })
      .click();
    await page.getByLabel("Proposed worker").selectOption("codex");
    await page
      .getByLabel("Reason for proposal")
      .fill("Main scenario record stays isolated.");
    await page
      .getByRole("button", { name: "Record local proposal", exact: true })
      .click();
    await page.keyboard.press("Escape");
    if (width === 390)
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: "Demos", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Open larger scenario workspace",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/#\/organizations\/large$/);
    await expect(
      page.getByRole("region", { name: "Scenario boundary" }),
    ).toContainText("read-only sample");
    await expect(
      page
        .getByRole("region", { name: "Organization workstreams" })
        .getByRole("article"),
    ).toHaveCount(6);
    await expect(
      page
        .getByRole("region", { name: "Roles and worker bindings" })
        .getByRole("article"),
    ).toHaveCount(9);
    await page
      .getByRole("button", { name: "Return to main organization", exact: true })
      .click();
    await page
      .getByText("Responsibility gaps · 2 known gaps", { exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "View proposal · Invitation implementation",
        exact: true,
      }),
    ).toBeVisible();
    if (width === 390)
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("button", { name: "Demos", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Open larger scenario workspace",
        exact: true,
      })
      .click();
    await page
      .getByRole("region", { name: "Organization attention summary" })
      .getByRole("button", { name: /Responsibility/ })
      .click();
    await expect(page).toHaveURL(
      /attention\?category=responsibility&persona=sam$/,
    );
    await expect(
      page.getByRole("heading", { name: /Responsibility ·/ }),
    ).toHaveCount(1);
    await page.goBack();
    await page
      .getByRole("button", { name: "View organization activity", exact: true })
      .click();
    await expect(
      page.getByText("No scenario records represented", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Main scenario record stays isolated.", { exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Browse workstreams", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("6 of 6 workstreams");
    await page
      .getByRole("combobox", { name: "Project", exact: true })
      .selectOption("Workspace");
    await page
      .getByRole("combobox", { name: "Attention signal", exact: true })
      .selectOption("responsibility");
    await expect(page.getByRole("status")).toContainText("1 of 6 workstreams");
    await page
      .getByRole("button", { name: "Open workstream · L-02", exact: true })
      .click();
    await expect(page).toHaveURL(
      /#\/organizations\/large\/workstreams\/L-02\?persona=sam$/,
    );
    await page
      .getByRole("button", {
        name: "Inspect scenario assignment · L-02-R",
        exact: true,
      })
      .click();
    await expect(
      page.getByText("Worker: Unassigned", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Submit assessment", exact: true }),
    ).toHaveCount(0);
    await page.goBack();
    await page.goBack();
    await expect(
      page.getByRole("combobox", { name: "Project", exact: true }),
    ).toHaveValue("Workspace");
    await page.reload();
    await expect(page.getByRole("status")).toContainText("1 of 6 workstreams");
    await page
      .getByRole("button", { name: "Back to Organization", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Browse workers", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("9 of 9 workers");
    const search = page.getByRole("searchbox", {
      name: "Search workers",
      exact: true,
    });
    await search.pressSequentially("Alex");
    await expect(search).toBeFocused();
    await expect(page.getByRole("status")).toContainText("1 of 9 workers");
    await page
      .getByRole("button", { name: "Open worker · Alex Morgan", exact: true })
      .click();
    await expect(
      page.getByText("Reviewer · Payment retry resilience", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("A-1042", { exact: true })).toHaveCount(0);
    await page.goBack();
    await expect(search).toHaveValue("Alex");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Return to main organization", exact: true })
      .click();
    await expect(page).toHaveURL(/#\/organization$/);
    await page
      .getByText("Responsibility gaps · 2 known gaps", { exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Propose responsibility · Invitation implementation",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Open My Work · Alex", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: /A-1042.*Review retry/ }),
    ).toBeVisible();
    await page.goto("/#/organizations/large/workers/no-such-worker");
    await expect(page.getByRole("alert")).toContainText(
      "This link does not match",
    );
    expect(errors).toEqual([]);
  });
}

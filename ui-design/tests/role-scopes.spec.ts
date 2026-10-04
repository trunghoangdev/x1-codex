import { test, expect } from "@playwright/test";
import {
  mainOrganization,
  largeOrganization,
} from "../src/data/organizationScenario";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { scopeRequirementRows } from "../src/data/roleScopes";
import { validScenarioPath } from "../src/ScenarioWorkspace";
test("structured scope references preserve coverage boundaries", () => {
  for (const s of [
    mainOrganization,
    largeOrganization,
    knowledgeOrganization,
  ]) {
    const ids = s.scopes.map((v) => v.id),
      bindings = s.bindings.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(bindings).size).toBe(bindings.length);
    for (const scope of s.scopes)
      if (scope.kind === "workstream")
        expect(s.streams.map((w) => w.id)).toContain(scope.streamId);
    for (const b of s.bindings) {
      expect(s.workers.map((w) => w.id)).toContain(b.workerId);
      for (const id of b.scopeIds) expect(ids).toContain(id);
    }
    for (const link of s.assignmentScopes) {
      expect(ids).toContain(link.scopeId);
      const a = s.assignments.find((a) => a.id === link.assignmentId)!;
      expect(a).toBeTruthy();
      if (link.bindingId) {
        const b = s.bindings.find((b) => b.id === link.bindingId)!;
        expect(b.workerId).toBe(a.workerId);
        expect(b.role).toBe(a.role);
      }
      const scope = s.scopes.find((v) => v.id === link.scopeId)!;
      if (scope.kind === "workstream") expect(a.streamId).toBe(scope.streamId);
    }
    for (const r of s.scopeRequirements) {
      expect(ids).toContain(r.scopeId);
      expect(s.roles.map((r) => r.name)).toContain(r.role);
      for (const id of [...r.bindingIds, ...(r.unresolvedBindingIds ?? [])]) {
        expect(bindings).toContain(id);
        expect(s.bindings.find((b) => b.id === id)?.role).toBe(r.role);
      }
      for (const id of r.gapIds) {
        const g = s.gaps.find((g) => g.id === id)!;
        expect(g).toBeTruthy();
        const scope = s.scopes.find((v) => v.id === r.scopeId)!;
        if (scope.kind === "workstream")
          expect(g.workstreamId).toBe(scope.streamId);
      }
      if (r.bindingState !== "declared") expect(r.bindingIds).toHaveLength(0);
    }
  }
  const main = scopeRequirementRows(mainOrganization);
  const reviewer = main.find((r) => r.id === "invitation-reviewer")!;
  expect(reviewer.bindings.map((b) => b.id)).toEqual(["mb-reviewer"]);
  expect(reviewer.assignments).toHaveLength(0);
  expect(reviewer.gaps).toHaveLength(1);
  expect(
    main.find((r) => r.id === "invitation-developer")?.bindings,
  ).toHaveLength(0);
  expect(main.find((r) => r.id === "payment-developer")?.bindings).toHaveLength(
    1,
  );
  expect(
    main.flatMap((r) => r.assignments.map((a) => a.assignment.id)),
  ).not.toContain("A-1041");
  expect(
    main.flatMap((r) => r.assignments.map((a) => a.assignment.id)),
  ).not.toContain("A-1035");
  const unknown = scopeRequirementRows(knowledgeOrganization).find(
    (r) => r.role === "Distributor",
  )!;
  expect(unknown.bindingState).toBe("unknown");
  expect(unknown.bindings).toHaveLength(0);
  expect(unknown.unresolvedBindings.map((b) => b.id)).toEqual([
    "kb-distributor",
  ]);
  const renamed = {
    ...mainOrganization,
    bindings: mainOrganization.bindings.map((b) => ({
      ...b,
      scope: "Unrelated display label",
    })),
    scopes: mainOrganization.scopes.map((s) => ({
      ...s,
      label: "Renamed display label",
    })),
  };
  expect(
    scopeRequirementRows(renamed)
      .find((r) => r.id === "invitation-reviewer")
      ?.bindings.map((b) => b.id),
  ).toEqual(["mb-reviewer"]);
  const noLink = {
    ...mainOrganization,
    assignmentScopes: mainOrganization.assignmentScopes.map((l) => ({
      ...l,
      bindingId: undefined,
    })),
  };
  expect(
    scopeRequirementRows(noLink).find((r) => r.id === "payment-reviewer")
      ?.assignments[0].binding,
  ).toBeUndefined();
  expect(
    validScenarioPath(
      "/organizations/knowledge/roles?view=scope&scope=scope-K-01&coverage=unknown",
    ),
  ).toBe(true);
  expect(
    validScenarioPath(
      "/organizations/knowledge/roles?view=scope&scope=scope-WS-02",
    ),
  ).toBe(false);
});
for (const width of [390, 1440])
  test(`workstream role coverage inspection ${width}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organization/roles");
    await page
      .getByRole("button", { name: "Coverage by workstream", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Coverage workstream", exact: true })
      .selectOption("scope-WS-02");
    const developer = page.getByRole("article", {
        name: "Developer · Team invitation improvements",
        exact: true,
      }),
      reviewer = page.getByRole("article", {
        name: "Reviewer · Team invitation improvements",
        exact: true,
      });
    await expect(developer).toContainText(
      "No binding represented in this scope",
    );
    await expect(developer).toContainText("Invitation implementation");
    await expect(reviewer).toContainText("project · Team Workspace");
    await expect(reviewer).toContainText("No scoped assignment represented");
    await expect(reviewer).toContainText("Invitation assessment assignment");
    await reviewer
      .getByRole("button", { name: "Alex Morgan · mb-reviewer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Back to Roles", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Coverage workstream", exact: true }),
    ).toHaveValue("scope-WS-02");
    await page.reload();
    await expect(reviewer).toBeVisible();
    await reviewer
      .getByRole("button", {
        name: "Inspect scoped workstream · WS-02",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to Roles", exact: true })
      .click();
    await page.getByText("Role × workstream overview", { exact: true }).click();
    const matrix = page.getByRole("region", {
      name: "Role scope matrix",
      exact: true,
    });
    await expect(matrix).toContainText("Not modeled · coverage unknown");
    await matrix
      .getByRole("button", { name: /Inspect Reviewer · WS-01/ })
      .click();
    await expect(
      page.getByRole("searchbox", { name: "Search scoped roles", exact: true }),
    ).toHaveValue("Reviewer");
    await page
      .getByRole("article", {
        name: "Reviewer · Payment webhook reliability",
        exact: true,
      })
      .getByRole("button", { name: /A-1042/ })
      .click();
    await page
      .getByRole("button", { name: "Back to Roles", exact: true })
      .click();
    await page
      .getByRole("searchbox", { name: "Search scoped roles", exact: true })
      .fill("no record");
    await page
      .getByRole("button", { name: "Show scope records", exact: true })
      .click();
    await expect(
      page.getByRole("searchbox", { name: "Search scoped roles", exact: true }),
    ).toBeFocused();
    await page
      .getByText("Scopes outside the workstream view", { exact: true })
      .click();
    await expect(
      page.getByRole("article", {
        name: "Production release v1.8.2",
        exact: true,
      }),
    ).toContainText("subject");
    await expect(
      page.getByRole("article", {
        name: "Payments API · staging",
        exact: true,
      }),
    ).toContainText("environment");
    await page.goto(
      "/#/organizations/knowledge/roles?view=scope&scope=scope-K-01&coverage=unknown&persona=maya",
    );
    await expect(
      page.getByRole("article", {
        name: "Distributor · New member welcome guide",
        exact: true,
      }),
    ).toContainText("Binding scope relationship unknown");
    await expect(
      page.getByRole("article", {
        name: "Distributor · New member welcome guide",
        exact: true,
      }),
    ).toContainText("Declared bindings · 0");
    await expect(page.getByRole("status")).toContainText(
      "1 of 5 scoped role requirements shown",
    );
    await page
      .getByRole("combobox", { name: "Scope records", exact: true })
      .selectOption("unbound");
    await expect(
      page.getByRole("article", {
        name: "Publication reviewer · New member welcome guide",
        exact: true,
      }),
    ).toContainText("Publication review responsibility");
    await page
      .getByRole("combobox", { name: "Coverage workstream", exact: true })
      .selectOption("scope-K-02");
    await expect(
      page.getByRole("article", {
        name: "Facilitator · Member learning workshop",
        exact: true,
      }),
    ).toContainText("Unassigned");
    await page.goto(
      "/#/organizations/large/roles?view=scope&scope=scope-L-02&persona=sam",
    );
    await expect(
      page.getByRole("article", {
        name: "Reviewer · Invitation clarity",
        exact: true,
      }),
    ).toContainText("No worker allocation or binding link represented");
    await page.getByText("Role × workstream overview", { exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("region", { name: "Role scope matrix", exact: true }),
    ).toBeVisible();
    await page.goto("/#/organization/roles?view=scope&scope=invalid");
    await expect(page.getByRole("alert")).toContainText(
      "This link does not match",
    );
    expect(errors).toEqual([]);
  });

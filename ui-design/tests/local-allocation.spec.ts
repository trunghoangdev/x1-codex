import { test, expect } from "@playwright/test";
import {
  recordLocalAllocation,
  type ResponsibilityProposal,
} from "../src/data/responsibilityProposals";
import { mainOrganization } from "../src/data/organizationScenario";
import { localAllocationScenario } from "../src/data/localAllocationScenario";
import { parseDemoSnapshot } from "../src/data/demoSnapshot";
const at = "2026-10-07T12:00:00Z";
const proposal: ResponsibilityProposal = {
  id: "proposal-test",
  gapId: "invitation-assessment",
  workerId: "alex",
  role: "Reviewer",
  scope: "Team invitation improvements",
  rationale: "assign review",
  proposer: "demo",
  recordedAt: at,
};
test("allocation requires accepted plan, creates exactly one scoped assignment and reuses Alex binding", () => {
  const initial = { [proposal.gapId]: proposal };
  expect(recordLocalAllocation(initial, proposal.gapId, at)).toBe(initial);
  const accepted = {
    [proposal.gapId]: {
      ...proposal,
      decision: {
        outcome: "Accepted" as const,
        rationale: "review",
        reviewer: "demo",
        recordedAt: at,
      },
    },
  };
  const allocated = recordLocalAllocation(accepted, proposal.gapId, at);
  expect(recordLocalAllocation(allocated, proposal.gapId, at)).toBe(allocated);
  expect(allocated[proposal.gapId].allocation?.bindingMode).toBe("reused");
  const scenario = localAllocationScenario(mainOrganization, allocated);
  expect(scenario.assignments.length).toBe(
    mainOrganization.assignments.length + 1,
  );
  expect(scenario.bindings).toEqual(mainOrganization.bindings);
  expect(scenario.assignmentScopes.at(-1)).toMatchObject({
    bindingId: "mb-reviewer",
    scopeId: "scope-WS-02",
  });
  expect(scenario.gaps).toEqual(mainOrganization.gaps);
  const developer = {
    ...proposal,
    gapId: "invitation-implementation",
    role: "Developer",
    workerId: "codex",
    decision: accepted[proposal.gapId].decision,
  };
  const developerState = recordLocalAllocation(
    { [developer.gapId]: developer },
    developer.gapId,
    at,
  );
  const developerScenario = localAllocationScenario(
    mainOrganization,
    developerState,
  );
  expect(developerScenario.bindings.at(-1)).toMatchObject({
    workerId: "codex",
    role: "Developer",
    scopeIds: ["scope-WS-02"],
  });
  expect(
    developerScenario.scopeRequirements.find(
      (r) => r.id === "invitation-developer",
    )?.bindingState,
  ).toBe("declared");
  const rejected = {
    [proposal.gapId]: {
      ...proposal,
      decision: {
        ...accepted[proposal.gapId].decision,
        outcome: "Rejected" as const,
      },
    },
  };
  expect(recordLocalAllocation(rejected, proposal.gapId, at)).toBe(rejected);
});
for (const width of [320, 1440])
  test(`separate local allocation projects into responsibilities and survives continuity ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/organization/attention/responsibility");
    await page
      .getByRole("button", {
        name: "Propose responsibility · Invitation assessment assignment",
        exact: true,
      })
      .click();
    await page.getByLabel("Proposed worker").selectOption("alex");
    await page
      .getByLabel("Reason for proposal")
      .fill("Allocate review after prerequisites.");
    await page
      .getByRole("button", { name: "Record local proposal", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review allocation plan", exact: true })
      .click();
    await page
      .getByLabel("Decision reason", { exact: true })
      .fill("Accept this plan.");
    await page
      .getByRole("button", { name: "Record allocation decision", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Recorded local allocation" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Prepare local allocation", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Cancel allocation", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Recorded local allocation" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Prepare local allocation", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Record local allocation", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Allocation recorded locally · work prerequisites pending",
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.getByRole("region", { name: "Recorded local allocation" }),
    ).toContainText("mb-reviewer · reused");
    await expect(
      page.getByRole("button", {
        name: "Record local allocation",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Allocated proposal retained" }),
    ).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(
      page.getByText("Original authored gap retained", { exact: false }),
    ).toContainText("local resolution");
    await page.goto("/#/work");
    const local = page.getByRole("region", {
      name: "Local allocated responsibilities",
    });
    await expect(local.getByRole("article")).toHaveCount(1);
    await expect(local).toContainText("local-assignment-invitation-assessment");
    await page
      .getByLabel("Sample worker for local assignments")
      .selectOption("codex");
    await expect(local).toContainText("No local allocations in this selection");
    await page.goto("/#/workstreams/WS-02");
    await expect(local).toContainText("local-assignment-invitation-assessment");
    await page.goto("/#/workers/alex");
    await expect(local).toContainText("local-assignment-invitation-assessment");
    await page.goto("/#/organization/roles?q=Reviewer");
    await expect(local).toContainText("mb-reviewer");
    await page
      .getByRole("button", {
        name: "Inspect role records · Reviewer",
        exact: true,
      })
      .click();
    await page
      .getByRole("article", { name: "Reviewer", exact: true })
      .getByRole("button", { name: /^local-assignment-invitation-assessment/ })
      .click();
    await expect(
      page.getByRole("region", { name: "Recorded local allocation" }),
    ).toContainText("mb-reviewer");
    await page.keyboard.press("Escape");
    await page.goto("/#/organization/activity");
    await page
      .getByLabel("Organization activity type")
      .selectOption("allocations");
    await expect(
      page.getByRole("region", { name: "Organization coordination records" }),
    ).toContainText("local-assignment-invitation-assessment");
    await expect(page.getByRole("status")).toContainText("1 matching records");
    await page.goto("/#/demos");
    await page
      .getByRole("button", { name: "Save local snapshot", exact: true })
      .click();
    const raw = await page.evaluate(() =>
      localStorage.getItem("forge-ui-demo-snapshot-v1"),
    );
    expect(raw).toBeTruthy();
    const parsed = parseDemoSnapshot(raw!);
    expect(parsed.version).toBe(2);
    expect(
      parsed.proposals["invitation-assessment"].allocation?.assignmentId,
    ).toBe("local-assignment-invitation-assessment");
    const invalid = JSON.parse(raw!);
    invalid.proposals["invitation-assessment"].allocation.workerId = "codex";
    expect(() => parseDemoSnapshot(JSON.stringify(invalid))).toThrow();
    await page.reload();
    await page.goto("/#/work");
    await expect(local.getByRole("article")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

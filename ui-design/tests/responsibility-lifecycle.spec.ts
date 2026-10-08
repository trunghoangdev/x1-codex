import { test, expect } from "@playwright/test";
import {
  recordLocalAllocation,
  type ResponsibilityProposal,
} from "../src/data/responsibilityProposals";
import {
  recordResponsibilityEvent,
  responsibilityState,
} from "../src/data/responsibilityLifecycle";
import { localAllocationScenario } from "../src/data/localAllocationScenario";
import { mainOrganization } from "../src/data/organizationScenario";
import { parseDemoSnapshot, demoStorageKey } from "../src/data/demoSnapshot";
const at = "2026-10-07T12:00:00Z",
  gap = "invitation-assessment";
function fixture() {
  const proposal: ResponsibilityProposal = {
    id: "proposal-test",
    gapId: gap,
    workerId: "alex",
    role: "Reviewer",
    scope: "Team invitation improvements",
    rationale: "Allocate scoped assessment",
    proposer: "demo",
    recordedAt: at,
    decision: {
      outcome: "Accepted",
      rationale: "Plan accepted",
      reviewer: "demo",
      recordedAt: at,
    },
  };
  return recordLocalAllocation({ [gap]: proposal }, gap, at);
}
function snapshot(
  proposals: Record<string, ResponsibilityProposal>,
  version = 3,
) {
  return {
    format: "forge-ui-demo",
    version,
    scope: "main-sample",
    savedAt: at,
    drafts: {
      text: {},
      assessmentConclusion: "",
      assessmentEvidence: [],
      criterionReviews: {},
      reconciliationConclusion: "",
    },
    receipts: [],
    proposals,
  };
}
test("allocation, acceptance, transfer offer and effective ownership stay separate", () => {
  let p = fixture();
  const original = p[gap].allocation;
  expect(responsibilityState(p[gap]).status).toBe("Acceptance pending");
  expect(
    recordResponsibilityEvent(
      p,
      gap,
      "Accept responsibility",
      "jamie",
      "wrong performer",
      at,
    ),
  ).toBe(p);
  p = recordResponsibilityEvent(
    p,
    gap,
    "Request clarification",
    "alex",
    "Criteria are missing",
    at,
  );
  p = recordResponsibilityEvent(
    p,
    gap,
    "Decline responsibility",
    "alex",
    "Need another reviewer",
    at,
  );
  expect(responsibilityState(p[gap]).status).toContain("coordination needed");
  p = recordResponsibilityEvent(
    p,
    gap,
    "Propose transfer",
    "jamie",
    "Reassign bounded review",
    at,
    "jamie",
    "Pending review; criteria/candidate/checks missing; no authority transferred",
  );
  expect(responsibilityState(p[gap]).workerId).toBe("alex");
  expect(
    localAllocationScenario(mainOrganization, p).assignments.at(-1)?.workerId,
  ).toBe("alex");
  expect(
    recordResponsibilityEvent(
      p,
      gap,
      "Accept transfer",
      "alex",
      "wrong recipient",
      at,
    ),
  ).toBe(p);
  const cancelled = recordResponsibilityEvent(
    p,
    gap,
    "Cancel transfer",
    "jamie",
    "Cancel proposal",
    at,
  );
  expect(responsibilityState(cancelled[gap]).pending).toBeUndefined();
  const next = recordResponsibilityEvent(
    p,
    gap,
    "Accept transfer",
    "jamie",
    "Accept exact pending work with input prerequisites",
    at,
  );
  expect(responsibilityState(next[gap])).toMatchObject({
    workerId: "jamie",
    status: "Accepted locally",
  });
  expect(next[gap].allocation).toBe(original);
  expect(
    recordResponsibilityEvent(
      next,
      gap,
      "Accept transfer",
      "jamie",
      "duplicate transfer",
      at,
    ),
  ).toBe(next);
  const projected = localAllocationScenario(mainOrganization, next);
  expect(projected.assignments.at(-1)?.workerId).toBe("jamie");
  expect(projected.assignmentScopes.at(-1)?.bindingId).toBe(
    `local-binding-${gap}-jamie`,
  );
  expect(
    projected.bindings.find((b) => b.id === `local-binding-${gap}-jamie`)
      ?.workerId,
  ).toBe("jamie");
  expect(parseDemoSnapshot(JSON.stringify(snapshot(next))).proposals).toEqual(
    next,
  );
  for (const mutate of [
    (x: any) => (x.version = 2),
    (x: any) =>
      (x.proposals[gap].responsibilityHistory.at(-1).actorId = "alex"),
    (x: any) => (x.proposals[gap].responsibilityHistory[0].id = "foreign"),
  ]) {
    const x = snapshot(structuredClone(next));
    mutate(x);
    expect(() => parseDemoSnapshot(JSON.stringify(x))).toThrow();
  }
});
for (const width of [390, 1440])
  test(`personal acceptance and confirmed handoff ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(
      ({ key, value }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, value);
      },
      { key: demoStorageKey, value: JSON.stringify(snapshot(fixture(), 2)) },
    );
    await page.goto("/#/work");
    const local = page.getByRole("region", {
      name: "Local allocated responsibilities",
      exact: true,
    });
    const life = page.getByRole("region", {
      name: `Responsibility lifecycle ${gap}`,
      exact: true,
    });
    await expect(life).toContainText("Acceptance pending");
    const act = async (kind: string, rationale: string) => {
      await life
        .getByRole("combobox", { name: "Responsibility action" })
        .selectOption(kind);
      await life
        .getByRole("textbox", { name: "Responsibility rationale" })
        .fill(rationale);
      await life
        .getByRole("button", {
          name: "Prepare responsibility action",
          exact: true,
        })
        .click();
      await life
        .getByRole("button", {
          name: "Record responsibility action",
          exact: true,
        })
        .click();
    };
    await act(
      "Accept responsibility",
      "Accept bounded review, waiting for criteria",
    );
    await expect(life).toContainText(
      "Accepted locally · current performer alex",
    );
    await page.evaluate(() => {
      location.hash = "/workstreams/WS-02";
    });
    await life
      .getByRole("combobox", { name: "Responsibility action" })
      .selectOption("Propose transfer");
    await life
      .getByRole("combobox", { name: "Proposed recipient" })
      .selectOption("jamie");
    await life
      .getByRole("textbox", {
        name: "Pending work, exact inputs and decision history to inspect",
      })
      .fill(
        "Invitation assessment pending; exact candidate/criteria/checks absent; original allocation accepted",
      );
    await life
      .getByRole("textbox", { name: "Responsibility rationale" })
      .fill("Jamie to take responsibility after acceptance");
    await life
      .getByRole("button", {
        name: "Prepare responsibility action",
        exact: true,
      })
      .click();
    await life
      .getByRole("button", {
        name: "Cancel responsibility action",
        exact: true,
      })
      .click();
    await expect(life).not.toContainText("Transfer proposed to jamie");
    await life
      .getByRole("button", {
        name: "Prepare responsibility action",
        exact: true,
      })
      .click();
    await life
      .getByRole("button", {
        name: "Record responsibility action",
        exact: true,
      })
      .click();
    await expect(life).toContainText("ownership stays with alex");
    await page.evaluate(() => {
      location.hash = "/work";
    });
    await local
      .getByRole("combobox", { name: "Sample worker for local assignments" })
      .selectOption("jamie");
    await expect(local).toContainText(
      "Offered transfer · not current ownership",
    );
    await act(
      "Accept transfer",
      "Accept pending work, verify criteria and candidate separately",
    );
    await expect(life).toContainText(
      "Accepted locally · current performer jamie",
    );
    await local
      .getByRole("combobox", { name: "Sample worker for local assignments" })
      .selectOption("alex");
    await expect(local).toContainText(
      "Historical ownership · no current assignment",
    );
    await expect(
      life.getByRole("button", { name: "Prepare responsibility action" }),
    ).toHaveCount(0);
    await local
      .getByRole("combobox", { name: "Sample worker for local assignments" })
      .selectOption("jamie");
    await expect(life).toContainText(
      "Accepted locally · current performer jamie",
    );
    await page.evaluate(() => {
      location.hash = "/demos";
    });
    await page
      .getByRole("button", { name: "Save local snapshot", exact: true })
      .click();
    const raw = await page.evaluate(
      (key) => localStorage.getItem(key),
      demoStorageKey,
    );
    expect(parseDemoSnapshot(raw!).version).toBe(3);
    expect(
      responsibilityState(parseDemoSnapshot(raw!).proposals[gap]).workerId,
    ).toBe("jamie");
    await page.reload();
    await page.evaluate(() => {
      location.hash = "/work";
    });
    await local
      .getByRole("combobox", { name: "Sample worker for local assignments" })
      .selectOption("jamie");
    await expect(life).toContainText(
      "Accepted locally · current performer jamie",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

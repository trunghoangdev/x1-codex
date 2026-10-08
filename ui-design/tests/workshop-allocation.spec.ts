import { test, expect } from "@playwright/test";
import { emptyContribution } from "../src/data/humanContribution";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import { recordCaseEvent } from "../src/data/caseLifecycle";
import {
  recordWorkshopEvent,
  workshopProgress,
  workshopScenario,
  type WorkshopEvent,
  type WorkshopContext,
  type WorkshopActor,
  type WorkshopAction,
  type WorkshopAllocation,
} from "../src/data/workshop";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
} from "../src/data/knowledgeCheckpoint";
import { recordPatternEvent } from "../src/data/patternAdoption";
const at = "2026-10-01T12:00:00Z";
function context(): WorkshopContext {
  const c = {
    contribution: emptyContribution(),
    brief: receiveBrief(
      deliverBrief(
        { versions: [] },
        "New-member exercise, Tuesday. Audience and practical guide criterion confirmed.",
        at,
      ),
      1,
      at,
    ),
  };
  let caseEvents = recordCaseEvent(
    [],
    c,
    "leo",
    "Accept responsibility",
    "Follow up",
    at,
  );
  caseEvents = recordCaseEvent(
    caseEvents,
    c,
    "leo",
    "Propose resolution",
    "Brief resolved",
    at,
  );
  caseEvents = recordCaseEvent(
    caseEvents,
    c,
    "maya",
    "Approve resolution",
    "Receipt checked",
    at,
  );
  return { ...c, caseEvents };
}
const record = (
  e: WorkshopEvent[],
  c: WorkshopContext,
  a: WorkshopActor,
  action: WorkshopAction,
  allocation?: WorkshopAllocation,
) =>
  recordWorkshopEvent(
    e,
    c,
    a,
    action,
    "Review constraints and exact scoped work; simulated availability acceptance only.",
    at,
    allocation,
  );
function prepared(c = context()) {
  let e = record([], c, "owner", "Offer facilitation", {
    facilitator: "leo",
    reviewer: "owner",
  });
  e = record(e, c, "leo", "Accept facilitation");
  e = record(e, c, "leo", "Submit preparation");
  return record(e, c, "owner", "Preparation ready");
}
test("Maya can accept while Leo independently reviews; no offer or actor grants self review", () => {
  const c = context();
  expect(
    record([], c, "owner", "Offer facilitation", {
      facilitator: "maya",
      reviewer: "maya",
    }),
  ).toEqual([]);
  expect(
    record([], c, "owner", "Offer facilitation", {
      facilitator: "research",
      reviewer: "owner",
    } as any),
  ).toEqual([]);
  let e = record([], c, "owner", "Offer facilitation", {
    facilitator: "maya",
    reviewer: "leo",
  });
  expect(
    workshopScenario(knowledgeOrganization, e, c).assignments.find(
      (a) => a.id === "K-02-F",
    )?.workerId,
  ).toBeUndefined();
  expect(record(e, c, "leo", "Accept facilitation")).toBe(e);
  e = record(e, c, "maya", "Accept facilitation");
  expect(workshopProgress(e, c).facilitator).toBe("maya");
  e = record(e, c, "maya", "Submit preparation");
  expect(record(e, c, "maya", "Preparation ready")).toBe(e);
  e = record(e, c, "leo", "Preparation ready");
  expect(record(e, c, "leo", "Session succeeded")).toBe(e);
  e = record(e, c, "maya", "Session succeeded");
  e = record(e, c, "maya", "Record observations");
  expect(record(e, c, "maya", "Criterion met in simulation")).toBe(e);
  e = record(e, c, "leo", "Criterion met in simulation");
  expect(workshopProgress(e, c).closed).toBe(true);
  expect(
    workshopScenario(knowledgeOrganization, e, c).bindings.find(
      (b) => b.role === "Facilitator",
    )?.workerId,
  ).toBe("maya");
});
test("handoff preserves responsibility until acceptance; accepting resets all prior readiness", () => {
  const c = context();
  let e = prepared(c);
  const offered = record(e, c, "owner", "Propose facilitator handoff", {
    facilitator: "maya",
    reviewer: "owner",
  });
  expect(workshopProgress(offered, c).facilitator).toBe("leo");
  expect(workshopProgress(offered, c).actor).toBe("maya");
  expect(record(offered, c, "leo", "Session succeeded")).toBe(offered);
  expect(record(offered, c, "leo", "Accept facilitator handoff")).toBe(offered);
  e = record(offered, c, "maya", "Accept facilitator handoff");
  expect(e.at(-1)?.handoffId).toBe(offered.at(-1)?.id);
  expect(workshopProgress(e, c).facilitator).toBe("maya");
  expect(workshopProgress(e, c).stage).toBe("Accept facilitation");
  expect(
    workshopProgress(e, c).activeRecords.some(
      (x) => x.action === "Preparation ready",
    ),
  ).toBe(false);
  expect(record(e, c, "maya", "Session succeeded")).toBe(e);
  expect(record(e, c, "leo", "Submit preparation")).toBe(e);
  expect(
    workshopScenario(knowledgeOrganization, e, c).assignments.find(
      (a) => a.id === "K-02-F",
    )?.workerId,
  ).toBe("maya");
  e = record(e, c, "maya", "Submit preparation");
  e = record(e, c, "owner", "Preparation ready");
  e = record(e, c, "maya", "Session succeeded");
  expect(
    record(e, c, "owner", "Propose facilitator handoff", {
      facilitator: "leo",
      reviewer: "owner",
    }),
  ).toBe(e);
});
test("decline/cancel resumes retained stage; reviewer conflict and stale source block transfer", () => {
  const c = context(),
    e = prepared(c),
    target = { facilitator: "maya", reviewer: "owner" } as const;
  const offer = record(e, c, "owner", "Propose facilitator handoff", target);
  for (const [actor, action] of [
    ["maya", "Decline facilitator handoff"],
    ["owner", "Cancel facilitator handoff"],
  ] as const) {
    const next = record(offer, c, actor, action);
    expect(workshopProgress(next, c).facilitator).toBe("leo");
    expect(workshopProgress(next, c).stage).toBe("Preparation ready");
    expect(workshopProgress(next, c).pending).toBeUndefined();
  }
  expect(
    record(e, c, "owner", "Propose facilitator handoff", {
      facilitator: "maya",
      reviewer: "leo",
    }),
  ).toBe(e);
  const changed = {
    ...c,
    brief: deliverBrief(c.brief, "Changed audience", at),
  };
  expect(record(offer, changed, "maya", "Accept facilitator handoff")).toBe(
    offer,
  );
  const cancelled = record(offer, changed, "owner", "Cancel workshop");
  expect(workshopProgress(cancelled, changed).accepted).toBe(false);
  let legacy = record([], c, "owner", "Offer facilitation");
  legacy = record(legacy, c, "leo", "Accept facilitation");
  expect(
    record(legacy, c, "owner", "Propose facilitator handoff", {
      facilitator: "maya",
      reviewer: "maya",
    }),
  ).toBe(legacy);
});
test("v14 replay rejects forged allocation, reviewer, handoff links and schema downgrade", () => {
  const c = context();
  let e = record(prepared(c), c, "owner", "Propose facilitator handoff", {
    facilitator: "maya",
    reviewer: "owner",
  });
  e = record(e, c, "maya", "Accept facilitator handoff");
  const raw = encodeKnowledgeCheckpoint({
    ...c,
    adoptions: [],
    workshopEvents: e,
  });
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v14");
  expect(parseKnowledgeCheckpoint(raw).state.workshopEvents).toEqual(e);
  for (const mutate of [
    (x: any) => (x.state.workshopEvents[0].allocation.reviewer = "leo"),
    (x: any) => (x.state.workshopEvents[0].allocation.unrecognized = true),
    (x: any) => (x.state.workshopEvents[4].allocation.facilitator = "research"),
    (x: any) => (x.state.workshopEvents[5].actor = "leo"),
    (x: any) => (x.state.workshopEvents[5].handoffId = "invented"),
    (x: any) => (x.format = "forge.knowledge-workspace.v13"),
  ]) {
    const x = JSON.parse(raw);
    mutate(x);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
  const state = { ...c, adoptions: [], workshopEvents: e };
  const patternEvents = recordPatternEvent(
    [],
    state,
    "owner",
    "Adopt guidance",
    "K-02",
    "pattern-v2",
    "",
    "Inspect new allocation",
    at,
  );
  const historical = { ...c, adoptions: [], patternEvents };
  expect(JSON.parse(encodeKnowledgeCheckpoint(historical)).format).toBe(
    "forge.knowledge-workspace.v14",
  );
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(historical)).state
      .patternEvents,
  ).toEqual(patternEvents);
});
for (const width of [390, 1280])
  test(`candidate selection, accepted handoff and independent review ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const c = context(),
      raw = encodeKnowledgeCheckpoint({ ...c, adoptions: [] });
    await page.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
      },
      { key: knowledgeCheckpointKey, raw },
    );
    await page.goto("/#/organizations/knowledge/workshop/K-02?persona=leo");
    await page
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review saved workspace", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    const panel = page.getByRole("region", {
      name: "Local workshop lifecycle",
    });
    async function act(
      actor: string,
      action: string,
      facilitator?: string,
      reviewer?: string,
    ) {
      await panel
        .getByLabel("Workshop actor", { exact: true })
        .selectOption(actor);
      await panel
        .getByLabel("Workshop action", { exact: true })
        .selectOption(action);
      if (facilitator)
        await panel
          .getByLabel("Proposed facilitator", { exact: true })
          .selectOption(facilitator);
      if (reviewer)
        await panel
          .getByLabel("Independent workshop reviewer", { exact: true })
          .selectOption(reviewer);
      await panel
        .getByLabel("Workshop evidence and rationale", { exact: true })
        .fill(
          "Explicit local capability/availability constraints acknowledged; exact remaining work accepted. No real scheduling.",
        );
      await panel
        .getByRole("button", { name: "Review workshop record", exact: true })
        .click();
      await panel
        .getByRole("button", { name: "Confirm workshop record", exact: true })
        .click();
    }
    await act("owner", "Offer facilitation", "maya", "leo");
    await act("maya", "Decline facilitation");
    await act("owner", "Offer facilitation", "leo", "owner");
    await act("leo", "Accept facilitation");
    await act("leo", "Submit preparation");
    await act("owner", "Preparation ready");
    await act("owner", "Propose facilitator handoff", "maya");
    await expect(
      panel.getByText(
        /Current facilitator: Leo\. Reviewer: Demo organization owner/,
      ),
    ).toBeVisible();
    await act("maya", "Accept facilitator handoff");
    await expect(
      panel.getByText(
        /Current facilitator: Maya\. Reviewer: Demo organization owner/,
      ),
    ).toBeVisible();
    await expect(
      panel.getByRole("heading", { name: "Preparation ready", exact: true }),
    ).toHaveCount(0);
    await act("maya", "Submit preparation");
    await act("owner", "Preparation ready");
    await act("maya", "Session succeeded");
    await act("maya", "Record observations");
    await act("owner", "Criterion met in simulation");
    const summary = page.getByText(
      "Save or restore whole Knowledge workspace",
      { exact: true },
    );
    if (
      !(await summary.evaluate((el) => el.parentElement!.hasAttribute("open")))
    )
      await summary.click();
    await page
      .getByRole("button", { name: "Save workspace checkpoint", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm save workspace", exact: true })
      .click();
    const saved = await page.evaluate(
      (key) => localStorage.getItem(key),
      knowledgeCheckpointKey,
    );
    expect(
      workshopProgress(
        parseKnowledgeCheckpoint(saved!).state.workshopEvents!,
        c,
      ).facilitator,
    ).toBe("maya");
    await page.reload();
    await page
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review saved workspace", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    await expect(panel.getByText(/Current facilitator: Maya/)).toBeVisible();
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/work?persona=maya"),
    );
    await expect(
      page.getByText("Facilitate the workshop", { exact: true }).first(),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  });

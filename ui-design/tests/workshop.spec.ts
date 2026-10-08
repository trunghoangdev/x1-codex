import { test, expect } from "@playwright/test";
import { emptyContribution } from "../src/data/humanContribution";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import { recordCaseEvent } from "../src/data/caseLifecycle";
import {
  availableWorkshopActions,
  recordWorkshopEvent,
  workshopProgress,
  workshopScenario,
  type WorkshopContext,
  type WorkshopEvent,
  type WorkshopActor,
  type WorkshopAction,
} from "../src/data/workshop";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
} from "../src/data/knowledgeCheckpoint";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
const at = "2026-10-01T12:00:00Z";
function context(): WorkshopContext {
  const c = {
    contribution: emptyContribution(),
    brief: receiveBrief(
      deliverBrief(
        { versions: [] },
        "New members, Tuesday workshop, practical welcome-guide exercise",
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
    "Audience and schedule confirmed",
    at,
  );
  caseEvents = recordCaseEvent(
    caseEvents,
    c,
    "maya",
    "Approve resolution",
    "Exact brief and receipt checked",
    at,
  );
  return { ...c, caseEvents };
}
const record = (
  events: WorkshopEvent[],
  c: WorkshopContext,
  actor: WorkshopActor,
  action: WorkshopAction,
) =>
  recordWorkshopEvent(
    events,
    c,
    actor,
    action,
    "New members practice finding next steps; simulated observation only, no real participants.",
    at,
  );
function prepared(c = context()) {
  let e = record([], c, "owner", "Offer facilitation");
  e = record(e, c, "leo", "Accept facilitation");
  e = record(e, c, "leo", "Submit preparation");
  return record(e, c, "maya", "Preparation ready");
}
test("allocation acceptance, preparation, execution, evidence and independent outcome are distinct", () => {
  const c = context();
  expect(
    record([], { ...c, caseEvents: [] }, "owner", "Offer facilitation"),
  ).toEqual([]);
  let e = record([], c, "owner", "Offer facilitation");
  expect(
    workshopScenario(knowledgeOrganization, e, c).assignments.find(
      (a) => a.id === "K-02-F",
    )?.workerId,
  ).toBeUndefined();
  expect(record(e, c, "owner", "Accept facilitation")).toBe(e);
  e = record(e, c, "leo", "Accept facilitation");
  const projection = workshopScenario(knowledgeOrganization, e, c);
  expect(projection.assignments.find((a) => a.id === "K-02-F")?.workerId).toBe(
    "leo",
  );
  expect(
    projection.bindings.find((b) => b.role === "Facilitator")?.scopeIds,
  ).toEqual(["scope-K-02"]);
  expect(record(e, c, "leo", "Session succeeded")).toBe(e);
  e = record(e, c, "leo", "Submit preparation");
  expect(record(e, c, "leo", "Preparation ready")).toBe(e);
  e = record(e, c, "maya", "Preparation changes needed");
  e = record(e, c, "leo", "Submit preparation");
  e = record(e, c, "maya", "Preparation ready");
  e = record(e, c, "leo", "Session succeeded");
  expect(record(e, c, "maya", "Criterion met in simulation")).toBe(e);
  e = record(e, c, "leo", "Record observations");
  expect(record(e, c, "leo", "Criterion met in simulation")).toBe(e);
  e = record(e, c, "maya", "Criterion met in simulation");
  expect(workshopProgress(e, c).closed).toBe(true);
  const next = record(e, c, "owner", "Offer facilitation");
  expect(next.at(-1)?.cycle).toBe(2);
  expect(workshopProgress(next, c).accepted).toBe(false);
  expect(record(next, c, "leo", "Session succeeded")).toBe(next);
});
test("source change blocks pre-execution; post-execution observations stay bound to history", () => {
  const c = context(),
    e = prepared(c);
  const changed = {
    ...c,
    brief: deliverBrief(c.brief, "Changed audience", at),
  };
  expect(workshopProgress(e, changed).stale).toBe(true);
  expect(record(e, changed, "leo", "Session succeeded")).toBe(e);
  const cancelled = record(e, changed, "owner", "Cancel workshop");
  expect(
    workshopScenario(
      knowledgeOrganization,
      cancelled,
      changed,
    ).assignments.find((a) => a.id === "K-02-F")?.workerId,
  ).toBeUndefined();
  expect(record(cancelled, changed, "owner", "Offer facilitation")).toBe(
    cancelled,
  );
  const executed = record(e, c, "leo", "Session succeeded");
  const observed = record(executed, changed, "leo", "Record observations");
  expect(observed.length).toBe(executed.length + 1);
  expect(observed.at(-1)?.source).toBe(e[0].source);
  expect(
    record(observed, changed, "maya", "Insufficient evidence").at(-1)?.action,
  ).toBe("Insufficient evidence");
  const reopened = {
    ...c,
    caseEvents: recordCaseEvent(
      c.caseEvents,
      c,
      "leo",
      "Reopen case",
      "More coordination",
      at,
    ),
  };
  expect(availableWorkshopActions(e, reopened, "leo")).toEqual([]);
});
test("failure, decline, empty notes and chronology cannot manufacture positive outcomes", () => {
  const c = context();
  let e = record(prepared(c), c, "leo", "Session failed");
  expect(record(e, c, "maya", "Criterion met in simulation")).toBe(e);
  expect(record(e, c, "leo", "Record observations")).toBe(e);
  e = record(e, c, "maya", "Insufficient evidence");
  expect(e.at(-1)?.action).toBe("Insufficient evidence");
  const offered = record([], c, "owner", "Offer facilitation");
  const declined = record(offered, c, "leo", "Decline facilitation");
  expect(workshopProgress(declined, c).accepted).toBe(false);
  expect(
    recordWorkshopEvent(offered, c, "leo", "Accept facilitation", " ", at),
  ).toBe(offered);
  expect(
    recordWorkshopEvent(
      offered,
      c,
      "leo",
      "Accept facilitation",
      "Yes",
      "2020-01-01",
    ),
  ).toBe(offered);
  let capped: WorkshopEvent[] = [];
  for (let i = 0; i < 20; i++) {
    capped = record(capped, c, "owner", "Offer facilitation");
    capped = record(capped, c, "leo", "Decline facilitation");
  }
  expect(capped.length).toBe(40);
  expect(record(capped, c, "owner", "Offer facilitation")).toBe(capped);
});
test("v12 checkpoint replays frozen source, actors and ordering; forged history rejected", () => {
  const c = context(),
    workshopEvents = prepared(c),
    state = { ...c, adoptions: [], workshopEvents };
  const raw = encodeKnowledgeCheckpoint(state);
  expect(parseKnowledgeCheckpoint(raw).state).toEqual(state);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v12");
  expect(
    knowledgeTimeline(state).filter((e) => e.kind === "Workshop delivery"),
  ).toHaveLength(4);
  for (const mutate of [
    (x: any) => (x.state.workshopEvents[1].actor = "owner"),
    (x: any) => (x.state.workshopEvents[0].source = "{}"),
    (x: any) => (x.state.workshopEvents[2].previousId = "invented"),
    (x: any) => x.state.caseEvents.pop(),
    (x: any) =>
      (x.state.workshopEvents[0].context.brief.versions[0].body = "rewritten"),
  ]) {
    const x = JSON.parse(raw);
    mutate(x);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
});
for (const width of [1280, 390])
  test(`workshop local loop and checkpoint recovery at ${width}px`, async ({
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
    for (const [actor, action] of [
      ["owner", "Offer facilitation"],
      ["leo", "Accept facilitation"],
      ["leo", "Submit preparation"],
      ["maya", "Preparation ready"],
      ["leo", "Session succeeded"],
      ["leo", "Record observations"],
      ["maya", "Criterion met in simulation"],
    ]) {
      await panel
        .getByLabel("Workshop actor", { exact: true })
        .selectOption(actor);
      await panel
        .getByLabel("Workshop action", { exact: true })
        .selectOption(action);
      await panel
        .getByLabel("Workshop evidence and rationale", { exact: true })
        .fill(
          "Simulated exercise: members identify next steps. Limited local evidence; no real participants.",
        );
      await panel
        .getByRole("button", { name: "Review workshop record", exact: true })
        .click();
      await panel
        .getByRole("button", { name: "Confirm workshop record", exact: true })
        .click();
    }
    await expect(
      panel.getByRole("heading", {
        name: "Criterion met in simulation",
        exact: true,
      }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    const recovery = page.getByText(
      "Save or restore whole Knowledge workspace",
      { exact: true },
    );
    if (
      !(await recovery.evaluate((el) => el.parentElement!.hasAttribute("open")))
    )
      await recovery.click();
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
    expect(parseKnowledgeCheckpoint(saved!).state.workshopEvents).toHaveLength(
      7,
    );
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
    await expect(
      panel.getByRole("heading", {
        name: "Criterion met in simulation",
        exact: true,
      }),
    ).toBeVisible();
    await page.evaluate(
      () =>
        (location.hash =
          "/organizations/knowledge/timeline?persona=leo&timelineKind=Workshop+delivery"),
    );
    await expect(
      page.getByText("Criterion met in simulation", { exact: true }).first(),
    ).toBeVisible();
  });

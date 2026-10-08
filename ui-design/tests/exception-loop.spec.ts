import { recordPatternEvent } from "../src/data/patternAdoption";
import { replaceKnowledge } from "../src/data/knowledgeCheckpoint";
import { test, expect } from "@playwright/test";
import { emptyContribution } from "../src/data/humanContribution";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import { recordCaseEvent } from "../src/data/caseLifecycle";
import {
  recordWorkshopEvent,
  type WorkshopAction,
  type WorkshopActor,
} from "../src/data/workshop";
import {
  exceptionSources,
  exceptionActions,
  exceptionProgress,
  recordException,
  type ExceptionContext,
  type ExceptionEvent,
  type ExceptionAction,
} from "../src/data/exceptionLoop";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
} from "../src/data/knowledgeCheckpoint";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
const at = "2026-10-01T12:00:00Z";
const initial = (): ExceptionContext => ({
  brief: { versions: [] },
  contribution: emptyContribution(),
  caseEvents: [],
  workshopEvents: [],
});
function remedy(c: ExceptionContext) {
  return {
    ...c,
    brief: receiveBrief(
      deliverBrief(c.brief, "New members, Tuesday, practical exercise", at),
      c.brief.versions.length + 1,
      at,
    ),
  };
}
function record(
  e: ExceptionEvent[],
  c: ExceptionContext,
  a: ExceptionEvent["actor"],
  action: ExceptionAction,
) {
  return recordException(
    e,
    c,
    a,
    action,
    "exception-1",
    "Exact evidence and rationale",
    at,
    exceptionSources(c)[0]?.id,
    action === "Offer handling" ? "leo" : undefined,
  );
}
function accepted(c = initial()) {
  let e = record([], c, "owner", "Open exception");
  e = record(e, c, "owner", "Offer handling");
  return record(e, c, "leo", "Accept handling");
}
function workspace(c: ExceptionContext, e: ExceptionEvent[]) {
  return {
    brief: c.brief,
    contribution: c.contribution,
    adoptions: [],
    ...(c.caseEvents.length ? { caseEvents: c.caseEvents } : {}),
    ...(c.workshopEvents.length ? { workshopEvents: c.workshopEvents } : {}),
    exceptionEvents: e,
  };
}
function ready() {
  let c = remedy(initial());
  for (const [actor, action] of [
    ["leo", "Accept responsibility"],
    ["leo", "Propose resolution"],
    ["maya", "Approve resolution"],
  ] as const)
    c = {
      ...c,
      caseEvents: recordCaseEvent(
        c.caseEvents,
        { brief: c.brief, contribution: c.contribution },
        actor,
        action,
        "Current brief verified",
        at,
      ),
    };
  return c;
}
function w(c: ExceptionContext, actor: WorkshopActor, action: WorkshopAction) {
  return {
    ...c,
    workshopEvents: recordWorkshopEvent(
      c.workshopEvents,
      {
        brief: c.brief,
        contribution: c.contribution,
        caseEvents: c.caseEvents,
      },
      actor,
      action,
      "Simulation with explicit limits",
      at,
    ),
  };
}
test("explicit owner allocation, acceptance, remedy and independent review remain separate", () => {
  const c = initial();
  expect(exceptionSources(c)).toHaveLength(1);
  expect(exceptionActions([], "", c, "owner")).toEqual([]);
  let e = record([], c, "owner", "Open exception");
  expect(record(e, c, "owner", "Open exception")).toBe(e);
  expect(record(e, c, "leo", "Offer handling")).toBe(e);
  e = record(e, c, "owner", "Offer handling");
  expect(exceptionProgress(e, "exception-1", c).actor).toBe("leo");
  expect(record(e, c, "maya", "Accept handling")).toBe(e);
  e = record(e, c, "leo", "Decline handling");
  expect(exceptionProgress(e, "exception-1", c).actor).toBe("owner");
  e = record(e, c, "owner", "Offer handling");
  e = record(e, c, "leo", "Accept handling");
  expect(record(e, c, "leo", "Submit resolution")).toBe(e);
  const r = remedy(c);
  e = record(e, r, "leo", "Submit resolution");
  expect(record(e, r, "leo", "Close exception")).toBe(e);
  e = record(e, r, "owner", "Request more work");
  e = record(e, r, "leo", "Submit resolution");
  e = record(e, r, "owner", "Close exception");
  expect(exceptionProgress(e, "exception-1", r).closed).toBe(true);
  expect(r.workshopEvents).toEqual([]);
  expect(r.caseEvents).toEqual([]);
  e = record(e, r, "owner", "Reopen exception");
  expect(exceptionActions(e, "exception-1", r, "leo")).toEqual([]);
  expect(exceptionActions(e, "exception-1", r, "owner")).toContain(
    "Offer handling",
  );
});
test("changed exact remedy blocks closure until a fresh response", () => {
  let c = remedy(initial()),
    e = record(accepted(), c, "leo", "Submit resolution");
  c = remedy(c);
  expect(exceptionProgress(e, "exception-1", c).stale).toBe(true);
  expect(record(e, c, "owner", "Close exception")).toBe(e);
  e = record(e, c, "owner", "Request more work");
  e = record(e, c, "leo", "Submit resolution");
  expect(record(e, c, "owner", "Close exception")).toHaveLength(e.length + 1);
});
test("declined allocation and failed session require later operational remedies", () => {
  let c = w(ready(), "owner", "Offer facilitation");
  c = w(c, "leo", "Decline facilitation");
  let e = accepted(c);
  c = w(c, "owner", "Offer facilitation");
  expect(record(e, c, "leo", "Submit resolution")).toBe(e);
  c = w(c, "leo", "Accept facilitation");
  expect(record(e, c, "leo", "Submit resolution")).toHaveLength(e.length + 1);
  c = w(c, "leo", "Submit preparation");
  c = w(c, "maya", "Preparation ready");
  c = w(c, "leo", "Session failed");
  e = accepted(c);
  expect(record(e, c, "leo", "Submit resolution")).toBe(e);
  c = w(c, "maya", "Insufficient evidence");
  c = w(c, "owner", "Offer facilitation");
  c = w(c, "leo", "Accept facilitation");
  c = w(c, "leo", "Submit preparation");
  c = w(c, "maya", "Preparation ready");
  expect(record(e, c, "leo", "Submit resolution")).toBe(e);
  c = w(c, "leo", "Session succeeded");
  expect(record(e, c, "leo", "Submit resolution")).toHaveLength(e.length + 1);
});
test("checkpoint v15 replays exact actors, issue, remedy and review references", () => {
  const c = remedy(initial());
  let e = record(accepted(), c, "leo", "Submit resolution");
  e = record(e, c, "owner", "Close exception");
  const state = workspace(c, e),
    raw = encodeKnowledgeCheckpoint(state);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v15");
  expect(parseKnowledgeCheckpoint(raw).state).toEqual(state);
  expect(
    knowledgeTimeline(state).filter((e) => e.kind === "Exception follow-up"),
  ).toHaveLength(5);
  for (const mutate of [
    (s: any) => (s.exceptionEvents[0].source.snapshot = "{}"),
    (s: any) => (s.exceptionEvents[2].actor = "maya"),
    (s: any) => (s.exceptionEvents[3].resolution = "forged"),
    (s: any) => (s.exceptionEvents[4].proposalId = "unknown"),
    (s: any) => (s.exceptionEvents[1].assignee = "owner"),
    (s: any) => (s.exceptionEvents[0].context.workshopEvents = [{}]),
    (s: any) => (s.exceptionEvents[3].at = "2020-01-01"),
  ]) {
    const x = JSON.parse(raw);
    mutate(x.state);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
  const x = JSON.parse(raw);
  x.format = "forge.knowledge-workspace.v14";
  expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  const full = Array.from({ length: 40 }, () => e[0]);
  expect(record(full, c, "owner", "Open exception")).toBe(full);
});
for (const width of [1440, 390])
  test(`exception handling works and survives recovery at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const c = initial(),
      raw = encodeKnowledgeCheckpoint(workspace(c, []));
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
      key: knowledgeCheckpointKey,
      raw,
    });
    await page.goto("/#/organizations/knowledge/exceptions?persona=leo");
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
      name: "Local exception lifecycle",
    });
    async function act(action: string, actor: string) {
      await panel
        .getByLabel("Exception actor", { exact: true })
        .selectOption(actor);
      await panel
        .getByLabel("Exception action", { exact: true })
        .selectOption(action);
      await panel
        .getByLabel("Exception response and rationale")
        .fill("Investigate exact current brief input");
      await panel
        .getByRole("button", { name: "Review exception record", exact: true })
        .click();
      await panel
        .getByRole("button", { name: "Confirm exception record", exact: true })
        .click();
    }
    await act("Open exception", "owner");
    await act("Offer handling", "owner");
    await act("Accept handling", "leo");
    await expect(
      panel.getByLabel("Exception action", { exact: true }),
    ).not.toContainText("Submit resolution");
    await panel
      .getByRole("button", { name: "Inspect underlying issue", exact: true })
      .click();
    await expect(page).toHaveURL(/workstreams\/K-02/);
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/work?persona=leo"),
    );
    await expect(
      page.getByRole("region", { name: "Exception responsibilities" }),
    ).toContainText("exception-1");
    await page
      .getByRole("button", { name: "Open exception handling", exact: true })
      .click();
    await expect(panel).toContainText("Accept handling");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test("handler submits and owner closes, reopens and restores the whole exception history", async ({
  page,
}) => {
  const c = remedy(initial());
  const raw = encodeKnowledgeCheckpoint(workspace(c, accepted()));
  await page.addInitScript(
    ({ key, raw }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
    },
    { key: knowledgeCheckpointKey, raw },
  );
  await page.goto("/#/organizations/knowledge/exceptions?persona=leo");
  const recovery = page.getByText("Save or restore whole Knowledge workspace", {
    exact: true,
  });
  await recovery.click();
  await page
    .getByRole("button", { name: "Review saved workspace", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm workspace replacement", exact: true })
    .click();
  const panel = page.getByRole("region", { name: "Local exception lifecycle" });
  async function act(action: string, actor: string) {
    await panel
      .getByLabel("Exception actor", { exact: true })
      .selectOption(actor);
    await panel
      .getByLabel("Exception action", { exact: true })
      .selectOption(action);
    await panel
      .getByLabel("Exception response and rationale")
      .fill("Reviewed latest received brief as the specific remedy");
    await panel
      .getByRole("button", { name: "Review exception record", exact: true })
      .click();
    await panel
      .getByRole("button", { name: "Confirm exception record", exact: true })
      .click();
  }
  await act("Submit resolution", "leo");
  await expect(panel).toContainText("Owner independently reviews");
  await act("Close exception", "owner");
  await expect(panel).toContainText("No pending exception response");
  await act("Reopen exception", "owner");
  await page
    .getByRole("button", { name: "Save workspace checkpoint", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm save workspace", exact: true })
    .click();
  await page.reload();
  await recovery.click();
  await page
    .getByRole("button", { name: "Review saved workspace", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm workspace replacement", exact: true })
    .click();
  await expect(panel).toContainText("Reopen exception");
  await expect(
    panel.getByLabel("Exception action", { exact: true }),
  ).toContainText("Offer handling");
});

test("v15 retains allocated workshop contexts and bounded pattern snapshots across partial replacement", () => {
  let c = ready();
  c = {
    ...c,
    workshopEvents: recordWorkshopEvent(
      [],
      {
        brief: c.brief,
        contribution: c.contribution,
        caseEvents: c.caseEvents,
      },
      "owner",
      "Offer facilitation",
      "Explicit independent allocation",
      at,
      { facilitator: "maya", reviewer: "leo" },
    ),
  };
  c = w(c, "maya", "Decline facilitation");
  let e = accepted(c);
  c = {
    ...c,
    workshopEvents: recordWorkshopEvent(
      c.workshopEvents,
      {
        brief: c.brief,
        contribution: c.contribution,
        caseEvents: c.caseEvents,
      },
      "owner",
      "Offer facilitation",
      "New explicit allocation",
      at,
      { facilitator: "maya", reviewer: "leo" },
    ),
  };
  c = w(c, "maya", "Accept facilitation");
  e = record(e, c, "leo", "Submit resolution");
  e = record(e, c, "owner", "Close exception");
  const state = workspace(c, e);
  const patternEvents = recordPatternEvent(
    [],
    state,
    "owner",
    "Adopt guidance",
    "K-02",
    "pattern-v2",
    "",
    "New guidance",
    at,
  );
  expect(patternEvents).toHaveLength(1);
  expect(patternEvents[0].context).not.toHaveProperty("exceptionEvents");
  const full = { ...state, patternEvents };
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(full)).state,
  ).toEqual(full);
  const partial = replaceKnowledge(full, {
    kind: "contribution",
    contribution: emptyContribution(),
  });
  expect(partial.exceptionEvents).toEqual(e);
  const x = JSON.parse(encodeKnowledgeCheckpoint(full));
  x.state.exceptionEvents[0].context.workshopEvents[0].allocation.reviewer =
    "maya";
  expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
});

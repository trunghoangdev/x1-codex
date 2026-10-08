import {
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
  type HumanContributionState,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import {
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
  continueUse,
} from "../src/data/authorizedUse";
import { recordCaseEvent } from "../src/data/caseLifecycle";
import {
  recordWorkshopEvent,
  workshopProgress,
  type WorkshopEvent,
} from "../src/data/workshop";
import { test, expect } from "@playwright/test";
import {
  recordPatternEvent,
  activePattern,
  patternWork,
  workPattern,
  type PatternContext,
  type PatternEvent,
} from "../src/data/patternAdoption";
import { emptyContribution } from "../src/data/humanContribution";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  replaceKnowledge,
} from "../src/data/knowledgeCheckpoint";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
import { changeImpact } from "../src/data/changeImpact";
const at = "2026-10-01T12:00:00Z";
function context(): PatternContext {
  return {
    contribution: emptyContribution(),
    brief: deliverBrief({ versions: [] }, "Workshop brief for new members", at),
    adoptions: [],
  };
}
function record(
  events: PatternEvent[],
  c: PatternContext,
  action: PatternEvent["action"],
  version: string,
  workId = "",
  actor = "owner",
) {
  return recordPatternEvent(
    events,
    c,
    actor,
    action,
    "K-02",
    version,
    workId,
    "Compatibility inspected; retain existing records and their original version.",
    at,
  );
}
test("explicit guidance selection and work association preserve version across upgrade, rollback and new work", () => {
  const c = context();
  let e = record([], c, "Adopt guidance", "pattern-v1");
  const w = patternWork(c, "K-02")[0];
  expect(workPattern(e, "K-02", w)).toBeUndefined();
  e = record(e, c, "Associate work", "pattern-v1", w.id);
  expect(workPattern(e, "K-02", w)?.version).toBe("pattern-v1");
  expect(record(e, c, "Associate work", "pattern-v1", w.id)).toBe(e);
  e = record(e, c, "Adopt guidance", "pattern-v2");
  expect(activePattern(e, "K-02")?.supersedes).toBe("pattern-event-1");
  expect(workPattern(e, "K-02", w)?.version).toBe("pattern-v1");
  const received = { ...c, brief: receiveBrief(c.brief, 1, at) };
  expect(
    workPattern(e, "K-02", patternWork(received, "K-02")[0])?.version,
  ).toBe("pattern-v1");
  const next = {
    ...received,
    brief: deliverBrief(received.brief, "New workshop scope", at),
  };
  const newWork = patternWork(next, "K-02")[1];
  expect(workPattern(e, "K-02", newWork)).toBeUndefined();
  expect(record(e, next, "Associate work", "pattern-v1", newWork.id)).toBe(e);
  e = record(e, next, "Associate work", "pattern-v2", newWork.id);
  expect(workPattern(e, "K-02", newWork)?.version).toBe("pattern-v2");
  expect(
    changeImpact({ ...next, patternEvents: e }).find(
      (r) => r.id === "pattern-K-02",
    )?.status,
  ).toBe("Historical");
  e = record(e, next, "Adopt guidance", "pattern-v1");
  expect(workPattern(e, "K-02", newWork)?.version).toBe("pattern-v2");
  expect(activePattern(e, "K-01")).toBeUndefined();
});
test("owner-only bounded transitions, validation and immutable contexts", () => {
  const c = context();
  expect(record([], c, "Adopt guidance", "pattern-v1", "", "observer")).toEqual(
    [],
  );
  expect(record([], c, "Associate work", "pattern-v1", "brief:1")).toEqual([]);
  expect(record([], c, "Adopt guidance", "unknown")).toEqual([]);
  let e = record([], c, "Adopt guidance", "pattern-v1");
  expect(record(e, c, "Adopt guidance", "pattern-v1")).toBe(e);
  expect(
    recordPatternEvent(
      e,
      c,
      "owner",
      "Adopt guidance",
      "K-02",
      "pattern-v2",
      "",
      " ",
      at,
    ),
  ).toBe(e);
  expect(
    recordPatternEvent(
      e,
      c,
      "owner",
      "Adopt guidance",
      "K-02",
      "pattern-v2",
      "",
      "Reason",
      "2020-01-01",
    ),
  ).toBe(e);
  const frozen = e[0].context.brief.versions[0].body;
  c.brief.versions[0].body = "Changed outside model";
  expect(e[0].context.brief.versions[0].body).toBe(frozen);
  for (let i = 1; i < 20; i++)
    e = record(e, c, "Adopt guidance", i % 2 ? "pattern-v2" : "pattern-v1");
  expect(e).toHaveLength(20);
  expect(record(e, c, "Adopt guidance", "pattern-v1")).toBe(e);
});
test("checkpoint v13 replays exact versions, work identities and sources; replacements preserve historical associations", () => {
  const c = context();
  let e = record([], c, "Adopt guidance", "pattern-v1");
  e = record(e, c, "Associate work", "pattern-v1", "brief:1");
  e = record(e, c, "Adopt guidance", "pattern-v2");
  const raw = encodeKnowledgeCheckpoint({ ...c, patternEvents: e });
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v13");
  expect(parseKnowledgeCheckpoint(raw).state.patternEvents).toEqual(e);
  expect(
    knowledgeTimeline({ ...c, patternEvents: e }).filter(
      (r) => r.kind === "Operating pattern",
    ),
  ).toHaveLength(3);
  for (const mutate of [
    (x: any) => (x.state.patternEvents[0].actor = "leo"),
    (x: any) =>
      x.state.patternEvents[0].pattern.exchanges.push("Grant authority"),
    (x: any) => (x.state.patternEvents[1].work.source = "invented"),
    (x: any) => (x.state.patternEvents[1].adoptionId = "invented"),
    (x: any) => (x.state.patternEvents[2].supersedes = "invented"),
    (x: any) => (x.state.patternEvents[0].context.patternEvents = []),
  ]) {
    const x = JSON.parse(raw);
    mutate(x);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
  const absent = { ...c, brief: { versions: [] }, patternEvents: e };
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(absent)).state
      .patternEvents,
  ).toEqual(e);
  expect(
    replaceKnowledge(
      { ...c, patternEvents: e },
      { kind: "contribution", contribution: emptyContribution(), savedAt: at },
    ).patternEvents,
  ).toEqual(e);
  const replacement = {
    ...c,
    brief: deliverBrief(
      { versions: [] },
      "Different source with same version id",
      at,
    ),
  };
  expect(
    workPattern(e, "K-02", patternWork(replacement, "K-02")[0]),
  ).toBeUndefined();
});
test("running workshop retains v1 across v2 selection; new cycle can explicitly use v2 without inheriting readiness", () => {
  let c = context();
  c = { ...c, brief: receiveBrief(c.brief, 1, at) };
  const caseContext = { brief: c.brief, contribution: c.contribution };
  let cases = recordCaseEvent(
    [],
    caseContext,
    "leo",
    "Accept responsibility",
    "Follow up",
    at,
  );
  cases = recordCaseEvent(
    cases,
    caseContext,
    "leo",
    "Propose resolution",
    "Resolved audience",
    at,
  );
  cases = recordCaseEvent(
    cases,
    caseContext,
    "maya",
    "Approve resolution",
    "Exact receipt checked",
    at,
  );
  const ctx = { ...caseContext, caseEvents: cases };
  let workshop: WorkshopEvent[] = [];
  for (const [actor, action] of [
    ["owner", "Offer facilitation"],
    ["leo", "Accept facilitation"],
    ["leo", "Submit preparation"],
    ["maya", "Preparation ready"],
  ] as const)
    workshop = recordWorkshopEvent(
      workshop,
      ctx,
      actor,
      action,
      "Bounded workshop simulation",
      at,
    );
  let state = { ...ctx, adoptions: [], workshopEvents: workshop };
  let e = record([], state, "Adopt guidance", "pattern-v1");
  e = record(
    e,
    state,
    "Associate work",
    "pattern-v1",
    "workshop:workshop-event-1",
  );
  e = record(e, state, "Adopt guidance", "pattern-v2");
  expect(
    workPattern(
      e,
      "K-02",
      patternWork(state, "K-02").find(
        (w) => w.id === "workshop:workshop-event-1",
      )!,
    )?.version,
  ).toBe("pattern-v1");
  expect(workshopProgress(state.workshopEvents, ctx).status).toBe(
    "Preparation ready",
  );
  for (const [actor, action] of [
    ["leo", "Session succeeded"],
    ["leo", "Record observations"],
    ["maya", "Criterion met in simulation"],
    ["owner", "Offer facilitation"],
  ] as const)
    workshop = recordWorkshopEvent(
      workshop,
      ctx,
      actor,
      action,
      "Bounded observations and limitations",
      at,
    );
  state = { ...state, workshopEvents: workshop };
  const latest = patternWork(state, "K-02").at(-1)!;
  e = record(e, state, "Associate work", "pattern-v2", latest.id);
  expect(workPattern(e, "K-02", latest)?.version).toBe("pattern-v2");
  expect(workshopProgress(workshop, ctx).status).toBe("Offer facilitation");
  expect(workshopProgress(workshop, ctx).accepted).toBe(false);
  const restored = parseKnowledgeCheckpoint(
    encodeKnowledgeCheckpoint({ ...state, patternEvents: e }),
  ).state;
  expect(restored.patternEvents).toEqual(e);
  expect(restored.workshopEvents).toEqual(workshop);
});

test("K-01 contribution and use cycles associate independently and keep prior-cycle versions", () => {
  const deliver = (c: HumanContributionState) =>
    receiveContribution(
      submitContributionCommand(
        {
          ...c,
          contributions: c.contributions.map((x, i) =>
            i === c.contributions.length - 1
              ? {
                  ...x,
                  body: "Guide: find the onboarding contact and ask for next steps.",
                  note: "Bounded cohort scope",
                  citesInput: true,
                }
              : x,
          ),
        },
        "projected",
        at,
      ),
      at,
    );
  let contribution = reviseContribution(
    assessContribution(deliver(emptyContribution()), at),
  );
  contribution = reassessContribution(
    deliver(contribution),
    "Suitable for stated scope",
    "Bounded guide reviewed",
    at,
  );
  let use = allocateUseMandate(
    assessedUseSubject(contribution),
    "New members",
    "Bounded use",
    at,
  )!;
  let state = { contribution, brief: { versions: [] }, adoptions: [], use };
  let e = recordPatternEvent(
    [],
    state,
    "owner",
    "Adopt guidance",
    "K-01",
    "pattern-v1",
    "",
    "Choose guide guidance",
    at,
  );
  const first = patternWork(state, "K-01").find((w) =>
    w.id.startsWith("use:"),
  )!;
  e = recordPatternEvent(
    e,
    state,
    "owner",
    "Associate work",
    "K-01",
    "pattern-v1",
    first.id,
    "Associate exact use cycle",
    at,
  );
  expect(
    patternWork(state, "K-01").filter((w) => w.id.startsWith("contribution:")),
  ).toHaveLength(2);
  expect(
    patternWork(state, "K-01")
      .filter((w) => w.id.startsWith("contribution:"))
      .every((w) => !workPattern(e, "K-01", w)),
  ).toBe(true);
  for (const action of [
    "Suitable",
    "Allowed",
    "Failed",
    "Insufficient evidence",
  ] as const)
    use = recordUseStep(use, use.subject, action, "Bounded simulation", at);
  use = continueUse(use, use.subject, "New members", "Fresh use cycle", at);
  state = { ...state, use };
  e = recordPatternEvent(
    e,
    state,
    "owner",
    "Adopt guidance",
    "K-01",
    "pattern-v2",
    "",
    "Keep prior cycle version",
    at,
  );
  const cycles = patternWork(state, "K-01").filter((w) =>
    w.id.startsWith("use:"),
  );
  expect(cycles).toHaveLength(2);
  expect(workPattern(e, "K-01", cycles[0])?.version).toBe("pattern-v1");
  expect(workPattern(e, "K-01", cycles[1])).toBeUndefined();
  e = recordPatternEvent(
    e,
    state,
    "owner",
    "Associate work",
    "K-01",
    "pattern-v2",
    cycles[1].id,
    "Associate fresh cycle",
    at,
  );
  expect(
    parseKnowledgeCheckpoint(
      encodeKnowledgeCheckpoint({ ...state, patternEvents: e }),
    ).state.patternEvents,
  ).toEqual(e);
});

for (const width of [390, 1280])
  test(`pattern adoption, pinned work, upgrade and recovery ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const raw = encodeKnowledgeCheckpoint(context());
    await page.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
      },
      { key: knowledgeCheckpointKey, raw },
    );
    await page.goto("/#/organizations/knowledge/patterns/K-02?persona=leo");
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
      name: "Versioned pattern adoption",
    });
    await expect(
      panel.getByText("No pattern version recorded", { exact: true }),
    ).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Review pattern change", exact: true }),
    ).toBeDisabled();
    await panel
      .getByLabel("Pattern control actor", { exact: true })
      .selectOption("owner");
    for (const [action, version] of [
      ["Adopt guidance", "pattern-v1"],
      ["Associate work", "pattern-v1"],
      ["Adopt guidance", "pattern-v2"],
    ]) {
      await panel
        .getByLabel("Pattern action", { exact: true })
        .selectOption(action);
      await panel
        .getByLabel("Pattern version", { exact: true })
        .selectOption(version);
      await panel
        .getByLabel("Pattern adoption rationale", { exact: true })
        .fill(
          "Compatibility reviewed. Keep previously associated work on its recorded version.",
        );
      await panel
        .getByRole("button", { name: "Review pattern change", exact: true })
        .click();
      await panel
        .getByRole("button", { name: "Confirm pattern change", exact: true })
        .click();
    }
    await expect(
      panel.getByText(
        /pattern-v1 · recorded association pattern-event-2 · retained earlier version/,
      ),
    ).toBeVisible();
    await panel
      .getByRole("button", {
        name: "Inspect work · Workshop brief · v1",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(panel).toBeVisible();
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
    expect(parseKnowledgeCheckpoint(saved!).state.patternEvents).toHaveLength(
      3,
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
      panel.getByText(/Selected guidance: knowledge-workshop · pattern-v2/),
    ).toBeVisible();
    await expect(panel.getByText(/retained earlier version/)).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.evaluate(
      () =>
        (location.hash =
          "/organizations/knowledge/timeline?persona=leo&timelineKind=Operating+pattern"),
    );
    await expect(
      page.getByText("Associate work", { exact: true }).first(),
    ).toBeVisible();
  });

import { test, expect } from "@playwright/test";
import {
  organizationJourney,
  journeyIds,
} from "../src/data/organizationJourney";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
} from "../src/data/knowledgeCheckpoint";
import { workshopProgress } from "../src/data/workshop";
import { exceptionProgress } from "../src/data/exceptionLoop";
import { organizationGoals } from "../src/data/organizationGoals";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
test("one guarded retained journey distinguishes failure, remedy, closure, evidence and result", () => {
  const stages = organizationJourney();
  expect(stages.map((s) => s.id)).toEqual(journeyIds);
  for (const stage of stages) {
    expect(
      parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(stage.state)).state,
    ).toEqual(stage.state);
  }
  const state = (id: string) => stages.find((s) => s.id === id)!.state;
  const progress = (id: string) => {
    const s = state(id);
    return workshopProgress(s.workshopEvents ?? [], {
      brief: s.brief,
      contribution: s.contribution,
      caseEvents: s.caseEvents ?? [],
    });
  };
  const ex = (id: string) => {
    const s = state(id);
    return exceptionProgress(s.exceptionEvents ?? [], "exception-1", {
      brief: s.brief,
      contribution: s.contribution,
      caseEvents: s.caseEvents ?? [],
      workshopEvents: s.workshopEvents ?? [],
    });
  };
  expect(progress("failure").execution?.action).toBe("Session failed");
  expect(ex("failure").closed).toBe(false);
  expect(ex("failure").currentResolution).toBeUndefined();
  expect(progress("recovery").execution?.action).toBe("Session succeeded");
  expect(progress("recovery").closed).toBe(false);
  expect(ex("recovery").currentResolution).toBeTruthy();
  expect(ex("recovery").closed).toBe(false);
  expect(ex("closed").closed).toBe(true);
  expect(progress("closed").stage).toBe("Session succeeded");
  expect(progress("evidence").actor).toBe("maya");
  expect(progress("reviewed").last?.action).toBe("Criterion met in simulation");
  expect(
    organizationGoals(knowledgeOrganization, state("closed"))?.rows.find(
      (r) => r.streamId === "K-02",
    )?.positive,
  ).toBe(false);
  expect(
    organizationGoals(knowledgeOrganization, state("reviewed"))?.rows.find(
      (r) => r.streamId === "K-02",
    )?.positive,
  ).toBe(true);
  const final = state("reviewed");
  expect(
    final.workshopEvents?.filter((e) => e.action === "Offer facilitation"),
  ).toHaveLength(2);
  expect(
    final.workshopEvents?.filter((e) => e.action === "Preparation ready"),
  ).toHaveLength(2);
  expect(final.brief.guideHandoffs?.[0].applicability?.[0].conclusion).toBe(
    "Applicable",
  );
  const finalKeys = new Set(knowledgeTimeline(final).map((e) => e.key));
  for (const stage of stages)
    for (const e of knowledgeTimeline(stage.state))
      expect(finalKeys.has(e.key)).toBe(true);
});

test("journey route accepts only known chapter identities in Knowledge", async () => {
  const { validScenarioPath } = await import("../src/scenarioRoutes");
  expect(
    validScenarioPath(
      "/organizations/knowledge/journey?journeyStep=recovery&persona=maya",
    ),
  ).toBe(true);
  for (const path of [
    "/organizations/knowledge/journey?journeyStep=unknown",
    "/organizations/knowledge?journeyStep=failure",
    "/organizations/large/journey",
  ])
    expect(validScenarioPath(path)).toBe(false);
});
for (const width of [390, 1440])
  test(`guided chapters preserve current work, sources and URL navigation ${width}`, async ({
    page,
  }) => {
    const { knowledgeCheckpointKey } =
      await import("../src/data/knowledgeCheckpoint");
    const { emptyContribution } = await import("../src/data/humanContribution");
    const { deliverBrief } = await import("../src/data/briefHandoff");
    const raw = encodeKnowledgeCheckpoint({
      contribution: emptyContribution(),
      brief: deliverBrief(
        { versions: [] },
        "My own unfinished workshop brief, preserved outside the guided story.",
        "2026-10-01T10:00:00Z",
      ),
      adoptions: [],
    });
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
      key: knowledgeCheckpointKey,
      raw,
    });
    await page.goto("/#/organizations/knowledge?persona=leo");
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
    await page
      .getByRole("button", {
        name: "Explore guided organization journey",
        exact: true,
      })
      .click();
    const chapter = page.getByRole("region", {
      name: "Journey chapter",
      exact: true,
    });
    await expect(chapter).toContainText("Start with a shared goal");
    await expect(
      page.getByRole("region", { name: "Current work actions", exact: true }),
    ).toHaveCount(0);
    for (const id of journeyIds.slice(1)) {
      await chapter
        .getByRole("button", { name: "Next chapter", exact: true })
        .click();
      await expect(page).toHaveURL(new RegExp(`journeyStep=${id}`));
      await expect(
        page
          .getByRole("navigation", {
            name: "Organization journey stages",
            exact: true,
          })
          .locator('[aria-current="step"]'),
      ).toHaveCount(1);
    }
    await expect(chapter).toContainText(
      "Review the result against the purpose",
    );
    await expect(
      chapter.getByRole("button", { name: "Next chapter", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("region", { name: "Workstream coordination", exact: true })
      .getByRole("button", {
        name: "Inspect flow step · K-02 · workshop",
        exact: true,
      })
      .click();
    const source = page.getByRole("region", {
      name: "Journey source preview",
      exact: true,
    });
    await expect(source.getByRole("heading", { level: 2 })).toBeFocused();
    await expect(source).toContainText("Criterion met in simulation");
    await chapter
      .getByRole("button", { name: "Previous chapter", exact: true })
      .click();
    await expect(page).toHaveURL(/journeyStep=evidence/);
    await expect(source).toHaveCount(0);
    await page.goBack();
    await expect(page).toHaveURL(/journeyStep=reviewed/);
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        knowledgeCheckpointKey,
      ),
    ).toBe(raw);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", {
        name: "Back to current Organization",
        exact: true,
      })
      .click();
    await page
      .getByRole("region", { name: "Workstream coordination", exact: true })
      .getByRole("button", { name: "Inspect workstream · K-02", exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Workshop brief handoff", exact: true }),
    ).toContainText("My own unfinished workshop brief");
  });
test("a deep-linked final chapter exports a replayable checkpoint and remains selected after reload", async ({
  page,
}) => {
  await page.goto(
    "/#/organizations/knowledge/journey?persona=leo&journeyStep=reviewed",
  );
  await expect(
    page.getByRole("region", { name: "Journey chapter", exact: true }),
  ).toContainText("Review the result against the purpose");
  await page.reload();
  await expect(
    page.getByRole("region", { name: "Journey chapter", exact: true }),
  ).toContainText("Review the result against the purpose");
  await page
    .getByText("Presenter tools and snapshot export", { exact: true })
    .click();
  const waiting = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download chapter checkpoint", exact: true })
    .click();
  const download = await waiting;
  expect(download.suggestedFilename()).toBe("knowledge-journey-reviewed.json");
  const fs = await import("node:fs/promises");
  const state = parseKnowledgeCheckpoint(
    await fs.readFile((await download.path())!, "utf8"),
  ).state;
  expect(state.workshopEvents?.at(-1)?.action).toBe(
    "Criterion met in simulation",
  );
  expect(state.exceptionEvents?.at(-1)?.action).toBe("Close exception");
});

import { test, expect } from "@playwright/test";
import { knowledgeTimeline, timelinePage } from "../src/data/knowledgeTimeline";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
} from "../src/data/humanContribution";
import { recordKnowledgeResponsibility } from "../src/data/knowledgeResponsibility";
import {
  proposeKnowledgeHandoff,
  respondKnowledgeHandoff,
} from "../src/data/knowledgeHandoff";
import { submitContributionCommand } from "../src/data/contributionCommand";
import {
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
  continueUse,
} from "../src/data/authorizedUse";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import { adoptAgreement } from "../src/data/agreementAdoption";
import { recordApplicability } from "../src/data/scopeApplicability";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
import { validScenarioPath } from "../src/scenarioRoutes";
const at = "2026-10-01T12:00:00Z";
function fixture(): KnowledgeWorkspace {
  let c = emptyContribution();
  c.contributions[0] = {
    ...c.contributions[0],
    body: "Contact onboarding with team and access context.",
    note: "Fictional cohort",
    citesInput: true,
  };
  c = recordKnowledgeResponsibility(
    recordKnowledgeResponsibility(
      c,
      "Offer responsibility",
      "owner",
      "Prepare guide",
      at,
    ),
    "Accept responsibility",
    "leo",
    "Can prepare",
    at,
  );
  c = respondKnowledgeHandoff(
    proposeKnowledgeHandoff(
      c,
      "owner",
      "delegate",
      "Clarify context and submit",
      "Leo unavailable",
      at,
    ),
    "delegate",
    "Accepted",
    "Input and rights inspected",
    true,
    at,
  );
  c = reviseContribution(
    assessContribution(
      receiveContribution(
        submitContributionCommand(c, "projected", at, "delegate"),
        at,
      ),
      at,
    ),
  );
  c.contributions[1] = {
    ...c.contributions[1],
    body: "Revised guide with explicit access contact.",
    note: "Addressed requested next step",
    citesInput: true,
  };
  c = reassessContribution(
    receiveContribution(
      submitContributionCommand(c, "projected", at, "delegate"),
      at,
    ),
    "Suitable for stated scope",
    "Exact guide reviewed",
    at,
  );
  const subject = assessedUseSubject(c)!;
  let use = allocateUseMandate(
    subject,
    "October cohort",
    "Bounded guide publication",
    at,
  )!;
  for (const a of [
    "Suitable",
    "Allowed",
    "Failed",
    "Insufficient evidence",
  ] as const)
    use = recordUseStep(use, subject, a, "Local simulation only", at);
  use = continueUse(
    use,
    subject,
    "October cohort",
    "Try a second bounded cycle",
    at,
  );
  for (const a of [
    "Suitable",
    "Allowed",
    "Succeeded",
    "No reader evidence",
    "Insufficient evidence",
  ] as const)
    use = recordUseStep(use, subject, a, "Second simulation only", at);
  const adoptions = adoptAgreement(
    [],
    "brief-v2",
    "October cohort",
    "Bounded scope",
    at,
  );
  const applicability = recordApplicability(
    [],
    adoptions[0],
    { contribution: c, use },
    "assessment",
    "Applicable",
    "Exact adopted scope reviewed",
    at,
  );
  let brief = { versions: [] } as KnowledgeWorkspace["brief"];
  for (let i = 0; i < 23; i++)
    brief = receiveBrief(
      deliverBrief(
        brief,
        `Workshop input version ${i + 1}`,
        `2026-10-02T12:00:${String(i).padStart(2, "0")}Z`,
      ),
      i + 1,
      `2026-10-02T12:00:${String(i).padStart(2, "0")}Z`,
    );
  return { contribution: c, brief, adoptions, applicability, use };
}
test("timeline derives exact retained records with actors, both use cycles and stable recovery", () => {
  const state = fixture(),
    before = structuredClone(state),
    events = knowledgeTimeline(state);
  expect(state).toEqual(before);
  expect(new Set(events.map((e) => e.key)).size).toBe(events.length);
  for (let i = 1; i < events.length; i++)
    expect(Date.parse(events[i - 1].at)).toBeGreaterThanOrEqual(
      Date.parse(events[i].at),
    );
  expect(events.find((e) => e.id === "human-delivery-v1")!.actor).toBe(
    "Demo delegate",
  );
  expect(events.find((e) => e.id === "human-receipt-v2")!.references).toEqual([
    "human-delivery-v2",
  ]);
  expect(
    events.find((e) => e.id === "human-delivery-v2")!.destination,
  ).toContain("contributionActor=delegate");
  const outcomes = events.filter((e) => e.title.startsWith("Outcome review"));
  expect(outcomes).toHaveLength(2);
  expect(outcomes.map((e) => e.version).sort()).toEqual([
    "draft-02 · use cycle 1",
    "draft-02 · use cycle 2",
  ]);
  expect(
    events.find((e) => e.id === "knowledge-handoff-1-response")!.references,
  ).toEqual(["knowledge-handoff-1"]);
  expect(events.some((e) => e.kind === "Scope")).toBe(true);
  expect(events.every((e) => validScenarioPath(e.destination))).toBe(true);
  expect(
    knowledgeTimeline(
      parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(state)).state,
    ),
  ).toEqual(events);
  const replacement = { ...state, contribution: emptyContribution() };
  expect(
    knowledgeTimeline(replacement)
      .filter((e) => e.kind === "Use" && e.frozenSubject !== undefined)
      .every((e) => e.detail.includes("Historical source differs")),
  ).toBe(true);
});
test("empty/uncertain work creates no invented actions; search and bounded pagination keep exact identities", () => {
  const empty = {
    contribution: emptyContribution(),
    brief: { versions: [] },
    adoptions: [],
  };
  expect(knowledgeTimeline(empty)).toEqual([]);
  const pending = submitContributionCommand(
    {
      ...empty.contribution,
      contributions: [
        { version: 1, body: "Draft", note: "Scope", citesInput: true },
      ],
    },
    "unknown",
    at,
  );
  const rows = knowledgeTimeline({ ...empty, contribution: pending });
  expect(rows).toHaveLength(1);
  expect(rows[0].title).toBe("Contribution submission");
  expect(rows[0].detail).toContain("unknown");
  const events = knowledgeTimeline(fixture()),
    defaults = { stream: "all", kind: "all", query: "", page: 1 };
  const first = timelinePage(events, defaults),
    second = timelinePage(events, { ...defaults, page: 2 });
  expect(first.rows).toHaveLength(20);
  expect(first.rows.some((e) => second.rows.some((x) => x.key === e.key))).toBe(
    false,
  );
  expect(
    timelinePage(events, { ...defaults, stream: "K-02" }).matched,
  ).toHaveLength(46);
  expect(
    timelinePage(events, { ...defaults, query: "Demo delegate" }).matched.some(
      (e) => e.id === "human-delivery-v2",
    ),
  ).toBe(true);
  expect(timelinePage(events, { ...defaults, page: 999 }).page).toBe(
    first.pages,
  );
  expect(
    validScenarioPath(
      "/organizations/knowledge/timeline?timelineKind=Use&timelinePage=2",
    ),
  ).toBe(true);
  expect(
    validScenarioPath("/organizations/knowledge/timeline?timelinePage=0"),
  ).toBe(false);
  expect(
    validScenarioPath("/organizations/knowledge/timeline?timelineKind=Unknown"),
  ).toBe(false);
});
for (const width of [320, 1440])
  test(`timeline filters, pagination, exact references, source routes and recovery ${width}`, async ({
    page,
  }) => {
    const state = fixture();
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
      key: knowledgeCheckpointKey,
      raw: encodeKnowledgeCheckpoint(state),
    });
    await page.goto("/#/organizations/knowledge");
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
      .getByRole("button", { name: "Open Knowledge timeline", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Knowledge timeline" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Next timeline page", exact: true })
      .click();
    await expect(page).toHaveURL(/timelinePage=2/);
    await page
      .getByRole("combobox", { name: "Timeline workstream", exact: true })
      .selectOption("K-01");
    await page
      .getByRole("combobox", { name: "Timeline stage", exact: true })
      .selectOption("Editorial");
    await page
      .getByRole("button", {
        name: "Inspect timeline record · human-receipt-v2",
        exact: true,
      })
      .click();
    const detail = page.getByRole("region", { name: "Timeline record detail" });
    await expect(detail.getByRole("heading", { level: 2 })).toBeFocused();
    await detail
      .getByRole("button", {
        name: "Inspect related record · human-delivery-v2",
        exact: true,
      })
      .click();
    await expect(detail).toContainText("Demo delegate");
    await detail
      .getByText("Inspect exact retained record", { exact: true })
      .click();
    await expect(detail.locator("pre")).toContainText(
      '"performer": "delegate"',
    );
    await detail
      .getByRole("button", { name: "Open source workspace", exact: true })
      .click();
    await expect(page).toHaveURL(
      /contributions\/K-01-H.*contributionActor=delegate/,
    );
    await page.goBack();
    await expect(detail).toContainText("human-delivery-v2");
    await page
      .getByRole("combobox", { name: "Timeline stage", exact: true })
      .selectOption("Use");
    await expect(
      page.getByRole("list", { name: "Recorded Knowledge events" }),
    ).toContainText("use cycle 2");
    await page
      .getByLabel("Search timeline", { exact: true })
      .fill("nothing-matches-this-search");
    await expect(
      page.getByRole("heading", { name: "No events match these filters" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Reset timeline filters", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Inspect timeline record · workshop-brief-v23",
        exact: true,
      })
      .click();
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "Record unavailable in current workspace",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "No local timeline records yet" }),
    ).toBeVisible();
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
      page.getByRole("list", { name: "Recorded Knowledge events" }),
    ).toContainText("Workshop brief");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

import { proposeReviewHandoff } from "../src/data/reviewHandoffs";
import { controlAuthority } from "../src/data/authorizedUse";
import { test, expect } from "@playwright/test";
import { changeImpact } from "../src/data/changeImpact";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
  requestContributionRevision,
  type HumanContributionState,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import {
  allocateUseMandate,
  assessedUseSubject,
  recordUseStep,
} from "../src/data/authorizedUse";
import {
  offerGuideInput,
  respondGuideInput,
  assessGuideInput,
} from "../src/data/workstreamInputs";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import { recordCaseEvent } from "../src/data/caseLifecycle";
import { recordWorkshopEvent, type WorkshopEvent } from "../src/data/workshop";
import { adoptAgreement } from "../src/data/agreementAdoption";
import { recordApplicability } from "../src/data/scopeApplicability";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
const at = "2026-10-01T12:00:00Z";
function deliver(c: HumanContributionState) {
  const prepared = {
    ...c,
    contributions: c.contributions.map((x) => ({
      ...x,
      body: `Guide ${x.version}: find onboarding contact and next steps.`,
      note: "Explicit bounded guide scope",
      citesInput: true,
    })),
  };
  return receiveContribution(
    submitContributionCommand(prepared, "projected", at),
    at,
  );
}
function fixture(): KnowledgeWorkspace {
  let contribution = reviseContribution(
    assessContribution(deliver(emptyContribution()), at),
  );
  contribution = reassessContribution(
    deliver(contribution),
    "Suitable for stated scope",
    "Guide reviewed",
    at,
  );
  const subject = assessedUseSubject(contribution)!;
  let use = allocateUseMandate(subject, "New members", "Bounded use", at)!;
  use = recordUseStep(
    use,
    subject,
    "Suitable",
    "Reviewed publication scope",
    at,
  );
  use = recordUseStep(use, subject, "Allowed", "Bounded permission", at);
  let guideHandoffs = offerGuideInput(
    [],
    subject,
    "Exact guide",
    "K-02 exercise",
    at,
  );
  guideHandoffs = respondGuideInput(
    guideHandoffs,
    guideHandoffs[0].id,
    "Received",
    "Exact receipt",
    at,
  );
  guideHandoffs = assessGuideInput(
    guideHandoffs,
    guideHandoffs[0].id,
    subject,
    "Applicable",
    "Same audience",
    at,
  );
  const brief = receiveBrief(
    deliverBrief(
      { versions: [], guideHandoffs },
      "New-member workshop, Tuesday. Apply the guide in a practical exercise.",
      at,
      subject,
    ),
    1,
    at,
  );
  const c = { contribution, brief };
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
    "Scope agreed",
    at,
  );
  caseEvents = recordCaseEvent(
    caseEvents,
    c,
    "maya",
    "Approve resolution",
    "Exact source reviewed",
    at,
  );
  const ctx = { ...c, caseEvents };
  let workshopEvents: WorkshopEvent[] = [];
  for (const [actor, action] of [
    ["owner", "Offer facilitation"],
    ["leo", "Accept facilitation"],
    ["leo", "Submit preparation"],
    ["maya", "Preparation ready"],
  ] as const)
    workshopEvents = recordWorkshopEvent(
      workshopEvents,
      ctx,
      actor,
      action,
      "Exercise plan and scope inspected",
      at,
    );
  return { ...ctx, use, workshopEvents, adoptions: [] };
}
test("one guide revision propagates through use, handoff, brief, case and workshop without changing retained decisions", () => {
  const state = fixture();
  expect(changeImpact(state).every((r) => r.status === "Current")).toBe(true);
  const changed = {
    ...state,
    contribution: requestContributionRevision(
      state.contribution,
      "Need a new onboarding contact",
      at,
    ),
  };
  const before = JSON.stringify(changed),
    rows = changeImpact(changed);
  expect(rows.filter((r) => r.status === "Blocked").map((r) => r.id)).toEqual([
    "bounded-use-source",
    "guide-workshop-input",
    "workshop-brief",
    "workshop-brief-case",
    "workshop-cycle",
  ]);
  expect(rows.find((r) => r.id === "workshop-cycle")?.owner).toBe(
    "Demo organization owner",
  );
  expect(rows.find((r) => r.id === "bounded-use-source")?.owner).toBe(
    "Follow-up unallocated",
  );
  expect(JSON.stringify(changed)).toBe(before);
  const restored = parseKnowledgeCheckpoint(
    encodeKnowledgeCheckpoint(changed),
  ).state;
  expect(changeImpact(restored)).toEqual(rows);
});
test("post-execution source change is historical; no linked guide creates no invented dependency", () => {
  const state = fixture(),
    ctx = {
      contribution: state.contribution,
      brief: state.brief,
      caseEvents: state.caseEvents!,
    };
  const events = recordWorkshopEvent(
    state.workshopEvents!,
    ctx,
    "leo",
    "Session succeeded",
    "Simulated session completed",
    at,
  );
  const changed = {
    ...state,
    workshopEvents: events,
    contribution: requestContributionRevision(
      state.contribution,
      "Guide changed",
      at,
    ),
  };
  const row = changeImpact(changed).find((r) => r.id === "workshop-cycle")!;
  expect(row.status).toBe("Historical");
  expect(row.owner).toContain("Leo");
  const empty = {
    contribution: emptyContribution(),
    brief: { versions: [] },
    adoptions: [],
  };
  expect(changeImpact(empty)).toEqual([]);
  const standalone = {
    ...empty,
    brief: deliverBrief(empty.brief, "Standalone workshop brief", at),
  };
  expect(changeImpact(standalone).map((r) => r.id)).toEqual(["workshop-brief"]);
  expect(changeImpact(standalone)[0].status).toBe("Review needed");
});
test("scope changes require new exact applicability; missing checks are not proof of source change", () => {
  const state = fixture();
  state.adoptions = adoptAgreement(
    [],
    "brief-v1",
    "New members",
    "Adopt scope",
    at,
  );
  let rows = changeImpact(state);
  expect(rows.find((r) => r.id === "scope-assessment")?.reason).toContain(
    "missing evidence",
  );
  state.applicability = recordApplicability(
    [],
    state.adoptions[0],
    { contribution: state.contribution, use: state.use },
    "assessment",
    "Applicable",
    "Exact source applies",
    at,
  );
  rows = changeImpact(state);
  expect(rows.find((r) => r.id === "scope-assessment")?.status).toBe("Current");
  const changed = {
    ...state,
    adoptions: adoptAgreement(
      state.adoptions,
      "brief-v2",
      "Different cohort",
      "Change scope",
      at,
    ),
  };
  rows = changeImpact(changed);
  expect(rows.find((r) => r.id === "scope-assessment")?.status).toBe(
    "Review needed",
  );
  expect(rows.find((r) => r.id === "scope-assessment")?.reason).toContain(
    "cannot transfer",
  );
  expect(rows.find((r) => r.id === "workshop-cycle")?.status).toBe("Current");
});
test("changed review package blocks handoff even while material source still matches", () => {
  const state = fixture();
  state.use = proposeReviewHandoff(
    state.use!,
    state.use!.subject,
    "authorization",
    "authorityDelegate",
    "Inspect exact controls",
    at,
  );
  expect(
    changeImpact(state).find((r) => r.id === "pending-review-handoff")?.status,
  ).toBe("Current");
  state.use = controlAuthority(
    state.use,
    "Suspend",
    "Investigate grant",
    "Verify conditions",
    at,
  );
  const row = changeImpact(state).find(
    (r) => r.id === "pending-review-handoff",
  )!;
  expect(row.status).toBe("Blocked");
  expect(row.owner).toBe("Demo organization owner");
  expect(
    changeImpact(state).find((r) => r.id === "bounded-use-source")?.status,
  ).toBe("Current");
  expect(
    changeImpact(
      parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(state)).state,
    ),
  ).toEqual(changeImpact(state));
});

for (const width of [390, 1280])
  test(`impact source inspection, contextual return and recovery ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const state = fixture();
    state.contribution = requestContributionRevision(
      state.contribution,
      "Guide updated after workshop readiness",
      at,
    );
    const raw = encodeKnowledgeCheckpoint(state);
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
        name: "Inspect source and scope impact",
        exact: true,
      })
      .click();
    const report = page.getByRole("region", {
      name: "Source and scope impact report",
    });
    await expect(report.getByRole("article")).toHaveCount(5);
    await report
      .getByLabel("Impact status", { exact: true })
      .selectOption("Blocked");
    await expect(report.getByRole("article")).toHaveCount(5);
    const row = report.getByRole("article", {
      name: "Workshop delivery · cycle 1",
      exact: true,
    });
    await row
      .getByText("Retained and current source context", { exact: true })
      .click();
    await expect(
      row.getByRole("heading", {
        name: "Current source and gate",
        exact: true,
      }),
    ).toBeVisible();
    await row
      .getByRole("button", {
        name: "Inspect affected record · Workshop delivery · cycle 1",
        exact: true,
      })
      .click();
    await expect(
      page
        .getByRole("region", { name: "Local workshop lifecycle" })
        .getByRole("heading", {
          name: "Source changed · cancel and allocate again",
          exact: true,
        }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(report).toBeVisible();
    await expect(page).toHaveURL(/persona=leo/);
    await report
      .getByRole("button", {
        name: "Inspect affected record · K-01 guide → K-02 preparation",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/workstreams\/K-02\?persona=leo/);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(report).toBeVisible();
    await report
      .getByLabel("Impact status", { exact: true })
      .selectOption("Historical");
    await expect(
      report.getByText("No records match this status.", { exact: false }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        knowledgeCheckpointKey,
      ),
    ).toBe(raw);
  });

test("scope-blocked use inspection preserves persona without duplicate query parameters", async ({
  page,
}) => {
  const state = fixture();
  state.adoptions = adoptAgreement(
    [],
    "brief-v1",
    "New members",
    "Scope adopted",
    at,
  );
  const raw = encodeKnowledgeCheckpoint(state);
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
    key: knowledgeCheckpointKey,
    raw,
  });
  await page.goto("/#/organizations/knowledge/impact?persona=leo");
  await page
    .getByText("Save or restore whole Knowledge workspace", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review saved workspace", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm workspace replacement", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Inspect affected record · Bounded use and downstream goal follow-up",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/agreements\/K-01\?persona=leo$/);
  await page
    .getByRole("button", { name: "Back to scenario context", exact: true })
    .click();
  await expect(page).toHaveURL(/impact\?persona=leo$/);
});

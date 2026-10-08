import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
  maxContributionVersions,
  type HumanContributionState,
} from "../src/data/humanContribution";
import {
  submitContributionCommand,
  projectContributionCommand,
} from "../src/data/contributionCommand";
import {
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
  contributionCheckpointKey,
} from "../src/data/contributionCheckpoint";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  parseKnowledgeImport,
} from "../src/data/knowledgeCheckpoint";
import {
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
} from "../src/data/authorizedUse";
import { useProgress } from "../src/data/useProgress";
const at = "2026-10-08T12:00:00Z";
function ready(state: HumanContributionState) {
  const c = state.contributions.at(-1)!;
  return {
    ...state,
    contributions: state.contributions.map((x) =>
      x === c
        ? {
            ...x,
            body: `Guide revision ${c.version}`,
            note: `Response ${c.version}`,
            citesInput: true,
          }
        : x,
    ),
  };
}
function second() {
  return receiveContribution(
    submitContributionCommand(
      ready(
        reviseContribution(
          assessContribution(
            receiveContribution(
              submitContributionCommand(
                ready(emptyContribution()),
                "projected",
                at,
              ),
              at,
            ),
            at,
          ),
        ),
      ),
      "projected",
      at,
    ),
    at,
  );
}
function requested() {
  return reassessContribution(
    second(),
    "Further revision needed",
    "Clarify the next step",
    at,
  );
}

test("repeated revisions bind the immediate request, preserve history, and enforce the bound", () => {
  let state = requested();
  for (let version = 3; version <= maxContributionVersions; version++) {
    const before = structuredClone(state);
    state = reviseContribution(state);
    expect(state.contributions.slice(0, -1)).toEqual(before.contributions);
    expect(state.commands).toEqual(before.commands);
    expect(state.contributions.at(-1)).toMatchObject({
      version,
      body: before.contributions.at(-1)!.body,
      note: "",
      citesInput: false,
    });
    expect(submitContributionCommand(state, "projected", at)).toBe(state);
    state = submitContributionCommand(ready(state), "admitted-lag", at);
    expect(state.contributions.at(-1)!.delivery).toBeUndefined();
    expect(reviseContribution(state)).toBe(state);
    expect(
      reassessContribution(state, "Suitable for stated scope", "Too early", at),
    ).toBe(state);
    state = projectContributionCommand(state);
    expect(state.contributions.at(-1)!.delivery!.respondsTo).toBe(
      `human-reassessment-v${version - 1}`,
    );
    expect(
      reassessContribution(
        state,
        "Suitable for stated scope",
        "No receipt",
        at,
      ),
    ).toBe(state);
    state = reassessContribution(
      receiveContribution(state, at),
      "Further revision needed",
      "Clarify again",
      at,
    );
    expect(state.contributions.at(-1)!.reassessment!.id).toBe(
      `human-reassessment-v${version}`,
    );
    expect(
      parseContributionCheckpoint(encodeContributionCheckpoint(state)).state,
    ).toEqual(state);
  }
  expect(reviseContribution(state)).toBe(state);
  expect(
    reviseContribution(
      reassessContribution(
        second(),
        "Suitable for stated scope",
        "Suitable",
        at,
      ),
    ).contributions,
  ).toHaveLength(2);
});

test("recovery rejects skipped requests and reassigned receipts; changed material cannot use prior authorization", () => {
  const third = reassessContribution(
    receiveContribution(
      submitContributionCommand(
        ready(reviseContribution(requested())),
        "projected",
        at,
      ),
      at,
    ),
    "Suitable for stated scope",
    "Reviewed third guide",
    at,
  );
  const raw = encodeContributionCheckpoint(third);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-contribution.v3");
  expect(parseKnowledgeImport(raw)).toMatchObject({
    kind: "contribution",
    contribution: third,
  });
  for (const mutate of [
    (s: any) =>
      (s.contributions[2].delivery.respondsTo = "human-assessment-v1"),
    (s: any) =>
      (s.contributions[2].reassessment.receiptId = "human-receipt-v2"),
    (s: any) =>
      (s.contributions[1].reassessment.conclusion =
        "Suitable for stated scope"),
    (s: any) => (s.commands[2].respondsTo = "human-assessment-v1"),
  ]) {
    const broken = JSON.parse(raw);
    mutate(broken.state);
    expect(() => parseContributionCheckpoint(JSON.stringify(broken))).toThrow();
  }
  expect(() =>
    parseContributionCheckpoint(
      raw.replace(
        "forge.knowledge-contribution.v3",
        "forge.knowledge-contribution.v2",
      ),
    ),
  ).toThrow();
  const original = reassessContribution(
    second(),
    "Suitable for stated scope",
    "Suitable",
    at,
  );
  const subject = assessedUseSubject(original)!;
  let use = allocateUseMandate(subject, "October cohort", "Bounded scope", at)!;
  use = recordUseStep(use, subject, "Suitable", "Scope fits", at);
  use = recordUseStep(use, subject, "Allowed", "Bounded authority", at);
  expect(JSON.parse(assessedUseSubject(third)!)).toMatchObject({ version: 3 });
  expect(useProgress(third, use).stale).toBe(true);
  expect(
    recordUseStep(
      use,
      assessedUseSubject(third),
      "Succeeded",
      "Cannot execute changed material",
      at,
    ),
  ).toBe(use);
  const workspace = {
    contribution: third,
    brief: { versions: [] },
    adoptions: [],
    use,
  };
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(workspace)).state,
  ).toEqual(workspace);
});
for (const width of [320, 1440])
  test(`Leo prepares draft-03 and Maya separately receives and assesses it ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      ({ key, raw }) =>
        localStorage.getItem(key) || localStorage.setItem(key, raw),
      {
        key: contributionCheckpointKey,
        raw: encodeContributionCheckpoint(requested()),
      },
    );
    await page.goto(
      "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
    );
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review saved contribution" })
      .click();
    await page
      .getByRole("button", { name: "Confirm restore contribution" })
      .click();
    await page
      .getByRole("button", { name: "Prepare draft-03", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Prepare draft-03" }),
    ).toBeVisible();
    await page
      .getByLabel("Contribution text", { exact: true })
      .fill("Contact onboarding with team and request context. Third guide.");
    await page
      .getByLabel("Revision response", { exact: true })
      .fill("Explained contact and context.");
    await page.getByLabel(/Cite input-access-brief-v1/).check();
    await page
      .getByText("Compare draft-02 and draft-03", { exact: true })
      .click();
    await expect(
      page.getByRole("region", { name: "Contribution version comparison" }),
    ).toContainText("human-reassessment-v2");
    await page
      .getByRole("button", { name: "Review delivery", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Record local delivery", exact: true })
      .click();
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/work?persona=maya"),
    );
    await page
      .getByRole("button", {
        name: "Record sample receipt · draft-03",
        exact: true,
      })
      .click();
    await page
      .getByLabel("Reassessment rationale")
      .fill("Reviewed the exact third delivery.");
    await page
      .getByRole("button", {
        name: "Record sample reassessment · draft-03",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", { name: "Receiver action result" }),
    ).toContainText(
      "human-reassessment-v3 → human-receipt-v3 → human-delivery-v3",
    );
    const recovery = page.getByText("Save or restore Knowledge contribution", {
      exact: true,
    });
    if (
      !(await recovery.locator("..").evaluate((el) => el.hasAttribute("open")))
    )
      await recovery.click();
    await page
      .getByRole("button", {
        name: "Save contribution checkpoint",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Confirm save checkpoint" }).click();
    await page.reload();
    await recovery.click();
    await page
      .getByRole("button", { name: "Review saved contribution" })
      .click();
    await page
      .getByRole("button", { name: "Confirm restore contribution" })
      .click();
    await expect(
      page.getByRole("region", { name: "Receiver action result" }),
    ).toContainText("human-reassessment-v3");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

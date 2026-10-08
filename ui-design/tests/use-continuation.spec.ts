import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import {
  allocateUseMandate,
  assessedUseSubject,
  recordUseStep,
  continueUse,
  continuationSource,
} from "../src/data/authorizedUse";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
import {
  recordApplicability,
  applicabilityGuard,
} from "../src/data/scopeApplicability";
import { adoptAgreement } from "../src/data/agreementAdoption";
const at = "2026-10-07T12:00:00Z";
function fixture(): KnowledgeWorkspace {
  let contribution = emptyContribution();
  contribution.contributions[0] = {
    ...contribution.contributions[0],
    body: "Original",
    note: "Cohort",
    citesInput: true,
  };
  contribution = reviseContribution(
    assessContribution(
      receiveContribution(
        submitContributionCommand(contribution, "projected", at),
        at,
      ),
      at,
    ),
  );
  contribution.contributions[1] = {
    ...contribution.contributions[1],
    body: "Revised contact guide",
    note: "Cohort revision",
    citesInput: true,
  };
  contribution = reassessContribution(
    receiveContribution(
      submitContributionCommand(contribution, "projected", at),
      at,
    ),
    "Suitable for stated scope",
    "Fits cohort",
    at,
  );
  const subject = assessedUseSubject(contribution)!;
  let use = allocateUseMandate(
    subject,
    "October cohort",
    "Bounded preview",
    at,
  )!;
  for (const action of [
    "Suitable",
    "Allowed",
    "Failed",
    "Insufficient evidence",
  ] as const)
    use = recordUseStep(use, subject, action, "Simulation", at);
  return { contribution, use, brief: { versions: [] }, adoptions: [] };
}
test("continuation preserves prior cycle and requires fresh authority and applicability", () => {
  const s = fixture(),
    prior = s.use!,
    subject = assessedUseSubject(s.contribution)!;
  const next = continueUse(
    prior,
    subject,
    "October cohort",
    "Retry after repairing preview conditions",
    at,
  );
  expect(next.previousCycle).toBe(prior);
  expect(next.cycle).toBe(2);
  expect(next.authorization).toBeUndefined();
  expect(next.execution).toBeUndefined();
  expect(next.readerEvidence).toBeUndefined();
  expect(next.continuation?.sourceId).toBe(prior.outcome?.id);
  expect(recordUseStep(next, subject, "Succeeded", "skip authority", at)).toBe(
    next,
  );
  let assessed = recordUseStep(
    next,
    subject,
    "Suitable",
    "Fresh scope assessment",
    at,
  );
  const adoptions = adoptAgreement(
    [],
    "brief-v1",
    "October cohort",
    "Scope",
    at,
  );
  let checks = recordApplicability(
    [],
    adoptions[0],
    { contribution: s.contribution, use: prior },
    "bounded-use",
    "Applicable",
    "Old cycle mapping",
    at,
  );
  checks = recordApplicability(
    checks,
    adoptions[0],
    { contribution: s.contribution, use: assessed },
    "assessment",
    "Applicable",
    "Same exact editorial assessment",
    at,
  );
  expect(
    applicabilityGuard(
      { contribution: s.contribution, use: assessed },
      { adoptions, checks },
    ),
  ).toContain("local-publication-mandate-cycle-2");
  assessed = recordUseStep(
    assessed,
    subject,
    "Allowed",
    "Fresh preview authorization",
    at,
  );
  assessed = recordUseStep(assessed, subject, "Failed", "Second failure", at);
  expect(assessed.execution?.id).toBe("local-use-observation-cycle-2");
  expect(
    continueUse(assessed, subject, "Other", "duplicate next cycle", at),
  ).toBe(assessed);
  expect(
    continueUse(prior, "different source", "Other", "Changed material", at),
  ).toBe(prior);
  const encoded = encodeKnowledgeCheckpoint({
    ...s,
    use: assessed,
    adoptions,
    applicability: checks,
  });
  expect(JSON.parse(encoded).format).toBe("forge.knowledge-workspace.v3");
  expect(parseKnowledgeCheckpoint(encoded).state.use).toEqual(assessed);
  for (const mutate of [
    (x: any) => (x.state.use.continuation.sourceId = "foreign"),
    (x: any) => (x.state.use.previousCycle.execution.id = "foreign"),
    (x: any) => (x.state.use.authorization.id = "local-use-authorization"),
    (x: any) => (x.format = "forge.knowledge-workspace.v2"),
  ]) {
    const x = JSON.parse(encoded);
    mutate(x);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
  const initial = allocateUseMandate(subject, "Cohort", "start", at)!;
  const revision = recordUseStep(
    initial,
    subject,
    "Revision needed",
    "Revise publication conditions",
    at,
  );
  expect(continuationSource(revision)?.id).toBe(
    revision.publicationAssessment?.id,
  );
  const suitable = recordUseStep(initial, subject, "Suitable", "fits", at);
  const refused = recordUseStep(
    suitable,
    subject,
    "Refused",
    "Revise audience boundary",
    at,
  );
  expect(
    continueUse(refused, subject, "Smaller preview", "New audience mandate", at)
      .cycle,
  ).toBe(2);
  const failed = { ...prior, outcome: undefined };
  expect(continuationSource(failed)).toBeUndefined();
});
for (const width of [390, 1440])
  test(`explicit second cycle and recovery ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/use/K-01?persona=leo");
    const recovery = page.getByRole("region", {
      name: "Knowledge workspace recovery",
      exact: true,
    });
    await recovery
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    await recovery.getByLabel("Import Knowledge checkpoint").setInputFiles({
      name: "failed.json",
      mimeType: "application/json",
      buffer: Buffer.from(encodeKnowledgeCheckpoint(fixture())),
    });
    await recovery
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    const follow = page.getByRole("region", {
      name: "Use cycle continuation",
      exact: true,
    });
    await follow
      .getByRole("textbox", {
        name: "Continuation rationale and changed conditions",
      })
      .fill("Repair fictional preview rendering; same assessed guide");
    await follow
      .getByRole("button", { name: "Prepare cycle 2 mandate" })
      .click();
    await follow.getByRole("button", { name: "Cancel next cycle" }).click();
    await expect(follow).toBeVisible();
    await follow
      .getByRole("button", { name: "Prepare cycle 2 mandate" })
      .click();
    await follow
      .getByRole("button", { name: "Record cycle 2 mandate" })
      .click();
    const use = page.getByRole("region", {
      name: "Assessed result to outcome",
      exact: true,
    });
    await expect(use).toContainText("local-publication-mandate-cycle-2");
    await expect(
      use.getByRole("button", { name: "Prepare execution record" }),
    ).toHaveCount(0);
    const step = async (stage: string, choice: string) => {
      await use
        .getByRole("combobox", { name: "Recorded conclusion" })
        .selectOption(choice);
      await use
        .getByRole("textbox")
        .last()
        .fill(`New ${stage} conditions verified in simulation`);
      await use
        .getByRole("button", { name: `Prepare ${stage} record`, exact: true })
        .click();
      await use
        .getByRole("button", { name: `Record ${stage} locally`, exact: true })
        .click();
    };
    await step("assessment", "Suitable");
    await step("authorization", "Allowed");
    await step("execution", "Succeeded");
    await expect(use).toContainText("local-use-observation-cycle-2");
    await use
      .getByText("Original cycle 1 · preserved records", { exact: true })
      .click();
    await expect(use).toContainText('"result": "Failed"');
    await recovery
      .getByRole("button", { name: "Save workspace checkpoint", exact: true })
      .click();
    await recovery
      .getByRole("button", { name: "Confirm save workspace", exact: true })
      .click();
    await page.reload();
    await recovery
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    await recovery
      .getByRole("button", { name: "Review saved workspace", exact: true })
      .click();
    await recovery
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    await expect(use).toContainText("local-use-observation-cycle-2");
    await expect(use).toContainText("Original cycle 1 · preserved records");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

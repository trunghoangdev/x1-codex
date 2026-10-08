import { test, expect } from "@playwright/test";
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
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
  startMaterialUse,
  continueUse,
  type AuthorizedUse,
  useVersion,
} from "../src/data/authorizedUse";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
import {
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
} from "../src/data/contributionCheckpoint";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
import { adoptAgreement } from "../src/data/agreementAdoption";
import { recordApplicability } from "../src/data/scopeApplicability";
import { useProgress } from "../src/data/useProgress";
const at = "2026-10-01T12:00:00Z";
function prepare(c: HumanContributionState) {
  return {
    ...c,
    contributions: c.contributions.map((x, i) =>
      i === c.contributions.length - 1
        ? {
            ...x,
            body: `Guide revision ${x.version}: contact onboarding with team and context.`,
            note: `Scope response ${x.version}`,
            citesInput: true,
          }
        : x,
    ),
  };
}
function deliver(c: HumanContributionState) {
  return receiveContribution(
    submitContributionCommand(prepare(c), "projected", at),
    at,
  );
}
function fixture(): KnowledgeWorkspace {
  let c = reviseContribution(
    assessContribution(deliver(emptyContribution()), at),
  );
  c = reassessContribution(
    deliver(c),
    "Suitable for stated scope",
    "Suitable for bounded cohort",
    at,
  );
  let use = allocateUseMandate(
    assessedUseSubject(c),
    "Cohort two",
    "Bounded mandate two",
    at,
  )!;
  for (const action of [
    "Suitable",
    "Allowed",
    "Failed",
    "Insufficient evidence",
  ] as const)
    use = recordUseStep(use, use.subject, action, "Cycle one simulation", at);
  use = continueUse(use, use.subject, "Cohort two", "Second attempt", at);
  use = recordUseStep(use, use.subject, "Suitable", "Second scope review", at);
  use = recordUseStep(use, use.subject, "Allowed", "Second authority", at);
  return { contribution: c, brief: { versions: [] }, adoptions: [], use };
}
function nextVersion(c: HumanContributionState) {
  return reassessContribution(
    deliver(
      reviseContribution(
        requestContributionRevision(c, "New content needed after feedback", at),
      ),
    ),
    "Suitable for stated scope",
    "New exact version reviewed",
    at,
  );
}

test("fresh material mandates through draft-09 never copy earlier authority; both retry cycles and material histories survive recovery", () => {
  const initial = fixture();
  let c = initial.contribution,
    use = initial.use!;
  const old = structuredClone(use);
  const requested = requestContributionRevision(c, "Revise the material", at);
  expect(assessedUseSubject(requested)).toBeUndefined();
  expect(requested.contributions[1].reassessment).toEqual(
    c.contributions[1].reassessment,
  );
  expect(requestContributionRevision(requested, "Overwrite", at)).toBe(
    requested,
  );
  expect(
    recordUseStep(
      use,
      assessedUseSubject(requested),
      "Succeeded",
      "Cannot use requested source",
      at,
    ),
  ).toBe(use);
  for (let version = 3; version <= 9; version++) {
    c = nextVersion(c);
    const subject = assessedUseSubject(c)!;
    const before = structuredClone(use),
      next = startMaterialUse(
        use,
        subject,
        `Cohort ${version}`,
        `New material mandate ${version}`,
        at,
      );
    expect(next).not.toBe(use);
    expect(next.authorization).toBeUndefined();
    expect(next.execution).toBeUndefined();
    expect(next.publicationAssessment).toBeUndefined();
    expect(next.cycle).toBeUndefined();
    const { previousMaterials, ...prior } = before;
    expect(next.previousMaterials!.at(-1)).toEqual(prior);
    expect(next.mandate.sourceId).toBe(`human-reassessment-v${version}`);
    expect(next.mandate.id).toContain(`draft-${version}`);
    expect(
      recordUseStep(next, subject, "Allowed", "Cannot skip assessment", at),
    ).toBe(next);
    use = recordUseStep(next, subject, "Suitable", "New publication scope", at);
    use = recordUseStep(use, subject, "Allowed", "New exact authority", at);
    expect(startMaterialUse(use, subject, "Same", "Duplicate", at)).toBe(use);
    const workspace = { ...initial, contribution: c, use };
    expect(
      parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(workspace)).state,
    ).toEqual(workspace);
  }
  expect(use.previousMaterials).toHaveLength(7);
  expect(use.previousMaterials![0]).toEqual(old);
  const timeline = knowledgeTimeline({ ...initial, contribution: c, use });
  expect(new Set(timeline.map((e) => e.key)).size).toBe(timeline.length);
  expect(
    timeline.filter((e) => e.title.startsWith("Use authorization")),
  ).toHaveLength(9);
  expect(
    parseContributionCheckpoint(encodeContributionCheckpoint(c)).state,
  ).toEqual(c);
});

test("new scope mapping is required; malformed archive links and overwritten assessments cannot restore", () => {
  const initial = fixture(),
    c = nextVersion(initial.contribution),
    use = startMaterialUse(
      initial.use!,
      assessedUseSubject(c),
      "Cohort three",
      "New mandate",
      at,
    );
  const adoptions = adoptAgreement([], "brief-v2", "Cohort three", "Scope", at);
  let checks = recordApplicability(
    [],
    adoptions[0],
    { contribution: initial.contribution, use: initial.use },
    "assessment",
    "Applicable",
    "Old mapping",
    at,
  );
  checks = recordApplicability(
    checks,
    adoptions[0],
    { contribution: initial.contribution, use: initial.use },
    "bounded-use",
    "Applicable",
    "Old use mapping",
    at,
  );
  const assessed = recordUseStep(
    use,
    use.subject,
    "Suitable",
    "New scope review",
    at,
  );
  expect(
    useProgress(c, assessed, { adoptions, checks }).scopeBlocked,
  ).toContain("assessment");
  checks = recordApplicability(
    checks,
    adoptions[0],
    { contribution: c, use: assessed },
    "assessment",
    "Applicable",
    "Fresh material mapping",
    at,
  );
  checks = recordApplicability(
    checks,
    adoptions[0],
    { contribution: c, use: assessed },
    "bounded-use",
    "Applicable",
    "Fresh mandate mapping",
    at,
  );
  expect(
    useProgress(c, assessed, { adoptions, checks }).scopeBlocked,
  ).toBeUndefined();
  const workspace = {
    ...initial,
    contribution: c,
    use: assessed,
    adoptions,
    applicability: checks,
  };
  const raw = encodeKnowledgeCheckpoint(workspace);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v6");
  expect(parseKnowledgeCheckpoint(raw).state).toEqual(workspace);
  for (const mutate of [
    (s: any) =>
      (s.use.previousMaterials[0].authorization.sourceId =
        "local-publication-assessment-draft-3"),
    (s: any) => s.use.previousMaterials.push(s.use.previousMaterials[0]),
    (s: any) => (s.use.mandate.sourceId = "human-reassessment-v2"),
    (s: any) =>
      (s.contribution.contributions[1].revisionRequest.assessmentId =
        "human-reassessment-v3"),
    (s: any) => (s.use.previousMaterials[0].previousMaterials = []),
  ]) {
    const broken = JSON.parse(raw);
    mutate(broken.state);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(broken))).toThrow();
  }
  expect(() =>
    parseKnowledgeCheckpoint(
      raw.replace(
        "forge.knowledge-workspace.v6",
        "forge.knowledge-workspace.v5",
      ),
    ),
  ).toThrow();
  expect(
    startMaterialUse(
      assessed,
      initial.use!.subject,
      "Older",
      "Cannot go backward",
      at,
    ),
  ).toBe(assessed);
});

for (const width of [320, 1440])
  test(`Maya requests draft-03, Leo revises, owner allocates fresh mandate and history restores ${width}`, async ({
    page,
  }) => {
    const initial = fixture();
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
      },
      { key: knowledgeCheckpointKey, raw: encodeKnowledgeCheckpoint(initial) },
    );
    await page.goto("/#/organizations/knowledge/work?persona=maya");
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
      .getByLabel("Further revision rationale", { exact: true })
      .fill("Content needs a clearer next step after publication feedback.");
    await page
      .getByRole("button", {
        name: "Record further revision request",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", { name: "Receiver action result" }),
    ).toContainText("human-revision-request-v2");
    await page.evaluate(
      () =>
        (location.hash =
          "/organizations/knowledge/contributions/K-01-H?persona=leo"),
    );
    await page
      .getByRole("button", { name: "Prepare draft-03", exact: true })
      .click();
    await page
      .getByLabel("Contribution text", { exact: true })
      .fill(
        "Third guide: contact onboarding with your team and requested access.",
      );
    await page
      .getByLabel("Revision response", { exact: true })
      .fill("Clarified the requested next step.");
    await page.getByLabel(/Cite input-access-brief-v1/).check();
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
      .getByLabel("Reassessment rationale", { exact: true })
      .fill("Exact third guide now suitable.");
    await page
      .getByRole("button", {
        name: "Record sample reassessment · draft-03",
        exact: true,
      })
      .click();
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/use/K-01"),
    );
    const fresh = page.getByRole("region", {
      name: "New material use mandate",
    });
    await fresh
      .getByLabel("New material audience", { exact: true })
      .fill("Cohort three");
    await fresh
      .getByLabel("New material mandate rationale", { exact: true })
      .fill("Publish only the newly assessed third guide.");
    await fresh
      .getByRole("button", { name: "Review new material mandate", exact: true })
      .click();
    await expect(fresh).toContainText(
      "human-delivery-v3 → human-receipt-v3 → human-reassessment-v3",
    );
    await fresh
      .getByRole("button", {
        name: "Record new material mandate locally",
        exact: true,
      })
      .click();
    const chain = page.getByRole("region", {
      name: "Assessed result to outcome",
    });
    await expect(chain).toContainText("Exact draft-03 assessment available");
    await expect(chain).toContainText("local-publication-mandate-draft-3");
    await expect(chain).not.toContainText("local-use-authorization-draft-3");
    for (const stage of [
      "assessment",
      "authorization",
      "execution",
      "evidence",
      "outcome",
    ]) {
      await chain
        .getByRole("textbox")
        .last()
        .fill(`New material ${stage} observation`);
      await chain
        .getByRole("button", { name: `Prepare ${stage} record`, exact: true })
        .click();
      await chain
        .getByRole("button", { name: `Record ${stage} locally`, exact: true })
        .click();
    }
    await expect(chain).toContainText("local-use-outcome-review-draft-3");
    await page
      .getByText("Earlier material · draft-02 · preserved use records", {
        exact: true,
      })
      .click();
    await expect(chain).toContainText("local-use-authorization-cycle-2");
    const recovery = page.getByText(
      "Save or restore whole Knowledge workspace",
      { exact: true },
    );
    if (
      !(await recovery.locator("..").evaluate((el) => el.hasAttribute("open")))
    )
      await recovery.click();
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
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    await expect(chain).toContainText("local-use-outcome-review-draft-3");
    await expect(
      chain.getByText("Earlier material · draft-02 · preserved use records", {
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

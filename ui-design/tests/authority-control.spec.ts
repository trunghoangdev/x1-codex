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
  authorityStatus,
  controlAuthority,
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

test("suspension gates execution, resume appends authority, revocation is terminal and checkpoint rejects rewritten links", () => {
  const initial = fixture(),
    original = initial.use!;
  const suspended = controlAuthority(
    original,
    "Suspend",
    "Input may be wrong",
    "Verify source with reviewer",
    at,
  );
  expect(authorityStatus(suspended)).toBe("Suspended");
  expect(suspended.authorization).toBe(original.authorization);
  expect(
    recordUseStep(
      suspended,
      suspended.subject,
      "Succeeded",
      "Cannot execute",
      at,
    ),
  ).toBe(suspended);
  expect(useProgress(initial.contribution, suspended).stage).toBe(
    "authorityStopped",
  );
  const resumed = controlAuthority(
    suspended,
    "Resume",
    "Source checked",
    "Reviewed source with Maya; issue resolved",
    at,
  );
  expect(authorityStatus(resumed)).toBe("Active");
  expect(resumed.authorityHistory).toHaveLength(2);
  const executed = recordUseStep(
    resumed,
    resumed.subject,
    "Succeeded",
    "Historical simulation",
    at,
  );
  const revoked = controlAuthority(
    executed,
    "Revoke",
    "Scope no longer appropriate",
    "New material requires fresh mandate",
    at,
  );
  expect(controlAuthority(revoked, "Resume", "Try", "Resolved", at)).toBe(
    revoked,
  );
  expect(revoked.execution).toBe(executed.execution);
  const evidence = recordUseStep(
    revoked,
    revoked.subject,
    "No reader evidence",
    "Preserve historical observation",
    at,
  );
  const outcome = recordUseStep(
    evidence,
    evidence.subject,
    "Insufficient evidence",
    "Retrospective review",
    at,
  );
  const workspace = { ...initial, use: outcome };
  const raw = encodeKnowledgeCheckpoint(workspace);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v7");
  expect(parseKnowledgeCheckpoint(raw).state).toEqual(workspace);
  expect(
    knowledgeTimeline(workspace).filter((r) =>
      r.title.startsWith("Use authority"),
    ),
  ).toHaveLength(3);
  const c3 = nextVersion(initial.contribution);
  const fresh = startMaterialUse(
    outcome,
    assessedUseSubject(c3),
    "New audience",
    "Fresh mandate",
    at,
  );
  expect(fresh.authorityHistory).toBeUndefined();
  expect(fresh.previousMaterials?.[0].authorityHistory).toHaveLength(3);
  expect(
    parseKnowledgeCheckpoint(
      encodeKnowledgeCheckpoint({ ...initial, contribution: c3, use: fresh }),
    ).state.use,
  ).toEqual(fresh);
  for (const change of [
    (x: any) => (x.state.use.authorityHistory[0].sourceId = "wrong"),
    (x: any) => (x.state.use.authorityHistory[1].action = "Suspend"),
    (x: any) => (x.state.use.authorityHistory[0].afterRecordId = "unknown"),
    (x: any) => (x.state.use.authorityHistory[2].actor = "Leo"),
    (x: any) => (x.format = "forge.knowledge-workspace.v6"),
  ]) {
    const x = JSON.parse(raw);
    change(x);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
  expect(controlAuthority(original, "Resume", "Invalid", "Resolved", at)).toBe(
    original,
  );
  expect(controlAuthority(original, "Suspend", "Invalid", "", at)).toBe(
    original,
  );
  expect(controlAuthority(suspended, "Suspend", "Again", "Check", at)).toBe(
    suspended,
  );
  expect(
    controlAuthority(
      suspended,
      "Revoke",
      "Stop permanently",
      "Fresh mandate needed",
      at,
    ).authorityHistory,
  ).toHaveLength(2);
});
for (const width of [320, 1440])
  test(`suspend, cancel, resume, revoke and restore exact authority history ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
      },
      {
        key: knowledgeCheckpointKey,
        raw: encodeKnowledgeCheckpoint(fixture()),
      },
    );
    await page.goto("/#/organizations/knowledge/use/K-01");
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
    const controls = page.getByRole("region", {
      name: "Use authority controls",
      exact: true,
    });
    const decide = async (action: string) => {
      await controls
        .getByLabel("Authority action", { exact: true })
        .selectOption(action);
      await controls
        .getByLabel("Authority decision rationale", { exact: true })
        .fill(`${action} due to reviewed source`);
      await controls
        .getByLabel("Conditions to resume or verification of resolution", {
          exact: true,
        })
        .fill(
          "Sam checked exact material and scope; decision rationale retained",
        );
      await controls
        .getByRole("button", { name: "Review authority decision", exact: true })
        .click();
    };
    await decide("Suspend");
    await controls
      .getByRole("button", { name: "Cancel authority decision", exact: true })
      .click();
    await expect(
      controls.getByRole("heading", {
        name: "Use authority · Active",
        exact: true,
      }),
    ).toBeVisible();
    await decide("Suspend");
    await controls
      .getByRole("button", {
        name: "Record authority decision locally",
        exact: true,
      })
      .click();
    await expect(
      controls.getByRole("heading", {
        name: "Use authority · Suspended",
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.getByRole("button", {
        name: "Prepare execution record",
        exact: true,
      }),
    ).toHaveCount(0);
    await decide("Resume");
    await controls
      .getByRole("button", {
        name: "Record authority decision locally",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Prepare execution record",
        exact: true,
      }),
    ).toBeVisible();
    await decide("Revoke");
    await controls
      .getByRole("button", {
        name: "Record authority decision locally",
        exact: true,
      })
      .click();
    await expect(
      controls.getByRole("heading", {
        name: "Use authority · Revoked",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      controls.getByLabel("Authority action", { exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "Save workspace checkpoint",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Confirm save workspace", exact: true })
      .click();
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
      controls.getByRole("heading", {
        name: "Use authority · Revoked",
        exact: true,
      }),
    ).toBeVisible();
    await expect(controls.getByRole("heading", { level: 4 })).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

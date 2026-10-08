import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import { encodeContributionCheckpoint } from "../src/data/contributionCheckpoint";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import { adoptAgreement } from "../src/data/agreementAdoption";
import {
  allocateUseMandate,
  assessedUseSubject,
  recordUseStep,
} from "../src/data/authorizedUse";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  parseKnowledgeImport,
  replaceKnowledge,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
const at = "2026-10-07T12:00:00Z";
function fixture(): KnowledgeWorkspace {
  let contribution = emptyContribution();
  contribution.contributions[0] = {
    ...contribution.contributions[0],
    body: "First guide",
    note: "Fictional cohort",
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
    body: "Contact onboarding with team and access request",
    note: "Fictional cohort revision",
    citesInput: true,
  };
  contribution = reassessContribution(
    receiveContribution(
      submitContributionCommand(contribution, "projected", at),
      at,
    ),
    "Suitable for stated scope",
    "Fits bounded cohort",
    at,
  );
  const subject = assessedUseSubject(contribution)!;
  let use = allocateUseMandate(
    subject,
    "Cohort October",
    "Bounded mandate",
    at,
  )!;
  for (const action of [
    "Suitable",
    "Allowed",
    "Succeeded",
    "No reader evidence",
  ] as const)
    use = recordUseStep(use, subject, action, "Simulation only", at);
  return {
    contribution,
    brief: deliverBrief(
      receiveBrief(
        deliverBrief(
          { versions: [] },
          "Audience cohort; Tuesday; attendance unknown",
          at,
        ),
        1,
        at,
      ),
      "Wednesday revision not received",
      at,
    ),
    adoptions: adoptAgreement(
      adoptAgreement([], "brief-v1", "Cohort October", "Start scoped", at),
      "brief-v2",
      "Support and Operations",
      "Expand with review",
      at,
    ),
    use,
  };
}
test("whole workspace validates lineage and preserves valid stale history and partial import", () => {
  const state = fixture();
  const encoded = encodeKnowledgeCheckpoint(state);
  expect(parseKnowledgeCheckpoint(encoded).state).toEqual(state);
  const partial = parseKnowledgeImport(
    encodeContributionCheckpoint(emptyContribution()),
  );
  const replaced = replaceKnowledge(state, partial);
  expect(replaced.contribution).toEqual(emptyContribution());
  expect(replaced.use).toBe(state.use);
  expect(replaced.brief).toBe(state.brief);
  expect(replaced.adoptions).toBe(state.adoptions);
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(replaced)).state,
  ).toEqual(replaced);
  const mutations = [
    (v: any) => {
      v.format = "forge.knowledge-workspace.v99";
    },
    (v: any) => {
      v.state.brief.versions[0].receipt.id = "foreign";
    },
    (v: any) => {
      v.state.brief.versions[0].receipt.at = "2026-10-06T00:00:00Z";
    },
    (v: any) => {
      v.state.adoptions[1].supersedes = "foreign";
    },
    (v: any) => {
      v.state.use.authorization.sourceId = "foreign";
    },
    (v: any) => {
      v.state.use.execution.result = "Failed";
    },
    (v: any) => {
      v.state.use.mandate.actor = "Maya";
    },
    (v: any) => {
      const s = JSON.parse(v.state.use.subject);
      s.assessment.deliveryId = "foreign";
      v.state.use.subject = JSON.stringify(s);
    },
    (v: any) => {
      v.state.use.unexpected = true;
    },
    (v: any) => {
      v.state.extra = "foreign scope";
    },
  ];
  for (const mutate of mutations) {
    const v = JSON.parse(encoded);
    mutate(v);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(v))).toThrow();
  }
  expect(() => parseKnowledgeCheckpoint(" ".repeat(4_000_001))).toThrow();
});
for (const width of [390, 1440])
  test(`whole recovery, partial replacement and invalid preservation ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/workstreams/K-01?persona=maya");
    const recovery = page.getByRole("region", {
      name: "Knowledge workspace recovery",
      exact: true,
    });
    await recovery
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    const upload = async (raw: string) =>
      recovery.getByLabel("Import Knowledge checkpoint").setInputFiles({
        name: "workspace.json",
        mimeType: "application/json",
        buffer: Buffer.from(raw),
      });
    await upload(encodeKnowledgeCheckpoint(fixture()));
    const preview = recovery.getByRole("region", {
      name: "Workspace replacement preview",
      exact: true,
    });
    await expect(preview).toContainText("Whole workspace replacement");
    await expect(preview).toContainText(
      "Incoming review input: Usable local input: brief-v1",
    );
    await recovery
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    const progress = page.getByRole("region", {
      name: "Local use progress",
      exact: true,
    });
    await expect(progress).toContainText("Review outcome criterion");
    await expect(
      page.getByRole("region", { name: "Adopted K-01 scope", exact: true }),
    ).toContainText("Support and Operations");
    await recovery
      .getByRole("button", { name: "Save workspace checkpoint", exact: true })
      .click();
    await recovery
      .getByRole("button", { name: "Confirm save workspace", exact: true })
      .click();
    await expect(
      recovery.getByRole("status", { name: "Workspace save status" }),
    ).toContainText("matches saved checkpoint");
    const downloadPromise = page.waitForEvent("download");
    await recovery
      .getByRole("button", { name: "Export whole workspace", exact: true })
      .click();
    expect((await downloadPromise).suggestedFilename()).toBe(
      "knowledge-workspace.json",
    );
    await page.reload();
    await expect(progress).toContainText(
      "Editorial suitability prerequisite missing",
    );
    await recovery
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    await recovery
      .getByRole("button", { name: "Review saved workspace", exact: true })
      .click();
    await recovery
      .getByRole("button", {
        name: "Cancel workspace replacement",
        exact: true,
      })
      .click();
    await expect(progress).toContainText(
      "Editorial suitability prerequisite missing",
    );
    await recovery
      .getByRole("button", { name: "Review saved workspace", exact: true })
      .click();
    await recovery
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    await expect(progress).toContainText("Review outcome criterion");
    await upload('{"format":"foreign"}');
    await expect(recovery.getByRole("alert")).toContainText(
      "Invalid or unsupported",
    );
    await expect(progress).toContainText("Review outcome criterion");
    await upload(encodeContributionCheckpoint(emptyContribution()));
    await expect(preview).toContainText("Contribution-only replacement");
    await expect(preview).toContainText(
      "Exact source changed · continuation blocked",
    );
    await expect(preview).toContainText("use: unchanged");
    await recovery
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    await expect(progress).toContainText(
      "Exact source changed · continuation blocked",
    );
    await expect(
      page.getByRole("region", { name: "Adopted K-01 scope", exact: true }),
    ).toContainText("brief-v2");
    await recovery
      .getByRole("button", { name: "Remove saved workspace", exact: true })
      .click();
    await recovery
      .getByRole("button", { name: "Confirm remove workspace", exact: true })
      .click();
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        knowledgeCheckpointKey,
      ),
    ).toBeNull();
    await expect(progress).toContainText(
      "Exact source changed · continuation blocked",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test("blocked storage and quota errors do not replace current workspace", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (key === "forge-knowledge-workspace-v1")
        throw new Error("Storage blocked");
      return get.call(this, key);
    };
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "forge-knowledge-workspace-v1")
        throw new Error("Quota exceeded");
      return set.call(this, key, value);
    };
  });
  await page.goto("/#/organizations/knowledge/workstreams/K-01?persona=maya");
  const recovery = page.getByRole("region", {
    name: "Knowledge workspace recovery",
    exact: true,
  });
  await recovery
    .getByText("Save or restore whole Knowledge workspace", { exact: true })
    .click();
  await expect(recovery.getByRole("alert")).toContainText("Storage blocked");
  await expect(
    recovery.getByRole("status", { name: "Workspace save status" }),
  ).toContainText("status unavailable");
  await recovery
    .getByRole("button", { name: "Save workspace checkpoint", exact: true })
    .click();
  await recovery
    .getByRole("button", { name: "Confirm save workspace", exact: true })
    .click();
  await expect(recovery.getByRole("alert")).toContainText("Quota exceeded");
  await expect(
    page.getByRole("region", { name: "Local use progress", exact: true }),
  ).toContainText("Editorial suitability prerequisite missing");
});

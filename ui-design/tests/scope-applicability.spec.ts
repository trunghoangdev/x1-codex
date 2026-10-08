import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import { adoptAgreement } from "../src/data/agreementAdoption";
import {
  allocateUseMandate,
  assessedUseSubject,
  recordUseStep,
} from "../src/data/authorizedUse";
import {
  applicabilitySources,
  currentApplicability,
  recordApplicability,
  applicabilityGuard,
} from "../src/data/scopeApplicability";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
import { useProgress } from "../src/data/useProgress";
const at = "2026-10-07T12:00:00Z";
function fixture(): KnowledgeWorkspace {
  let contribution = emptyContribution();
  contribution.contributions[0] = {
    ...contribution.contributions[0],
    body: "Original",
    note: "Cohort scope",
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
    note: "Cohort scope revision",
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
  const use = recordUseStep(
    allocateUseMandate(subject, "October cohort", "Bounded preview", at)!,
    subject,
    "Suitable",
    "Publication suitability checked",
    at,
  );
  return {
    contribution,
    use,
    brief: { versions: [] },
    adoptions: adoptAgreement(
      [],
      "brief-v1",
      "October cohort",
      "Bounded scope",
      at,
    ),
  };
}
test("exact applicability does not transfer to later scope/source or grant authority", () => {
  const state = fixture(),
    context = { contribution: state.contribution, use: state.use },
    adoption = state.adoptions[0];
  let checks = recordApplicability(
    [],
    adoption,
    context,
    "assessment",
    "Applicable",
    "Exact assessment supports cohort",
    at,
  );
  expect(
    useProgress(state.contribution, state.use, {
      adoptions: state.adoptions,
      checks,
    }).actor,
  ).toBe("sam");
  expect(
    applicabilityGuard(context, { adoptions: state.adoptions, checks }),
  ).toContain("bounded-use");
  checks = recordApplicability(
    checks,
    adoption,
    context,
    "bounded-use",
    "Applicable",
    "Same named audience and preview boundary",
    at,
  );
  expect(
    applicabilityGuard(context, { adoptions: state.adoptions, checks }),
  ).toBeUndefined();
  expect(state.use?.authorization).toBeUndefined();
  const expanded = adoptAgreement(
    state.adoptions,
    "brief-v2",
    "Support and Operations",
    "Expanded audience",
    at,
  );
  expect(
    applicabilityGuard(context, { adoptions: expanded, checks }),
  ).toContain("applicability unknown");
  const source = applicabilitySources(context).find(
    (s) => s.kind === "assessment",
  )!;
  expect(currentApplicability(checks, expanded[1], source)).toBeUndefined();
  const previous = checks[0];
  checks = recordApplicability(
    checks,
    adoption,
    context,
    "assessment",
    "Needs reassessment",
    "Coverage insufficient",
    at,
  );
  expect(checks[0]).toBe(previous);
  expect(
    applicabilityGuard(context, { adoptions: state.adoptions, checks }),
  ).toContain("Needs reassessment");
  const encoded = encodeKnowledgeCheckpoint({
    ...state,
    applicability: checks,
  });
  expect(JSON.parse(encoded).format).toBe("forge.knowledge-workspace.v2");
  expect(parseKnowledgeCheckpoint(encoded).state.applicability).toEqual(checks);
  for (const mutate of [
    (x: any) => (x.state.applicability[0].adoptionId = "foreign"),
    (x: any) => (x.state.applicability[0].reviewer = "Wrong actor"),
    (x: any) => (x.state.applicability[0].source.id = "foreign"),
    (x: any) => (x.format = "forge.knowledge-workspace.v1"),
  ]) {
    const value = JSON.parse(encoded);
    mutate(value);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(value))).toThrow();
  }
});
for (const width of [390, 1440])
  test(`adopted scope guard and historical decisions ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/workstreams/K-01?persona=leo");
    const recovery = page.getByRole("region", {
      name: "Knowledge workspace recovery",
      exact: true,
    });
    await recovery
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    await recovery.getByLabel("Import Knowledge checkpoint").setInputFiles({
      name: "scope.json",
      mimeType: "application/json",
      buffer: Buffer.from(encodeKnowledgeCheckpoint(fixture())),
    });
    await recovery
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "Inspect bounded-use source and history",
        exact: true,
      })
      .click();
    const use = page.getByRole("region", {
      name: "Assessed result to outcome",
      exact: true,
    });
    await expect(
      use.getByRole("button", {
        name: "Prepare authorization record",
        exact: true,
      }),
    ).toHaveCount(0);
    await use
      .getByRole("button", {
        name: "Inspect exact scope applicability",
        exact: true,
      })
      .click();
    const scope = page.getByRole("region", {
      name: "Exact scope applicability",
      exact: true,
    });
    async function assess(kind: string, conclusion: string) {
      await scope
        .getByRole("combobox", { name: "Exact source to assess" })
        .selectOption(kind);
      await scope
        .getByRole("combobox", { name: "Applicability conclusion" })
        .selectOption(conclusion);
      await scope
        .getByRole("textbox", { name: "Applicability rationale" })
        .fill(`${kind}: checked exact audience and limits`);
      await scope
        .getByRole("button", {
          name: "Prepare applicability decision",
          exact: true,
        })
        .click();
      await scope
        .getByRole("button", {
          name: "Record applicability locally",
          exact: true,
        })
        .click();
    }
    await assess("assessment", "Applicable");
    await assess("bounded-use", "Applicable");
    await page.evaluate(() => {
      location.hash = "/organizations/knowledge/use/K-01?persona=leo";
    });
    await expect(
      use.getByRole("button", {
        name: "Prepare authorization record",
        exact: true,
      }),
    ).toBeVisible();
    await use
      .getByRole("textbox", {
        name: "Decision rationale and scope limits",
        exact: true,
      })
      .fill("Allow exact draft for cohort preview only");
    await use
      .getByRole("button", {
        name: "Prepare authorization record",
        exact: true,
      })
      .click();
    await use
      .getByRole("button", {
        name: "Record authorization locally",
        exact: true,
      })
      .click();
    await page.evaluate(() => {
      location.hash =
        "/organizations/knowledge/agreements/K-01?persona=leo&agreementVersion=brief-v2";
    });
    const adoption = page.getByRole("region", {
      name: "Local agreement adoption",
      exact: true,
    });
    await adoption
      .getByRole("textbox", { name: "Named cohort or internal team list" })
      .fill("Support and Operations");
    await adoption
      .getByRole("textbox", { name: "Adoption rationale" })
      .fill("Expand audience");
    await adoption
      .getByRole("button", { name: "Prepare adoption of brief-v2" })
      .click();
    await adoption
      .getByRole("button", { name: "Record local adoption" })
      .click();
    await scope
      .getByText("Applicability history · 2 decisions", { exact: true })
      .click();
    await expect(scope).toContainText("Historical scope/source");
    await page.evaluate(() => {
      location.hash = "/organizations/knowledge/use/K-01?persona=leo";
    });
    await expect(
      use.getByRole("button", {
        name: "Prepare execution record",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(use.getByRole("alert")).toContainText("applicability unknown");
    const toggle = recovery.getByText(
      "Save or restore whole Knowledge workspace",
      { exact: true },
    );
    if (!(await toggle.evaluate((e) => e.parentElement!.hasAttribute("open"))))
      await toggle.click();
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
    await expect(use.getByRole("alert")).toContainText("applicability unknown");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

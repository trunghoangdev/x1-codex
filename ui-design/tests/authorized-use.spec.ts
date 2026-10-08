import { submitContributionCommand } from "../src/data/contributionCommand";
import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
} from "../src/data/humanContribution";
import {
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
} from "../src/data/authorizedUse";
import {
  encodeContributionCheckpoint,
  contributionCheckpointKey,
} from "../src/data/contributionCheckpoint";
const at = "2026-10-07T12:00:00Z";
function fixture() {
  let c = emptyContribution();
  c.contributions[0] = {
    ...c.contributions[0],
    body: "Contact onboarding with access context.",
    note: "Fictional cohort only",
    citesInput: true,
  };
  c = reviseContribution(
    assessContribution(
      receiveContribution(submitContributionCommand(c, "projected", at), at),
      at,
    ),
  );
  c.contributions[1] = {
    ...c.contributions[1],
    body: "Contact onboarding; include team and requested access.",
    note: "Explicit next steps for fictional cohort",
    citesInput: true,
  };
  return reassessContribution(
    receiveContribution(submitContributionCommand(c, "projected", at), at),
    "Suitable for stated scope",
    "Exact revision suitable for fictional cohort",
    at,
  );
}
test("exact source gates separate authority, failure, evidence and immutable reviews", () => {
  expect(assessedUseSubject(emptyContribution())).toBeUndefined();
  const subject = assessedUseSubject(fixture())!;
  const initial = allocateUseMandate(
    subject,
    "Fictional cohort",
    "Bounded preview mandate",
    at,
  )!;
  expect(
    recordUseStep(initial, subject, "Allowed", "skip assessment", at),
  ).toBe(initial);
  const assessed = recordUseStep(
    initial,
    subject,
    "Suitable",
    "Publication scope checked",
    at,
  );
  const refused = recordUseStep(
    assessed,
    subject,
    "Refused",
    "Scope unresolved",
    at,
  );
  expect(recordUseStep(refused, subject, "Succeeded", "skip refusal", at)).toBe(
    refused,
  );
  const authorized = recordUseStep(
    assessed,
    subject,
    "Allowed",
    "Internal preview only",
    at,
  );
  expect(
    recordUseStep(authorized, "other subject", "Succeeded", "wrong source", at),
  ).toBe(authorized);
  const failed = recordUseStep(
    authorized,
    subject,
    "Failed",
    "Preview unavailable",
    at,
  );
  expect(
    recordUseStep(
      failed,
      subject,
      "Criterion met in simulation",
      "false success",
      at,
    ),
  ).toBe(failed);
  const failedReview = recordUseStep(
    failed,
    subject,
    "Insufficient evidence",
    "No readers observed",
    at,
  );
  expect(failedReview.outcome?.sourceId).toBe(failed.execution?.id);
  const success = recordUseStep(
    authorized,
    subject,
    "Succeeded",
    "Preview rendered",
    at,
  );
  expect(
    recordUseStep(
      success,
      subject,
      "Criterion met in simulation",
      "no evidence",
      at,
    ),
  ).toBe(success);
  const missing = recordUseStep(
    success,
    subject,
    "No reader evidence",
    "No reader tasks recorded",
    at,
  );
  expect(
    recordUseStep(
      missing,
      subject,
      "Criterion met in simulation",
      "unsupported",
      at,
    ),
  ).toBe(missing);
  const observed = recordUseStep(
    success,
    subject,
    "Simulated reader evidence",
    "Two fictional tasks found next steps; limited sample",
    at,
  );
  const reviewed = recordUseStep(
    observed,
    subject,
    "Criterion met in simulation",
    "Criterion supported in this fictional example only",
    at,
  );
  expect(reviewed.outcome?.criterion).toBe("K-01-goal");
  expect(reviewed.outcome?.sourceId).toBe(observed.readerEvidence?.id);
  expect(reviewed.mandate).toBe(initial.mandate);
  expect(
    recordUseStep(reviewed, subject, "Insufficient evidence", "overwrite", at),
  ).toBe(reviewed);
});
for (const width of [390, 1440])
  test(`bounded use chain and insufficient evidence ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const encoded = encodeContributionCheckpoint(fixture());
    await page.addInitScript(
      ({ key, encoded }) => localStorage.setItem(key, encoded),
      { key: contributionCheckpointKey, encoded },
    );
    await page.goto("/#/organizations/knowledge/workstreams/K-01?persona=maya");
    if (
      !(await page
        .getByText("Save or restore Knowledge contribution", { exact: true })
        .evaluate((e) => e.parentElement!.hasAttribute("open")))
    ) {
      await page
        .getByText("Save or restore Knowledge contribution", { exact: true })
        .click();
    }
    await page
      .getByRole("button", { name: "Review saved contribution", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm restore contribution",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: "Inspect bounded-use source and history",
        exact: true,
      })
      .click();
    const panel = page.getByRole("region", {
      name: "Assessed result to outcome",
      exact: true,
    });
    await panel
      .getByRole("textbox", { name: "Bounded internal preview audience" })
      .fill("Fictional onboarding cohort");
    async function step(stage: string, choice?: string) {
      if (choice)
        await panel
          .getByRole("combobox", { name: "Recorded conclusion" })
          .selectOption(choice);
      await panel
        .getByRole("textbox")
        .last()
        .fill(`${stage}: fictional bounded example; limitations remain`);
      await panel
        .getByRole("button", { name: `Prepare ${stage} record`, exact: true })
        .click();
      await panel
        .getByRole("button", { name: `Record ${stage} locally`, exact: true })
        .click();
      await expect(
        panel.getByRole("heading", {
          name: "Assessed result → bounded use → outcome",
        }),
      ).toBeFocused();
    }
    await panel.getByRole("textbox").last().fill("Preview bounded mandate");
    await panel
      .getByRole("button", { name: "Prepare mandate record", exact: true })
      .click();
    await panel
      .getByRole("button", { name: "Cancel record", exact: true })
      .click();
    await expect(
      panel.getByRole("heading", {
        name: "local-publication-mandate",
        exact: true,
      }),
    ).toHaveCount(0);
    await step("mandate");
    await page
      .getByRole("button", {
        name: "Open local inbox · Sam · local publication reviewer / authorizer",
        exact: true,
      })
      .click();
    const inbox = page.getByRole("region", {
      name: "Local use responsibility inbox",
      exact: true,
    });
    await expect(inbox).toContainText("1 pending local responsibility");
    await expect(
      page.getByRole("heading", {
        name: "My Work · Sam · local publication reviewer / authorizer",
        exact: true,
      }),
    ).toBeVisible();
    await inbox
      .getByRole("combobox", { name: "Local responsibility actor" })
      .selectOption("owner");
    await expect(inbox).toContainText(
      "No pending local use responsibility for this actor",
    );
    await inbox
      .getByRole("combobox", { name: "Local responsibility actor" })
      .selectOption("sam");
    await inbox
      .getByRole("button", {
        name: "Open my exact use responsibility",
        exact: true,
      })
      .click();
    await page.evaluate(() => {
      location.hash = "/organizations/knowledge/attention?persona=maya";
    });
    const needs = page.getByRole("region", {
      name: "Concrete coordination needs",
      exact: true,
    });
    await expect(needs).toContainText("Assess publication scope");
    await needs
      .getByRole("button", {
        name: "Open next step · Sam · local publication reviewer / authorizer",
        exact: true,
      })
      .click();
    await step("assessment", "Suitable");
    await expect(
      panel.getByRole("heading", {
        name: "local-use-authorization",
        exact: true,
      }),
    ).toHaveCount(0);
    await step("authorization", "Allowed");
    await step("execution", "Succeeded");
    await step("evidence", "No reader evidence");
    await expect(
      panel
        .getByRole("combobox", { name: "Recorded conclusion" })
        .getByRole("option", {
          name: "Criterion met in simulation",
          exact: true,
        }),
    ).toHaveCount(0);
    await step("outcome", "Insufficient evidence");
    await expect(panel).toContainText("Outcome review recorded");
    await expect(panel).toContainText("No reader evidence");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const changed = fixture();
    changed.contributions[1].reassessment!.rationale =
      "Different scope assessment after restore";
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
      key: contributionCheckpointKey,
      value: encodeContributionCheckpoint(changed),
    });
    if (
      !(await page
        .getByText("Save or restore Knowledge contribution", { exact: true })
        .evaluate((e) => e.parentElement!.hasAttribute("open")))
    ) {
      await page
        .getByText("Save or restore Knowledge contribution", { exact: true })
        .click();
    }
    await page
      .getByRole("button", { name: "Review saved contribution", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm restore contribution",
        exact: true,
      })
      .click();
    await expect(panel.getByRole("status")).toContainText(
      "Source changed or removed: continuation blocked",
    );
    await expect(
      panel.getByRole("heading", {
        name: "local-use-authorization",
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await expect(panel).toContainText("Requires draft-02 delivery");
    await expect(
      panel.getByRole("heading", {
        name: "local-use-authorization",
        exact: true,
      }),
    ).toHaveCount(0);
  });

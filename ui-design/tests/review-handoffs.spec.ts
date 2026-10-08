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
} from "../src/data/authorizedUse";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
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

import {
  proposeReviewHandoff,
  respondReviewHandoff,
  reviewOwner,
  pendingReviewHandoff,
  type ReviewRole,
  type ReviewPrincipal,
} from "../src/data/reviewHandoffs";
import { controlAuthority } from "../src/data/authorizedUse";
function base() {
  const w = fixture();
  return {
    ...w,
    use: allocateUseMandate(
      assessedUseSubject(w.contribution),
      "Cohort two",
      "Fresh role mandate",
      at,
    )!,
  };
}
function transfer(s: AuthorizedUse, role: ReviewRole, to: ReviewPrincipal) {
  const p = proposeReviewHandoff(
    s,
    s.subject,
    role,
    to,
    "Transfer bounded decision responsibility",
    at,
  );
  expect(reviewOwner(p, role)).toBe(reviewOwner(s, role));
  expect(
    respondReviewHandoff(p, p.subject, to, "Accepted", "Inspected package", at),
  ).toBe(p);
  return respondReviewHandoff(
    p,
    p.subject,
    to,
    "Accepted",
    "Inspected exact package and rights",
    at,
    true,
  );
}
test("each decision role transfers only on acceptance, rejects former/wrong actors and preserves original grants and evidence", () => {
  const w = base();
  let s = transfer(w.use, "publicationReview", "reviewDelegate");
  expect(recordUseStep(s, s.subject, "Suitable", "Old holder", at)).toBe(s);
  expect(
    recordUseStep(
      s,
      s.subject,
      "Suitable",
      "Wrong role",
      at,
      "authorityDelegate",
    ),
  ).toBe(s);
  s = recordUseStep(
    s,
    s.subject,
    "Suitable",
    "Delegate review",
    at,
    "reviewDelegate",
  );
  expect(s.publicationAssessment?.actor).toBe("Demo publication reviewer");
  s = transfer(s, "authorization", "authorityDelegate");
  expect(recordUseStep(s, s.subject, "Allowed", "Old holder", at)).toBe(s);
  s = recordUseStep(
    s,
    s.subject,
    "Allowed",
    "Exact bounded grant",
    at,
    "authorityDelegate",
  );
  const grant = s.authorization;
  expect(
    controlAuthority(s, "Suspend", "Source issue", "Verify source", at),
  ).toBe(s);
  s = controlAuthority(
    s,
    "Suspend",
    "Source issue",
    "Verify source",
    at,
    "authorityDelegate",
  );
  s = transfer(s, "authorization", "sam");
  expect(s.authorization).toBe(grant);
  expect(
    controlAuthority(
      s,
      "Resume",
      "Resolved",
      "Source verified",
      at,
      "authorityDelegate",
    ),
  ).toBe(s);
  s = controlAuthority(s, "Resume", "Resolved", "Source verified", at, "sam");
  s = recordUseStep(s, s.subject, "Succeeded", "Execution observation", at);
  s = recordUseStep(
    s,
    s.subject,
    "No reader evidence",
    "Missing observations",
    at,
  );
  s = transfer(s, "outcomeReview", "outcomeDelegate");
  expect(
    recordUseStep(s, s.subject, "Insufficient evidence", "Former holder", at),
  ).toBe(s);
  expect(useProgress(w.contribution, s).actor).toBe("outcomeDelegate");
  s = recordUseStep(
    s,
    s.subject,
    "Insufficient evidence",
    "Outcome remains uncertain",
    at,
    "outcomeDelegate",
  );
  expect(s.outcome?.actor).toBe("Demo outcome reviewer");
  expect(s.authorization).toBe(grant);
  const workspace = { ...w, use: s },
    raw = encodeKnowledgeCheckpoint(workspace);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v9");
  expect(parseKnowledgeCheckpoint(raw).state).toEqual(workspace);
  expect(
    knowledgeTimeline(workspace).filter((e) => e.kind === "Handoff"),
  ).toHaveLength(8);
  for (const change of [
    (x: any) => (x.state.use.reviewHandoffs[1].actor = "sam"),
    (x: any) => delete x.state.use.reviewHandoffs[1].acknowledged,
    (x: any) => (x.state.use.reviewHandoffs[0].to = "maya"),
    (x: any) => (x.state.use.reviewHandoffs[3].package = "{}"),
    (x: any) => (x.state.use.reviewHandoffs[3].controlCount = 1),
    (x: any) =>
      (x.state.use.authorization.actor = "Sam · demo bounded-use authorizer"),
    (x: any) => (x.format = "forge.knowledge-workspace.v8"),
  ]) {
    const x = JSON.parse(raw);
    change(x);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
  const cycle2 = continueUse(s, s.subject, "Cohort two", "Fresh cycle", at);
  expect(cycle2.previousCycle?.reviewHandoffs).toHaveLength(8);
  expect(reviewOwner(cycle2, "authorization")).toBe("sam");
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint({ ...w, use: cycle2 }))
      .state.use,
  ).toEqual(cycle2);
  const c3 = nextVersion(w.contribution),
    fresh = startMaterialUse(
      s,
      assessedUseSubject(c3),
      "Cohort three",
      "New material",
      at,
    );
  expect(fresh.reviewHandoffs).toBeUndefined();
  expect(
    parseKnowledgeCheckpoint(
      encodeKnowledgeCheckpoint({ ...w, contribution: c3, use: fresh }),
    ).state.use,
  ).toEqual(fresh);
});
test("changed work/source blocks acceptance; decline/cancel keep responsibility and completed roles cannot transfer", () => {
  const w = base();
  let p = proposeReviewHandoff(
    w.use,
    w.use.subject,
    "publicationReview",
    "reviewDelegate",
    "Pending review",
    at,
  );
  expect(useProgress(w.contribution, p).actor).toBe("reviewDelegate");
  expect(
    respondReviewHandoff(
      p,
      p.subject,
      "sam",
      "Accepted",
      "Wrong actor",
      at,
      true,
    ),
  ).toBe(p);
  expect(
    respondReviewHandoff(
      p,
      undefined,
      "reviewDelegate",
      "Accepted",
      "Source missing",
      at,
      true,
    ),
  ).toBe(p);
  const worked = recordUseStep(
    p,
    p.subject,
    "Suitable",
    "Original holder still works",
    at,
  );
  expect(
    respondReviewHandoff(
      worked,
      worked.subject,
      "reviewDelegate",
      "Accepted",
      "Stale package",
      at,
      true,
    ),
  ).toBe(worked);
  expect(useProgress(w.contribution, worked).actor).toBe("owner");
  p = respondReviewHandoff(
    worked,
    undefined,
    "owner",
    "Cancelled",
    "Changed package withdrawn",
    at,
  );
  expect(reviewOwner(p, "publicationReview")).toBe("sam");
  expect(
    proposeReviewHandoff(
      p,
      p.subject,
      "publicationReview",
      "reviewDelegate",
      "Completed",
      at,
    ),
  ).toBe(p);
  p = proposeReviewHandoff(
    p,
    p.subject,
    "authorization",
    "authorityDelegate",
    "Pending authorization",
    at,
  );
  p = respondReviewHandoff(
    p,
    p.subject,
    "authorityDelegate",
    "Declined",
    "Unavailable",
    at,
  );
  expect(reviewOwner(p, "authorization")).toBe("sam");
  expect(pendingReviewHandoff(p)).toBeUndefined();
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint({ ...w, use: p })).state
      .use,
  ).toEqual(p);
});
for (const width of [320, 1440])
  test(`review and authorization handoff, former-holder gating, delegated outcome and recovery ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
      },
      { key: knowledgeCheckpointKey, raw: encodeKnowledgeCheckpoint(base()) },
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
    const handoff = page.getByRole("region", {
      name: "Review responsibility handoff",
      exact: true,
    });
    const chain = page.getByRole("region", {
      name: "Assessed result to outcome",
      exact: true,
    });
    const propose = async (role: string) => {
      await handoff
        .getByLabel("Review handoff actor", { exact: true })
        .selectOption("owner");
      await handoff
        .getByLabel("Responsibility to hand over", { exact: true })
        .selectOption(role);
      await handoff
        .getByLabel("Review handoff rationale", { exact: true })
        .fill("Transfer exact pending responsibility and bounded rights");
      await handoff
        .getByRole("button", {
          name: "Review responsibility change",
          exact: true,
        })
        .click();
      await handoff
        .getByRole("button", {
          name: "Record review responsibility change locally",
          exact: true,
        })
        .click();
    };
    const accept = async (actor: string) => {
      await handoff
        .getByLabel("Review handoff actor", { exact: true })
        .selectOption(actor);
      await handoff
        .getByLabel("Review handoff rationale", { exact: true })
        .fill("Inspected source, remaining work and rights");
      await expect(
        handoff.getByRole("button", {
          name: "Review responsibility change",
          exact: true,
        }),
      ).toBeDisabled();
      await handoff
        .getByLabel(
          "I inspected exact input, remaining work and bounded decision rights",
          { exact: true },
        )
        .check();
      await handoff
        .getByRole("button", {
          name: "Review responsibility change",
          exact: true,
        })
        .click();
      await handoff
        .getByRole("button", {
          name: "Record review responsibility change locally",
          exact: true,
        })
        .click();
    };
    const record = async (stage: string, principal?: string) => {
      if (principal)
        await chain
          .getByLabel("Acting decision principal", { exact: true })
          .selectOption(principal);
      await chain
        .getByRole("textbox")
        .last()
        .fill(`Separate ${stage} rationale; simulated evidence only`);
      await chain
        .getByRole("button", { name: `Prepare ${stage} record`, exact: true })
        .click();
      await chain
        .getByRole("button", { name: `Record ${stage} locally`, exact: true })
        .click();
    };
    await propose("publicationReview");
    await expect(handoff).toContainText("current holder remains responsible");
    await page
      .getByRole("button", {
        name: "Open local inbox · Demo publication reviewer",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "My Work · Demo publication reviewer",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", {
        name: "Local use responsibility inbox",
        exact: true,
      }),
    ).toContainText("1 pending local responsibility");
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/use/K-01"),
    );
    await accept("reviewDelegate");
    await chain
      .getByRole("textbox")
      .last()
      .fill("Old holder cannot assess after transfer");
    await expect(
      chain.getByRole("button", {
        name: "Prepare assessment record",
        exact: true,
      }),
    ).toBeDisabled();
    await record("assessment", "reviewDelegate");
    await expect(chain).toContainText("Demo publication reviewer");
    await propose("authorization");
    await accept("authorityDelegate");
    await chain
      .getByLabel("Acting decision principal", { exact: true })
      .selectOption("sam");
    await chain.getByRole("textbox").last().fill("Former holder cannot grant");
    await expect(
      chain.getByRole("button", {
        name: "Prepare authorization record",
        exact: true,
      }),
    ).toBeDisabled();
    await record("authorization", "authorityDelegate");
    const controls = page.getByRole("region", {
      name: "Use authority controls",
      exact: true,
    });
    await expect(
      controls.getByRole("button", {
        name: "Review authority decision",
        exact: true,
      }),
    ).toBeDisabled();
    await controls
      .getByLabel("Acting authority principal", { exact: true })
      .selectOption("authorityDelegate");
    await controls
      .getByLabel("Authority decision rationale", { exact: true })
      .fill("Stop pending issue review");
    await controls
      .getByLabel("Conditions to resume or verification of resolution", {
        exact: true,
      })
      .fill("Review source and scope before resuming");
    await controls
      .getByRole("button", { name: "Review authority decision", exact: true })
      .click();
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
    ).toBeVisible();
    await controls
      .getByLabel("Authority action", { exact: true })
      .selectOption("Resume");
    await controls
      .getByLabel("Authority decision rationale", { exact: true })
      .fill("Issue resolved after checking source");
    await controls
      .getByLabel("Conditions to resume or verification of resolution", {
        exact: true,
      })
      .fill("Exact input and scope checked");
    await controls
      .getByRole("button", { name: "Review authority decision", exact: true })
      .click();
    await controls
      .getByRole("button", {
        name: "Record authority decision locally",
        exact: true,
      })
      .click();
    await propose("outcomeReview");
    await accept("outcomeDelegate");
    await record("execution");
    await record("evidence");
    await chain
      .getByLabel("Acting decision principal", { exact: true })
      .selectOption("maya");
    await chain
      .getByRole("textbox")
      .last()
      .fill("Former outcome holder cannot decide");
    await expect(
      chain.getByRole("button", {
        name: "Prepare outcome record",
        exact: true,
      }),
    ).toBeDisabled();
    await record("outcome", "outcomeDelegate");
    await expect(chain).toContainText("Demo outcome reviewer");
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
    await expect(handoff).toContainText(
      "Publication review: Demo publication reviewer",
    );
    await expect(handoff).toContainText(
      "Outcome review: Demo outcome reviewer",
    );
    await expect(
      chain.getByRole("heading", {
        name: "local-use-outcome-review",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
test("authority control changes invalidate pending acceptance; bounded handoff history restores at its limit", () => {
  const w = base();
  let s = recordUseStep(w.use, w.use.subject, "Suitable", "Scope reviewed", at);
  s = recordUseStep(s, s.subject, "Allowed", "Bounded grant", at);
  s = proposeReviewHandoff(
    s,
    s.subject,
    "authorization",
    "authorityDelegate",
    "Control handoff",
    at,
  );
  s = controlAuthority(s, "Suspend", "Issue found", "Verify source", at);
  expect(
    respondReviewHandoff(
      s,
      s.subject,
      "authorityDelegate",
      "Accepted",
      "Old package",
      at,
      true,
    ),
  ).toBe(s);
  s = respondReviewHandoff(
    s,
    s.subject,
    "owner",
    "Cancelled",
    "Control package changed",
    at,
  );
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint({ ...w, use: s })).state
      .use,
  ).toEqual(s);
  let bounded = w.use;
  for (let i = 0; i < 20; i++)
    bounded = transfer(
      bounded,
      "authorization",
      reviewOwner(bounded, "authorization") === "sam"
        ? "authorityDelegate"
        : "sam",
    );
  expect(bounded.reviewHandoffs).toHaveLength(40);
  expect(
    proposeReviewHandoff(
      bounded,
      bounded.subject,
      "authorization",
      "authorityDelegate",
      "Exceeds bound",
      at,
    ),
  ).toBe(bounded);
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint({ ...w, use: bounded }))
      .state.use,
  ).toEqual(bounded);
});

import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
} from "../src/data/humanContribution";
import { recordKnowledgeResponsibility } from "../src/data/knowledgeResponsibility";
import {
  proposeKnowledgeHandoff as propose,
  respondKnowledgeHandoff as respond,
  contributionPerformer,
  handoffIsCurrent,
} from "../src/data/knowledgeHandoff";
import { submitContributionCommand } from "../src/data/contributionCommand";
import {
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
  contributionCheckpointKey,
} from "../src/data/contributionCheckpoint";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
} from "../src/data/knowledgeCheckpoint";
import {
  assessedUseSubject,
  allocateUseMandate,
} from "../src/data/authorizedUse";
import { actionableAttention } from "../src/data/actionableAttention";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { validScenarioPath } from "../src/scenarioRoutes";
const at = (n: number) => `2026-10-01T12:00:${String(n).padStart(2, "0")}Z`;
function base() {
  let s = emptyContribution();
  s.contributions[0] = {
    ...s.contributions[0],
    body: "Contact onboarding with your team and question.",
    note: "Fictional cohort only",
    citesInput: true,
  };
  return recordKnowledgeResponsibility(
    recordKnowledgeResponsibility(
      s,
      "Offer responsibility",
      "owner",
      "Bounded guide",
      at(0),
    ),
    "Accept responsibility",
    "leo",
    "I can prepare",
    at(1),
  );
}
function offered() {
  return propose(
    base(),
    "owner",
    "delegate",
    "Clarify context before delivering to Maya",
    "Leo unavailable",
    at(2),
  );
}

test("exact package acceptance transfers preparation/submission only and preserves earlier actors on return", () => {
  let s = offered();
  const frozen = structuredClone(s.contributions);
  expect(contributionPerformer(s)).toBe("leo");
  expect(handoffIsCurrent(s, s.handoffs![0])).toBe(true);
  expect(respond(s, "leo", "Accepted", "Wrong recipient", true, at(3))).toBe(s);
  expect(
    respond(s, "delegate", "Accepted", "No acknowledgement", false, at(3)),
  ).toBe(s);
  s = respond(
    s,
    "delegate",
    "Accepted",
    "Inspected input, work and rights",
    true,
    at(3),
  );
  expect(s.contributions).toEqual(frozen);
  expect(contributionPerformer(s)).toBe("delegate");
  expect(submitContributionCommand(s, "projected", at(4), "leo")).toBe(s);
  expect(submitContributionCommand(s, "projected", at(2), "delegate")).toBe(s);
  s = submitContributionCommand(s, "projected", at(4), "delegate");
  expect(s.commands!.at(-1)!.performer).toBe("delegate");
  expect(s.contributions[0].delivery!.performer).toBe("delegate");
  expect(s.contributions[0].assessment).toBeUndefined();
  s = reviseContribution(
    assessContribution(receiveContribution(s, at(4)), at(4)),
  );
  s.contributions[1] = {
    ...s.contributions[1],
    note: "Addressed request",
    citesInput: true,
  };
  const prior = structuredClone(s.contributions[0]);
  s = propose(
    s,
    "owner",
    "leo",
    "Finish revision two",
    "Delegate completed initial contribution",
    at(5),
  );
  s = respond(
    s,
    "leo",
    "Accepted",
    "Exact revision handoff acknowledged",
    true,
    at(6),
  );
  expect(s.handoffs![1].requestId).toBe("human-assessment-v1");
  expect(s.contributions[0]).toEqual(prior);
  s = reassessContribution(
    receiveContribution(
      submitContributionCommand(s, "projected", at(7), "leo"),
      at(7),
    ),
    "Suitable for stated scope",
    "Reviewed revision",
    at(7),
  );
  expect(s.commands!.map((c) => c.performer)).toEqual(["delegate", "leo"]);
  const use = allocateUseMandate(
    assessedUseSubject(s),
    "October cohort",
    "New separate bounded mandate",
    at(8),
  )!;
  const workspace = {
    contribution: s,
    brief: { versions: [] },
    adoptions: [],
    use,
  };
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(workspace)).state,
  ).toEqual(workspace);
  expect(JSON.parse(encodeKnowledgeCheckpoint(workspace)).format).toBe(
    "forge.knowledge-workspace.v5",
  );
});

test("changed work blocks acceptance; cancellation and decline retain original ownership", () => {
  const s = offered();
  const changed = {
    ...s,
    contributions: [{ ...s.contributions[0], body: "Changed after proposal" }],
  };
  expect(handoffIsCurrent(changed, s.handoffs![0])).toBe(false);
  expect(respond(changed, "delegate", "Accepted", "Stale", true, at(3))).toBe(
    changed,
  );
  expect(
    actionableAttention(knowledgeOrganization, changed)[0].destination,
  ).toContain("useActor=owner");
  const cancelled = respond(
    changed,
    "owner",
    "Cancelled",
    "Refresh the exact package",
    false,
    at(3),
  );
  const next = propose(
    cancelled,
    "owner",
    "delegate",
    "Continue revised text",
    "New current input package",
    at(4),
  );
  const declined = respond(
    next,
    "delegate",
    "Declined",
    "No capacity",
    false,
    at(5),
  );
  expect(contributionPerformer(declined)).toBe("leo");
  expect(declined.handoffs![0]).toEqual(cancelled.handoffs![0]);
  expect(
    parseContributionCheckpoint(encodeContributionCheckpoint(declined)).state,
  ).toEqual(declined);
  const submitted = submitContributionCommand(s, "projected", at(3), "leo");
  expect(
    respond(
      submitted,
      "delegate",
      "Accepted",
      "Already submitted",
      true,
      at(4),
    ),
  ).toBe(submitted);
  expect(
    parseContributionCheckpoint(encodeContributionCheckpoint(submitted)).state,
  ).toEqual(submitted);
  const unresolved = submitContributionCommand(base(), "unknown", at(2), "leo");
  expect(
    propose(
      unresolved,
      "owner",
      "delegate",
      "Finish",
      "Pending command",
      at(3),
    ),
  ).toBe(unresolved);
});

test("v5 recovery rejects changed input/authority, wrong recipient, missing acknowledgement and false command ownership", () => {
  const accepted = respond(
    offered(),
    "delegate",
    "Accepted",
    "Inspected",
    true,
    at(3),
  );
  const sent = submitContributionCommand(
    accepted,
    "projected",
    at(4),
    "delegate",
  );
  const raw = encodeContributionCheckpoint(sent);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-contribution.v5");
  for (const mutate of [
    (s: any) => (s.handoffs[0].input.body = "A different brief"),
    (s: any) => (s.handoffs[0].input.id = "input-access-brief-v2"),
    (s: any) => s.handoffs[0].authority.allowed.push("Authorize publication"),
    (s: any) => (s.handoffs[0].response.actor = "maya"),
    (s: any) => delete s.handoffs[0].response.acknowledged,
    (s: any) => (s.commands[0].performer = "leo"),
    (s: any) => (s.contributions[0].delivery.performer = "leo"),
    (s: any) => (s.handoffs[0].commandCount = 1),
  ]) {
    const broken = JSON.parse(raw);
    mutate(broken.state);
    expect(() => parseContributionCheckpoint(JSON.stringify(broken))).toThrow();
  }
  expect(() =>
    parseContributionCheckpoint(
      raw.replace(
        "forge.knowledge-contribution.v5",
        "forge.knowledge-contribution.v4",
      ),
    ),
  ).toThrow();
  expect(
    validScenarioPath(
      "/organizations/knowledge/work?persona=leo&contributionActor=delegate",
    ),
  ).toBe(true);
  expect(
    validScenarioPath(
      "/organizations/knowledge/contributions/K-01-H?persona=leo&contributionActor=delegate",
    ),
  ).toBe(true);
  expect(
    validScenarioPath(
      "/organizations/knowledge/work?persona=maya&contributionActor=delegate",
    ),
  ).toBe(false);
});

for (const width of [320, 1440])
  test(`exact handoff recipient accepts, old contributor becomes read-only and recovery retains ownership ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
      },
      {
        key: contributionCheckpointKey,
        raw: encodeContributionCheckpoint(base()),
      },
    );
    await page.goto(
      "/#/organizations/knowledge/work?persona=leo&useActor=owner",
    );
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review saved contribution", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm restore contribution",
        exact: true,
      })
      .click();
    const panel = page.getByRole("region", {
      name: "Knowledge input and authority handoff",
    });
    await panel
      .getByLabel("Remaining work", { exact: true })
      .fill("Explain the context to provide and deliver to Maya.");
    await panel
      .getByLabel("Handoff rationale", { exact: true })
      .fill("Leo unavailable for the next preparation step.");
    await panel
      .getByRole("button", { name: "Review handoff action", exact: true })
      .click();
    const preview = panel.getByRole("region", {
      name: "Handoff action preview",
    });
    await expect(preview).toContainText(
      "Contact onboarding with your team and question.",
    );
    await expect(preview).toContainText("input-access-brief-v1");
    await expect(preview).toContainText("Authorize publication");
    await panel
      .getByRole("button", { name: "Confirm handoff action", exact: true })
      .click();
    await expect(panel).toContainText("Leo retains responsibility");
    await panel
      .getByRole("button", {
        name: "Inspect handoff recipient · Demo delegate",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "My Work · Demo delegate" }),
    ).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Review handoff action", exact: true }),
    ).toBeDisabled();
    await panel
      .getByLabel("I inspected the exact input version and content.", {
        exact: true,
      })
      .check();
    await panel
      .getByLabel("I inspected the frozen draft and remaining work.", {
        exact: true,
      })
      .check();
    await panel
      .getByLabel("I acknowledge the bounded rights and excluded authority.", {
        exact: true,
      })
      .check();
    await panel
      .getByLabel("Handoff rationale", { exact: true })
      .fill("Inspected exact input and scope; I can finish this contribution.");
    await panel
      .getByRole("button", { name: "Review handoff action", exact: true })
      .click();
    await panel
      .getByRole("button", { name: "Confirm handoff action", exact: true })
      .click();
    await expect(panel).toContainText("Current contributor: Demo delegate.");
    await panel
      .getByRole("button", {
        name: "Open current contributor · Demo delegate",
        exact: true,
      })
      .click();
    await expect(
      page.getByLabel("Contribution text", { exact: true }),
    ).toBeEnabled();
    await page
      .getByLabel("Contribution text", { exact: true })
      .fill("Delegate clarified context for the cohort.");
    await page.evaluate(
      () =>
        (location.hash =
          "/organizations/knowledge/contributions/K-01-H?persona=leo"),
    );
    await expect(
      page.getByLabel("Contribution text", { exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Review delivery", exact: true }),
    ).toBeDisabled();
    await panel
      .getByRole("button", {
        name: "Open current contributor · Demo delegate",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Review delivery", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Record local delivery", exact: true })
      .click();
    await page
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    await page
      .getByRole("button", { name: "Save workspace checkpoint", exact: true })
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
    await expect(panel).toContainText("Current contributor: Demo delegate.");
    await panel
      .getByText("Handoff history · 1 packages", { exact: true })
      .click();
    await expect(panel).toContainText(
      "Inspected exact input and scope; I can finish this contribution.",
    );
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/work?persona=maya"),
    );
    await expect(
      page.getByRole("button", {
        name: "Record sample receipt · draft-01",
        exact: true,
      }),
    ).toBeEnabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

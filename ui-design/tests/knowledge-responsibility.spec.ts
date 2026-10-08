import { actionableAttention } from "../src/data/actionableAttention";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  deliverContribution,
} from "../src/data/humanContribution";
import {
  recordKnowledgeResponsibility as record,
  knowledgeResponsibilityStatus as status,
} from "../src/data/knowledgeResponsibility";
import { submitContributionCommand } from "../src/data/contributionCommand";
import { contributionView } from "../src/data/contributionView";
import {
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
} from "../src/data/contributionCheckpoint";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  parseKnowledgeImport,
} from "../src/data/knowledgeCheckpoint";
const at = "2026-10-08T14:00:00Z";
function draft() {
  const s = emptyContribution();
  s.contributions[0] = {
    ...s.contributions[0],
    body: "Contact onboarding with team and access question",
    note: "Fictional cohort",
    citesInput: true,
  };
  return s;
}

test("Knowledge allocation is distinct from acceptance, clarification and decline; submission requires acceptance", () => {
  const initial = draft();
  expect(status(initial)).toBe("Authored assignment · no local offer");
  expect(record(initial, "Offer responsibility", "leo", "Scope", at)).toBe(
    initial,
  );
  expect(record(initial, "Offer responsibility", "owner", " ", at)).toBe(
    initial,
  );
  let s = record(
    initial,
    "Offer responsibility",
    "owner",
    "Prepare the bounded cohort guide",
    at,
  );
  const offer = structuredClone(s.responsibility);
  expect(status(s)).toBe("Acceptance pending");
  expect(actionableAttention(knowledgeOrganization, s)[0].destination).toBe(
    "/organizations/knowledge/work?persona=leo",
  );
  expect(submitContributionCommand(s, "projected", at)).toBe(s);
  expect(deliverContribution(s, at)).toBe(s);
  expect(record(s, "Accept responsibility", "owner", "Wrong actor", at)).toBe(
    s,
  );
  s = record(s, "Request clarification", "leo", "Which cohort?", at);
  expect(status(s)).toBe("Clarification requested");
  expect(
    actionableAttention(knowledgeOrganization, s)[0].destination,
  ).toContain("useActor=owner");
  expect(contributionView(s).attention).toBe("allocation");
  expect(
    record(s, "Accept responsibility", "leo", "Cannot skip revised offer", at),
  ).toBe(s);
  s = record(s, "Offer responsibility", "owner", "October cohort only", at);
  s = record(s, "Decline responsibility", "leo", "No capacity", at);
  expect(status(s)).toBe("Declined · coordination needed");
  expect(submitContributionCommand(s, "projected", at)).toBe(s);
  s = record(
    s,
    "Offer responsibility",
    "owner",
    "Scope narrowed; please reconsider",
    at,
  );
  s = record(
    s,
    "Accept responsibility",
    "leo",
    "Can prepare the narrow guide",
    at,
  );
  expect(s.responsibility!.events.slice(0, 1)).toEqual(offer!.events);
  expect(s.contributions).toEqual(initial.contributions);
  expect(status(s)).toBe("Accepted locally");
  expect(
    record(s, "Decline responsibility", "leo", "Cannot rewrite acceptance", at),
  ).toBe(s);
  expect(
    submitContributionCommand(s, "projected", "2026-10-08T13:00:00Z"),
  ).toBe(s);
  const sent = submitContributionCommand(s, "projected", at);
  expect(sent.contributions[0].delivery).toBeDefined();
  expect(sent.contributions[0].receipt).toBeUndefined();
  expect(
    record(
      submitContributionCommand(initial, "pending", at),
      "Offer responsibility",
      "owner",
      "Too late",
      at,
    ).responsibility,
  ).toBeUndefined();
  expect(
    parseContributionCheckpoint(encodeContributionCheckpoint(sent)).state,
  ).toEqual(sent);
});

test("v4 recovery replays exact scope, actors and transitions, including whole workspace and partial import", () => {
  const offered = record(
    draft(),
    "Offer responsibility",
    "owner",
    "Bounded guide",
    at,
  );
  const raw = encodeContributionCheckpoint(offered);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-contribution.v4");
  expect(parseKnowledgeImport(raw)).toMatchObject({
    kind: "contribution",
    contribution: offered,
  });
  for (const mutate of [
    (r: any) => (r.performer = "maya"),
    (r: any) => (r.input = "input-other-v1"),
    (r: any) => (r.events[0].actor = "leo"),
    (r: any) => (r.events[0].id = "knowledge-responsibility-2"),
    (r: any) => (r.events[0].action = "Accept responsibility"),
    (r: any) => (r.events[0].unexpected = true),
    (r: any) => (r.events = []),
  ]) {
    const broken = JSON.parse(raw);
    mutate(broken.state.responsibility);
    expect(() => parseContributionCheckpoint(JSON.stringify(broken))).toThrow();
  }
  expect(() =>
    parseContributionCheckpoint(
      raw.replace(
        "forge.knowledge-contribution.v4",
        "forge.knowledge-contribution.v3",
      ),
    ),
  ).toThrow();
  const accepted = record(
    offered,
    "Accept responsibility",
    "leo",
    "Agreed",
    at,
  );
  const sent = submitContributionCommand(accepted, "projected", at);
  const broken = JSON.parse(encodeContributionCheckpoint(sent));
  broken.state.responsibility.events.pop();
  expect(() => parseContributionCheckpoint(JSON.stringify(broken))).toThrow();
  for (const contribution of [offered, accepted, sent]) {
    const workspace = { contribution, brief: { versions: [] }, adoptions: [] };
    const saved = encodeKnowledgeCheckpoint(workspace);
    expect(JSON.parse(saved).format).toBe("forge.knowledge-workspace.v4");
    expect(parseKnowledgeCheckpoint(saved).state).toEqual(workspace);
    expect(() =>
      parseKnowledgeCheckpoint(
        saved.replace(
          "forge.knowledge-workspace.v4",
          "forge.knowledge-workspace.v3",
        ),
      ),
    ).toThrow();
  }
});

for (const width of [320, 1440])
  test(`owner offer, Leo clarification/decline/acceptance, blocked submission and recovery ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/organizations/knowledge");
    const panel = page.getByRole("region", {
      name: "Knowledge contribution responsibility",
    });
    await expect(panel).toContainText("Authored assignment · no local offer");
    await panel
      .getByRole("button", { name: "Inspect allocation · demo owner" })
      .click();
    const commit = async (reason: string) => {
      await panel
        .getByLabel("Responsibility rationale", { exact: true })
        .fill(reason);
      await panel
        .getByRole("button", {
          name: "Review responsibility action",
          exact: true,
        })
        .click();
      await panel
        .getByRole("button", {
          name: "Confirm responsibility action",
          exact: true,
        })
        .click();
      await expect(
        panel.getByRole("heading", {
          name: "Guide contribution · allocation and acceptance",
        }),
      ).toBeFocused();
    };
    await commit("Prepare October cohort guide.");
    await expect(panel).toContainText("Acceptance pending");
    await panel
      .getByRole("button", { name: "Inspect responsibility · Leo" })
      .click();
    await expect(panel.getByLabel("Responsibility response")).toBeVisible();
    await panel
      .getByLabel("Responsibility response")
      .selectOption("Request clarification");
    await commit("Which access context should be supplied?");
    await expect(panel).toContainText("Clarification requested");
    await panel
      .getByRole("button", { name: "Inspect allocation · demo owner" })
      .click();
    await commit("Team name and requested access; October cohort only.");
    await panel
      .getByRole("button", { name: "Inspect responsibility · Leo" })
      .click();
    await panel
      .getByLabel("Responsibility response")
      .selectOption("Decline responsibility");
    await commit("Cannot meet the current scope.");
    await expect(panel).toContainText("Declined · coordination needed");
    await page.evaluate(
      () =>
        (location.hash =
          "/organizations/knowledge/contributions/K-01-H?persona=leo"),
    );
    await page
      .getByLabel("Contribution text", { exact: true })
      .fill("Contact onboarding with team and access context.");
    await page
      .getByLabel("Delivery note", { exact: true })
      .fill("October cohort only.");
    await page.getByLabel(/Cite input-access-brief-v1/).check();
    await expect(
      page.getByRole("button", { name: "Review delivery", exact: true }),
    ).toBeDisabled();
    await panel
      .getByRole("button", { name: "Inspect allocation · demo owner" })
      .click();
    await commit("Narrower scope and flexible timing; please reconsider.");
    await panel
      .getByRole("button", { name: "Inspect responsibility · Leo" })
      .click();
    await panel
      .getByLabel("Responsibility response")
      .selectOption("Accept responsibility");
    await commit("I can take this bounded contribution.");
    await expect(panel).toContainText("Accepted locally");
    await page
      .getByRole("button", { name: "Open contribution · K-01-H", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Review delivery", exact: true }),
    ).toBeEnabled();
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
    await expect(panel).toContainText("Accepted locally");
    await panel
      .getByText("Responsibility history · 6 events", { exact: true })
      .click();
    await expect(panel).toContainText(
      "Which access context should be supplied?",
    );
    await expect(panel).toContainText("Cannot meet the current scope.");
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/work?persona=maya"),
    );
    await expect(panel.getByLabel("Responsibility response")).toHaveCount(0);
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

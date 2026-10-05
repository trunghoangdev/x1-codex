import { test, expect } from "@playwright/test";
import { actionableAttention } from "../src/data/actionableAttention";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import {
  emptyContribution,
  deliverContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
} from "../src/data/humanContribution";
test("coordination signals track receipt and revision without implying outcome", () => {
  const initial = emptyContribution();
  expect(
    actionableAttention(knowledgeOrganization, initial).some(
      (x) => x.id === "local-K-01-H",
    ),
  ).toBe(false);
  const delivered = deliverContribution(
    {
      contributions: [
        {
          ...initial.contributions[0],
          body: "first",
          note: "scope",
          citesInput: true,
        },
      ],
    },
    "now",
  );
  expect(
    actionableAttention(knowledgeOrganization, delivered)[0].destination,
  ).toContain("persona=maya");
  const received = receiveContribution(delivered, "receipt");
  expect(
    actionableAttention(knowledgeOrganization, received).some(
      (x) => x.id === "local-K-01-H",
    ),
  ).toBe(false);
  const assessed = assessContribution(received, "assessment");
  expect(
    actionableAttention(knowledgeOrganization, assessed)[0].destination,
  ).toContain("persona=leo");
  expect(
    actionableAttention(
      knowledgeOrganization,
      reviseContribution(assessed),
    ).some((x) => x.id === "local-K-01-H"),
  ).toBe(false);
  expect(
    actionableAttention(knowledgeOrganization, received).filter(
      (x) => x.category === "Outcome",
    ),
  ).toEqual(
    actionableAttention(knowledgeOrganization, initial).filter(
      (x) => x.category === "Outcome",
    ),
  );
});
test("organization next-step link opens exact receiver inbox", async ({
  page,
}) => {
  await page.goto("/#/organizations/knowledge/work?persona=leo");
  await page
    .getByRole("button", { name: "Open contribution · K-01-H" })
    .click();
  await page.getByLabel("Contribution text").fill("next step");
  await page.getByLabel("Delivery note", { exact: true }).fill("scope");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Review delivery" }).click();
  await page.getByRole("button", { name: "Record local delivery" }).click();
  await page
    .getByRole("button", { name: "View Organization", exact: true })
    .click();
  const needs = page.getByRole("region", {
    name: "Concrete coordination needs",
  });
  await expect(
    needs.getByText(
      "Receipt responsibility: Maya. No separate escalation owner is recorded.",
    ),
  ).toBeVisible();
  await needs
    .getByRole("button", { name: "Open next step · Maya · sample receiver" })
    .click();
  await expect(page).toHaveURL(/work\?persona=maya/);
  await expect(
    page.getByRole("button", { name: "Record sample receipt · draft-01" }),
  ).toBeVisible();
});

import { test, expect } from "@playwright/test";
import { personalCaseFollowUp } from "../src/data/coordinationCases";
import { knowledgeOrganization as scenario } from "../src/data/knowledgeOrganization";
import {
  mainOrganization,
  largeOrganization,
} from "../src/data/organizationScenario";

test("personal case ownership is explicit and separate from assignments and role bindings", () => {
  expect(personalCaseFollowUp(scenario, "leo").owned.map((c) => c.id)).toEqual([
    "current-workshop-brief",
  ]);
  expect(personalCaseFollowUp(scenario, "maya").owned).toEqual([]);
  expect(
    personalCaseFollowUp({ ...scenario, bindings: [], assignments: [] }, "leo")
      .owned,
  ).toEqual(personalCaseFollowUp(scenario, "leo").owned);
  expect(personalCaseFollowUp(mainOrganization, "leo").owned).toEqual([]);
  expect(personalCaseFollowUp(largeOrganization, "leo").owned).toEqual([]);
  expect(
    personalCaseFollowUp(scenario, "leo", { query: "", stream: "K-01" }).shown,
  ).toEqual([]);
  expect(
    personalCaseFollowUp(scenario, "leo", { query: "audience", stream: "K-02" })
      .shown,
  ).toHaveLength(1);
  expect(
    scenario.assignments.filter((a) => a.workerId === "leo").map((a) => a.id),
  ).toEqual(["K-01-H", "K-01-P", "K-02-C"]);
});
for (const width of [390, 1440])
  test(`personal follow-up filters, source return and persona isolation ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/#/organizations/knowledge/work?persona=leo&status=waiting&stream=K-02&q=audience",
    );
    const origin = page.url();
    const section = page.getByRole("region", {
      name: "My coordination follow-up",
    });
    await expect(section).toContainText("1 of 1 owned cases shown");
    await expect(section).toContainText("Next action:");
    await expect(section).toContainText("Waiting for:");
    await expect(page.locator(".personal-queue-results")).toContainText(
      "0 of 3 allocated assignments shown",
    );
    await page
      .getByRole("button", {
        name: "Inspect my follow-up case · current-workshop-brief",
        exact: true,
      })
      .click();
    const detail = page.url();
    await page
      .getByRole("button", {
        name: "Inspect supplying responsibility · K-02-C",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(detail);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(origin);
    await page
      .getByRole("combobox", { name: "Workstream", exact: true })
      .selectOption("K-01");
    await expect(section).toContainText("0 of 1 owned cases shown");
    await page
      .getByRole("button", { name: "Clear work filters", exact: true })
      .click();
    await expect(
      page.getByRole("searchbox", { name: "Search my work", exact: true }),
    ).toBeFocused();
    await expect(section).toContainText("1 of 1 owned cases shown");
    await page
      .getByRole("combobox", { name: "Sample persona", exact: true })
      .selectOption("maya");
    await expect(section).toContainText("0 of 0 owned cases shown");
    await expect(section).toContainText(
      "No case follow-up ownership is represented for you",
    );
    await expect(
      page.getByRole("button", {
        name: "Inspect my follow-up case · current-workshop-brief",
        exact: true,
      }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

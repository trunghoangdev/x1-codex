import { test, expect } from "@playwright/test";
import {
  outcomeReviewRecords,
  readerObservations,
} from "../src/data/outcomeReviewRecords";
import { knowledgeOrganization as scenario } from "../src/data/knowledgeOrganization";
import { mainOrganization } from "../src/data/organizationScenario";
import { validScenarioPath } from "../src/ScenarioWorkspace";

test("review is explicitly allocated, subject-bound and independent of current evidence", () => {
  const [review] = outcomeReviewRecords(scenario, "K-01");
  expect(review.conclusion).toBe("insufficient-evidence");
  expect(review.agreementVersion).toBe("brief-v1");
  expect(
    outcomeReviewRecords({ ...scenario, bindings: [], evidence: [] }, "K-01"),
  ).toEqual([review]);
  expect(outcomeReviewRecords(mainOrganization, "K-01")).toEqual([]);
  expect(outcomeReviewRecords(scenario, "K-02")).toEqual([]);
  expect(scenario.evidence).toEqual([]);
  for (const criterion of review.criteria) {
    expect(
      scenario.outcomes
        .find((o) => o.streamId === review.streamId)
        ?.criteria.some((c) => c.id === criterion.criterionId),
    ).toBe(true);
    for (const id of criterion.observationIds) {
      const observation = readerObservations.find((o) => o.id === id)!;
      expect(observation.subjectId).toBe(review.subject.id);
      expect(observation.subjectVersion).toBe(review.subject.version);
    }
  }
  expect(
    validScenarioPath(
      "/organizations/knowledge/outcome-reviews/guide-review-01?persona=maya",
    ),
  ).toBe(true);
  for (const path of [
    "/organizations/large/outcome-reviews/guide-review-01",
    "/organizations/knowledge/outcome-reviews/missing",
    "/organizations/knowledge/outcome-reviews/guide-review-01?agreementVersion=brief-v2",
  ])
    expect(validScenarioPath(path)).toBe(false);
});
for (const width of [390, 1440])
  test(`review inspection and version-bound source return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/outcomes/K-01?persona=leo");
    const outcome = page.url();
    await page
      .getByRole("button", {
        name: "Inspect outcome review record · guide-review-01",
        exact: true,
      })
      .click();
    const detail = page.url();
    await expect(
      page.getByRole("heading", {
        name: "Outcome review · guide-review-01",
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.getByRole("region", { name: "Reviewed subject and responsibility" }),
    ).toContainText("example-review-allocation-01");
    await expect(
      page.getByRole("region", { name: "Review evidence and gaps" }),
    ).toContainText("could not identify the next step");
    await expect(
      page.getByRole("region", { name: "Review scope and conclusion limits" }),
    ).toContainText("does not assess the expanded brief-v2 audience");
    await page
      .getByRole("button", {
        name: "Inspect reviewed agreement proposal · brief-v1",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("combobox", {
        name: "Proposed brief version",
        exact: true,
      }),
    ).toHaveValue("brief-v1");
    await page
      .getByRole("combobox", { name: "Proposed brief version", exact: true })
      .selectOption("brief-v2");
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(detail);
    await expect(
      page.getByRole("region", { name: "Reviewed subject and responsibility" }),
    ).toContainText("brief-v1");
    await page
      .getByRole("button", { name: "Inspect reviewer context", exact: true })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(detail);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(outcome);
    await expect(
      page.getByRole("heading", { name: "Not verified", exact: true }),
    ).toBeVisible();
    await page.goto("/#/organizations/knowledge/outcomes/K-02");
    await expect(
      page.getByRole("button", {
        name: "Inspect outcome review record · guide-review-01",
        exact: true,
      }),
    ).toHaveCount(0);
  });

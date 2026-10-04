import { test, expect } from "@playwright/test";
import {
  mainOrganization,
  largeOrganization,
} from "../src/data/organizationScenario";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { outcomeContextEvidence } from "../src/data/outcomeContext";
import { validScenarioPath } from "../src/ScenarioWorkspace";

test("outcome evidence resolves within scenario and stream references", () => {
  const stream = mainOrganization.streams[0];
  expect(outcomeContextEvidence(mainOrganization, stream, "AR-775")?.id).toBe(
    "AR-775",
  );
  expect(
    outcomeContextEvidence(
      mainOrganization,
      mainOrganization.streams[1],
      "AR-775",
    ),
  ).toBeUndefined();
  expect(
    outcomeContextEvidence(
      knowledgeOrganization,
      knowledgeOrganization.streams[0],
      "AR-775",
    ),
  ).toBeUndefined();
  expect(
    outcomeContextEvidence(
      { ...mainOrganization, assignments: [] },
      stream,
      "AR-775",
    ),
  ).toBeUndefined();
  expect(
    validScenarioPath("/organizations/knowledge/outcomes/K-01?persona=maya"),
  ).toBe(true);
  expect(
    validScenarioPath("/organizations/large/outcomes/L-01?persona=sam"),
  ).toBe(true);
  expect(validScenarioPath("/organizations/knowledge/outcomes/WS-01")).toBe(
    false,
  );
});
for (const width of [390, 1440]) {
  for (const scenario of [knowledgeOrganization, largeOrganization]) {
    test(`shared outcome ${scenario.id} source and scope ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      const stream = scenario.streams[0];
      await page.goto(`/#/organizations/${scenario.id}?coordSignal=outcome`);
      const source = page.url();
      const card = page.getByRole("article", {
        name: stream.name,
        exact: true,
      });
      await card.locator("summary").click();
      await card
        .getByRole("button", { name: /Inspect outcome requirement/ })
        .first()
        .click();
      await expect(page).toHaveURL(new RegExp(`/outcomes/${stream.id}`));
      await expect(
        page.getByRole("heading", {
          name: `Outcome · ${stream.name}`,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Not verified", exact: true }),
      ).toBeVisible();
      const requirements = page.getByRole("region", {
        name: "Outcome evidence requirements",
        exact: true,
      });
      await expect(requirements).toContainText("Available context");
      await expect(requirements).toContainText(
        "No linked evidence records represented.",
      );
      await expect(
        page.getByRole("region", { name: "Outcome scope and responsibility" }),
      ).toContainText(scenario.outcomes[0].boundary);
      await expect(
        page.getByText("Outcome reviewer: not assigned", { exact: false }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Inspect supporting context/ }),
      ).toHaveCount(0);
      const outcomeUrl = page.url();
      await page
        .getByRole("button", { name: /Inspect assignment/ })
        .first()
        .click();
      await page.reload();
      await page
        .getByRole("button", { name: "Back to scenario context", exact: true })
        .click();
      await expect(page).toHaveURL(outcomeUrl);
      await page.reload();
      await page
        .getByRole("button", { name: "Back to scenario context", exact: true })
        .click();
      await expect(page).toHaveURL(source);
      await page.goto(`/#/organizations/${scenario.id}/outcomes/${stream.id}`);
      await page
        .getByRole("button", { name: "Back to scenario context", exact: true })
        .click();
      await expect(page).toHaveURL(new RegExp(`/workstreams/${stream.id}`));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  }
  test(`main outcome coordination source return ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organization?coordQ=payment&coordSignal=outcome");
    const source = page.url();
    await page
      .getByRole("article", {
        name: "Payment webhook reliability",
        exact: true,
      })
      .locator("summary")
      .click();
    await page
      .getByRole("button", {
        name: "Inspect outcome requirement · recovery",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/outcomes\/WS-01/);
    await page
      .getByRole("button", { name: /Inspect supporting context · AR-775/ })
      .click();
    await expect(page.getByRole("dialog")).toContainText("Historical");
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Back to Organization", exact: true })
      .click();
    await expect(page).toHaveURL(source);
  });
}

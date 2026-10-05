import { test, expect } from "@playwright/test";
import {
  authoredExchangeEvents,
  exchangeActivity,
  type ExchangeEvent,
} from "../src/data/exchangeActivity";
import { knowledgeOrganization as scenario } from "../src/data/knowledgeOrganization";
import {
  mainOrganization,
  largeOrganization,
} from "../src/data/organizationScenario";
import { validScenarioPath } from "../src/ScenarioWorkspace";
test("exchange records are independent, scoped and version/recipient bound", () => {
  expect(exchangeActivity(scenario)).toHaveLength(5);
  expect(exchangeActivity(mainOrganization)).toEqual([]);
  expect(exchangeActivity(largeOrganization)).toEqual([]);
  expect(
    exchangeActivity(
      scenario,
      authoredExchangeEvents.filter((e) => e.kind === "response"),
    ).map((e) => e.kind),
  ).toEqual(["response"]);
  const noDelivery = authoredExchangeEvents.filter(
    (e) => e.kind !== "delivery",
  );
  expect(
    exchangeActivity(scenario, noDelivery).some(
      (e) => e.kind === "acknowledgment",
    ),
  ).toBe(false);
  const changed = authoredExchangeEvents.map((e) =>
    e.kind === "acknowledgment" ? { ...e, version: "different-version" } : e,
  );
  expect(
    exchangeActivity(scenario, changed).some(
      (e) => e.kind === "acknowledgment",
    ),
  ).toBe(false);
  const wrongRecipient = authoredExchangeEvents.map((e) =>
    e.kind === "delivery" ? { ...e, recipientId: "leo" } : e,
  );
  expect(
    exchangeActivity(scenario, wrongRecipient).some(
      (e) => e.kind === "delivery" || e.kind === "acknowledgment",
    ),
  ).toBe(false);
  expect(
    exchangeActivity(
      scenario,
      authoredExchangeEvents.filter((e) => e.kind !== "assessment"),
    ).some((e) => e.kind === "revision-request"),
  ).toBe(false);
  expect(
    exchangeActivity(scenario, [...authoredExchangeEvents].reverse()).map(
      (e) => e.id,
    ),
  ).toEqual(authoredExchangeEvents.map((e) => e.id));
  expect(scenario.dependencies[0].availability).toBe("missing");
  expect(scenario.dependencies[0].receipt).toBe("unconfirmed");
  expect(scenario.evidence).toEqual([]);
  expect(
    validScenarioPath(
      "/organizations/knowledge/activity?actKind=acknowledgment&event=brief-receipt-v0",
    ),
  ).toBe(true);
  for (const path of [
    "/organizations/large/activity?event=brief-receipt-v0",
    "/organizations/knowledge/activity?actKind=completed",
    "/organizations/knowledge/work?actKind=response",
  ])
    expect(validScenarioPath(path)).toBe(false);
});
for (const width of [390, 1440]) {
  test(`exchange activity sources filters and history boundary ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge?persona=leo");
    await page
      .getByRole("button", { name: "View organization activity", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Coordination activity", exact: true }),
    ).toBeFocused();
    const rows = page
      .getByRole("region", { name: "Coordination exchange records" })
      .getByRole("listitem");
    await expect(rows).toHaveCount(5);
    await page
      .getByRole("combobox", { name: "Exchange record type", exact: true })
      .selectOption("acknowledgment");
    await expect(rows).toHaveCount(1);
    await rows.locator("summary").click();
    await rows
      .getByRole("button", {
        name: "Inspect originating delivery · brief-delivery-v0",
        exact: true,
      })
      .click();
    await expect(page.locator("#exchange-brief-delivery-v0")).toBeFocused();
    await expect(
      page.locator("#exchange-brief-delivery-v0 details"),
    ).toHaveAttribute("open", "");
    await page.reload();
    await expect(
      page.locator("#exchange-brief-delivery-v0 details"),
    ).toHaveAttribute("open", "");
    const source = page.url();
    await page
      .locator("#exchange-brief-delivery-v0")
      .getByRole("button", {
        name: "Inspect event assignment · K-02-C",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(source);
    await page
      .getByRole("combobox", { name: "Exchange record type", exact: true })
      .selectOption("revision-request");
    await rows.locator("summary").click();
    await rows
      .getByRole("button", {
        name: "Inspect originating assessment · brief-assessment-v0",
        exact: true,
      })
      .click();
    await expect(page.locator("#exchange-brief-assessment-v0")).toBeFocused();
    await page
      .getByRole("combobox", { name: "Activity workstream", exact: true })
      .selectOption("K-01");
    await expect(rows).toHaveCount(0);
    await page
      .getByRole("button", { name: "Clear exchange filters", exact: true })
      .click();
    await expect(rows).toHaveCount(5);
    await page
      .getByRole("combobox", { name: "Exchange record type", exact: true })
      .selectOption("decision");
    await expect(rows).toHaveCount(0);
    await page.goto("/#/organizations/knowledge/workflows/K-02?persona=leo");
    await expect(
      page.getByRole("region", { name: "Coordination inputs", exact: true }),
    ).toContainText("Delivery / receipt: Unconfirmed");
    await page.goto("/#/organizations/large/activity?persona=sam");
    await expect(
      page.getByRole("heading", {
        name: "No exchange records in this view",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("workflow activity entry returns to the same scoped map", async ({
  page,
}) => {
  await page.goto("/#/organizations/knowledge/workflows/K-02?persona=leo");
  const source = page.url();
  await page
    .getByRole("button", { name: "Inspect coordination activity", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Activity workstream", exact: true }),
  ).toHaveValue("K-02");
  await page.reload();
  await page
    .getByRole("button", { name: "Back to scenario context", exact: true })
    .click();
  await expect(page).toHaveURL(source);
});

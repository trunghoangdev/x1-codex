import { test, expect } from "@playwright/test";
import {
  walkthroughRecords as records,
  walkthroughSubject as subject,
} from "../src/data/collaborationWalkthrough";
import { knowledgeOrganization as scenario } from "../src/data/knowledgeOrganization";
import { validScenarioPath } from "../src/ScenarioWorkspace";

test("cycle sources preserve receipt versions and explicit revision lineage", () => {
  expect(new Set(records.map((r) => r.id)).size).toBe(records.length);
  for (const record of records) {
    expect(scenario.workers.some((w) => w.id === record.actorId)).toBe(true);
    for (const id of record.refs) {
      const source = records.find((r) => r.id === id)!;
      expect(source).toBeDefined();
      expect(Date.parse(source.at)).toBeLessThan(Date.parse(record.at));
      if (record.kind === "receipt") {
        expect(source.kind).toBe("delivery");
        expect(source.version).toBe(record.version);
      }
    }
  }
  expect(records.find((r) => r.id === "cycle-revision-02")?.refs).toContain(
    "cycle-assessment-01",
  );
  expect(records.at(-1)?.refs).toEqual(["cycle-observation-02"]);
  expect(subject.id).not.toBe("cohort-guide-example");
  expect(scenario.evidence).toEqual([]);
  expect(
    validScenarioPath(
      "/organizations/knowledge/walkthroughs/guide-cycle?cycleRecord=cycle-receipt-02&persona=leo",
    ),
  ).toBe(true);
  for (const path of [
    "/organizations/large/walkthroughs/guide-cycle",
    "/organizations/knowledge/walkthroughs/guide-cycle?cycleRecord=brief-receipt-v0",
    "/organizations/knowledge/work?cycleRecord=cycle-brief",
  ])
    expect(validScenarioPath(path)).toBe(false);
});
for (const width of [390, 1440])
  test(`cycle navigation, lineage and refreshed source return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge?persona=leo&coordSignal=input");
    const origin = page.url();
    await page
      .getByRole("button", {
        name: "Explore a complete collaboration example",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "From brief to outcome review",
        exact: true,
      }),
    ).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Previous record", exact: true }),
    ).toBeDisabled();
    const record = page.getByRole("region", { name: "Selected cycle record" });
    for (let index = 1; index < records.length; index++) {
      await page
        .getByRole("button", { name: "Next record", exact: true })
        .click();
      await expect(record).toContainText(records[index].id);
      await expect(page.locator("#cycle-record-heading")).toBeFocused();
    }
    await expect(
      page.getByRole("button", { name: "Next record", exact: true }),
    ).toBeDisabled();
    await expect(record).toContainText("insufficient evidence");
    await expect(record).toContainText("draft-02");
    const final = page.url();
    await page
      .getByRole("button", {
        name: "Inspect proposed cycle scope · brief-v1",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(final);
    await page
      .getByRole("combobox", { name: "Cycle record", exact: true })
      .selectOption("cycle-revision-02");
    await page
      .getByRole("button", {
        name: "Inspect cycle source · cycle-assessment-01",
        exact: true,
      })
      .click();
    await expect(record).toContainText("guide-cycle-example / draft-01");
    await page
      .getByRole("combobox", { name: "Cycle record", exact: true })
      .selectOption("cycle-receipt-02");
    await expect(record).toContainText("Receipt for draft-02");
    await page.reload();
    await expect(
      page.getByRole("combobox", { name: "Cycle record", exact: true }),
    ).toHaveValue("cycle-receipt-02");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(origin);
  });

import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import {
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
} from "../src/data/contributionCheckpoint";
import { contributionView } from "../src/data/contributionView";
const at = "2026-10-07T12:00:00Z";
function fixture() {
  const initial = emptyContribution();
  initial.contributions[0] = {
    ...initial.contributions[0],
    body: "Original",
    note: "scope",
    citesInput: true,
  };
  const assessed = assessContribution(
    receiveContribution(
      submitContributionCommand(initial, "projected", at),
      at,
    ),
    at,
  );
  const revision = reviseContribution(assessed);
  revision.contributions[1] = {
    ...revision.contributions[1],
    body: "Revised",
    note: "responded",
    citesInput: true,
  };
  return receiveContribution(
    submitContributionCommand(revision, "projected", at),
    at,
  );
}
test("reassessment binds exact revised records, remains immutable and validates v1/v2 recovery", () => {
  const state = fixture();
  expect(
    parseContributionCheckpoint(encodeContributionCheckpoint(state)).format,
  ).toBe("forge.knowledge-contribution.v1");
  expect(
    reassessContribution(
      emptyContribution(),
      "Suitable for stated scope",
      "reason",
      at,
    ).contributions[0].reassessment,
  ).toBeUndefined();
  expect(
    reassessContribution(state, "Suitable for stated scope", " ", at),
  ).toBe(state);
  for (const conclusion of [
    "Suitable for stated scope",
    "Further revision needed",
  ] as const) {
    const next = reassessContribution(
      state,
      conclusion,
      "Reviewed exact revised guide",
      at,
    );
    expect(next.contributions[0]).toEqual(state.contributions[0]);
    expect(next.contributions[1].reassessment).toMatchObject({
      receiptId: "human-receipt-v2",
      deliveryId: "human-delivery-v2",
      assessor: "Maya",
      conclusion,
    });
    expect(reassessContribution(next, conclusion, "overwrite", at)).toBe(next);
    const raw = encodeContributionCheckpoint(next);
    expect(parseContributionCheckpoint(raw).state).toEqual(next);
    expect(contributionView(next).attention).toBe(
      conclusion === "Further revision needed" ? "revision" : undefined,
    );
    for (const patch of [
      { receiptId: "human-receipt-v1" },
      { deliveryId: "human-delivery-v1" },
      { assessor: "Leo" },
      { rationale: "" },
    ]) {
      const broken = JSON.parse(raw);
      Object.assign(broken.state.contributions[1].reassessment, patch);
      expect(() =>
        parseContributionCheckpoint(JSON.stringify(broken)),
      ).toThrow();
    }
    expect(() =>
      parseContributionCheckpoint(
        raw.replace(
          "forge.knowledge-contribution.v2",
          "forge.knowledge-contribution.v1",
        ),
      ),
    ).toThrow();
  }
});
for (const width of [320, 1440])
  for (const conclusion of [
    "Suitable for stated scope",
    "Further revision needed",
  ] as const)
    test(`${conclusion} projects and restores exact reassessment ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/#/organizations/knowledge/work?persona=maya");
      await page
        .getByText("Save or restore Knowledge contribution", { exact: true })
        .click();
      await page
        .getByText("Move contribution between machines", { exact: true })
        .click();
      await page.getByLabel("Import contribution file").setInputFiles({
        name: "received.json",
        mimeType: "application/json",
        buffer: Buffer.from(encodeContributionCheckpoint(fixture())),
      });
      await page
        .getByRole("button", { name: "Confirm import contribution" })
        .click();
      const submit = page.getByRole("button", {
        name: "Record sample reassessment · draft-02",
      });
      await expect(submit).toBeDisabled();
      await page.getByLabel("Reassessment conclusion").selectOption(conclusion);
      await page
        .getByLabel("Reassessment rationale")
        .fill("Examined the contact and required context.");
      await submit.focus();
      await page.keyboard.press("Enter");
      const result = page.getByRole("region", {
        name: "Receiver action result",
      });
      await expect(result.getByRole("heading")).toBeFocused();
      await expect(result).toContainText(conclusion);
      await expect(result).toContainText(
        "human-reassessment-v2 → human-receipt-v2 → human-delivery-v2",
      );
      await expect(submit).toHaveCount(0);
      await page
        .getByRole("button", {
          name: "Save contribution checkpoint",
          exact: true,
        })
        .click();
      await page
        .getByRole("button", { name: "Confirm save checkpoint" })
        .click();
      await page.goto("/#/organizations/knowledge/work?persona=leo");
      await expect(
        page.getByRole("article", { name: "K-01-H", exact: true }),
      ).toContainText(conclusion);
      await page.goto(
        "/#/organizations/knowledge/workstreams/K-01?persona=leo",
      );
      await expect(
        page.getByRole("region", { name: "Local contribution progress" }),
      ).toContainText(conclusion);
      await page.goto("/#/organizations/knowledge/attention?persona=leo");
      if (conclusion === "Further revision needed")
        await expect(
          page.getByText("draft-03 is not supported", { exact: false }),
        ).toBeVisible();
      else
        await expect(
          page.getByText("Access-guide contribution · K-01-H", { exact: true }),
        ).toHaveCount(0);
      await page.reload();
      await page
        .getByText("Save or restore Knowledge contribution", { exact: true })
        .click();
      await page
        .getByRole("button", { name: "Review saved contribution" })
        .click();
      await page
        .getByRole("button", { name: "Confirm restore contribution" })
        .click();
      await page.goto("/#/organizations/knowledge/work?persona=maya");
      await expect(result).toContainText(conclusion);
      await expect(result).toContainText(
        "No publication or outcome decision was created",
      );
      await page
        .getByText("Compare draft-01 and draft-02", { exact: true })
        .click();
      const comparison = page.getByRole("region", {
        name: "Contribution version comparison",
      });
      await expect(comparison).toContainText(conclusion);
      await expect(comparison).not.toContainText(
        "Reassessment remains pending",
      );
      await expect(comparison).toContainText(
        "The original assessment does not assess draft-02",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });

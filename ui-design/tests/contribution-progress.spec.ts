import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import { encodeContributionCheckpoint } from "../src/data/contributionCheckpoint";

for (const width of [320, 1440])
  test(`local lane follows restored lifecycle without advancing authored flow ${width}`, async ({
    page,
  }) => {
    const at = "2026-10-07T12:00:00Z";
    const ready = emptyContribution();
    ready.contributions[0] = {
      ...ready.contributions[0],
      body: "guide",
      note: "scope",
      citesInput: true,
    };
    const unknown = submitContributionCommand(ready, "unknown", at);
    const delivered = submitContributionCommand(ready, "projected", at);
    const assessed = assessContribution(receiveContribution(delivered, at), at);
    const revision = reviseContribution(assessed);
    revision.contributions[1] = {
      ...revision.contributions[1],
      body: "revised guide",
      note: "response",
      citesInput: true,
    };
    const second = submitContributionCommand(revision, "projected", at);
    const received = receiveContribution(second, at);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/organizations/knowledge/workstreams/K-01?persona=leo");
    const lane = page.getByRole("region", {
      name: "Local contribution progress",
    });
    await expect(lane).toContainText("Preparation not yet recorded");
    const authored = page
      .getByRole("heading", { name: "Coordination & assignments", exact: true })
      .locator("..")
      .locator(":scope > ol");
    const original = await authored.innerText();
    for (const [state, stage, owner] of [
      [unknown, "Acknowledgement unknown", "Leo"],
      [delivered, "Awaiting receiver receipt", "Maya"],
      [assessed, "Revision requested", "Leo"],
      [revision, "Preparing revision", "Leo"],
      [second, "Awaiting receiver receipt", "Maya"],
      [
        received,
        "Receipt recorded · assessment pending",
        "No further action owner",
      ],
    ] as const) {
      for (const label of [
        "Save or restore Knowledge contribution",
        "Move contribution between machines",
      ]) {
        const disclosure = page.getByText(label, { exact: true });
        if (
          !(await disclosure.evaluate((el) =>
            el.parentElement!.hasAttribute("open"),
          ))
        )
          await disclosure.click();
      }
      await page.getByLabel("Import contribution file").setInputFiles({
        name: "stage.json",
        mimeType: "application/json",
        buffer: Buffer.from(encodeContributionCheckpoint(state)),
      });
      await page
        .getByRole("button", { name: "Confirm import contribution" })
        .click();
      await expect(lane.getByRole("status")).toContainText(stage);
      await expect(
        lane.getByText("Next responsibility:", { exact: false }).locator(".."),
      ).toContainText(owner);
      expect(await authored.innerText()).toBe(original);
      await page
        .getByRole("button", { name: "Explore workflow & exchanges" })
        .click();
      await expect(lane.getByRole("status")).toContainText(stage);
      await expect(lane).toContainText(
        "does not advance the authored workflow",
      );
      await page.goto(
        "/#/organizations/knowledge/workstreams/K-01?persona=leo",
      );
    }
    await expect(lane).toContainText(
      "human-delivery-v2 · responds to human-assessment-v1",
    );
    await expect(lane).toContainText("human-receipt-v2 → human-delivery-v2");
    await expect(lane).toContainText("Reassessment pending");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await lane
      .getByRole("button", { name: "Inspect receiver inbox · Maya" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "My Work · Maya Patel", exact: true }),
    ).toBeFocused();
    await page.goto("/#/organizations/knowledge/workstreams/K-01?persona=maya");
    await lane
      .getByRole("button", { name: "Inspect contribution · Leo" })
      .click();
    await expect(page.getByLabel("Contribution text")).toHaveCount(0);
    await expect(page).toHaveURL(/contributions\/K-01-H\?persona=leo/);
    await page.goto("/#/organizations/knowledge/workstreams/K-02?persona=leo");
    await expect(lane).toHaveCount(0);
  });

import { test, expect } from "@playwright/test";
import { workerCapabilityProfile } from "../src/data/workerCapabilities";

test("profiles distinguish human availability from historical AI scheduling and isolate scenarios", () => {
  expect(workerCapabilityProfile("main", "jamie")?.availability.state).toBe(
    "unknown",
  );
  const ai = workerCapabilityProfile("main", "codex")!;
  expect(ai.category).toBe("ai");
  expect(ai.availability.state).toBe("stale");
  if (ai.availability.state === "stale")
    expect(Date.parse(ai.availability.validUntil)).toBeLessThan(
      Date.parse("2026-10-05T00:00:00Z"),
    );
  expect(workerCapabilityProfile("knowledge", "codex")).toBeUndefined();
  expect(workerCapabilityProfile("main", "alex")).toBeUndefined();
});
for (const width of [390, 1440])
  test(`candidate profile preserves proposal draft and worker context ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organization/attention/responsibility");
    await page
      .getByRole("button", {
        name: "Propose responsibility · Invitation implementation",
        exact: true,
      })
      .click();
    await page.getByLabel("Proposed worker").selectOption("codex");
    await page
      .getByLabel("Reason for proposal")
      .fill("Keep this proposal reason while checking availability.");
    const summary = page
      .locator("summary")
      .filter({ hasText: "Inspect candidate capability and availability" });
    await summary.focus();
    await page.keyboard.press("Enter");
    const profile = page.getByRole("region", {
      name: "Worker capability and availability",
    });
    await expect(profile).toContainText("Stale declaration");
    await expect(profile).toContainText("Current availability is unknown");
    await page.getByLabel("Proposed worker").selectOption("jamie");
    await expect(profile).toContainText("Availability · Unknown");
    await expect(profile).not.toContainText("Stale declaration");
    await expect(page.getByLabel("Reason for proposal")).toHaveValue(
      "Keep this proposal reason while checking availability.",
    );
    await page
      .getByRole("button", { name: "Record local proposal", exact: true })
      .click();
    await expect(profile).toContainText("human-profile-jamie-01");
    await page.keyboard.press("Escape");
    await page.goto("/#/workers/codex");
    await expect(
      page.getByRole("region", { name: "Worker capability and availability" }),
    ).toContainText("expired authored reporting window");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/#/workers/alex");
    await expect(
      page.getByRole("region", { name: "Worker capability and availability" }),
    ).toContainText("No capability profile");
  });

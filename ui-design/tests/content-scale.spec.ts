import { test, expect } from "@playwright/test";

// Intercept only the local Vite fixture modules. The shipped demo is unchanged.
for (const width of [390, 1440]) {
  test(`long content and larger fixture lists fit at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const token = "LongUnbrokenReference".repeat(12);
    await page.route("**/src/data/assignments.ts", async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body:
          (await response.text()) +
          `\nassignments[0].title = ${JSON.stringify(token)}; assignments[0].project = ${JSON.stringify(token)};
        assignments.push(...Array.from({length: 45}, (_, i) => ({...assignments[0], id: 'SCALE-' + i})));`,
      });
    });
    await page.route("**/src/data/evidence.ts", async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body:
          (await response.text()) +
          `\nevidenceArtifacts[0].title = ${JSON.stringify(token)}; evidenceArtifacts[0].producer = ${JSON.stringify(token)};
        evidenceArtifacts.push(...Array.from({length: 60}, (_, i) => ({...evidenceArtifacts[0], id: 'SCALE-AR-' + i})));`,
      });
    });
    const fits = async () =>
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    await page.goto("/");
    await expect(page.locator(".assignment-row")).toHaveCount(50);
    await fits();
    await page.getByLabel("Search assignments").fill("SCALE-44");
    await expect(page.locator(".assignment-row")).toHaveCount(1);
    await page.getByLabel("Search assignments").fill("A-1042");
    await page.locator("#work-row-A-1042").click();
    await fits();
    await page.getByRole("tab", { name: /^Evidence/ }).click();
    await expect(
      page.getByRole("tabpanel").locator(".evidence-row"),
    ).toHaveCount(63);
    await fits();
    await page.getByLabel("Find evidence for A-1042").fill("SCALE-AR-59");
    await page.getByRole("tabpanel").locator(".evidence-row").click();
    await expect(page.getByRole("dialog")).toContainText(token);
    await fits();
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Submit assessment", exact: true })
      .click();
    const rationale = ("Sample reasoning. " + token + "\n").repeat(15);
    await page.getByLabel("Decision rationale").fill(rationale);
    await fits();
    await page.getByRole("button", { name: "Record assessment" }).click();
    await page.getByRole("tab", { name: "Activity", exact: true }).click();
    await expect(page.locator(".receipt-rationale")).toHaveText(
      rationale.trim(),
    );
    await fits();
    await page.goto("/#/organization");
    await expect(page.locator(".org-work-item")).toHaveCount(50);
    await fits();
  });
}

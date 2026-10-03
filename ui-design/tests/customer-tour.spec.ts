import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`customer walkthrough navigation and sample boundaries at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/#/demos");
    await page
      .getByRole("button", { name: "Start customer walkthrough" })
      .click();
    const tour = page.getByRole("region", { name: "Customer walkthrough" });
    await expect(tour).toContainText("STEP 1 OF 8");
    await expect(
      tour.getByRole("button", { name: "Previous step" }),
    ).toBeDisabled();
    const hashes = [
      "#/organization",
      "#/workstreams/WS-02",
      "#/workers/alex",
      "#/organization/attention/responsibility",
      "#/organization/attention/responsibility",
      "#/work",
      "#/assignments/A-1042/evidence",
      "#/outcomes/WS-01",
    ];
    for (let index = 0; index < hashes.length; index++) {
      await expect(page).toHaveURL(new RegExp(hashes[index] + "$"));
      await expect(tour).toContainText(`STEP ${index + 1} OF 8`);
      await expect(tour.getByRole("heading", { level: 2 })).toBeFocused();
      await expect(tour).toContainText("no SF request is sent");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (index === 4) {
        await page
          .getByRole("button", {
            name: "Propose responsibility · Invitation implementation",
            exact: true,
          })
          .click();
        await page.getByLabel("Proposed worker").selectOption("codex");
        await page
          .getByLabel("Reason for proposal")
          .fill("Scoped implementation proposal for customer demonstration.");
        await page
          .getByRole("button", { name: "Record local proposal" })
          .click();
        await page.keyboard.press("Escape");
        await expect(
          page.getByRole("button", {
            name: "View proposal · Invitation implementation",
            exact: true,
          }),
        ).toBeVisible();
      }
      if (index === 5)
        await expect(tour).toContainText("separate payment review example");
      if (index < hashes.length - 1)
        await tour.getByRole("button", { name: "Next step" }).click();
    }
    await expect(tour).toContainText("not proof of business success");
    await tour.getByRole("button", { name: "Previous step" }).click();
    await expect(page).toHaveURL(/#\/assignments\/A-1042\/evidence$/);
    await page.goBack();
    await expect(page).toHaveURL(/#\/outcomes\/WS-01$/);
    await expect(tour).toContainText("STEP 7 OF 8");
    await tour.getByRole("button", { name: "Open this step" }).click();
    await expect(page).toHaveURL(/#\/assignments\/A-1042\/evidence$/);
    await tour.getByRole("button", { name: "Next step" }).click();
    await tour.getByRole("button", { name: "Finish walkthrough" }).click();
    await expect(tour).toHaveCount(0);
    await expect(page).toHaveURL(/#\/demos$/);
    await page
      .getByRole("button", { name: "Start customer walkthrough" })
      .click();
    await expect(tour).toContainText("STEP 1 OF 8");
    await tour.getByRole("button", { name: "Exit walkthrough" }).click();
    await expect(tour).toHaveCount(0);
    await page
      .getByRole("button", { name: "Start customer walkthrough" })
      .click();
    await page.reload();
    await expect(tour).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

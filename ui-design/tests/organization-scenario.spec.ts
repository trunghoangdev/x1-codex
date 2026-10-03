import { test, expect } from "@playwright/test";
for (const width of [390, 1440]) {
  test(`larger organization supports multiple assignees and parallel streams at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/demos/organization");
    const fits = async () =>
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    await expect(
      page.getByRole("heading", {
        name: "A larger collaborating organization",
      }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Scenario workstreams" })
        .getByRole("button"),
    ).toHaveCount(6);
    const directory = page.getByRole("region", {
      name: "Scenario assignment directory",
    });
    await expect(directory.getByRole("article")).toHaveCount(18);
    await page
      .getByLabel("Scenario worker", { exact: true })
      .selectOption("codex");
    await expect(directory.getByRole("article")).toHaveCount(3);
    await page
      .getByLabel("Scenario assignment state")
      .selectOption("Revision requested");
    await expect(directory.getByRole("article")).toHaveCount(1);
    await directory
      .getByRole("button", { name: "Inspect scenario stream · L-03-W" })
      .click();
    const selected = page.getByRole("region", {
      name: "Selected scenario workstream",
    });
    await expect(selected).toBeFocused();
    await expect(selected).toContainText("Revision loop");
    await fits();
    await page.getByRole("button", { name: "Reset scenario filters" }).click();
    await page
      .getByLabel("Scenario worker", { exact: true })
      .selectOption("unassigned");
    await expect(directory.getByRole("article")).toHaveCount(1);
    await directory
      .getByRole("button", {
        name: "Inspect scenario stream · L-02-R",
        exact: true,
      })
      .click();
    await expect(selected).toContainText("Coordination gap");
    await page.getByLabel("Search scenario assignments").fill("no match");
    await expect(directory).toContainText("No assignments match these filters");
    await page.getByRole("button", { name: "Reset scenario filters" }).click();
    await expect(directory.getByRole("article")).toHaveCount(18);
    await expect(
      page
        .getByRole("region", { name: "Scenario workers and bindings" })
        .getByRole("article"),
    ).toHaveCount(9);
    await fits();
    await page.getByRole("button", { name: "Back to Demos" }).click();
    await page
      .getByRole("button", { name: "Explore larger organization" })
      .click();
    await expect(directory.getByRole("article")).toHaveCount(18);
    await page.goto("/#/work");
    await expect(page.locator(".assignment-row")).toHaveCount(5);
  });
}

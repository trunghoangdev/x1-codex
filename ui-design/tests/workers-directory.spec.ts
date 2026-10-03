import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`workers directory preserves scoped links and filters at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/#/organization");
    await page.getByRole("button", { name: "Browse workers" }).click();
    await expect(page).toHaveURL(/#\/organization\/workers$/);
    await expect(
      page.getByRole("heading", { name: "Workers", exact: true }),
    ).toBeFocused();
    await expect(page.getByRole("status")).toContainText("4 of 4 workers");
    const alex = page.getByRole("article", {
      name: "Alex Morgan",
      exact: true,
    });
    await expect(alex).toContainText("4 scoped role bindings");
    await expect(alex).toContainText("Explicit assignment links: 5");
    const codex = page.getByRole("article", {
      name: "Codex worker",
      exact: true,
    });
    await expect(codex).toContainText(
      "Developer · Payment webhook reliability",
    );
    await expect(codex).toContainText("No linked assignments in this sample");
    await page
      .getByRole("combobox", { name: "Assignment links", exact: true })
      .selectOption("none");
    await expect(page.getByRole("status")).toContainText("3 of 4 workers");
    await page
      .getByRole("combobox", { name: "Worker type", exact: true })
      .selectOption("ai");
    await expect(page.getByRole("status")).toContainText("1 of 4 workers");
    await page
      .getByRole("combobox", { name: "Role", exact: true })
      .selectOption("Reviewer");
    await expect(
      page.getByText("No matching workers.", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Organization responsibility gaps" }),
    ).toContainText("2 explicit gaps");
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page
      .getByRole("combobox", { name: "Worker type", exact: true })
      .selectOption("human");
    await expect(page.getByRole("status")).toContainText("2 of 4 workers");
    await page
      .getByRole("combobox", { name: "Role", exact: true })
      .selectOption("Reviewer");
    await page
      .getByRole("combobox", { name: "Assignment links", exact: true })
      .selectOption("linked");
    await page
      .getByRole("searchbox", { name: "Search workers", exact: true })
      .fill("A-1042");
    const filteredUrl = page.url();
    await page.reload();
    await expect(page.getByRole("status")).toContainText("1 of 4 workers");
    await expect(
      page.getByRole("searchbox", { name: "Search workers", exact: true }),
    ).toHaveValue("A-1042");
    await expect(
      page.getByRole("combobox", { name: "Role", exact: true }),
    ).toHaveValue("Reviewer");
    await expect(
      page.getByRole("combobox", { name: "Worker type", exact: true }),
    ).toHaveValue("human");
    await expect(
      page.getByRole("combobox", { name: "Assignment links", exact: true }),
    ).toHaveValue("linked");
    await page
      .getByRole("button", { name: "Open worker · Alex Morgan", exact: true })
      .click();
    await expect(page).toHaveURL(/#\/workers\/alex$/);
    await page
      .getByRole("button", { name: "Back to Workers", exact: true })
      .click();
    await expect(page).toHaveURL(filteredUrl);
    await page.goBack();
    await expect(page).toHaveURL(/#\/workers\/alex$/);
    await page.goBack();
    await expect(page).toHaveURL(filteredUrl);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page
      .getByRole("searchbox", { name: "Search workers", exact: true })
      .fill("authorized releases");
    await expect(page.getByRole("status")).toContainText("1 of 4 workers");
    await expect(
      page.getByRole("article", { name: "Release runner", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Review responsibility gaps", exact: true })
      .click();
    await expect(page).toHaveURL(/#\/organization\/attention\/responsibility$/);
    await page.goBack();
    await expect(
      page.getByRole("searchbox", { name: "Search workers", exact: true }),
    ).toHaveValue("authorized releases");
    await page
      .getByRole("button", {
        name: "Open worker · Release runner",
        exact: true,
      })
      .click();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Back to Organization", exact: true }),
    ).toBeVisible();
    await page.goto("/#/organization/workers?type=available");
    await expect(page.getByRole("alert")).toContainText(
      "This link does not match",
    );
    expect(errors).toEqual([]);
  });
}

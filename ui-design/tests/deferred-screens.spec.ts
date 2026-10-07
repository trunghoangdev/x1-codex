import { test, expect } from "@playwright/test";
test("scenario view loads on demand and focuses the loaded heading", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/#/organization");
  await expect(
    page.getByRole("heading", {
      name: "One team. Clear responsibility.",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    requests.some((url) => url.includes("/src/ScenarioWorkspace.tsx")),
  ).toBe(false);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/src/ScenarioWorkspace.tsx*", async (route) => {
    await gate;
    await route.continue();
  });
  await page
    .getByRole("combobox", { name: "Sample organization", exact: true })
    .selectOption("knowledge");
  await expect(
    page.getByRole("status").filter({ hasText: "Loading workspace view" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Organization", exact: true }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("heading", {
      name: "One team. Clear responsibility.",
      exact: true,
    }),
  ).toBeFocused();
  await page.getByRole("button", {name: "Agreements, reviews & policy", exact:true}).click();
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
});
test("failed deferred view shows recovery and permits navigation to another screen", async ({
  page,
}) => {
  await page.goto("/#/organization");
  await page.route("**/src/ScenarioWorkspace.tsx*", (route) => route.abort());
  await page
    .getByRole("combobox", { name: "Sample organization", exact: true })
    .selectOption("knowledge");
  await expect(page.getByRole("alert")).toContainText(
    "Workspace view unavailable",
  );
  await expect(page.getByRole("alert")).toContainText(
    "Reload restores only your saved demo snapshot",
  );
  await page.getByRole("button", { name: "Demos", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Collaboration demos", exact: true }),
  ).toBeFocused();
});

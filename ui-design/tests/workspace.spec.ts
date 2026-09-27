import { test, expect } from "@playwright/test";

test("reviewer assesses evidence, records rationale and completes the assignment", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Search assignments" })
    .fill("A-1042");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await expect(
    page.getByRole("button", { name: "Approve release", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("tab", { name: "Evidence" }).click();
  await page.getByRole("button", { name: /Test results AR-775/ }).click();
  await expect(page.getByRole("dialog")).toContainText("42 passed");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Test results AR-775/ }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await expect(
    page.getByRole("button", { name: "Record assessment" }),
  ).toBeDisabled();
  await page
    .getByLabel("Decision rationale")
    .fill(
      "Duplicate delivery is covered by AR-775; the contribution meets the acceptance criteria.",
    );
  await page.getByRole("button", { name: "Record assessment" }).click();
  await expect(page.getByRole("status")).toContainText("Assessment recorded");
  await page.getByRole("tab", { name: "Activity" }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Duplicate delivery is covered",
  );
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await expect(
    page.getByRole("button", { name: /A-1042.*Review retry/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /A-1042.*Review retry/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

for (const response of ["Approval", "Refusal"]) {
  test(`${response} requires rationale and does not establish a deployment effect`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "View release assignment" }).click();
    await page
      .getByRole("button", {
        name: response === "Approval" ? "Approve release" : "Refuse release",
        exact: true,
      })
      .click();
    await page
      .getByLabel("Decision rationale")
      .fill(
        response === "Approval"
          ? "Reviewed exact candidate and attached evidence."
          : "Additional regression evidence is required.",
      );
    await page
      .getByRole("button", { name: `Record ${response.toLowerCase()}` })
      .click();
    await expect(page.getByRole("status")).toContainText(
      `${response} recorded`,
    );
    await page
      .getByRole("navigation")
      .getByRole("button", { name: "Evidence", exact: true })
      .click();
    await expect(
      page.locator(".chain-node").filter({ hasText: "Authority" }),
    ).toContainText(response);
    await expect(
      page.locator(".chain-node").filter({ hasText: "Effect" }),
    ).toContainText("Not established");
    await page.reload();
    await expect(
      page.getByRole("button", { name: /A-1041.*Authorize Payments/ }),
    ).toBeVisible();
  });
}

test("filters, responsive navigation and modal fit a phone screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Needs my authority/ }).click();
  await expect(page.locator(".assignment-row")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear filter" }).click();
  await expect(page.locator(".assignment-row")).toHaveCount(5);
  for (const view of ["Organization", "Evidence", "My Work"]) {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page
      .getByRole("navigation")
      .getByRole("button", { name: view, exact: view !== "My Work" })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("attempts preserve unknown outcomes and keyboard navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Attempts", exact: true }),
  ).toBeFocused();
  const produced = page.getByRole("article", { name: "demo-attempt-03" });
  await expect(produced).toContainText("Produced");
  const failed = page.getByRole("article", { name: "demo-attempt-02" });
  await expect(failed).toContainText("Not observed");
  const open = page.getByRole("article", { name: "demo-attempt-01" });
  await expect(open).toContainText("Open — completion not recorded");
  await expect(open).toContainText("live execution is not established");
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Activity", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Overview", exact: true }),
  ).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("tab", { name: "Attempts", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page
    .getByRole("button", { name: /A-1041.*Authorize Payments/ })
    .click();
  await page.getByRole("tab", { name: "Attempts", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("No sample attempts");
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("candidate shows a scoped diff, file changes and unverified identities", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("tab", { name: "Candidate", exact: true }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("demo-attempt-03");
  await expect(panel).toContainText("synthetic, not verified");
  await expect(panel).toContainText("1 added · 1 removed");
  await expect(panel.locator(".diff-removed")).toContainText("return 1000;");
  await expect(panel.locator(".diff-added")).toContainText("Math.min");
  await page
    .getByRole("button", { name: "src/webhooks/retry.test.ts Added" })
    .click();
  await expect(panel).toContainText("6 added · 0 removed");
  await expect(panel.locator(".diff-removed")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "docs/webhook-retries.md Added" })
    .click();
  await expect(panel).toContainText(
    "Review duplicate-event handling separately.",
  );
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page
    .getByRole("button", { name: /A-1041.*Authorize Payments/ })
    .click();
  await page.getByRole("tab", { name: "Candidate", exact: true }).click();
  await expect(panel).toContainText("No sample candidate");
  await expect(panel.locator(".diff-table")).toHaveCount(0);
});

import { test, expect } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`workstream flow distinguishes assigned, conditional and missing steps at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/workstreams/WS-01");
    const flow = page.getByRole("list", { name: "Workstream flow steps" });
    await expect(flow.locator(":scope > li")).toHaveCount(4);
    await expect(flow).toContainText("Conditional · no follow-up assignment");
    await expect(flow).toContainText(
      "No goal verification assignment or worker is represented",
    );
    await expect(flow.getByText(/A-1041|A-1035/)).toHaveCount(0);
    const record = flow.getByRole("button", {
      name: "Inspect flow record · AR-775",
      exact: true,
    });
    await record.click();
    await expect(page.getByRole("dialog")).toContainText(
      "Historical sample report",
    );
    await page.keyboard.press("Escape");
    await expect(record).toBeFocused();
    await flow
      .getByRole("button", {
        name: "Inspect step assignment · A-1042",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Submit assessment", exact: true })
      .click();
    await page
      .getByLabel("Decision rationale")
      .fill("Historical evidence is insufficient for verification.");
    await page
      .getByLabel("Assessment conclusion", { exact: true })
      .selectOption("Insufficient evidence");
    await page
      .getByRole("button", { name: "Record assessment", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Back to Workstream", exact: true })
      .click();
    await expect(flow).toContainText(
      "Local response recorded · flow has not advanced",
    );
    await expect(flow).toContainText("Conditional · no follow-up assignment");
    await expect(flow).toContainText("Outcome unverified");
    await expect(
      flow.getByRole("button", {
        name: "Inspect step response · A-1042",
        exact: true,
      }),
    ).toBeVisible();
    await flow
      .getByRole("button", {
        name: "Inspect step exchange · Prepare a contribution",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/#\/handoffs\/payment-review$/);
    await page.goBack();
    await flow
      .getByRole("button", {
        name: "Inspect flow outcome evidence",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/#\/outcomes\/WS-01$/);
    await page.goto("/#/workstreams/WS-02");
    await expect(flow.locator(":scope > li")).toHaveCount(5);
    await expect(flow).toContainText("Proposed · no assignment");
    await expect(flow).toContainText(
      "Alex has a Team Workspace binding; no invitation assignment",
    );
    await expect(
      flow.getByRole("button", { name: /Inspect flow record/ }),
    ).toHaveCount(0);
    await expect(
      flow.getByRole("button", { name: /Inspect step assignment/ }),
    ).toHaveCount(1);
    await flow
      .getByRole("button", {
        name: "Review step responsibility · Implement invitation behavior",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/#\/organization\/attention\/responsibility$/);
    await page.goBack();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.reload();
    await expect(flow).toContainText("Missing responsibility · no assignment");
  });
}

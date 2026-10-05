import { test, expect } from "@playwright/test";
for (const width of [390, 1440])
  test(`operating overview distinguishes examples and preserves source ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge?persona=leo&coordSignal=input");
    const origin = page.url();
    await page
      .getByRole("button", {
        name: "Agreements, reviews & policy",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Agreements, reviews & policy",
        exact: true,
      }),
    ).toBeFocused();
    const guide = page.getByRole("article", {
      name: "Operating context · K-01",
      exact: true,
    });
    const workshop = page.getByRole("article", {
      name: "Operating context · K-02",
      exact: true,
    });
    await expect(guide).toContainText(
      "2 proposed briefs · adoption not recorded",
    );
    await expect(guide).toContainText(
      "Current goal-level review allocation not represented",
    );
    await expect(guide).toContainText(
      "does not verify this current workstream",
    );
    await expect(workshop).toContainText("Versioned agreement not represented");
    await expect(
      workshop.getByRole("button", {
        name: /Inspect independent review example/,
      }),
    ).toHaveCount(0);
    for (const name of [
      "Compare proposed agreements · K-01",
      "Inspect independent review example · guide-review-01",
      "Inspect pattern and policy · K-02",
      "Inspect outcome gaps · K-01",
    ]) {
      await page.getByRole("button", { name, exact: true }).click();
      await page.reload();
      await page
        .getByRole("button", { name: "Back to scenario context", exact: true })
        .click();
      await expect(page).toHaveURL(origin);
    }
    await workshop.locator("summary").click();
    await expect(workshop).toContainText("Follow-up: Leo Rivera");
    await workshop
      .getByRole("button", {
        name: "Inspect follow-up case · current-workshop-brief",
        exact: true,
      })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(page).toHaveURL(origin);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/#/organizations/large");
    await expect(
      page.getByRole("region", { name: "Workstream operating context" }),
    ).toHaveCount(0);
    await page.goto("/#/organization");
    await expect(
      page.getByRole("region", { name: "Workstream operating context" }),
    ).toHaveCount(0);
  });

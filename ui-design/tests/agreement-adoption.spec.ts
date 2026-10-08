import { test, expect } from "@playwright/test";
import { adoptAgreement } from "../src/data/agreementAdoption";
test("adoption validates scope and preserves superseded decision", () => {
  const initial = adoptAgreement(
    [],
    "brief-v1",
    "Cohort October",
    "Start bounded",
    "2026-10-07T12:00:00Z",
  );
  expect(initial).toHaveLength(1);
  expect(
    adoptAgreement(
      initial,
      "brief-v1",
      "Other",
      "duplicate",
      "2026-10-07T12:01:00Z",
    ),
  ).toBe(initial);
  expect(
    adoptAgreement(initial, "foreign", "Teams", "test", "2026-10-07T12:01:00Z"),
  ).toBe(initial);
  expect(
    adoptAgreement(initial, "brief-v2", " ", "test", "2026-10-07T12:01:00Z"),
  ).toBe(initial);
  const next = adoptAgreement(
    initial,
    "brief-v2",
    "Support, Operations",
    "Expand internal coverage",
    "2026-10-07T12:01:00Z",
  );
  expect(next[0]).toBe(initial[0]);
  expect(next[1].supersedes).toBe(initial[0].id);
});
for (const width of [390, 1440])
  test(`separate adoption and scope impact ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/#/organizations/knowledge/agreements/K-01?agreementVersion=brief-v1&persona=leo",
    );
    const panel = page.getByRole("region", {
      name: "Local agreement adoption",
      exact: true,
    });
    await panel
      .getByRole("textbox", { name: "Named cohort or internal team list" })
      .fill("October onboarding cohort");
    await panel
      .getByRole("textbox", { name: "Adoption rationale" })
      .fill("Start with bounded internal scope");
    await panel
      .getByRole("button", { name: "Prepare adoption of brief-v1" })
      .click();
    await expect(
      panel.getByRole("heading", { name: "Confirm local adoption · brief-v1" }),
    ).toBeFocused();
    await panel.getByRole("button", { name: "Cancel adoption" }).click();
    await expect(panel.getByRole("status")).toContainText(
      "No agreement adopted",
    );
    await panel
      .getByRole("button", { name: "Prepare adoption of brief-v1" })
      .click();
    await panel.getByRole("button", { name: "Record local adoption" }).click();
    await expect(
      panel.getByRole("heading", { name: "Adopted workstream scope" }),
    ).toBeFocused();
    await page
      .getByRole("combobox", { name: "Proposed brief version", exact: true })
      .selectOption("brief-v2");
    await expect(panel.getByRole("status")).toContainText(
      "Adopted locally: brief-v1",
    );
    await expect(panel.getByRole("status")).toContainText("separate proposal");
    await expect(panel).toContainText("Applicability: unknown");
    await panel
      .getByRole("textbox", { name: "Named cohort or internal team list" })
      .fill("Support and Operations");
    await panel
      .getByRole("textbox", { name: "Adoption rationale" })
      .fill("Expand with explicit criteria review");
    await panel
      .getByRole("button", { name: "Prepare adoption of brief-v2" })
      .click();
    await panel.getByRole("button", { name: "Record local adoption" }).click();
    await expect(panel.getByRole("status")).toContainText(
      "Adopted locally: brief-v2",
    );
    await panel.getByText("Adoption history · 2 records").click();
    await expect(panel).toContainText("October onboarding cohort");
    await panel
      .getByRole("button", {
        name: "Inspect impact source · K-01-E",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", { name: "Adopted K-01 scope" }),
    ).toContainText("brief-v2");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.reload();
    await expect(
      page.getByRole("region", { name: "Adopted K-01 scope" }),
    ).toHaveCount(0);
  });

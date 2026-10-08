import { test, expect } from "@playwright/test";

const screens = [
  [
    "/organizations/knowledge/roles",
    "Role workspace context",
    "Inspect scoped role coverage",
    /view=scope/,
  ],
  [
    "/organizations/knowledge/workers",
    "Worker workspace context",
    "Inspect organization attention",
    /\/attention/,
  ],
  [
    "/organizations/knowledge/workflows/K-02",
    "Workflow boundary",
    "Inspect workstream context",
    /\/workstreams\/K-02/,
  ],
  [
    "/organizations/knowledge/outcomes/K-01",
    "Outcome workspace context",
    "Inspect workstream context",
    /\/workstreams\/K-01/,
  ],
  [
    "/organizations/knowledge/work?persona=leo",
    "Personal workspace context",
    "Inspect my responsibility scope",
    /\/workers\/leo/,
  ],
  [
    "/work",
    "Personal workspace context",
    "View response queue · Alex",
    /\/work\/attention/,
  ],
] as const;
for (const width of [320, 1440]) {
  test(`consistent context and working next actions ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, label, action, destination] of screens) {
      await page.goto(`/#${path}`);
      const context = page.getByRole("region", { name: label, exact: true });
      await expect(context).toBeVisible();
      await expect(context.getByRole("heading", { level: 2 })).toHaveText([
        "Current state",
        "Responsibility",
        "Next step",
      ]);
      const positions = await context
        .locator(":scope > div")
        .evaluateAll((nodes) =>
          nodes.map((el) => ({
            x: el.getBoundingClientRect().x,
            y: el.getBoundingClientRect().y,
          })),
        );
      if (width === 320)
        expect(
          positions[0].y < positions[1].y && positions[1].y < positions[2].y,
        ).toBe(true);
      else
        expect(
          positions[0].x < positions[1].x && positions[1].x < positions[2].x,
        ).toBe(true);
      await context.getByRole("button", { name: action, exact: true }).click();
      await expect(page).toHaveURL(destination);
    }
  });
}

test("outcome next step opens its workstream independently of overview return context", async ({
  page,
}) => {
  await page.goto("/#/organizations/knowledge?coordSignal=outcome");
  const stream = page
    .getByRole("region", { name: "Organization workstreams", exact: true })
    .getByRole("article")
    .first();
  await stream.locator("summary").click();
  await stream
    .getByRole("button", { name: /Inspect outcome requirement/ })
    .first()
    .click();
  await page
    .getByRole("region", { name: "Outcome workspace context", exact: true })
    .getByRole("button", { name: "Inspect workstream context", exact: true })
    .click();
  await expect(page).toHaveURL(/\/workstreams\/K-01/);
});

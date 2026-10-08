import { test, expect } from "@playwright/test";
import { parseDemoSnapshot, demoStorageKey } from "../src/data/demoSnapshot";
const empty = {
  format: "forge-ui-demo",
  version: 1,
  scope: "main-sample",
  savedAt: "2026-10-05T12:00:00Z",
  drafts: {
    text: {},
    assessmentConclusion: "",
    assessmentEvidence: [],
    criterionReviews: {},
    reconciliationConclusion: "",
  },
  receipts: [],
  proposals: {},
};
test("snapshot validation rejects foreign versions, malformed structured drafts and unknown assignments", () => {
  expect(parseDemoSnapshot(JSON.stringify(empty))).toEqual(empty);
  for (const value of [
    { ...empty, version: 99 },
    { ...empty, scope: "knowledge" },
    {
      ...empty,
      drafts: {
        ...empty.drafts,
        text: { "K-01-E": { Assessment: "foreign" } },
      },
    },
    {
      ...empty,
      drafts: {
        ...empty.drafts,
        criterionReviews: {
          a: { status: "Approved", note: "", evidenceIds: [] },
        },
      },
    },
    { ...empty, receipts: [{ assignmentId: "A-1042" }] },
    { ...empty, proposals: { constructor: {} } },
  ])
    expect(() => parseDemoSnapshot(JSON.stringify(value))).toThrow();
  expect(() => parseDemoSnapshot("bad JSON")).toThrow();
  expect(() => parseDemoSnapshot(" ".repeat(1000001))).toThrow();
});
for (const width of [390, 1440])
  test(`saved draft, response roundtrip, reviewed import and reset ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/assignments/A-1042/overview");
    await page
      .getByRole("button", { name: "Submit assessment", exact: true })
      .click();
    await page
      .getByLabel("Decision rationale")
      .fill("Keep this structured draft between machines.");
    await page
      .getByLabel("Assessment conclusion", { exact: true })
      .selectOption("Insufficient evidence");
    await page.keyboard.press("Escape");
    if (width === 390)
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .click();
    await page.getByRole("button", { name: "Demos", exact: true }).click();
    await page
      .getByRole("button", { name: "Save local snapshot", exact: true })
      .click();
    const saved = await page.evaluate(
      (key) => localStorage.getItem(key),
      demoStorageKey,
    );
    expect(parseDemoSnapshot(saved!).drafts.text["A-1042"].Assessment).toBe(
      "Keep this structured draft between machines.",
    );
    expect(parseDemoSnapshot(saved!).drafts.assessmentConclusion).toBe(
      "Insufficient evidence",
    );
    await page.reload();
    await page.goto("/#/assignments/A-1042/overview");
    await page
      .getByRole("button", { name: "Submit assessment", exact: true })
      .click();
    await expect(page.getByLabel("Decision rationale")).toHaveValue(
      "Keep this structured draft between machines.",
    );
    await expect(
      page.getByLabel("Assessment conclusion", { exact: true }),
    ).toHaveValue("Insufficient evidence");
    await page
      .getByRole("button", { name: "Record assessment", exact: true })
      .click();
    await expect(page.locator(".toast")).toContainText("Assessment recorded");
    if (width === 390)
      await page
        .getByRole("button", { name: "Toggle navigation", exact: true })
        .click();
    await page.getByRole("button", { name: "Demos", exact: true }).click();
    const downloaded = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export demo snapshot", exact: true })
      .click();
    expect((await downloaded).suggestedFilename()).toBe(
      "forge-ui-demo-v1.json",
    );
    await page
      .getByRole("button", { name: "Save local snapshot", exact: true })
      .click();
    const receiptSnapshot = await page.evaluate(
      (key) => localStorage.getItem(key),
      demoStorageKey,
    );
    expect(parseDemoSnapshot(receiptSnapshot!).receipts).toHaveLength(1);
    await page.reload();
    await page.goto("/#/assignments/A-1042/activity");
    await expect(page.getByRole("tabpanel")).toContainText(
      "Keep this structured draft between machines.",
    );
    await page.goto("/#/demos");
    await page
      .getByLabel("Import demo snapshot", { exact: true })
      .setInputFiles({
        name: "invalid.json",
        mimeType: "application/json",
        buffer: Buffer.from('{"version":2}'),
      });
    await expect(
      page.getByRole("region", { name: "Demo continuity" }),
    ).toContainText("Nothing was replaced");
    expect(
      await page.evaluate((key) => localStorage.getItem(key), demoStorageKey),
    ).toBe(receiptSnapshot);
    await page
      .getByLabel("Import demo snapshot", { exact: true })
      .setInputFiles({
        name: "snapshot.json",
        mimeType: "application/json",
        buffer: Buffer.from(saved!),
      });
    await expect(
      page.getByRole("region", { name: "Import snapshot preview" }),
    ).toBeVisible();
    expect(
      await page.evaluate((key) => localStorage.getItem(key), demoStorageKey),
    ).toBe(receiptSnapshot);
    await page
      .getByRole("button", { name: "Apply imported snapshot", exact: true })
      .click();
    await page.reload();
    expect(
      parseDemoSnapshot(
        (await page.evaluate(
          (key) => localStorage.getItem(key),
          demoStorageKey,
        ))!,
      ).receipts,
    ).toEqual([]);
    await page
      .getByRole("button", { name: "Reset local demo", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Clear current and saved demo",
        exact: true,
      })
      .click();
    expect(
      await page.evaluate((key) => localStorage.getItem(key), demoStorageKey),
    ).toBeNull();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/#/assignments/A-1042/overview");
    await page
      .getByRole("button", { name: "Submit assessment", exact: true })
      .click();
    await expect(page.getByLabel("Decision rationale")).toHaveValue("");
  });
test("corrupt saved state and unavailable storage leave the main sample usable", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => localStorage.setItem(key, "broken"),
    demoStorageKey,
  );
  await page.goto("/#/demos");
  const section = page.getByRole("region", { name: "Demo continuity" });
  await expect(section).toContainText("could not be restored");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error("storage unavailable");
    };
  });
  await page
    .getByRole("button", { name: "Save local snapshot", exact: true })
    .click();
  await expect(section).toContainText("Could not save locally");
  await page.getByLabel("Import demo snapshot", { exact: true }).setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(empty)),
  });
  await page
    .getByRole("button", { name: "Apply imported snapshot", exact: true })
    .click();
  await expect(section).toContainText("Import was not applied");
});
test("recorded proposals survive a saved snapshot without allocating work", async ({
  page,
}) => {
  await page.goto("/#/organization/attention/responsibility");
  await page
    .getByRole("button", {
      name: "Propose responsibility · Invitation implementation",
      exact: true,
    })
    .click();
  await page.getByLabel("Proposed worker").selectOption("codex");
  await page
    .getByLabel("Reason for proposal")
    .fill("Saved proposal for a bounded invitation change.");
  await page
    .getByRole("button", { name: "Record local proposal", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Demos", exact: true }).click();
  await page
    .getByRole("button", { name: "Save local snapshot", exact: true })
    .click();
  await page.reload();
  await page.goto("/#/organization/attention/responsibility");
  await page
    .getByRole("button", {
      name: "View proposal · Invitation implementation",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("region", { name: "Recorded responsibility proposal" }),
  ).toContainText("Saved proposal for a bounded invitation change.");
  await expect(
    page.getByRole("region", { name: "Recorded responsibility proposal" }),
  ).toContainText("responsibility gap remains open");
});

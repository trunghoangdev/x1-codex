import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parseSfSnapshot } from "../src/data/sfSnapshot";
const fixture = JSON.parse(
  readFileSync(
    new URL("../public/snapshots/sf-example-v1.json", import.meta.url),
    "utf8",
  ),
);
test("snapshot adapter refuses incompatible versions and foreign relationships", () => {
  expect(parseSfSnapshot(fixture).attempts).toHaveLength(2);
  for (const mutate of [
    (v: any) => (v.version = 2),
    (v: any) => (v.attempts[0].assignment_id = "foreign"),
    (v: any) => (v.attempts[1].attempt_id = v.attempts[0].attempt_id),
    (v: any) => (v.work_products[0].artifact_digest = "foreign"),
    (v: any) => (v.work_products[0].payload_schema_version = 99),
    (v: any) => (v.work_products[0].payload_type_tag = "foreign.kind"),
    (v: any) => (v.work_products[0].bytes_base64url = "invalid=="),
  ]) {
    const value = structuredClone(fixture);
    mutate(value);
    expect(() => parseSfSnapshot(value)).toThrow();
  }
});
for (const width of [390, 1440])
  test(`coherent read-only SF inspection ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/demos");
    await page
      .getByRole("button", { name: "Open SF snapshot", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Software Factory inspection" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "snapshot-attempt-01 · failed" })
      .click();
    await expect(
      page.getByText("No artifact reference was reported", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("not recorded; never assumed zero", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "snapshot-attempt-02 · produced" })
      .click();
    await expect(
      page.getByText(fixture.work_products[0].blob_digest, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Example contribution awaiting assessment.", {
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Attempt · snapshot-attempt-02" }),
    ).toBeVisible();
    await expect(
      page.getByText("Produced work is not accepted work", { exact: false }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Back to Demos" }).click();
    await expect(
      page.getByRole("heading", { name: "Collaboration demos" }),
    ).toBeVisible();
  });
test("projection failure retains unknown execution and retry restores the snapshot", async ({
  page,
}) => {
  await page.route("**/snapshots/sf-example-v1.json", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.goto("/#/demos/sf-snapshot/snapshot-attempt-02");
  await expect(
    page.getByRole("heading", { name: "Snapshot unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByText("Assignment outcome is unknown", { exact: false }),
  ).toBeVisible();
  await page.unroute("**/snapshots/sf-example-v1.json");
  await page.getByRole("button", { name: "Retry snapshot load" }).click();
  await expect(
    page.getByRole("heading", { name: "Attempt · snapshot-attempt-02" }),
  ).toBeVisible();
});

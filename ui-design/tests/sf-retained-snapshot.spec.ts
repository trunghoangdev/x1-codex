import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parseSfSnapshot } from "../src/data/sfSnapshot";
const fixture = JSON.parse(
  readFileSync(
    new URL("../public/snapshots/sf-retained-v1.json", import.meta.url),
    "utf8",
  ),
);
const id = fixture.attempts[0].attempt_id;
test("retained export preserves identities and refuses raw material or ambiguous origin", () => {
  const value = parseSfSnapshot(fixture);
  expect(value.attempts[0].artifact_digest).toBe(
    value.work_products[0].artifact_digest,
  );
  expect(value.work_products[0].bytes_base64url).toBeUndefined();
  expect(value.attempts[0].diagnostics).toBeUndefined();
  expect(value.assignment.source_repository).toBeUndefined();
  for (const mutate of [
    (v: any) => (v.source.kind = "synthetic"),
    (v: any) => (v.attempts[0].diagnostics = ["private output"]),
    (v: any) => (v.work_products[0].bytes_base64url = "private"),
    (v: any) => (v.assignment.validator = "/private/path"),
    (v: any) => delete v.redactions,
    (v: any) => (v.integrity_checks.artifact_provenance = "Verified"),
  ]) {
    const changed = structuredClone(fixture);
    mutate(changed);
    expect(() => parseSfSnapshot(changed)).toThrow();
  }
});
for (const width of [390, 1440])
  test(`real retained snapshot inspection ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/demos");
    await page
      .getByRole("button", { name: "Inspect retained SF run", exact: true })
      .click();
    await expect(
      page.getByText("READ-ONLY · REAL RETAINED METADATA · REDACTED", {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: `${id} · produced` }).click();
    await expect(
      page.getByText(fixture.work_products[0].blob_digest, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Payload bytes and referenced file bodies are omitted", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Omitted source material" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Export integrity observations" }),
    ).toBeVisible();
    await expect(
      page.getByText("Not independently verified", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: `Attempt · ${id}` }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Back to Demos" }).click();
    await page
      .getByRole("button", { name: "Open SF snapshot", exact: true })
      .click();
    await expect(
      page.getByText("READ-ONLY · SYNTHETIC SNAPSHOT", { exact: true }),
    ).toBeVisible();
  });
test("wrong-origin response and unavailable retained data never become synthetic fallbacks", async ({
  page,
}) => {
  const synthetic = readFileSync(
    new URL("../public/snapshots/sf-example-v1.json", import.meta.url),
    "utf8",
  );
  await page.route("**/snapshots/sf-retained-v1.json", (route) =>
    route.fulfill({ contentType: "application/json", body: synthetic }),
  );
  await page.goto(`/#/demos/sf-retained/${id}`);
  await expect(
    page.getByRole("heading", { name: "Snapshot unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Retained attempts" }),
  ).toHaveCount(0);
  await page.unroute("**/snapshots/sf-retained-v1.json");
  await page.getByRole("button", { name: "Retry snapshot load" }).click();
  await expect(
    page.getByRole("heading", { name: `Attempt · ${id}` }),
  ).toBeVisible();
});

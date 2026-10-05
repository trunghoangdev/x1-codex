import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { readSfProjection } from "../src/data/sfReadProjection";
import { sfAccountability } from "../src/data/sfAccountability";
const raw = readFileSync(new URL("../public/snapshots/sf-retained-v1.json", import.meta.url), "utf8");
test("trace preserves reported links and does not turn admission into authority/effect", async () => {
 const projection = await readSfProjection(raw, "retained-redacted");
 const trace = sfAccountability(projection, projection.attempts[0].id);
 expect(trace.entries.find(e => e.label === "Artifact reference")?.reference).toBe(projection.snapshot.attempts[0].artifact_digest);
 for (const label of ["Responsibility and binding", "Assessment", "Authority decision", "External effect and reconciliation"]) expect(trace.entries.find(e => e.label === label)?.status).toBe("unavailable");
 expect(sfAccountability(projection, "missing").selected).toBe(false);
 const sample = JSON.parse(readFileSync(new URL("../public/snapshots/sf-example-v1.json", import.meta.url), "utf8"));
 const failed = sfAccountability(await readSfProjection(JSON.stringify(sample), "synthetic"), "snapshot-attempt-01");
 expect(failed.entries.find(e => e.label === "Artifact reference")?.status).toBe("not-recorded");
 expect(failed.entries.find(e => e.label === "Work-product response")?.status).toBe("not-recorded");
});
for (const width of [390,1440]) test(`organization context and exact trace source inspection ${width}`, async ({ page }) => {
 await page.setViewportSize({ width, height: 1000 });
 await page.goto("/#/demos/sf-retained/20260913T153424Z-eb63b7bd05303482");
 const context = page.getByRole("region", { name: "Installed organization context" });
 await expect(context.getByText("Unknown — no allocation record supplied", { exact: true })).toBeVisible();
 const trace = page.getByRole("region", { name: "Accountability trace" });
 await expect(trace.getByText("Platform state admitted is not publication authorization.", { exact: false })).toBeVisible();
 await trace.getByRole("button", { name: "Inspect source · Work-product response", exact: true }).click();
 await expect(page.locator("#sf-source-product")).toBeFocused();
 await trace.getByRole("button", { name: "Inspect source · Assignment", exact: true }).click();
 await expect(page.locator("#sf-source-assignment")).toBeFocused();
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chromium" });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const observations = [];
for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const scenario of ["main", "knowledge", "large"]) {
    const route =
      scenario === "main" ? "/organization" : `/organizations/${scenario}`;
    await page.goto(`http://127.0.0.1:4173/#${route}`);
    await page.locator("main h1").first().waitFor();
    await page.evaluate(async () => {
      document.activeElement?.blur();
      window.scrollTo(0, 0);
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
    });
    observations.push(
      await page.evaluate(
        ({ scenario, width }) => ({
          scenario,
          width,
          height: document.documentElement.scrollHeight,
          overflow: document.documentElement.scrollWidth > innerWidth,
          streamCards: document.querySelectorAll(
            '[aria-label="Organization workstreams"] article',
          ).length,
          workerCards: document.querySelectorAll(".overview-workers article")
            .length,
          heading: document.querySelector("main h1")?.textContent,
        }),
        { scenario, width },
      ),
    );
    if (width === 1440 && scenario === "knowledge")
      await page.screenshot({
        path: "previews/67-review-knowledge-overview.png",
        fullPage: true,
      });
    if (width === 390 && scenario === "large")
      await page.screenshot({
        path: "previews/68-review-large-overview-mobile.png",
        fullPage: true,
      });
  }
}
await writeFile(
  "previews/organization-review-measurements.json",
  JSON.stringify({ observations, errors }, null, 2) + "\n",
);
console.log(JSON.stringify({ observations, errors }, null, 2));
await browser.close();

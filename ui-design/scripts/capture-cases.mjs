import { chromium } from "@playwright/test";
const b = await chromium.launch({ channel: "chromium" });
for (const [route, name, width] of [
  ["/cases", "79-knowledge-cases-1440.png", 1440],
  ["/cases/current-workshop-brief", "79-workshop-case-390.png", 390],
  ["/cases/guide-publication-policy", "79-publication-case-1440.png", 1440],
]) {
  const p = await b.newPage({ viewport: { width, height: 1000 } });
  await p.goto(
    `http://127.0.0.1:4173/#/organizations/knowledge${route}?persona=leo`,
  );
  await p.locator("main h1").first().waitFor();
  await p.screenshot({
    path: `previews/${name}`,
    fullPage: true,
    animations: "disabled",
  });
  await p.close();
}
await b.close();

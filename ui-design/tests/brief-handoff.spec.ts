import { test, expect } from "@playwright/test";
import {
  deliverBrief,
  receiveBrief,
  receivedBrief,
  emptyBriefHandoff,
} from "../src/data/briefHandoff";
test("version receipt preserves previous input and immutable history", () => {
  const a = deliverBrief(
    emptyBriefHandoff,
    "Audience: members. Schedule: Tuesday. Outstanding: attendance.",
    "2026-10-07T12:00:00Z",
  );
  expect(receiveBrief(a, 9, "2026-10-07T12:01:00Z")).toBe(a);
  const b = receiveBrief(a, 1, "2026-10-07T12:01:00Z");
  const c = deliverBrief(
    b,
    "Schedule: Wednesday; attendance still unknown.",
    "2026-10-07T12:02:00Z",
  );
  expect(receivedBrief(c)?.version).toBe(1);
  expect(c.versions[0]).toBe(b.versions[0]);
  expect(a.versions[0].receipt).toBeUndefined();
  expect(receiveBrief(c, 1, "2026-10-07T12:03:00Z")).toBe(c);
  expect(
    receivedBrief(receiveBrief(c, 2, "2026-10-07T12:03:00Z"))?.version,
  ).toBe(2);
});
test("Leo delivery and Maya exact receipt stay separate across routes and revisions", async ({
  page,
}) => {
  const route = (persona: string) =>
    page.goto(`/#/organizations/knowledge/workstreams/K-02?persona=${persona}`);
  await route("leo");
  const panel = page.getByRole("region", { name: "Workshop brief handoff" });
  await panel
    .getByRole("textbox")
    .fill("Audience: members. Schedule: Tuesday. Outstanding: attendance.");
  await panel.getByRole("button", { name: "Deliver brief-v1 locally" }).click();
  await expect(panel.getByRole("status")).toContainText("receipt is pending");
  // Hash navigation preserves the root session state.
  await page.evaluate(() => {
    location.hash = "/organizations/knowledge/assignments/K-02-E?persona=maya";
  });
  await panel
    .getByRole("button", { name: "Inspect receipt for brief-v1" })
    .click();
  await panel.getByRole("button", { name: "Cancel receipt" }).click();
  await expect(panel.getByRole("status")).toContainText("remains unavailable");
  await panel
    .getByRole("button", { name: "Inspect receipt for brief-v1" })
    .click();
  await panel
    .getByRole("button", { name: "Record receipt for brief-v1" })
    .click();
  await expect(panel.getByRole("status")).toContainText(
    "Usable local input: brief-v1",
  );
  await page.evaluate(() => {
    location.hash = "/organizations/knowledge/workstreams/K-02?persona=leo";
  });
  await panel
    .getByRole("textbox")
    .fill(
      "Audience: members. Schedule changed to Wednesday. Attendance unresolved.",
    );
  await panel.getByRole("button", { name: "Deliver brief-v2 locally" }).click();
  await expect(panel.getByRole("status")).toContainText(
    "Later brief-v2 has not been received",
  );
  await page.evaluate(() => {
    location.hash = "/organizations/knowledge/assignments/K-02-E?persona=maya";
  });
  await panel
    .getByRole("button", { name: "Inspect receipt for brief-v2" })
    .click();
  await panel
    .getByRole("button", { name: "Record receipt for brief-v2" })
    .click();
  await expect(panel.getByRole("status")).toContainText(
    "Usable local input: brief-v2",
  );
  await expect(
    panel.getByRole("article", { name: "brief-v1", exact: true }),
  ).toContainText("workshop-brief-receipt-v1");
  await page.reload();
  await expect(panel.getByRole("status")).toContainText("No brief delivered");
});

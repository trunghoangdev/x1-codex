import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// Run against the local development server on port 4173.
await mkdir("previews", { recursive: true });
const browser = await chromium.launch({ channel: "chromium" });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
await page.goto("http://127.0.0.1:4173/#/work");
await page.screenshot({
  path: "previews/01-my-work.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
await page.screenshot({
  path: "previews/02-assignment.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: "Submit assessment" }).click();
await page
  .getByLabel("Decision rationale")
  .fill(
    "Reviewed the illustrative retry changes. Duplicate-event handling and verified test evidence still need separate review.",
  );
await page
  .getByLabel("Assessment conclusion", { exact: true })
  .selectOption("Insufficient evidence");
await page.locator(".modal").evaluate((el) => {
  el.scrollTop = 0;
});
await page.screenshot({
  path: "previews/03-assessment.png",
  animations: "disabled",
  fullPage: false,
});
await page.keyboard.press("Escape");
for (const [tab, name] of [
  ["Attempts", "07-attempts"],
  ["Candidate", "08-candidate"],
  ["Checks", "09-checks"],
]) {
  await page.getByRole("tab", { name: tab, exact: true }).click();
  await page.screenshot({
    path: `previews/${name}.png`,
    animations: "disabled",
    fullPage: true,
  });
}
await page.getByRole("button", { name: "Submit assessment" }).click();
await page
  .getByLabel("Decision rationale")
  .fill(
    "Sample review: additional evidence is required before accepting the entire objective.",
  );
await page
  .getByLabel("Assessment conclusion", { exact: true })
  .selectOption("Insufficient evidence");
await page.getByRole("button", { name: "Record assessment" }).click();
await page.getByRole("button", { name: "View record", exact: true }).click();
await page.locator(".toast").waitFor({ state: "hidden" });
await page.screenshot({
  path: "previews/10-receipt.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: "Back to My Work" }).click();
await page.getByRole("button", { name: "View release assignment" }).click();
await page.screenshot({
  path: "previews/11-release-review.png",
  animations: "disabled",
  fullPage: true,
});
await page
  .getByRole("navigation")
  .getByRole("button", { name: "Organization", exact: true })
  .click();
await page.screenshot({
  path: "previews/04-organization.png",
  animations: "disabled",
  fullPage: true,
});
await page
  .getByRole("navigation")
  .getByRole("button", { name: "Evidence", exact: true })
  .click();
await page.screenshot({
  path: "previews/05-evidence.png",
  animations: "disabled",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:4173/#/work");
await page.screenshot({
  path: "previews/06-mobile.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
await page.getByRole("tab", { name: "Candidate", exact: true }).click();
await page.screenshot({
  path: "previews/12-mobile-candidate.png",
  animations: "disabled",
  fullPage: true,
});
await page.setViewportSize({ width: 1440, height: 1100 });
await page.goto("http://127.0.0.1:4173/#/assignments/A-1042/candidate");
await page.getByRole("button", { name: "Side by side", exact: true }).click();
await page.screenshot({
  path: "previews/13-split-diff.png",
  animations: "disabled",
  fullPage: true,
});
await page.goto("http://127.0.0.1:4173/#/work");
await page.locator(".demo-controls summary").click();
await page.getByLabel("Data preview", { exact: true }).selectOption("error");
await expect(page.getByRole("alert")).toContainText("Could not load your work");
await page.screenshot({
  path: "previews/14-load-error.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: "Retry sample load" }).click();
await expect(page.locator(".assignment-row")).toHaveCount(5);
await page.goto("http://127.0.0.1:4173/#/assignments/A-1042/activity");
await page.getByLabel("Activity type").selectOption("evidence");
await page.screenshot({
  path: "previews/15-activity.png",
  animations: "disabled",
  fullPage: true,
});
// Fresh session for the independent workflow examples.
await page.goto("http://127.0.0.1:4173/#/assignments/A-1042/overview");
await page.reload();
await page
  .getByRole("button", { name: "Submit assessment", exact: true })
  .click();
await page
  .getByRole("button", { name: "Review criteria", exact: true })
  .click();
await page
  .locator(".criterion-review summary")
  .filter({ hasText: "Prevent duplicate payment effects" })
  .click();
await page
  .getByLabel("Status for Prevent duplicate payment effects", { exact: true })
  .selectOption("Insufficient evidence");
await page
  .getByLabel("Note for Prevent duplicate payment effects", { exact: true })
  .fill(
    "The historical report does not establish duplicate-event coverage for this candidate.",
  );
await page
  .getByRole("checkbox", {
    name: "Prevent duplicate payment effects: AR-775",
    exact: true,
  })
  .check();
await page
  .getByRole("button", { name: "Review criteria", exact: true })
  .click();
await page.locator("#criterion-assessments").evaluate((el) => {
  const modal = el.closest(".modal");
  modal.scrollTop +=
    el.getBoundingClientRect().top - modal.getBoundingClientRect().top - 20;
});
await page.screenshot({
  path: "previews/16-criterion-review.png",
  animations: "disabled",
  fullPage: false,
});
await page.setViewportSize({ width: 390, height: 844 });
await page
  .getByRole("button", { name: "Review criteria", exact: true })
  .click();
await page.locator("#criterion-assessments").evaluate((el) => {
  const modal = el.closest(".modal");
  modal.scrollTop +=
    el.getBoundingClientRect().top - modal.getBoundingClientRect().top - 20;
});
await page.screenshot({
  path: "previews/17-mobile-review.png",
  animations: "disabled",
  fullPage: false,
});
await page.setViewportSize({ width: 1440, height: 1100 });
await page
  .getByLabel("Assessment conclusion", { exact: true })
  .selectOption("Insufficient evidence");
await page
  .getByLabel("Decision rationale")
  .fill("Additional candidate-specific evidence is needed.");
await page
  .getByText("Demo controls · Response delivery", { exact: true })
  .click();
await page
  .getByLabel("Delivery scenario", { exact: true })
  .selectOption("unknown");
await page
  .getByRole("button", { name: "Record assessment", exact: true })
  .click();
await expect(
  page.getByRole("region", { name: "Response delivery preview" }),
).toContainText("Receipt status unknown");
await page.locator(".modal").evaluate((el) => {
  el.scrollTop = 0;
});
await page.screenshot({
  path: "previews/18-delivery-unknown.png",
  animations: "disabled",
  fullPage: false,
});
await page.keyboard.press("Escape");
await page.goto("http://127.0.0.1:4173/#/assignments/A-1035/overview");
await expect(
  page.getByRole("region", { name: "Staging reconciliation context" }),
).toBeVisible();
await page.screenshot({
  path: "previews/19-reconciliation.png",
  animations: "disabled",
  fullPage: true,
});
await page.goto("http://127.0.0.1:4173/#/demos");
await page
  .getByRole("button", { name: "DEMO-A2 · Reassessment", exact: true })
  .click();
await page
  .getByRole("region", { name: "Revision cycle · standalone sample" })
  .screenshot({
    path: "previews/20-revision-cycle.png",
    animations: "disabled",
  });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://127.0.0.1:4173");
await page.screenshot({
  path: "previews/21-organization-overview.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/workstreams/WS-01");
await page.screenshot({
  path: "previews/22-workstream-detail.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/workers/alex");
await page.screenshot({
  path: "previews/23-worker-detail.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/organization");
await page.goto("http://127.0.0.1:4173/#/organization/attention/all");
await page
  .getByRole("region", { name: "Organization attention", exact: true })
  .screenshot({
    path: "previews/24-organization-attention.png",
    animations: "disabled",
  });
await page.goto("http://127.0.0.1:4173/#/handoffs/payment-review");
await page.screenshot({
  path: "previews/25-handoff-detail.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/organization/activity");
await page.screenshot({
  path: "previews/26-organization-activity.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/outcomes/WS-01");
await page.screenshot({
  path: "previews/27-outcome-review.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/work/attention");
await page.screenshot({
  path: "previews/28-personal-response-queue.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/outcomes/WS-01");
await page
  .getByRole("button", {
    name: "Inspect supporting context · AR-775 · Test results",
    exact: true,
  })
  .click();
await page.screenshot({
  path: "previews/29-outcome-artifact-inspector.png",
  fullPage: true,
  animations: "disabled",
});
await page.keyboard.press("Escape");
await page.goto("http://127.0.0.1:4173/#/workstreams/WS-01");
await page
  .getByRole("button", { name: "Open assignment · A-1042", exact: true })
  .click();
await page.screenshot({
  path: "previews/30-assignment-source-return.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/demos/organization");
await page.screenshot({
  path: "previews/31-larger-organization.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto(
  "http://127.0.0.1:4173/#/organization/attention/responsibility",
);
await page
  .getByRole("button", {
    name: "Propose responsibility · Invitation implementation",
    exact: true,
  })
  .click();
await page.getByLabel("Proposed worker").selectOption("codex");
await page
  .getByLabel("Reason for proposal")
  .fill(
    "Propose scoped invitation implementation work for review by the planner.",
  );
await page.getByRole("button", { name: "Record local proposal" }).click();
await page.screenshot({
  path: "previews/32-responsibility-proposal.png",
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/demos");
await page.getByRole("button", { name: "Start customer walkthrough" }).click();
await page.screenshot({
  path: "previews/33-customer-walkthrough.png",
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/organization/workstreams");
await page.screenshot({
  path: "previews/34-workstreams-directory.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/organization/workers");
await page.screenshot({
  path: "previews/35-workers-directory.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/workstreams/WS-01");
await page
  .getByRole("region", { name: "Coordination and handoffs" })
  .screenshot({ path: "previews/36-payment-flow.png", animations: "disabled" });
await page.goto("http://127.0.0.1:4173/#/workstreams/WS-02");
await page
  .getByRole("region", { name: "Coordination and handoffs" })
  .screenshot({
    path: "previews/37-invitation-flow.png",
    animations: "disabled",
  });
await page.goto(
  "http://127.0.0.1:4173/#/organization/attention/responsibility",
);
await page
  .getByRole("button", {
    name: /^(Propose responsibility|View proposal) · Invitation implementation$/,
    exact: true,
  })
  .click();
if (await page.getByLabel("Proposed worker").count()) {
  await page.getByLabel("Proposed worker").selectOption("codex");
  await page
    .getByLabel("Reason for proposal")
    .fill("Propose scoped invitation implementation for allocation review.");
  await page
    .getByRole("button", { name: "Record local proposal", exact: true })
    .click();
}
await page
  .getByRole("button", { name: "Review allocation plan", exact: true })
  .click();
await page.getByRole("dialog").screenshot({
  path: "previews/38-allocation-review.png",
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/organization");
await page.locator("details.workspace-guide summary").click();
await page.locator("details.workspace-guide").screenshot({
  path: "previews/39-workspace-guide.png",
  animations: "disabled",
});
await page.goto(
  "http://127.0.0.1:4173/#/organization/attention/responsibility",
);
await page
  .getByRole("button", {
    name: "Propose responsibility · Invitation implementation",
    exact: true,
  })
  .click();
await page.getByLabel("Proposed worker").selectOption("codex");
await page
  .getByLabel("Reason for proposal")
  .fill("Coordinate a scoped invitation implementation.");
await page
  .getByRole("button", { name: "Record local proposal", exact: true })
  .click();
await page
  .getByRole("button", { name: "Review allocation plan", exact: true })
  .click();
await page
  .getByLabel("Decision reason", { exact: true })
  .fill("Accept the plan for later validation; allocation remains pending.");
await page
  .getByRole("button", { name: "Record allocation decision", exact: true })
  .click();
await page.keyboard.press("Escape");
await page
  .getByRole("button", { name: "Back to Organization", exact: true })
  .click();
await page
  .getByRole("button", { name: "View organization activity", exact: true })
  .click();
await page.getByLabel("Activity scope").selectOption("WS-02");
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({
  path: "previews/40-coordination-activity.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto("http://127.0.0.1:4173/#/organizations/large");
await page.screenshot({
  path: "previews/41-shared-scenario-overview.png",
  fullPage: true,
  animations: "disabled",
});
await page.getByRole("button", { name: "Browse workers", exact: true }).click();
await page.screenshot({
  path: "previews/42-shared-scenario-workers.png",
  fullPage: true,
  animations: "disabled",
});
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://127.0.0.1:4173/#/organization/roles?coverage=gaps");
await page.screenshot({
  path: "previews/43-organization-roles.png",
  fullPage: true,
  animations: "disabled",
});
await page.setViewportSize({ width: 390, height: 1000 });
await page.goto(
  "http://127.0.0.1:4173/#/organizations/large/roles?coverage=gaps",
);
await page.screenshot({
  path: "previews/44-scenario-roles-mobile.png",
  fullPage: true,
  animations: "disabled",
});
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://127.0.0.1:4173/#/organizations/knowledge?persona=maya");
await page.screenshot({
  path: "previews/45-knowledge-organization.png",
  fullPage: true,
  animations: "disabled",
});
await page.goto(
  "http://127.0.0.1:4173/#/organizations/knowledge/work?persona=maya",
);
await page.screenshot({
  path: "previews/46-maya-personal-inbox.png",
  fullPage: true,
  animations: "disabled",
});
await page.setViewportSize({ width: 390, height: 1000 });
await page.goto(
  "http://127.0.0.1:4173/#/organizations/knowledge/work?persona=leo",
);
await page.screenshot({
  path: "previews/47-leo-personal-inbox-mobile.png",
  fullPage: true,
  animations: "disabled",
});
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(
  "http://127.0.0.1:4173/#/organizations/knowledge/workstreams/K-02?persona=maya",
);
await page
  .getByRole("region", { name: "Coordination inputs", exact: true })
  .screenshot({
    path: "previews/48-workshop-input-dependency.png",
    animations: "disabled",
  });
await page.goto("http://127.0.0.1:4173/#/workstreams/WS-01");
await page
  .getByRole("region", { name: "Coordination inputs", exact: true })
  .screenshot({
    path: "previews/49-software-input-exchange.png",
    animations: "disabled",
  });
await page.setViewportSize({ width: 390, height: 1000 });
await page.goto(
  "http://127.0.0.1:4173/#/organizations/knowledge/assignments/K-02-E?persona=maya",
);
await page
  .getByRole("heading", { name: "Review workshop outline", exact: true })
  .waitFor();
await page.evaluate(async () => {
  document.activeElement?.blur();
  window.scrollTo(0, 0);
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
});
await page.screenshot({
  path: "previews/50-workshop-input-mobile.png",
  fullPage: true,
  animations: "disabled",
});
await browser.close();

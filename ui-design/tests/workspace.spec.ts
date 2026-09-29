import { test, expect } from "@playwright/test";

test("reviewer assesses evidence, records rationale and completes the assignment", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Search assignments" })
    .fill("A-1042");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await expect(
    page.getByRole("button", { name: "Approve release", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("tab", { name: "Evidence" }).click();
  await page.getByRole("button", { name: /Test results AR-775/ }).click();
  await expect(page.getByRole("dialog")).toContainText("42 passed");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Test results AR-775/ }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await expect(
    page.getByRole("button", { name: "Record assessment" }),
  ).toBeDisabled();
  await page
    .getByLabel("Decision rationale")
    .fill(
      "Duplicate delivery is covered by AR-775; the contribution meets the acceptance criteria.",
    );
  await page.getByRole("button", { name: "Record assessment" }).click();
  await expect(page.getByRole("status")).toContainText("Assessment recorded");
  await page.getByRole("tab", { name: "Activity" }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Duplicate delivery is covered",
  );
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await expect(
    page.getByRole("button", { name: /A-1042.*Review retry/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /A-1042.*Review retry/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

for (const response of ["Approval", "Refusal"]) {
  test(`${response} requires rationale and does not establish a deployment effect`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "View release assignment" }).click();
    if (response === "Approval")
      await page
        .getByLabel("Preview release prerequisites")
        .selectOption("ready");
    await page
      .getByRole("button", {
        name: response === "Approval" ? "Approve release" : "Refuse release",
        exact: true,
      })
      .click();
    await page
      .getByLabel("Decision rationale")
      .fill(
        response === "Approval"
          ? "Reviewed exact candidate and attached evidence."
          : "Additional regression evidence is required.",
      );
    await page
      .getByRole("button", { name: `Record ${response.toLowerCase()}` })
      .click();
    await expect(page.locator(".toast")).toContainText(`${response} recorded`);
    await page
      .getByRole("navigation")
      .getByRole("button", { name: "Evidence", exact: true })
      .click();
    await expect(
      page.locator(".chain-node").filter({ hasText: "Authority" }),
    ).toContainText(response);
    await expect(
      page.locator(".chain-node").filter({ hasText: "Effect" }),
    ).toContainText("Not established");
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Evidence, connected." }),
    ).toBeVisible();
    await expect(
      page.locator(".chain-node").filter({ hasText: "Authority" }),
    ).toContainText("Awaiting decision");
  });
}

test("filters, responsive navigation and modal fit a phone screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Needs my authority/ }).click();
  await expect(page.locator(".assignment-row")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear filter" }).click();
  await expect(page.locator(".assignment-row")).toHaveCount(5);
  for (const view of ["Organization", "Evidence", "My Work"]) {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page
      .getByRole("navigation")
      .getByRole("button", { name: view, exact: view !== "My Work" })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("attempts preserve unknown outcomes and keyboard navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Attempts", exact: true }),
  ).toBeFocused();
  const produced = page.getByRole("article", { name: "demo-attempt-03" });
  await expect(produced).toContainText("Produced");
  const failed = page.getByRole("article", { name: "demo-attempt-02" });
  await expect(failed).toContainText("Not observed");
  const open = page.getByRole("article", { name: "demo-attempt-01" });
  await expect(open).toContainText("Open — completion not recorded");
  await expect(open).toContainText("live execution is not established");
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Activity", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Overview", exact: true }),
  ).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("tab", { name: "Attempts", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page
    .getByRole("button", { name: /A-1041.*Authorize Payments/ })
    .click();
  await page.getByRole("tab", { name: "Attempts", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("No sample attempts");
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("candidate shows a scoped diff, file changes and unverified identities", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("tab", { name: "Candidate", exact: true }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("demo-attempt-03");
  await expect(panel).toContainText("synthetic, not verified");
  await expect(panel).toContainText("1 added · 1 removed");
  await expect(panel.locator(".diff-removed")).toContainText("return 1000;");
  await expect(panel.locator(".diff-added")).toContainText("Math.min");
  await page
    .getByRole("button", { name: "src/webhooks/retry.test.ts Added" })
    .click();
  await expect(panel).toContainText("6 added · 0 removed");
  await expect(panel.locator(".diff-removed")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "docs/webhook-retries.md Added" })
    .click();
  await expect(panel).toContainText(
    "Review duplicate-event handling separately.",
  );
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page
    .getByRole("button", { name: /A-1041.*Authorize Payments/ })
    .click();
  await page.getByRole("tab", { name: "Candidate", exact: true }).click();
  await expect(panel).toContainText("No sample candidate");
  await expect(panel.locator(".diff-table")).toHaveCount(0);
});

test("checks distinguish observations from decisions without changing work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("tab", { name: "Checks", exact: true }).click();
  const observation = page.getByRole("article", {
    name: "Validator observation",
  });
  const selector = page.getByLabel("Preview an alternative observation");
  await expect(observation).toContainText("Validator passed");
  await expect(page.locator(".check-gates")).toContainText("Approval");
  await expect(page.locator(".check-gates")).toContainText(
    "Not established by this validator",
  );
  await selector.selectOption("refused");
  await expect(observation).toContainText("Validator refused");
  await expect(
    observation
      .locator("div")
      .filter({ has: page.locator("dt", { hasText: "Exit code" }) })
      .last(),
  ).toContainText("1");
  await selector.selectOption("unavailable");
  await expect(observation).toContainText("Could not run");
  await expect(
    observation.locator("dd").filter({ hasText: "Not observed" }),
  ).toHaveCount(2);
  await page.getByText("Diagnostic explanation", { exact: true }).click();
  await expect(observation).toContainText("No candidate verdict was observed");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await page
    .getByLabel("Decision rationale")
    .fill("The validator could not run. Further evidence is needed.");
  await page.getByRole("button", { name: "Record assessment" }).click();
  await expect(page.locator(".check-gates")).toContainText(
    "Recorded in this demo session",
  );
  await expect(observation).toContainText("Could not run");
  await expect(page.locator(".check-gates")).toContainText(
    "Not established by this validator",
  );
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page
    .getByRole("button", { name: /A-1041.*Authorize Payments/ })
    .click();
  await page.getByRole("tab", { name: "Checks", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("No sample checks");
  await expect(page.getByRole("tabpanel").getByRole("combobox")).toHaveCount(0);
});

test("release approval requires prerequisites and binds its exact subject", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View release assignment" }).click();
  const approve = page.getByRole("button", {
    name: "Approve release",
    exact: true,
  });
  const selector = page.getByLabel("Preview release prerequisites");
  await expect(approve).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Refuse release", exact: true }),
  ).toBeEnabled();
  await selector.selectOption("refused");
  await expect(approve).toBeDisabled();
  await expect(
    page.getByRole("region", { name: "Release prerequisites" }),
  ).toContainText("Refused · sample");
  await selector.selectOption("ready");
  await approve.click();
  const modal = page.getByRole("dialog");
  await expect(modal).toContainText("sha256:" + "c".repeat(64));
  await expect(modal).toContainText("Production · Payments API");
  await expect(
    page.getByRole("button", { name: "Record approval" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(selector).toBeEnabled();
  await selector.selectOption("missing");
  await expect(approve).toBeDisabled();
  await selector.selectOption("ready");
  await approve.click();
  await page
    .getByLabel("Decision rationale")
    .fill("Reviewed the sample exact subject and prerequisites.");
  await page.getByRole("button", { name: "Record approval" }).click();
  await expect(selector).toBeDisabled();
  await page.getByRole("tab", { name: "Activity", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "sha256:" + "c".repeat(64),
  );
  await expect(page.getByRole("tabpanel")).toContainText(
    "prerequisites: ready",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("decision receipt snapshots identity, time and rationale without leaking across assignments", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View release assignment" }).click();
  await page
    .getByRole("button", { name: "Refuse release", exact: true })
    .click();
  const rationale =
    "Publication evidence is missing.\nRecheck before authorizing the exact candidate.";
  await page.getByLabel("Decision rationale").fill(rationale);
  await page.getByRole("button", { name: "Record refusal" }).click();
  await page.getByRole("button", { name: "View record", exact: true }).click();
  const receipt = page.getByRole("article", { name: "Decision receipt" });
  await expect(receipt).toContainText("Refusal receipt");
  await expect(receipt).toContainText("Alex Morgan");
  await expect(receipt).toContainText("release.approve");
  await expect(receipt).toContainText("Not admitted by a server");
  await expect(receipt).toContainText("Snapshot of prerequisites: missing");
  await expect(receipt.locator(".receipt-rationale")).toHaveText(rationale);
  const recordedAt = await receipt.locator("time").getAttribute("datetime");
  expect(Number.isNaN(Date.parse(recordedAt!))).toBe(false);
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("tab", { name: "Activity", exact: true }).click();
  await expect(receipt).toHaveCount(0);
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await page
    .getByRole("button", { name: /A-1041.*Authorize Payments/ })
    .click();
  await page.getByRole("tab", { name: "Activity", exact: true }).click();
  await expect(receipt.locator("time")).toHaveAttribute(
    "datetime",
    recordedAt!,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Activity", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(receipt).toHaveCount(0);
});

test("evidence and inspector stay scoped and expose only connected references", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View release assignment" }).click();
  await page.getByRole("tab", { name: "Evidence", exact: false }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel).not.toContainText("AR-775");
  await panel.getByRole("button", { name: /Release candidate AR-801/ }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "sha256:" + "c".repeat(64),
  );
  await expect(page.getByRole("dialog")).toContainText("A-1041");
  await expect(page.getByRole("dialog")).not.toContainText("42 passed");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page.getByRole("button", { name: /A-1038.*Clarify/ }).click();
  await page.getByRole("tab", { name: "Evidence" }).click();
  await expect(panel).toContainText("No sample evidence");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Evidence", exact: true })
    .click();
  const group = page.getByRole("region", {
    name: "Evidence for A-1042",
    exact: true,
  });
  await group
    .getByRole("button", { name: /Worker contribution AR-776/ })
    .click();
  await expect(page.getByRole("dialog")).toContainText("No digest connected");
  await expect(page.getByRole("dialog")).toContainText(
    "Duplicate-event handling still requires separate review",
  );
  await page.keyboard.press("Escape");
  await group.getByRole("button", { name: /Source change AR-771/ }).click();
  await expect(page.getByRole("dialog")).toContainText("Math.min");
  await expect(page.getByRole("dialog")).toContainText(
    "sha256:" + "a".repeat(64),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("attempt failures distinguish process exit, platform state and cleanup", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("tab", { name: "Attempts", exact: true }).click();
  const failed = page.getByRole("article", {
    name: "demo-attempt-process-failure",
    exact: true,
  });
  await expect(failed).toContainText("exit status 1");
  await expect(
    failed
      .locator("div")
      .filter({ has: page.locator("dt", { hasText: "Platform state" }) })
      .last(),
  ).toContainText("Not recorded");
  await expect(failed).toContainText("Destroyed · recorded by harness");
  await expect(failed).toContainText("No artifact reference recorded");
  await expect(failed).toContainText("does not establish a platform refusal");
  const produced = page.getByRole("article", {
    name: "demo-attempt-03",
    exact: true,
  });
  await expect(produced).toContainText("admitted");
  const neverStarted = page.getByRole("article", {
    name: "demo-attempt-02",
    exact: true,
  });
  await expect(neverStarted).toContainText("Not observed");
  await expect(neverStarted).not.toContainText("Destroyed");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("phone assignment tabs are all visible and response shortcut moves focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(6);
  for (const tab of await tabs.all()) {
    const box = await tab.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  }
  await page.getByRole("tab", { name: "Candidate", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Inspect what this candidate changes",
  );
  await page
    .getByRole("button", { name: "Review authority & response" })
    .click();
  const authority = page.getByRole("region", {
    name: "Assignment authority and response",
  });
  await expect(authority).toBeFocused();
  expect((await authority.boundingBox())!.y).toBeGreaterThanOrEqual(64);
  await expect(
    authority.getByRole("button", { name: "Submit assessment" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("overview separates permitted scope, required deliverables and unproven criteria", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  const requirements = page.getByRole("region", {
    name: "Work requirements",
    exact: true,
  });
  await expect(requirements).toContainText(
    "184c72a81f995c8fa31f997269a4c5c91c0e403d2",
  );
  await expect(requirements).toContainText("demo-retry-delay-validator");
  await expect(requirements).toContainText("do not grant you permission");
  const allowed = page.getByRole("region", { name: "Permitted output scope" });
  const required = page.getByRole("region", { name: "Required effect paths" });
  await expect(allowed.getByRole("listitem")).toHaveCount(3);
  await expect(required.getByRole("listitem")).toHaveCount(2);
  await expect(allowed).toContainText("docs/webhook-retries.md");
  await expect(required).not.toContainText("docs/webhook-retries.md");
  await expect(requirements).toContainText("Prevent duplicate payment effects");
  await expect(requirements).toContainText(
    "current illustrative snippets do not establish this",
  );
  await expect(requirements).toContainText("No criterion is marked satisfied");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page.getByRole("button", { name: /A-1038.*Clarify/ }).click();
  await expect(requirements).toContainText("not connected");
  await expect(requirements).not.toContainText("src/webhooks");
});

test("related records preserve assignment, checked subject and preview state", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("tab", { name: "Attempts", exact: true }).click();
  await expect(
    page
      .getByRole("article", {
        name: "demo-attempt-process-failure",
        exact: true,
      })
      .getByRole("button"),
  ).toHaveCount(0);
  await page
    .getByRole("article", { name: "demo-attempt-03", exact: true })
    .getByRole("button", { name: "Inspect produced candidate" })
    .click();
  await expect(
    page.getByRole("tab", { name: "Candidate", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("demo-attempt-03");
  await page.getByRole("button", { name: "Review candidate checks" }).click();
  await page
    .getByLabel("Preview an alternative observation")
    .selectOption("unavailable");
  await expect(
    page.getByRole("button", { name: "View recorded response" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Inspect checked candidate" }).click();
  await page.getByRole("button", { name: "Review candidate checks" }).click();
  await expect(
    page.getByLabel("Preview an alternative observation"),
  ).toHaveValue("unavailable");
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await page
    .getByLabel("Decision rationale")
    .fill("Evidence needed; validator could not run.");
  await page.getByRole("button", { name: "Record assessment" }).click();
  await page.getByRole("button", { name: "View recorded response" }).click();
  await expect(
    page.getByRole("article", { name: "Decision receipt" }),
  ).toContainText("A-1042");
  await page.getByRole("button", { name: "Inspect receipt candidate" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("demo-attempt-03");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

for (const state of ["load-error", "stale", "revoked"]) {
  test(`release ${state} blocks both decisions and resets without granting readiness`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "View release assignment" }).click();
    await page.getByLabel("Preview release prerequisites").selectOption(state);
    await expect(
      page.getByRole("button", { name: "Approve release", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Refuse release", exact: true }),
    ).toBeDisabled();
    await expect(page.getByRole("alert")).toContainText("Decision unavailable");
    await page.getByRole("button", { name: "Reset demo review" }).click();
    await expect(page.getByLabel("Preview release prerequisites")).toHaveValue(
      "missing",
    );
    await expect(
      page.getByRole("button", { name: "Approve release", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Refuse release", exact: true }),
    ).toBeEnabled();
    await page
      .getByLabel("Preview release prerequisites")
      .selectOption("ready");
    await page
      .getByRole("button", { name: "Approve release", exact: true })
      .click();
    await page
      .getByLabel("Decision rationale")
      .fill("This rationale must not admit a decision after invalidation.");
    await page
      .getByLabel("Simulate a change before recording")
      .selectOption(state);
    await expect(
      page.getByRole("button", { name: "Record approval" }),
    ).toBeDisabled();
    await expect(page.getByLabel("Decision rationale")).toHaveValue(
      "This rationale must not admit a decision after invalidation.",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Reset demo review" })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("tab", { name: "Activity", exact: true }).click();
    await expect(
      page.getByRole("article", { name: "Decision receipt" }),
    ).toHaveCount(0);
  });
}

test("assignment URLs restore screens and support browser history safely", async ({
  page,
}) => {
  await page.goto("/#/assignments/A-1042/candidate");
  await expect(page.getByRole("tabpanel")).toContainText(
    "Inspect what this candidate changes",
  );
  await page.getByRole("button", { name: "Review candidate checks" }).click();
  await expect(page).toHaveURL(/#\/assignments\/A-1042\/checks$/);
  await page.goBack();
  await expect(
    page.getByRole("tab", { name: "Candidate", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.goForward();
  await expect(
    page.getByRole("tab", { name: "Checks", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Checks", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/#/assignments/unknown/activity");
  await expect(page.getByRole("alert")).toContainText("does not match");
  await page.getByRole("button", { name: "Open My Work", exact: true }).click();
  await expect(page).toHaveURL(/#\/work$/);
  await page.goto("/#/assignments/A-1042/not-a-tab");
  await expect(page.getByRole("alert")).toBeVisible();
  await page.goto("/#/organization");
  await expect(
    page.getByRole("heading", { name: "One team. Clear responsibility." }),
  ).toBeVisible();
});

test("drafts survive navigation, stay isolated and clear only on deletion or submission", async ({
  page,
}) => {
  await page.goto("/#/assignments/A-1042/overview");
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await page
    .getByLabel("Decision rationale")
    .fill("Draft assessment requiring more evidence.");
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: "Evidence" }).click();
  await page.getByRole("button", { name: "Continue assessment draft" }).click();
  await expect(page.getByLabel("Decision rationale")).toHaveValue(
    "Draft assessment requiring more evidence.",
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page.getByRole("button", { name: "View release assignment" }).click();
  await page
    .getByRole("button", { name: "Refuse release", exact: true })
    .click();
  await expect(page.getByLabel("Decision rationale")).toHaveValue("");
  await page.getByLabel("Decision rationale").fill("Draft refusal.");
  await page.keyboard.press("Escape");
  await page.getByLabel("Preview release prerequisites").selectOption("ready");
  await page
    .getByRole("button", { name: "Approve release", exact: true })
    .click();
  await expect(page.getByLabel("Decision rationale")).toHaveValue("");
  await page.keyboard.press("Escape");
  page.once("dialog", (d) => d.dismiss());
  await page.getByRole("button", { name: "Delete refusal draft" }).click();
  await expect(
    page.getByRole("button", { name: "Continue refusal draft" }),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete refusal draft" }).click();
  await expect(
    page.getByRole("button", { name: "Continue refusal draft" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("button", { name: "Continue assessment draft" }).click();
  await page.getByRole("button", { name: "Record assessment" }).click();
  await expect(page.getByRole("region", { name: "Saved drafts" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "View record", exact: true }).click();
  await expect(
    page.getByRole("article", { name: "Decision receipt" }),
  ).toContainText("Draft assessment requiring more evidence.");
});

test("diff layouts keep line pairing and file filtering does not change the selected subject", async ({
  page,
}) => {
  await page.goto("/#/assignments/A-1042/candidate");
  await page.getByRole("button", { name: "Side by side", exact: true }).click();
  const table = page.locator(".split-diff");
  await expect(table.locator("tbody tr")).toHaveCount(3);
  const replacement = table.locator("tbody tr").nth(1);
  await expect(replacement.locator("td").nth(1)).toContainText(
    "−   return 1000;",
  );
  await expect(replacement.locator("td").nth(3)).toContainText("Math.min");
  await page.getByLabel("Find a changed file").fill("retry.test");
  await expect(page.locator(".candidate-files button")).toHaveCount(1);
  await page
    .getByRole("button", { name: "src/webhooks/retry.test.ts Added" })
    .click();
  await expect(table.locator("tbody tr")).toHaveCount(6);
  await expect(table.locator(".diff-absent")).toHaveCount(6);
  await page.getByLabel("Find a changed file").fill("does-not-exist");
  await expect(page.getByRole("status")).toContainText("No matching files");
  await expect(page.locator(".diff-heading")).toContainText("retry.test.ts");
  await page.getByRole("button", { name: "Clear file filter" }).click();
  await expect(page.locator(".candidate-files button")).toHaveCount(3);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Unified", exact: true }).click();
  await expect(page.locator(".split-diff")).toHaveCount(0);
  await expect(page.locator(".diff-heading")).toContainText(
    "6 added · 0 removed",
  );
});

test("review context and draft survive tabs, history and assignment navigation", async ({
  page,
}) => {
  await page.goto("/#/assignments/A-1042/candidate");
  await page.getByLabel("Find a changed file").fill("retry.test");
  await page
    .getByRole("button", { name: "src/webhooks/retry.test.ts Added" })
    .click();
  await page.getByRole("button", { name: "Side by side", exact: true }).click();
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await page
    .getByLabel("Decision rationale")
    .fill("Keep this review draft alongside the selected test file.");
  await page.keyboard.press("Escape");
  await page.getByRole("tab", { name: "Evidence" }).click();
  await page
    .getByRole("button", { name: "Resume assessment while reviewing" })
    .click();
  await expect(page.getByLabel("Decision rationale")).toHaveValue(
    "Keep this review draft alongside the selected test file.",
  );
  await page.keyboard.press("Escape");
  await page.goBack();
  await expect(page.getByLabel("Find a changed file")).toHaveValue(
    "retry.test",
  );
  await expect(
    page.getByRole("button", { name: "Side by side", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".diff-heading")).toContainText("retry.test.ts");
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page.getByRole("button", { name: "View release assignment" }).click();
  await page.getByRole("tab", { name: "Candidate", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("No sample candidate");
  await expect(
    page.getByRole("complementary", { name: "Review draft shortcuts" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("tab", { name: "Candidate", exact: true }).click();
  await expect(page.locator(".diff-heading")).toContainText("retry.test.ts");
  await expect(page.getByLabel("Find a changed file")).toHaveValue(
    "retry.test",
  );
  await page.reload();
  await expect(page.getByLabel("Find a changed file")).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Unified", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".diff-heading")).toContainText(
    "src/webhooks/retry.ts",
  );
  await expect(
    page.getByRole("button", { name: "Resume assessment while reviewing" }),
  ).toHaveCount(0);
});

test("My Work filters round-trip through URLs and preserve assignment context", async ({
  page,
}) => {
  await page.goto("/#/work?project=Payments+API&sort=due");
  await expect(page.locator(".assignment-row")).toHaveCount(3);
  await expect(page.getByLabel("Project", { exact: true })).toHaveValue(
    "Payments API",
  );
  await page
    .getByLabel("Project", { exact: true })
    .selectOption("Team Workspace");
  await expect(page.locator(".assignment-row")).toHaveCount(2);
  await page.goBack();
  await expect(page.getByLabel("Project", { exact: true })).toHaveValue(
    "Payments API",
  );
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
  await page.getByRole("button", { name: "Submit assessment" }).click();
  await page
    .getByLabel("Decision rationale")
    .fill("A draft for inbox filtering.");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await expect(page.getByLabel("Project", { exact: true })).toHaveValue(
    "Payments API",
  );
  await page.getByLabel("Has a draft").check();
  await expect(page.locator(".assignment-row")).toHaveCount(1);
  await expect(page.locator(".assignment-row")).toContainText("Draft");
  await expect(page).toHaveURL(/drafts=1/);
  await page.reload();
  await expect(page.getByLabel("Has a draft")).toBeChecked();
  await expect(page.locator(".assignment-row")).toHaveCount(0);
  await page.getByRole("button", { name: "Reset all filters" }).click();
  await expect(page.locator(".assignment-row")).toHaveCount(5);
  await page.getByLabel("Sort by", { exact: true }).selectOption("due");
  const rows = await page.locator(".assignment-row").allTextContents();
  expect(rows.slice(0, 3).every((text) => text.includes("Today"))).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/#/work?kind=invalid&sort=invalid&project=Unknown");
  await expect(page.getByLabel("Sort by", { exact: true })).toHaveValue(
    "default",
  );
  await expect(page.locator(".assignment-row")).toHaveCount(0);
});

test("keyboard access skips navigation and dialogs contain focus then restore the opener", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page).not.toHaveURL(/main-content/);
  await page.goto("/#/assignments/A-1042/overview");
  const opener = page.getByRole("button", {
    name: "Submit assessment",
    exact: true,
  });
  await opener.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(page.getByLabel("Decision rationale")).toBeFocused();
  expect(
    await page
      .locator(".main-shell")
      .evaluate((el) => (el as HTMLElement).inert),
  ).toBe(true);
  const close = dialog.getByRole("button", { name: "Close dialog" });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect(
    await page
      .locator(".main-shell")
      .evaluate((el) => (el as HTMLElement).inert),
  ).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("navigation", {
      name: "Main navigation",
      includeHidden: true,
    }),
  ).toBeHidden();
  const box = await menu.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
});

test("My Work distinguishes load failure, loading, empty data and filtered results", async ({
  page,
}) => {
  await page.goto("/#/work?project=Payments+API");
  const preview = page.getByLabel("Data preview", { exact: true });
  await preview.selectOption("error");
  await expect(page.getByRole("alert")).toContainText(
    "assignment count is unknown",
  );
  await expect(page.locator(".stat-grid")).toHaveCount(0);
  await expect(page.locator(".assignment-row")).toHaveCount(0);
  await page.getByRole("button", { name: "Retry sample load" }).click();
  await expect(
    page.getByRole("heading", { name: "Loading assignments…" }),
  ).toBeVisible();
  await expect(page.locator(".data-state")).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await expect(page.locator(".assignment-row")).toHaveCount(3);
  await expect(preview).toBeFocused();
  await expect(page.getByLabel("Project", { exact: true })).toHaveValue(
    "Payments API",
  );
  await preview.selectOption("empty");
  await expect(
    page.getByRole("heading", { name: "No work assigned to you" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Show all work" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Restore sample work" }).click();
  await expect(page.locator(".assignment-row")).toHaveCount(3);
  await preview.selectOption("loading");
  await expect(page.getByRole("status")).toContainText("Loading sample work");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await preview.selectOption("error");
  await page.getByRole("button", { name: "Retry sample load" }).click();
  await preview.selectOption("empty");
  await page.waitForTimeout(1000);
  await expect(preview).toHaveValue("empty");
  await page.reload();
  await expect(preview).toHaveValue("ready");
  await expect(page.locator(".assignment-row")).toHaveCount(3);
});

test("Organization connects responsibilities, release blockers and local responses", async ({
  page,
}) => {
  await page.goto("/#/organization");
  const work = page.getByRole("region", { name: "Needs your attention" });
  await expect(work).toContainText("5 open assignments");
  await expect(work).toContainText("Approval is blocked");
  await expect(work).toContainText("staging effect is unconfirmed");
  await work.getByRole("button", { name: "Open assignment · A-1041" }).click();
  await expect(page).toHaveURL(/assignments\/A-1041\/overview/);
  await page
    .getByLabel("Preview release prerequisites")
    .selectOption("revoked");
  await page.getByRole("button", { name: "Organization", exact: true }).click();
  await expect(work).toContainText(
    "Both decisions are blocked: release authority",
  );
  await work.getByRole("button", { name: "Open assignment · A-1042" }).click();
  await page
    .getByRole("button", { name: "Submit assessment", exact: true })
    .click();
  await page
    .getByLabel("Decision rationale")
    .fill("Reviewed the sample contribution and evidence.");
  await page.getByRole("button", { name: "Record assessment" }).click();
  await page.getByRole("button", { name: "Organization", exact: true }).click();
  await expect(work).toContainText("4 open assignments");
  await expect(work).toContainText("Downstream outcome is not established");
  await expect(
    page.locator(".role-card").filter({
      has: page.getByRole("heading", { name: "Reviewer", exact: true }),
    }),
  ).toContainText("1 awaiting review");
  await work.getByRole("button", { name: "View response · A-1042" }).click();
  await expect(page).toHaveURL(/assignments\/A-1042\/activity/);
  await expect(page.getByRole("tabpanel")).toContainText(
    "Reviewed the sample contribution",
  );
  await page.goBack();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(work).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await expect(work).toContainText("5 open assignments");
  await expect(work).toContainText("Approval is blocked");
});

test("Activity and evidence lookup stay scoped to their assignment", async ({
  page,
}) => {
  await page.goto("/#/assignments/A-1042/activity");
  await page.getByLabel("Activity type").selectOption("responses");
  await expect(
    page.getByRole("heading", { name: "No records in this activity view" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show all activity" }).click();
  await page.getByRole("button", { name: "Inspect AR-775" }).click();
  await expect(page.getByRole("dialog")).toContainText("A-1042");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Inspect AR-775" }),
  ).toBeFocused();
  await page.getByRole("tab", { name: /^Evidence/ }).click();
  await page.getByLabel("Find evidence for A-1042").fill("ar-775");
  await expect(page.getByRole("tabpanel").locator(".evidence-row")).toHaveCount(
    1,
  );
  await page.getByLabel("Find evidence for A-1042").fill("AR-801");
  await expect(
    page.getByRole("heading", { name: "No matching evidence" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear evidence search" }).click();
  await expect(page.getByRole("tabpanel").locator(".evidence-row")).toHaveCount(
    3,
  );
  await page.goto("/#/assignments/A-1041/activity");
  await expect(
    page.getByRole("button", { name: "Inspect AR-801" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Inspect AR-775" }),
  ).toHaveCount(0);
  await page.goto("/#/assignments/A-1038/activity");
  await expect(
    page.getByRole("heading", { name: "No records in this activity view" }),
  ).toBeVisible();
  await page.goto("/#/evidence");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Find evidence for A-1042").fill("test");
  await expect(
    page
      .getByRole("region", { name: "Evidence for A-1041" })
      .locator(".evidence-row"),
  ).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("inbox counts follow load state and screen changes move keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  const badge = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: /My Work/ })
    .locator("b");
  const preview = page.getByLabel("Data preview", { exact: true });
  await expect(badge).toHaveText("5");
  await preview.focus();
  for (const state of ["loading", "error"]) {
    await preview.selectOption(state);
    await expect(badge).toHaveText("—");
    await expect(badge).toHaveAttribute(
      "aria-label",
      "Assignment count unavailable",
    );
    await expect(preview).toBeFocused();
  }
  await preview.selectOption("empty");
  await expect(badge).toHaveText("0");
  await preview.selectOption("error");
  await page.getByRole("button", { name: "Retry sample load" }).click();
  await expect(badge).toHaveText("5");
  await expect(preview).toBeFocused();
  await page.getByRole("button", { name: /A-1042.*Review retry/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.getByRole("tab", { name: "Candidate", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "Candidate", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Back to My Work" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.getByRole("button", { name: "Organization", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "One team. Clear responsibility." }),
  ).toBeFocused();
});

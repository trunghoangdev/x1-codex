import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { readSfProjection } from "../src/data/sfReadProjection";
const raw = readFileSync(
  new URL("../public/snapshots/sf-retained-v1.json", import.meta.url),
  "utf8",
);
const sample = readFileSync(
  new URL("../public/snapshots/sf-example-v1.json", import.meta.url),
  "utf8",
);
test("projection distinguishes omitted, unsupported and reported zero without fabricating authority", async () => {
  const view = await readSfProjection(raw, "retained-redacted");
  expect(view.assignment.fields.validator.state).toBe("redacted");
  expect(view.assignment.fields.work_id.state).toBe("not-recorded");
  expect(view.assignment.fields.permission.state).toBe("unsupported");
  expect(view.attempts[0].fields.exit_code).toMatchObject({
    state: "known",
    value: 0,
  });
  expect(view.attempts[0].product.state).toBe("available");
  if (view.attempts[0].product.state === "available")
    expect(view.attempts[0].product.record.fields.bytes_base64url.state).toBe(
      "redacted",
    );
  const synthetic = await readSfProjection(sample, "synthetic");
  expect(synthetic.attempts[0].fields.exit_code.state).toBe("not-recorded");
  expect(synthetic.attempts[0].product.state).toBe("not-recorded");
});
test("projection revision changes with snapshot bytes while source reference remains stable", async () => {
  const first = await readSfProjection(raw, "retained-redacted");
  const changed = JSON.parse(raw);
  changed.attempts[0].ephemeral_cleanup = "different observation";
  const second = await readSfProjection(
    JSON.stringify(changed),
    "retained-redacted",
  );
  expect(second.sourceRevision).toBe(first.sourceRevision);
  expect(second.revision).not.toBe(first.revision);
  expect((await readSfProjection(raw, "retained-redacted")).revision).toBe(
    first.revision,
  );
  const unavailable = JSON.parse(sample);
  unavailable.work_products = [];
  expect(
    (await readSfProjection(JSON.stringify(unavailable), "synthetic"))
      .attempts[1].product.state,
  ).toBe("unavailable");
});
test("read errors are explicit and do not produce assignment state", async () => {
  await expect(readSfProjection("bad json", "synthetic")).rejects.toMatchObject(
    { code: "invalid-json" },
  );
  await expect(
    readSfProjection(JSON.stringify({ version: 99 }), "synthetic"),
  ).rejects.toMatchObject({ code: "unsupported-version" });
  await expect(readSfProjection(raw, "synthetic")).rejects.toMatchObject({
    code: "wrong-origin",
  });
  await expect(
    readSfProjection(" ".repeat(1_000_001), "synthetic"),
  ).rejects.toMatchObject({ code: "too-large" });
  const invalid = JSON.parse(raw);
  invalid.attempts[0].state = { value: "admitted" };
  await expect(
    readSfProjection(JSON.stringify(invalid), "retained-redacted"),
  ).rejects.toMatchObject({ code: "invalid-snapshot" });
});
test("inspection shows independent snapshot identity and field availability", async ({
  page,
}) => {
  await page.goto("/#/demos/sf-retained/20260913T153424Z-eb63b7bd05303482");
  await page
    .getByText("Inspect snapshot identity and field availability", {
      exact: true,
    })
    .click();
  const context = page.getByRole("region", { name: "Read projection context" });
  await expect(
    context.getByText("Projection revision:", { exact: false }),
  ).toBeVisible();
  await expect(
    context.getByText("Validator: redacted", { exact: false }),
  ).toBeVisible();
  await expect(
    context.getByText("Effective permission: unsupported", { exact: false }),
  ).toBeVisible();
  await expect(
    context.getByText("Process exit status: 0", { exact: true }),
  ).toBeVisible();
});
test("unavailable browser digest keeps inspection usable with an explicit unknown revision", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window.crypto, "subtle", { value: undefined }),
  );
  await page.goto("/#/demos/sf-retained/20260913T153424Z-eb63b7bd05303482");
  await page
    .getByText("Inspect snapshot identity and field availability", {
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Projection revision: unavailable", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Work product", exact: true }),
  ).toBeVisible();
});

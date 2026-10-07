import { test, expect } from "@playwright/test";
import {
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
  contributionCheckpointKey,
} from "../src/data/contributionCheckpoint";
import { emptyContribution } from "../src/data/humanContribution";
import {
  submitContributionCommand,
  commandBlocksEditing,
  resolveContributionCommand,
  projectContributionCommand,
} from "../src/data/contributionCommand";
import {
  receiveContribution,
  assessContribution,
  reviseContribution,
} from "../src/data/humanContribution";
const ready = () => ({
  contributions: [
    {
      ...emptyContribution().contributions[0],
      body: "Guide",
      note: "scope",
      citesInput: true,
    },
  ],
});
test("validated checkpoints preserve uncertainty and immutable revision relationships", () => {
  const unknown = submitContributionCommand(
    ready(),
    "unknown",
    new Date().toISOString(),
  );
  const restored = parseContributionCheckpoint(
    encodeContributionCheckpoint(unknown),
  ).state;
  expect(restored).toEqual(unknown);
  expect(commandBlocksEditing(restored)).toBe(true);
  expect(
    submitContributionCommand(restored, "projected", new Date().toISOString()),
  ).toBe(restored);
  const admitted = resolveContributionCommand(
    restored,
    "admitted",
    new Date().toISOString(),
  );
  expect(
    parseContributionCheckpoint(encodeContributionCheckpoint(admitted)).state,
  ).toEqual(admitted);
  const delivered = projectContributionCommand(admitted);
  const assessed = assessContribution(
    receiveContribution(delivered, new Date().toISOString()),
    new Date().toISOString(),
  );
  const second = reviseContribution(assessed);
  expect(
    parseContributionCheckpoint(encodeContributionCheckpoint(second)).state,
  ).toEqual(second);
  const revised = { ...second, contributions: second.contributions.map(c => c.version === 2 ? {...c, body: "Revision", note: "Responds to assessment", citesInput: true} : c) };
  const finished = receiveContribution(submitContributionCommand(revised, "projected", new Date().toISOString()), new Date().toISOString());
  expect(parseContributionCheckpoint(encodeContributionCheckpoint(finished)).state).toEqual(finished);
  const corrupt = JSON.parse(encodeContributionCheckpoint(unknown));
  corrupt.state.commands[0].projected = true;
  expect(() => parseContributionCheckpoint(JSON.stringify(corrupt))).toThrow();
  corrupt.state.commands[0].projected = false;
  corrupt.state.commands[0].idempotencyKey = "changed";
  expect(() => parseContributionCheckpoint(JSON.stringify(corrupt))).toThrow();
  const bad = JSON.parse(encodeContributionCheckpoint(assessed));
  bad.state.contributions[0].receipt.deliveryId = "wrong";
  expect(() => parseContributionCheckpoint(JSON.stringify(bad))).toThrow();
  expect(() => parseContributionCheckpoint("{")).toThrow();
  expect(() =>
    parseContributionCheckpoint(JSON.stringify({ format: "future" })),
  ).toThrow();
});
for (const width of [390, 1440])
  test(`explicit save review restore and corrupt recovery ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
    );
    await page.getByLabel("Contribution text").fill("Checkpoint guide.");
    await page
      .getByLabel("Delivery note", { exact: true })
      .fill("Checkpoint scope.");
    await page.getByRole("checkbox").check();
    await page
      .getByText("Command delivery simulation", { exact: true })
      .click();
    await page.getByLabel("Submission result").selectOption("unknown");
    await page.getByRole("button", { name: "Review delivery" }).click();
    await page.getByRole("button", { name: "Record local delivery" }).click();
    const recovery = page.getByRole("region", {
      name: "Knowledge contribution recovery",
    });
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await recovery
      .getByRole("button", {
        name: "Save contribution checkpoint",
        exact: true,
      })
      .click();
    await recovery
      .getByRole("button", { name: "Confirm save checkpoint", exact: true })
      .click();
    await expect(recovery.getByRole("status")).toContainText(
      "Checkpoint saved",
    );
    await page.reload();
    await expect(page.getByLabel("Contribution text")).toHaveValue("");
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await recovery
      .getByRole("button", { name: "Review saved contribution" })
      .click();
    await expect(recovery.getByText(/Latest command: unknown/)).toBeVisible();
    await recovery.getByRole("button", { name: "Cancel restore" }).click();
    await expect(page.getByLabel("Contribution text")).toHaveValue("");
    await recovery
      .getByRole("button", { name: "Review saved contribution" })
      .click();
    await recovery
      .getByRole("button", { name: "Confirm restore contribution" })
      .click();
    await expect(page.locator("#human-command-status-heading")).toBeFocused();
    await expect(page.getByLabel("Contribution text")).toHaveCount(0);
    await expect(
      page.getByRole("region", { name: "Current contribution task" }),
    ).toContainText("do not submit again");
    await page.evaluate(
      (key) => localStorage.setItem(key, '{"format":"future"}'),
      contributionCheckpointKey,
    );
    await recovery
      .getByRole("button", { name: "Review saved contribution" })
      .click();
    await expect(recovery.getByRole("status")).toContainText(
      "unavailable or invalid",
    );
    await expect(page.getByLabel("Contribution text")).toHaveCount(0);
    await recovery
      .getByRole("button", { name: "Remove saved checkpoint", exact: true })
      .click();
    await recovery
      .getByRole("button", { name: "Confirm remove checkpoint" })
      .click();
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        contributionCheckpointKey,
      ),
    ).toBeNull();
  });

test('blocked checkpoint storage preserves current draft',async({page})=>{
 await page.goto('/#/organizations/knowledge/contributions/K-01-H?persona=leo');
 await page.getByLabel('Contribution text').fill('Keep this unsaved draft.');
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked');};});
 await page.getByText('Save or restore Knowledge contribution',{exact:true}).click();
 await page.getByRole('button',{name:'Save contribution checkpoint',exact:true}).click();
 await page.getByRole('button',{name:'Confirm save checkpoint',exact:true}).click();
 await expect(page.getByRole('region',{name:'Knowledge contribution recovery'}).getByRole('status')).toContainText('Current work is unchanged');
 await expect(page.getByLabel('Contribution text')).toHaveValue('Keep this unsaved draft.');
});

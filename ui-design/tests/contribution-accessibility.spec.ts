import { test, expect, firefox } from "@playwright/test";
import { emptyContribution } from "../src/data/humanContribution";
import { encodeContributionCheckpoint } from "../src/data/contributionCheckpoint";

for (const browserName of ["chromium", "firefox"] as const) {
  for (const width of [320, 1440]) {
    test(`${browserName} contribution recovery keyboard and long text ${width}`, async ({
      page: chromiumPage,
    }) => {
      const browser =
        browserName === "firefox"
          ? await firefox.launch({ channel: "firefox" })
          : undefined;
      const page = browser
        ? await browser.newPage({ baseURL: "http://127.0.0.1:4173" })
        : chromiumPage;
      try {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(
          "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
        );
        const body = page.getByLabel("Contribution text");
        await body.fill("LongUnbrokenReference".repeat(150));
        await page.keyboard.press("Tab");
        await expect(
          page.getByLabel("Delivery note", { exact: true }),
        ).toBeFocused();
        await page.keyboard.type("Review scope");
        await page.keyboard.press("Tab");
        await page.keyboard.press("Space");
        await page
          .getByRole("button", { name: "Review delivery", exact: true })
          .focus();
        await page.keyboard.press("Enter");
        await expect(
          page.locator("#human-delivery-confirm-heading"),
        ).toBeFocused();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.getByRole("button", { name: "Keep editing" }).focus();
        await page.keyboard.press("Enter");
        await expect(body).toBeFocused();
        const disclosure = page.getByText(
          "Save or restore Knowledge contribution",
          { exact: true },
        );
        await disclosure.focus();
        await page.keyboard.press("Enter");
        const save = page.getByRole("button", {
          name: "Save contribution checkpoint",
          exact: true,
        });
        await save.focus();
        await page.keyboard.press("Enter");
        await expect(
          page.getByRole("heading", { name: "Review checkpoint save" }),
        ).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(
          page.getByRole("button", { name: "Confirm save checkpoint" }),
        ).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(
          page.getByRole("heading", {
            name: "Contribution checkpoint",
            exact: true,
          }),
        ).toBeFocused();
        await page
          .getByRole("button", { name: "Review saved contribution" })
          .focus();
        await page.keyboard.press("Enter");
        await expect(
          page.getByRole("heading", { name: "Restore preview" }),
        ).toBeFocused();
        await page.getByRole("button", { name: "Cancel restore" }).focus();
        await page.keyboard.press("Enter");
        await expect(
          page.getByRole("heading", {
            name: "Contribution checkpoint",
            exact: true,
          }),
        ).toBeFocused();
        await page
          .getByText("Move contribution between machines", { exact: true })
          .focus();
        await page.keyboard.press("Enter");
        await page
          .getByLabel("Import contribution file")
          .setInputFiles({
            name: "empty.json",
            mimeType: "application/json",
            buffer: Buffer.from(
              encodeContributionCheckpoint(emptyContribution()),
            ),
          });
        await expect(
          page.getByRole("heading", { name: "Import preview" }),
        ).toBeFocused();
        await page.getByRole("button", { name: "Cancel import" }).focus();
        await page.keyboard.press("Enter");
        await expect(
          page.getByRole("heading", {
            name: "Contribution checkpoint",
            exact: true,
          }),
        ).toBeFocused();
        await expect(body).toHaveValue("LongUnbrokenReference".repeat(150));
        await page
          .getByText("Command delivery simulation", { exact: true })
          .focus();
        await page.keyboard.press("Enter");
        await page.getByLabel("Submission result").selectOption("conflict");
        await page
          .getByRole("button", { name: "Review delivery", exact: true })
          .focus();
        await page.keyboard.press("Enter");
        await page.keyboard.press("Tab");
        await expect(
          page.getByRole("button", { name: "Record local delivery" }),
        ).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(
          page.locator("#human-command-status-heading"),
        ).toBeFocused();
        await expect(
          page.getByRole("region", { name: "Contribution command status" }),
        ).toContainText("Revision conflict");
        await page
          .getByText("Inspect local command envelope", { exact: true })
          .focus();
        await page.keyboard.press("Enter");
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      } finally {
        await browser?.close();
      }
    });
  }
}

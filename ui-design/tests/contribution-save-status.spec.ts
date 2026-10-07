import { test, expect } from "@playwright/test";
import { contributionCheckpointKey } from "../src/data/contributionCheckpoint";
for (const width of [390, 1440])
  test(`visible save status follows editing navigation and restore ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/#/organizations/knowledge/contributions/K-01-H?persona=leo",
    );
    const status = page.getByRole("status", {
      name: "Contribution save status",
    });
    await expect(status).toContainText("Not saved");
    await page.getByLabel("Contribution text").fill("Saved draft.");
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Save contribution checkpoint",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Confirm save checkpoint" }).click();
    await expect(status).toContainText("Current work matches checkpoint");
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await page.getByLabel("Contribution text").fill("Later unsaved draft.");
    await expect(status).toContainText("Unsaved changes");
    await page
      .getByRole("button", { name: "View Organization", exact: true })
      .click();
    await expect(status).toContainText("Unsaved changes");
    await page.reload();
    await expect(status).toContainText(
      "Saved checkpoint available · not restored",
    );
    await page
      .getByText("Save or restore Knowledge contribution", { exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review saved contribution" })
      .click();
    await page.getByRole("button", { name: "Cancel restore" }).click();
    await expect(status).toContainText("not restored");
    await page
      .getByRole("button", { name: "Review saved contribution" })
      .click();
    await page
      .getByRole("button", { name: "Confirm restore contribution" })
      .click();
    await expect(status).toContainText("Current work matches checkpoint");
    await page
      .getByRole("button", { name: "Remove saved checkpoint", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm remove checkpoint" })
      .click();
    await expect(status).toContainText("Not saved");
    await page.evaluate((key) => {
      localStorage.setItem(key, "invalid");
      window.dispatchEvent(new StorageEvent("storage", { key }));
    }, contributionCheckpointKey);
    await expect(status).toContainText("Save status unavailable");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test('receiver receipt and assessment mark a saved exchange as changed',async({page})=>{
 await page.goto('/#/organizations/knowledge/contributions/K-01-H?persona=leo');
 await page.getByLabel('Contribution text').fill('Contribution for receipt.');
 await page.getByLabel('Delivery note',{exact:true}).fill('scope');
 await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Review delivery'}).click();
 await page.getByRole('button',{name:'Record local delivery'}).click();
 await page.getByRole('combobox',{name:'Sample persona',exact:true}).selectOption('maya');
 await page.getByText('Save or restore Knowledge contribution',{exact:true}).click();
 const save=async()=>{
   await page.getByRole('button',{name:'Save contribution checkpoint',exact:true}).click();
   await page.getByRole('button',{name:'Confirm save checkpoint'}).click();
 };
 const status=page.getByRole('status',{name:'Contribution save status'});
 await save();await expect(status).toContainText('Current work matches checkpoint');
 await page.getByRole('button',{name:'Record sample receipt · draft-01'}).click();
 await expect(status).toContainText('Unsaved changes');
 await save();await expect(status).toContainText('Current work matches checkpoint');
 await page.getByRole('button',{name:'Request sample revision · draft-01'}).click();
 await expect(status).toContainText('Unsaved changes');
});

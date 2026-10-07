import { test, expect } from '@playwright/test';
import { validScenarioPath } from '../src/scenarioRoutes';

test('contribution route is scoped to Knowledge contributor', () => {
  expect(validScenarioPath('/organizations/knowledge/contributions/K-01-H?persona=leo')).toBe(true);
  expect(validScenarioPath('/organizations/knowledge/contributions/K-01-H?persona=maya')).toBe(false);
  expect(validScenarioPath('/organizations/large/contributions/K-01-H?persona=sam')).toBe(false);
});
for (const width of [390, 1440]) test(`personal contribution preserves session and context ${width}`, async ({page}) => {
  await page.setViewportSize({width, height: 1000});
  await page.goto('/#/organizations/knowledge/work?persona=leo');
  await page.getByRole('button', {name:'Open contribution · K-01-H'}).click();
  await expect(page.getByRole('region', {name:'Contribution workspace context'})).toBeVisible();
  await expect(page.getByText('Knowledge Operations · Welcome guide', {exact:true})).toBeVisible();
  await page.getByLabel('Contribution text').fill('Contact onboarding with cohort context.');
  await page.getByLabel('Delivery note', {exact:true}).fill('Prepared for editorial review.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', {name:'View workstream · K-01'}).click();
  await expect(page).toHaveURL(/workstreams\/K-01\?persona=leo/);
  await page.goto('/#/organizations/knowledge/work?persona=leo');
  await page.getByRole('button', {name:'Open contribution · K-01-H'}).click();
  await expect(page.getByLabel('Contribution text')).toHaveValue('Contact onboarding with cohort context.');
  await page.getByRole('button', {name:'Review delivery'}).click();
  await page.getByRole('button', {name:'Record local delivery'}).click();
  await page.getByRole('button', {name:'Back to My Work · Leo'}).click();
  await expect(page.getByText('draft-01: delivered locally · awaiting receiver receipt · assessment not recorded')).toBeVisible();
  await page.reload();
  await page.getByRole('button', {name:'Open contribution · K-01-H'}).click();
  await expect(page.getByLabel('Contribution text')).toHaveValue('');
});

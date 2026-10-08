import { test, expect } from "@playwright/test";
import {
  workerProfile,
  facilitatorReadiness,
  workerReadinessSearch,
} from "../src/data/workerReadiness";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { mainOrganization } from "../src/data/organizationScenario";
test("capability declarations, scoped availability and assignment links do not imply verified readiness", () => {
  expect(workerProfile(mainOrganization, "codex").availability.status).toBe(
    "Stale",
  );
  expect(
    workerProfile(mainOrganization, "jamie").capabilities.length,
  ).toBeGreaterThan(0);
  const leo = facilitatorReadiness(knowledgeOrganization, "leo");
  expect(leo.declared).toBe(true);
  expect(leo.profile.availability.status).toBe("Unknown");
  expect(leo.status).toContain("confirmation needed");
  const moreLinks = {
    ...knowledgeOrganization,
    assignments: [
      ...knowledgeOrganization.assignments,
      {
        id: "extra",
        workerId: "leo",
        role: "Facilitator",
        title: "Extra",
        state: "Linked",
      },
    ],
  };
  expect(facilitatorReadiness(moreLinks, "leo").profile.availability).toEqual(
    leo.profile.availability,
  );
  const maya = facilitatorReadiness(knowledgeOrganization, "maya");
  expect(maya.status).toBe("Facilitation capability not declared");
  expect(maya.profile.availability.status).toBe("Limited");
  expect(maya.profile.availability.scope).toContain("review only");
  expect(
    facilitatorReadiness(knowledgeOrganization, "research").status,
  ).toContain("human facilitator requirement");
  expect(workerProfile(mainOrganization, "leo").capabilities).toEqual([]);
  expect(workerProfile(mainOrganization, "leo").availability.status).toBe(
    "Unknown",
  );
  expect(workerReadinessSearch(knowledgeOrganization, "leo")).toContain(
    "Practical learning facilitation",
  );
});
for (const width of [390, 1280])
  test(`worker discovery, profile and candidate context return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/organizations/knowledge/workers?persona=leo");
    await page
      .getByRole("searchbox", { name: "Search workers" })
      .fill("Practical learning facilitation");
    const leo = page.getByRole("article", { name: "Leo Rivera", exact: true });
    await expect(leo).toBeVisible();
    await expect(leo.getByText(/Availability: Unknown/)).toBeVisible();
    await expect(
      page.getByRole("article", { name: "Maya Patel", exact: true }),
    ).toHaveCount(0);
    await leo
      .getByRole("button", { name: "Open worker · Leo Rivera", exact: true })
      .click();
    const profile = page.getByRole("region", {
      name: "Worker capabilities and availability",
    });
    await expect(
      profile.getByText("Practical learning facilitation", { exact: true }),
    ).toBeVisible();
    await expect(
      profile.getByText(/No observed facilitation evidence/i),
    ).toBeVisible();
    await page.evaluate(
      () =>
        (location.hash = "/organizations/knowledge/workshop/K-02?persona=leo"),
    );
    const candidates = page.getByRole("region", {
      name: "Facilitator candidate review",
    });
    await expect(candidates.getByRole("article")).toHaveCount(4);
    await expect(
      candidates.getByText(/no automatic ranking or assignment/),
    ).toBeVisible();
    await candidates
      .getByRole("button", {
        name: "Inspect profile · Maya Patel",
        exact: true,
      })
      .click();
    await expect(profile.getByText(/Availability: Limited/)).toBeVisible();
    await page
      .getByRole("button", { name: /Back to scenario context/ })
      .click();
    await expect(candidates).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Local workshop lifecycle" })
        .getByRole("heading", {
          name: "Facilitator allocation pending",
          exact: true,
        }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  });

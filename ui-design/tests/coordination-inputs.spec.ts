import { test, expect } from "@playwright/test";
import {
  mainOrganization,
  largeOrganization,
} from "../src/data/organizationScenario";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { inputAttention } from "../src/data/coordination";
test("input relationships are explicit and stay scoped", () => {
  for (const s of [
    mainOrganization,
    largeOrganization,
    knowledgeOrganization,
  ]) {
    expect(new Set(s.dependencies.map((d) => d.id)).size).toBe(
      s.dependencies.length,
    );
    for (const d of s.dependencies) {
      expect(s.streams.map((w) => w.id)).toContain(d.streamId);
      expect(
        s.assignments.find((a) => a.id === d.receiverAssignmentId)?.streamId,
      ).toBe(d.streamId);
      if ("assignmentId" in d.provider) {
        const provider = d.provider;
        expect(
          s.assignments.find((a) => a.id === provider.assignmentId)?.streamId,
        ).toBe(d.streamId);
        expect(provider.assignmentId).not.toBe(d.receiverAssignmentId);
      } else {
        expect(s.workers.map((w) => w.id)).toContain(d.provider.workerId);
        expect(s.roles.map((r) => r.name)).toContain(d.provider.role);
      }
      expect(d.receipt).toBe("unconfirmed");
    }
    for (const p of s.parallelWork) {
      expect(new Set(p.assignmentIds).size).toBe(p.assignmentIds.length);
      for (const id of p.assignmentIds)
        expect(s.assignments.find((a) => a.id === id)?.streamId).toBe(
          p.streamId,
        );
    }
  }
  expect(inputAttention(mainOrganization)).toHaveLength(0);
  expect(inputAttention(largeOrganization)).toHaveLength(0);
  expect(inputAttention(knowledgeOrganization).map((a) => a.target.id)).toEqual(
    ["K-02-E"],
  );
  const allocated = knowledgeOrganization.dependencies[0];
  expect(allocated.provider).toEqual({ assignmentId: "K-02-C" });
  expect(allocated.availability).toBe("missing");
  expect(
    knowledgeOrganization.assignments.find(
      (a) => a.id === allocated.receiverAssignmentId,
    )?.workerId,
  ).toBe("maya");
});
for (const width of [390, 1440]) {
  test(`knowledge input inspection and return ${width}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/organizations/knowledge/work?persona=maya");
    await page
      .getByText("Inspect dependency records · K-02-E", { exact: true })
      .click();
    const region = page.getByRole("region", {
      name: "Coordination inputs",
      exact: true,
    });
    const brief = region.getByRole("article", {
      name: "Workshop coordinator brief",
      exact: true,
    });
    await expect(brief).toContainText("Input missing");
    await expect(brief).toContainText("Leo Rivera");
    await expect(brief).toContainText("Maya Patel");
    await brief
      .getByRole("button", {
        name: "Inspect supplying assignment · K-02-C",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Confirm workshop brief",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Sample persona", exact: true }),
    ).toHaveValue("maya");
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "My Work · Maya Patel", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Inspect my assignment · K-02-E",
        exact: true,
      })
      .click();
    await brief
      .getByRole("button", {
        name: "Inspect supplying assignment · K-02-C",
        exact: true,
      })
      .click();
    await brief
      .getByRole("button", {
        name: "Inspect receiving assignment · K-02-E",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Confirm workshop brief",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Review workshop outline",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "My Work · Maya Patel", exact: true }),
    ).toBeVisible();
    await page
      .getByText("Inspect dependency records · K-02-E", { exact: true })
      .click();
    await brief
      .getByRole("button", {
        name: "Inspect provider worker · Leo Rivera",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("heading", { name: "Leo Rivera", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await page
      .getByRole("button", { name: "View shared goal · K-02", exact: true })
      .click();
    await expect(brief).toContainText("Receiver allocation represented");
    await expect(
      page.getByRole("button", {
        name: "Inspect scenario assignment · K-02-F",
        exact: true,
      }),
    ).toBeVisible();
    await page.goto("/#/organizations/knowledge/workstreams/K-01?persona=maya");
    await expect(
      region.getByRole("article", { name: "Parallel work", exact: true }),
    ).toContainText("may progress in parallel");
    await expect(
      region.getByText("Input missing", { exact: true }),
    ).toHaveCount(0);
    await page.goto("/#/organizations/knowledge?persona=maya");
    await page.getByRole("button", { name: "1 Input", exact: true }).click();
    await expect(page).toHaveURL(/category=input/);
    await expect(
      page.getByRole("heading", {
        name: "Waiting input · Workshop coordinator brief",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(/Workshop facilitation responsibility/),
    ).toHaveCount(0);
    await page
      .getByRole("button", {
        name: "Inspect assignment · K-02-E",
        exact: true,
      })
      .click();
    await expect(brief).toContainText("Input missing");
    await expect(brief).toContainText("Delivery / receipt: Unconfirmed");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.reload();
    await expect(brief).toContainText("Input missing");
    expect(errors).toEqual([]);
  });
  test(`software represented input does not confirm handoff ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/#/workstreams/WS-01");
    const region = page.getByRole("region", {
      name: "Coordination inputs",
      exact: true,
    });
    await expect(region).toContainText("Sample input represented");
    await expect(region).toContainText("No provider assignment represented");
    await expect(region).toContainText("Delivery / receipt: Unconfirmed");
    await region
      .getByRole("button", {
        name: "Inspect provider worker · Codex worker",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to Workstream", exact: true })
      .click();
    await region
      .getByRole("button", {
        name: "Inspect receiving assignment · A-1042",
        exact: true,
      })
      .click();
    await region
      .getByRole("button", {
        name: "Inspect provider worker · Codex worker",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Back to Assignment", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Submit assessment", exact: true })
      .click();
    await page
      .getByLabel("Decision rationale")
      .fill(
        "The sample observations remain insufficient; no confirmed delivery is implied.",
      );
    await page
      .getByLabel("Assessment conclusion", { exact: true })
      .selectOption("Insufficient evidence");
    await page
      .getByRole("button", { name: "Record assessment", exact: true })
      .click();
    await expect(region).toContainText(
      "Local response recorded; this does not establish input delivery or receipt",
    );
    await page
      .getByRole("button", { name: "Back to Workstream", exact: true })
      .click();
    await expect(region).toContainText("Delivery / receipt: Unconfirmed");
    await expect(region).toContainText(
      "A revised candidate requires a new assessment",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

import {
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
} from "../src/data/authorizedUse";
import { proposeReviewHandoff } from "../src/data/reviewHandoffs";
import {
  proposeKnowledgeHandoff,
  respondKnowledgeHandoff,
} from "../src/data/knowledgeHandoff";
import { test, expect } from "@playwright/test";
import { personalNextSteps } from "../src/data/personalNextSteps";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import { recordKnowledgeResponsibility } from "../src/data/knowledgeResponsibility";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import { recordCaseEvent } from "../src/data/caseLifecycle";
import { recordWorkshopEvent } from "../src/data/workshop";
import { recordException } from "../src/data/exceptionLoop";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
const at = "2026-10-01T12:00:00Z";
const initial = (): KnowledgeWorkspace => ({
  contribution: emptyContribution(),
  brief: { versions: [] },
  adoptions: [],
});
function delivered(c = emptyContribution()) {
  return submitContributionCommand(
    {
      ...c,
      contributions: c.contributions.map((v, i) =>
        i === c.contributions.length - 1
          ? {
              ...v,
              body: "Exact welcoming guide contribution",
              note: "Current input scope",
              citesInput: true,
            }
          : v,
      ),
    },
    "projected",
    at,
  );
}
const group = (s: KnowledgeWorkspace, actor: string, id: string) =>
  personalNextSteps(s, actor).find((x) => x.id === id)?.group;
test("preparation, receipt, independent review and waiting are derived without inventing work", () => {
  let s = initial();
  expect(group(s, "leo", "contribution")).toBe("work");
  expect(group(s, "maya", "editorial")).toBe("waiting");
  expect(personalNextSteps(s, "sam")).toEqual([]);
  s = { ...s, contribution: delivered() };
  expect(group(s, "leo", "contribution")).toBe("waiting");
  expect(group(s, "maya", "editorial")).toBe("work");
  s = { ...s, contribution: receiveContribution(s.contribution, at) };
  expect(group(s, "maya", "editorial")).toBe("review");
  s = { ...s, contribution: assessContribution(s.contribution, at) };
  expect(group(s, "leo", "contribution")).toBe("work");
  expect(group(s, "maya", "editorial")).toBe("waiting");
  s = {
    ...s,
    contribution: reassessContribution(
      receiveContribution(delivered(reviseContribution(s.contribution)), at),
      "Suitable for stated scope",
      "Current scope checked",
      at,
    ),
  };
  expect(group(s, "leo", "contribution")).toBeUndefined();
  expect(group(s, "maya", "editorial")).toBeUndefined();
  const frozen = JSON.stringify(s);
  const restored = parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(s)).state;
  expect(personalNextSteps(restored, "maya")).toEqual(
    personalNextSteps(s, "maya"),
  );
  expect(JSON.stringify(s)).toBe(frozen);
});
test("acceptance gate points to the offer and exception ownership follows exact responses", () => {
  let s = initial();
  s.contribution = recordKnowledgeResponsibility(
    s.contribution,
    "Offer responsibility",
    "owner",
    "Explicit scope",
    at,
  );
  expect(group(s, "leo", "contribution-acceptance")).toBe("work");
  expect(group(s, "owner", "contribution-acceptance")).toBe("waiting");
  expect(group(s, "leo", "contribution")).toBeUndefined();
  const context = {
    brief: s.brief,
    contribution: s.contribution,
    caseEvents: [],
    workshopEvents: [],
  };
  let events = recordException(
    [],
    context,
    "owner",
    "Open exception",
    "",
    "Investigate brief",
    at,
    "workshop-brief-input",
  );
  s = { ...s, exceptionEvents: events };
  expect(group(s, "owner", "exception:exception-1")).toBe("work");
  expect(group(s, "leo", "exception:exception-1")).toBeUndefined();
  events = recordException(
    events,
    context,
    "owner",
    "Offer handling",
    "exception-1",
    "Named handler",
    at,
    "",
    "leo",
  );
  s = { ...s, exceptionEvents: events };
  expect(group(s, "leo", "exception:exception-1")).toBe("work");
  expect(group(s, "owner", "exception:exception-1")).toBe("waiting");
});
test("workshop review follows actual allocation, not authored role labels", () => {
  let s = initial();
  s.brief = receiveBrief(
    deliverBrief(s.brief, "Tuesday new members workshop", at),
    1,
    at,
  );
  const cc = { brief: s.brief, contribution: s.contribution };
  let cases = recordCaseEvent(
    [],
    cc,
    "leo",
    "Accept responsibility",
    "Accepted",
    at,
  );
  cases = recordCaseEvent(
    cases,
    cc,
    "leo",
    "Propose resolution",
    "Current input",
    at,
  );
  cases = recordCaseEvent(
    cases,
    cc,
    "maya",
    "Approve resolution",
    "Exact receipt checked",
    at,
  );
  s.caseEvents = cases;
  const wc = { ...cc, caseEvents: cases };
  let events = recordWorkshopEvent(
    [],
    wc,
    "owner",
    "Offer facilitation",
    "Explicit reviewer",
    at,
    { facilitator: "maya", reviewer: "leo" },
  );
  events = recordWorkshopEvent(
    events,
    wc,
    "maya",
    "Accept facilitation",
    "Accepted",
    at,
  );
  s.workshopEvents = events;
  expect(group(s, "maya", "workshop")).toBe("work");
  expect(group(s, "leo", "workshop")).toBe("waiting");
  events = recordWorkshopEvent(
    events,
    wc,
    "maya",
    "Submit preparation",
    "Exercise and criterion",
    at,
  );
  s.workshopEvents = events;
  expect(group(s, "leo", "workshop")).toBe("review");
  expect(group(s, "maya", "workshop")).toBe("waiting");
  events = recordWorkshopEvent(
    events,
    wc,
    "leo",
    "Preparation ready",
    "Ready",
    at,
  );
  s.workshopEvents = events;
  expect(group(s, "maya", "workshop")).toBe("work");
  expect(group(s, "leo", "workshop")).toBe("waiting");
});
for (const width of [390, 1440])
  test(`personal next steps lead to exact action and survive filters/recovery ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const s = {
        ...initial(),
        contribution: receiveContribution(delivered(), at),
      },
      raw = encodeKnowledgeCheckpoint(s);
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
      key: knowledgeCheckpointKey,
      raw,
    });
    await page.goto("/#/organizations/knowledge/work?persona=maya");
    await page
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review saved workspace", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    const focus = page.getByRole("region", {
      name: "Personal next steps",
      exact: true,
    });
    await expect(
      focus.getByRole("region", { name: "Ready for your review", exact: true }),
    ).toContainText("Review the received contribution");
    const button = focus.getByRole("button", {
      name: "Continue · editorial",
      exact: true,
    });
    await button.focus();
    await page.keyboard.press("Enter");
    const inbox = page.getByRole("region", {
      name: "Maya contribution inbox",
      exact: true,
    });
    await expect(
      inbox.getByRole("heading", {
        level: 2,
        exact: true,
        name: "Contribution for Maya",
      }),
    ).toBeFocused();
    await page
      .getByLabel("Search my work", { exact: true })
      .fill("no matching assignments");
    await expect(page.locator(".personal-queue-results")).toHaveText(
      "0 of 2 allocated assignments shown",
    );
    await expect(button).toBeVisible();
    await page
      .getByRole("button", { name: "Clear work filters", exact: true })
      .click();
    await expect(
      page.getByRole("region", {
        name: "Assigned work · Waiting for input",
        exact: true,
      }),
    ).toContainText("K-02-E");
    const card = page.getByRole("article", { name: "K-01-E", exact: true });
    const details = card.locator("details").first();
    await expect(details).not.toHaveAttribute("open", "");
    await details.locator("summary").click();
    await expect(details).toContainText("Expected response");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test("handoff acceptance remains work; independent use and goal reviews stay separate", () => {
  let c = recordKnowledgeResponsibility(
    emptyContribution(),
    "Offer responsibility",
    "owner",
    "Bounded guide",
    at,
  );
  c = recordKnowledgeResponsibility(
    c,
    "Accept responsibility",
    "leo",
    "Accepted",
    at,
  );
  c = proposeKnowledgeHandoff(
    c,
    "owner",
    "delegate",
    "Prepare guide",
    "Recipient scope",
    at,
  );
  let s = { ...initial(), contribution: c };
  expect(group(s, "delegate", "contribution-handoff")).toBe("work");
  expect(group(s, "leo", "contribution-handoff")).toBe("waiting");
  c = respondKnowledgeHandoff(
    c,
    "delegate",
    "Accepted",
    "Package acknowledged",
    true,
    at,
  );
  s = { ...s, contribution: c };
  expect(group(s, "delegate", "contribution")).toBe("work");
  expect(group(s, "leo", "contribution")).toBeUndefined();
  expect(
    personalNextSteps(s, "delegate").find((x) => x.id === "contribution")?.path,
  ).toContain("contributionActor=delegate");
  const suitable = reassessContribution(
    receiveContribution(
      delivered(
        reviseContribution(
          assessContribution(receiveContribution(delivered(), at), at),
        ),
      ),
      at,
    ),
    "Suitable for stated scope",
    "Current scope checked",
    at,
  );
  const subject = assessedUseSubject(suitable)!;
  let use = allocateUseMandate(subject, "Cohort", "Bounded use", at)!;
  s = { ...initial(), contribution: suitable, use };
  expect(group(s, "sam", "use")).toBe("review");
  const offered = proposeReviewHandoff(
    use,
    subject,
    "publicationReview",
    "reviewDelegate",
    "Exact review package",
    at,
  );
  expect(group({ ...s, use: offered }, "reviewDelegate", "use")).toBe("work");
  expect(group({ ...s, use: offered }, "sam", "use")).toBeUndefined();
  for (const action of [
    "Suitable",
    "Allowed",
    "Succeeded",
    "No reader evidence",
    "Insufficient evidence",
  ] as const)
    use = recordUseStep(use, subject, action, "Evidence and limits", at);
  expect(group({ ...s, use }, "owner", "use")).toBe("review");
  expect(
    personalNextSteps({ ...s, use }, "owner").find((x) => x.id === "use")
      ?.title,
  ).toBe("Review outcome against organizational goal");
});

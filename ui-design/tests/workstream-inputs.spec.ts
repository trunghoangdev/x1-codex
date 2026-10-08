import { test, expect } from "@playwright/test";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
  requestContributionRevision,
  type HumanContributionState,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import {
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
  startMaterialUse,
  continueUse,
  type AuthorizedUse,
} from "../src/data/authorizedUse";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
import {} from "../src/data/contributionCheckpoint";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
const at = "2026-10-01T12:00:00Z";
function prepare(c: HumanContributionState) {
  return {
    ...c,
    contributions: c.contributions.map((x, i) =>
      i === c.contributions.length - 1
        ? {
            ...x,
            body: `Guide revision ${x.version}: contact onboarding with team and context.`,
            note: `Scope response ${x.version}`,
            citesInput: true,
          }
        : x,
    ),
  };
}
function deliver(c: HumanContributionState) {
  return receiveContribution(
    submitContributionCommand(prepare(c), "projected", at),
    at,
  );
}
function fixture(): KnowledgeWorkspace {
  let c = reviseContribution(
    assessContribution(deliver(emptyContribution()), at),
  );
  c = reassessContribution(
    deliver(c),
    "Suitable for stated scope",
    "Suitable for bounded cohort",
    at,
  );
  let use = allocateUseMandate(
    assessedUseSubject(c),
    "Cohort two",
    "Bounded mandate two",
    at,
  )!;
  for (const action of [
    "Suitable",
    "Allowed",
    "Failed",
    "Insufficient evidence",
  ] as const)
    use = recordUseStep(use, use.subject, action, "Cycle one simulation", at);
  use = continueUse(use, use.subject, "Cohort two", "Second attempt", at);
  use = recordUseStep(use, use.subject, "Suitable", "Second scope review", at);
  use = recordUseStep(use, use.subject, "Allowed", "Second authority", at);
  return { contribution: c, brief: { versions: [] }, adoptions: [], use };
}
function nextVersion(c: HumanContributionState) {
  return reassessContribution(
    deliver(
      reviseContribution(
        requestContributionRevision(c, "New content needed after feedback", at),
      ),
    ),
    "Suitable for stated scope",
    "New exact version reviewed",
    at,
  );
}

import {
  offerGuideInput,
  respondGuideInput,
  assessGuideInput,
  guideInputStatus,
} from "../src/data/workstreamInputs";
import {
  deliverBrief,
  receiveBrief,
  briefHandoffScenario,
} from "../src/data/briefHandoff";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
function offered(workspace = fixture()) {
  const source = assessedUseSubject(workspace.contribution)!;
  return {
    ...workspace,
    brief: {
      ...workspace.brief,
      guideHandoffs: offerGuideInput(
        workspace.brief.guideHandoffs ?? [],
        source,
        "Reviewed guide offered",
        "Internal workshop preparation for cohort two",
        at,
        workspace.brief.versions.length,
      ),
    },
  };
}
function ready(workspace = offered()) {
  let h = workspace.brief.guideHandoffs!;
  h = respondGuideInput(
    h,
    h.at(-1)!.id,
    "Received",
    "Exact source received",
    at,
  );
  h = assessGuideInput(
    h,
    h.at(-1)!.id,
    assessedUseSubject(workspace.contribution),
    "Applicable",
    "Fits workshop preparation",
    at,
  );
  return { ...workspace, brief: { ...workspace.brief, guideHandoffs: h } };
}
test("receipt, applicability and changed source gate downstream brief without rewriting prior lineage", () => {
  let w = offered();
  const source = assessedUseSubject(w.contribution)!;
  expect(guideInputStatus(w.brief.guideHandoffs!, source).ready).toBe(false);
  expect(deliverBrief(w.brief, "No bypass", at, source)).toBe(w.brief);
  expect(
    assessGuideInput(
      w.brief.guideHandoffs!,
      w.brief.guideHandoffs![0].id,
      source,
      "Applicable",
      "Skip receipt",
      at,
    ),
  ).toBe(w.brief.guideHandoffs);
  w = ready(w);
  w = {
    ...w,
    brief: receiveBrief(
      deliverBrief(w.brief, "Workshop using received guide", at, source),
      1,
      at,
    ),
  };
  const original = structuredClone(w.brief.versions[0]);
  expect(original.guideInput?.subject).toBe(source);
  expect(parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(w)).state).toEqual(
    w,
  );
  const changed = { ...w, contribution: nextVersion(w.contribution) };
  const newSource = assessedUseSubject(changed.contribution)!;
  expect(guideInputStatus(changed.brief.guideHandoffs!, newSource).ready).toBe(
    false,
  );
  expect(
    deliverBrief(
      changed.brief,
      "Old receipt cannot unlock new source",
      at,
      newSource,
    ),
  ).toBe(changed.brief);
  expect(
    briefHandoffScenario(
      knowledgeOrganization,
      changed.brief,
      changed.contribution,
    ).assignments.find((a) => a.id === "K-02-E")?.waitingForInput,
  ).toBe(true);
  const refreshed = ready(offered(changed));
  const updated = {
    ...refreshed,
    brief: deliverBrief(
      refreshed.brief,
      "Workshop using new exact guide",
      at,
      newSource,
    ),
  };
  expect(updated.brief.versions[0]).toEqual(original);
  expect(updated.brief.versions[1].guideInput?.subject).toBe(newSource);
  const raw = encodeKnowledgeCheckpoint(updated);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v8");
  expect(parseKnowledgeCheckpoint(raw).state).toEqual(updated);
  expect(
    knowledgeTimeline(updated).filter((e) => e.kind === "Workstream input"),
  ).toHaveLength(6);
  const briefEvent = knowledgeTimeline(updated).find(
    (e) => e.id === "workshop-brief-v2",
  )!;
  expect(briefEvent.references).toContain(
    updated.brief.versions[1].guideInput?.applicabilityId,
  );
  for (const change of [
    (x: any) => (x.state.brief.guideHandoffs[0].response.actor = "Maya"),
    (x: any) =>
      (x.state.brief.guideHandoffs[0].subject =
        x.state.brief.guideHandoffs[1].subject),
    (x: any) =>
      (x.state.brief.versions[1].guideInput.applicabilityId = "wrong"),
    (x: any) => delete x.state.brief.versions[1].guideInput,
    (x: any) => (x.state.brief.versions[1].guideInput.handoffCount = 1),
    (x: any) =>
      (x.state.brief.guideHandoffs[0].applicability[0].sourceId = "wrong"),
    (x: any) => (x.format = "forge.knowledge-workspace.v7"),
  ]) {
    const x = JSON.parse(raw);
    change(x);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
});
test("clarification, decline, cancellation and later applicability decisions preserve history; legacy briefs remain", () => {
  const initial = fixture(),
    source = assessedUseSubject(initial.contribution)!;
  let legacy = {
    ...initial,
    brief: deliverBrief(
      initial.brief,
      "Earlier independent workshop brief",
      at,
    ),
  };
  let w = offered(legacy),
    h = w.brief.guideHandoffs!;
  h = respondGuideInput(
    h,
    h[0].id,
    "Clarification requested",
    "Audience unclear",
    at,
  );
  expect(guideInputStatus(h, source).actor).toBe("Maya");
  expect(
    respondGuideInput(h, h[0].id, "Received", "Rewrite earlier response", at),
  ).toBe(h);
  h = offerGuideInput(
    h,
    source,
    "Clarified audience",
    "Cohort two preparation",
    at,
    1,
  );
  h = respondGuideInput(h, h[1].id, "Declined", "Scope mismatch", at);
  h = offerGuideInput(
    h,
    source,
    "Try corrected purpose",
    "Prepare adapted workshop",
    at,
    1,
  );
  h = respondGuideInput(h, h[2].id, "Cancelled", "Withdraw pending offer", at);
  h = offerGuideInput(
    h,
    source,
    "Resolved purpose",
    "Internal cohort two",
    at,
    1,
  );
  h = respondGuideInput(h, h[3].id, "Received", "Receipt only", at);
  h = assessGuideInput(
    h,
    h[3].id,
    source,
    "Needs adaptation",
    "Add accessible examples",
    at,
  );
  expect(guideInputStatus(h, source).ready).toBe(false);
  h = assessGuideInput(
    h,
    h[3].id,
    source,
    "Applicable",
    "Examples adapted in preparation scope",
    at,
  );
  const applicable = h[3].applicability![1];
  const brief = deliverBrief(
    { ...w.brief, guideHandoffs: h },
    "Prepared with scoped examples",
    at,
    source,
  );
  expect(brief.versions[1].guideInput?.applicabilityId).toBe(applicable.id);
  h = assessGuideInput(
    h,
    h[3].id,
    source,
    "Not applicable",
    "New limitation found",
    at,
  );
  const blocked = { ...brief, guideHandoffs: h };
  expect(
    deliverBrief(blocked, "Cannot reuse prior applicability", at, source),
  ).toBe(blocked);
  expect(
    parseKnowledgeCheckpoint(
      encodeKnowledgeCheckpoint({ ...w, brief: blocked }),
    ).state.brief,
  ).toEqual(blocked);
  expect(
    offerGuideInput(
      h,
      undefined,
      "No suitable source",
      "Internal preparation",
      at,
      2,
    ),
  ).toBe(h);
});
for (const width of [320, 1440])
  test(`Maya hands guide to Leo, separate applicability unlocks brief and source revision blocks reuse ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
      },
      {
        key: knowledgeCheckpointKey,
        raw: encodeKnowledgeCheckpoint(fixture()),
      },
    );
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
    const handoff = page.getByRole("region", {
      name: "Cross-workstream guide input",
      exact: true,
    });
    const decision = async (action: string) => {
      await handoff
        .getByLabel("Input handoff action", { exact: true })
        .selectOption(action);
      if (action === "Offer")
        await handoff
          .getByLabel("Purpose and scope for K-02", { exact: true })
          .fill("Prepare internal cohort two workshop");
      await handoff
        .getByLabel("Cross-workstream decision rationale", { exact: true })
        .fill(`${action}: checked exact material and preparation scope`);
      await handoff
        .getByRole("button", {
          name: "Review input handoff decision",
          exact: true,
        })
        .click();
    };
    await decision("Offer");
    await handoff
      .getByRole("button", {
        name: "Cancel input handoff decision",
        exact: true,
      })
      .click();
    await expect(handoff).toContainText("has not started");
    await decision("Offer");
    await handoff
      .getByRole("button", {
        name: "Record input handoff decision locally",
        exact: true,
      })
      .click();
    await expect(
      handoff.getByRole("heading", {
        name: "Workshop preparation input",
        exact: true,
      }),
    ).toBeFocused();
    await page.evaluate(
      () =>
        (location.hash =
          "/organizations/knowledge/workstreams/K-02?persona=leo"),
    );
    const brief = page.getByRole("region", {
      name: "Workshop brief handoff",
      exact: true,
    });
    await brief
      .getByRole("textbox")
      .fill(
        "Workshop audience, schedule options and next steps using the received access guide.",
      );
    await expect(
      brief.getByRole("button", {
        name: "Deliver brief-v1 locally",
        exact: true,
      }),
    ).toBeDisabled();
    await decision("Received");
    await handoff
      .getByRole("button", {
        name: "Record input handoff decision locally",
        exact: true,
      })
      .click();
    await expect(
      brief.getByRole("button", {
        name: "Deliver brief-v1 locally",
        exact: true,
      }),
    ).toBeDisabled();
    await decision("Needs adaptation");
    await handoff
      .getByRole("button", {
        name: "Record input handoff decision locally",
        exact: true,
      })
      .click();
    await expect(
      brief.getByRole("button", {
        name: "Deliver brief-v1 locally",
        exact: true,
      }),
    ).toBeDisabled();
    await decision("Applicable");
    await handoff
      .getByRole("button", {
        name: "Record input handoff decision locally",
        exact: true,
      })
      .click();
    await brief
      .getByRole("button", { name: "Deliver brief-v1 locally", exact: true })
      .click();
    await expect(brief).toContainText(
      "guide-workshop-handoff-1-applicability-2",
    );
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/work?persona=maya"),
    );
    await page
      .getByLabel("Further revision rationale", { exact: true })
      .fill("Guide source needs revision for new instructions");
    await page
      .getByRole("button", {
        name: "Record further revision request",
        exact: true,
      })
      .click();
    await expect(handoff).toContainText(
      "source changed or has a pending revision",
    );
    await page.evaluate(
      () =>
        (location.hash =
          "/organizations/knowledge/workstreams/K-02?persona=leo"),
    );
    await brief.getByRole("textbox").fill("New brief must wait for new source");
    await expect(
      brief.getByRole("button", {
        name: "Deliver brief-v2 locally",
        exact: true,
      }),
    ).toBeDisabled();
    await expect(brief).toContainText(
      "this brief retains its historical input",
    );
    const recoverySummary = page.getByText(
      "Save or restore whole Knowledge workspace",
      { exact: true },
    );
    if (
      !(await recoverySummary
        .locator("..")
        .evaluate((el) => el.hasAttribute("open")))
    )
      await recoverySummary.click();

    await page
      .getByRole("button", { name: "Save workspace checkpoint", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm save workspace", exact: true })
      .click();
    await page.reload();
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
    await expect(handoff).toContainText(
      "source changed or has a pending revision",
    );
    await expect(brief).toContainText(
      "guide-workshop-handoff-1-applicability-2",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });

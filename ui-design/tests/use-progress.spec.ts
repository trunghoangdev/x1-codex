import { test, expect } from "@playwright/test";
import { useProgress } from "../src/data/useProgress";
import {
  emptyContribution,
  type HumanContributionState,
} from "../src/data/humanContribution";
import {
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
} from "../src/data/authorizedUse";
import { validScenarioPath } from "../src/scenarioRoutes";
const at = "2026-10-07T12:00:00Z";
const contribution: HumanContributionState = {
  contributions: [
    {
      version: 2,
      body: "Guide",
      note: "scope",
      citesInput: true,
      delivery: {
        id: "human-delivery-v2",
        body: "Guide",
        note: "scope",
        input: "input-access-brief-v1",
        at,
      },
      receipt: { id: "human-receipt-v2", deliveryId: "human-delivery-v2", at },
      reassessment: {
        id: "human-reassessment-v2",
        deliveryId: "human-delivery-v2",
        receiptId: "human-receipt-v2",
        at,
        assessor: "Maya",
        conclusion: "Suitable for stated scope",
        rationale: "fits",
      },
    },
  ],
};
test("one projection assigns only current responsibility and preserves stopping boundaries", () => {
  expect(useProgress(emptyContribution()).actor).toBeUndefined();
  expect(useProgress(emptyContribution()).need).toBeUndefined();
  expect(useProgress(contribution).actor).toBe("owner");
  const subject = assessedUseSubject(contribution)!;
  let state = allocateUseMandate(subject, "Cohort", "Mandate", at)!;
  expect(useProgress(contribution, state).actor).toBe("sam");
  const stopped = recordUseStep(
    state,
    subject,
    "Revision needed",
    "Audience unresolved",
    at,
  );
  expect(useProgress(contribution, stopped).actor).toBe("owner");
  expect(useProgress(contribution, stopped).need?.owner).toBe(
    "Demo organization owner",
  );
  state = recordUseStep(state, subject, "Suitable", "fits", at);
  expect(useProgress(contribution, state).stage).toBe("authorization");
  expect(useProgress(contribution, state).actor).toBe("sam");
  const refused = recordUseStep(state, subject, "Refused", "No use", at);
  expect(useProgress(contribution, refused).actor).toBe("owner");
  state = recordUseStep(state, subject, "Allowed", "bounded", at);
  expect(useProgress(contribution, state).actor).toBe("leo");
  const failed = recordUseStep(state, subject, "Failed", "Not rendered", at);
  expect(useProgress(contribution, failed).actor).toBe("maya");
  state = recordUseStep(state, subject, "Succeeded", "rendered", at);
  expect(useProgress(contribution, state).stage).toBe("evidence");
  expect(useProgress(contribution, state).actor).toBe("leo");
  state = recordUseStep(
    state,
    subject,
    "No reader evidence",
    "No observations",
    at,
  );
  expect(useProgress(contribution, state).actor).toBe("maya");
  state = recordUseStep(
    state,
    subject,
    "Insufficient evidence",
    "Missing findings",
    at,
  );
  expect(useProgress(contribution, state).actor).toBe("owner");
  expect(useProgress(contribution, state).need?.title).toBe(
    "Plan next bounded-use cycle",
  );
  const stale = useProgress(emptyContribution(), state);
  expect(stale.stale).toBe(true);
  expect(stale.actor).toBeUndefined();
  expect(stale.need?.category).toBe("Responsibility");
});
test("local use routes do not introduce production workers or foreign scenario inboxes", () => {
  expect(
    validScenarioPath("/organizations/knowledge/use/K-01?persona=maya"),
  ).toBe(true);
  expect(
    validScenarioPath(
      "/organizations/knowledge/work?persona=maya&useActor=sam",
    ),
  ).toBe(true);
  expect(
    validScenarioPath("/organizations/knowledge/work?useActor=foreign"),
  ).toBe(false);
  expect(validScenarioPath("/organizations/large/work?useActor=sam")).toBe(
    false,
  );
  expect(
    validScenarioPath("/organizations/knowledge/workstreams/K-01?useActor=sam"),
  ).toBe(false);
});

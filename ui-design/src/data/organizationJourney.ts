import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
} from "./humanContribution";
import { recordKnowledgeResponsibility } from "./knowledgeResponsibility";
import { submitContributionCommand } from "./contributionCommand";
import {
  offerGuideInput,
  respondGuideInput,
  assessGuideInput,
  currentGuideSubject,
} from "./workstreamInputs";
import { deliverBrief, receiveBrief } from "./briefHandoff";
import { recordCaseEvent, type CaseAction } from "./caseLifecycle";
import {
  recordWorkshopEvent,
  type WorkshopAction,
  type WorkshopActor,
} from "./workshop";
import { recordException, type ExceptionAction } from "./exceptionLoop";
import type { KnowledgeWorkspace } from "./knowledgeCheckpoint";
export { journeyIds } from "./journeyChapters";
export type { JourneyId } from "./journeyChapters";
import type { JourneyId } from "./journeyChapters";
export type JourneyStage = {
  id: JourneyId;
  title: string;
  summary: string;
  point: string;
  state: KnowledgeWorkspace;
};
/** A fictional, monotonic retained history produced through existing transition guards. */
export function organizationJourney(): JourneyStage[] {
  let sequence = 0;
  const time = () =>
    new Date(Date.UTC(2026, 9, 1, 12, 0, sequence++)).toISOString();
  let state: KnowledgeWorkspace = {
    contribution: emptyContribution(),
    brief: { versions: [] },
    adoptions: [],
  };
  const stages: JourneyStage[] = [];
  const keep = (
    id: JourneyId,
    title: string,
    summary: string,
    point: string,
  ) => {
    const frozen = structuredClone(state);
    stages.push({ id, title, summary, point, state: frozen });
  };
  const wc = () => ({
    brief: state.brief,
    contribution: state.contribution,
    caseEvents: state.caseEvents ?? [],
  });
  const workshop = (
    actor: WorkshopActor,
    action: WorkshopAction,
    body: string,
  ) => {
    const before = state.workshopEvents ?? [];
    const next = recordWorkshopEvent(
      before,
      wc(),
      actor,
      action,
      body,
      time(),
      action === "Offer facilitation"
        ? { facilitator: "leo", reviewer: "maya" }
        : undefined,
    );
    if (next === before) throw Error(`Journey transition rejected: ${action}`);
    state = { ...state, workshopEvents: next };
  };
  const exception = (
    actor: WorkshopActor,
    action: ExceptionAction,
    body: string,
    source = "",
  ) => {
    const before = state.exceptionEvents ?? [];
    const next = recordException(
      before,
      { ...wc(), workshopEvents: state.workshopEvents ?? [] },
      actor,
      action,
      "exception-1",
      body,
      time(),
      source,
      action === "Offer handling" ? "leo" : undefined,
    );
    if (next === before) throw Error(`Journey transition rejected: ${action}`);
    state = { ...state, exceptionEvents: next };
  };
  const caseStep = (
    actor: "leo" | "maya",
    action: CaseAction,
    body: string,
  ) => {
    state = {
      ...state,
      caseEvents: recordCaseEvent(
        state.caseEvents ?? [],
        { brief: state.brief, contribution: state.contribution },
        actor,
        action,
        body,
        time(),
      ),
    };
  };
  const deliver = (body: string, note: string) => {
    const c = state.contribution;
    state = {
      ...state,
      contribution: submitContributionCommand(
        {
          ...c,
          contributions: c.contributions.map((v, i) =>
            i === c.contributions.length - 1
              ? { ...v, body, note, citesInput: true }
              : v,
          ),
        },
        "projected",
        time(),
      ),
    };
  };
  keep(
    "purpose",
    "Start with a shared goal",
    "Help new members find reliable guidance and apply it in a practical workshop. K-01 prepares the guide; K-02 turns it into a learning exercise.",
    "A goal gives parallel workstreams a shared purpose. It does not allocate every responsibility or prove results.",
  );
  state = {
    ...state,
    contribution: recordKnowledgeResponsibility(
      state.contribution,
      "Offer responsibility",
      "owner",
      "Prepare a cited welcome guide for the internal cohort; Maya receives and reviews.",
      time(),
    ),
  };
  state = {
    ...state,
    contribution: recordKnowledgeResponsibility(
      state.contribution,
      "Accept responsibility",
      "leo",
      "I accept preparation and delivery within the guide scope.",
      time(),
    ),
  };
  keep(
    "allocation",
    "A person accepts responsibility",
    "The owner offers guide preparation to Leo. Leo accepts the scope; Maya remains the separate receiver and editor.",
    "An offer is distinct from acceptance. Each person enters through My Work and sees the next response expected of them.",
  );
  deliver(
    "Contact the onboarding team about your access question.",
    "Initial guide for the fictional internal cohort.",
  );
  state = {
    ...state,
    contribution: receiveContribution(state.contribution, time()),
  };
  state = {
    ...state,
    contribution: assessContribution(state.contribution, time()),
  };
  state = { ...state, contribution: reviseContribution(state.contribution) };
  deliver(
    "Contact onboarding with your cohort, account and access question. Use the welcome checklist to identify your next step.",
    "Revision responds to Maya’s clarification request.",
  );
  state = {
    ...state,
    contribution: receiveContribution(state.contribution, time()),
  };
  state = {
    ...state,
    contribution: reassessContribution(
      state.contribution,
      "Suitable for stated scope",
      "Clear next steps for the declared internal cohort; publication remains a separate decision.",
      time(),
    ),
  };
  const subject = currentGuideSubject(state.contribution)!;
  let handoffs = offerGuideInput(
    [],
    subject,
    "Use the independently assessed guide in workshop preparation.",
    "New members practice finding the right contact and next step.",
    time(),
  );
  handoffs = respondGuideInput(
    handoffs,
    handoffs[0].id,
    "Received",
    "Exact assessed revision received.",
    time(),
  );
  handoffs = assessGuideInput(
    handoffs,
    handoffs[0].id,
    subject,
    "Applicable",
    "Suitable for the internal practical exercise.",
    time(),
  );
  state = { ...state, brief: { ...state.brief, guideHandoffs: handoffs } };
  state = {
    ...state,
    brief: deliverBrief(
      state.brief,
      "Internal new-member cohort; Tuesday practice session. Exercise: identify the right contact and explain the next step using the received guide.",
      time(),
      subject,
    ),
  };
  state = { ...state, brief: receiveBrief(state.brief, 1, time()) };
  caseStep(
    "leo",
    "Accept responsibility",
    "Coordinate the exact workshop brief and its receipt.",
  );
  caseStep(
    "leo",
    "Propose resolution",
    "Current audience, schedule, guide applicability and exact brief receipt are recorded.",
  );
  caseStep(
    "maya",
    "Approve resolution",
    "Reviewed the separate brief and receipt; this resolves input coordination, not learning outcomes.",
  );
  workshop(
    "owner",
    "Offer facilitation",
    "Offer Leo facilitation with Maya as independent reviewer against the resolved current brief.",
  );
  workshop(
    "leo",
    "Accept facilitation",
    "Accept this exact exercise and cohort scope.",
  );
  workshop(
    "leo",
    "Submit preparation",
    "Plan: participants use the guide to identify the right contact and explain their next step. Simulated exercise only.",
  );
  workshop(
    "maya",
    "Preparation ready",
    "Plan matches the current audience, exercise and criterion. Readiness is not execution.",
  );
  keep(
    "prepared",
    "Roles exchange work and prepare delivery",
    "Leo delivers a guide, Maya requests a revision and reviews the revised version. The guide is received and assessed for K-02. A separate brief case is resolved, and Leo accepts facilitation after independent preparation review.",
    "Delivery, receipt, assessment, applicability and readiness are separate records. The explicit guide exchange connects the two workstreams.",
  );
  workshop(
    "leo",
    "Session failed",
    "Simulated exercise could not be completed because its practice access was unavailable. No successful participation is claimed.",
  );
  const failed = state.workshopEvents!.at(-1)!;
  exception(
    "owner",
    "Open exception",
    "Investigate failed exercise access and coordinate a fresh session.",
    failed.id,
  );
  exception(
    "owner",
    "Offer handling",
    "Leo investigates and coordinates recovery; owner will review the separate resolution response.",
  );
  exception(
    "leo",
    "Accept handling",
    "Accept handling of the failed simulated exercise.",
  );
  workshop(
    "maya",
    "Insufficient evidence",
    "Failed session provides no evidence that members can apply the guide.",
  );
  keep(
    "failure",
    "A failure becomes visible work",
    "The simulated session fails. The owner opens an exception and offers handling to Leo; Leo accepts. Maya records insufficient criterion evidence for the failed cycle.",
    "Failure is retained. An accepted exception responsibility is not a remedy, a successful retry or a completed outcome.",
  );
  workshop(
    "owner",
    "Offer facilitation",
    "Explicitly allocate a second cycle after coordinating available practice access; do not inherit first-cycle readiness.",
  );
  workshop(
    "leo",
    "Accept facilitation",
    "Accept the fresh cycle against the same resolved brief.",
  );
  workshop(
    "leo",
    "Submit preparation",
    "Fresh plan with practice-access check and the same bounded exercise.",
  );
  workshop(
    "maya",
    "Preparation ready",
    "Independently checked the new preparation.",
  );
  workshop(
    "leo",
    "Session succeeded",
    "Simulated second session completed; separate observations and criterion review remain pending.",
  );
  keep(
    "recovery",
    "Recovery requires fresh work",
    "The owner offers a new cycle. Leo accepts and submits fresh preparation; Maya reviews it. A second simulated session succeeds.",
    "A successful retry supplies a remedy for the failed execution. It does not close the exception or prove the learning criterion.",
  );
  exception(
    "leo",
    "Submit resolution",
    "Later cycle executed successfully with fresh acceptance and independent preparation review; request owner review of the exact remedy.",
  );
  exception(
    "owner",
    "Close exception",
    "Reviewed Leo’s response and exact later successful execution. Close this execution exception; learning review remains separate.",
  );
  keep(
    "closed",
    "The owner reviews and closes the exception",
    "Leo submits a resolution response with the exact later successful session attached. The owner reviews and closes the exception independently.",
    "Exception closure resolves this follow-up only. Observations and the workshop learning decision are still pending.",
  );
  workshop(
    "leo",
    "Record observations",
    "Illustrative observer notes: members selected the onboarding contact and explained a next step using the welcome guide. Fictional observations only; no real participant study.",
  );
  keep(
    "evidence",
    "Evidence reaches an independent reviewer",
    "Leo records observations separately from execution. Maya receives the next criterion-review responsibility.",
    "The organization can see who needs to review which exact cycle and evidence. Observations are not self-approved results.",
  );
  workshop(
    "maya",
    "Criterion met in simulation",
    "The fictional observations support the stated criterion for this cohort and cycle only. No real member benefit or organization-wide completion is established.",
  );
  keep(
    "reviewed",
    "Review the result against the purpose",
    "Maya records that the workshop criterion is met in this simulation. The original failure, recovery, exception response and independent review remain visible.",
    "The scoped workshop result contributes evidence to the shared goal. Guide publication and organization-wide success remain separate, unverified decisions.",
  );
  return stages;
}

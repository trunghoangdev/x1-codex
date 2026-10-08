import { ExceptionLoop, ExceptionStatus } from "./ExceptionLoop";
import { exceptionTickets, exceptionProgress, type ExceptionEvent } from "./data/exceptionLoop";
import { OrganizationGoals, OrganizationGoalSummary } from "./OrganizationGoals";
import { PatternStatus } from "./PatternAdoption";
import type { PatternEvent } from "./data/patternAdoption";
import { ChangeImpact, ChangeImpactSummary } from "./ChangeImpact";
import { WorkerReadiness, FacilitatorCandidates } from "./WorkerReadiness";
import { Workshop, WorkshopStatus } from "./Workshop";
import { workshopScenario, workshopProgress, workshopActors, type WorkshopEvent } from "./data/workshop";
import { CaseStatus } from "./CaseLifecycle";
import { caseProgress, caseActors, type CaseEvent } from "./data/caseLifecycle";
import { goalLoopScenario } from "./data/goalLoop";
import { GoalLoop } from "./GoalLoop";
import { assessedUseSubject } from "./data/authorizedUse";
import { WorkstreamInputs } from "./WorkstreamInputs";
import { KnowledgeTimeline } from "./KnowledgeTimeline";
import { KnowledgeHandoff } from "./KnowledgeHandoff";
import { contributionPerformer } from "./data/knowledgeHandoff";
import { KnowledgeResponsibility } from "./KnowledgeResponsibility";
import { ScopeApplicability } from "./ScopeApplicability";
import type { ApplicabilityCheck } from "./data/scopeApplicability";
import { KnowledgeRecovery } from "./KnowledgeRecovery";
import type { KnowledgeWorkspace } from "./data/knowledgeCheckpoint";
import { UseProgress } from "./UseProgress";
import { useProgress, useActors, type UseActor } from "./data/useProgress";
import { AuthorizedUse } from "./AuthorizedUse";
import type { AuthorizedUse as AuthorizedUseState } from "./data/authorizedUse";
import type { AgreementAdoption } from "./data/agreementAdoption";
import { BriefHandoff } from "./BriefHandoff";
import { briefHandoffScenario, type BriefHandoffState } from "./data/briefHandoff";
import { ContributionProgress } from "./ContributionProgress";
import { contributionView } from "./data/contributionView";
import { ContributionRecovery } from "./ContributionRecovery";
import { CoordinationNeeds } from "./CoordinationNeeds";
import { actionableAttention, type CoordinationNeed } from "./data/actionableAttention";
import { ContributionExchange } from "./ContributionExchange";
import { HumanContribution } from "./HumanContribution";
import type { HumanContributionState } from "./data/humanContribution";
import { CollaborationWalkthrough } from "./CollaborationWalkthrough";
import { walkthroughRecords } from "./data/collaborationWalkthrough";
import { OrganizationOperatingContext } from "./OrganizationOperatingContext";
import { OperatingPattern } from "./OperatingPattern";
import { operatingPattern } from "./data/operatingPatterns";
import { OutcomeReviewRecord } from "./OutcomeReviewRecord";
import { WorkstreamAgreement } from "./WorkstreamAgreement";
import { CoordinationCases } from "./CoordinationCases";
import {
  coordinationCases,
  defaultCaseFilters,
  type CaseFilters,
} from "./data/coordinationCases";
import { ExchangeActivity, type ExchangeFilters } from "./ExchangeActivity";
import { DecisionDirectory } from "./DecisionDirectory";
import { WorkflowMap } from "./WorkflowMap";
import { OutcomeReview } from "./OutcomeReview";
import { CoordinationOverview } from "./CoordinationOverview";
import {
  defaultCoordinationFilters,
  type CoordinationFilters,
} from "./data/coordinationOverview";
import { readScenarioWorkFilters } from "./data/scenarioWork";
import { CoordinationInputs } from "./CoordinationInputs";
import { RolesDirectory } from "./RolesDirectory";
import {
  readRolePages,
  rolePageParams,
  type RoleFilters,
} from "./data/roleDirectory";
import { OrganizationOverview } from "./OrganizationOverview";
import { useRef } from "react";
import { resolveScenario, scenarioPersona } from "./data/scenarioRegistry";
import { ScenarioMyWork } from "./ScenarioMyWork";
import { WorkstreamsDirectory } from "./WorkstreamsDirectory";
import { WorkersDirectory } from "./WorkersDirectory";
import {
  defaultStreamFilters,
  type StreamFilters,
} from "./data/workstreamDirectory";
import {
  defaultWorkerFilters,
  type WorkerFilters,
} from "./data/workerDirectory";
import { DetailBackButton } from "./DetailPresentation";
export { validScenarioPath } from "./scenarioRoutes";
import { validScenarioPath } from "./scenarioRoutes";
export function ScenarioWorkspace({
  path,
  onRoute,
  onMain,
  onMyWork,
  contribution,
  onContribution,
  applicabilityChecks,
  onApplicabilityChecks,
  onKnowledgeWorkspace,
  authorizedUse,
  onAuthorizedUse,
  agreementAdoptions,
  onAgreementAdoptions,
  exceptionEvents,
  onExceptionEvents,
  patternEvents,
  onPatternEvents,
  workshopEvents,
  onWorkshopEvents,
  caseEvents,
  onCaseEvents,
  briefHandoff,
  onBriefHandoff,
}: {
  applicabilityChecks: ApplicabilityCheck[];
  onApplicabilityChecks: (checks: ApplicabilityCheck[]) => void;
  onKnowledgeWorkspace: (state: KnowledgeWorkspace) => void;
  authorizedUse?: AuthorizedUseState;
  onAuthorizedUse: (state: AuthorizedUseState) => void;
  agreementAdoptions: AgreementAdoption[];
  onAgreementAdoptions: (h: AgreementAdoption[]) => void;
  exceptionEvents: ExceptionEvent[];
  onExceptionEvents: (events: ExceptionEvent[]) => void;
  patternEvents: PatternEvent[];
  onPatternEvents: (events: PatternEvent[]) => void;
  workshopEvents: WorkshopEvent[];
  onWorkshopEvents: (events: WorkshopEvent[]) => void;
  caseEvents: CaseEvent[];
  onCaseEvents: (events: CaseEvent[]) => void;
  briefHandoff: BriefHandoffState;
  onBriefHandoff: (state: BriefHandoffState) => void;
  contribution: HumanContributionState;
  onContribution: (state: HumanContributionState) => void;
  path: string;
  onRoute: (path: string, replace?: boolean) => void;
  onMain: () => void;
  onMyWork: () => void;
}) {
  const origins = useRef<
    Record<string, { destination: string; source: string }[]>
  >({});
  const impactState = {...(exceptionEvents.length?{exceptionEvents}:{}),...(patternEvents.length?{patternEvents}:{}),contribution,brief:briefHandoff,adoptions:agreementAdoptions,applicability:applicabilityChecks,...(authorizedUse?{use:authorizedUse}:{}),...(caseEvents.length?{caseEvents}:{}),...(workshopEvents.length?{workshopEvents}:{})};
  const workshopContext = {brief:briefHandoff,contribution,caseEvents};
  const workshopView = workshopProgress(workshopEvents,workshopContext);
  const scenario = workshopScenario(goalLoopScenario(briefHandoffScenario(resolveScenario(path)!, briefHandoff, contribution), authorizedUse, assessedUseSubject(contribution)),workshopEvents,workshopContext);
  const useScope = {adoptions:agreementAdoptions,checks:applicabilityChecks};
  const useView = useProgress(contribution, authorizedUse, useScope);
  const caseContext = {brief: briefHandoff, contribution};
  const caseView = caseProgress(caseEvents, caseContext);
  const caseNeed: CoordinationNeed[] = scenario.id === "knowledge" && caseEvents.length && caseView.actor ? [{id: "local-workshop-case", source: "session", category: "Response", title: "Workshop brief case follow-up", detail: caseView.status, owner: caseActors[caseView.actor], responsibility: "Leo coordinates the case; Maya reviews proposed resolution separately.", nextStep: caseView.nextStep, target: {kind: "workstream", id: "K-02"}, destination: `/organizations/knowledge/cases/current-workshop-brief?persona=${scenarioPersona(path)?.workerId ?? "maya"}`}] : [];
  const workshopNeed: CoordinationNeed[] = scenario.id === "knowledge" && workshopEvents.length && workshopView.actor ? [{id:"local-workshop-delivery",source:"session",category:"Response",title:"Workshop delivery follow-up",detail:workshopView.status,owner:workshopActors[workshopView.actor],responsibility:"Scoped local workshop cycle; production capacity unknown.",nextStep:workshopView.nextStep,target:{kind:"workstream",id:"K-02"},destination:`/organizations/knowledge/workshop/K-02?persona=${scenarioPersona(path)?.workerId ?? "maya"}`}] : [];
  const exceptionContext = {...workshopContext,workshopEvents};
  const exceptionNeeds: CoordinationNeed[] = scenario.id === "knowledge" ? exceptionTickets(exceptionEvents).map(id=>exceptionProgress(exceptionEvents,id,exceptionContext)).filter(p=>!p.closed).map(p=>({id:p.first!.ticketId,source:"session",category:"Response",title:"Exception handling follow-up",detail:p.status,owner:p.actor?workshopActors[p.actor]:"Unallocated",responsibility:"Local exception responsibility; separate from authored assignments.",nextStep:p.next,target:{kind:"workstream",id:"K-02"},destination:"/organizations/knowledge/exceptions"})) : [];
  const needs = [...exceptionNeeds,...workshopNeed,...caseNeed,...(scenario.id === "knowledge" && useView.need ? [useView.need] : []), ...actionableAttention(scenario, contribution)];
  const base = `/organizations/${scenario.id}`;
  const persona = scenarioPersona(path);
  const person = scenario.workers.find((w) => w.id === persona?.workerId);
  const qualify = (next: string) =>
    base +
    next +
    (persona
      ? `${next.includes("?") ? "&" : "?"}persona=${persona.workerId}`
      : "");
  const [pathname, query] = path.split("?");
  const suffix = pathname.slice(base.length);
  const params = new URLSearchParams(query);
  const contributionActor = params.get("contributionActor") === "delegate" ? "delegate" : "leo";
  const trailKey = `forge-scenario-return-v1:${scenario.id}:${persona?.workerId ?? ""}`;
  const getTrail = () => {
    const key = `${scenario.id}:${persona?.workerId ?? ""}`;
    if (!origins.current[key]) {
      try {
        const saved: unknown = JSON.parse(
          sessionStorage.getItem(trailKey) ?? "[]",
        );
        origins.current[key] = Array.isArray(saved)
          ? saved
              .filter(
                (entry) =>
                  entry &&
                  typeof entry.destination === "string" &&
                  typeof entry.source === "string" &&
                  entry.destination.startsWith(base + "/") &&
                  entry.source.split("?")[0] !== entry.destination &&
                  validScenarioPath(entry.destination) &&
                  resolveScenario(entry.source)?.id === scenario.id &&
                  validScenarioPath(entry.source) &&
                  scenarioPersona(entry.source)?.workerId === persona?.workerId,
              )
              .slice(-24)
          : [];
      } catch {
        origins.current[key] = [];
      }
    }
    return origins.current[key];
  };
  const saveTrail = () => {
    try {
      sessionStorage.setItem(trailKey, JSON.stringify(getTrail()));
    } catch {
      /* Return context still works in memory. */
    }
  };
  const open = (next: string) => {
    const destination = base + next.split("?")[0];
    if (destination === pathname) return;
    const trail = getTrail();
    trail.push({ destination, source: path });
    if (trail.length > 24) trail.shift();
    saveTrail();
    onRoute(qualify(next));
  };
  const openNeed = (item: CoordinationNeed) => {
    if (!item.destination) return open(`/${item.target.kind === "workstream" ? "workstreams" : "assignments"}/${item.target.id}`);
    if (resolveScenario(item.destination)?.id === scenario.id && scenarioPersona(item.destination)?.workerId === persona?.workerId) {
      const [destination, query] = item.destination.slice(base.length).split("?");
      const nextParams = new URLSearchParams(query);
      nextParams.delete("persona");
      return open(destination + (nextParams.size ? `?${nextParams}` : ""));
    }
    onRoute(item.destination);
  };
  const back = () => {
    const trail = getTrail();
    let index = trail.length - 1;
    while (index >= 0 && trail[index].destination !== pathname) index--;
    const assignment = scenario.assignments.find(
      (a) => suffix === `/assignments/${a.id}`,
    );
    const outcomeStream = scenario.streams.find(
      (s) =>
        suffix === `/outcomes/${s.id}` ||
        suffix === `/workflows/${s.id}` ||
        suffix === `/agreements/${s.id}` ||
        suffix === `/patterns/${s.id}`,
    );
    const fallback = suffix === "/workshop/K-02" ? "/workstreams/K-02" :
      (suffix === "/walkthroughs/guide-cycle" || suffix === "/use/K-01")
        ? "/workstreams/K-01"
        : suffix === "/outcome-reviews/guide-review-01"
          ? "/outcomes/K-01"
          : outcomeStream
            ? `/workstreams/${outcomeStream.id}`
            : assignment?.streamId
              ? `/workstreams/${assignment.streamId}`
              : suffix.startsWith("/workers/")
                ? "/workers"
                : suffix.startsWith("/workstreams/")
                  ? "/workstreams"
                  : suffix.startsWith("/cases/")
                    ? "/cases"
                    : "";
    const source = index >= 0 ? trail[index].source : qualify(fallback);
    if (index >= 0) trail.splice(index);
    saveTrail();
    onRoute(source);
  };
  const filter = (kind: string, values: Record<string, string>) => {
    const p = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => {
      if (v && v !== "All" && v !== "all") p.set(k, v);
    });
    onRoute(qualify(`${kind ? `/${kind}` : ""}${p.size ? `?${p}` : ""}`), true);
  };
  const stream = scenario.streams.find(
    (s) => suffix === `/workstreams/${s.id}`,
  );
  const worker = scenario.workers.find((w) => suffix === `/workers/${w.id}`);
  const assignment = scenario.assignments.find(
    (a) => suffix === `/assignments/${a.id}`,
  );
  const links = (ids: string[]) =>
    ids.map((id) => {
      const a = scenario.assignments.find((a) => a.id === id)!;
      return (
        <article className="org-stream-assignment" key={id}>
          <h3>{a.title}</h3>
          <p>
            {a.id} · {a.role} ·{" "}
            {scenario.workers.find((w) => w.id === a.workerId)?.name ??
              "Unassigned"}{" "}
            · {a.id === "K-01-H" ? contributionView(contribution).stage : a.state}
          </p>
          <button
            className="text-link"
            onClick={() => open(`/assignments/${id}`)}
          >
            Inspect scenario assignment · {id}
          </button>
        </article>
      );
    });
  const operatingTools = <>
      {scenario.id === "knowledge" && ["", "/work", "/contributions/K-01-H", "/assignments/K-01-H", "/workstreams/K-01", "/workflows/K-01", "/attention"].includes(suffix) && <KnowledgeResponsibility state={contribution} onChange={onContribution} actor={suffix === "/work" ? (params.get("useActor") ?? params.get("contributionActor") ?? persona?.workerId) : suffix === "/contributions/K-01-H" ? contributionActor : undefined} onActor={actor => onRoute(base + "/work?persona=leo" + (actor === "owner" ? "&useActor=owner" : ""))} />}
      {scenario.id === "knowledge" && ["", "/work", "/contributions/K-01-H", "/assignments/K-01-H", "/workstreams/K-01", "/workflows/K-01", "/attention"].includes(suffix) && <KnowledgeHandoff state={contribution} onChange={onContribution} actor={suffix === "/work" ? (params.get("useActor") ?? params.get("contributionActor") ?? persona?.workerId) : suffix === "/contributions/K-01-H" ? contributionActor : undefined} onActor={actor => onRoute(base + "/work?persona=leo" + (actor === "owner" ? "&useActor=owner" : actor === "delegate" ? "&contributionActor=delegate" : ""))} onContribution={actor => onRoute(base + "/contributions/K-01-H?persona=leo" + (actor === "delegate" ? "&contributionActor=delegate" : ""))} />}
      {scenario.id === "knowledge" && ["", "/work", "/workstreams/K-01", "/workstreams/K-02", "/activity", "/attention", "/contributions/K-01-H"].includes(suffix) && <button className="button secondary" onClick={() => open("/timeline")}>Open Knowledge timeline</button>}
      {scenario.id === "knowledge" && agreementAdoptions.length > 0 && suffix !== "/agreements/K-01" && <section className="panel" aria-label="Adopted K-01 scope"><h2>K-01 · adopted local scope</h2><p>{agreementAdoptions.at(-1)!.versionId} · {agreementAdoptions.at(-1)!.audience}</p><p>Applicability is record-specific; inspect current decisions before reuse. Publication authority is separate.</p><button className="text-link" onClick={() => open("/agreements/K-01")}>Inspect adopted scope and impact</button></section>}
      {scenario.id === "knowledge" && ["", "/workstreams/K-01", "/workflows/K-01", "/outcomes/K-01", "/decisions"].includes(suffix) && <UseProgress contribution={contribution} state={authorizedUse} scope={useScope} onInspect={() => open("/use/K-01")} onInbox={actor => onRoute(base + "/work?persona=" + (["leo","maya"].includes(actor) ? actor : "maya") + "&useActor=" + actor)} />}
      {scenario.id === "knowledge" && ["", "/work", "/attention", "/workstreams/K-02", "/workflows/K-02", "/outcomes/K-02"].includes(suffix) && <WorkshopStatus events={workshopEvents} context={workshopContext} actor={suffix === "/work" ? (params.get("useActor") ?? params.get("contributionActor") ?? persona?.workerId) : undefined} onOpen={() => open("/workshop/K-02")} />}
      {scenario.id === "knowledge" && ["", "/work", "/attention", "/workstreams/K-02", "/workflows/K-02"].includes(suffix) && <CaseStatus events={caseEvents} context={caseContext} actor={suffix === "/work" ? (params.get("useActor") ?? params.get("contributionActor") ?? persona?.workerId) : undefined} onOpen={() => open("/cases/current-workshop-brief")} />}
      {scenario.id === "knowledge" && (suffix === "" || suffix === "/work" || suffix === "/workstreams/K-01" || suffix === "/workstreams/K-02") && <WorkstreamInputs state={briefHandoff} contribution={contribution} onChange={onBriefHandoff} persona={suffix === "/work" && params.get("useActor") && !["leo","maya"].includes(params.get("useActor")!) ? undefined : persona?.workerId} />}
      {scenario.id === "knowledge" && suffix === "/work" && contributionActor !== "delegate" && <UseProgress contribution={contribution} state={authorizedUse} scope={useScope} actor={(params.get("useActor") ?? persona?.workerId ?? "maya") as UseActor} onActor={actor => onRoute(base + "/work?persona=" + (["leo","maya"].includes(actor) ? actor : "maya") + "&useActor=" + actor)} onInspect={() => open("/use/K-01")} />}

      {scenario.id === "knowledge" && ["/workstreams/K-01", "/workstreams/K-02", "/outcomes/K-01", "/outcomes/K-02"].includes(suffix) && <button className="text-link" onClick={()=>open("/goals")}>Inspect linked organization goal</button>}
      {scenario.id === "knowledge" && ["", "/attention", "/workstreams/K-01", "/workstreams/K-02", "/use/K-01", "/workshop/K-02", "/agreements/K-01"].includes(suffix) && <ChangeImpactSummary state={impactState} onOpen={()=>open("/impact")} />}
      {scenario.id === "knowledge" && ["", "/attention", "/workstreams/K-01", "/workstreams/K-02", "/workflows/K-01", "/workflows/K-02", "/use/K-01", "/workshop/K-02"].includes(suffix) && ["K-01","K-02"].filter(id=>!["/workstreams/","/workflows/"].some(prefix=>suffix.startsWith(prefix)) || suffix.endsWith(id)).map(id=><PatternStatus key={id} events={patternEvents} context={impactState} streamId={id} onOpen={()=>open(`/patterns/${id}`)} />)}
      {scenario.id === "knowledge" && ["", "/work", "/attention", "/workstreams/K-02", "/workshop/K-02"].includes(suffix) && <ExceptionStatus events={exceptionEvents} context={exceptionContext} actor={suffix === "/work" ? (params.get("useActor") ?? params.get("contributionActor") ?? persona?.workerId) : undefined} onOpen={()=>open("/exceptions")} />}
      {scenario.id === "knowledge" && suffix === "/work" && contributionActor !== "delegate" && !["owner", "sam", "reviewDelegate", "authorityDelegate", "outcomeDelegate"].includes(params.get("useActor") ?? "") && ["leo", "maya"].includes(persona?.workerId ?? "") && <BriefHandoff contribution={contribution} state={briefHandoff} onChange={onBriefHandoff} persona={persona?.workerId} />}
  </>;
  return (
    <div className="detail-page coordination-workspace">
      {suffix === "/exceptions" ? <><DetailBackButton onClick={back}>Back to scenario context</DetailBackButton><h1 tabIndex={-1}>K-02 · exception handling</h1><ExceptionLoop events={exceptionEvents} context={exceptionContext} onChange={onExceptionEvents} onSource={open}/></> : suffix === "/goals" ? <><DetailBackButton onClick={back}>Back to scenario context</DetailBackButton><h1 tabIndex={-1}>Organization goals and evidence</h1><OrganizationGoals scenario={scenario} state={impactState} onSource={destination=>open(destination.split("?")[0].slice(base.length))}/></> : suffix === "/impact" ? <><DetailBackButton onClick={back}>Back to scenario context</DetailBackButton><h1 tabIndex={-1}>Source and scope impact</h1><ChangeImpact state={impactState} onSource={destination=>open(destination.split("?")[0].slice(base.length))} /></> : suffix === "/workshop/K-02" ? <><DetailBackButton onClick={back}>Back to scenario context</DetailBackButton><h1 tabIndex={-1}>K-02 · workshop delivery</h1><button className="text-link" onClick={() => open("/cases/current-workshop-brief")}>Inspect brief coordination case</button><FacilitatorCandidates scenario={scenario} onWorker={id=>open(`/workers/${id}`)} /><Workshop events={workshopEvents} context={workshopContext} onChange={onWorkshopEvents}/></> : suffix === "/use/K-01" ? <><DetailBackButton onClick={back}>Back to scenario context</DetailBackButton><h1 tabIndex={-1}>Bounded-use responsibility and records</h1><UseProgress contribution={contribution} state={authorizedUse} scope={useScope} inspectLabel="Inspect K-01 workstream" onInspect={() => open("/workstreams/K-01")} onInbox={actor => onRoute(base + "/work?persona=" + (["leo","maya"].includes(actor) ? actor : "maya") + "&useActor=" + actor)} /><AuthorizedUse contribution={contribution} state={authorizedUse} scope={useScope} onChange={onAuthorizedUse} onScope={() => open("/agreements/K-01")} />{authorizedUse && <GoalLoop state={authorizedUse} subject={assessedUseSubject(contribution)} onChange={onAuthorizedUse} />}</> : suffix === "/work" && contributionActor === "delegate" ? <><DetailBackButton onClick={back}>Back to scenario context</DetailBackButton><h1 tabIndex={-1}>My Work · Demo delegate</h1><p>{contributionPerformer(contribution) === "delegate" ? "1 local contribution responsibility · K-01-H. Inspect the accepted handoff and continue contribution preparation above." : "No effective contribution responsibility. Inspect any pending handoff above; proposal alone does not transfer ownership."}</p><p>This local principal is separate from authored worker membership and counts.</p></> : suffix === "/work" && ["owner", "sam", "reviewDelegate", "authorityDelegate", "outcomeDelegate"].includes(params.get("useActor") ?? "") ? <><DetailBackButton onClick={back}>Back to scenario context</DetailBackButton><h1 tabIndex={-1}>My Work · {useActors[params.get("useActor") as UseActor]}</h1><p>Local demo principal only. This principal can inspect explicitly local offers and use responsibilities. No authored worker membership or production authority is inferred. Select Leo or Maya above to inspect their represented personal work.</p></> : suffix === "/contributions/K-01-H" ? (
        <HumanContribution state={contribution} onChange={onContribution} actor={contributionActor}
          onBack={() => onRoute(base + "/work?persona=leo" + (contributionActor === "delegate" ? "&contributionActor=delegate" : ""))}
          workspace={{ onOrganization: () => onRoute(qualify("")), onWorkstream: () => open("/workstreams/K-01") }} />
      ) : suffix === "/walkthroughs/guide-cycle" ? (
        <CollaborationWalkthrough
          scenario={scenario}
          recordId={params.get("cycleRecord") ?? walkthroughRecords[0].id}
          onSelect={(id) =>
            filter("walkthroughs/guide-cycle", { cycleRecord: id })
          }
          onBack={back}
          onSource={open}
        />
      ) : suffix.startsWith("/patterns/") ? (
        <OperatingPattern
          events={patternEvents}
          context={impactState}
          onEvents={onPatternEvents}
          scenario={scenario}
          streamId={suffix.split("/")[2]}
          onBack={back}
          onSource={open}
        />
      ) : suffix === "/outcome-reviews/guide-review-01" ? (
        <OutcomeReviewRecord
          scenario={scenario}
          onBack={back}
          onSource={open}
        />
      ) : suffix === "/agreements/K-01" ? (
        <WorkstreamAgreement
          applicabilityCount={applicabilityChecks.length}
          applicability={<ScopeApplicability adoptions={agreementAdoptions} checks={applicabilityChecks} context={{contribution,...(authorizedUse ? {use:authorizedUse} : {})}} onChange={onApplicabilityChecks} />}
          adoptions={agreementAdoptions}
          onAdoptions={onAgreementAdoptions}
          persona={persona?.workerId}
          scenario={scenario}
          versionId={params.get("agreementVersion") ?? "brief-v2"}
          compare={params.get("compare") === "yes"}
          onSelection={(version, compare) =>
            filter("agreements/K-01", {
              agreementVersion: version,
              compare: compare ? "yes" : "no",
            })
          }
          onBack={back}
          onSource={open}
        />
      ) : suffix === "/cases" || suffix.startsWith("/cases/") ? (
        <CoordinationCases
          caseEvents={caseEvents}
          caseContext={caseContext}
          onCaseEvents={onCaseEvents}
          scenario={scenario}
          caseId={suffix.split("/")[2]}
          filters={{
            ...defaultCaseFilters,
            query: params.get("caseQ") ?? "",
            owner: (params.get("caseOwner") ?? "all") as CaseFilters["owner"],
            need: (params.get("caseNeed") ?? "all") as CaseFilters["need"],
          }}
          onFilters={(f) =>
            filter("cases", {
              caseQ: f.query,
              caseOwner: f.owner,
              caseNeed: f.need,
            })
          }
          onBack={back}
          onCase={(id) => open(`/cases/${id}`)}
          onSource={open}
        />
      ) : suffix === "/timeline" ? (
        <KnowledgeTimeline state={impactState} filters={{stream:params.get("timelineStream")??"all",kind:params.get("timelineKind")??"all",query:params.get("timelineQ")??"",page:Number(params.get("timelinePage")??1),event:params.get("timelineEvent")??undefined}} onFilters={f=>filter("timeline",{timelineStream:f.stream,timelineKind:f.kind,timelineQ:f.query,timelinePage:f.page>1?String(f.page):"",timelineEvent:f.event??""})} onSource={p=>onRoute(p)} onBack={back}/>
      ) : suffix === "/activity" ? (
        <ExchangeActivity
          scenario={scenario}
          filters={{
            stream: params.get("actStream") ?? "all",
            kind: (params.get("actKind") ?? "all") as ExchangeFilters["kind"],
            event: params.get("event") ?? undefined,
          }}
          onFilters={(f) =>
            filter("activity", {
              actStream: f.stream,
              actKind: f.kind,
              event: f.event ?? "",
            })
          }
          onBack={back}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onWorker={(id) => open(`/workers/${id}`)}
        />
      ) : suffix === "/decisions" ? (
        <DecisionDirectory
          scenario={scenario}
          onBack={back}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onWorker={(id) => open(`/workers/${id}`)}
          onStream={(id) => open(`/workstreams/${id}`)}
        />
      ) : suffix.startsWith("/workflows/") ? (
        <WorkflowMap
          scenario={scenario}
          streamId={suffix.split("/")[2]}
          onBack={back}
          onPattern={
            operatingPattern(scenario, suffix.split("/")[2])
              ? () => open(`/patterns/${suffix.split("/")[2]}`)
              : undefined
          }
          onActivity={() => open(`/activity?actStream=${suffix.split("/")[2]}`)}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onWorker={(id) => open(`/workers/${id}`)}
          onStream={() => open(`/workstreams/${suffix.split("/")[2]}`)}
          localProgress={scenario.id === "knowledge" && suffix === "/workflows/K-01" ? <ContributionProgress state={contribution} onContributor={() => onRoute(base + "/contributions/K-01-H?persona=leo" + (contributionPerformer(contribution) === "delegate" ? "&contributionActor=delegate" : ""))} onReceiver={() => onRoute(base + "/work?persona=maya")} /> : undefined}
          onOutcome={() => open(`/outcomes/${suffix.split("/")[2]}`)}
        />
      ) : suffix.startsWith("/outcomes/") ? (
        <OutcomeReview
          onStream={() => open(`/workstreams/${suffix.split("/")[2]}`)}
          scenario={scenario}
          stream={scenario.streams.find((s) => suffix === `/outcomes/${s.id}`)!}
          outcome={scenario.outcomes.find(
            (o) => suffix === `/outcomes/${o.streamId}`,
          )!}
          completed={{}}
          backLabel="Back to scenario context"
          onReviewRecord={
            scenario.id === "knowledge" && suffix === "/outcomes/K-01"
              ? () => open("/outcome-reviews/guide-review-01")
              : undefined
          }
          onBack={back}
          onOpen={(id) => open(`/assignments/${id}`)}
        />
      ) : suffix === "/work" ? (
        <ScenarioMyWork
          caseEvents={caseEvents}
          caseContext={caseContext}
          onBack={back}
          onContribution={() => onRoute(qualify("/contributions/K-01-H"))}
          contribution={contribution}
          onContributionChange={onContribution}
          onCase={(id) => open(`/cases/${id}`)}
          scenario={scenario}
          workerId={persona!.workerId}
          filters={readScenarioWorkFilters(params)}
          onFilters={(f) =>
            filter("work", {
              q: f.query,
              role: f.role,
              stream: f.stream,
              status: f.status,
            })
          }
          onWorker={(id) => open(`/workers/${id}`)}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onStream={(id) => open(`/workstreams/${id}`)}
          onOrganization={() => onRoute(qualify(""))}
        />
      ) : suffix === "/evidence" ? (
        <div className="detail-page">
          <DetailBackButton onClick={() => onRoute(qualify(""))}>
            Back to Organization
          </DetailBackButton>
          <div className="page-heading">
            <div>
              <div className="eyebrow">SCENARIO EVIDENCE</div>
              <h1 tabIndex={-1}>Evidence · {scenario.name}</h1>
              <p>Artifacts represented in this sample organization.</p>
            </div>
          </div>
          {scenario.evidence.length === 0 ? (
            <section
              className="panel org-stream"
              aria-label="Scenario evidence"
            >
              <h2>No evidence artifacts represented</h2>
              <p>
                {scenario.name} has authored assignments and evidence
                requirements, but no attached artifacts. Missing records do not
                establish that work succeeded or failed. Main software sample
                artifacts and decisions are separate.
              </p>
              <button
                className="button secondary"
                onClick={() => onRoute(qualify("/workstreams"))}
              >
                Browse evidence requirements
              </button>
            </section>
          ) : (
            <section
              className="panel org-stream"
              aria-label="Scenario evidence"
            >
              <p>{scenario.evidence.length} authored artifacts</p>
              {scenario.evidence.map((a) => (
                <article key={a.id}>
                  <h2>{a.title}</h2>
                  <p>
                    {a.id} · {a.producer}
                  </p>
                  <p>{a.detail}</p>
                  <details>
                    <summary>Inspect artifact contents · {a.id}</summary>
                    <pre>{a.content}</pre>
                  </details>
                  <button
                    className="text-link"
                    onClick={() => open(`/assignments/${a.assignmentId}`)}
                  >
                    Inspect artifact assignment · {a.assignmentId}
                  </button>
                </article>
              ))}
            </section>
          )}
        </div>
      ) : suffix === "/roles" ? (
        <RolesDirectory
          scenario={scenario}
          filters={{
            ...readRolePages(params),
            detail: params.get("detail") ?? undefined,
            query: params.get("q") ?? "",
            view: params.get("view") === "scope" ? "scope" : undefined,
            scope: params.get("scope") ?? undefined,
            coverage: (params.get("coverage") ??
              "all") as RoleFilters["coverage"],
          }}
          onFilters={(f) =>
            filter("roles", {
              ...rolePageParams(f),
              q: f.query,
              coverage: f.coverage,
              view: f.view ?? "",
              scope: f.scope ?? "",
            })
          }
          onWorker={(id) => open(`/workers/${id}`)}
          onStream={(id) => open(`/workstreams/${id}`)}
          onAssignment={(id) => open(`/assignments/${id}`)}
          onBack={() => onRoute(qualify(""))}
        />
      ) : suffix === "/workstreams" ? (
        <WorkstreamsDirectory
          scenario={scenario}
          filters={{
            ...defaultStreamFilters,
            page: params.has("page") ? Number(params.get("page")) : undefined,
            query: params.get("q") ?? "",
            project: params.get("project") ?? "All",
            signal: (params.get("signal") ?? "all") as StreamFilters["signal"],
          }}
          onFilters={(f) =>
            filter("workstreams", {
              q: f.query,
              project: f.project,
              signal: f.signal,
              page: (f.page ?? 1) > 1 ? String(f.page) : "",
            })
          }
          onOpen={(id) => open(`/workstreams/${id}`)}
          onBack={() => onRoute(qualify(""))}
        />
      ) : suffix === "/workers" ? (
        <WorkersDirectory
          scenario={scenario}
          filters={{
            ...defaultWorkerFilters,
            page: params.has("page") ? Number(params.get("page")) : undefined,
            query: params.get("q") ?? "",
            role: params.get("role") ?? "All",
            type: (params.get("type") ?? "all") as WorkerFilters["type"],
            assignments: (params.get("links") ??
              "all") as WorkerFilters["assignments"],
          }}
          onFilters={(f) =>
            filter("workers", {
              q: f.query,
              role: f.role,
              type: f.type,
              links: f.assignments,
              page: (f.page ?? 1) > 1 ? String(f.page) : "",
            })
          }
          onOpen={(id) => open(`/workers/${id}`)}
          onAttention={() =>
            onRoute(qualify("/attention?category=responsibility"))
          }
          onBack={() => onRoute(qualify(""))}
        />
      ) : (
        <>
          {suffix !== "" && (
            <>
              <DetailBackButton onClick={back}>
                Back to scenario context
              </DetailBackButton>
              <div className="page-heading">
                <div>
                  <h1 tabIndex={-1}>
                    {stream?.name ??
                      worker?.name ??
                      assignment?.title ??
                      (suffix === "/attention"
                        ? "Scenario organization attention"
                        : suffix === "/activity"
                          ? "Scenario organization activity"
                          : "Organization overview")}
                  </h1>
                </div>
              </div>
            </>
          )}
          {stream ? (
            <>
              <p>{stream.goal}</p>
              <p>{stream.outcome}</p>
              {scenario.id === "knowledge" && stream.id === "K-01" && <ContributionProgress state={contribution} onContributor={() => onRoute(base + "/contributions/K-01-H?persona=leo" + (contributionPerformer(contribution) === "delegate" ? "&contributionActor=delegate" : ""))} onReceiver={() => onRoute(base + "/work?persona=maya")} />}

              {
                <section
                  className="panel org-stream"
                  aria-label="Workstream responsibility sources"
                >
                  <h2>Known responsibility gaps</h2>
                  {scenario.gaps
                    .filter((g) => g.workstreamId === stream.id)
                    .map((g) => (
                      <article key={g.id}>
                        <h3>{g.title}</h3>
                        <p>
                          {g.id} · {g.description}
                        </p>
                      </article>
                    ))}
                </section>
              }
              <section className="panel org-stream">
                <h2>Coordination & assignments</h2>
                {scenario.id === "knowledge" && stream.id === "K-01" && (
                  <p>
                    <button
                      className="button secondary"
                      onClick={() => open("/agreements/K-01")}
                    >
                      Inspect proposed workstream agreement
                    </button>
                  </p>
                )}
                {
                  <button
                    className="button secondary"
                    onClick={() => open(`/workflows/${stream.id}`)}
                  >
                    Explore workflow & exchanges
                  </button>
                }
                <p>{stream.coordination}</p>
                <ol>
                  {scenario.flows[stream.id].map((step) => (
                    <li key={step.assignmentId}>
                      <strong>{step.title}</strong>
                      <p>
                        {step.responsibility} · {step.state}
                      </p>
                      <p>{step.exchange}</p>
                    </li>
                  ))}
                </ol>
                {links(stream.assignmentIds)}
                {scenario.id === "knowledge" && stream.id === "K-02" && <BriefHandoff contribution={contribution} state={briefHandoff} onChange={onBriefHandoff} persona={persona?.workerId} />}
                <CoordinationInputs
                  scenario={scenario}
                  streamId={stream.id}
                  onAssignment={(id) => open(`/assignments/${id}`)}
                  onWorker={(id) => open(`/workers/${id}`)}
                />
                <h2>Outcome evidence requirements</h2>
                <button
                  className="button secondary"
                  onClick={() => open(`/outcomes/${stream.id}`)}
                >
                  Review outcome evidence
                </button>
                {scenario.outcomes
                  .find((o) => o.streamId === stream.id)
                  ?.criteria.map((c) => (
                    <div key={c.id}>
                      <h3>{c.title}</h3>
                      <p>Criterion · {c.id}</p>
                      <p>{c.needed}</p>
                      <p>{c.gap}</p>
                    </div>
                  ))}
              </section>
            </>
          ) : worker ? (
            <>
              <WorkerReadiness scenario={scenario} workerId={worker.id} />
              <h2>Scoped responsibilities</h2>
              <ul>
                {scenario.bindings
                  .filter((b) => b.workerId === worker.id)
                  .map((b) => (
                    <li key={`${b.role}:${b.scope}`}>
                      {b.role} · {b.scope}
                    </li>
                  ))}
              </ul>
              <h2>Explicit assignment links</h2>
              {links(
                scenario.assignments
                  .filter((a) => a.workerId === worker.id)
                  .map((a) => a.id),
              )}
              <p>
                No links does not establish that this worker is idle or
                available.
              </p>
            </>
          ) : assignment ? (
            <section className="panel org-stream">
              <p>
                {assignment.id} · {assignment.role} · {assignment.id === "K-01-H" ? contributionView(contribution).stage : assignment.state}
              </p>
              {assignment.id === "K-01-H" && <><p role="status">{contributionView(contribution).summary}</p><p>{contributionView(contribution).contributorNext}</p></>}
              <p>
                Worker:{" "}
                {scenario.workers.find((w) => w.id === assignment.workerId)
                  ?.name ?? "Unassigned"}
              </p>
              {scenario.id === "knowledge" && ["K-02-C", "K-02-E"].includes(assignment.id) && <BriefHandoff contribution={contribution} state={briefHandoff} onChange={onBriefHandoff} persona={persona?.workerId} />}
              <CoordinationInputs
                scenario={scenario}
                assignmentId={assignment.id}
                onAssignment={(id) => open(`/assignments/${id}`)}
                onWorker={(id) => open(`/workers/${id}`)}
              />
              {assignment.input && (
                <>
                  <h2>Input & expected response</h2>
                  <p>
                    <strong>Input:</strong> {assignment.input}
                  </p>
                  <p>
                    <strong>Expected response:</strong>{" "}
                    {assignment.expectedResponse}
                  </p>
                </>
              )}
              <p>
                Authored read-only state. No verified artifacts or external
                execution record is attached; no response action is enabled.
              </p>
              <button
                className="text-link"
                onClick={() => open(`/workstreams/${assignment.streamId}`)}
              >
                Inspect scenario workstream
              </button>
              {assignment.workerId && (
                <button
                  className="text-link"
                  onClick={() => open(`/workers/${assignment.workerId}`)}
                >
                  Inspect scenario worker
                </button>
              )}
            </section>
          ) : suffix === "/attention" ? (
            <section className="panel org-stream">
              <CoordinationNeeds items={needs.filter(record => !params.get("category") || params.get("category") === "all" || record.category.toLowerCase() === params.get("category"))} onOpen={openNeed} />
              <p>
                Signals combine authored context and explicitly local contribution and bounded-use transitions. Suggested inspection does not allocate responsibility or establish completion.
              </p>
            </section>
          ) : (
            <OrganizationOverview
              goalContext={scenario.id === "knowledge" ? <><OrganizationGoalSummary scenario={scenario} state={impactState} onOpen={()=>open("/goals")} /><nav className="organization-sections" aria-label="Knowledge workspace shortcuts"><button className="button secondary" onClick={()=>open("/timeline")}>View activity timeline</button><button className="button secondary" onClick={()=>{const tools=document.getElementById("knowledge-operating-tools") as HTMLDetailsElement | null;if(tools){tools.open=true;tools.querySelector("summary")?.focus();tools.scrollIntoView({block:"start",behavior:"instant"});}}}>Open operating tools</button></nav></> : undefined}
              coordinationExpanded={params.has("coordQ") || params.has("coordSignal") || params.has("coordPage")}
              onCases={
                scenario.id === "knowledge" ? () => open("/cases") : undefined
              }
              onDecisions={() => open("/decisions")}
              scenario={scenario}
              attentionItems={needs}
              coordination={
                <CoordinationOverview
                  scenario={scenario}
                  filters={{
                    ...defaultCoordinationFilters,
                    query: params.get("coordQ") ?? "",
                    signal: (params.get("coordSignal") ??
                      "all") as CoordinationFilters["signal"],
                    page: params.has("coordPage")
                      ? Number(params.get("coordPage"))
                      : undefined,
                  }}
                  onFilters={(f) =>
                    filter("", {
                      coordQ: f.query,
                      coordSignal: f.signal,
                      coordPage: (f.page ?? 1) > 1 ? String(f.page) : "",
                    })
                  }
                  onAssignment={(id) => open(`/assignments/${id}`)}
                  onStream={(id) => open(`/workstreams/${id}`)}
                  onOutcome={(id) => open(`/outcomes/${id}`)}
                  onDirectory={() => onRoute(qualify("/workstreams"))}
                />
              }
              completed={{}}
              readiness="missing"
              coordinationNeeds={scenario.id === "knowledge" ? <CoordinationNeeds items={needs} compact onOpen={openNeed} /> : undefined}
              exchangeHistory={scenario.id === "knowledge" ? <ContributionExchange state={contribution} onOpen={() => onRoute(base + "/work?persona=maya")} /> : undefined}
              operatingContext={scenario.id === "knowledge" ? <OrganizationOperatingContext scenario={scenario} onSource={open} /> : undefined}
              proposals={{}}
              onOpen={(a) => open(`/assignments/${a.id}`)}
              onMyWork={persona ? () => onRoute(qualify("/work")) : onMyWork}
              myWorkLabel={
                persona ? `Open personal inbox · ${person?.name}` : undefined
              }
              onWorkstream={(id) => open(`/workstreams/${id}`)}
              onWorker={(id) => open(`/workers/${id}`)}
              onDirectory={() => onRoute(qualify("/workstreams"))}
              onWorkersDirectory={() => onRoute(qualify("/workers"))}
              onRolesDirectory={() => onRoute(qualify("/roles"))}
              onActivity={() => onRoute(qualify("/activity"))}
              onAttention={(category) =>
                onRoute(
                  qualify(
                    "/attention" +
                      (category === "All"
                        ? ""
                        : `?category=${category.toLowerCase()}`),
                  ),
                )
              }
              onPropose={() => {}}
            />
          )}
        </>
      )}
      {scenario.id === "knowledge" && (suffix === "" ? <details id="knowledge-operating-tools" className="organization-disclosure overview-tools" aria-label="Organization operating tools"><summary>Operating tools and local records</summary><p>Inspect allocations, handoffs, workshop follow-up, exceptions and guidance when you need their details.</p>{operatingTools}</details> : <section aria-label="Current work actions">{operatingTools}</section>)}
      {scenario.id === "knowledge" && <KnowledgeRecovery state={impactState} onChange={onKnowledgeWorkspace} />}
      {scenario.id === "knowledge" && <ContributionRecovery state={contribution} onChange={onContribution} replacementContext={incoming => `Exception, pattern, workshop, case, brief, adoption and use history are retained. Exception remedies are rechecked against the changed context. Existing pattern associations never transfer to a changed work source. Workshop status: ${workshopProgress(workshopEvents, {brief:briefHandoff,contribution:incoming,caseEvents}).status}. ${caseEvents.length ? `Resulting case status: ${caseProgress(caseEvents, {brief: briefHandoff, contribution: incoming}).status}.` : ""} Resulting use status: ${useProgress(incoming, authorizedUse, useScope).title}. ${useProgress(incoming, authorizedUse, useScope).detail}`} />}
      <details
        className="organization-disclosure"
        role="region"
        aria-label="Scenario boundary"
      >
        <summary>About this sample</summary>
        <p>
          {scenario.name} · {scenario.id === "knowledge" ? "authored sample" : "read-only sample"} · {scenario.streams.length}{" "}
          workstreams · {scenario.workers.length} workers. These are authored
          responsibilities and requirements, not live permissions, capacity or
          verified outcomes. Main software records remain separate.
        </p>
      </details>
    </div>
  );
}

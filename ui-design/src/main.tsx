import { CoordinationOverview } from "./CoordinationOverview";
import {
  mainCoordinationScenario,
  defaultCoordinationFilters,
} from "./data/coordinationOverview";
import { CoordinationInputs } from "./CoordinationInputs";
import { mainOrganization } from "./data/organizationScenario";
import {
  resolveScenario,
  scenarioPersona,
  readOnlyScenarios,
} from "./data/scenarioRegistry";
import { RolesDirectory } from "./RolesDirectory";
import { defaultRoleFilters } from "./data/roleDirectory";
import { ScenarioWorkspace } from "./ScenarioWorkspace";
import { WorkersDirectory } from "./WorkersDirectory";
import { defaultWorkerFilters } from "./data/workerDirectory";
import { WorkstreamsDirectory } from "./WorkstreamsDirectory";
import { defaultStreamFilters } from "./data/workstreamDirectory";
import { CustomerTour, customerTourSteps } from "./CustomerTour";
import { ResponsibilityProposal } from "./ResponsibilityProposal";
import type { ResponsibilityProposal as Proposal } from "./data/responsibilityProposals";
import { LargeOrganizationDemo } from "./LargeOrganizationDemo";
import type { WorkspaceRoute } from "./useWorkspaceRoute";
import { OrganizationAttention } from "./OrganizationAttention";
import type { AttentionCategory } from "./data/organizationAttention";
import { OutcomeReview } from "./OutcomeReview";
import { outcomes } from "./data/outcomes";
import { OrganizationActivity } from "./OrganizationActivity";
import { HandoffDetail } from "./HandoffDetail";
import { handoffs } from "./data/handoffs";
import { WorkerDetail } from "./WorkerDetail";
import { WorkstreamDetail } from "./WorkstreamDetail";
import { workers, workstreams } from "./data/organizationOverview";
import { OrganizationOverview } from "./OrganizationOverview";
import { Modal } from "./Modal";
import { ResponseDialog } from "./ResponseDialog";
import { useResponseDrafts } from "./useResponseDrafts";
import { RevisionCycle } from "./RevisionCycle";
import { snapshotCriteria } from "./CriterionAssessment";
import { useResponseSubmission } from "./useResponseSubmission";
import { ReconciliationReview } from "./ReconciliationReview";
import { reconciliationSnapshot } from "./data/reconciliation";
import { AssignmentActivity } from "./AssignmentActivity";
import { OrganizationWork } from "./OrganizationWork";
import { WorkDataPreview, type WorkDataState } from "./WorkDataPreview";
import { defaultWorkFilters, type WorkFilters } from "./workFilters";
import { assignments } from "./data/assignments";
import type {
  Assignment,
  Kind,
  ResponseRecord,
  Readiness,
} from "./data/models";
import { releaseSubject } from "./data/release";
import { useWorkspaceRoute } from "./useWorkspaceRoute";
import { decisionBlocked } from "./ReleaseReview";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Blocks,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  Circle,
  CircleCheck,
  Clock3,
  Code2,
  FileCheck2,
  FileCode2,
  FileText,
  GitBranch,
  Inbox,
  Layers3,
  LockKeyhole,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import "./styles.css";
import { Attempts } from "./Attempts";
import {
  Candidate,
  initialCandidateView,
  type CandidateViewState,
} from "./Candidate";
import { Checks } from "./Checks";
import type { Scenario } from "./data/models";
import type { RelatedTab } from "./RelatedRecords";
import { AssignmentRequirements } from "./AssignmentRequirements";
import { EvidenceArtifacts, ArtifactContents } from "./EvidenceArtifacts";
import { evidenceFor, inputFor, type EvidenceArtifact } from "./data/evidence";
import { sampleCandidate } from "./data/candidate";
import { ReleaseReview } from "./ReleaseReview";
const assignmentTabs = [
  "Overview",
  "Attempts",
  "Candidate",
  "Checks",
  "Evidence",
  "Activity",
];

type View = "My Work" | "Organization" | "Evidence" | "Demos";
const kindLabels: Record<Kind, string> = {
  Work: "Needs my work",
  Assessment: "Needs my assessment",
  Authority: "Needs my authority",
  Reconciliation: "Needs reconciliation",
};
const iconFor = {
  Work: FileText,
  Assessment: FileCheck2,
  Authority: ShieldCheck,
  Reconciliation: GitBranch,
};
function App() {
  const { route, navigate: changeRoute } = useWorkspaceRoute(
    assignments.map((a) => a.id),
    assignmentTabs,
  );
  const view = route.view;
  const activeScenario = route.scenarioPath
    ? resolveScenario(route.scenarioPath)
    : undefined;
  const activePersona = route.scenarioPath
    ? scenarioPersona(route.scenarioPath)
    : undefined;
  const activePerson = activeScenario?.workers.find(
    (w) => w.id === activePersona?.workerId,
  );
  const worker = workers.find((w) => w.id === route.workerId);
  const handoff = handoffs.find((h) => h.id === route.handoffId);
  const outcome = outcomes.find((o) => o.streamId === route.outcomeId);
  const outcomeStream = workstreams.find((s) => s.id === route.outcomeId);
  const stream = workstreams.find((s) => s.id === route.workstreamId);
  const selected = assignments.find((a) => a.id === route.assignmentId) ?? null;
  const isMainInbox =
    view === "My Work" &&
    !route.scenarioPath &&
    !selected &&
    !route.personalQueue;
  const tab = route.tab;
  function setTab(next: string) {
    if (selected)
      changeRoute({
        view: "My Work",
        assignmentId: selected.id,
        tab: next,
        work: route.work,
      });
  }
  const work = route.work ?? defaultWorkFilters;
  const {
    kind: filter,
    query,
    completed: showCompleted,
    project,
    draftsOnly,
    sort,
  } = work;
  function updateWork(patch: Partial<WorkFilters>, replace = false) {
    changeRoute({ ...route, work: { ...work, ...patch } }, replace);
  }
  const setFilter = (kind: Kind | "All") => updateWork({ kind });
  const setQuery = (query: string) => updateWork({ query }, true);
  const setShowCompleted = (completed: boolean) => updateWork({ completed });
  const [completed, setCompleted] = useState<Record<string, string>>({});
  const [candidateViews, setCandidateViews] = useState<
    Record<string, CandidateViewState>
  >({});
  const candidateViewKey = selected
    ? `${selected.id}:${sampleCandidate.candidateDigest}`
    : "";
  const candidateView =
    candidateViews[candidateViewKey] ?? initialCandidateView;
  function updateCandidateView(patch: Partial<CandidateViewState>) {
    setCandidateViews((previous) => ({
      ...previous,
      [candidateViewKey]: {
        ...(previous[candidateViewKey] ?? initialCandidateView),
        ...patch,
      },
    }));
  }
  const [checkScenario, setCheckScenario] = useState<Scenario>("passed");
  const [readiness, setReadiness] = useState<Readiness>("missing");
  const responseDraft = useResponseDrafts(selected);
  const {
    decision,
    setDecision,
    assessmentConclusion,
    assessmentEvidence,
    reconciliationConclusion,
    criterionReviews,
    assessmentForm,
    reconciliationForm,
    draftEntries,
    reason,
    discardDraft,
    clearDrafts,
  } = responseDraft;
  const [notice, setNotice] = useState("");
  const [tourStep, setTourStep] = useState<number | null>(null);
  function openTourStep(step: number) {
    setTourStep(step);
    changeRoute(customerTourSteps[step].route);
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(".customer-tour h2")?.focus();
      window.scrollTo(0, 0);
    });
  }
  const [proposals, setProposals] = useState<Record<string, Proposal>>({});
  const [proposalGap, setProposalGap] = useState<string | null>(null);
  const [artifact, setArtifact] = useState<EvidenceArtifact | null>(null);
  const [mobile, setMobile] = useState(false);
  const [receipts, setReceipts] = useState<ResponseRecord[]>([]);
  const [workDataState, setWorkDataState] = useState<WorkDataState>("ready");
  const [evidenceQueries, setEvidenceQueries] = useState<
    Record<string, string>
  >({});
  const [activityFilters, setActivityFilters] = useState<
    Record<string, string>
  >({});
  const [organizationActivityView, setOrganizationActivityView] = useState({
    scope: "all",
    type: "all",
  });
  const [queueView, setQueueView] = useState({
    project: "All",
    role: "All",
    status: "all",
  });
  const workerDirectorySources = useRef<Record<string, WorkspaceRoute>>({});
  const directorySources = useRef<Record<string, WorkspaceRoute>>({});
  const assignmentSources = useRef<
    Record<
      string,
      {
        route: WorkspaceRoute;
        key: string;
        label: string;
        y: number;
        button: string;
      }
    >
  >({});
  const source = selected ? assignmentSources.current[selected.id] : undefined;
  const inboxReturn = useRef<{ id: string; y: number } | null>(null);
  const screenKey = `${route.view}:${route.assignmentId ?? ""}:${!!route.invalid}:${route.workstreamId ?? ""}:${route.workerId ?? ""}:${route.handoffId ?? ""}:${!!route.organizationActivity}:${route.outcomeId ?? ""}:${!!route.attention}:${!!route.personalQueue}:${!!route.largeOrganization}:${!!route.streamDirectory}:${!!route.workerDirectory}:${!!route.roleDirectory}:${route.scenarioPath?.split("?")[0] ?? ""}:${activePersona?.workerId ?? ""}`;
  const previousScreen = useRef(screenKey);
  useEffect(() => {
    if (route.view !== "My Work" || route.assignmentId)
      setWorkDataState("ready");
    if (previousScreen.current === screenKey) return;
    const previous = previousScreen.current;
    previousScreen.current = screenKey;
    // Run after route-driven dialogs have closed and restored their opener.
    const frame = requestAnimationFrame(() => {
      const origin = Object.entries(assignmentSources.current).find(
        ([id, saved]) =>
          previous.startsWith(`My Work:${id}:`) &&
          !route.assignmentId &&
          saved.key === screenKey,
      )?.[1];
      if (origin) {
        const button = Array.from(
          document.querySelectorAll<HTMLButtonElement>("main button"),
        ).find((button) => button.textContent?.trim() === origin.button);
        (button ?? document.querySelector<HTMLElement>("main h1"))?.focus({
          preventScroll: true,
        });
        window.scrollTo(0, origin.y);
        return;
      }
      const saved = inboxReturn.current;
      if (
        route.view === "My Work" &&
        !route.assignmentId &&
        !route.personalQueue &&
        saved &&
        previous.startsWith(`My Work:${saved.id}:`)
      ) {
        const row = document.getElementById(`work-row-${saved.id}`);
        if (row) {
          row.focus({ preventScroll: true });
          window.scrollTo(0, saved.y);
          const bounds = row.getBoundingClientRect();
          if (bounds.bottom < 64 || bounds.top > innerHeight)
            row.scrollIntoView({ block: "center" });
          return;
        }
      }
      document
        .querySelector<HTMLElement>(
          tourStep === null ? "main h1" : ".customer-tour h2",
        )
        ?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [screenKey, route.view, route.assignmentId]);
  const active = assignments.filter((a) => !completed[a.id]);
  const hasDraft = (id: string) =>
    draftEntries(id).some(([, text]) => text.trim());
  const dueOrder: Record<string, number> = { Today: 0, Tomorrow: 1, Friday: 2 };
  const visible = assignments
    .filter(
      (a) =>
        (showCompleted ? !!completed[a.id] : !completed[a.id]) &&
        (filter === "All" || a.kind === filter) &&
        (project === "All" || a.project === project) &&
        (!draftsOnly || hasDraft(a.id)) &&
        `${a.id} ${a.title} ${a.project}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "due" ? (dueOrder[a.due] ?? 99) - (dueOrder[b.due] ?? 99) : 0,
    );
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  useEffect(() => {
    setDecision(null);
    setArtifact(null);
    setProposalGap(null);
    setMobile(false);
  }, [
    route.view,
    route.workstreamId,
    route.workerId,
    route.handoffId,
    route.organizationActivity,
    route.attention,
    route.outcomeId,
    route.personalQueue,
    route.largeOrganization,
    !!route.streamDirectory,
    !!route.workerDirectory,
    !!route.roleDirectory,
    route.scenarioPath,
    route.assignmentId,
    route.tab,
    route.invalid,
  ]);
  function openAttention(attention: AttentionCategory | "All") {
    changeRoute({
      view: "Organization",
      attention,
      tab: "Overview",
      work: route.work,
    });
  }
  function navigate(next: View) {
    directorySources.current = {};
    workerDirectorySources.current = {};
    setOrganizationActivityView({ scope: "all", type: "all" });
    setQueueView({ project: "All", role: "All", status: "all" });
    changeRoute({ view: next, tab: "Overview", work: route.work });
  }
  function open(a: Assignment, nextTab = "Overview") {
    if (!selected && (view !== "My Work" || route.personalQueue)) {
      const label = route.personalQueue
        ? "Response queue"
        : route.roleDirectory
          ? "Roles"
          : stream
            ? "Workstream"
            : handoff
              ? "Handoff"
              : outcome
                ? "Outcome review"
                : worker
                  ? "Worker"
                  : route.organizationActivity
                    ? "Organization activity"
                    : route.attention
                      ? "Organization attention"
                      : view;
      assignmentSources.current[a.id] = {
        route: { ...route },
        key: screenKey,
        label,
        y: window.scrollY,
        button: document.activeElement?.textContent?.trim() ?? "",
      };
    } else if (!selected) delete assignmentSources.current[a.id];
    if (view === "My Work" && !selected && !route.personalQueue)
      inboxReturn.current = { id: a.id, y: window.scrollY };
    changeRoute({
      view: "My Work",
      assignmentId: a.id,
      tab: nextTab,
      work: route.work,
    });
  }
  function inspectCoordinationWorker(id: string) {
    workerDirectorySources.current[id] = route;
    changeRoute({ view: "Organization", tab: "Overview", workerId: id });
  }
  function navigateRelated(next: RelatedTab) {
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }
  function commitDecision() {
    if (!selected || !reason.trim() || !decision || completed[selected.id])
      return;
    if (assessmentForm && !assessmentConclusion) return;
    if (reconciliationForm && !reconciliationConclusion) return;
    if (selected.kind === "Authority" && decisionBlocked(readiness)) return;
    if (decision === "Approval" && readiness !== "ready") return;
    setCompleted((prev) => ({ ...prev, [selected.id]: decision }));
    const record: ResponseRecord = {
      id: `demo-receipt-${crypto.randomUUID()}`,
      assignmentId: selected.id,
      decision,
      recordedAt: new Date().toISOString(),
      actor: "Alex Morgan",
      role: selected.role,
      permission: selected.authority,
      rationale: reason.trim(),
      reconciliation:
        reconciliationForm && reconciliationConclusion
          ? { ...reconciliationSnapshot, conclusion: reconciliationConclusion }
          : undefined,
      assessment:
        assessmentForm && assessmentConclusion
          ? {
              conclusion: assessmentConclusion,
              criteria: snapshotCriteria(criterionReviews),
              evidence: evidenceFor(selected.id)
                .filter((e) => assessmentEvidence.includes(e.id))
                .map(({ id, title, assignmentId }) => ({
                  id,
                  title,
                  assignmentId,
                })),
            }
          : undefined,
      subject:
        selected.kind === "Authority"
          ? { ...releaseSubject }
          : selected.id === sampleCandidate.assignmentId
            ? {
                label: sampleCandidate.label,
                digest: sampleCandidate.candidateDigest,
              }
            : { label: selected.artifact },
      prerequisites: selected.kind === "Authority" ? readiness : undefined,
    };
    setReceipts((prev) => [record, ...prev]);
    setNotice(
      `${decision} recorded in this demo. No external action was taken.`,
    );
    setDecision(null);
    clearDrafts(selected.id);
  }
  const submission = useResponseSubmission(
    selected && decision ? selected.id : "",
    commitDecision,
  );
  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to main content
      </a>
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (activeScenario)
              changeRoute({
                view: "Organization",
                tab: "Overview",
                scenarioPath: `/organizations/${activeScenario.id}${activePersona ? `?persona=${activePersona.workerId}` : ""}`,
              });
            else navigate("My Work");
          }}
        >
          <span className="brand-mark">
            <Blocks size={23} />
          </span>
          forge<span className="brand-dot">●</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">
            <Code2 size={19} />
          </span>
          <div>
            <strong>{activeScenario?.domain ?? "Software Factory"}</strong>
            <span>{activeScenario?.name ?? "Acme organization"}</span>
          </div>
          <span className="live-dot" title="Demo workspace" />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav id="workspace-navigation" aria-label="Main navigation">
          {(
            [
              ["Organization", Users],
              ["My Work", Inbox],
              ["Evidence", Layers3],
              ["Demos", Blocks],
            ] as const
          ).map(([name, Icon]) => (
            <button
              key={name}
              className={`nav-item ${view === name ? "active" : ""}`}
              aria-current={view === name ? "page" : undefined}
              onClick={() =>
                route.scenarioPath &&
                (name === "Organization" ||
                  name === "Evidence" ||
                  (name === "My Work" && activePersona))
                  ? changeRoute({
                      view: name,
                      tab: "Overview",
                      scenarioPath: `/organizations/${activeScenario!.id}${name === "My Work" ? "/work" : name === "Evidence" ? "/evidence" : ""}${activePersona ? `?persona=${activePersona.workerId}` : ""}`,
                    })
                  : navigate(name)
              }
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "My Work" && (
                <b
                  aria-label={
                    !activePersona &&
                    (workDataState === "loading" || workDataState === "error")
                      ? "Assignment count unavailable"
                      : undefined
                  }
                >
                  {activePersona
                    ? activeScenario!.assignments.filter(
                        (a) => a.workerId === activePersona.workerId,
                      ).length
                    : workDataState === "loading" || workDataState === "error"
                      ? "—"
                      : workDataState === "empty"
                        ? 0
                        : active.length}
                </b>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="small-symbol">
            <Sparkles size={17} />
          </span>
          <strong>
            People & agents.
            <br />
            One shared purpose.
          </strong>
          <p>
            Clear responsibility.
            <br />
            Visible evidence.
            <br />
            Human authority.
          </p>
          <div className="note-line" />
        </div>
        <div className="sidebar-footer">
          <div className="connection">
            <span className="live-dot" />
            Interactive design prototype
          </div>
          <div className="profile">
            <span className="avatar">
              {activePerson
                ? activePerson.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "AM"}
            </span>
            <div>
              <strong>{activePerson?.name ?? "Alex Morgan"}</strong>
              <span>
                {activePersona
                  ? `${activePersona.label} · Sample persona`
                  : "Reviewer · Release authority"}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Toggle navigation"
              aria-expanded={mobile}
              aria-controls="workspace-navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            {view === "Organization" &&
            (stream ||
              worker ||
              handoff ||
              outcome ||
              route.workerDirectory ||
              route.streamDirectory ||
              route.organizationActivity ||
              route.attention) ? (
              <>
                <button
                  className="breadcrumb-link"
                  onClick={() => navigate("Organization")}
                >
                  Organization
                </button>
                <ChevronRight size={14} />
                <strong aria-current="page" className="breadcrumb-detail">
                  {stream?.name ??
                    worker?.name ??
                    handoff?.title ??
                    (outcomeStream
                      ? `Outcome · ${outcomeStream.name}`
                      : route.workerDirectory
                        ? "Workers"
                        : route.streamDirectory
                          ? "Workstreams"
                          : route.attention
                            ? "Attention"
                            : "Activity")}
                </strong>
              </>
            ) : (
              <strong>{view}</strong>
            )}
            {route.personalQueue && (
              <>
                <ChevronRight size={14} />
                <span>Response queue</span>
              </>
            )}
            {selected && (
              <>
                <ChevronRight size={14} />
                <span>{selected.id}</span>
              </>
            )}
          </div>
          <div className="top-right">
            <span className="demo-pill">DEMO WORKSPACE</span>
            <span className="top-divider" />
            <span className="tiny-avatar">
              {activePerson
                ? activePerson.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : "AM"}
            </span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {!route.invalid && (
            <section
              className="panel sample-switcher"
              aria-label="Sample organization context"
            >
              <label>
                Sample organization
                <select
                  value={activeScenario?.id ?? "main"}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id === "main") {
                      navigate(
                        view === "Evidence"
                          ? "Evidence"
                          : view === "My Work"
                            ? "My Work"
                            : "Organization",
                      );
                      return;
                    }
                    const target = readOnlyScenarios.find((s) => s.id === id)!;
                    const section =
                      view === "Evidence"
                        ? "/evidence"
                        : view === "My Work"
                          ? "/work"
                          : "";
                    changeRoute({
                      view:
                        view === "Evidence"
                          ? "Evidence"
                          : view === "My Work"
                            ? "My Work"
                            : "Organization",
                      tab: "Overview",
                      scenarioPath: `/organizations/${id}${section}?persona=${target.personas![0].workerId}`,
                    });
                  }}
                >
                  <option value="main">
                    {mainOrganization.name} · {mainOrganization.domain}
                  </option>
                  {readOnlyScenarios.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name} · {s.domain}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                {activeScenario?.domain ?? mainOrganization.domain} ·{" "}
                {activePerson?.name ?? "Alex Morgan"} ·{" "}
                {activeScenario
                  ? "Read-only sample"
                  : "Interactive software sample"}
              </p>
              {activeScenario?.personas && (
                <>
                  <label>
                    Sample persona
                    <select
                      value={activePersona!.workerId}
                      onChange={(e) => {
                        const [path, query] = route.scenarioPath!.split("?");
                        const p = new URLSearchParams(query);
                        p.set("persona", e.target.value);
                        if (path.endsWith("/work"))
                          for (const key of ["q", "role", "stream", "status"])
                            p.delete(key);
                        changeRoute({ ...route, scenarioPath: `${path}?${p}` });
                      }}
                    >
                      {activeScenario.personas!.map((p) => (
                        <option key={p.workerId} value={p.workerId}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {view !== "My Work" && (
                    <button
                      className="button secondary"
                      onClick={() =>
                        changeRoute({
                          view: "My Work",
                          tab: "Overview",
                          scenarioPath: `/organizations/${activeScenario.id}/work?persona=${activePersona!.workerId}`,
                        })
                      }
                    >
                      Open My Work · {activePerson?.name}
                    </button>
                  )}
                  <button
                    className="text-link"
                    onClick={() => navigate("Organization")}
                  >
                    Return to main organization
                  </button>
                </>
              )}
              <details className="sample-navigation-note">
                <summary>About sample navigation</summary>
                <p>
                  Switching samples resets filters and selects its default
                  persona. Demos and interactive responses belong to the main
                  software sample. Persona previews do not sign in or grant
                  permissions.
                </p>
              </details>
            </section>
          )}
          {tourStep !== null && (
            <CustomerTour
              step={tourStep}
              onStep={openTourStep}
              onEnd={() => {
                setTourStep(null);
                navigate("Demos");
              }}
            />
          )}
          {route.invalid && (
            <div className="route-warning" role="alert">
              <strong>This link does not match an available screen.</strong>
              <p>
                Showing My Work. Select an assignment or return to a valid
                workspace link.
              </p>
              <button
                className="button secondary"
                onClick={() => navigate("My Work")}
              >
                Open My Work
              </button>
            </div>
          )}
          {isMainInbox && (
            <WorkDataPreview state={workDataState} setState={setWorkDataState}>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR WORKSPACE, IN FOCUS</div>
                  <h1 tabIndex={-1}>
                    Good morning, Alex<span className="heading-dot">.</span>
                  </h1>
                  <p>
                    You have <strong>{active.length} assignments</strong>{" "}
                    waiting for your attention. Let’s move work forward.
                  </p>
                </div>
                <div className="date-label">
                  <Clock3 size={15} /> Tuesday, September 22{" "}
                  <span>Demo day</span>
                </div>
              </div>
              <p className="org-overview-section">
                <button
                  className="button secondary"
                  onClick={() =>
                    changeRoute({
                      view: "My Work",
                      personalQueue: true,
                      tab: "Overview",
                      work: route.work,
                    })
                  }
                >
                  View response queue · Alex
                </button>
              </p>
              <div className="stat-grid">
                {(
                  [
                    "Work",
                    "Assessment",
                    "Authority",
                    "Reconciliation",
                  ] as Kind[]
                ).map((kind) => {
                  const Icon = iconFor[kind];
                  return (
                    <button
                      key={kind}
                      onClick={() => {
                        updateWork({
                          kind: filter === kind ? "All" : kind,
                          completed: false,
                        });
                      }}
                      aria-pressed={filter === kind}
                      className={`stat-card ${filter === kind ? "chosen" : ""}`}
                    >
                      <span className={`stat-icon ${kind.toLowerCase()}`}>
                        <Icon size={20} />
                      </span>
                      <span className="stat-count">
                        {active
                          .filter((a) => a.kind === kind)
                          .length.toString()
                          .padStart(2, "0")}
                      </span>
                      <span className="stat-label">{kindLabels[kind]}</span>
                      <ArrowUpRight className="stat-arrow" size={17} />
                    </button>
                  );
                })}
              </div>
              <div className="work-layout">
                <section className="panel work-panel">
                  <div className="panel-header">
                    <div>
                      <h2>
                        Your assignments{" "}
                        <span className="count-badge">{visible.length}</span>
                      </h2>
                      <p>Every next step starts with a clear responsibility.</p>
                    </div>
                  </div>
                  <div className="list-toolbar">
                    <div className="segmented">
                      <button
                        className={!showCompleted ? "current" : ""}
                        onClick={() => setShowCompleted(false)}
                      >
                        To do
                      </button>
                      <button
                        className={showCompleted ? "current" : ""}
                        onClick={() => setShowCompleted(true)}
                      >
                        Completed
                      </button>
                    </div>
                    <label className="search-box">
                      <Search size={16} />
                      <input
                        aria-label="Search assignments"
                        placeholder="Search assignments…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="work-filters">
                    <label htmlFor="work-project">
                      Project
                      <select
                        id="work-project"
                        aria-label="Project"
                        value={project}
                        onChange={(e) =>
                          updateWork({ project: e.target.value })
                        }
                      >
                        <option value="All">All projects</option>
                        {[...new Set(assignments.map((a) => a.project))].map(
                          (name) => (
                            <option key={name}>{name}</option>
                          ),
                        )}
                        {project !== "All" &&
                          !assignments.some((a) => a.project === project) && (
                            <option value={project}>
                              {project} (unavailable)
                            </option>
                          )}
                      </select>
                    </label>
                    <label>
                      Sort by
                      <select
                        aria-label="Sort by"
                        value={sort}
                        onChange={(e) =>
                          updateWork({
                            sort: e.target.value as WorkFilters["sort"],
                          })
                        }
                      >
                        <option value="default">Default order</option>
                        <option value="due">Due soonest · sample dates</option>
                      </select>
                    </label>
                    <label className="draft-toggle">
                      <input
                        type="checkbox"
                        checked={draftsOnly}
                        onChange={(e) =>
                          updateWork({ draftsOnly: e.target.checked })
                        }
                      />
                      Has a draft
                    </label>
                    <button
                      className="text-link"
                      onClick={() => updateWork(defaultWorkFilters)}
                    >
                      Reset all filters
                    </button>
                  </div>
                  {draftsOnly && (
                    <p className="work-filter-note">
                      Drafts exist only in this session. Sharing this link or
                      refreshing does not carry draft content.
                    </p>
                  )}
                  {filter !== "All" && (
                    <div className="filter-strip">
                      <span>{kindLabels[filter]}</span>
                      <button
                        onClick={() => setFilter("All")}
                        aria-label="Clear filter"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                  <div className="table-heading">
                    <span>ASSIGNMENT</span>
                    <span>RESPONSIBILITY / DUE</span>
                  </div>
                  <div className="assignment-list">
                    {visible.map((a) => {
                      const Icon = iconFor[a.kind];
                      return (
                        <button
                          className="assignment-row"
                          id={`work-row-${a.id}`}
                          key={a.id}
                          onClick={() => open(a)}
                        >
                          <span className={`row-icon ${a.kind.toLowerCase()}`}>
                            <Icon size={19} />
                          </span>
                          <span className="assignment-main">
                            <span className="assignment-meta">
                              {a.id}
                              <span>·</span>
                              {a.project}
                            </span>
                            <strong>{a.title}</strong>
                            <span className="assignment-sub">
                              <span className="mini-avatar">AM</span>
                              {a.role}
                              {hasDraft(a.id) && (
                                <span className="count-badge">Draft</span>
                              )}
                            </span>
                          </span>
                          <span className="assignment-right">
                            <span className={`badge ${a.kind.toLowerCase()}`}>
                              {completed[a.id] || a.kind}
                            </span>
                            <span
                              className={
                                a.due === "Today" ? "due today" : "due"
                              }
                            >
                              <Clock3 size={12} />
                              {a.due}
                            </span>
                          </span>
                          <ChevronRight size={16} className="row-chevron" />
                        </button>
                      );
                    })}
                    {visible.length === 0 && (
                      <div className="empty-state">
                        <CheckCheck size={30} />
                        <h3>
                          {query
                            ? "No matching assignments"
                            : "No assignments in this view"}
                        </h3>
                        <p>
                          {query
                            ? "Try another title, project, or assignment ID."
                            : "Try different filters or show all work. Session-only drafts and completions reset on refresh."}
                        </p>
                        <button
                          className="button secondary"
                          onClick={() => {
                            updateWork(defaultWorkFilters);
                          }}
                        >
                          Show all work
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="list-footer">
                    <ShieldCheck size={14} /> Your actions are scoped to your
                    assigned authority.
                  </div>
                </section>
                <aside className="right-rail">
                  <section className="focus-card">
                    <div className="focus-label">
                      <span className="live-dot" />
                      RELEASE REVIEW
                    </div>
                    <div className="focus-art">
                      <ShieldCheck size={35} />
                      <span className="orbit orbit-one" />
                      <span className="orbit orbit-two" />
                      <span className="orbit-dot" />
                    </div>
                    <h2>
                      {completed["A-1041"]
                        ? "Decision recorded"
                        : "A release is ready for your review."}
                    </h2>
                    <p>
                      {completed["A-1041"]
                        ? "Your demo decision is available in the assignment history."
                        : "Inspect the exact release candidate and its prerequisites before deciding."}
                    </p>
                    <button onClick={() => open(assignments[1])}>
                      View release assignment <ArrowRight size={16} />
                    </button>
                    <div className="focus-foot">
                      <LockKeyhole size={13} /> Release authority required
                    </div>
                  </section>
                  <section className="activity-card">
                    <div className="section-label">
                      AROUND YOUR ORGANIZATION
                    </div>
                    <h3>Work is moving.</h3>
                    <div className="activity-item">
                      <span className="activity-icon">
                        <Code2 size={15} />
                      </span>
                      <div>
                        <strong>Codex worker submitted a change</strong>
                        <p>Payments API · A-1042</p>
                        <small>12 minutes ago · demo</small>
                      </div>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon green">
                        <Check size={15} />
                      </span>
                      <div>
                        <strong>Test runner attached evidence</strong>
                        <p>42 checks passed</p>
                        <small>8 minutes ago · demo</small>
                      </div>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => navigate("Organization")}
                    >
                      Explore your organization <ArrowUpRight size={14} />
                    </button>
                  </section>
                </aside>
              </div>
            </WorkDataPreview>
          )}
          {view === "My Work" && selected && (
            <>
              <button
                className="back-link"
                onClick={() =>
                  source ? changeRoute(source.route) : navigate("My Work")
                }
              >
                <ArrowLeft size={16} />
                Back to {source?.label ?? "My Work"}
              </button>
              <div className="detail-heading">
                <div className="assignment-meta">
                  {selected.id}
                  <span> / </span>
                  {selected.project}
                </div>
                <h1 tabIndex={-1}>{selected.title}</h1>
                <div className="detail-meta">
                  <span className={`badge ${selected.kind.toLowerCase()}`}>
                    {completed[selected.id] ||
                      `Awaiting ${selected.kind.toLowerCase()}`}
                  </span>
                  <span>
                    <span className="mini-avatar">AM</span> Assigned to you
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {selected.due}
                  </span>
                </div>
              </div>
              <button
                className="mobile-review-jump button secondary"
                onClick={() => {
                  const panel = document.getElementById("assignment-authority");
                  panel?.scrollIntoView({
                    block: "start",
                    behavior: "instant",
                  });
                  panel?.focus({ preventScroll: true });
                }}
              >
                Review authority & response <ArrowRight size={16} />
              </button>
              <div className="detail-layout">
                <div>
                  <div
                    className="tabs"
                    role="tablist"
                    aria-label="Assignment details"
                  >
                    {assignmentTabs.map((t) => (
                      <button
                        key={t}
                        role="tab"
                        id={`tab-${t}`}
                        aria-controls="assignment-tabpanel"
                        tabIndex={tab === t ? 0 : -1}
                        onKeyDown={(e) => {
                          const names = assignmentTabs;
                          const index = names.indexOf(t);
                          const next =
                            e.key === "ArrowRight"
                              ? names[(index + 1) % names.length]
                              : e.key === "ArrowLeft"
                                ? names[
                                    (index + names.length - 1) % names.length
                                  ]
                                : e.key === "Home"
                                  ? names[0]
                                  : e.key === "End"
                                    ? names[names.length - 1]
                                    : null;
                          if (next) {
                            e.preventDefault();
                            setTab(next);
                            document.getElementById(`tab-${next}`)?.focus();
                          }
                        }}
                        aria-selected={tab === t}
                        className={tab === t ? "selected" : ""}
                        onClick={() => setTab(t)}
                      >
                        {t}
                        {t === "Evidence" && (
                          <span>{evidenceFor(selected.id).length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <section
                    className="panel detail-panel"
                    role="tabpanel"
                    id="assignment-tabpanel"
                    aria-labelledby={`tab-${tab}`}
                  >
                    {selected.id === sampleCandidate.assignmentId &&
                      ["Candidate", "Evidence", "Checks"].includes(tab) &&
                      !completed[selected.id] &&
                      draftEntries(selected.id).some(([, text]) =>
                        text.trim(),
                      ) && (
                        <aside
                          className="review-draft-shortcut"
                          aria-label="Review draft shortcuts"
                        >
                          <strong>Your draft is kept in this session</strong>
                          {draftEntries(selected.id)
                            .filter(([, text]) => text.trim())
                            .map(([kind]) => (
                              <button
                                key={kind}
                                className="button secondary"
                                onClick={() => setDecision(kind)}
                              >
                                Resume {kind.toLowerCase()} while reviewing
                              </button>
                            ))}
                        </aside>
                      )}
                    {tab === "Overview" ? (
                      <>
                        <div className="section-label">THE RESPONSIBILITY</div>
                        <h2>A clear next step, with the full context.</h2>
                        <p className="summary">{selected.summary}</p>
                        <CoordinationInputs
                          scenario={mainOrganization}
                          assignmentId={selected.id}
                          completed={completed}
                          onWorker={inspectCoordinationWorker}
                          onAssignment={(id) => {
                            const a = assignments.find((a) => a.id === id);
                            if (a && a.id !== selected.id) open(a);
                          }}
                        />
                        {selected.id === "A-1035" ? (
                          <ReconciliationReview />
                        ) : (
                          <AssignmentRequirements assignmentId={selected.id} />
                        )}
                        <div className="section-rule" />
                        <h3>Exact input</h3>
                        <button
                          className="artifact-link"
                          onClick={() =>
                            setArtifact(
                              inputFor(selected.id, selected.artifact),
                            )
                          }
                        >
                          <span className="file-icon">
                            <FileCode2 size={21} />
                          </span>
                          <span>
                            <strong>{selected.artifact}</strong>
                            <small>
                              Sample input · inspect reference availability
                            </small>
                          </span>
                          <ArrowUpRight size={17} />
                        </button>
                        <div className="section-rule" />
                        <h3>Expected outcome</h3>
                        <div className="expectation">
                          <CircleCheck size={18} />
                          <div>
                            <strong>
                              {selected.kind === "Assessment"
                                ? "A reasoned assessment"
                                : selected.kind === "Authority"
                                  ? "An explicit approval or refusal"
                                  : selected.kind === "Work"
                                    ? "A contribution with acceptance criteria"
                                    : "An evidence-backed reconciliation"}
                            </strong>
                            <p>
                              Include your rationale and reference the evidence
                              you reviewed. Your decision applies only to this
                              assignment and its exact input.
                            </p>
                          </div>
                        </div>
                        <div className="inline-note">
                          <BookOpen size={17} />
                          <p>
                            {selected.kind === "Assessment"
                              ? "Your assessment informs the release authority. It does not authorize deployment."
                              : selected.kind === "Authority"
                                ? "Approval grants permission for this candidate. A separate executor must establish and report the deployment result."
                                : "Submitting a record does not, by itself, establish an external effect."}
                          </p>
                        </div>
                      </>
                    ) : tab === "Evidence" ? (
                      <>
                        <div className="section-label">
                          INPUTS YOU CAN INSPECT
                        </div>
                        <h2>Evidence attached to this assignment</h2>
                        <p className="summary">
                          Illustrative records for this prototype. Inspect an
                          artifact before recording your decision.
                        </p>
                        <EvidenceArtifacts
                          key={selected.id}
                          assignmentId={selected.id}
                          query={evidenceQueries[selected.id] ?? ""}
                          setQuery={(value) =>
                            setEvidenceQueries((old) => ({
                              ...old,
                              [selected.id]: value,
                            }))
                          }
                          onInspect={setArtifact}
                        />
                      </>
                    ) : tab === "Checks" ? (
                      <Checks
                        key={selected.id}
                        assignmentId={selected.id}
                        response={completed[selected.id]}
                        onNavigate={navigateRelated}
                        scenario={checkScenario}
                        setScenario={setCheckScenario}
                      />
                    ) : tab === "Candidate" ? (
                      <Candidate
                        viewState={candidateView}
                        onViewChange={updateCandidateView}
                        key={selected.id}
                        assignmentId={selected.id}
                        onNavigate={navigateRelated}
                      />
                    ) : tab === "Attempts" ? (
                      <Attempts
                        assignmentId={selected.id}
                        onNavigate={navigateRelated}
                      />
                    ) : (
                      <AssignmentActivity
                        key={selected.id}
                        assignmentId={selected.id}
                        receipts={receipts}
                        filter={activityFilters[selected.id] ?? "all"}
                        setFilter={(value) =>
                          setActivityFilters((old) => ({
                            ...old,
                            [selected.id]: value,
                          }))
                        }
                        onNavigate={navigateRelated}
                        onInspect={setArtifact}
                      />
                    )}
                  </section>
                </div>
                <aside>
                  <section
                    className="panel authority-panel"
                    id="assignment-authority"
                    tabIndex={-1}
                    aria-label="Assignment authority and response"
                  >
                    <div className="section-label">
                      <ShieldCheck size={15} /> YOUR AUTHORITY
                    </div>
                    <h3>{selected.role}</h3>
                    <div className="authority-field">
                      <span>Acting as</span>
                      <strong>Alex Morgan · Human</strong>
                    </div>
                    <div className="authority-field">
                      <span>Permission</span>
                      <code>{selected.authority}</code>
                    </div>
                    <div className="authority-field">
                      <span>Scope</span>
                      <strong>{selected.id} · exact input only</strong>
                    </div>
                    <div className="section-rule" />
                    {selected.kind === "Authority" && (
                      <ReleaseReview
                        readiness={readiness}
                        onChange={setReadiness}
                        locked={!!completed[selected.id]}
                      />
                    )}
                    {!completed[selected.id] &&
                      draftEntries(selected.id).some(([, text]) =>
                        text.trim(),
                      ) && (
                        <section
                          className="draft-list"
                          aria-label="Saved drafts"
                        >
                          <h3>Drafts in this session</h3>
                          <p>
                            Not submitted. Refresh clears drafts. Recording any
                            response completes this assignment and clears its
                            drafts.
                          </p>
                          {draftEntries(selected.id)
                            .filter(([, text]) => text.trim())
                            .map(([kind]) => (
                              <div className="draft-actions" key={kind}>
                                <button
                                  className="button secondary"
                                  onClick={() => setDecision(kind)}
                                >
                                  Continue {kind.toLowerCase()} draft
                                </button>
                                <button
                                  className="text-link"
                                  onClick={() =>
                                    discardDraft(selected.id, kind)
                                  }
                                >
                                  Delete {kind.toLowerCase()} draft
                                </button>
                              </div>
                            ))}
                        </section>
                      )}
                    {completed[selected.id] ? (
                      <div className="recorded">
                        <CircleCheck size={25} />
                        <h3>{completed[selected.id]}</h3>
                        <p>Recorded locally in this demo session.</p>
                        <button
                          className="text-link"
                          onClick={() => setTab("Activity")}
                        >
                          View record <ArrowRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="action-hint">
                          Review the inputs, then record your{" "}
                          {selected.kind === "Authority"
                            ? "decision"
                            : "response"}{" "}
                          with a rationale.
                        </p>
                        <button
                          className="button primary wide"
                          disabled={
                            selected.kind === "Authority" &&
                            readiness !== "ready"
                          }
                          onClick={() => {
                            setDecision(
                              selected.kind === "Authority"
                                ? "Approval"
                                : selected.kind === "Assessment"
                                  ? "Assessment"
                                  : selected.kind === "Work"
                                    ? "Contribution"
                                    : "Reconciliation",
                            );
                          }}
                        >
                          {selected.kind === "Authority"
                            ? "Approve release"
                            : selected.kind === "Assessment"
                              ? "Submit assessment"
                              : selected.kind === "Work"
                                ? "Submit contribution"
                                : "Record reconciliation"}
                          <ArrowRight size={16} />
                        </button>
                        {selected.kind === "Authority" && (
                          <button
                            className="button secondary wide"
                            disabled={decisionBlocked(readiness)}
                            onClick={() => {
                              setDecision("Refusal");
                            }}
                          >
                            Refuse release
                          </button>
                        )}
                      </>
                    )}
                    <p className="demo-note">
                      Prototype only. No live authority or deployment.
                    </p>
                  </section>
                  <div className="detail-tip">
                    <LockKeyhole size={17} />
                    <p>
                      Responsibility is assigned.
                      <br />
                      Authority is explicit.
                      <br />
                      Evidence stays connected.
                    </p>
                  </div>
                </aside>
              </div>
            </>
          )}
          {view === "Organization" && stream && (
            <WorkstreamDetail
              onWorker={inspectCoordinationWorker}
              onGaps={() => openAttention("Responsibility")}
              onInspect={setArtifact}
              stream={stream}
              backLabel={
                directorySources.current[stream.id]
                  ? directorySources.current[stream.id].roleDirectory
                    ? "Back to Roles"
                    : directorySources.current[stream.id].streamDirectory
                      ? "Back to Workstreams"
                      : "Back to Organization"
                  : undefined
              }
              onOutcome={() =>
                changeRoute({
                  view: "Organization",
                  outcomeId: stream.id,
                  tab: "Overview",
                  work: route.work,
                })
              }
              onHandoff={(id) =>
                changeRoute({
                  view: "Organization",
                  handoffId: id,
                  tab: "Overview",
                  work: route.work,
                })
              }
              completed={completed}
              onOpen={open}
              onBack={() =>
                directorySources.current[stream.id]
                  ? changeRoute(directorySources.current[stream.id])
                  : navigate("Organization")
              }
            />
          )}
          {view === "Organization" && worker && (
            <WorkerDetail
              worker={worker}
              backLabel={
                workerDirectorySources.current[worker.id]
                  ? workerDirectorySources.current[worker.id].assignmentId
                    ? "Back to Assignment"
                    : workerDirectorySources.current[worker.id].workstreamId
                      ? "Back to Workstream"
                      : workerDirectorySources.current[worker.id].roleDirectory
                        ? "Back to Roles"
                        : "Back to Workers"
                  : undefined
              }
              completed={completed}
              onOpen={open}
              onBack={() =>
                workerDirectorySources.current[worker.id]
                  ? changeRoute(workerDirectorySources.current[worker.id])
                  : navigate("Organization")
              }
            />
          )}
          {view === "Organization" && handoff && (
            <HandoffDetail
              onInspect={setArtifact}
              handoff={handoff}
              completed={completed}
              onOpen={open}
              onBack={() =>
                changeRoute({
                  view: "Organization",
                  workstreamId: handoff.streamId,
                  tab: "Overview",
                  work: route.work,
                })
              }
            />
          )}
          {view === "Organization" && outcome && outcomeStream && (
            <OutcomeReview
              onInspect={setArtifact}
              stream={outcomeStream}
              outcome={outcome}
              completed={completed}
              onOpen={open}
              onBack={() =>
                changeRoute({
                  view: "Organization",
                  workstreamId: outcome.streamId,
                  tab: "Overview",
                  work: route.work,
                })
              }
            />
          )}
          {view === "Organization" && route.attention && (
            <OrganizationAttention
              proposals={proposals}
              onPropose={setProposalGap}
              completed={completed}
              readiness={readiness}
              category={route.attention}
              onCategory={openAttention}
              onBack={() => navigate("Organization")}
              onOpen={open}
              onWorkstream={(id) =>
                changeRoute({
                  view: "Organization",
                  workstreamId: id,
                  tab: "Overview",
                  work: route.work,
                })
              }
            />
          )}
          {view === "Organization" && route.organizationActivity && (
            <OrganizationActivity
              proposals={proposals}
              onProposal={setProposalGap}
              filters={organizationActivityView}
              onFilters={setOrganizationActivityView}
              onInspect={setArtifact}
              receipts={receipts}
              onOpen={open}
              onBack={() => navigate("Organization")}
            />
          )}
          {view === "Organization" && route.roleDirectory && (
            <RolesDirectory
              filters={route.roleDirectory}
              completed={completed}
              onFilters={(filters) =>
                changeRoute(
                  {
                    view: "Organization",
                    tab: "Overview",
                    roleDirectory: filters,
                  },
                  true,
                )
              }
              onBack={() => navigate("Organization")}
              onWorker={(id) => {
                workerDirectorySources.current[id] = route;
                changeRoute({
                  view: "Organization",
                  tab: "Overview",
                  workerId: id,
                });
              }}
              onStream={(id) => {
                directorySources.current[id] = route;
                changeRoute({
                  view: "Organization",
                  tab: "Overview",
                  workstreamId: id,
                });
              }}
              onAssignment={(id) => {
                const a = assignments.find((a) => a.id === id);
                if (a) open(a);
              }}
            />
          )}
          {view === "Organization" && route.workerDirectory && (
            <WorkersDirectory
              filters={route.workerDirectory}
              onFilters={(filters) =>
                changeRoute(
                  {
                    view: "Organization",
                    tab: "Overview",
                    workerDirectory: filters,
                  },
                  true,
                )
              }
              onBack={() => navigate("Organization")}
              onAttention={() => openAttention("Responsibility")}
              onOpen={(id) => {
                workerDirectorySources.current[id] = route;
                changeRoute({
                  view: "Organization",
                  tab: "Overview",
                  workerId: id,
                });
              }}
            />
          )}
          {view === "Organization" && route.streamDirectory && (
            <WorkstreamsDirectory
              filters={route.streamDirectory}
              onFilters={(filters) =>
                changeRoute(
                  {
                    view: "Organization",
                    tab: "Overview",
                    streamDirectory: filters,
                  },
                  true,
                )
              }
              onBack={() => navigate("Organization")}
              onOpen={(id) => {
                directorySources.current[id] = route;
                changeRoute({
                  view: "Organization",
                  tab: "Overview",
                  workstreamId: id,
                });
              }}
            />
          )}
          {route.scenarioPath && (
            <ScenarioWorkspace
              key={activeScenario?.id}
              onMyWork={() => navigate("My Work")}
              path={route.scenarioPath}
              onRoute={(path, replace) =>
                changeRoute(
                  {
                    view: path.split("?")[0].endsWith("/work")
                      ? "My Work"
                      : path.split("?")[0].endsWith("/evidence")
                        ? "Evidence"
                        : "Organization",
                    tab: "Overview",
                    scenarioPath: path,
                  },
                  replace,
                )
              }
              onMain={() => navigate("Organization")}
            />
          )}
          {view === "Organization" &&
            !route.scenarioPath &&
            !route.roleDirectory &&
            !route.workerDirectory &&
            !route.streamDirectory &&
            !stream &&
            !worker &&
            !handoff &&
            !route.organizationActivity &&
            !outcome &&
            !route.attention && (
              <>
                <OrganizationOverview
                  coordination={
                    <CoordinationOverview
                      scenario={mainCoordinationScenario(completed, readiness)}
                      filters={route.coordination ?? defaultCoordinationFilters}
                      onFilters={(coordination) =>
                        changeRoute({ ...route, coordination }, true)
                      }
                      onAssignment={(id) => {
                        const a = assignments.find((a) => a.id === id);
                        if (a) open(a);
                      }}
                      onStream={(id) => {
                        directorySources.current[id] = route;
                        changeRoute({
                          view: "Organization",
                          tab: "Overview",
                          workstreamId: id,
                        });
                      }}
                      onDirectory={() =>
                        changeRoute({
                          view: "Organization",
                          tab: "Overview",
                          streamDirectory: defaultStreamFilters,
                        })
                      }
                    />
                  }
                  onRolesDirectory={() =>
                    changeRoute({
                      view: "Organization",
                      tab: "Overview",
                      roleDirectory: defaultRoleFilters,
                    })
                  }
                  onWorkersDirectory={() =>
                    changeRoute({
                      view: "Organization",
                      tab: "Overview",
                      workerDirectory: defaultWorkerFilters,
                    })
                  }
                  onDirectory={() =>
                    changeRoute({
                      view: "Organization",
                      tab: "Overview",
                      streamDirectory: defaultStreamFilters,
                    })
                  }
                  proposals={proposals}
                  onPropose={setProposalGap}
                  onAttention={openAttention}
                  completed={completed}
                  readiness={readiness}
                  onOpen={open}
                  onMyWork={() => navigate("My Work")}
                  onActivity={() =>
                    changeRoute({
                      view: "Organization",
                      organizationActivity: true,
                      tab: "Overview",
                      work: route.work,
                    })
                  }
                  onWorker={(id) => {
                    delete workerDirectorySources.current[id];
                    changeRoute({
                      view: "Organization",
                      workerId: id,
                      tab: "Overview",
                      work: route.work,
                    });
                  }}
                  onWorkstream={(id) =>
                    changeRoute({
                      view: "Organization",
                      workstreamId: id,
                      tab: "Overview",
                      work: route.work,
                    })
                  }
                />
              </>
            )}
          {view === "My Work" && route.personalQueue && (
            <>
              <button
                className="button secondary"
                onClick={() => navigate("My Work")}
              >
                Back to My Work
              </button>
              <div className="page-heading workstream-heading">
                <div>
                  <div className="eyebrow">MY WORK · ALEX MORGAN</div>
                  <h1 tabIndex={-1}>Response queue</h1>
                  <p>Your sample assignments grouped by response state.</p>
                </div>
              </div>
              <OrganizationWork
                filters={queueView}
                onFilters={setQueueView}
                completed={completed}
                readiness={readiness}
                onOpen={open}
              />
            </>
          )}
          {view === "Demos" && route.largeOrganization && (
            <LargeOrganizationDemo onBack={() => navigate("Demos")} />
          )}
          {view === "Demos" && !route.largeOrganization && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">DESIGN DEMONSTRATIONS</div>
                  <h1 tabIndex={-1}>Collaboration demos</h1>
                  <p>
                    Explore a standalone revision cycle with fictional records.
                  </p>
                </div>
              </div>
              <section className="panel org-stream org-overview-section">
                <h2>Customer walkthrough</h2>
                <p>
                  Explore goals, scoped workers, responsibility proposals,
                  personal work and evidence across eight guided steps.
                </p>
                <p>
                  This tour uses the main sample workspace. It does not reset
                  existing local responses or proposals.
                </p>
                <button
                  className="button primary"
                  onClick={() => openTourStep(0)}
                >
                  Start customer walkthrough
                </button>
              </section>
              <section className="panel org-stream org-overview-section">
                <h2>Larger organization scenario</h2>
                <p>
                  <button
                    className="button primary"
                    onClick={() =>
                      changeRoute({
                        view: "Organization",
                        tab: "Overview",
                        scenarioPath: "/organizations/large",
                      })
                    }
                  >
                    Open larger scenario workspace
                  </button>
                </p>
                <p>
                  Explore six workstreams, multiple assignees and scoped
                  workers.
                </p>
                <button
                  className="button secondary"
                  onClick={() =>
                    changeRoute({
                      view: "Demos",
                      largeOrganization: true,
                      tab: "Overview",
                      work: route.work,
                    })
                  }
                >
                  Explore larger organization
                </button>
              </section>
              <section className="panel org-stream org-overview-section">
                <h2>Knowledge organization scenario</h2>
                <p>
                  Explore guide creation and workshop coordination, with Maya’s
                  editorial inbox and Leo’s coordination inbox.
                </p>
                <button
                  className="button primary"
                  onClick={() =>
                    changeRoute({
                      view: "Organization",
                      tab: "Overview",
                      scenarioPath: "/organizations/knowledge?persona=maya",
                    })
                  }
                >
                  Open knowledge scenario workspace
                </button>
              </section>
              <RevisionCycle />
            </>
          )}
          {view === "Evidence" && !route.scenarioPath && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">THE RECORD BEHIND THE WORK</div>
                  <h1 tabIndex={-1}>Evidence, connected.</h1>
                  <p>Inspect the artifacts and decisions behind a result.</p>
                </div>
                <span className="badge neutral">Sample records</span>
              </div>
              <section className="panel evidence-index">
                <div className="panel-header">
                  <div>
                    <h2>
                      Payments API <span className="count-badge">v1.8.2</span>
                    </h2>
                    <p>
                      Release A-1041: only its sample subject is connected.
                      A-1042 review evidence is listed separately below.
                    </p>
                  </div>
                  <GitBranch size={23} />
                </div>
                <div className="evidence-chain">
                  {[
                    "Contribution",
                    "Test evidence",
                    "Assessment",
                    "Authority",
                    "Effect",
                  ].map((label, i) => (
                    <React.Fragment key={label}>
                      <div className="chain-node">
                        <span>
                          <Circle size={18} />
                        </span>
                        <strong>{label}</strong>
                        <small>
                          {i < 3
                            ? i === 0
                              ? "Sample release subject"
                              : "Not connected"
                            : i === 3
                              ? completed["A-1041"] || "Awaiting decision"
                              : "Not established"}
                        </small>
                      </div>
                      {i < 4 && (
                        <ArrowRight className="chain-arrow" size={19} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {assignments
                  .filter(
                    (a) =>
                      evidenceFor(a.id).length > 0 ||
                      receipts.some((r) => r.assignmentId === a.id),
                  )
                  .map((a) => (
                    <section
                      className="evidence-group"
                      key={a.id}
                      aria-label={`Evidence for ${a.id}`}
                    >
                      <h3>
                        {a.id} · {a.title}
                      </h3>
                      <EvidenceArtifacts
                        assignmentId={a.id}
                        query={evidenceQueries[a.id] ?? ""}
                        setQuery={(value) =>
                          setEvidenceQueries((old) => ({
                            ...old,
                            [a.id]: value,
                          }))
                        }
                        onInspect={setArtifact}
                      />
                      {receipts
                        .filter((record) => record.assignmentId === a.id)
                        .map((record) => (
                          <button
                            key={record.id}
                            className="artifact-link evidence-row"
                            onClick={() => {
                              open(a, "Activity");
                            }}
                          >
                            <FileCheck2 size={20} />
                            <span>
                              <strong>{record.decision} receipt</strong>
                              <small>
                                {a.id} · Local demo record · Not server-admitted
                              </small>
                            </span>
                            <ArrowUpRight size={17} />
                          </button>
                        ))}
                    </section>
                  ))}
                <button
                  className="artifact-link evidence-row"
                  onClick={() => {
                    open(assignments[1]);
                  }}
                >
                  <span className="file-icon">
                    <ShieldCheck size={22} />
                  </span>
                  <span>
                    <strong>Release decision</strong>
                    <small>A-1041 · Assigned to Alex Morgan</small>
                  </span>
                  <span className="badge authority">
                    {completed["A-1041"] || "Pending"}
                  </span>
                  <ArrowUpRight size={17} />
                </button>
              </section>
              <div className="inline-note">
                <BookOpen size={18} />
                <p>
                  A successful test is evidence. An approval is authority. A
                  confirmed deployment is an established effect. This view keeps
                  those records distinct.
                </p>
              </div>
            </>
          )}
          <footer className="page-footer">
            <span>
              <Blocks size={13} /> Forge workspace
            </span>
            <span>
              Design exploration 01 <span className="footer-dot">·</span> All
              names and records are fictional
            </span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <CircleCheck size={19} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {decision && selected && (
        <ResponseDialog
          selected={selected}
          draft={responseDraft}
          readiness={readiness}
          setReadiness={setReadiness}
          submission={submission}
        />
      )}
      {proposalGap && (
        <Modal
          title="Responsibility proposal"
          onClose={() => setProposalGap(null)}
        >
          <ResponsibilityProposal
            key={proposalGap}
            gapId={proposalGap}
            proposal={proposals[proposalGap]}
            onRecord={(proposal) =>
              setProposals((old) => ({ ...old, [proposal.gapId]: proposal }))
            }
            onDecide={(decision) =>
              setProposals((old) => {
                const current = old[proposalGap];
                if (!current || current.decision) return old;
                return { ...old, [proposalGap]: { ...current, decision } };
              })
            }
            onRemove={() => {
              setProposals((old) => {
                const next = { ...old };
                delete next[proposalGap];
                return next;
              });
              setProposalGap(null);
              if (route.organizationActivity)
                requestAnimationFrame(() =>
                  document.querySelector<HTMLElement>("main h1")?.focus(),
                );
            }}
          />
        </Modal>
      )}
      {artifact && (
        <Modal title="Artifact inspector" onClose={() => setArtifact(null)}>
          <div className="modal-kicker">
            <FileCode2 size={18} />
            SAMPLE ARTIFACT
          </div>
          <ArtifactContents artifact={artifact} />
          <button
            className="button secondary"
            onClick={() => setArtifact(null)}
          >
            Close inspector
          </button>
        </Modal>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

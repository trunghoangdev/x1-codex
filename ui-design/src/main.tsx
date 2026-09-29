import { DemoControls } from "./DemoControls";
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
import { DecisionProblem, decisionBlocked } from "./ReleaseReview";
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
import { ReleaseReview, ReleaseSubject } from "./ReleaseReview";
const assignmentTabs = [
  "Overview",
  "Attempts",
  "Candidate",
  "Checks",
  "Evidence",
  "Activity",
];

type View = "My Work" | "Organization" | "Evidence";
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
  const selected = assignments.find((a) => a.id === route.assignmentId) ?? null;
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
  const [decision, setDecision] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const reason =
    selected && decision ? (drafts[selected.id]?.[decision] ?? "") : "";
  function setReason(value: string) {
    if (!selected || !decision) return;
    const id = selected.id,
      kind = decision;
    setDrafts((previous) => ({
      ...previous,
      [id]: { ...previous[id], [kind]: value },
    }));
  }
  function discardDraft(id: string, kind: string) {
    if (
      !window.confirm(
        `Delete the ${kind.toLowerCase()} draft for ${id}? This cannot be undone.`,
      )
    )
      return;
    setDrafts((previous) => {
      const remaining = { ...previous[id] };
      delete remaining[kind];
      return { ...previous, [id]: remaining };
    });
  }
  const [notice, setNotice] = useState("");
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
  const inboxReturn = useRef<{ id: string; y: number } | null>(null);
  const screenKey = `${route.view}:${route.assignmentId ?? ""}:${!!route.invalid}`;
  const previousScreen = useRef(screenKey);
  useEffect(() => {
    if (route.view !== "My Work" || route.assignmentId)
      setWorkDataState("ready");
    if (previousScreen.current === screenKey) return;
    const previous = previousScreen.current;
    previousScreen.current = screenKey;
    // Run after route-driven dialogs have closed and restored their opener.
    const frame = requestAnimationFrame(() => {
      const saved = inboxReturn.current;
      if (
        route.view === "My Work" &&
        !route.assignmentId &&
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
      document.querySelector<HTMLElement>("main h1")?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [screenKey, route.view, route.assignmentId]);
  const active = assignments.filter((a) => !completed[a.id]);
  const hasDraft = (id: string) =>
    Object.values(drafts[id] ?? {}).some((text) => text.trim());
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
    setMobile(false);
  }, [route.view, route.assignmentId, route.tab, route.invalid]);
  function navigate(next: View) {
    changeRoute({ view: next, tab: "Overview", work: route.work });
  }
  function open(a: Assignment, nextTab = "Overview") {
    if (view === "My Work" && !selected)
      inboxReturn.current = { id: a.id, y: window.scrollY };
    changeRoute({
      view: "My Work",
      assignmentId: a.id,
      tab: nextTab,
      work: route.work,
    });
  }
  function navigateRelated(next: RelatedTab) {
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }
  function commitDecision() {
    if (!selected || !reason.trim() || !decision || completed[selected.id])
      return;
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
    setDrafts((previous) => {
      const remaining = { ...previous };
      delete remaining[selected.id];
      return remaining;
    });
  }
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
            navigate("My Work");
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
            <strong>Software Factory</strong>
            <span>Acme organization</span>
          </div>
          <span className="live-dot" title="Demo workspace" />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav id="workspace-navigation" aria-label="Main navigation">
          {(
            [
              ["My Work", Inbox],
              ["Organization", Users],
              ["Evidence", Layers3],
            ] as const
          ).map(([name, Icon]) => (
            <button
              key={name}
              className={`nav-item ${view === name ? "active" : ""}`}
              aria-current={view === name ? "page" : undefined}
              onClick={() => navigate(name)}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "My Work" && (
                <b
                  aria-label={
                    workDataState === "loading" || workDataState === "error"
                      ? "Assignment count unavailable"
                      : undefined
                  }
                >
                  {workDataState === "loading" || workDataState === "error"
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
            <span className="avatar">AM</span>
            <div>
              <strong>Alex Morgan</strong>
              <span>Reviewer · Release authority</span>
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
            <strong>{view}</strong>
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
            <span className="tiny-avatar">AM</span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
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
          {view === "My Work" && !selected && (
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
              <button className="back-link" onClick={() => navigate("My Work")}>
                <ArrowLeft size={16} />
                Back to My Work
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
                      Object.entries(drafts[selected.id] ?? {}).some(
                        ([, text]) => text.trim(),
                      ) && (
                        <aside
                          className="review-draft-shortcut"
                          aria-label="Review draft shortcuts"
                        >
                          <strong>Your draft is kept in this session</strong>
                          {Object.entries(drafts[selected.id] ?? {})
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
                        <AssignmentRequirements assignmentId={selected.id} />
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
                      Object.entries(drafts[selected.id] ?? {}).some(
                        ([, text]) => text.trim(),
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
                          {Object.entries(drafts[selected.id] ?? {})
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
          {view === "Organization" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">PEOPLE + AGENTS</div>
                  <h1 tabIndex={-1}>One team. Clear responsibility.</h1>
                  <p>
                    See who contributes, who assesses, and who has the authority
                    to decide.
                  </p>
                </div>
                <span className="badge work">Software Factory</span>
              </div>
              <div className="org-banner">
                <div>
                  <span className="section-label">ORGANIZATION</span>
                  <h2>Build software with accountable collaboration.</h2>
                  <p>
                    Human judgment and specialized workers, connected through
                    explicit assignments.
                  </p>
                </div>
                <Users size={55} />
              </div>
              <OrganizationWork
                completed={completed}
                readiness={readiness}
                onOpen={open}
              />
              <div className="role-grid">
                {[
                  {
                    role: "Planner",
                    name: "Jamie Chen",
                    type: "Human",
                    initials: "JC",
                    permission: "Propose assignments",
                    count: "2 planning",
                    icon: BookOpen,
                  },
                  {
                    role: "Developer",
                    name: "Codex worker",
                    type: "AI worker",
                    initials: "CW",
                    permission: "Submit source contributions",
                    count: "1 contribution ready",
                    icon: Code2,
                  },
                  {
                    role: "Reviewer",
                    name: "Alex Morgan",
                    type: "Human · You",
                    initials: "AM",
                    permission: "Submit assessments",
                    count: `${active.filter((a) => a.kind === "Assessment").length} awaiting review`,
                    icon: FileCheck2,
                  },
                  {
                    role: "Release authority",
                    name: "Alex Morgan",
                    type: "Human · You",
                    initials: "AM",
                    permission: "Approve or refuse releases",
                    count: completed["A-1041"]
                      ? "Local response recorded"
                      : "1 decision requested",
                    icon: ShieldCheck,
                  },
                  {
                    role: "Executor",
                    name: "Release runner",
                    type: "Deterministic worker",
                    initials: "RR",
                    permission: "Execute authorized releases",
                    count: "Execution status not connected",
                    icon: GitBranch,
                  },
                ].map(
                  ({
                    role,
                    name,
                    type,
                    initials,
                    permission,
                    count,
                    icon: Icon,
                  }) => (
                    <section className="panel role-card" key={role}>
                      <div className="role-top">
                        <span className="row-icon work">
                          <Icon size={22} />
                        </span>
                        <span className="badge neutral">{type}</span>
                      </div>
                      <h2>{role}</h2>
                      <div className="role-person">
                        <span className="avatar">{initials}</span>
                        <strong>{name}</strong>
                      </div>
                      <div className="section-rule" />
                      <p className="role-permission">
                        <LockKeyhole size={14} />
                        {permission}
                      </p>
                      <span className="role-count">
                        <span className="live-dot" />
                        {count} · sample
                      </span>
                    </section>
                  ),
                )}
              </div>
              <div className="inline-note">
                <ShieldCheck size={19} />
                <p>
                  Roles describe responsibility. A worker binding identifies who
                  performs it. Permission to contribute does not imply
                  permission to approve or execute.
                </p>
              </div>
            </>
          )}
          {view === "Evidence" && (
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
        <Modal
          title={`${decision} for ${selected.id}`}
          onClose={() => setDecision(null)}
        >
          <div className="modal-kicker">
            <ShieldCheck size={18} />
            {selected.role} · {selected.authority}
          </div>
          <p>
            You are recording a response for <strong>{selected.title}</strong>.
          </p>
          {selected.kind === "Authority" && (
            <>
              <ReleaseSubject />
              <p className="demo-note">
                Prerequisite snapshot: {readiness}. This decision applies only
                to the subject above.
              </p>
            </>
          )}
          {selected.kind === "Authority" && (
            <>
              <DemoControls context="Decision changes">
                <label className="check-scenario">
                  Simulate a change before recording
                  <select
                    value={decisionBlocked(readiness) ? readiness : "unchanged"}
                    onChange={(e) => setReadiness(e.target.value as Readiness)}
                  >
                    <option value="unchanged" disabled>
                      No change
                    </option>
                    <option value="load-error">Review data load failed</option>
                    <option value="stale">Candidate changed</option>
                    <option value="revoked">Authority revoked</option>
                  </select>
                </label>
              </DemoControls>
              <DecisionProblem
                state={readiness}
                onReset={() => {
                  setReadiness("missing");
                  setDecision(null);
                }}
              />
            </>
          )}
          <p className="demo-note">
            Draft kept in this session as you type. Closing this dialog does not
            submit or delete it. Refresh clears it.
          </p>
          <label className="textarea-label" htmlFor="rationale">
            {selected.kind === "Work"
              ? "Contribution and acceptance criteria"
              : "Decision rationale"}{" "}
            <span>Required</span>
          </label>
          <textarea
            id="rationale"
            data-initial-focus
            rows={5}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain your conclusion and cite the evidence you reviewed…"
          />
          <div className="inline-note">
            <LockKeyhole size={17} />
            <p>
              This simulates a record in this browser session. It does not
              contact Forge, authorize a real release, or persist after refresh.
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setDecision(null)}
            >
              Cancel
            </button>
            <button
              className="button primary"
              disabled={
                !reason.trim() ||
                (selected.kind === "Authority" && decisionBlocked(readiness)) ||
                (decision === "Approval" && readiness !== "ready")
              }
              onClick={commitDecision}
            >
              Record {decision.toLowerCase()}
              <Check size={16} />
            </button>
          </div>
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
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = () =>
      Array.from(
        el?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), summary, a[href], [tabindex="0"]',
        ) ?? [],
      ).filter((node) => node.getClientRects().length > 0);
    const siblings = Array.from(
      el?.parentElement?.parentElement?.children ?? [],
    ).filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && node !== el?.parentElement,
    );
    const inertBefore = siblings.map((node) => node.inert);
    siblings.forEach((node) => {
      node.inert = true;
    });
    const elements = focusables();
    (
      el?.querySelector<HTMLElement>("[data-initial-focus]") || elements?.[0]
    )?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const all = focusables();
        if (!all?.length) return;
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = old;
      siblings.forEach((node, index) => {
        node.inert = inertBefore[index];
      });
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={ref}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

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
import { Candidate } from "./Candidate";
import { Checks } from "./Checks";
import {
  ReleaseReview,
  ReleaseSubject,
  releaseSubject,
  type Readiness,
} from "./ReleaseReview";
const assignmentTabs = [
  "Overview",
  "Attempts",
  "Candidate",
  "Checks",
  "Evidence",
  "Activity",
];

type View = "My Work" | "Organization" | "Evidence";
type Kind = "Assessment" | "Authority" | "Work" | "Reconciliation";
type Assignment = {
  id: string;
  title: string;
  project: string;
  kind: Kind;
  role: string;
  authority: string;
  due: string;
  owner: string;
  initials: string;
  summary: string;
  artifact: string;
};
const assignments: Assignment[] = [
  {
    id: "A-1042",
    title: "Review retry handling for payment webhooks",
    project: "Payments API",
    kind: "Assessment",
    role: "Reviewer",
    authority: "assessment.submit",
    due: "Today",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "Review the proposed retry behavior for failed webhook deliveries. Confirm that repeated events cannot trigger duplicate payments, and assess the attached test evidence.",
    artifact: "Retry handling · changeset c8e4a21",
  },
  {
    id: "A-1041",
    title: "Authorize Payments API release v1.8.2",
    project: "Payments API",
    kind: "Authority",
    role: "Release authority",
    authority: "release.approve",
    due: "Today",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "Decide whether the exact release candidate v1.8.2 may proceed to deployment. Your approval authorizes this candidate only; execution and confirmation are separate steps.",
    artifact: "Release candidate · v1.8.2",
  },
  {
    id: "A-1038",
    title: "Clarify acceptance criteria for team invitations",
    project: "Team Workspace",
    kind: "Work",
    role: "Product owner",
    authority: "contribution.submit",
    due: "Tomorrow",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "Define the expected behavior for expired invitations and existing organization members. Submit acceptance criteria for the implementation assignment.",
    artifact: "Invitation requirements · revision 3",
  },
  {
    id: "A-1035",
    title: "Reconcile staging deployment confirmation",
    project: "Payments API",
    kind: "Reconciliation",
    role: "Operator",
    authority: "reconciliation.submit",
    due: "Today",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "The deployment request was accepted, but its final effect is unconfirmed. Compare the staging observation with the expected artifact and record your assessment. Do not assume success from request acceptance alone.",
    artifact: "Staging deployment · observation 238",
  },
  {
    id: "A-1032",
    title: "Assess accessibility fixes for onboarding",
    project: "Team Workspace",
    kind: "Assessment",
    role: "Reviewer",
    authority: "assessment.submit",
    due: "Friday",
    owner: "Alex Morgan",
    initials: "AM",
    summary:
      "Check keyboard navigation, focus order, and form error announcements against the proposed onboarding changes.",
    artifact: "Onboarding accessibility · changeset 91bca02",
  },
];
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
const digest =
  "sha256:7d8f042cb36255e78de621025a315f7f862013b0c9ec6c47dbf4a928fe62a903";
const artifacts = [
  {
    title: "Source change",
    id: "AR-771",
    detail: "Changeset c8e4a21 · 3 files changed",
    icon: FileCode2,
  },
  {
    title: "Test results",
    id: "AR-775",
    detail: "42 passed · 0 failed · Node staging-01",
    icon: CircleCheck,
  },
  {
    title: "Worker contribution",
    id: "AR-776",
    detail: "Implementation notes · Codex worker",
    icon: FileText,
  },
];
function App() {
  const [view, setView] = useState<View>("My Work");
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<Kind | "All">("All");
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("Overview");
  const [readiness, setReadiness] = useState<Readiness>("missing");
  const [decision, setDecision] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [artifact, setArtifact] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activity, setActivity] = useState<string[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const active = assignments.filter((a) => !completed[a.id]);
  const visible = assignments.filter(
    (a) =>
      (showCompleted ? !!completed[a.id] : !completed[a.id]) &&
      (filter === "All" || a.kind === filter) &&
      `${a.id} ${a.title} ${a.project}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  function navigate(next: View) {
    setView(next);
    setSelected(null);
    setMobile(false);
  }
  function open(a: Assignment) {
    setSelected(a);
    setTab("Overview");
  }
  function commitDecision() {
    if (!selected || !reason.trim() || !decision || completed[selected.id])
      return;
    if (decision === "Approval" && readiness !== "ready") return;
    setCompleted((prev) => ({ ...prev, [selected.id]: decision }));
    setActivity((prev) => [
      `${decision} · ${selected.id} · ${selected.kind === "Authority" ? `${releaseSubject.label} · ${releaseSubject.digest} · ${releaseSubject.target} · prerequisites: ${readiness} · ` : ""}${reason.trim()}`,
      ...prev,
    ]);
    setNotice(
      `${decision} recorded in this demo. No external action was taken.`,
    );
    setDecision(null);
    setReason("");
  }
  return (
    <div className="app">
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
        <nav aria-label="Main navigation">
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
              onClick={() => navigate(name)}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "My Work" && <b>{active.length}</b>}
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
        <main>
          {view === "My Work" && !selected && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR WORKSPACE, IN FOCUS</div>
                  <h1 ref={headingRef}>
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
                        setFilter(filter === kind ? "All" : kind);
                        setShowCompleted(false);
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
                            : "You’re all caught up here"}
                        </h3>
                        <p>
                          {query
                            ? "Try another title, project, or assignment ID."
                            : "Choose another category or return to all assignments."}
                        </p>
                        <button
                          className="button secondary"
                          onClick={() => {
                            setFilter("All");
                            setQuery("");
                            setShowCompleted(false);
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
            </>
          )}
          {view === "My Work" && selected && (
            <>
              <button className="back-link" onClick={() => setSelected(null)}>
                <ArrowLeft size={16} />
                Back to My Work
              </button>
              <div className="detail-heading">
                <div className="assignment-meta">
                  {selected.id}
                  <span> / </span>
                  {selected.project}
                </div>
                <h1>{selected.title}</h1>
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
                        {t === "Evidence" && <span>3</span>}
                      </button>
                    ))}
                  </div>
                  <section
                    className="panel detail-panel"
                    role="tabpanel"
                    id="assignment-tabpanel"
                    aria-labelledby={`tab-${tab}`}
                  >
                    {tab === "Overview" ? (
                      <>
                        <div className="section-label">THE RESPONSIBILITY</div>
                        <h2>A clear next step, with the full context.</h2>
                        <p className="summary">{selected.summary}</p>
                        <div className="section-rule" />
                        <h3>Exact input</h3>
                        <button
                          className="artifact-link"
                          onClick={() => setArtifact(selected.artifact)}
                        >
                          <span className="file-icon">
                            <FileCode2 size={21} />
                          </span>
                          <span>
                            <strong>{selected.artifact}</strong>
                            <small>Immutable reference · sample artifact</small>
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
                        {artifacts.map(({ title, id, detail, icon: Icon }) => (
                          <button
                            className="artifact-link evidence-row"
                            key={id}
                            onClick={() => setArtifact(`${id} · ${title}`)}
                          >
                            <span className="file-icon">
                              <Icon size={22} />
                            </span>
                            <span>
                              <strong>{title}</strong>
                              <small>
                                {id} · {detail}
                              </small>
                            </span>
                            <ArrowUpRight size={17} />
                          </button>
                        ))}
                      </>
                    ) : tab === "Checks" ? (
                      <Checks
                        key={selected.id}
                        assignmentId={selected.id}
                        response={completed[selected.id]}
                      />
                    ) : tab === "Candidate" ? (
                      <Candidate key={selected.id} assignmentId={selected.id} />
                    ) : tab === "Attempts" ? (
                      <Attempts assignmentId={selected.id} />
                    ) : (
                      <>
                        <div className="section-label">ASSIGNMENT HISTORY</div>
                        <h2>A traceable chain of responsibility</h2>
                        {[
                          ...activity.filter((a) => a.includes(selected.id)),
                          "Test runner attached test evidence · demo",
                          "Codex worker submitted its contribution · demo",
                          "Assignment admitted and assigned to Alex · demo",
                        ].map((a, i) => (
                          <div className="timeline-item" key={i}>
                            <span className="timeline-dot" />
                            <div>
                              <strong>{a}</strong>
                              <small>
                                {i === 0 && completed[selected.id]
                                  ? "Just now in this session"
                                  : "September 22 · sample record"}
                              </small>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </section>
                </div>
                <aside>
                  <section className="panel authority-panel">
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
                            setReason("");
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
                            onClick={() => {
                              setReason("");
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
                  <h1>One team. Clear responsibility.</h1>
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
                    count: "2 awaiting review",
                    icon: FileCheck2,
                  },
                  {
                    role: "Release authority",
                    name: "Alex Morgan",
                    type: "Human · You",
                    initials: "AM",
                    permission: "Approve or refuse releases",
                    count: "1 decision requested",
                    icon: ShieldCheck,
                  },
                  {
                    role: "Executor",
                    name: "Release runner",
                    type: "Deterministic worker",
                    initials: "RR",
                    permission: "Execute authorized releases",
                    count: "Awaiting authorization",
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
                  <h1>Evidence, connected.</h1>
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
                      From contribution to authority. Each record has its own
                      meaning.
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
                      <div className={`chain-node ${i < 3 ? "done" : ""}`}>
                        <span>
                          {i < 3 ? <Check size={20} /> : <Circle size={18} />}
                        </span>
                        <strong>{label}</strong>
                        <small>
                          {i < 3
                            ? "Attached"
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
                {artifacts.map(({ title, id, detail, icon: Icon }) => (
                  <button
                    key={id}
                    className="artifact-link evidence-row"
                    onClick={() => setArtifact(`${id} · ${title}`)}
                  >
                    <span className="file-icon">
                      <Icon size={22} />
                    </span>
                    <span>
                      <strong>{title}</strong>
                      <small>
                        {id} · {detail}
                      </small>
                    </span>
                    <span className="badge work">Inspectable</span>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
                <button
                  className="artifact-link evidence-row"
                  onClick={() => {
                    setView("My Work");
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
          <label className="textarea-label" htmlFor="rationale">
            {selected.kind === "Work"
              ? "Contribution and acceptance criteria"
              : "Decision rationale"}{" "}
            <span>Required</span>
          </label>
          <textarea
            id="rationale"
            autoFocus
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
          <h3>{artifact}</h3>
          <dl className="artifact-properties">
            <dt>Origin</dt>
            <dd>Software Factory · staging-01</dd>
            <dt>Produced by</dt>
            <dd>Codex worker / test runner (sample)</dd>
            <dt>Reference</dt>
            <dd>
              <code>{digest}</code>
            </dd>
          </dl>
          <div className="code-preview">
            <div>
              <span className="live-dot" />
              Illustrative evidence excerpt
            </div>
            <pre>
              {artifact.toLowerCase().includes("test")
                ? "PASS  duplicate event is processed once\nPASS  retry respects backoff interval\nPASS  expired delivery is not replayed\n\n42 passed · 0 failed\nSample data; no tests executed by this UI."
                : "Contribution: payment webhook retries\n\n+ Check event id before processing\n+ Retry transient failures with backoff\n+ Preserve delivery attempt history\n\nScope: source contribution only\nDeployment authority: not granted"}
            </pre>
          </div>
          <p className="demo-note">
            This inspector uses fictional data. Digests and provenance have not
            been verified.
          </p>
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
      el?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), textarea, input, [tabindex="0"]',
      );
    const elements = focusables();
    (el?.querySelector<HTMLElement>("[autofocus]") || elements?.[0])?.focus();
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
      previous?.focus();
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

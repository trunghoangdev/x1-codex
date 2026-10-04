import type { OrganizationScenario } from "./organizationScenario";
// Independently authored non-software sample. No publication or communication is executed.
const assignments: OrganizationScenario["assignments"] = [
  {
    id: "K-01-D",
    streamId: "K-01",
    workerId: "research",
    role: "Researcher",
    title: "Prepare a cited welcome guide",
    state: "In progress",
    input: "Approved topic outline; draft sources have not been verified.",
    expectedResponse:
      "A draft with source references and unresolved questions.",
  },
  {
    id: "K-01-E",
    streamId: "K-01",
    workerId: "maya",
    role: "Editor",
    title: "Clarify editorial acceptance criteria",
    state: "Awaiting editorial response",
    responseNeeded: true,
    input:
      "Welcome-guide brief and proposed outline; completed draft is not represented.",
    expectedResponse:
      "Editorial criteria and questions to return to the researcher; do not imply draft approval.",
  },
  {
    id: "K-01-P",
    streamId: "K-01",
    workerId: "leo",
    role: "Coordinator",
    title: "Confirm guide distribution scope",
    state: "Awaiting scope response",
    responseNeeded: true,
    input:
      "Proposed internal audience; no publication approval is represented.",
    expectedResponse:
      "Audience and channel constraints; distribution remains pending publication review.",
  },
  {
    id: "K-02-C",
    streamId: "K-02",
    workerId: "leo",
    role: "Coordinator",
    title: "Confirm workshop brief",
    state: "Awaiting scope response",
    responseNeeded: true,
    input: "Proposed workshop topic; attendance preferences are missing.",
    expectedResponse:
      "A brief with audience, schedule options and outstanding inputs.",
  },
  {
    id: "K-02-E",
    streamId: "K-02",
    workerId: "maya",
    role: "Editor",
    title: "Review workshop outline",
    state: "Waiting for brief",
    waitingForInput: true,
    input: "Coordinator brief has not been provided in this sample.",
    expectedResponse:
      "An outline review after the identified brief is available.",
  },
  {
    id: "K-02-F",
    streamId: "K-02",
    role: "Facilitator",
    title: "Facilitate the workshop",
    state: "Unassigned",
    input: "Confirmed brief and delivery plan are not represented.",
    expectedResponse:
      "A delivery plan and post-session observations; no session is scheduled.",
  },
];
const streams: OrganizationScenario["streams"] = [
  {
    id: "K-01",
    name: "New member welcome guide",
    project: "Knowledge sharing",
    goal: "Help new members find reliable answers and their next steps.",
    assignmentIds: ["K-01-D", "K-01-E", "K-01-P"],
    coordination:
      "Research and editorial criteria can progress in parallel. Draft assessment precedes publication review; distribution requires explicit approval. These are authored expectations, not confirmed transfers.",
    outcome: "Not verified · no reader observations represented",
  },
  {
    id: "K-02",
    name: "Member learning workshop",
    project: "Learning",
    goal: "Help members apply the welcome guide in a practical session.",
    assignmentIds: ["K-02-C", "K-02-E", "K-02-F"],
    coordination:
      "Coordinator brief → editorial outline review → facilitation plan → session observations. Missing brief and facilitator responsibility remain explicit.",
    outcome: "Not verified · no participant observations represented",
  },
];
export const knowledgeOrganization: OrganizationScenario = {
  id: "knowledge",
  domain: "Knowledge Operations",
  name: "Knowledge team sample",
  purpose: "Turn shared knowledge into useful guides and learning experiences.",
  readOnly: true,
  personas: [
    { workerId: "maya", label: "Maya · Editor" },
    { workerId: "leo", label: "Leo · Coordinator" },
  ],
  workers: [
    { id: "maya", name: "Maya Patel", type: "Human", category: "human" },
    { id: "leo", name: "Leo Rivera", type: "Human", category: "human" },
    {
      id: "research",
      name: "Research assistant",
      type: "AI worker",
      category: "ai",
    },
    {
      id: "publisher",
      name: "Distribution worker",
      type: "Deterministic worker",
      category: "deterministic",
    },
  ],
  roles: [
    {
      name: "Researcher",
      purpose: "Prepare source-linked material and identify uncertain claims.",
    },
    {
      name: "Editor",
      purpose: "Define editorial criteria and assess material against them.",
    },
    {
      name: "Coordinator",
      purpose: "Clarify audience, inputs and delivery arrangements.",
    },
    {
      name: "Publication reviewer",
      purpose: "Assess a named publication subject before distribution.",
    },
    { name: "Facilitator", purpose: "Plan and support the learning session." },
    {
      name: "Distributor",
      purpose: "Distribute explicitly approved material to a named audience.",
    },
  ],
  bindings: [
    {
      id: "kb-research",
      scopeIds: ["scope-K-01"],
      workerId: "research",
      role: "Researcher",
      scope: "New member welcome guide",
      permission: "Authored contribution scope; access not verified",
    },
    {
      id: "kb-editor",
      scopeIds: ["scope-K-01", "scope-K-02"],
      workerId: "maya",
      role: "Editor",
      scope: "Welcome guide and workshop outline",
      permission:
        "Authored editorial responsibility; publication approval not granted",
    },
    {
      id: "kb-coordinator",
      scopeIds: ["scope-K-01", "scope-K-02"],
      workerId: "leo",
      role: "Coordinator",
      scope: "Welcome guide and workshop arrangements",
      permission:
        "Authored coordination responsibility; publication approval not granted",
    },
    {
      id: "kb-distributor",
      scopeIds: ["knowledge-approved"],
      workerId: "publisher",
      role: "Distributor",
      scope: "Explicitly approved internal material",
      permission: "No effective distribution permission or approval verified",
    },
  ],
  scopes: [
    ...streams.map((s) => ({
      id: `scope-${s.id}`,
      kind: "workstream" as const,
      streamId: s.id,
      label: s.name,
    })),
    {
      id: "knowledge-approved",
      kind: "subject",
      subjectId: "approved-internal-material",
      label: "Explicitly approved internal material",
    },
  ],
  scopeRequirements: [
    {
      id: "guide-researcher",
      scopeId: "scope-K-01",
      role: "Researcher",
      bindingState: "declared",
      bindingIds: ["kb-research"],
      gapIds: [],
    },
    {
      id: "guide-editor",
      scopeId: "scope-K-01",
      role: "Editor",
      bindingState: "declared",
      bindingIds: ["kb-editor"],
      gapIds: [],
    },
    {
      id: "guide-coordinator",
      scopeId: "scope-K-01",
      role: "Coordinator",
      bindingState: "declared",
      bindingIds: ["kb-coordinator"],
      gapIds: [],
    },
    {
      id: "guide-publication",
      scopeId: "scope-K-01",
      role: "Publication reviewer",
      bindingState: "none",
      bindingIds: [],
      gapIds: ["knowledge-publication"],
    },
    {
      id: "guide-distributor",
      scopeId: "scope-K-01",
      role: "Distributor",
      bindingState: "unknown",
      bindingIds: [],
      unresolvedBindingIds: ["kb-distributor"],
      gapIds: [],
      note: "A conditional distribution binding exists, but its relationship to this guide is not declared. No publication approval or distribution assignment is represented.",
    },
    {
      id: "workshop-coordinator",
      scopeId: "scope-K-02",
      role: "Coordinator",
      bindingState: "declared",
      bindingIds: ["kb-coordinator"],
      gapIds: [],
    },
    {
      id: "workshop-editor",
      scopeId: "scope-K-02",
      role: "Editor",
      bindingState: "declared",
      bindingIds: ["kb-editor"],
      gapIds: [],
    },
    {
      id: "workshop-facilitator",
      scopeId: "scope-K-02",
      role: "Facilitator",
      bindingState: "none",
      bindingIds: [],
      gapIds: ["knowledge-facilitation"],
    },
  ],
  assignmentScopes: [
    { assignmentId: "K-01-D", scopeId: "scope-K-01", bindingId: "kb-research" },
    { assignmentId: "K-01-E", scopeId: "scope-K-01", bindingId: "kb-editor" },
    {
      assignmentId: "K-01-P",
      scopeId: "scope-K-01",
      bindingId: "kb-coordinator",
    },
    {
      assignmentId: "K-02-C",
      scopeId: "scope-K-02",
      bindingId: "kb-coordinator",
    },
    { assignmentId: "K-02-E", scopeId: "scope-K-02", bindingId: "kb-editor" },
    { assignmentId: "K-02-F", scopeId: "scope-K-02" },
  ],
  gaps: [
    {
      id: "knowledge-publication",
      workstreamId: "K-01",
      title: "Publication review responsibility",
      description:
        "No publication reviewer binding or publication review assignment is represented. An editorial response does not approve distribution.",
    },
    {
      id: "knowledge-facilitation",
      workstreamId: "K-02",
      title: "Workshop facilitation responsibility",
      description:
        "Facilitator role has no binding; K-02-F remains unassigned. Coordinator responsibility does not allocate facilitation.",
    },
  ],
  roleGaps: [
    { role: "Publication reviewer", gapId: "knowledge-publication" },
    { role: "Facilitator", gapId: "knowledge-facilitation" },
  ],
  dependencies: [
    {
      id: "workshop-brief-input",
      streamId: "K-02",
      input: "Workshop coordinator brief",
      provider: { assignmentId: "K-02-C" },
      receiverAssignmentId: "K-02-E",
      availability: "missing",
      receipt: "unconfirmed",
      description:
        "Maya's outline review requires Leo's brief with audience, schedule options and outstanding inputs. The brief is not represented in this sample.",
      returnPath:
        "Ambiguous audience or scheduling constraints return to the coordinator for clarification. No confirmed exchange or follow-up assignment is represented.",
    },
  ],
  parallelWork: [
    {
      id: "guide-research-and-criteria",
      streamId: "K-01",
      assignmentIds: ["K-01-D", "K-01-E"],
      description:
        "Research and editorial criteria may progress in parallel. This does not imply that a draft has been assessed or publication approved.",
    },
  ],
  assignments,
  streams,
  outcomes: streams.map((s) => ({
    streamId: s.id,
    boundary:
      "No observed readership, attendance or learning results are represented.",
    criteria: [
      {
        id: s.id + "-goal",
        title: s.goal,
        needed:
          s.id === "K-01"
            ? "Reader observations showing members can find answers and identify next steps."
            : "Participant observations showing members can apply the guide.",
        available: "Authored briefs and assignment descriptions only",
        evidenceIds: [],
        gap: "No outcome observations represented.",
      },
    ],
  })),
  evidence: [],
  flows: Object.fromEntries(
    streams.map((s) => [
      s.id,
      assignments
        .filter((a) => a.streamId === s.id)
        .map((a) => ({
          title: a.title,
          responsibility: a.role,
          state: a.state,
          exchange: a.input!,
          assignmentId: a.id,
        })),
    ]),
  ),
};

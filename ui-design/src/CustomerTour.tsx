import type { WorkspaceRoute } from "./useWorkspaceRoute";

export const customerTourSteps: {
  title: string;
  explanation: string;
  action: string;
  route: WorkspaceRoute;
}[] = [
  {
    title: "See the organization",
    explanation:
      "Start with shared goals, attention signals and scoped roles. My Work is each person's entrance into this organization.",
    action: "Inspect the goals and roles below.",
    route: { view: "Organization", tab: "Overview" },
  },
  {
    title: "Follow a workstream",
    explanation:
      "The invitation goal is still being clarified. A flow connects responsibilities and handoffs; it does not guarantee every later assignment already exists.",
    action:
      "Inspect the invitation goal, criteria assignment and missing responsibilities.",
    route: { view: "Organization", workstreamId: "WS-02", tab: "Overview" },
  },
  {
    title: "Understand roles and workers",
    explanation:
      "A worker can hold several roles with different scopes. Human, AI and deterministic workers participate through scoped responsibilities.",
    action:
      "Inspect Alex's bindings. A role binding does not automatically allocate an assignment.",
    route: { view: "Organization", workerId: "alex", tab: "Overview" },
  },
  {
    title: "Find a responsibility gap",
    explanation:
      "The invitation stream lacks implementation and assessment assignments. Organization attention makes these coordination needs visible.",
    action:
      "Read both responsibility signals and distinguish them from personal response requests.",
    route: {
      view: "Organization",
      attention: "Responsibility",
      tab: "Overview",
    },
  },
  {
    title: "Propose a worker",
    explanation:
      "A proposal names a worker, fixed role and scope with a reason. It awaits allocation; it grants no permission and leaves the gap open.",
    action:
      "Optionally open Propose responsibility, choose a sample worker and record a reason. Close the dialog to continue. This step can be skipped.",
    route: {
      view: "Organization",
      attention: "Responsibility",
      tab: "Overview",
    },
  },
  {
    title: "Enter personal work",
    explanation:
      "Switch to Alex's inbox. For the remaining steps we use the separate payment review example, because invitation implementation evidence is not available.",
    action:
      "Find A-1042, the payment retry assessment. These steps are a tour of two examples, not a single end-to-end execution.",
    route: { view: "My Work", tab: "Overview" },
  },
  {
    title: "Inspect the evidence",
    explanation:
      "The payment assignment links source, historical tests and review notes. Evidence identity and provenance matter before an assessment can be recorded.",
    action:
      "Open a cited artifact. Recording an assessment is optional and does not verify the workstream goal.",
    route: { view: "My Work", assignmentId: "A-1042", tab: "Evidence" },
  },
  {
    title: "Review the outcome",
    explanation:
      "A completed response is not proof of business success. Payment recovery and duplicate-processing goals still need observations tied to the intended subject.",
    action:
      "Read the remaining evidence gaps. Customer value comes from knowing what was done, who is responsible and what remains unverified.",
    route: { view: "Organization", outcomeId: "WS-01", tab: "Overview" },
  },
];

export function CustomerTour({
  step,
  onStep,
  onEnd,
}: {
  step: number;
  onStep: (step: number) => void;
  onEnd: () => void;
}) {
  const current = customerTourSteps[step];
  return (
    <section className="panel customer-tour" aria-label="Customer walkthrough">
      <div className="eyebrow">
        GUIDED SAMPLE · STEP {step + 1} OF {customerTourSteps.length}
      </div>
      <h2 tabIndex={-1}>{current.title}</h2>
      <p>{current.explanation}</p>
      <p>
        <strong>Try this:</strong> {current.action}
      </p>
      <p className="tour-boundary">
        Authored sample data. Local proposals and responses reset on refresh; no
        SF request is sent. Steps track navigation, not completion or verified
        outcomes.
      </p>
      <div className="tour-actions">
        <button
          className="button secondary"
          disabled={step === 0}
          onClick={() => onStep(step - 1)}
        >
          Previous step
        </button>
        <button className="button secondary" onClick={() => onStep(step)}>
          Open this step
        </button>
        {step < customerTourSteps.length - 1 ? (
          <button className="button primary" onClick={() => onStep(step + 1)}>
            Next step
          </button>
        ) : (
          <button className="button primary" onClick={onEnd}>
            Finish walkthrough
          </button>
        )}
        <button className="button secondary" onClick={onEnd}>
          Exit walkthrough
        </button>
      </div>
    </section>
  );
}

import { RelatedRecords, type NavigateRelated } from "./RelatedRecords";
import {
  CircleCheck,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { sampleCandidate } from "./candidateData";

export type Scenario = "passed" | "refused" | "unavailable";
type Observation = {
  executed: boolean;
  exit_code?: number;
  termination?: string;
  diagnostics: string;
};
const observations: Record<Scenario, Observation> = {
  passed: {
    executed: true,
    exit_code: 0,
    termination: "exit status 0",
    diagnostics:
      "Sample: the declared retry-delay check passed. This does not assess the entire assignment objective.",
  },
  refused: {
    executed: true,
    exit_code: 1,
    termination: "exit status 1",
    diagnostics:
      "Sample: the retry interval exceeded the declared upper bound.",
  },
  unavailable: {
    executed: false,
    diagnostics:
      "Sample: the validator could not be launched. No candidate verdict was observed.",
  },
};
export function Checks({
  assignmentId,
  response,
  onNavigate,
  scenario,
  setScenario,
}: {
  assignmentId: string;
  response?: string;
  onNavigate: NavigateRelated;
  scenario: Scenario;
  setScenario: (value: Scenario) => void;
}) {
  if (assignmentId !== sampleCandidate.assignmentId)
    return (
      <div className="empty-state">
        <HelpCircle size={28} />
        <h3>No sample checks for this assignment</h3>
        <p>
          Production observations are not connected. Missing evidence is not a
          passing result.
        </p>
      </div>
    );
  const observation = observations[scenario];
  const status = !observation.executed
    ? "Could not run"
    : observation.exit_code === 0
      ? "Validator passed"
      : "Validator refused";
  const Icon = !observation.executed
    ? HelpCircle
    : observation.exit_code === 0
      ? CircleCheck
      : AlertTriangle;
  return (
    <div className="checks-view">
      <RelatedRecords
        onNavigate={onNavigate}
        links={[
          { tab: "Candidate", label: "Inspect checked candidate" },
          ...(response
            ? [{ tab: "Activity" as const, label: "View recorded response" }]
            : []),
        ]}
      />
      <div className="section-label">CHECKS · SAMPLE DATA</div>
      <h2>Observed results, separate decisions.</h2>
      <p className="summary">
        A validator answers a specific check. Its result does not accept the
        candidate, grant approval, or establish an effect.
      </p>
      <label className="check-scenario">
        Preview an alternative observation
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value as Scenario)}
        >
          <option value="passed">Validator passed</option>
          <option value="refused">Validator refused</option>
          <option value="unavailable">Could not run</option>
        </select>
      </label>
      <p className="demo-note">
        These are independent fictional scenarios, not a history of three runs.
        Switching the preview changes no assignment or decision.
      </p>
      <article
        className={`check-observation check-${scenario}`}
        aria-label="Validator observation"
      >
        <div className="attempt-heading">
          <strong>Declared validator</strong>
          <span className="attempt-status" role="status">
            <Icon size={16} />
            {status}
          </span>
        </div>
        <dl className="attempt-fields">
          <div>
            <dt>Assignment / attempt</dt>
            <dd>
              {assignmentId} / {sampleCandidate.attemptId}
            </dd>
          </div>
          <div>
            <dt>Validator</dt>
            <dd>demo-retry-delay-validator</dd>
          </div>
          <div>
            <dt>Observed at · sample</dt>
            <dd>2026-09-22 09:30:00 UTC</dd>
          </div>
          <div>
            <dt>Executed</dt>
            <dd>{observation.executed ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt>Termination</dt>
            <dd>{observation.termination ?? "Not observed"}</dd>
          </div>
          <div>
            <dt>Exit code</dt>
            <dd>{observation.exit_code ?? "Not observed"}</dd>
          </div>
        </dl>
        <div className="attempt-artifact">
          <span>Candidate bytes digest · synthetic, not verified</span>
          <code>{sampleCandidate.candidateDigest}</code>
        </div>
        <details className="check-diagnostics">
          <summary>Diagnostic explanation</summary>
          <p>{observation.diagnostics}</p>
          <small>
            Diagnostic text is explanatory, not an authoritative decision.
          </small>
        </details>
      </article>
      <h3 className="check-gates-heading">Other checks and decisions</h3>
      <div className="check-gates">
        {[
          [
            "Human assessment",
            response === "Assessment"
              ? "Recorded in this demo session"
              : "Not recorded in this demo session",
          ],
          ["Publication admissibility", "No connected observation"],
          ["Applicability to target", "No connected observation"],
          ["Approval", "Not established by this validator"],
          ["External effect", "Not established"],
        ].map(([name, value]) => (
          <div className="check-gate" key={name}>
            <strong>{name}</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <div className="inline-note">
        <ShieldCheck size={18} />
        <p>
          A validator refusal is an observation for assessment, not an
          organizational rejection. Missing or passing observations never grant
          authority. Production enforcement belongs to the application backend.
        </p>
      </div>
    </div>
  );
}

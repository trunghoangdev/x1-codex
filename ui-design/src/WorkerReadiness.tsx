import type { OrganizationScenario } from "./data/organizationScenario";
import { facilitatorReadiness, workerProfile } from "./data/workerReadiness";
export function WorkerReadiness({
  scenario,
  workerId,
  compact = false,
}: {
  scenario: OrganizationScenario;
  workerId: string;
  compact?: boolean;
}) {
  const p = workerProfile(scenario, workerId);
  return (
    <section aria-label="Worker capabilities and availability">
      <h3>Capabilities and availability</h3>
      <p>
        <strong>Availability: {p.availability.status}</strong> ·{" "}
        {p.availability.scope}
      </p>
      {compact ? (
        <p>
          {p.capabilities.length
            ? p.capabilities.map((c) => c.label).join(" · ")
            : "Capabilities unknown"}
          . Declarations do not verify skill or spare capacity.
        </p>
      ) : (
        <>
          <p>{p.availability.note}</p>
          <h4>Declared capabilities</h4>
          {p.capabilities.length ? (
            <ul>
              {p.capabilities.map((c) => (
                <li key={c.id}>
                  <strong>{c.label}</strong> · {c.scope}
                  <p>{c.basis}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              No capability declarations supplied. Role names are not used to
              infer skills.
            </p>
          )}
          <h4>Constraints and confirmation needed</h4>
          <ul>
            {p.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      )}
      <p>Source: {p.source}. No live calendar or runtime capacity feed.</p>
    </section>
  );
}
export function FacilitatorCandidates({
  scenario,
  onWorker,
}: {
  scenario: OrganizationScenario;
  onWorker?: (id: string) => void;
}) {
  return (
    <section className="panel" aria-label="Facilitator candidate review">
      <h2>Before allocating K-02 facilitation</h2>
      <p>
        Required: a human who can facilitate a practical welcome-guide exercise
        for the brief’s audience, with confirmed preparation time and session
        availability. Review declarations and constraints; there is no automatic
        ranking or assignment.
      </p>
      <p>
        These profiles are authored examples, not worker self-reports or
        verified competencies. The current delivery loop supports an explicit
        offer to Leo only; another person requires a separate supported
        allocation and reviewer arrangement.
      </p>
      <div className="org-stream-grid">
        {scenario.workers.map((w) => {
          const r = facilitatorReadiness(scenario, w.id);
          return (
            <article
              className="panel"
              key={w.id}
              aria-label={`Facilitator candidate ${w.name}`}
            >
              <h3>{w.name}</h3>
              <p>{r.status}</p>
              <p>
                Availability: {r.profile.availability.status} ·{" "}
                {r.profile.availability.scope}
              </p>
              <p>{r.profile.availability.note}</p>
              <p>
                Linked assignments: {r.links.length}
                {r.links.length ? ` · ${r.links.join(" · ")}` : ""}. Links are
                context, not measured workload or available hours.
              </p>
              <ul>
                {r.profile.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              {onWorker && (
                <button className="text-link" onClick={() => onWorker(w.id)}>
                  Inspect profile · {w.name}
                </button>
              )}
            </article>
          );
        })}
      </div>
      <p>
        Before offering Leo the responsibility, ask for capability evidence and
        confirmation against the exact session window. Acceptance records
        agreement to the offer; it does not verify competence, calendar
        availability or production permission.
      </p>
    </section>
  );
}

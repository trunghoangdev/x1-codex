import { workerCapabilityProfile } from "./data/workerCapabilities";

export function WorkerCapability({ workerId }: { workerId: string }) {
  const profile = workerCapabilityProfile("main", workerId);
  return (
    <section
      className="panel org-stream org-overview-section"
      aria-label="Worker capability and availability"
    >
      <h2>Capability & declared availability</h2>
      {profile ? (
        <>
          <div className="eyebrow">
            {profile.category === "human"
              ? "HUMAN PLANNING PROFILE"
              : "AI PLANNING PROFILE"}{" "}
            · AUTHORED EXAMPLE
          </div>
          <h3>Relevant capabilities</h3>
          <ul>
            {profile.capabilities.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p>{profile.source}</p>
          <h3>
            Availability ·{" "}
            {profile.availability.state === "unknown"
              ? "Unknown"
              : "Stale declaration"}
          </h3>
          {profile.availability.state === "unknown" ? (
            <p>{profile.availability.reason}</p>
          ) : (
            <>
              <p>{profile.availability.statement}</p>
              <p>
                As of ·{" "}
                <time dateTime={profile.availability.asOf}>
                  {profile.availability.asOf}
                </time>
              </p>
              <p>
                Valid until ·{" "}
                <time dateTime={profile.availability.validUntil}>
                  {profile.availability.validUntil}
                </time>{" "}
                · expired authored reporting window
              </p>
              <p>{profile.availability.source}</p>
              <p>
                Current availability is unknown. Request an updated declaration
                before scheduling work.
              </p>
            </>
          )}
          <h3>Before allocating work</h3>
          <ul>
            {profile.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>
          No capability profile or availability declaration is represented for
          this worker. Role titles and assignment counts cannot supply those
          facts.
        </p>
      )}
      <p>
        This planning context does not validate suitability, allocate work or
        grant permissions. Deterministic executors additionally require an
        applicable subject, environment and explicit execution policy.
      </p>
    </section>
  );
}

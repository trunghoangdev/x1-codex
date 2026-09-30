import { reconciliationSnapshot as snapshot } from "./data/reconciliation";
export function ReconciliationReview() {
  return (
    <section
      className="reconciliation-review"
      aria-label="Staging reconciliation context"
    >
      <h3>Compare expected and observed effects</h3>
      <p>{snapshot.target} · synthetic example, not a live deployment.</p>
      <div className="org-work-grid">
        <article>
          <h4>Expected</h4>
          <p>{snapshot.expected}</p>
          <code>{snapshot.expectedDigest}</code>
          <p>Synthetic expected digest · not verified</p>
        </article>
        <article>
          <h4>Observed</h4>
          <p>{snapshot.observed}</p>
          <p>
            Running artifact: unknown. Health: unknown. Observation time:
            unavailable.
          </p>
        </article>
      </div>
      <h4>Still needed</h4>
      <p>{snapshot.missing}</p>
      <p>
        Request acceptance establishes neither success nor failure. This fixture
        supports an undetermined outcome only. Recording reconciliation does not
        retry or deploy anything.
      </p>
    </section>
  );
}

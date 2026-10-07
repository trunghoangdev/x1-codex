import type { HumanContributionState } from "./data/humanContribution";
import { contributionView } from "./data/contributionView";

function identity(value: unknown): string {
  return JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
}
export function ContributionReplacement({
  current,
  incoming,
  unsaved,
}: {
  current: HumanContributionState;
  incoming: HumanContributionState;
  unsaved: boolean | undefined;
}) {
  const before = contributionView(current);
  const after = contributionView(incoming);
  const versions = [
    ...new Set(
      [...current.contributions, ...incoming.contributions].map(
        (c) => c.version,
      ),
    ),
  ];
  const commandsChanged =
    identity(current.commands ?? []) !== identity(incoming.commands ?? []);
  return (
    <section aria-label="Contribution replacement impact">
      <h4>What will be replaced</h4>
      <p>
        {unsaved === true
          ? "Current work differs from the saved browser checkpoint. Replacing it discards those current-session differences unless you export them first."
          : unsaved === false
            ? "Current work matches the saved browser checkpoint."
            : "Current work has no comparable saved checkpoint. Export it first if you need to preserve it."}
      </p>
      <p>
        <strong>Current:</strong> {before.summary} · {before.stage}.
      </p>
      <p>
        <strong>After replacement:</strong> {after.summary} · {after.stage}.
      </p>
      <p>
        <strong>Next step after replacement:</strong> {after.contributorNext}
      </p>
      <ul>
        {versions.map((version) => {
          const old = current.contributions.find((c) => c.version === version);
          const next = incoming.contributions.find(
            (c) => c.version === version,
          );
          const fields =
            old && next
              ? [
                  old.body !== next.body && "text",
                  old.note !== next.note && "note",
                  old.citesInput !== next.citesInput && "citation",
                  identity(old.delivery) !== identity(next.delivery) &&
                    "delivery",
                  identity(old.receipt) !== identity(next.receipt) && "receipt",
                  identity(old.assessment) !== identity(next.assessment) &&
                    "assessment",
                ].filter(Boolean)
              : [];
          return (
            <li key={version}>
              draft-0{version}:{" "}
              {!next
                ? "removed from current session, including its delivery/receiver records"
                : !old
                  ? "added from the replacement"
                  : fields.length
                    ? `replaced fields: ${fields.join(", ")}`
                    : "unchanged"}
              .
            </li>
          );
        })}
      </ul>
      <p>
        Command history:{" "}
        {commandsChanged
          ? `replaced (${current.commands?.length ?? 0} current → ${incoming.commands?.length ?? 0} incoming)`
          : "unchanged"}
        . Restoring earlier local state does not cancel or query any server
        operation.
      </p>
      {(
        [
          ["Current work to replace", current],
          ["Incoming replacement", incoming],
        ] as const
      ).map(([label, state]) => (
        <details key={label}>
          <summary>Inspect {label.toLowerCase()}</summary>
          {state.contributions.map((c) => (
            <article
              key={c.version}
              aria-label={`${label} draft-0${c.version}`}
            >
              <h4>draft-0{c.version}</h4>
              <pre className="human-contribution-text">
                {c.body || "(empty text)"}
              </pre>
              <p>
                Note: {c.note || "(empty note)"}. Citation:{" "}
                {c.citesInput ? "selected" : "not selected"}.
              </p>
              <p>
                Delivery: {c.delivery?.id ?? "none"} · receipt:{" "}
                {c.receipt?.id ?? "none"} · assessment:{" "}
                {c.assessment?.id ?? "none"}.
              </p>
              {c.assessment && <p>{c.assessment.rationale}</p>}
            </article>
          ))}
          {state.commands?.map((c) => (
            <p key={c.id}>
              {c.id} · draft-0{c.version} · {c.status} · projection{" "}
              {c.projected ? "updated" : "not updated"}.
            </p>
          ))}
        </details>
      ))}
      <p>
        This replaces the whole local exercise. It does not merge histories or
        update the saved browser checkpoint. Cancel preserves current work.
      </p>
    </section>
  );
}

import { useState } from "react";
import { patternVersions } from "./data/operatingPatterns";
import {
  activePattern,
  patternWork,
  recordPatternEvent,
  workPattern,
  type PatternContext,
  type PatternEvent,
} from "./data/patternAdoption";
export function PatternAdoption({
  events,
  context,
  streamId,
  onChange,
  onSource,
}: {
  events: PatternEvent[];
  context: PatternContext;
  streamId: "K-01" | "K-02";
  onChange: (events: PatternEvent[]) => void;
  onSource: (path: string) => void;
}) {
  const active = activePattern(events, streamId),
    versions = patternVersions(streamId),
    works = patternWork(context, streamId);
  const [version, setVersion] = useState(active?.version ?? "pattern-v1"),
    [action, setAction] = useState<PatternEvent["action"]>("Adopt guidance"),
    [workId, setWorkId] = useState(""),
    [reason, setReason] = useState(""),
    [actor, setActor] = useState("observer");
  const [preview, setPreview] = useState<{
    identity: string;
    events: PatternEvent[];
  }>();
  const selected = versions.find((v) => v.version === version)!;
  const unlinked = works.filter((w) => !workPattern(events, streamId, w)),
    target = unlinked.find((w) => w.id === workId)?.id ?? unlinked[0]?.id ?? "";
  const identity = JSON.stringify({
    events,
    context,
    streamId,
    version,
    action,
    target,
    reason,
    actor,
  });
  const canRecord =
    actor === "owner" &&
    reason.trim() &&
    events.length < 20 &&
    (action === "Adopt guidance"
      ? active?.version !== version
      : active?.version === version && !!target);
  const history = events.filter((e) => e.stream === streamId);
  return (
    <section className="panel" aria-label="Versioned pattern adoption">
      <h2>Local pattern adoption</h2>
      <p>
        {active
          ? `Selected guidance: ${active.pattern.id} · ${active.version} · ${active.id}`
          : "Guidance association only · no local adoption recorded"}
      </p>
      <p>
        Choosing guidance does not allocate roles, grant authority, execute
        steps or certify conformance. Work associations start when explicitly
        recorded; earlier work is not retroactively certified. Existing
        associations stay pinned through upgrades or rollback.
      </p>
      <label>
        Pattern version
        <select
          aria-label="Pattern version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        >
          {versions.map((v) => (
            <option key={v.version}>{v.version}</option>
          ))}
        </select>
      </label>
      <details>
        <summary>Compare selected version with pattern-v1</summary>
        <p>
          {version === "pattern-v1"
            ? "Original authored guidance. No added expectations."
            : "v2 adds the following expectations; existing responsibilities and operational guards remain independent."}
        </p>
        <ul>
          {selected.exchanges
            .slice(version === "pattern-v1" ? 0 : versions[0].exchanges.length)
            .map((e) => (
              <li key={e}>{e}</li>
            ))}
        </ul>
        <p>{selected.revision}</p>
      </details>
      <label>
        Pattern control actor
        <select
          aria-label="Pattern control actor"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
        >
          <option value="observer">Observer · inspect only</option>
          <option value="owner">Demo organization owner</option>
        </select>
      </label>
      <p>
        Actor selection is a local demo control, not authentication or
        production policy.
      </p>
      <label>
        Pattern action
        <select
          aria-label="Pattern action"
          value={action}
          onChange={(e) => setAction(e.target.value as PatternEvent["action"])}
        >
          <option>Adopt guidance</option>
          <option>Associate work</option>
        </select>
      </label>
      {action === "Associate work" && active?.version !== version && (
        <p role="status">
          Select the currently adopted version before associating work. Existing
          associations cannot be reassigned in place.
        </p>
      )}
      {action === "Associate work" && (
        <label>
          Work record
          <select
            aria-label="Pattern work record"
            value={target}
            onChange={(e) => setWorkId(e.target.value)}
          >
            {!unlinked.length && (
              <option value="">No unassociated represented work</option>
            )}
            {unlinked.map((w) => (
              <option value={w.id} key={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        Reason and compatibility review
        <textarea
          aria-label="Pattern adoption rationale"
          maxLength={3000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain scope, compatibility and why existing work keeps its recorded version. No migration is implied."
        />
      </label>
      <button
        className="button secondary"
        disabled={!canRecord}
        onClick={() => {
          const next = recordPatternEvent(
            events,
            context,
            actor,
            action,
            streamId,
            version,
            target,
            reason,
            new Date().toISOString(),
          );
          if (next !== events) setPreview({ identity, events: next });
        }}
      >
        Review pattern change
      </button>
      {preview && (
        <section aria-label="Pattern change preview">
          <h3>Review exact pattern record</h3>
          <p>
            {action} · {streamId} · {version} · Demo organization owner
          </p>
          <p>{reason}</p>
          <p>
            {action === "Adopt guidance"
              ? "Existing work associations remain unchanged. New work needs its own explicit association."
              : `Associate ${preview.events.at(-1)!.work!.label}; no previous record is changed.`}
          </p>
          <details>
            <summary>Frozen guidance and context</summary>
            <pre>{JSON.stringify(preview.events.at(-1), null, 2)}</pre>
          </details>
          <button
            className="button"
            disabled={preview.identity !== identity}
            onClick={() => {
              if (preview.identity === identity) {
                onChange(preview.events);
                setPreview(undefined);
                setReason("");
              }
            }}
          >
            Confirm pattern change
          </button>
        </section>
      )}
      <h3>Work and retained version</h3>
      <p>
        Missing links are shown explicitly. To use new guidance for a repeated
        operation, create a fresh use/workshop cycle and associate that cycle.
        No in-place migration or automatic upgrade is performed.
      </p>
      {!works.length && (
        <p>
          No delivered contribution, use cycle, brief or workshop cycle
          represented for this workstream.
        </p>
      )}
      {works.length > 0 && (
        <ul>
          {works.map((w) => {
            const link = workPattern(events, streamId, w);
            return (
              <li key={w.id}>
                <strong>{w.label}</strong>
                <p>
                  {link
                    ? `${link.version} · recorded association ${link.id}${active?.version !== link.version ? " · retained earlier version" : ""}`
                    : "No pattern version recorded"}
                </p>
                <button
                  className="text-link"
                  onClick={() => onSource(w.destination)}
                >
                  Inspect work · {w.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <details>
        <summary>Pattern adoption history · {history.length} records</summary>
        {history.map((e) => (
          <article key={e.id}>
            <h3>
              {e.id} · {e.action} · {e.version}
            </h3>
            <p>
              {e.at} · {e.rationale}
            </p>
            {e.work &&
              !works.some(
                (w) => w.id === e.work!.id && w.source === e.work!.source,
              ) && (
                <p>
                  Historical work source is absent or differs in the current
                  workspace. This association does not transfer to a
                  replacement.
                </p>
              )}
            <pre>{JSON.stringify(e, null, 2)}</pre>
          </article>
        ))}
      </details>
      <p>
        Up to 20 pattern records across both workstreams; full frozen contexts
        also share the 4 MB workspace checkpoint limit.
      </p>
    </section>
  );
}
export function PatternStatus({
  events,
  context,
  streamId,
  onOpen,
}: {
  events: PatternEvent[];
  context: PatternContext;
  streamId: string;
  onOpen: () => void;
}) {
  const active = activePattern(events, streamId);
  if (!active) return null;
  const works = patternWork(context, streamId),
    linked = works.filter((w) => workPattern(events, streamId, w));
  return (
    <section className="panel" aria-label={`Pattern adoption ${streamId}`}>
      <h2>{streamId} · selected operating guidance</h2>
      <p>
        {active.pattern.id} · {active.version}
      </p>
      <p>
        {linked.length} of {works.length} represented work records have explicit
        version associations. Earlier associations retain their version;
        selection is not compliance or execution.
      </p>
      <button className="text-link" onClick={onOpen}>
        Inspect pattern versions · {streamId}
      </button>
    </section>
  );
}

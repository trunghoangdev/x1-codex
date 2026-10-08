import type { OrganizationScenario } from "./data/organizationScenario";
export function CoordinationInputs({
  scenario,
  streamId,
  assignmentId,
  completed = {},
  onAssignment,
  onWorker,
}: {
  scenario: OrganizationScenario;
  streamId?: string;
  assignmentId?: string;
  completed?: Record<string, string>;
  onAssignment: (id: string) => void;
  onWorker: (id: string) => void;
}) {
  const dependencies = scenario.dependencies.filter((d) =>
    streamId
      ? d.streamId === streamId
      : d.receiverAssignmentId === assignmentId ||
        ("assignmentId" in d.provider &&
          d.provider.assignmentId === assignmentId),
  );
  const parallel = scenario.parallelWork.filter((g) =>
    streamId
      ? g.streamId === streamId
      : g.assignmentIds.includes(assignmentId!),
  );
  if (!dependencies.length && !parallel.length) return null;
  const name = (id?: string) =>
    scenario.workers.find((w) => w.id === id)?.name ?? "Unassigned";
  return (
    <section
      className="panel org-stream org-overview-section coordination-inputs"
      aria-label="Coordination inputs"
    >
      <h2>Dependencies & input exchange</h2>
      <p>
        Explicit relationships; local exchange records are labeled separately.
        List order and shared project names do not establish dependencies.
      </p>
      {dependencies.map((d) => {
        const receiver = scenario.assignments.find(
          (a) => a.id === d.receiverAssignmentId,
        )!;
        const provider = d.provider;
        const source =
          "assignmentId" in provider
            ? scenario.assignments.find((a) => a.id === provider.assignmentId)!
            : undefined;
        const providerId =
          source?.workerId ??
          ("workerId" in d.provider ? d.provider.workerId : undefined);
        return (
          <article
            className="org-stream-assignment"
            aria-label={d.input}
            key={d.id}
          >
            <span className="badge neutral">
              {d.availability === "missing"
                ? "Input missing"
                : "Sample input represented"}
            </span>
            <h3>{d.input}</h3>
            <p>{d.description}</p>
            <div className="coordination-exchange">
              <div>
                <h4>Provider</h4>
                <p>
                  {name(providerId)} ·{" "}
                  {source?.role ??
                    ("role" in d.provider ? d.provider.role : "Unallocated")}
                </p>
                {source && source.id === assignmentId ? (
                  <p>Current assignment · {source.id}</p>
                ) : source ? (
                  <button
                    className="text-link"
                    onClick={() => onAssignment(source.id)}
                  >
                    Inspect supplying assignment · {source.id}
                  </button>
                ) : (
                  <p>No provider assignment represented.</p>
                )}
                {providerId && (
                  <p>
                    <button
                      className="text-link"
                      onClick={() => onWorker(providerId)}
                    >
                      Inspect provider worker · {name(providerId)}
                    </button>
                  </p>
                )}
              </div>
              <div>
                <h4>Receiver</h4>
                <p>
                  {name(receiver.workerId)} · {receiver.role}
                </p>
                {receiver.id === assignmentId ? (
                  <p>Current assignment · {receiver.id}</p>
                ) : (
                  <button
                    className="text-link"
                    onClick={() => onAssignment(receiver.id)}
                  >
                    Inspect receiving assignment · {receiver.id}
                  </button>
                )}
                <p>
                  {receiver.workerId
                    ? "Receiver allocation represented"
                    : "Receiver unassigned · allocation is separate from input availability"}
                </p>
              </div>
            </div>
            <p>
              <strong>Input availability:</strong>{" "}
              {d.localExchange
                ? d.localExchange.summary
                : d.availability === "missing"
                  ? "Not represented"
                  : "Represented in sample"}
              . <strong>Delivery / receipt:</strong>{" "}
              {d.localExchange
                ? d.localExchange.received
                  ? "Exact receipt recorded locally"
                  : "Delivered locally · receipt pending"
                : "Unconfirmed"}
              .
            </p>
            {(completed[receiver.id] || (source && completed[source.id])) && (
              <p className="coordination-response">
                Local response recorded; this does not establish input delivery
                or receipt.
              </p>
            )}
            {d.returnPath && (
              <p>
                <strong>Return for clarification or revision:</strong>{" "}
                {d.returnPath}
              </p>
            )}
          </article>
        );
      })}
      {parallel.map((g) => (
        <article
          className="org-stream-assignment"
          aria-label="Parallel work"
          key={g.id}
        >
          <h3>Work that can progress in parallel</h3>
          <p>{g.description}</p>
          <ul>
            {g.assignmentIds.map((id) => (
              <li key={id}>
                {id === assignmentId ? (
                  <span>{id} · Current assignment</span>
                ) : (
                  <button
                    className="text-link"
                    onClick={() => onAssignment(id)}
                  >
                    {id} ·{" "}
                    {scenario.assignments.find((a) => a.id === id)!.title}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}

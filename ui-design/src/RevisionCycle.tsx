import { useRef, useState } from "react";
import { revisionCycle } from "./data/revisionCycle";
export function RevisionCycle() {
  const [selectedId, setSelectedId] = useState(revisionCycle[0].id);
  const heading = useRef<HTMLHeadingElement>(null);
  const record = revisionCycle.find((item) => item.id === selectedId)!;
  function inspect(id: string) {
    setSelectedId(id);
    requestAnimationFrame(() => heading.current?.focus());
  }
  return (
    <section
      className="panel revision-cycle"
      aria-labelledby="revision-cycle-title"
    >
      <h2 id="revision-cycle-title">Revision cycle · standalone sample</h2>
      <p>
        Contribution → assessment → revision request → new contribution →
        reassessment.
      </p>
      <p>
        This authored example is separate from your assignments and session
        receipts. Recording a response elsewhere does not advance it.
      </p>
      <nav aria-label="Revision cycle records">
        <ol className="revision-steps">
          {revisionCycle.map((item) => (
            <li key={item.id}>
              <button
                className="button secondary"
                aria-current={item.id === selectedId ? "step" : undefined}
                onClick={() => inspect(item.id)}
              >
                {item.id} · {item.kind}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <article
        className="revision-record"
        aria-label="Selected revision record"
      >
        <h3 ref={heading} tabIndex={-1}>
          {record.id} · {record.title}
        </h3>
        <dl className="attempt-fields">
          <div>
            <dt>Responsible actor</dt>
            <dd>{record.actor}</dd>
          </div>
          <div>
            <dt>State</dt>
            <dd>{record.status}</dd>
          </div>
          <div>
            <dt>Subject</dt>
            <dd>{record.subject}</dd>
          </div>
        </dl>
        {record.digest && (
          <>
            <code>{record.digest}</code>
            <p>Synthetic subject identity · not verified</p>
          </>
        )}
        <p>{record.detail}</p>
        <h4>Explicit references</h4>
        {record.references.length ? (
          <ul>
            {record.references.map((ref) => (
              <li key={ref.id}>
                <button className="text-link" onClick={() => inspect(ref.id)}>
                  {ref.relation} → {ref.id}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No earlier record in this sample cycle.</p>
        )}
      </article>
      <p className="demo-note">
        Read-only scenario explorer. No worker run, new assignment, source edit
        or server record is created. Selection resets when leaving Demos.
      </p>
    </section>
  );
}

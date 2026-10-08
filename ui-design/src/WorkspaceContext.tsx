import type { ReactNode } from "react";

/** A shared reading order; each screen supplies its own represented facts. */
export function WorkspaceContext({
  label,
  status,
  responsibility,
  next,
  action,
}: {
  label: string;
  status: ReactNode;
  responsibility: ReactNode;
  next: ReactNode;
  action: ReactNode;
}) {
  return (
    <section className="panel workspace-context" aria-label={label}>
      <div>
        <h2>Current state</h2>
        {status}
      </div>
      <div>
        <h2>Responsibility</h2>
        {responsibility}
      </div>
      <div>
        <h2>Next step</h2>
        {next}
        {action}
      </div>
    </section>
  );
}

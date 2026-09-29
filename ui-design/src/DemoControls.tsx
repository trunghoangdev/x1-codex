import type { ReactNode } from "react";

export function DemoControls({
  context,
  children,
}: {
  context: string;
  children: ReactNode;
}) {
  return (
    <details className="demo-controls">
      <summary>Demo controls · {context}</summary>
      <div className="demo-controls-body">{children}</div>
    </details>
  );
}

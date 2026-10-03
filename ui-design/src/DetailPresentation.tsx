import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function DetailBackButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="button secondary detail-back" onClick={onClick}>
      <ArrowLeft size={16} aria-hidden="true" />
      {children}
    </button>
  );
}

export function DetailEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="detail-empty">
      <p>{children}</p>
    </div>
  );
}

import { useId, type ReactNode } from "react";

// The parent owns page state so detail-return URLs can restore nested lists.
export function BoundedRecords<T>({
  items,
  page = 1,
  onPage,
  label,
  render,
}: {
  items: T[];
  page?: number;
  onPage: (page: number) => void;
  label: string;
  render: (item: T) => ReactNode;
}) {
  const id = useId();
  const pages = Math.max(1, Math.ceil(items.length / 4));
  const current = Math.min(page, pages);
  const start = (current - 1) * 4;
  return (
    <section aria-label={label} className="bounded-records">
      <p id={id} tabIndex={-1}>
        {label} · {items.length} records
        {items.length > 0 &&
          ` · Showing ${start + 1}–${Math.min(start + 4, items.length)}`}
      </p>
      {items.slice(start, start + 4).map(render)}
      {pages > 1 && (
        <nav className="directory-pagination" aria-label={`${label} pages`}>
          <button
            className="button secondary"
            disabled={current === 1}
            onClick={() => {
              onPage(current - 1);
              requestAnimationFrame(() => document.getElementById(id)?.focus());
            }}
          >
            Previous {label.toLowerCase()}
          </button>
          <span>
            Page {current} of {pages}
          </span>
          <button
            className="button secondary"
            disabled={current === pages}
            onClick={() => {
              onPage(current + 1);
              requestAnimationFrame(() => document.getElementById(id)?.focus());
            }}
          >
            Next {label.toLowerCase()}
          </button>
        </nav>
      )}
    </section>
  );
}

import { ArrowRight } from "lucide-react";
export type RelatedTab =
  "Attempts" | "Candidate" | "Checks" | "Activity" | "Evidence";
export type NavigateRelated = (tab: RelatedTab) => void;
export function RelatedRecords({
  links,
  onNavigate,
}: {
  links: { tab: RelatedTab; label: string }[];
  onNavigate: NavigateRelated;
}) {
  return (
    <nav className="related-records" aria-label="Related records">
      {links.map((link) => (
        <button
          key={link.tab}
          className="button secondary"
          onClick={() => onNavigate(link.tab)}
        >
          {link.label}
          <ArrowRight size={15} />
        </button>
      ))}
    </nav>
  );
}

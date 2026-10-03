export type StreamFilters = {
  query: string;
  project: string;
  signal: "all" | "responsibility" | "outcome";
};
export const defaultStreamFilters: StreamFilters = {
  query: "",
  project: "All",
  signal: "all",
};

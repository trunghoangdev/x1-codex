export type StreamFilters = {
  page?: number;
  query: string;
  project: string;
  signal: "all" | "responsibility" | "outcome";
};
export const defaultStreamFilters: StreamFilters = {
  query: "",
  project: "All",
  signal: "all",
};

export const streamPageSize = 4;

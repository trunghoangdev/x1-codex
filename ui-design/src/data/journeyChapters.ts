export const journeyIds = [
  "purpose",
  "allocation",
  "prepared",
  "failure",
  "recovery",
  "closed",
  "evidence",
  "reviewed",
] as const;
export type JourneyId = (typeof journeyIds)[number];

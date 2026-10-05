/** Independently authored design proposals. Neither version is adopted by the fixture. */
export interface AgreementVersion {
  id: string;
  title: string;
  previousId?: string;
  audience: string;
  included: string[];
  excluded: string[];
  prerequisites: string[];
}
export const agreementVersions: AgreementVersion[] = [
  {
    id: "brief-v1",
    title: "Single-cohort welcome guide",
    audience: "New members in one internal onboarding cohort.",
    included: [
      "Prepare a cited guide using the cohort's recurring questions.",
      "Describe where to find reliable answers and next steps for this cohort.",
    ],
    excluded: [
      "Publication or distribution approval.",
      "Other teams, external readers and workshop delivery.",
    ],
    prerequisites: [
      "A named cohort and its recurring questions.",
      "Editorial acceptance criteria and approved source material.",
    ],
  },
  {
    id: "brief-v2",
    previousId: "brief-v1",
    title: "Multi-team welcome guide",
    audience:
      "New members across several internal teams; the team list is still required.",
    included: [
      "Prepare a cited guide covering shared questions and team-specific next steps.",
      "Identify which answers apply to each named internal team.",
    ],
    excluded: [
      "Publication or distribution approval.",
      "External readers, workshop delivery and automatic reuse of cohort-specific assessments.",
    ],
    prerequisites: [
      "A named team list and representative questions for each team.",
      "Editorial acceptance criteria covering the expanded audience and approved source material.",
    ],
  },
];

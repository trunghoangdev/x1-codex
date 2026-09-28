import { sampleCandidate } from "./candidate";
import { releaseSubject } from "./release";
export type EvidenceArtifact = {
  id: string;
  assignmentId: string;
  title: string;
  detail: string;
  producer: string;
  digest?: string;
  content: string;
};
export const evidenceArtifacts: EvidenceArtifact[] = [
  {
    id: "AR-771",
    assignmentId: "A-1042",
    title: "Source change",
    detail: "Changeset c8e4a21 · 3 sample files",
    producer: "Demo worker contribution",
    digest: sampleCandidate.artifactDigest,
    content: sampleCandidate.files
      .map(
        (file) => `${file.operation}: ${file.path}\n${file.after.join("\n")}`,
      )
      .join("\n\n"),
  },
  {
    id: "AR-775",
    assignmentId: "A-1042",
    title: "Test results",
    detail: "Historical fixture · not an executed check",
    producer: "Demo test runner",
    content:
      "Historical sample report: 42 passed · 0 failed.\nNo tests were executed to produce this fixture.\nThis report is not bound to the sample candidate by a verified digest.\nIt does not establish duplicate-event coverage or override the Checks preview.",
  },
  {
    id: "AR-776",
    assignmentId: "A-1042",
    title: "Worker contribution",
    detail: "Notes for the sample retry candidate",
    producer: "Demo worker",
    content:
      "The sample candidate adjusts the retry delay and adds a cap test and documentation.\nDuplicate-event handling still requires separate review.\nNo deployment authority is granted.",
  },
  {
    id: "AR-801",
    assignmentId: "A-1041",
    title: "Release candidate",
    detail: "Payments API v1.8.2 · exact decision subject",
    producer: "Demo release preparation",
    digest: releaseSubject.digest,
    content: `Release: ${releaseSubject.label}\nTarget: ${releaseSubject.target}\nThis is a synthetic release subject, separate from A-1042.\nNo verified build manifest, test report or technical assessment is connected.\nThe prerequisite selector previews hypothetical outcomes only.`,
  },
];
export function evidenceFor(assignmentId: string) {
  return evidenceArtifacts.filter((a) => a.assignmentId === assignmentId);
}
export function inputFor(
  assignmentId: string,
  label: string,
): EvidenceArtifact {
  return (
    evidenceFor(assignmentId)[0] ?? {
      id: `sample-input-${assignmentId}`,
      assignmentId,
      title: label,
      detail: "Sample input contents unavailable",
      producer: "Not connected",
      content:
        "No sample input body or immutable reference is connected for this assignment. Production content is unavailable.",
    }
  );
}

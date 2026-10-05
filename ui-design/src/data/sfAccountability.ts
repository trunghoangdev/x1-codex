import type { SfReadProjection } from "./sfReadProjection";
export type TraceEntry = {
  label: string;
  status: "recorded" | "reported" | "unavailable" | "not-recorded";
  reference?: string;
  detail: string;
  source?: "assignment" | "attempt" | "product" | "integrity";
};
export function sfAccountability(
  projection: SfReadProjection,
  attemptId: string,
) {
  const attempt = projection.attempts.find((a) => a.id === attemptId);
  const entries: TraceEntry[] = [
    {
      label: "Responsibility and binding",
      status: "unavailable",
      detail:
        "No role mandate, worker allocation or accountable actor is supplied. Assignment identity alone does not establish responsibility.",
    },
    {
      label: "Assignment",
      status: "recorded",
      reference: projection.assignment.id,
      detail:
        "Source assignment file at capture time; no immutable historical agreement or installed organization version is established.",
      source: "assignment",
    },
  ];
  if (!attempt) return { entries, selected: false };
  entries.push({
    label: "Attempt",
    status: "recorded",
    reference: attempt.id,
    detail: `Linked by assignment_id to ${projection.assignment.id}. Outcome and platform/process observations remain distinct.`,
    source: "attempt",
  });
  const artifact = attempt.fields.artifact_digest;
  entries.push(
    artifact.state === "known"
      ? {
          label: "Artifact reference",
          status: "reported",
          reference: String(artifact.value),
          detail:
            "Reported by the retained attempt. Origin, inputs and supersession are not independently verified.",
          source: "attempt",
        }
      : {
          label: "Artifact reference",
          status: "not-recorded",
          detail:
            "The selected attempt reports no artifact identity. No work product is inferred.",
        },
  );
  if (attempt.product.state === "available") {
    const product = attempt.product.record;
    entries.push({
      label: "Work-product response",
      status: "recorded",
      reference: product.id,
      detail:
        "Response artifact_digest matches the selected attempt exactly. Delivery metadata is not an assessment or approval.",
      source: "product",
    });
    entries.push({
      label: "Content and blob",
      status: "reported",
      reference: `${String(product.fields.content_digest.state === "known" ? product.fields.content_digest.value : "unknown")} → ${String(product.fields.blob_digest.state === "known" ? product.fields.blob_digest.value : "unknown")}`,
      detail:
        projection.sourceKind === "retained-redacted"
          ? "Source exporter reported matching blob/typed-payload hashes. Bytes are redacted; the browser cannot repeat blob verification or prove artifact provenance."
          : "Synthetic identities and example bytes; they establish no production artifact.",
      source: "product",
    });
  } else
    entries.push({
      label: "Work-product response",
      status: attempt.product.state,
      detail: attempt.product.reason,
    });
  for (const [label, detail] of [
    [
      "Assessment",
      "No subject-bound assessment record is included. Produced work is not accepted work.",
    ],
    [
      "Authority decision",
      "No authenticated decision maker, effective permission, admitted approval or policy version is included. Platform state admitted is not publication authorization.",
    ],
    [
      "External effect and reconciliation",
      "No execution/effect or reconciliation record is included. Exit status zero does not establish publication, deployment or the shared outcome.",
    ],
  ])
    entries.push({ label, status: "unavailable", detail });
  return { entries, selected: true };
}

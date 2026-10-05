// Inspection envelope v1 is prototype-owned, not a published SF application API.
type RecordValue = Record<string, unknown>;
export function decodeExampleBytes(encoded: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(encoded) || encoded.length % 4 === 1)
    throw new Error("Invalid unpadded base64url bytes.");
  const bytes = Uint8Array.from(
    atob(encoded.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0),
  );
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
export type SfSnapshot = {
  source: RecordValue;
  assignment: RecordValue;
  attempts: RecordValue[];
  work_products: RecordValue[];
  redactions?: RecordValue;
  integrity_checks?: RecordValue;
};
function record(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a snapshot record.");
  return value as RecordValue;
}
function textField(value: RecordValue, key: string) {
  if (typeof value[key] !== "string" || !value[key])
    throw new Error(`Missing or invalid ${key}.`);
}
export function parseSfSnapshot(raw: unknown): SfSnapshot {
  const root = record(raw);
  const retained = root.format === "sf-inspection-redacted";
  if (
    (!retained && root.format !== "sf-inspection-example") ||
    root.version !== 1
  )
    throw new Error("Unsupported inspection snapshot format.");
  const source = record(root.source);
  if (source.kind !== (retained ? "retained-redacted" : "synthetic"))
    throw new Error("Snapshot origin and format disagree.");
  for (const key of ["label", "observed_at", "revision"])
    textField(source, key);
  if (!Number.isFinite(Date.parse(String(source.observed_at))))
    throw new Error("Invalid observation time.");
  const assignment = record(root.assignment);
  const repository =
    typeof assignment.source_repository === "string" &&
    assignment.source_repository.length > 0;
  const context =
    typeof assignment.working_context === "string" &&
    assignment.working_context.length > 0;
  if (
    !retained &&
    (repository === context ||
      (repository && typeof assignment.base_revision !== "string"))
  )
    throw new Error(
      "Assignment must state one working context or repository/base.",
    );
  for (const key of retained
    ? ["id", "expected_payload_type_tag"]
    : [
        "id",
        "objective_file",
        "validator",
        "publication_criterion",
        "expected_payload_type_tag",
      ])
    textField(assignment, key);
  for (const key of ["output_scope", "required_effect_paths"])
    if (
      !Array.isArray(assignment[key]) ||
      !assignment[key].length ||
      !(assignment[key] as unknown[]).every(
        (v) => typeof v === "string" && v.length,
      )
    )
      throw new Error(`Invalid ${key}.`);
  if (!Array.isArray(root.attempts) || !Array.isArray(root.work_products))
    throw new Error("Missing record lists.");
  const attempts = root.attempts.map(record);
  const products = root.work_products.map(record);
  const ids = new Set<unknown>();
  for (const attempt of attempts) {
    for (const key of retained
      ? ["attempt_id", "assignment_id", "opened_at", "termination"]
      : [
          "attempt_id",
          "assignment_id",
          "opened_at",
          "objective",
          "termination",
        ])
      textField(attempt, key);
    if (
      attempt.schema_version !== 2 ||
      attempt.assignment_id !== assignment.id ||
      ids.has(attempt.attempt_id) ||
      !["open", "failed", "produced"].includes(String(attempt.outcome))
    )
      throw new Error("Invalid attempt relationship or version.");
    if (attempt.exit_code !== undefined && !Number.isInteger(attempt.exit_code))
      throw new Error("Invalid exit status.");
    if (
      !Number.isFinite(Date.parse(String(attempt.opened_at))) ||
      (attempt.settled_at !== undefined &&
        !Number.isFinite(Date.parse(String(attempt.settled_at))))
    )
      throw new Error("Invalid attempt timestamp.");
    if (
      !Array.isArray(attempt.output_scope) ||
      !attempt.output_scope.every((v) => typeof v === "string")
    )
      throw new Error("Invalid attempt scope.");
    for (const key of ["artifact_digest", "attempt_digest"])
      if (
        attempt[key] !== undefined &&
        !/^sha256:[a-f0-9]{64}$/.test(String(attempt[key]))
      )
        throw new Error("Invalid platform identity.");
    ids.add(attempt.attempt_id);
  }
  const artifacts = new Set<unknown>();
  for (const product of products) {
    for (const key of ["artifact_digest", "content_digest", "blob_digest"])
      if (!/^sha256:[a-f0-9]{64}$/.test(String(product[key])))
        throw new Error("Invalid product identity.");
    for (const key of retained
      ? ["artifact_digest", "content_digest", "blob_digest", "payload_type_tag"]
      : [
          "artifact_digest",
          "content_digest",
          "blob_digest",
          "payload_type_tag",
          "bytes_base64url",
        ])
      textField(product, key);
    if (
      product.payload_schema_id !== "forge.typed-payload" ||
      product.payload_schema_version !== 1 ||
      artifacts.has(product.artifact_digest) ||
      !attempts.some((a) => a.artifact_digest === product.artifact_digest)
    )
      throw new Error("Invalid work-product schema or artifact relationship.");
    artifacts.add(product.artifact_digest);
    if (!retained) decodeExampleBytes(String(product.bytes_base64url));
    const attempt = attempts.find(
      (a) => a.artifact_digest === product.artifact_digest,
    )!;
    if (attempt.expected_payload_type_tag !== product.payload_type_tag)
      throw new Error(
        "Work-product kind differs from the attempt requirement.",
      );
  }
  if (retained) {
    const allowed = (value: RecordValue, keys: string[]) => {
      if (Object.keys(value).some((key) => !keys.includes(key)))
        throw new Error("Unexpected field in redacted snapshot.");
    };
    allowed(assignment, [
      "id",
      "work_id",
      "base_revision",
      "output_scope",
      "required_effect_paths",
      "expected_payload_type_tag",
    ]);
    for (const attempt of attempts)
      allowed(attempt, [
        "schema_version",
        "attempt_id",
        "assignment_id",
        "opened_at",
        "settled_at",
        "outcome",
        "output_scope",
        "expected_payload_type_tag",
        "attempt_digest",
        "artifact_digest",
        "state",
        "termination",
        "exit_code",
        "ephemeral_cleanup",
      ]);
    for (const product of products)
      allowed(product, [
        "artifact_digest",
        "content_digest",
        "blob_digest",
        "payload_schema_id",
        "payload_schema_version",
        "payload_type_tag",
      ]);
    const redactions = record(root.redactions);
    for (const key of ["assignment", "attempt", "work_product"]) {
      if (
        !Array.isArray(redactions[key]) ||
        !redactions[key].length ||
        !(redactions[key] as unknown[]).every((v) => typeof v === "string")
      )
        throw new Error("Missing redaction manifest.");
    }
    const checks = record(root.integrity_checks);
    if (
      checks.blob_bytes_match !== true ||
      checks.typed_payload_body_match !== true ||
      checks.artifact_provenance !== "Not independently verified"
    )
      throw new Error("Invalid export integrity report.");
    textField(checks, "checked_by");
    return {
      source,
      assignment,
      attempts,
      work_products: products,
      redactions,
      integrity_checks: checks,
    };
  }
  return { source, assignment, attempts, work_products: products };
}

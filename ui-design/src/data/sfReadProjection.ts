import { parseSfSnapshot, type SfSnapshot } from "./sfSnapshot";

// Draft frontend projection contract. No deployed HTTP endpoint or authority semantics.
export type ReadField =
  | { state: "known"; value: string | number | string[]; source: string }
  | {
      state: "not-recorded" | "redacted" | "unsupported";
      reason: string;
      source: string;
    };
export type InspectionRecord = {
  id: string;
  source: string;
  fields: Record<string, ReadField>;
};
export type ProductRead =
  | { state: "available"; record: InspectionRecord }
  | { state: "unavailable" | "not-recorded"; reason: string };
export type SfReadProjection = {
  contract: "sf.inspection-read.draft";
  version: 1;
  revision: string | null;
  sourceKind: "synthetic" | "retained-redacted";
  capturedAt: string;
  sourceRevision: string;
  freshness: "historical-snapshot";
  assignment: InspectionRecord;
  attempts: (InspectionRecord & { product: ProductRead })[];
  snapshot: SfSnapshot;
};
export class ReadProjectionError extends Error {
  constructor(
    public code:
      | "invalid-json"
      | "unsupported-version"
      | "invalid-snapshot"
      | "wrong-origin"
      | "too-large",
    message: string,
  ) {
    super(message);
  }
}
const unsupported = (name: string): ReadField => ({
  state: "unsupported",
  reason: `${name} has no source in this inspection dataset.`,
  source: "application context not supplied",
});
function inspectionRecord(
  snapshot: SfSnapshot,
  group: "assignment" | "attempt" | "work_product",
  value: Record<string, unknown>,
  id: string,
  names: string[],
): InspectionRecord {
  const source = `${group}:${id}`;
  const omitted = snapshot.redactions?.[group] as string[] | undefined;
  const fields: Record<string, ReadField> = {};
  for (const name of names) {
    if (omitted?.includes(name)) {
      if (value[name] !== undefined)
        throw new Error("A field cannot be both exported and redacted.");
      fields[name] = {
        state: "redacted",
        reason:
          "Omitted by the export manifest; original value is not available here.",
        source,
      };
    } else if (value[name] === undefined || value[name] === "") {
      fields[name] = {
        state: "not-recorded",
        reason: "No value supplied in this record; no default is inferred.",
        source,
      };
    } else {
      const field = value[name];
      if (!(
        typeof field === "string" ||
        (typeof field === "number" && Number.isFinite(field)) ||
        (Array.isArray(field) && field.every((v) => typeof v === "string"))
      ))
        throw new Error(`Invalid field ${name}.`);
      fields[name] = { state: "known", value: field, source };
    }
  }
  return { id, source, fields };
}
export async function readSfProjection(
  raw: string,
  expected: "synthetic" | "retained-redacted",
): Promise<SfReadProjection> {
  if (new TextEncoder().encode(raw).byteLength > 1_000_000)
    throw new ReadProjectionError(
      "too-large",
      "Snapshot exceeds the inspection size limit.",
    );
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    throw new ReadProjectionError(
      "invalid-json",
      "Snapshot JSON could not be read.",
    );
  }
  if (
    decoded &&
    typeof decoded === "object" &&
    "version" in decoded &&
    decoded.version !== 1
  )
    throw new ReadProjectionError(
      "unsupported-version",
      "Snapshot version is not supported.",
    );
  let snapshot: SfSnapshot;
  try {
    snapshot = parseSfSnapshot(decoded);
  } catch {
    throw new ReadProjectionError(
      "invalid-snapshot",
      "Snapshot fields or relationships are invalid.",
    );
  }
  if (snapshot.source.kind !== expected)
    throw new ReadProjectionError(
      "wrong-origin",
      "Snapshot source does not match the requested inspection.",
    );
  let revision: string | null = null;
  if (globalThis.crypto?.subtle) {
    try {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(raw),
      );
      revision =
        "sha256:" +
        Array.from(new Uint8Array(digest), (v) =>
          v.toString(16).padStart(2, "0"),
        ).join("");
    } catch {
      /* Digest unavailability must not become an execution/read failure. */
    }
  }
  try {
    const assignment = inspectionRecord(
      snapshot,
      "assignment",
      snapshot.assignment,
      String(snapshot.assignment.id),
      [
        "id",
        "work_id",
        "base_revision",
        "output_scope",
        "required_effect_paths",
        "expected_payload_type_tag",
        "objective_file",
        "validator",
        "publication_criterion",
      ],
    );
    assignment.fields.worker = unsupported("Worker binding");
    assignment.fields.permission = unsupported("Effective permission");
    assignment.fields.organization = unsupported(
      "Installed organization identity",
    );
    const attempts = snapshot.attempts.map((a) => {
      const record = inspectionRecord(
        snapshot,
        "attempt",
        a,
        String(a.attempt_id),
        [
          "assignment_id",
          "opened_at",
          "settled_at",
          "outcome",
          "state",
          "termination",
          "exit_code",
          "objective",
          "output_scope",
          "expected_payload_type_tag",
          "artifact_digest",
          "attempt_digest",
          "ephemeral_cleanup",
        ],
      );
      const product = snapshot.work_products.find(
        (p) => p.artifact_digest === a.artifact_digest,
      );
      const productRead: ProductRead = !a.artifact_digest
        ? {
            state: "not-recorded",
            reason: "No artifact identity reported; no product is inferred.",
          }
        : !product
          ? {
              state: "unavailable",
              reason:
                "Artifact identity reported, but its work-product response is not included.",
            }
          : {
              state: "available",
              record: inspectionRecord(
                snapshot,
                "work_product",
                product,
                String(product.artifact_digest),
                [
                  "artifact_digest",
                  "content_digest",
                  "blob_digest",
                  "payload_schema_id",
                  "payload_schema_version",
                  "payload_type_tag",
                  "bytes_base64url",
                ],
              ),
            };
      return { ...record, product: productRead };
    });
    return {
      contract: "sf.inspection-read.draft",
      version: 1,
      revision,
      sourceKind: expected,
      capturedAt: String(snapshot.source.observed_at),
      sourceRevision: String(snapshot.source.revision),
      freshness: "historical-snapshot",
      assignment,
      attempts,
      snapshot,
    };
  } catch {
    throw new ReadProjectionError(
      "invalid-snapshot",
      "Projection fields conflict with the source manifest.",
    );
  }
}

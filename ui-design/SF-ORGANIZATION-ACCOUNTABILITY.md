# Organization context and accountability inspection

Demos → **Inspect retained SF run** now exposes organization context and a selected-attempt accountability trace. The same components support the synthetic snapshot with a distinct source label.

## Organization context

The retained dataset is explicitly separate from the main sample organization and its navigation persona. Installed organization identity/version, role/worker binding, policy/effective permission and node/placement are unknown because this source does not supply them. Capture time and historical freshness are represented; no current worker/runtime health is inferred.

The dataset label identifies the inspection source, not a canonical organization identity. A named publication criterion is an assignment requirement, not an admitted decision. No context from the sample organization is merged into a real retained record.

## Accountability trace

The trace is a source-linked inspection, not a workflow or certified audit chain:

- Responsibility/binding is unavailable.
- Assignment identifies the captured source file; its immutable historical version is not proven.
- Attempt links through exact assignment_id, keeping outcome/platform state/process observations distinct.
- Artifact identity is reported by the attempt, not independently verified.
- Work-product response links by matching artifact_digest; content/blob relationships are reported with the exporter verification limit stated.
- Assessment, authority decision and external effect/reconciliation remain unavailable, even when the platform state says admitted or the process exited zero.

Each represented source record has an inspection button that scrolls to and focuses its source heading without changing the selected attempt. Missing sources receive no fake link. With no selected attempt, the UI requests selection rather than inferring an artifact. A failed example reporting no artifact keeps the product unrecorded.

`src/data/sfAccountability.ts` derives this trace from the existing validated read projection. It introduces no new backend fields, copied ledger claims or authority inference. Local demo response receipts and command simulations cannot close these source gaps.

## Remaining integration

This is the first bounded UI slice for organization context and accountability. Real installation identity/version, adopted policy/bindings, admitted assessments/decisions and effect evidence must come from versioned application/public sources with their own exact subject/scope references. No generic organization editor, tenant model, policy enforcement or complete immutable audit service is implemented.

Previews: [mobile context](previews/94-sf-context-390.png), [mobile trace](previews/94-sf-trace-390.png), [desktop trace](previews/94-sf-trace-1440.png).

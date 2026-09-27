# UI iterations

Each iteration is intentionally small and independently reviewable.

## 01 — Assignment attempt history

Implemented an Attempts tab with a separate component and synthetic fixtures following Software Factory's AttemptRecord fields. Open A-1042 to inspect produced, failed-to-launch, and open/unsettled examples. Other assignments show an explicit unavailable-sample state rather than borrowing unrelated records.

- Missing exit status remains “Not observed.”
- Open means completion has not been recorded, not proof of live execution.
- Produced is distinct from candidate approval and external effect.
- Records expose UTC timestamps and an illustrative artifact reference.
- Tabs support Arrow keys, Home, and End; the history adapts to mobile.

No production records were copied. No backend or remote execution was added. Existing screenshot previews show the initial exploration, before this tab was added.

Validation: production build and all five browser tests passed, including the existing decision flows, attempt state distinctions, empty history, keyboard navigation, and phone-width overflow.

Next proposed slice: candidate changed-files list and diff against a pinned base, with explicit sample-data provenance. This is not implemented in iteration 01.

## 02 — Candidate and file diff

Open **A-1042 → Candidate** to inspect three small synthetic files against a fixed sample base revision. File selection displays a line diff calculated from the fixture's complete before/after arrays, with separate base/new line numbers and added/removed counts. Color is supplemented by plus/minus markers.

The candidate and produced attempt share the same synthetic artifact reference. Neither the revision nor digest is presented as verified. Other assignments show an explicit missing-sample state. The illustrative retry snippets are not a complete implementation of the assignment objective or evidence of passing tests.

The diff scrolls within its panel on narrow screens. No production data, backend connection, or mutation of a source repository was introduced.

Validation: production build, formatting checks, and all six browser tests passed. The new test covers file switching, added/removed lines and counts, sample identity labels, assignment isolation and mobile overflow. Earlier screenshot previews remain snapshots of iteration 00.

Next proposed slice: **Checks**, separating validator passed, refused and could-not-run observations from human assessment and approval.

## 03 — Validator observations and decision boundaries

Open **A-1042 → Checks**. A labeled scenario selector previews three independent synthetic observations: validator passed, validator refused, and could not run. These alternatives are not a historical sequence and changing the preview does not mutate an assignment or record a decision.

The observation displays its assignment, attempt, sample candidate-bytes digest, validator, timestamp, execution flag, termination, and optional exit code. Missing status remains “Not observed.” Expand diagnostics to read an explanation, explicitly separated from an authoritative decision.

A second section distinguishes human assessment, publication admissibility, applicability, approval and external effect. An assessment submitted through the existing demo updates only its assessment indicator. Missing gates remain unavailable; a validator pass never becomes an approval. Other assignments have an explicit no-sample state.

No validator was executed and no production observation was copied. The digest is explicitly synthetic and unverified. This UI does not implement production readiness enforcement; the existing release decision demo remains separate.

Validation: production build and all seven browser tests passed, covering the three observation states, absent exit status, diagnostics, assessment separation, assignment isolation, mobile overflow and prior flows.

Next proposed slice: connect the existing release decision demo to an explicit prerequisite summary and exact decision subject, keeping unavailable evidence visibly unavailable.

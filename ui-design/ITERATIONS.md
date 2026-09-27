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

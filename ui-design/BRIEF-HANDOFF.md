# Workshop brief handoff

Knowledge K-02 now supports a local, versioned input exchange on the existing `workshop-brief-input` dependency: Leo's K-02-C supplies Maya's K-02-E. Open the K-02 workstream, either assignment, or personal My Work as Leo/Maya.

Leo writes a brief and explicitly delivers its frozen version. Maya inspects that exact delivery and separately confirms receipt. Cancel leaves input unavailable. Delivery alone does not clear the receiving assignment's waiting-for-input signal. Receipt makes the exact version available locally; it does not complete the review.

A later delivery leaves the previously received version usable and warns that review applicability needs checking before switching. Every earlier delivery and receipt remains visible and unchanged. Receiving an older version cannot move the selected input backwards. Actual review records, applicability decisions, input withdrawal and review migration are outside this slice.

The model projects the exact receiving input into My Work, assignment, workstream dependency and input attention. Authored workflow steps, facilitator allocation and outcome evidence remain separate. Persona selection demonstrates actors; it is not authentication or an authority check.

State lives in the app session across navigation, including switching scenarios. Reload clears it. Neither Knowledge contribution checkpoints nor main demo snapshots save this exchange. There is no backend dispatch, durable storage or production receipt contract.

Validation covers immutable lineage, invalid/duplicate receipt handling, delivery/receipt separation, cancel, route continuity, later-version warning, exact second receipt and reload boundaries. Build retains the existing bundle-size advisory.

Persistence update · iteration 128: [whole Knowledge workspace recovery](KNOWLEDGE-WORKSPACE-RECOVERY.md) now explicitly saves/restores these records. Contribution-only checkpoints and main software snapshots still exclude them; reload never restores automatically. This supersedes the original session-only checkpoint boundary above.

# Revised contribution reassessment · iteration 121

After Maya records the exact draft-02 receipt, her inbox offers **Assess received draft-02**. She inspects the delivered text/comparison, selects **Suitable for stated scope** or **Further revision needed**, and supplies a nonblank rationale (maximum 3,000 characters). The explicit local sample action records Maya, time, conclusion, rationale and exact receipt/delivery references. It is not an automatic evaluation of the text, server-admitted assessment or publication authority.

`human-reassessment-v2` is separate from the original `human-assessment-v1`. It can only be recorded once against delivered/received draft-02; the original delivery, receipt and assessment stay unchanged. Repeating the model operation does not overwrite the record. The result heading receives focus after the local update, and the input form disappears once recorded.

Shared presentation drives My Work, receiver/history, assignment inspection, contribution editor, comparison and workstream progress. A suitability conclusion establishes no further contributor action and does not produce a new contribution attention signal. A further-revision conclusion directs Leo to inspect the reassessment and coordinate next work. Draft-03 remains unsupported; no new version, worker, authorization or outcome is invented. Original authored attention gaps remain independent.

## Recovery compatibility

Checkpoints without reassessment continue to encode as `forge.knowledge-contribution.v1`. Checkpoints containing reassessment encode as `forge.knowledge-contribution.v2`; the current reader accepts both. The existing browser storage key is retained so earlier checkpoints remain discoverable. Readers from older UI builds cannot read the new format; use this or a newer compatible UI to restore/export/import reassessments.

Validation requires the exact revised receipt/delivery IDs, fixed sample assessor Maya, supported conclusion, valid timestamp and bounded nonblank rationale. A v1 envelope containing reassessment is rejected. Restore/import remains explicit and whole-state; replacement impact includes reassessment differences. No migration deletes prior data or silently discards new records.

## Verification

Production build and twenty-two distinct targeted checks passed across runs: model preconditions/immutability, original-version preservation, exact-link validation and v1/v2 round trips; both conclusions on desktop/320px through My Work, attention, workstream, comparison and reload/restore; existing checkpoint failures, exchange, local progress, replacement preview, consistency and comparison behavior. No participant, live backend or screen-reader session was conducted.

Revision update · iteration 132: [content revisions](CONTRIBUTION-REVISIONS.md) now support draft-03 through draft-09 after an explicit revision request. Each has separate exact delivery/receipt/reassessment and comparison with its predecessor. Contribution checkpoints use v3 for three or more versions; v1/v2 remain readable. Use cycles still apply only to the same assessed draft-02; authorization does not transfer to changed material.

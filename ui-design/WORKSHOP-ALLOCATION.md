# Multi-candidate workshop allocation · iteration 151

K-02 now supports an explicit local facilitator offer to **Leo or Maya**, a separate independent reviewer, and pre-execution facilitator handoff. Open **K-02 → Open workshop delivery**. Candidate profiles remain advisory: Maya has no declared facilitation capability and only a review-availability example. An owner’s rationale and the candidate’s acceptance do not verify competence or calendar availability.

## Offer and independent review

1. Select the demo owner and **Offer facilitation**. Choose Leo or Maya and a different workshop reviewer: Leo, Maya or the local demo owner. Review capability/availability constraints and explain the exact scope in the rationale.
2. Review the offer preview and confirm. The offer creates no binding; only its named recipient can accept or decline.
3. Acceptance projects the named facilitator into K-02-F, the K-02 scoped binding, worker/personal assignment links and shared progress. Coordinator/Editor roles grant no facilitation automatically.
4. The accepted facilitator submits preparation, records the simulated session and observations. The selected reviewer independently records readiness and criterion review. Self-review is blocked by the model, not merely by presentation.

The demo owner may serve as a separately selected local reviewer while also controlling allocation. That principal is not an authored worker membership and receives no production authority. It can never be selected as facilitator. Selecting an actor is a local demo control, not authentication.

## Handoff before execution

Choose the demo owner as independent reviewer at cycle creation if the cycle may transfer between Leo and Maya. A cycle’s reviewer is fixed and can never become its facilitator; this prevents both candidates’ work being reviewed by another facilitator from the same cycle.

- Owner proposes a handoff to the other eligible human, retaining the same reviewer and exact brief/case source.
- Original facilitator retains responsibility until the named target accepts. Operational preparation/execution pauses while the handoff is pending. Proposal alone never changes assignment ownership.
- Target may accept or decline; owner may cancel the pending handoff. Decline/cancellation preserves the original facilitator and prior operational stage.
- Acceptance transfers responsibility and resets the preparation stage. The recipient must submit a fresh plan and obtain a fresh independent readiness review. Prior plan/readiness remain historical and are not inherited.
- Handoff cannot occur after simulated session execution, on changed source, after closure, to the current facilitator or to the cycle reviewer. Changed source requires cancellation and a fresh cycle against a resolved current brief.

Legacy cycles default to Leo/Maya and cannot hand off to their reviewer. Cancel and start a fresh cycle with an independent reviewer if that transfer is needed. Reviewer reassignment within a cycle and arbitrary additional candidates are not implemented.

## Evidence, versioning and continuity

Every offer/handoff retains its allocation, exact source, actor, rationale and sequential event link. Responses reference the exact pending handoff. Timeline exposes candidate/reviewer details and handoff references. The active preparation display excludes plans before an accepted handoff; full history remains available.

Goal/evidence and impact views derive next actors from current allocation. Existing pattern associations remain with the same workshop cycle; a handoff is not a version migration. New offer identity includes explicit allocation in version-association snapshots, while legacy identities remain readable.

Whole-workspace checkpoint **v14** replays explicit allocations and handoffs and validates reviewer independence, recipient identity, chronology, references and source gates. v1–v13 remain readable. Pattern history containing a frozen newer workshop also selects v14, even when the current workshop slice is absent. The 40 workshop records / 4 MB checkpoint bounds remain; every handoff consumes the same history budget.

No real scheduling, capacity reservation, external runtime action or competency verification is performed.

## Validation

Model checks cover Maya/Leo role reversal, self-review rejection, unsupported candidates, acceptance-only transfer, pending-work pause, fresh readiness, decline/cancellation, stale source, immutable reviewer, post-execution prohibition and forged v14 imports. Phone/desktop checks exercise a declined Maya offer, a fresh Leo allocation, accepted transfer to Maya, fresh preparation, owner review, checkpoint recovery and Maya’s My Work. Existing workshop, worker readiness, goal, pattern and impact checks also pass.

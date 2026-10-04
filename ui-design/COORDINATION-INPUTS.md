# Explicit coordination inputs

Organization workstream detail and assignment inspection now share a Dependencies & input exchange section. The knowledge personal inbox exposes the same declared input relationship, and Organization attention includes an Input category. This is a frontend sample model, not a workflow engine or delivery receipt.

## Authored relationships

| Scenario | Provider | Required input | Receiver | Availability | Delivery / receipt |
| --- | --- | --- | --- | --- | --- |
| Knowledge workshop | K-02-C · Leo · Coordinator | Workshop coordinator brief | K-02-E · Maya · Editor | Missing in sample | Unconfirmed |
| Software payment | Codex · Developer; no provider assignment modeled | Exact candidate and checks | A-1042 · Alex · Reviewer | Attached sample represented | Unconfirmed |

`InputDependency` stores an explicit ID, stream, provider assignment or worker/role reference, receiving assignment, required input, availability, receipt state, explanation and optional return-for-clarification/revision expectation. The provider union allows the existing software handoff to remain honest about its missing developer assignment. `ParallelWork` separately identifies K-01-D research and K-01-E editorial criteria as work that may progress alongside each other. No relationship is extracted from labels, prose, project membership or list position. The larger software adapter has empty dependency/parallel arrays; its ordered flow is not promoted into inferred edges.

The workshop brief is allocated to Leo and the outline review to Maya. This missing input is separate from the unassigned Facilitator and its responsibility gap. The Input attention signal targets the receiving assignment. Its supplying assignment and provider worker can be inspected without switching the selected persona. This explains responsibility without putting Leo's task into Maya's inbox.

The payment candidate/checks are represented, so this authored relationship does not emit a missing-input signal. A local review response can be displayed alongside it, but the dependency still says delivery/receipt unconfirmed. Revision is an expected conditional return, not a new assignment, confirmed transfer or automatically advanced state.

## Navigation and state

Provider/receiver links retain scenario-qualified URLs and the selected sample persona. Read-only detail return uses a per-persona trail so repeated receiver → provider → receiver inspection unwinds to its source instead of alternating forever. Current-assignment references render as text rather than self-navigation. Refresh keeps existing URL behavior and falls back to the same scenario overview for direct details.

In the main software workspace, provider-worker inspection returns to its originating workstream or assignment. Existing assessment actions and receipts remain unchanged. Dependency state is authored independently of app response records; responses do not mutate input availability, confirm receipt, create allocation or establish outcomes. No delivery or acknowledgment command is introduced.

## Validation and limits

Fixture checks validate dependency IDs, worker/role references, supplying/receiving assignments, stream membership and parallel groups. Desktop/mobile browser coverage exercises provider assignment/worker inspection, bidirectional trail return, personal identity, Input attention, distinction from allocation gaps, refresh, represented software input after a local response and unchanged receipt state. Existing scenario, role and workstream-flow checks remain relevant.

This slice represents one missing workshop input, one attached software input and one parallel-work group. It is not a complete dependency audit. Missing records, unknown runtime availability, rejected input and confirmed acknowledgments will need richer authoritative states before integration. There is no automatic blocking engine, dispatch or scheduling.

Previews: `48-workshop-input-dependency.png`, `49-software-input-exchange.png`, `50-workshop-input-mobile.png`.

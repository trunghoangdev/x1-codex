# Performer acceptance and confirmed responsibility transfer

The main Software Factory sample's two local invitation allocations now support performer responses and confirmed reassignment. Original proposal, plan decision and allocation remain immutable. This is separate from the Knowledge use-chain demo.

## Separate actions

The allocated performer can accept responsibility, request clarification or decline with a rationale. Allocation alone still establishes no consent. A decline explicitly leaves coordination needed; clarification/acceptance do not supply missing criteria, candidate or checks and do not start execution.

Jamie acts as the demo planner to propose a transfer to another authored candidate for the same role/scope. The proposal includes pending work and exact input/decision context to inspect. The current owner remains unchanged until the proposed recipient explicitly accepts. Recipient decline or planner cancellation closes the offer without changing ownership. Acceptance changes the effective local assignment performer and binding reference, preserving the original allocation and event history. It does not copy an earlier review, input receipt or authorization.

Controls explicitly name their acting demo participant. Actor/worker selection is not sign-in, consent, capacity verification or policy enforcement. Only represented candidates are offered; unrestricted production reassignment is not implemented.

## Personal and shared views

The local assignment inbox shows the current assignment to its performer, a pending transfer offer to its proposed recipient and historical ownership to former performers. Personal/worker context limits offered controls to that demo participant; historical owners cannot act as the current performer from their personal card. Shared Organization/workstream views expose labelled planner/performer actions for scenario inspection.

The role projection resolves the current assignment performer and binding. Original binding records remain context; transfer does not revoke or grant real permissions. Attention annotates current performer/response and directs inspection of pending transfer/prerequisites. Local coordination activity includes response and transfer history under the allocation filter. Authored assignment counters remain separate.

## History and recovery

Events retain unique IDs, action, actor, rationale and timestamp. Transfer proposals additionally retain recipient and pending-work/input context. The effective owner and response are derived from this history; the original proposal worker is not rewritten. Repeated acceptance of an already resolved transfer cannot duplicate the assignment.

Main demo snapshots with lifecycle history use version 3 under the existing `forge-ui-demo-snapshot-v1` key. Versions 1/2 remain readable. Validation replays up to 100 events and checks actor, pending offer, candidate, action, record IDs and supplied fields. Forged recipient acceptance and incompatible versions are rejected. Save/import/reset continue to apply to the main demo as a whole; Knowledge checkpoints remain independently scoped. Older UI builds do not understand v3 main snapshots.

Pending work is a demo handoff note, not proof that an exact candidate or receipt exists. Missing input, capability, capacity, authority and external execution remain unverified. No production worker is contacted and no task is dispatched.

## Validation

Production build, diff checks and thirteen targeted model/browser checks passed across performer clarification/decline, proposal versus effective transfer, wrong recipient/duplicate acceptance rejection, cancellation, effective binding projection, phone/desktop personal inbox history, main snapshot v3 reload and existing allocation/continuity/activity behavior. Existing bundle-size advisory remains. No backend or participant result is claimed.

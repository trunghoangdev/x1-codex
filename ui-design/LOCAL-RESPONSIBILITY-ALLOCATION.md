# Local responsibility allocation · iteration 122

The main software sample now separates proposal → allocation-plan decision → explicit local allocation. Accepting a plan still creates no binding or assignment. Only **Prepare local allocation → Record local allocation** records the separate allocation; cancel preserves the accepted plan without allocating work.

The two existing invitation gaps are supported. Each allocation names its proposal, gap, WS-02 scope, performer, role, allocator/time, assignment and created/reused binding. Alex's invitation review reuses `mb-reviewer`; other allowed candidates receive a separately identified local scoped binding. A model guard prevents repeated allocation or allocation from a rejected/undecided plan. IDs are stable per supported gap. Execution, capacity, capability, performer acceptance and effective permission are not established.

## Where it appears

- **My Work:** a separate local assignment inbox, defaulting to Alex, with a sample-worker selector for inspecting other local assignees. This does not change the signed-in principal or existing authored response queue/counters.
- **Organization/workstream/worker:** scoped local responsibility cards with assignment, binding, prerequisites and the original gap → local resolution reference. WS-01 and unrelated workers do not inherit these assignments.
- **Roles:** the local projection supplies explicit assignment/scope links, created bindings and declared scope requirements. Opening the local assignment inspects its allocation record rather than routing it into the older software response fixture model.
- **Attention:** original authored gap remains inspectable with its local resolution annotation. Existing authored attention counters are not recast as verified production gap closure.
- **Activity:** separate allocation records and a Local allocations filter; the earlier accepted plan is described as allocation pending at that historical decision point.

Work remains **Allocated locally · prerequisites pending**. Review requires agreed criteria, an identifiable candidate and attached checks; implementation requires criteria and bounded scope. No candidate, execution or completion is invented. The authored fixtures remain an independent baseline, with their counts labelled separately from local allocations.

Allocated proposals cannot be individually removed, preserving their plan and allocation lineage. Explicit Demo continuity reset or whole-snapshot replacement can still roll back local state; this is not an immutable server audit. Reopening the modal inspects the same allocation, not a second assignment.

## Recovery

Main Demo continuity writes version 2 only when local allocations exist and retains the existing storage key. Current parsing accepts v1 and v2; v1 containing allocation is rejected. Allocation IDs, source proposal, worker/role/scope, binding mode, allocator, timestamp and accepted decision are validated together. Older UI readers cannot restore v2; use this or a compatible newer UI. The human Knowledge checkpoint remains separate and unchanged.

## Verification

Production build and twelve distinct targeted checks passed across runs: accepted-plan preconditions, rejection/no-op and duplicate prevention, Alex binding reuse and new Codex binding/scope projection, desktop/320px cancellation/record/focus, My Work worker selection, workstream/worker/role assignment inspection, allocation activity filtering, exact v2 recovery and invalid-link rejection, plus existing plan reviews and v1 continuity/reset/activity behavior. The main bundle now triggers Vite's advisory size warning above 500 kB; the build succeeds. No backend, participant or screen-reader session was conducted.

Lifecycle update · iteration 131: [performer responses and confirmed transfer](RESPONSIBILITY-ACCEPTANCE.md) now extend local allocation. Main snapshots carrying this history use v3; original allocation remains preserved. Capacity, effective permission and execution remain unverified.

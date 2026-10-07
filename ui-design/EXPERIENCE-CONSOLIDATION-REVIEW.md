# UI consolidation review

Reviewed 2026-10-06 against iteration 102 / commit 88e9e7c. Source/design inspection only: no new browser, screen-reader or participant session was run. Inspected the current overview composition, coordination-needs projection, contribution and receiving views, and recorded usability boundaries. No excluded repository was read.

## Assessment

The prototype now has enough breadth to explain virtual organizations and a coherent local contributor–receiver revision loop. Further value should come from consolidating the experience, not increasing screen count. Organization and My Work remain the right shared/personal split. Actual operational integration is still a separate application/backend undertaking.

## Recommended work, in order

### 1. Consolidate the Organization landing page

Knowledge currently places attention totals, section shortcuts, coordination-needs cards, the contribution exchange history and operating context before workstream coordination. These related layers can repeat the same situation while pushing goals/workstreams down the page. This is a source-based density concern, not measured user friction.

Keep shared purpose, compact attention/next actions and workstream coordination in the primary path. Place detailed exchange history and policy/agreement inspection behind clearly named disclosures or existing destinations. Avoid adding another dashboard. Preserve exact-subject inspection and source-return navigation.

Acceptance: Organization answers purpose, current coordination needs and affected workstreams without requiring the full exchange history. Desktop/phone task checks protect the shortened route and keyboard focus. Historical records remain reachable.

### 2. Label signal sources and state boundaries at the point of use

Attention totals combine authored scenario records and local contribution transitions. Workstream coordination counters remain authored projections. This separation is documented, but CoordinationNeeds does not show an explicit source label on each item. A user could expect every nearby counter to update after a local receipt.

Identify authored scenario context versus session observations directly in the signal presentation and explain the scope of each counter once near the summary. Do not call local observations live or authoritative. Keep current identity, missing follow-up ownership and evidence gaps intact.

Acceptance: users can tell which signal changed because of their sample action, which records remain authored, and why receipt does not close outcome gaps. Summary/category lists still agree on their shared projection.

### 3. Make session recovery a deliberate product choice

The integrated contribution has app-owned session state and is excluded from Demo continuity. Reload clears the loop, even though another part of the prototype offers saved snapshots. Existing labels disclose this, but the difference can interrupt demonstrations or longer drafting sessions.

Choose a bounded explicit save/restore extension for this exercise, or a clearly scoped unsaved-work warning and reset/restart path. Any saved format needs validation, versioning and review before replacement; command-unknown state must not restore as permission to resend. Keep retained SF sources and local exercise data separate. Do not describe browser storage as durable organizational state.

Acceptance: save scope is obvious; earlier revisions and unresolved command identity are preserved if restoration is supported; stale/corrupt imports cannot silently become valid state. Reload behavior must match visible copy and tests.

### 4. Run the integrated participant walkthrough

The existing participant plan starts the contributor from standalone Demos. Update it for Organization → Leo My Work → Maya receiver → Leo revision → shared coordination. Include an uncertain-command task and a question about authored versus session counters. Prepare a brief script and an unfilled results template, then obtain actual participant observations.

Acceptance: record observed misunderstandings and navigation friction, not inferred success. Actual screen-reader/user sessions remain outstanding. Automation can protect behavior but cannot establish comprehension or customer value.

## What does not need expansion now

More fictional domains, broad organization editors, visual workflow builders, analytics and speculative fleet screens are lower priority than these changes. A Control Plane remains part of the completed product vision; a useful operational design needs concrete operator tasks and supported data.

Live identity, server-authorized commands, shared persistence and SF integration remain essential before production. They require backend work and contracts rather than additional local UI demonstrations.

## Suggested next unit

Start with item 1: reorganize the existing Organization content without changing record semantics. Follow with item 2 before testing participant comprehension. Item 3 is useful for session continuity, but should not postpone actual task feedback indefinitely.

## Item 1 implementation checkpoint

Iteration 103 implements the primary Organization order and collapses Knowledge contribution history and operating context after workstreams. Case/decision/activity entrances also follow the primary coordination path. Existing record semantics and navigation remain; the policy shortcut opens the disclosure and focuses its target. Item 2, signal source labeling, remains next.

## Item 2 implementation checkpoint

Iteration 104 adds source metadata/labels to coordination signals and main attention, source totals to scoped summaries and explicit authored-counter context beside read-only-scenario workstreams. Knowledge contribution needs can change without implying a change to authored counters or outcomes. Item 3, deliberate contribution save/recovery behavior, remains next.

## Item 3 implementation checkpoint

Iteration 105 adds explicit Knowledge contribution checkpoint save/review/restore/removal with bounded versioned validation. Reload still starts empty; an explicitly restored checkpoint preserves revisions, receiving records and command uncertainty. Main and standalone Demos formats are unchanged. Item 4, the integrated participant walkthrough and actual observations, remains next.

## Item 4 preparation checkpoint

Iteration 106 prepares the integrated participant walkthrough and an unfilled session record. Contributor/receiver/coordinator tasks include source-counter comprehension, command uncertainty and checkpoint recovery. The package is ready; actual participant and assistive-technology sessions remain outstanding and cannot be replaced by browser automation.

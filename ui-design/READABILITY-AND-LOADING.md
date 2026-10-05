# Readability and screen loading

This slice improves three frequently used surfaces:

- Knowledge overview uses spaced label/value summaries for agreement, reviewer, evidence and policy context.
- Knowledge My Work keeps assignment totals and next action/waiting context visible, with count semantics in an expandable explanation. Follow-up resolution wording is shorter.
- Demo continuity keeps manual-save behavior visible while moving snapshot contents and exclusions into an expandable explanation. Import preview and replacement/reset confirmation stay explicit.

The first JavaScript bundle no longer contains ScenarioWorkspace, Demo continuity, standalone revision/larger demos, OrganizationActivity or HandoffDetail. Those views load on demand through shared Suspense/loading and error recovery boundaries. Scenario route validation is separated into `scenarioRoutes.ts`, preventing validation from pulling scenario screens into initial loading. Existing route-validation exports remain compatible.

Loading retains the app shell and navigation. Screen focus waits for deferred content to mount; query/filter changes still retain input focus. A failed view offers reload and navigation recovery, with the saved-snapshot limitation stated before reload. No automatic retry or execution is introduced.

Production build comparison: initial minified JS decreased from 565.33 kB to 490.97 kB (gzip 154.55 kB to 137.98 kB). Six deferred chunks range from about 3 kB to 54 kB. The build no longer reports a chunk exceeding 500 kB. This measures bundle size, not end-user latency; shared fixture data and the main assignment interface still load initially.

Validation covers delayed/failed module loads, unloaded initial scenario view, loaded-heading focus, navigation recovery, personal/scenario source return, snapshot continuity and main activity/handoff/keyboard flows. Desktop/mobile previews are in `previews/88-readable-*` and reproducible with `scripts/capture-readable-ui.mjs`.

All five items in this integration/continuity sequence now have their bounded initial implementation. Further improvements should follow a new review or demonstrated customer task rather than adding more directories.

# Display accessibility and second-browser checks

Checked 2026-10-05 using Chromium 153.0.8010.12 and Firefox 155.0 on this Linux environment. Browser versions were obtained from the launched engines, not assumed from documentation. Firefox was installed only in the repository-local browser cache; no system configuration or other repository was changed.

## Completed checks

Six task checks passed, three in each browser:

- At 640px and 320px CSS viewports: worker contribution confirmation and focus; reviewer assessment dialog, rationale entry, Escape dismissal and focus return; operator retained-product source navigation and exact heading focus. No document-level horizontal overflow occurred in these tested flows.
- Forced-colors emulation at 390px: media mode active, input focus outline present, operator authority/effect distinction still visible and source button keyboard activation preserved.

Forced-colors contribution-form previews were additionally captured at 320px in both browsers. The Firefox preview was visually inspected: text, native controls, borders and focused-textarea outline remain visible. No product CSS fix was required by these bounded checks. Test harness configuration was corrected so Firefox does not inherit the Chromium-specific channel.

These widths exercise reflow equivalent to the available CSS width of a 1280px viewport at 200% and 400% zoom. **They are not actual browser-menu zoom sessions.** Headless forced-colors emulation is not a real Windows high-contrast session. Passing these checks does not establish every page, color combination, scrolling panel or assistive-technology interaction.

## Repeat

From `x1-codex`:

```sh
PLAYWRIGHT_BROWSERS_PATH=$PWD/.cache/ms-playwright TMPDIR=$PWD/.cache/tmp npm exec --prefix ui-design -- playwright install firefox
LD_LIBRARY_PATH=$PWD/.cache/browser-libs/extracted/usr/lib/x86_64-linux-gnu PLAYWRIGHT_BROWSERS_PATH=$PWD/.cache/ms-playwright TMPDIR=$PWD/.cache/tmp npm test --prefix ui-design -- --config=playwright.accessibility.config.ts
```

The LD_LIBRARY_PATH override is specific to this environment's locally extracted libraries; it may be unnecessary on another workstation. Existing default tests remain Chromium-only. The separate config runs only this bounded suite in both browsers and starts/reuses the same local Vite server.

Previews: [Chromium forced colors](previews/95-forced-colors-chromium-320.png), [Firefox forced colors](previews/95-forced-colors-firefox-320.png). Capture script: `scripts/capture-display-accessibility.mjs`, run from ui-design with the browser environment above and Vite running on port 4173.

## Remaining manual checks

On a desktop browser with a 1280px content viewport, use its actual zoom control at 200% and 400%. Repeat confirmation, assessment dialog and exact-source navigation. Check pinned navigation, obscured focused elements, all modal actions, text wrapping and whether document scrolling is sufficient without horizontal page scrolling. Reset zoom afterward.

Also run the role tasks with a screen reader and real platform high-contrast/forced-colors settings. Record browser/OS/AT versions, actual observed announcements and task errors. Then run the prepared participant sessions in `USABILITY-ACCESSIBILITY-REVIEW.md`. None of those manual sessions were performed here. Backend/accessibility behavior with real authentication and admission remains outside the current prototype.

## Coordination and journey consistency · iteration 160 · 2026-10-09

Reviewed the shared stylesheet, Organization/My Work entrances and recent coordination/journey components. Corrected source-preview close focus return to its opener, repeat-source focus, disclosure focus outlines and target spacing, nested participant-panel padding, participant select sizing, long-button wrapping, narrow-screen chapter controls and source-record separation. Workstream cards no longer stretch to match a taller neighbor. Step/exchange status labels are explicit text; the new-record marker has a border and text rather than relying on color. Singular record counts are corrected.

Chromium checks cover 320, 640 and 1440 CSS-pixel widths across Knowledge Organization, Maya My Work, the larger organization and guided journey, plus keyboard disclosure activation, preview focus/return, explicit new-record markers and forced-colors emulation at 390px. Existing chapter/source, lifecycle next-action, overview and workspace-layout checks run alongside these. Desktop and phone captures were inspected; temporary captures are repository-local under `.cache`.

This pass checks representative shared layout and recent flows, not every historical software screen or all status semantics. It adds no workflow states or authority. Actual browser-menu zoom, screen-reader/platform high-contrast and participant sessions remain outstanding as described above. No participant session was performed.

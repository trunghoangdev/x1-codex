# Contribution revision comparison · iterations 113–119

Open **Compare draft-01 and draft-02** after starting a revision. The editor compares frozen draft-01 with current draft-02 preparation or its frozen delivery. The receiver inbox and shared exchange expose the comparison only after draft-02 delivery; unsent preparation stays out of those views.

The view includes:

- Maya’s original request and its assessment → receipt → delivery chain, explicitly attached to draft-01.
- The revision’s response relationship, without applying the original assessment to draft-02.
- Both texts with removed/replaced passages struck through and added/replacement passages underlined.
- Original scope note beside Leo’s revision response and each version’s citation state.
- Changed/unchanged text and note indicators, preparation/delivery distinction and pending reassessment.

The current text comparison trims equal leading/trailing lines, then uses the existing line LCS comparison for the remaining text, separating changed passages around matching context. It reports the number of passages. The LCS matrix is bounded to 250,000 cells; larger edits use one explicitly labelled coarse middle passage, which may include unchanged lines. Repeated lines can have multiple valid alignments; the display is not a semantic or word-level comparison. Rendering preserves exact text, including trailing-newline differences. It does not infer whether the request has been satisfied. No schema, submission rules or frozen records change. Desktop columns stack on narrow screens; text wraps, and change markers remain meaningful without color.

Production build and nine distinct targeted checks passed across runs: text reconstruction for changes/empty/trailing-newline cases, desktop/320px checkpoint-restored preparation and receiver visibility, shared revision loops, and existing Chromium/Firefox keyboard recovery flows. No participant or screen-reader session was conducted.

## Iteration 119 verification

Production build and ten related checks passed across targeted runs: insertion/deletion, empty/unchanged text, trailing newlines, repeated lines, separated changes with preserved middle context, bounded large-edit fallback, exact rendered text on desktop/320px, receiver visibility and version lineage, shared revision loops and Chromium/Firefox keyboard recovery. Comparison checks passed again after adding exact DOM text assertions. No participant or screen-reader session was conducted.

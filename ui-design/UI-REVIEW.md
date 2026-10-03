# Organization navigation and layout review

The prototype now covers organization goals, scoped workers, handoffs, attention, activity and outcome evidence. My Work remains the personal entry.

This review found two immediate usability issues: the overview required extensive scrolling through repeated detail, and the header gave every organization detail page the same label.

Implemented:

- Section shortcuts move keyboard focus and scroll to Goals, Attention or Roles & Workers while preserving the workspace URL.
- Other organization work and responsibility-gap explanations start collapsed and remain accessible through native summary controls. Their signals remain visible in Organization attention.
- Detail-page breadcrumbs identify the current subject and provide an Organization return action. Long mobile labels truncate visually while retaining their full accessible text.

Completed follow-up improvements:

- Compact attention summary with a dedicated list and durable category URLs.
- Personal queue under My Work and an independent Demos entry.
- Exact cited artifact inspection on its source page.
- Contextual assignment return with session filters, scroll and link focus.
- Shared detail-page back controls, spacing and empty-state presentation, with larger mobile targets and full-width filters/actions.

The current review list is complete. The prototype still uses authored sample data; these changes do not establish production API compatibility. A later review can evaluate larger organization scenarios before adding new administrative features.

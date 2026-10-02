# Organization navigation and layout review

The prototype now covers organization goals, scoped workers, handoffs, attention, activity and outcome evidence. My Work remains the personal entry.

This review found two immediate usability issues: the overview required extensive scrolling through repeated detail, and the header gave every organization detail page the same label.

Implemented:

- Section shortcuts move keyboard focus and scroll to Goals, Attention or Roles & Workers while preserving the workspace URL.
- Other organization work and responsibility-gap explanations start collapsed and remain accessible through native summary controls. Their signals remain visible in Organization attention.
- Detail-page breadcrumbs identify the current subject and provide an Organization return action. Long mobile labels truncate visually while retaining their full accessible text.

Remaining opportunities, in priority order:

Completed next increment: the overview now shows three attention counts linked to a dedicated list, with durable category URLs.
1. Move the personal Alex queue and standalone revision-cycle demonstration out of the primary organization overview once their alternative entry is designed.
2. Let related-record links open the exact cited artifact rather than the assignment's containing tab.
3. Review shared spacing, empty states and contextual return paths across all detail pages.

This increment keeps the authored sample model and existing response semantics. The review does not establish production API compatibility.

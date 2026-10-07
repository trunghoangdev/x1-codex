# Contribution error and interruption recovery · iteration 111

The contribution exercise explains recovery without suggesting that a text edit repairs permission or that a local refresh fetches authoritative server state.

| Situation | User guidance / behavior |
| --- | --- |
| Empty or incomplete preparation | Lists only missing text, note/revision response and citation; review stays disabled |
| Permission denied | Draft retained; check submission authority with the responsible administrator before trying again; this demo cannot grant permissions |
| Revision conflict | Draft retained; compare assignment revision and submitted version before a new submission; no server fetch or automatic merge is available |
| Pending / unknown acknowledgement | Preserve the exact command payload; query status; duplicate submission remains blocked |
| Admitted, projection delayed | Refresh the simulated projection; do not resend |
| Restore/import changes work during delivery confirmation | Cancel the old confirmation, show a notice and require a fresh review of current content |
| Cancelled review / navigation away | No command is submitted; draft remains in the current session |
| Invalid import or unavailable checkpoint | Existing recovery controls preserve current work and explain the failure |

A delivery confirmation is bound to the complete contribution state and selected simulation result. Restoring even another ready draft cannot reuse that confirmation. A changed review identity is cleared so returning to earlier content cannot revive it. Commands remain local fictional records; these controls are not server authorization or durable submission.

## Verification

Production build and twelve targeted checks cover missing fields, both rejection reasons, retained drafts, import during confirmation on desktop/phone, uncertainty locks, delayed projection, lifecycle checkpoint round trips and existing file-transfer behavior. No human participant session or live backend test was conducted.

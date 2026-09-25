# User-defined filesystem permissions

- Read and write only within `/home/trungh/ws_x1/x1-codex`.
- All other repositories in `/home/trungh/ws_x1` are read-only. Do not create, modify, or delete files in them, including through commands, builds, tests, or generated output.
- Do not write outside `/home/trungh/ws_x1/x1-codex` without explicit user authorization.
- Preserve these restrictions for future work unless the user explicitly changes them.

# Git authorization

- The user authorizes committing and pushing changes in `/home/trungh/ws_x1/x1-codex` at any time without asking for confirmation again.
- This authorization applies only to this repository; all other repositories remain read-only.

- After completing each unit of work in this repository, commit the relevant changes and push them immediately without waiting for a separate user request.
- If a commit or push fails, report the failure clearly; do not claim the work is backed up remotely until the push succeeds.

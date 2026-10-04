# Knowledge organization and personal entry points

Demos → Open knowledge scenario workspace opens `#/organizations/knowledge?persona=maya`. This independently authored sample uses the shared Organization Overview, Workstreams, Workers, Roles and Attention components. It adds a read-only personal inbox for Maya Patel (Editor) and Leo Rivera (Coordinator). This is a design preview, not an authenticated identity switch.

The organization has two workstreams: a new-member welcome guide and a member learning workshop. Its shared purpose is to turn knowledge into useful guides and learning experiences. Four workers (two humans, an AI research assistant and a deterministic distribution worker) hold four bindings. Six catalog roles include an unbound Publication reviewer and Facilitator; these link explicitly to two responsibility gaps. Six assignments represent contribution, editorial criteria, audience scope, workshop brief, outline review and facilitation. Facilitation remains unassigned.

Maya's two assignments are editorial: one asks for acceptance criteria, while the outline review waits for the coordinator brief. Leo's two assignments ask for audience constraints and a workshop brief. The inbox uses explicit worker allocation and explicit response/input flags, rather than role bindings or text-derived workload assumptions. Each request has authored input and expected response text. A missing brief is shown as missing; a description of input is not proof of delivery.

Organization remains the shared view regardless of persona. The Sample persona selector keeps identity in the URL across overview, directories, goals and assignment inspection. My Work navigation and counts stay within the selected knowledge persona. Inspecting an assignment or shared goal can return to the originating inbox; browser history and refresh retain URL identity. Switching persona changes the inbox and focuses its heading. Context return is keyed by scenario and persona so it cannot silently restore another person's inbox. After refreshing a direct detail link, return falls back to the same scenario overview.

The sample provides expected coordination, not confirmed transfers. Editorial criteria can develop alongside research; assessment and publication review must precede distribution. The workshop outline awaits its brief and facilitation responsibility is missing. No verified guide, publication approval, audience delivery, scheduled session or outcome observations are invented. No response, publication, distribution or scheduling action is enabled. Activity is empty for this scenario, and no main-scenario session records are projected into it.

Return to main organization explicitly restores the existing Alex/software sample. Larger software scenario exploration still uses its existing read-only behavior. No new backend, authorization model, tenant support or real SF integration is implemented.

Previews: `45-knowledge-organization.png`, `46-maya-personal-inbox.png`, `47-leo-personal-inbox-mobile.png` in `previews/`. Together they demonstrate the shared organizational model outside software and personal entry points with different responsibilities. They do not establish usability for arbitrary organizations or production identity management.

## Workshop input relationship

The missing brief now has an explicit dependency ID linking Leo’s K-02-C to Maya’s K-02-E. The inbox, assignment and shared stream expose supplying-assignment/provider-worker inspection and unchanged persona context. Input attention isolates the missing brief from the Facilitator allocation gap. K-01-D research and K-01-E editorial criteria are a declared parallel-work group. See [COORDINATION-INPUTS.md](COORDINATION-INPUTS.md).

## Personal queue filters

Knowledge My Work now shares search, role, workstream and response/input filters with the larger software sample. Personal URLs retain filters through detail return and refresh; switching between Maya and Leo resets personal filters. Zero matched results offer Show all recovery, and attention counts explicitly allow overlap. See [PERSONAL-WORK.md](PERSONAL-WORK.md).

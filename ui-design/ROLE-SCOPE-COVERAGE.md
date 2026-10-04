# Role coverage by declared scope

Open Organization → Browse roles → Coverage by workstream. The original Role catalog remains available. All three scenario adapters now supply stable binding IDs, typed scope references, explicit assignment/scope/binding links and authored role requirements for workstream scopes.

## Data and meaning

Scopes distinguish workstream, project, environment, subject and organization. Workstream scopes reference stream IDs; broader records retain their explicit project/environment/subject identifiers. Scope labels remain presentation text. The coverage view does not match labels or automatically inherit a project/environment/organization binding into a workstream.

A scoped role requirement declares one of three binding relationships: declared (with binding IDs), none represented, or unknown (with any explicitly identified unresolved binding references). Missing requirement cells in the matrix say Not modeled · coverage unknown. They do not mean the role is missing, fulfilled or unnecessary.

Assignments use explicit assignment/scope links and optional binding IDs. A worker allocation, assignment-to-binding link and declaration that a binding applies to a requirement are separate records. The view shows unknown assignment-to-binding relationships instead of constructing a link from worker/role equality. Known gap IDs are tied to requirements independently of binding and assignment counts. None of these references grants authority, reserves capacity or establishes outcome success.

## Authored examples

- Main Developer has a payment-workstream binding and no represented contribution assignment. Invitation implementation has neither a developer binding nor an implementation assignment, with its known gap retained.
- Main Reviewer has broader Payments API and Team Workspace project scopes. The authored requirements explicitly reference this binding for payment and invitation responsibility. A-1042 has a declared link for payment assessment; invitation has no assessment assignment and retains its gap. A-1032 onboarding is a separate subject and is not moved into the invitation stream.
- A-1041 release authority belongs to the production v1.8.2 subject. A-1035 reconciliation belongs to the staging environment. These are listed under Scopes outside the workstream view; neither is invented as downstream work for payment reliability.
- Knowledge publication review has no represented binding or assignment; facilitation has an unassigned assignment and no binding. Distributor has a conditional approved-material binding, but its relationship to the welcome guide is explicitly unknown. The unresolved binding is not counted as declared coverage and no publication approval is implied.
- Larger stream bindings reference stable stream scopes and assignment IDs. Its unassigned L-02-R assessment has no binding link and retains the known gap. The broader Planner relationship to each stream is separately declared; the Executor's authorized-subject scope is not inherited into every stream.

Main fixture binding metadata is explicitly authored alongside its seven existing binding records; IDs are not generated from scope labels. Larger binding IDs originate from the authored source assignment IDs, while Planner/Executor have their own stable IDs. Existing bindings, assignments and gap counts are preserved.

## View and navigation

Choose a workstream, search scoped role/worker records and filter no binding, binding without scoped assignment, known gaps or unknown scope relationship. Counts refer to the represented requirements in the selected scope, not a complete role audit. Reset retains the selected scope and focuses search.

The collapsed Role × workstream overview shows all catalog roles and workstreams, independently of detail filters. Inspecting a declared cell selects its scope and role search. The HTML table has row/column headers and a caption, with a keyboard-focusable horizontal scroll region on narrow screens. Records outside workstream scopes have a separate disclosure.

Mode and filters persist in URLs using `view=scope`, `scope`, `q` and `coverage`, with scenario persona retained where present. Main and read-only worker/assignment/workstream return preserves the originating role view. Invalid scope or view values are rejected. No editing, allocation or permission action is introduced.

Direct examples:

- `#/organization/roles?view=scope&scope=scope-WS-02`
- `#/organizations/knowledge/roles?view=scope&scope=scope-K-01&coverage=unknown&persona=maya`
- `#/organizations/large/roles?view=scope&scope=scope-L-02&persona=sam`

## Validation and limits

Reference checks cover unique scope/binding IDs, worker/role identity, assignment membership, requirement/binding/gap links and stream boundaries. Tests demonstrate that renamed display labels do not change relationships and missing assignment-to-binding links remain unknown. Desktop/mobile checks exercise scope filters, matrix cells, contextual return, refresh, empty recovery/search focus, unbound versus unknown knowledge cases, separate environment/subject scopes and bounded horizontal scrolling.

These are authored frontend relationships, not validated effective authorization or a production scope-containment policy. Labels such as declared refer only to fixture relationships. Required roles beyond those modeled remain unknown. Real-provider integration still needs authoritative identity, scope semantics and record validation.

Previews: `54-invitation-role-coverage.png`, `55-knowledge-scope-unknown-mobile.png`, `56-large-role-scope-matrix.png`.

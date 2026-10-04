# Compact directories — Workers, Workstreams and Roles

Workers is the first bounded directory in the shared workspace. Open Organization → Browse workers in any of the three samples. The larger software sample has nine workers, enough to exercise two pages without inventing live workload.

Each page shows at most six workers. Cards retain name, type, scoped-binding count, explicit-assignment count and Open worker. A native keyboard-operable disclosure holds binding scope text and assignment IDs. Search examines the full authored records, including collapsed contents. Expanding a card does not establish availability or permission.

The result status describes the full filtered set separately from the displayed range and page. Previous/Next focuses that status. Search/type/role/assignment changes reset to page one; clear and empty recovery clear paging. Empty recovery focuses search. Organization responsibility gaps remain independent of filters and pages.

The optional `page` URL parameter is a positive safe integer. Main and read-only scenario routes preserve it with filters and persona. Refresh restores the requested page; existing detail-return context restores the original directory URL. A positive page above the filtered page count displays the last available page (URL unchanged); malformed/zero/fractional pages are rejected. This is frontend fixture pagination, not a runtime cursor API.

Disclosure state resets after leaving the directory. Page/filter context persists in the URL; refreshing a worker detail still uses the existing fallback to Organization rather than fabricating an origin.

Role catalog/coverage and catalog binding/assignment/gap lists are now paged too (iteration 69 below). Overview is unchanged. No page count or hidden-record count is a health, workload or capacity score.

Validation: build and seven focused checks passed, including desktop/mobile paging, counts, keyboard disclosure, focus, persona preservation, refresh, detail return, filter reset, empty recovery, out-of-range clamp, invalid pages and document-width overflow. Existing worker-directory and larger scenario checks passed in the same run.

## Workstreams — iteration 68

Workstreams now shows four cards per page across all three scenarios. The existing six-stream larger fixture exercises two pages. Summaries retain stream/project identity, responsibility gap count, outcome signal and authored assignment count. Goal, gap titles and outcome prose move to a native disclosure; search still finds collapsed goal text. No explicit gap does not imply coverage, and no represented outcome signal does not imply success.

Workstreams uses the same page validation/clamping, URL/filter/persona preservation, page-change focus and empty recovery behavior as Workers. Search, Project and Attention signal changes reset to page one. Detail return restores page/filters with the existing main/read-only context; disclosures reset when leaving. Overview is unchanged.

Validation: build and nine related tests passed for both widths, including Workstreams paging/disclosure/return/refresh/filter-reset/empty/invalid URLs, existing Workstreams signals/filters, larger scenario navigation and Workers paging regression.

## Roles and nested records — iteration 69

Role catalog and scoped role requirements show four cards per page. Catalog cards retain purpose and independent binding/assignment/gap totals. Unbound definitions remain explicit. Inspect role records opens one role’s records at a time with `aria-expanded`/`aria-controls`. Each catalog binding, assignment and gap list shows at most four records per nested page. Lists keep their full totals separate from visible ranges. No binding-to-assignment match, audited completeness or capacity is inferred.

`page`, `detail` (catalog role name), `bindingsPage`, `assignmentsPage` and `gapsPage` serialize in main and scenario URLs. Pages require positive safe integers; detail names must belong to the selected scenario’s role catalog, independent of bindings. Out-of-range pages clamp visually. Search/coverage changes clear directory/nested pages and collapse details; changing catalog page also closes/reset details. Opening a different role resets its nested pages. Refresh and existing detail return restore the exact expanded role, filters, directory and nested pages; read-only persona is preserved. Search selects whole roles, not individual nested records, so matches can be on another record page. The UI states this distinction.

Scope filters reset the scoped directory page. Matrix cell inspection resets to the selected role/workstream; its optional matrix remains a complete small fixture reference. Scoped requirement cards retain binding/assignment/gap distinctions and explanatory unknown states; their existing small relationship lists and broader-scope disclosure are unchanged. Overview summaries are unchanged. This completes the agreed directory/catalog density slice; runtime cursors, arbitrary-volume matrix design and other screens’ lists remain separate work.

Validation: build and fourteen related tests passed across three samples and both widths. New coverage checks catalog/nested paging, independent list totals, keyboard expansion, focused results, refresh and worker/assignment return, scope-filter reset, empty recovery, invalid pages/foreign role names and mobile overflow. Existing role, scope, knowledge and larger-workspace checks passed after adapting expectations to displayed page ranges and explicit expansion.

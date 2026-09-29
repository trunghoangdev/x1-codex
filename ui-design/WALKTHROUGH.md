# Software Factory UI prototype v1 · demo walkthrough

An English-language, roughly 10-minute walkthrough of human review and release authority. All people, assignments, evidence and outcomes are fictional. This demonstrates the UI, not a working Software Factory integration.

## Start a clean session

From `ui-design`, run `npm run dev -- --port 4173 --strictPort` and open the URL printed by Vite. Refresh once before presenting: this clears local responses, drafts and preview scenarios. Navigate to `#/work` to reset URL filters as well. No account or backend is required.

Explain that Alex Morgan is a sample persona with several roles. A role's label is not a production permission check. The demo day and deadlines are fixed samples.

Demo scenario selectors are collapsed by default under **Demo controls**. Expand the relevant group before changing Data preview, Checks, release prerequisites or decision-change simulations. Collapsing controls preserves the selected scenario; results and blocking messages remain visible.

## 1. Find the next responsibility

On **My Work**, leave **Data preview** at **Loaded sample work**. Select **Payments API** under Project. The list contains three assignments. Point out the distinction between assessment, authority and reconciliation. Open **A-1042**.

Read the Overview requirements: permitted paths are different from required deliverables, and requirements are not passed checks. This assignment asks for an assessment, not deployment approval.

[My Work](previews/01-my-work.png) · [Assignment](previews/02-assignment.png)

## 2. Inspect before deciding

Open **Attempts** and inspect the produced candidate. The failure examples distinguish process exit from platform state and cleanup. A failed attempt does not acquire a candidate link by implication.

On **Candidate**, switch between **Unified** and **Side by side**. Search changed files for `retry.test`, then select the matching file. Clear the search to restore the file list. The current diff remains selected when filtering; moving between tabs retains the review context in this session.

Open **Checks**. Its passed/refused/could-not-run options are separate fictional scenarios, not three real executions. Even a passed sample validator is not a human assessment or release authorization.

[Attempts](previews/07-attempts.png) · [Candidate](previews/08-candidate.png) · [Split diff](previews/13-split-diff.png) · [Checks](previews/09-checks.png)

## 3. Trace evidence and keep a draft

On **Evidence**, search `AR-775`, open Test results and read the limitation: the historical fixture is not a verified report bound to the current candidate. Close with Escape. Clear the evidence search.

Choose **Submit assessment** and type: “Sample review: additional evidence is required before accepting the entire objective.” Close with Escape. The rationale stays as a session draft. Return to Candidate or Evidence and resume the draft with the review shortcut. Closing did not submit anything.

Record the assessment, then open **Activity**. The local receipt records the rationale and subject; it is not server-admitted. Use **Activity type** to switch between local responses and sample evidence. Evidence entries are available records, not a chronological server event log.

[Assessment dialog](previews/03-assessment.png) · [Local receipt](previews/10-receipt.png) · [Activity evidence filter](previews/15-activity.png)

## 4. Make a separate release decision

Return to **My Work**. A-1042 is now under **Completed**. Open **A-1041**, the separate release subject. Approval starts disabled because prerequisite evidence is missing; refusal remains available.

Use **Preview release prerequisites** to inspect missing evidence, refused assessment and ready states. Load-error, stale and revoked states block both decisions. Select the ready scenario to demonstrate approval, enter a rationale and record it. Approval is for this exact sample subject. It does not confirm execution or a deployment effect, and the A-1042 assessment is not silently reused as release evidence.

[Release review — missing prerequisites](previews/11-release-review.png)

## 5. Return to the organization

Open **Organization**. **Needs your attention** identifies the responsible person, waiting reason and next step for each sample assignment. Use Project, Role and Status to narrow the Awaiting response, Blocked and Responded groups. Reset the filters to restore all sample assignments. Recorded responses have links to Activity; remaining release blockers follow the current scenario. The queue covers Alex's five sample assignments, not the full organization backlog.

Open workspace **Evidence**. Search within each assignment group independently. A-1042 evidence stays separate from A-1041. The release chain keeps unconnected evidence and unestablished effects explicit.

[Organization](previews/04-organization.png) · [Evidence index](previews/05-evidence.png)

## 6. Demonstrate recovery and mobile use

On My Work, select **Load failed** in Data preview. The inbox hides unavailable counts and explains that an unknown count is not zero work. **Retry sample load** briefly shows loading, then restores fixtures without clearing session responses or filters. Select **No assigned work** to show a successful empty response, then restore the sample work. Neither action contacts SF.

At phone width, use the navigation toggle and assignment tabs. The response shortcut moves focus to the authority panel. Keyboard users can Tab to **Skip to main content**; dialogs keep focus inside and Escape returns it to the opener.

[Load failure](previews/14-load-error.png) · [Mobile inbox](previews/06-mobile.png) · [Mobile candidate](previews/12-mobile-candidate.png)

## End with the boundaries

Screen URLs and My Work filters are shareable. Drafts, receipts, completions and scenario choices are session-only; refresh clears them. Activity/evidence searches reset when their view unmounts. Screenshots show selected moments, not one persistent cross-image database: Organization/Evidence include the captured assessment, while mobile and later previews start fresh sessions.

Prototype v1 is a UI review checkpoint. It includes no authentication, durable storage, governed command admission, real worker runs or deployment. Production integration, broad accessibility testing and customer usability feedback remain separate work.

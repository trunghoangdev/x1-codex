# Software Factory UI prototype v1 · demo walkthrough

An English-language, roughly 10-minute walkthrough of human review and release authority. The main review scenario is fictional. Separate retained-SF inspection contains labeled real historical metadata. This demonstrates the UI, not a working Software Factory integration.

Workflow screenshots: iteration 35, 20 captures; these predate the organization overview. Modal screenshots show the visible scrolled portion of the dialog; they do not imply every field fits at once.

## Start a clean session

From `ui-design`, run `npm run dev -- --port 4173 --strictPort` and open the URL printed by Vite. Use a fresh browser profile for a clean presentation. Main reload can restore a saved Demos continuity snapshot; Knowledge reload starts empty and offers explicit recovery. The root URL opens Organization; `#/work` opens the personal inbox with reset filters. No account or backend is required.

Explain that Alex Morgan is a sample persona with several roles. A role's label is not a production permission check. The demo day and deadlines are fixed samples.

Demo scenario selectors are collapsed by default under **Demo controls**. Expand the relevant group before changing Data preview, Checks, release prerequisites or decision-change simulations. Collapsing controls preserves the selected scenario; results and blocking messages remain visible.

## Organization first

Start at the root URL. Compare the two workstreams, their goals, coordination and unverified outcomes. Inspect the scoped role bindings: Alex holds several distinct responsibilities. The production release, staging reconciliation and accessibility assessment remain separate related work, without invented dependency links. Select **Explore workstream · WS-01** to inspect the developer/reviewer handoff and conditional revision loop. Open its evidence and use browser Back to return. WS-02 shows clarification followed by proposed, unassigned work. A local response does not advance either pattern or verify its goal. Use **Back to Organization**, then **Open My Work · Alex** for personal responsibilities.

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

Use **Review criteria** to jump to the criterion summaries. Expand only the criterion being reviewed; its summary retains status, citation count and note indicator when collapsed. Progress counts explicit reviewer statuses, not passed criteria. Use **Overall rationale** to return to the required rationale field.

Under **Review each criterion**, mark Prevent duplicate payment effects as **Insufficient evidence**, explain the missing candidate-specific coverage, and optionally cite AR-775 for that criterion. Other criteria remain **Not reviewed** unless explicitly assessed. These observations do not automatically set the overall conclusion.

Choose an **Assessment conclusion** (for this example, **Insufficient evidence**). Optionally cite AR-775; citing it does not verify it. Record the assessment, then open **Activity**. The receipt preserves the conclusion and cited records separately from the rationale. The local receipt records the rationale and subject; it is not server-admitted. Use **Activity type** to switch between local responses and sample evidence. Evidence entries are available records, not a chronological server event log.

[Assessment dialog](previews/03-assessment.png) · [Local receipt](previews/10-receipt.png) · [Activity evidence filter](previews/15-activity.png)

[Criterion review](previews/16-criterion-review.png) · [Mobile review](previews/17-mobile-review.png)

## 4. Make a separate release decision

Return to **My Work**. A-1042 is now under **Completed**. Open **A-1041**, the separate release subject. Approval starts disabled because prerequisite evidence is missing; refusal remains available.

Use **Preview release prerequisites** to inspect missing evidence, refused assessment and ready states. Load-error, stale and revoked states block both decisions. Select the ready scenario to demonstrate approval, enter a rationale and record it. Approval is for this exact sample subject. It does not confirm execution or a deployment effect, and the A-1042 assessment is not silently reused as release evidence.

[Release review — missing prerequisites](previews/11-release-review.png)

## 5. Return to the organization

Open **My Work → View response queue · Alex**. **Needs your attention** identifies the responsible person, waiting reason and next step for each sample assignment. Use Project, Role and Status to narrow the Awaiting response, Blocked and Responded groups. Reset the filters to restore all sample assignments. Recorded responses have links to Activity; remaining release blockers follow the current scenario. The queue covers Alex's five sample assignments, not the full organization backlog.

Open workspace **Evidence**. Search within each assignment group independently. A-1042 evidence stays separate from A-1041. The release chain keeps unconnected evidence and unestablished effects explicit.

[Organization](previews/04-organization.png) · [Evidence index](previews/05-evidence.png)

## 6. Demonstrate recovery and mobile use

On My Work, select **Load failed** in Data preview. The inbox hides unavailable counts and explains that an unknown count is not zero work. **Retry sample load** briefly shows loading, then restores fixtures without clearing session responses or filters. Select **No assigned work** to show a successful empty response, then restore the sample work. Neither action contacts SF.

At phone width, use the navigation toggle and assignment tabs. The response shortcut moves focus to the authority panel. Keyboard users can Tab to **Skip to main content**; dialogs keep focus inside and Escape returns it to the opener.

[Load failure](previews/14-load-error.png) · [Mobile inbox](previews/06-mobile.png) · [Mobile candidate](previews/12-mobile-candidate.png)

## Optional: reconcile an unconfirmed staging effect

Open **A-1035** and compare Expected, Observed and Still needed. Observation 238 records request acceptance, not a running artifact or health result. Choose **Record reconciliation**, select **Still undetermined** and explain the additional evidence needed. Confirmed-effect and mismatch conclusions are unavailable for this incomplete fixture. The Activity receipt preserves the comparison; recording a response does not confirm or repeat the deployment.

[Staging reconciliation](previews/19-reconciliation.png)

## Optional: response delivery failures

Before recording a response, expand **Demo controls · Response delivery** and select a Delivery scenario. Rejected and Offline before sending retain the draft. Acknowledgement lost blocks resend until **Simulate status check: not received** explicitly resolves the sample uncertainty. Then select Receipt confirmed to retry. Closing during Sending also preserves an unknown status on resume. None of these actions contacts SF; refresh clears the entire simulation.

[Unknown delivery outcome](previews/18-delivery-unknown.png)

## Optional: follow a revision cycle

In **Organization**, find **Revision cycle · standalone sample**. Select DEMO-A1 to see Changes requested on revision 1, then follow its contribution reference. Open DEMO-C2 and follow the revision request back to DEMO-W2. Finally inspect DEMO-A2: its subject is revision 2 and its review remains pending. The earlier assessment is context, not a verdict on the new subject.

This is a separate authored example, not A-1042 history. Recording Changes requested in the live prototype does not automatically create these records. No new candidate file bodies or verified test evidence are supplied by this example.

[Revision cycle](previews/20-revision-cycle.png)

## End with the boundaries

Screen URLs and My Work filters are shareable. Drafts, receipts, completions and scenario choices are session-only; refresh clears them. Activity filters and Evidence searches survive navigation per assignment and reset on refresh. Returning to My Work restores the opened row when it remains in the list. Screenshots show selected moments, not one persistent cross-image database: Organization/Evidence include the captured assessment, while mobile and later previews start fresh sessions.

Prototype v1 is a UI review checkpoint. It includes no authentication, durable storage, governed command admission, real worker runs or deployment. Production integration, broad accessibility testing and customer usability feedback remain separate work.

## Inspect roles and workers

From Organization, choose **View worker · Alex Morgan**. Compare Reviewer, Product owner, Release authority and Operator scopes and their explicitly linked assignments. Open an assignment, then use browser Back to return. Inspect Jamie, Codex or Release runner: no linked sample assignments does not imply idle capacity. Return to Organization and inspect **Responsibility gaps** for the invitation workstream. This view describes sample responsibilities, not runtime health or live authorization.

## Review organization attention

On Organization, find **Organization attention** below the workstreams. Select a category count or **View all organization attention** to open the full list. Filter Responsibility to inspect missing bindings/assignments, Response for pending decisions and clarification, or Outcome for unconfirmed effects and goals. Open A-1042, record an assessment and return: its response signal disappears while the payment outcome remains unverified. Change A-1041 prerequisites to inspect the matching blocked-decision explanation. Category URLs preserve the filter across refresh and browser history; refreshing clears local responses. This bounded signal list does not establish organization health.

## Inspect a handoff

Open the payment workstream, then **Open handoff · Candidate to reviewer**. Compare sender/receiver scopes, required inputs and receiving conditions. Inspect the candidate or evidence and use browser Back to return. A recorded assessment exposes its receipt while delivery remains unconfirmed. The invitation handoff shows criteria going to the planner and explicitly missing planning assignment/evidence. **Back to workstream** returns to the corresponding stream.

## Explore organization activity

Select **View organization activity**. Filter to Payment webhook reliability to see its three attached records; Other organization work contains the separate release evidence. The invitation stream has no attached evidence. Record an assessment and return to see its dated local response. Inspect the response through assignment Activity. Refresh clears session receipts while keeping sample evidence.

## Review an outcome

Open Payment webhook reliability and choose **Review outcome evidence**. Compare recovery and duplicate-processing requirements with the attached source, notes and historical test fixture. Inspect supporting context to open that exact artifact without leaving Outcome review. Close the inspector to return to the source link. Recording an assignment assessment leaves the outcome unverified. The invitation outcome has no attached context records and needs criteria, implementation identity and observed behavior. Outcome-review responsibility remains unassigned in both samples.

## Move around the overview

Use Goals & workstreams, Attention or Roles & workers shortcuts to scroll and focus the corresponding heading. Expand Other organization work or Responsibility gaps for secondary explanations. On detail pages, the header shows the current subject; its Organization button returns to the overview. The long subject label truncates visually on mobile.

The standalone revision cycle is now reached through **Demos** (`#/demos`). Organization Overview focuses on goals, scoped workers and coordination. The grouped personal queue is reached from My Work at `#/work/attention`.

Artifact IDs in Workstream, Handoff and Organization activity also open their exact records directly. Collection links and assignment links still open the relevant assignment tab.

## Return to the source

Filter Organization activity to Other organization work, open Assignment activity for A-1041, then use **Back to Organization activity**. Its scope/type filters remain. From a workstream, handoff, outcome or worker, opening an assignment gives a correspondingly named Back button; switching assignment tabs retains this return context. The personal queue preserves its project/role/status filters. Source scroll/focus restoration lasts for the browser session; refreshing an assignment resets its return destination to My Work.

## Explore a larger organization

Open Demos → Explore larger organization. Select workstreams to inspect responsibilities, then filter the directory by Codex worker and Revision requested to find the onboarding loop. Reset and select Unassigned to inspect the invitation assessment gap. Compare the nine workers' scoped bindings. This independent scenario leaves My Work's five sample assignments intact; no response or outcome is recorded here.

## Propose responsibility

Open Organization attention → Responsibility and propose a worker for Invitation implementation. Inspect its fixed Developer role and invitation scope; record a reason. The receipt remains awaiting allocation and the two gaps stay visible. Close, then reopen from the overview's Responsibility gaps. Try the assessment gap: an existing reviewer binding still needs an assignment and candidate. Refresh clears these local proposals.

## Guided customer presentation

Demos → Start customer walkthrough opens an eight-step guide over the main workspace. It connects organization goals, invitation coordination and responsibility proposals with Alex's personal work, then switches explicitly to payment evidence and outcome review. Use Open this step after exploring another link. Advancing tracks navigation, not task completion. See [CUSTOMER-WALKTHROUGH.md](CUSTOMER-WALKTHROUGH.md) for the presentation narrative and sample boundaries.

## Workstreams directory

From Organization, choose Browse workstreams. Filter by Missing responsibility to find invitation's two gaps, or Unverified outcome to inspect both streams. Combine project and search, open a workstream, then use Back to Workstreams to retain the directory URL. A proposal or assessment does not remove these signals. Refreshing a detail restores the normal Organization fallback.

## Workers directory

From Organization, choose Browse workers. Alex has four scoped bindings and five linked assignments; the other three workers have bindings but no assignment links in this sample. Filter type, role or assignment links, then open a worker to inspect scoped responsibilities. Back to Workers retains the filter URL during the session. The organization gap panel stays independent of worker filters and opens Responsibility attention.

## Workstream flow

Open either workstream and read Coordination & handoffs from top to bottom. Payment includes a conditional revision loop; invitation separates implementation and assessment gaps. Use the step links to inspect assignment, sample records, exchange or responsibility attention. Recording an assessment changes its local receipt display but does not advance the flow or verify its final outcome.

## Review a proposed allocation

Record an invitation proposal, then select Review allocation plan. Inspect worker, scope, binding plan and assignment prerequisites. Accept or reject with a decision reason. The receipt can be reopened; accepted plans still await allocation and responsibility gaps remain visible. Removing the proposal removes its decision; refresh clears both.

## Help for new users

Expand Understand this workspace on Organization for the main terms and entry points. If a directory has no matches, Show all workers/workstreams clears filters and returns focus to search. During allocation review, expand Original proposal reason and time when you need the request context.

## Coordination history

Record a responsibility proposal and accept or reject its allocation plan. Open Organization → View organization activity and select the invitation scope. Filter Responsibility proposals or Allocation-plan decisions, then Inspect coordination receipt to view the original proposal/decision without leaving Activity. Removing the local proposal removes both derived records; this is session history rather than a permanent audit log.

## Larger sample through shared organization screens

Demos → Open larger scenario workspace opens the six-workstream/nine-worker sample with the same Overview and directories. Inspect attention categories, filter workstreams/workers, open scoped detail and inspect read-only assignments. Return to main organization preserves its session records during navigation; refresh still clears all local records. My Work remains Alex's main sample inbox. The original larger demo remains separate.

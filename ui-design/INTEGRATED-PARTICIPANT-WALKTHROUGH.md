# Integrated collaboration participant walkthrough

Prepared 2026-10-06 against iteration 105. **Ready for participants; no participant or screen-reader session has been run.** Browser rehearsal confirms mechanics only.

The goal is to discover whether people understand the shared organization/personal-work experience, exact revisions, source boundaries and recovery. This is a usability exercise with fictional data, not a test of AI writing quality or production readiness.

## Session setup

Allow roughly 25–35 minutes as a planning estimate, not a measured task duration. Use one browser tab on one origin throughout the exercise. Open the URL printed by `npm run dev` and append `#/organizations/knowledge?persona=leo`. Start each participant in a fresh browser profile so previous local checkpoints do not affect the session. Do not clear someone else's demo storage.

Use one participant sequentially playing contributor, receiver and coordinator, or have people take turns in the same browser. Separate browsers/devices do not share this local state. Switching the sample persona does not sign in or grant real permissions. The coordinator task uses Organization inspection, not a new coordinator identity or authority.

Tell the participant:

> This is a local prototype with fictional work. We are testing the interface, not you. Please say what you are looking for and what you believe happened. Some records are fixed examples; some change as you act. Nothing is sent to a real recipient or published. You may stop at any time.

Use invented text only. Ask before recording; otherwise take notes. Have a keyboard-only run and a phone-width run where appropriate. Real assistive-technology sessions must record the actual browser/OS/screen-reader combination; automation is not a substitute.

## Participant tasks

Read one task at a time. Avoid naming controls or explaining the expected distinction before the participant answers.

| Task | Prompt |
| --- | --- |
| A · Find your responsibility | “You are Leo. Find the guide contribution you owe, its input, what you should deliver and who receives it. Prepare a short contribution and send it for review. Explain what has happened so far.” |
| B · Receive the work | “Now act as Maya. Find Leo's delivered work. Identify its version and scope, acknowledge receiving it, then use the sample review to ask for a revision. What does your acknowledgement establish?” |
| C · Respond to review | “Return as Leo. Find the feedback and prepare a revised contribution. Explain what changed and find the earlier version. Deliver the revision, then as Maya acknowledge receiving it. Is the result accepted or published?” |
| D · Coordinate the organization | “Inspect the organization. Find where this contribution needs attention and distinguish it from other work. Explain which information changed during your actions, which remains fixed, and what still needs evidence.” |
| E · Continue an uncertain submission | “In a fresh exercise, prepare a contribution whose acknowledgement is uncertain. Explain what you would do next and whether you should send it again. Then inspect what changes when admission is known but delivery has not appeared.” |
| F · Recover work | “Save this uncertain exercise, reload and recover it. Explain what was restored, whether you can submit again and what would happen to edits made after saving. Preview restoring once and cancel it before actually restoring.” |

For D, observe coordination at the delivery-without-receipt stage and after receipt as well as the final state; a completed receipt can legitimately leave no contribution attention signal. Do not demand a signal that is no longer represented.

## Facilitator route and expected observations

This section is a reference for the facilitator, not an opening tutorial. Let participants search first. If help is necessary, record it before supplying a hint. Stop a stalled task after an agreed interval and distinguish assisted completion from unaided completion.

### A–C: one shared revision loop

From Knowledge Organization, open Leo's My Work and **Open contribution · K-01-H**. The supplied input remains inspectable; contribution text, scope note and citation are required. **Review delivery** confirms the exact version before **Record local delivery** freezes it.

Switch **Sample persona** to Maya. Her My Work shows the same delivered text and identity. **Record sample receipt · draft-01** enables **Request sample revision · draft-01**. The request is authored scenario guidance, not an evaluation of the entered text.

Switch to Leo. His inbox exposes the request; contribution offers **Prepare draft-02**. A revision note and renewed input citation are required. Return to Maya after the second delivery to record its receipt. Earlier delivered text/records stay available through their disclosures. Reassessment is pending; receipt is neither acceptance nor publication.

Watch for role confusion, failure to find personal work, mistaken receipt/approval assumptions, invisible revision feedback, excessive scrolling and difficulty reopening earlier content.

### D: shared attention and source boundaries

Organization's compact coordination needs point to Maya when a delivered revision has no receipt, and to Leo when draft-01 has a revision request but draft-02 preparation has not started. Starting a revision clears that specific unstarted-revision need; it does not establish completed work. The full attention list and summary share their signal projection.

Each signal names authored or local source. Workstream coordination counters remain authored context and do not track contribution receipts. Outcome gaps remain separate. **Contribution exchange history · K-01-H** and the policy section are collapsed initially; policy shortcuts open/focus the target.

Ask the participant to explain one changed source and one unchanged source. Missing follow-up ownership is a valid finding. Observe whether closed secondary details reduce clutter or conceal necessary context.

### E: uncertain acknowledgement and projection lag

Use a fresh browser profile/tab session at `#/organizations/knowledge/contributions/K-01-H?persona=leo`; preserve any work the participant wants to keep first. Open **Command delivery simulation**, choose **Acknowledgement unknown**, then review/record the local submission. Editing and duplicate submission are locked; no delivery is recorded.

Let the participant explain the state before pointing to simulation controls. **Simulate status query: admitted** records admission but leaves projection pending. **Simulate delivery projection refresh** supplies the delivery view. Neither transport acknowledgement nor admission implies receiver receipt or publication.

Save the unknown state before resolving it if continuing directly into F. Do not restore an older checkpoint merely to manufacture evidence of a successful real submission; all steps remain local simulation.

### F: explicit checkpoint recovery

Open **Save or restore Knowledge contribution**. Save requires confirmation and replaces the previous checkpoint for this browser/origin. Reload starts empty. **Review saved contribution** validates and previews timestamp, version/command counts and latest command status. **Cancel restore** must preserve current work. **Confirm restore contribution** replaces current Knowledge state, including unsaved changes.

A restored unknown command retains its command/key identity and submission lock. Focus may move to command status when restoration changes the contributor stage. There is no server query or automatic recovery of later edits. Demos continuity and standalone contribution are separate. Removing the saved checkpoint leaves current work intact.

Do not test blocked storage/corrupt data by modifying a participant's browser storage during the comprehension tasks. Those cases have separate technical checks.

## Capture and decision process

Use [the session record template](PARTICIPANT-SESSION-RECORD.md). Record the participant's own explanation before interpreting it. Capture completion/assistance, wrong destinations, misunderstood state, lost context and the relevant device/input method. Timing is optional; no benchmark or completion-rate claim exists.

Prioritize observations that could cause a wrong consequential decision, duplicate submission or unintended loss of work, then repeated navigation barriers. Treat one session as a finding to investigate, not a population estimate. Link any resulting fix to an observed task and recheck that task.

The walkthrough is ready to use. Actual participant observations, actual screen-reader behavior and conclusions about comprehension remain outstanding.

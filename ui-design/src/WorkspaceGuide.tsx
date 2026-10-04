export function WorkspaceGuide({
  personalLabel = "Alex's",
}: {
  personalLabel?: string;
}) {
  return (
    <details className="panel workspace-guide">
      <summary>Understand this workspace</summary>
      <p>
        Start with shared goals in Organization. Browse workstreams to follow
        coordination, or workers to inspect scoped responsibilities. My Work is
        {personalLabel} personal inbox. Demos offers a guided customer
        walkthrough.
      </p>
      <dl>
        <dt>Workstream</dt>
        <dd>
          A shared goal with related work and expected collaboration steps.
        </dd>
        <dt>Worker</dt>
        <dd>
          A human, AI contributor or deterministic executor participating in the
          organization.
        </dd>
        <dt>Role and scope</dt>
        <dd>
          A responsibility and the subjects it applies to. A binding connects a
          worker to that role and scope; it does not automatically create an
          assignment.
        </dd>
        <dt>Assignment</dt>
        <dd>
          A specific request allocated to a worker, with expected input and
          response.
        </dd>
        <dt>Handoff</dt>
        <dd>
          An expected exchange between responsibilities. A linked record does
          not confirm delivery or receipt.
        </dd>
        <dt>Proposal and allocation</dt>
        <dd>
          A proposal suggests responsibility. Accepting its plan still awaits
          allocation: creating the validated binding and assignment is a
          separate step.
        </dd>
        <dt>Evidence and outcome</dt>
        <dd>
          Evidence is an inspectable record. Outcome review asks whether
          observations prove the shared goal was achieved; a recorded response
          alone does not prove success.
        </dd>
      </dl>
      <p>
        This workspace uses sample data. Local proposals, decisions and
        responses reset on refresh. No live action is sent.
      </p>
    </details>
  );
}

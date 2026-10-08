import { responsibilityState } from "./responsibilityLifecycle";
import type { OrganizationScenario } from "./organizationScenario";
import {
  allocationPreview,
  type ResponsibilityProposal,
} from "./responsibilityProposals";
export function localAllocationScenario(
  base: OrganizationScenario,
  proposals: Record<string, ResponsibilityProposal>,
): OrganizationScenario {
  const allocated = Object.values(proposals).filter((p) => p.allocation);
  if (!allocated.length) return base;
  return {
    ...base,
    assignments: [
      ...base.assignments,
      ...allocated.map((p) => ({
        id: p.allocation!.assignmentId,
        streamId: "WS-02",
        workerId: responsibilityState(p).workerId,
        role: p.role,
        title: allocationPreview(p).assignment,
        state: `${responsibilityState(p).status} · prerequisites pending`,
        waitingForInput: true,
        input: allocationPreview(p).prerequisites,
        expectedResponse:
          "Prepare the scoped work when prerequisites are supplied; execution and effective permission are not established.",
      })),
    ],
    bindings: [
      ...base.bindings,
      ...allocated
        .filter(
          (p) =>
            responsibilityState(p).workerId !== p.workerId &&
            responsibilityState(p).bindingId !== "mb-reviewer",
        )
        .map((p) => ({
          id: responsibilityState(p).bindingId!,
          workerId: responsibilityState(p).workerId,
          role: p.role,
          scope: p.scope,
          scopeIds: ["scope-WS-02"],
          permission:
            "Local accepted transfer only; effective permission unverified",
        })),
      ...allocated
        .filter((p) => p.allocation!.bindingMode === "created")
        .map((p) => ({
          id: p.allocation!.bindingId,
          workerId: p.workerId,
          role: p.role,
          scope: p.scope,
          scopeIds: ["scope-WS-02"],
          permission: "Local allocation only; effective permission unverified",
        })),
    ],
    scopeRequirements: base.scopeRequirements.map((requirement) => {
      const local = allocated.filter(
        (p) =>
          requirement.scopeId === "scope-WS-02" && requirement.role === p.role,
      );
      return local.length
        ? {
            ...requirement,
            bindingState: "declared" as const,
            bindingIds: [
              ...new Set([
                ...requirement.bindingIds,
                ...local.map((p) => responsibilityState(p).bindingId!),
              ]),
            ],
            note: "Local allocation declared; performer response is tracked per assignment; effective permissions remain unverified. Original gap history is retained.",
          }
        : requirement;
    }),
    streams: base.streams.map((stream) =>
      stream.id === "WS-02"
        ? {
            ...stream,
            assignmentIds: [
              ...stream.assignmentIds,
              ...allocated.map((p) => p.allocation!.assignmentId),
            ],
          }
        : stream,
    ),
    assignmentScopes: [
      ...base.assignmentScopes,
      ...allocated.map((p) => ({
        assignmentId: p.allocation!.assignmentId,
        scopeId: "scope-WS-02",
        bindingId: responsibilityState(p).bindingId!,
      })),
    ],
  };
}

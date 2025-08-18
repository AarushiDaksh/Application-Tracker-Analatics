// hooks/useKanbanActions.ts
import { KanbanStage } from "@/hooks/useApplications";

export function createOnMove(apps: any[], mutate: any) {
  return async function onMove(id: string, toStage: KanbanStage) {
    const prev = apps;
    mutate({ apps: apps.map(a => a._id === id ? { ...a, stage: toStage } : a) }, false);
    try {
      await fetch("/api/applications/move", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, toStage }),
      });
      await mutate();
    } catch {
      mutate({ apps: prev }, false);
    }
  };
}

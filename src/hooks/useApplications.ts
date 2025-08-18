import useSWR from "swr";
import type { App,  KanbanStage } from "@/types/kanban";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type AddAppInput = {
  candidateName: string;
  jobTitle: string;
  company?: string;
  skills?: string[];
  stage: KanbanStage;
  yearsOfExperience?: number;
  resumeLink?: string;
};

export function useApplications() {
  const { data, isLoading, mutate, error } = useSWR<App[]>(
    "/api/applications",
    fetcher,
    { revalidateOnFocus: false }
  );

  async function addApp(input: AddAppInput) {
    const tempId = "temp-" + Date.now();

    const optimistic: App = {
      _id: tempId,
      stage: input.stage,
      candidate: { name: input.candidateName },
      job: { title: input.jobTitle, company: input.company },
      skills: input.skills ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      yearsOfExperience:
        typeof input.yearsOfExperience === "number" ? input.yearsOfExperience : 0,
      resumeLink: input.resumeLink,
    };

    await mutate(
      async (prev) => {
        const prevSafe = prev ?? [];
        // optimistic add
        const withTemp = [optimistic, ...prevSafe];

        // send request (flat shape expected by API)
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: input.stage,
            candidateName: input.candidateName,
            jobTitle: input.jobTitle,
            company: input.company,
            skills: input.skills ?? [],
            yearsOfExperience: input.yearsOfExperience,
            resumeLink: input.resumeLink,
          }),
        });

        if (!res.ok) {
          // revert to previous list on failure
          const msg = await res.text().catch(() => "");
          throw new Error(msg || "Failed to create application");
        }

        const created: App = await res.json();

        // replace temp with the server-created doc
        const withoutTemp = withTemp.filter((a) => a._id !== tempId);
        return [created, ...withoutTemp];
      },
      { revalidate: true }
    );
  }

  async function deleteApp(id: string) {
    await mutate(
      async (prev) => {
        const prevSafe = prev ?? [];
        const next = prevSafe.filter((a) => a._id !== id);
        const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        return next;
      },
      { revalidate: true }
    );
  }

  async function moveApp(id: string, toStage: KanbanStage) {
    await mutate(
      async (prev) => {
        const prevSafe = prev ?? [];
        const next = prevSafe.map((a) =>
          a._id === id ? { ...a, stage: toStage } : a
        );
        const res = await fetch(`/api/applications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: toStage }),
        });
        if (!res.ok) throw new Error("Failed to move");
        return next;
      },
      { revalidate: true }
    );
  }

  return {
    apps: data ?? [],
    isLoading,
    error,
    mutate,
    addApp,
    deleteApp,
    moveApp,
  };
}

import useSWR from "swr";
import type { App, KanbanStage } from "@/types/kanban";

const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`GET ${url} failed`);
  return r.json();
});

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
  const {
    data,
    isLoading,
    error,
    mutate,
  } = useSWR<App[]>("/api/applications", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
    fallbackData: [],
  });

  async function addApp(input: AddAppInput) {
    const tempId = `temp-${Date.now()}`;
    const optimistic: App = {
      _id: tempId,
      stage: input.stage,
      candidate: { name: input.candidateName },
      job: { title: input.jobTitle, company: input.company },
      skills: input.skills ?? [],
      yearsOfExperience:
        typeof input.yearsOfExperience === "number" ? input.yearsOfExperience : 0,
      resumeLink: input.resumeLink,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await mutate(async (prev) => {
      const prevSafe = prev ?? [];
      const withTemp = [optimistic, ...prevSafe];

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: input.stage,
          candidateName: input.candidateName,
          jobTitle: input.jobTitle,
          company: input.company,
          skills: input.skills ?? [],
          yearsOfExperience: input.yearsOfExperience ?? 0,
          resumeLink: input.resumeLink,
        }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => "Create failed"));
      const created: App = await res.json();

      const withoutTemp = withTemp.filter((a) => a._id !== tempId);
      return [created, ...withoutTemp];
    }, { revalidate: true });
  }

  async function deleteApp(id: string) {
    await mutate(async (prev) => {
      const prevSafe = prev ?? [];
      const next = prevSafe.filter((a) => a._id !== id);
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return next;
    }, { revalidate: true });
  }

  async function moveApp(id: string, toStage: KanbanStage) {
    await mutate(async (prev) => {
      const prevSafe = prev ?? [];
      const next = prevSafe.map((a) => (a._id === id ? { ...a, stage: toStage } : a));

      let ok = true;
      try {
        const res = await fetch(`/api/applications/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: toStage }),
        });
        ok = res.ok;
        if (!ok) throw new Error();
      } catch {
        const resAlt = await fetch("/api/applications/move", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: id, toStage }),
        });
        if (!resAlt.ok) throw new Error("Move failed");
      }
      return next;
    }, { revalidate: true });
  }

  const refresh = () => mutate();

  return {
    apps: data ?? [],
    isLoading,
    error,
    addApp,
    deleteApp,
    moveApp,
    refresh,
  };
}

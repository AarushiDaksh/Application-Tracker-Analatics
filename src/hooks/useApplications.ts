// src/hooks/useApplications.ts
import useSWR from "swr";
import type { App } from "@/types/kanban";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useApplications(jobId?: string) {
  const url = `/api/applications${jobId ? `?jobId=${jobId}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<{ apps: App[] }>(url, fetcher, {
    refreshInterval: 10000, // light realtime
  });

  return {
    apps: data?.apps ?? [],
    error,
    isLoading,
    mutate, // SWR mutate
  };
}

export type { App };
export type KanbanStage = App["stage"];

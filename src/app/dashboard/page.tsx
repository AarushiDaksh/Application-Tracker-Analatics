"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";
import { useApplications, KanbanStage } from "@/hooks/useApplications";
import Kanban from "@/components/kanban/kanban";


export default function DashboardPage() {
  const user = useAppSelector((s) => s.user.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => { if (mounted && !user) router.replace("/"); }, [mounted, user, router]);

  const { apps, isLoading, mutate } = useApplications(); 

  if (!mounted || !user) return null;

  async function onMove(applicationId: string, toStage: KanbanStage) {
    // optimistic UI
    const prev = apps;
    const next = apps.map((a: any) => a._id === applicationId ? { ...a, stage: toStage } : a);
    mutate({ apps: next }, false);
    try {
      await fetch("/api/applications/move", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, toStage }),
      });
      mutate(); // revalidate
    } catch {
      mutate({ apps: prev }, false); // rollback
    }
  }

  function onLogout() {
    dispatch(clearUser());
    localStorage.removeItem("eraah_user");
    router.replace("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-zinc-100 dark:from-black dark:to-neutral-950">
      <div className="sticky top-0 z-20 border-b border-black/5 dark:border-white/10 backdrop-blur-md bg-white/60 dark:bg-black/40">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Welcome, <span className="font-bold">{user.name.split(" ")[0]}</span>
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/")} className="px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm">
              Back to Home
            </button>
            <button onClick={onLogout} className="px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black border border-transparent hover:opacity-90 text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <header className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">ATS Dashboard</h2>
            <p className="text-sm text-black/60 dark:text-white/60">Drag candidates across stages. Auto-saves.</p>
          </div>
          <div className="text-sm opacity-70">{isLoading ? "Loading…" : `${apps.length} applications`}</div>
        </header>

        <Kanban apps={apps} onMove={onMove} />
      </div>
    </main>
  );
}

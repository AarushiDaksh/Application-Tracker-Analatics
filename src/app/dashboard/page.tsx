"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";
import { useApplications } from "@/hooks/useApplications";
import Kanban from "@/components/kanban/kanban";
import type { KanbanStage } from "@/types/kanban";

const STAGES: KanbanStage[] = ["Applied", "Interview", "Offer", "Rejected"];

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}
function median(nums: number[]) {
  if (!nums.length) return 0;
  const a = [...nums].sort((x, y) => x - y);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
function computeStageCounts(apps: any[]) {
  return STAGES.map((s) => ({
    stage: s,
    value: apps.filter((a) => a.stage === s).length,
  }));
}
function computeRoleCounts(apps: any[]) {
  const map = new Map<string, number>();
  for (const a of apps) {
    const role = a?.job?.title || "Unknown";
    map.set(role, (map.get(role) || 0) + 1);
  }
  const arr = [...map.entries()].map(([role, count]) => ({ role, count }));
  arr.sort((a, b) => b.count - a.count);
  return arr.slice(0, 8);
}
function computeAvgExperience(apps: any[]) {
  const vals = apps
    .map((a) => Number((a as any).yearsOfExperience))
    .filter((n) => Number.isFinite(n));
  if (!vals.length) return 0;
  const avg = vals.reduce((s, n) => s + n, 0) / vals.length;
  return Number(avg.toFixed(1));
}
function computeKpis(apps: any[]) {
  const total = apps.length;
  const applied = apps.filter((a) => a.stage === "Applied").length;
  const interview = apps.filter((a) => a.stage === "Interview").length;
  const offer = apps.filter((a) => a.stage === "Offer").length;
  const rejected = apps.filter((a) => a.stage === "Rejected").length;
  const expVals = apps
    .map((a) => Number((a as any).yearsOfExperience))
    .filter((n) => Number.isFinite(n));
  const medianExp = Number(median(expVals).toFixed(1));
  return {
    total,
    applied,
    interview,
    offer,
    rejected,
    offerRate: pct(offer, total),
    rejectionRate: pct(rejected, total),
    medianExp,
  };
}
function startOfWeek(d: Date) {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = dt.getUTCDay();
  const diff = (day + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - diff);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}
function weeklyCounts(apps: any[], bins = 8) {
  const map = new Map<string, number>();
  for (const a of apps) {
    const t = a?.createdAt ? new Date(a.createdAt) : null;
    if (!t) continue;
    const wk = startOfWeek(t).toISOString().slice(0, 10);
    map.set(wk, (map.get(wk) || 0) + 1);
  }
  const keys = [...map.keys()].sort();
  const trimmed = keys.slice(-bins);
  return trimmed.map((k) => ({ week: k, count: map.get(k) || 0 }));
}
function topCompanies(apps: any[], take = 5) {
  const m = new Map<string, number>();
  for (const a of apps) {
    const c = a?.job?.company?.trim();
    if (!c) continue;
    m.set(c, (m.get(c) || 0) + 1);
  }
  return [...m.entries()]
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, take);
}

export default function DashboardPage() {
  const user = useAppSelector((s) => s.user.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { apps, isLoading, addApp, deleteApp, moveApp } = useApplications();
  useEffect(() => {
    if (!mounted) return;
    if (!user) router.replace("/");
  }, [mounted, user, router]);
  const firstName = user?.name?.split(" ")[0] ?? "User";
  if (!mounted || !user) return null;
  function onLogout() {
    dispatch(clearUser());
    if (typeof window !== "undefined") localStorage.removeItem("eraah_user");
    router.replace("/");
  }
  const stageCounts = computeStageCounts(apps);
  const roleCounts = computeRoleCounts(apps);
  const avgExp = computeAvgExperience(apps);
  const kpis = computeKpis(apps);
  const inflow = weeklyCounts(apps, 8);
  const maxInflow = Math.max(1, ...inflow.map((d) => d.count));
  const companies = topCompanies(apps, 5);
  const maxRole = Math.max(1, ...roleCounts.map((r) => r.count));
  const totalForPie = stageCounts.reduce((s, x) => s + x.value, 0);
  const a = stageCounts[0]?.value ?? 0;
  const b = stageCounts[1]?.value ?? 0;
  const c = stageCounts[2]?.value ?? 0;
  const d = stageCounts[3]?.value ?? 0;
  const pA = pct(a, totalForPie);
  const pB = pct(a + b, totalForPie);
  const pC = pct(a + b + c, totalForPie);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-sky-50 dark:from-black dark:to-neutral-950">
      <div className="sticky top-0 z-20 border-b border-black/5 dark:border-white/10 backdrop-blur-md bg-white/60 dark:bg-black/40">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            Welcome, <span className="font-bold">{firstName}</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
            >
              Back to Home
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-full bg-sky-600 text-white dark:bg-white dark:text-black border border-transparent hover:opacity-90 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <header className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">ATS Dashboard</h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              Drag candidates across stages. Auto-saves to your database.
            </p>
          </div>
          <div className="text-sm opacity-70">
            {isLoading ? "Loading…" : `${apps.length} applications`}
          </div>
        </header>

        <section aria-label="Analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <StatCard title="Offer Rate" value={`${kpis.offerRate}%`} hint={`${kpis.offer} of ${kpis.total} total`} />
            <StatCard title="Rejection Rate" value={`${kpis.rejectionRate}%`} hint={`${kpis.rejected} rejected`} />
            <StatCard title="Median Experience" value={`${kpis.medianExp} yrs`} hint={`Across ${apps.length || 0} candidates`} />
            <StatCard title="Total Applications" value={`${kpis.total}`} hint="This workspace" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide opacity-70 mb-2">Pipeline Funnel</p>
              {[
                { label: "Applied", value: kpis.applied, color: "bg-sky-400" },
                { label: "Interview", value: kpis.interview, color: "bg-teal-400" },
                { label: "Offer", value: kpis.offer, color: "bg-violet-400" },
                { label: "Rejected", value: kpis.rejected, color: "bg-rose-300" },
              ].map((s, _, arr) => {
                const max = Math.max(1, ...arr.map((x) => x.value));
                const w = Math.max(6, Math.round((s.value / max) * 100));
                return (
                  <div key={s.label} className="mb-2 last:mb-0">
                    <div className="flex items-center justify-between text-xs opacity-70 mb-1">
                      <span>{s.label}</span>
                      <span>{s.value}</span>
                    </div>
                    <div className="h-3 rounded-md bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div className={`h-full ${s.color}`} style={{ width: `${w}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 flex items-center gap-3">
                <div
                  className="h-28 w-28 rounded-full shrink-0"
                  style={{
                    background: `conic-gradient(
                      #38bdf8 0 ${pA}%,
                      #2dd4bf ${pA}% ${pB}%,
                      #a78bfa ${pB}% ${pC}%,
                      #fca5a5 ${pC}% 100%
                    )`,
                  }}
                />
                <div className="text-xs space-y-1">
                  <LegendDot color="bg-sky-400" label={`Applied (${a})`} />
                  <LegendDot color="bg-teal-400" label={`Interview (${b})`} />
                  <LegendDot color="bg-violet-400" label={`Offer (${c})`} />
                  <LegendDot color="bg-rose-300" label={`Rejected (${d})`} />
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wide opacity-70">Weekly Inflow</p>
                  <span className="text-xs opacity-60">
                    {inflow.length ? `${inflow[0].week} → ${inflow[inflow.length - 1].week}` : "No data"}
                  </span>
                </div>
                {inflow.length === 0 ? (
                  <p className="text-sm opacity-60">No applications yet.</p>
                ) : (
                  <Sparkline data={inflow.map((d) => d.count)} max={maxInflow} height={60} />
                )}
              </div>

              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide opacity-70 mb-2">Top Companies</p>
                {companies.length === 0 ? (
                  <p className="text-sm opacity-60">No company data yet.</p>
                ) : (
                  <ul className="text-sm space-y-1.5">
                    {companies.map((c) => (
                      <li key={c.company} className="flex items-center justify-between">
                        <span className="truncate">{c.company}</span>
                        <span className="text-xs opacity-70">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wide opacity-70">Candidates by Role</p>
                  <span className="text-xs opacity-60">Top {roleCounts.length || 0}</span>
                </div>
                <div className="space-y-2">
                  {roleCounts.length === 0 ? (
                    <p className="text-sm opacity-60">No roles yet.</p>
                  ) : (
                    roleCounts.map((r) => {
                      const width = Math.max(6, Math.round((r.count / maxRole) * 100));
                      return (
                        <div key={r.role} className="grid grid-cols-[1fr_auto] items-center gap-2">
                          <div className="h-7 rounded-lg bg-black/5 dark:bg-white/10 overflow-hidden">
                            <div className="h-full bg-indigo-300" style={{ width: `${width}%` }} />
                          </div>
                          <div className="text-xs text-right whitespace-nowrap w-28 truncate">
                            {r.role} · {r.count}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Kanban
          apps={apps}
          onMove={(id, toStage) => moveApp(id, toStage)}
          onAdd={({ candidateName, jobTitle, company, skills, stage, yearsOfExperience, resumeLink }) =>
            addApp({ candidateName, jobTitle, company, skills, stage, yearsOfExperience, resumeLink })
          }
          onDelete={(id) => deleteApp(id)}
        />
      </div>
    </main>
  );
}

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide opacity-70">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {hint ? <p className="text-xs opacity-60 mt-1">{hint}</p> : null}
    </div>
  );
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
function Sparkline({ data, max, height = 60 }: { data: number[]; max: number; height?: number }) {
  const w = 220;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const norm = (n: number) => (max ? 1 - n / max : 0);
  const points = data.map((v, i) => `${i * step},${Math.round(norm(v) * height)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} role="img" aria-label="Weekly applications sparkline" className="w-full h-[60px]">
      <polyline points={`0,${height} ${points} ${w},${height}`} fill="currentColor" opacity={0.08} />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" opacity={0.7} />
    </svg>
  );
}

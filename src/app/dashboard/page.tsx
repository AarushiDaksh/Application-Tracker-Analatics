"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";
import { useApplications } from "@/hooks/useApplications";
import { useAI } from "@/hooks/useAI";
import Kanban from "@/components/kanban/kanban";
import type { KanbanStage } from "@/types/kanban";

const STAGES: KanbanStage[] = ["Applied", "Interview", "Offer", "Rejected"];

function pct(n: number, d: number) { return d ? Math.round((n / d) * 100) : 0; }
function median(nums: number[]) { if (!nums.length) return 0; const a=[...nums].sort((x,y)=>x-y); const m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; }
function computeStageCounts(apps: any[]) { return STAGES.map(s=>({stage:s,value:apps.filter(a=>a.stage===s).length})); }
function computeRoleCounts(apps: any[]) { const m=new Map<string,number>(); for(const a of apps){const r=a?.job?.title||"Unknown"; m.set(r,(m.get(r)||0)+1);} return [...m.entries()].map(([role,count])=>({role,count})).sort((a,b)=>b.count-a.count).slice(0,8); }
function computeAvgExperience(apps:any[]){const v=apps.map(a=>Number((a as any).yearsOfExperience)).filter(Number.isFinite);return v.length?Number((v.reduce((s,n)=>s+n,0)/v.length).toFixed(1)):0;}
function computeKpis(apps:any[]){const total=apps.length,applied=apps.filter(a=>a.stage==="Applied").length,interview=apps.filter(a=>a.stage==="Interview").length,offer=apps.filter(a=>a.stage==="Offer").length,rejected=apps.filter(a=>a.stage==="Rejected").length;const expVals=apps.map(a=>Number((a as any).yearsOfExperience)).filter(Number.isFinite);return{total,applied,interview,offer,rejected,offerRate:pct(offer,total),rejectionRate:pct(rejected,total),medianExp:Number(median(expVals).toFixed(1))};}
function startOfWeek(d:Date){const dt=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=dt.getUTCDay(),diff=(day+6)%7;dt.setUTCDate(dt.getUTCDate()-diff);dt.setUTCHours(0,0,0,0);return dt;}
function weeklyCounts(apps:any[],bins=8){const m=new Map<string,number>();for(const a of apps){const t=a?.createdAt?new Date(a.createdAt):null;if(!t)continue;const wk=startOfWeek(t).toISOString().slice(0,10);m.set(wk,(m.get(wk)||0)+1);}const keys=[...m.keys()].sort();const tkeys=keys.slice(-bins);return tkeys.map(k=>({week:k,count:m.get(k)||0}));}
function topCompanies(apps:any[],take=5){const m=new Map<string,number>();for(const a of apps){const c=a?.job?.company?.trim();if(!c)continue;m.set(c,(m.get(c)||0)+1);}return[...m.entries()].map(([company,count])=>({company,count})).sort((a,b)=>b.count-a.count).slice(0,take);}

export default function DashboardPage() {
  const user = useAppSelector(s => s.user.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { apps, isLoading, addApp, deleteApp, moveApp } = useApplications();
  useEffect(() => { if (!mounted) return; if (!user) router.replace("/"); }, [mounted, user, router]);

  const analyticsRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLDivElement>(null);

  const { evaluate, isMutating } = useAI();
  const [insights, setInsights] = useState<string[]>([]);
         const auth = useAppSelector(s => s.user.user);
  const userKey = auth?.id || auth?.email || "anon";


  if (isLoading) return <div className="p-6">Loading…</div>;

 async function generateInsights() {
  try {
    const { bullets } = await evaluate({
      task: "insight",
      input: { kpis, topCompanies: companies, byRole: roleCounts, weeklyInflow: inflow },
    });
    setInsights((bullets as string[]) || []);
  } catch (err: any) {
    console.error(err);
    setInsights([err?.message || "Failed to generate insights."]);
  }
}


  async function exportRefToPdf(node: HTMLElement, filename: string) {
    const [{ toCanvas }, { jsPDF }] = await Promise.all([
      import("html-to-image"),
      import("jspdf"),
    ] as const);

    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    const prevY = window.scrollY;

    root.classList.add("exporting");
    if (hadDark) root.classList.remove("dark");
    window.scrollTo({ top: 0 });

    try {
      const canvas = await toCanvas(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#ffffff",
        filter: (el) => !el.classList?.contains("no-export"),
      });

      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const marginX = 32, marginY = 40;
      const usableW = pageW - marginX * 2;
      const ratio = usableW / canvas.width;
      const sliceH = Math.floor((pageH - marginY * 2) / ratio);

      pdf.setFontSize(14);
      pdf.text("ATS – Full Report", marginX, 28);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, marginX, 42);

      let sy = 0, page = 0;
      while (sy < canvas.height) {
        if (page > 0) pdf.addPage();
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = Math.min(sliceH, canvas.height - sy);
        const ctx = slice.getContext("2d")!;
        ctx.drawImage(canvas, 0, sy, canvas.width, slice.height, 0, 0, canvas.width, slice.height);
        const imgH = slice.height * ratio;
        const y = page === 0 ? 58 : marginY;
        pdf.addImage(slice.toDataURL("image/png"), "PNG", marginX, y, usableW, imgH, undefined, "FAST");
        sy += sliceH;
        page += 1;
      }

      pdf.save(filename);
    } finally {
      window.scrollTo({ top: prevY });
      if (hadDark) root.classList.add("dark");
      root.classList.remove("exporting");
    }
  }

  const exportAnalyticsPdf = async () => {
    if (analyticsRef.current) await exportRefToPdf(analyticsRef.current, "ats-analytics.pdf");
  };
  const exportFullPdf = async () => {
    if (fullRef.current) await exportRefToPdf(fullRef.current, "ats-full-report.pdf");
  };

  function onLogout() {
    dispatch(clearUser());
    if (typeof window !== "undefined") localStorage.removeItem("eraah_user");
    router.replace("/");
  }

  if (!mounted || !user) return <main />;

  const firstName = user?.name?.split(" ")[0] ?? "User";
  const stageCounts = computeStageCounts(apps);
  const roleCounts = computeRoleCounts(apps);
  const avgExp = computeAvgExperience(apps);
  const kpis = computeKpis(apps);
  const inflow = weeklyCounts(apps, 8);
  const companies = topCompanies(apps, 5);
  const maxInflow = Math.max(1, ...inflow.map(d => d.count));
  const maxRole = Math.max(1, ...roleCounts.map(r => r.count));
  const totalForPie = stageCounts.reduce((s, x) => s + x.value, 0);
  const a = stageCounts[0]?.value ?? 0, b = stageCounts[1]?.value ?? 0, c = stageCounts[2]?.value ?? 0, d = stageCounts[3]?.value ?? 0;
  const pA = pct(a, totalForPie), pB = pct(a + b, totalForPie), pC = pct(a + b + c, totalForPie);

  function updateResume(id: string, url?: string | undefined): Promise<void> {
    throw new Error("Function not implemented.");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-sky-50 dark:from-black dark:to-neutral-950">
      <div className="sticky top-0 z-20 border-b border-black/5 dark:border-white/10 backdrop-blur-md bg-white/60 dark:bg-black/40">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-2 sm:py-0">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:h-16">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">
              Welcome, <span className="font-bold">{firstName}</span>
            </h1>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button onClick={() => router.push("/")} className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-xs sm:text-sm">Back to Home</button>
              <button onClick={onLogout} className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-sky-600 text-white dark:bg-white dark:text-black border border-transparent hover:opacity-90 text-xs sm:text-sm">Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div ref={fullRef} className="mx-auto max-w-screen-xl px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        <header className="grid gap-3 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">ATS Dashboard</h2>
            <p className="mt-0.5 text-sm text-black/60 dark:text-white/60">Manage candidates visually. Drag across stages, auto-saves to database.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="shrink-0 inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 backdrop-blur px-3 py-1.5 text-xs sm:text-sm" aria-live="polite">
              {isLoading ? (
                <>
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-black/20 dark:border-white/20 border-t-transparent dark:border-t-transparent animate-spin" />
                  <span className="opacity-70">Syncing…</span>
                </>
              ) : (
                <>
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                  <span className="font-semibold tabular-nums">{apps.length}</span>
                  <span className="opacity-70">{apps.length === 1 ? "Application" : "Applications"}</span>
                </>
              )}
            </div>
            <button onClick={exportAnalyticsPdf} className="no-export px-3 py-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-medium transition-colors">Export Analytics</button>
            <button onClick={exportFullPdf} className="no-export px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-medium transition-colors">Export Full Report</button>
          </div>
        </header>

        <section ref={analyticsRef} aria-label="Analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <StatCard title="Offer Rate" value={`${kpis.offerRate}%`} hint={`${kpis.offer} of ${kpis.total} total`} />
            <StatCard title="Rejection Rate" value={`${kpis.rejectionRate}%`} hint={`${kpis.rejected} rejected`} />
            <StatCard title="Median Experience" value={`${kpis.medianExp} yrs`} hint={`Across ${apps.length || 0} candidates`} />
            <StatCard title="Avg Experience" value={`${avgExp} yrs`} hint="All candidates" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide opacity-70 mb-2">Pipeline Funnel</p>
              {[
                { label:"Applied", value:kpis.applied, color:"bg-sky-400" },
                { label:"Interview", value:kpis.interview, color:"bg-teal-400" },
                { label:"Offer", value:kpis.offer, color:"bg-violet-400" },
                { label:"Rejected", value:kpis.rejected, color:"bg-rose-300" },
              ].map((s,_,arr)=>{
                const max=Math.max(1,...arr.map(x=>x.value)); const w=Math.max(6,Math.round((s.value/max)*100));
                return (
                  <div key={s.label} className="mb-2 last:mb-0">
                    <div className="flex items-center justify-between text-xs opacity-70 mb-1"><span>{s.label}</span><span>{s.value}</span></div>
                    <div className="h-3 rounded-md bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div className={`h-full ${s.color}`} style={{width:`${w}%`}} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 flex items-center gap-3">
                <div className="h-28 w-28 rounded-full shrink-0" style={{background:`conic-gradient(#38bdf8 0 ${pA}%, #2dd4bf ${pA}% ${pB}%, #a78bfa ${pB}% ${pC}%, #fca5a5 ${pC}% 100%)`}} />
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
                  <span className="text-xs opacity-60">{inflow.length ? `${inflow[0].week} → ${inflow[inflow.length-1].week}` : "No data"}</span>
                </div>
                {inflow.length===0 ? <p className="text-sm opacity-60">No applications yet.</p> : <Sparkline data={inflow.map(d=>d.count)} max={maxInflow} height={60} />}
              </div>

              <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide opacity-70 mb-2">Top Companies</p>
                {companies.length===0 ? (
                  <p className="text-sm opacity-60">No company data yet.</p>
                ) : (
                  <ul className="text-sm space-y-1.5">
                    {companies.map(c=>(
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
                  {roleCounts.length===0 ? (
                    <p className="text-sm opacity-60">No roles yet.</p>
                  ) : roleCounts.map(r=>{
                    const width=Math.max(6,Math.round((r.count/maxRole)*100));
                    return (
                      <div key={r.role} className="grid grid-cols-[1fr_auto] items-center gap-2">
                        <div className="h-7 rounded-lg bg-black/5 dark:bg-white/10 overflow-hidden">
                          <div className="h-full bg-indigo-300" style={{width:`${width}%`}} />
                        </div>
                        <div className="text-xs text-right whitespace-nowrap w-28 truncate">{r.role} · {r.count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          
        </section>
       <Kanban
      key={userKey}            // 👈 forces a fresh component tree per user
      apps={apps}
      onAdd={addApp}
      onMove={moveApp}
      onDelete={deleteApp}
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
    <svg
      viewBox={`0 0 ${w} ${height}`}
      role="img"
      aria-label="Weekly applications sparkline"
      className="w-full h-[60px]"
    >
      <polyline points={`0,${height} ${points} ${w},${height}`} fill="currentColor" opacity={0.08} />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" opacity={0.7} />
    </svg>
  );
}

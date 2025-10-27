// src/components/kanban/kanban.tsx
"use client";

import { useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import type { App, KanbanStage } from "@/types/kanban";
import { X, Trash2 } from "lucide-react";

const STAGES: KanbanStage[] = ["Applied", "Interview", "Offer", "Rejected"];

const STAGE_STYLE: Record<KanbanStage, { ring: string; pill: string; bg: string }> = {
  Applied:   { ring: "ring-blue-300/40",    pill: "bg-blue-500",    bg: "from-blue-50/60 dark:from-blue-500/5" },
  Interview: { ring: "ring-amber-300/40",   pill: "bg-amber-500",   bg: "from-amber-50/60 dark:from-amber-500/5" },
  Offer:     { ring: "ring-emerald-300/40", pill: "bg-emerald-500", bg: "from-emerald-50/60 dark:from-emerald-500/5" },
  Rejected:  { ring: "ring-rose-300/40",    pill: "bg-rose-500",    bg: "from-rose-50/60 dark:from-rose-500/5" },
};

type CreatePayload = {
  candidateName: string;
  jobTitle: string;
  company?: string;
  skills?: string[];
  stage: KanbanStage;
  yearsOfExperience?: number;
  resumeLink?: string;
};

type KanbanProps = {
  apps: App[];
  onMove: (id: string, toStage: KanbanStage) => Promise<void>;
  onAdd: (payload: CreatePayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function Kanban({ apps, onMove, onAdd, onDelete }: KanbanProps) {
  const uniqueRoles = useMemo(
    () => Array.from(new Set(apps.map((a) => a.job?.title).filter(Boolean))) as string[],
    [apps]
  );
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [minExp, setMinExp] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const filteredApps = useMemo(() => {
    const min = minExp.trim() === "" ? -Infinity : Number.parseFloat(minExp);
    const getYears = (a: any) => {
      const raw = a?.yearsOfExperience ?? a?.candidate?.yearsOfExperience ?? a?.meta?.yearsOfExperience ?? a?.experience ?? 0;
      const n = typeof raw === "string" ? Number.parseFloat(raw) : Number(raw);
      return Number.isFinite(n) ? n : 0;
    };
    const q = query.trim().toLowerCase();
    return apps.filter((a) => {
      const roleOk = roleFilter === "all" || a.job?.title === roleFilter;
      const expOk = getYears(a) >= min;
      const text = `${a.candidate?.name || ""} ${a.job?.title || ""} ${a.job?.company || ""}`.toLowerCase();
      const qOk = !q || text.includes(q);
      return roleOk && expOk && qOk;
    });
  }, [apps, roleFilter, minExp, query]);

  const cols = useMemo(() => {
    const base: Record<KanbanStage, App[]> = Object.fromEntries(
      STAGES.map((s) => [s, [] as App[]])
    ) as Record<KanbanStage, App[]>;
    for (const a of filteredApps) (base[a.stage] ??= []).push(a);
    // Optional: keep newest first in each column
    for (const s of STAGES) base[s]?.sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt));
    return base;
  }, [filteredApps]);

  async function onDragEnd(res: DropResult) {
    const { destination, draggableId } = res;
    if (!destination) return;
    await onMove(draggableId, destination.droppableId as KanbanStage);
  }

  // Add Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addStage, setAddStage] = useState<KanbanStage>("Applied");
  const [candidateName, setCandidateName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [skillsRaw, setSkillsRaw] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<string>("");
  const [resumeLink, setResumeLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setCandidateName("");
    setJobTitle("");
    setCompany("");
    setSkillsRaw("");
    setYearsOfExperience("");
    setResumeLink("");
  };

  async function handleCreate() {
    if (!candidateName.trim() || !jobTitle.trim()) return;
    const expNum =
      Number.isFinite(Number(yearsOfExperience)) && yearsOfExperience !== ""
        ? Number(yearsOfExperience)
        : undefined;
    setSubmitting(true);
    try {
      await onAdd({
        candidateName: candidateName.trim(),
        jobTitle: jobTitle.trim(),
        company: company.trim() || undefined,
        skills: skillsRaw.split(",").map((s) => s.trim()).filter(Boolean),
        yearsOfExperience: expNum,
        resumeLink: resumeLink.trim() || undefined, // read-only later; stored in DB
        stage: addStage,
      });
      resetForm();
      setShowAdd(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = typeof window !== "undefined" ? window.confirm("Delete this application?") : true;
    if (!ok) return;
    await onDelete(id);
  }

  return (
    <>
      {/* Filters */}
      <div className="sticky top-[64px] z-10 mb-3 bg-white/80 dark:bg-black/40 backdrop-blur rounded-xl p-2 md:p-0">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-56 text-sm rounded-md border border-black/10 dark:border-white/10 bg-transparent px-2 h-9"
              title="Filter by role"
            >
              <option value="all" className="bg-white dark:bg-zinc-900">
                All roles
              </option>
              {uniqueRoles.map((r) => (
                <option key={r} value={r} className="bg-white dark:bg-zinc-900">
                  {r}
                </option>
              ))}
            </select>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={minExp}
              onChange={(e) => setMinExp(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="Min exp (yrs)"
              className="w-full md:w-40 text-sm rounded-md border border-black/10 dark:border-white/10 bg-transparent px-2 h-9"
            />
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name / role / company"
            className="w-full text-sm rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 h-9"
          />
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="md:grid md:gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 -mx-3 px-3">
          {/* Mobile stack */}
          <div className="md:hidden flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[calc(100vh-100px)] pb-3 snap-y snap-mandatory">
            {STAGES.map((stage) => {
              const theme = STAGE_STYLE[stage];
              const items = cols[stage] || [];
              return (
                <Droppable droppableId={stage} key={stage}>
                  {(p) => (
                    <div
                      ref={p.innerRef}
                      {...p.droppableProps}
                      className={`snap-start shrink-0 flex flex-col rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-b ${theme.bg} via-white/60 to-white/40 dark:via-white/5 dark:to-white/[0.02] backdrop-blur-md p-3 min-h-[420px]`}
                    >
                      <ColumnHeader stage={stage} theme={theme} count={items.length} />
                      <AddButton
                        onClick={() => {
                          setAddStage(stage);
                          setShowAdd(true);
                        }}
                      />
                      <Cards
                        items={items}
                        themeForStage={theme}
                        onMove={onMove}
                        onDelete={handleDelete}
                      />
                      {p.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>

          {/* Desktop grid */}
          <div className="hidden md:contents">
            {STAGES.map((stage) => {
              const theme = STAGE_STYLE[stage];
              const items = cols[stage] || [];
              return (
                <Droppable droppableId={stage} key={stage}>
                  {(p) => (
                    <div
                      ref={p.innerRef}
                      {...p.droppableProps}
                      className={`flex flex-col rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-b ${theme.bg} via-white/60 to-white/40 dark:via-white/5 dark:to-white/[0.02] backdrop-blur-md p-3 md:p-4 min-h-[420px]`}
                    >
                      <ColumnHeader stage={stage} theme={theme} count={items.length} />
                      <AddButton
                        onClick={() => {
                          setAddStage(stage);
                          setShowAdd(true);
                        }}
                      />
                      <Cards
                        items={items}
                        themeForStage={theme}
                        onMove={onMove}
                        onDelete={handleDelete}
                      />
                      {p.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Add Modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Add Application</h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs opacity-70">Stage</label>
                <select
                  value={addStage}
                  onChange={(e) => setAddStage(e.target.value as KanbanStage)}
                  className="mt-1 w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 h-9 text-sm"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-zinc-900">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <TextInput
                label="Candidate name *"
                value={candidateName}
                onChange={setCandidateName}
                placeholder="e.g., Aarushi"
              />
              <TextInput
                label="Job title *"
                value={jobTitle}
                onChange={setJobTitle}
                placeholder="e.g., Frontend Engineer"
              />
              <TextInput label="Company" value={company} onChange={setCompany} placeholder="e.g., Eraah" />
              <TextInput
                label="Years of experience"
                value={yearsOfExperience}
                onChange={(v) => setYearsOfExperience(v.replace(/[^\d.]/g, ""))}
                placeholder="e.g., 2"
                numeric
              />
              <TextInput label="Resume link" value={resumeLink} onChange={setResumeLink} placeholder="https://..." />
              <TextInput
                label="Skills (comma separated)"
                value={skillsRaw}
                onChange={setSkillsRaw}
                placeholder="React, TypeScript, Tailwind"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 h-9 rounded-lg border border-black/10 dark:border-white/10 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                disabled={submitting || !candidateName.trim() || !jobTitle.trim()}
                onClick={handleCreate}
                className="px-3 h-9 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm disabled:opacity-60"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ColumnHeader({
  stage,
  theme,
  count,
}: {
  stage: KanbanStage;
  theme: { ring: string; pill: string; bg: string };
  count: number;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${theme.pill}`} />
        <h4 className="text-sm font-semibold">{stage}</h4>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 ${theme.ring}`}>
        {count}
      </span>
    </div>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="mb-2 text-xs w-full rounded-lg border border-dashed border-black/10 dark:border-white/10 h-9 hover:bg-black/5 dark:hover:bg-white/10 transition"
      onClick={onClick}
    >
      + Add
    </button>
  );
}

function Cards({
  items,
  themeForStage,
  onMove,
  onDelete,
}: {
  items: App[];
  themeForStage: { pill: string };
  onMove: (id: string, to: KanbanStage) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div className="space-y-2.5">
      {items.map((a, idx) => {
        const exp = (a as any).yearsOfExperience;
        const resume = (a as any).resumeLink as string | undefined;

        return (
          <Draggable key={a._id} draggableId={a._id} index={idx}>
            {(pp) => (
              <div
                ref={pp.innerRef}
                {...pp.draggableProps}
                {...pp.dragHandleProps}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/10 p-3 shadow-sm hover:shadow transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.candidate.name}</p>
                    <p className="text-xs opacity-70 truncate">
                      {a.job.title}
                      {a.job.company ? ` • ${a.job.company}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${themeForStage.pill} text-white`}>
                      {a.stage}
                    </span>
                    <button
                      onClick={() => onDelete(a._id)}
                      aria-label="Delete application"
                      className="ml-1 inline-flex p-2 rounded hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <Trash2 className="h-4 w-4 opacity-70" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {Number.isFinite(Number(exp)) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10">
                      {exp} yr{Number(exp) === 1 ? "" : "s"} exp
                    </span>
                  )}
                  {resume && (
                    <a
                      href={resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] underline opacity-80 hover:opacity-100"
                    >
                      Resume
                    </a>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onMove(a._id, "Interview")}
                    className="text-[11px] px-2 h-9 rounded-lg border border-amber-400/40 hover:bg-amber-50/60 dark:hover:bg-amber-400/10"
                    title="Move to Interview"
                  >
                    + Interview
                  </button>

                  <label className="text-[11px] opacity-70">Move:</label>
                  <select
                    value={a.stage}
                    onChange={(e) => onMove(a._id, e.target.value as KanbanStage)}
                    className="text-[11px] rounded-md border border-black/10 dark:border-white/10 bg-transparent px-2 h-9"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s} className="bg-white dark:bg-zinc-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {a.skills?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : null}

                {a.createdAt && (
                  <p className="mt-2 text-[10px] opacity-60">
                    Added {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </Draggable>
        );
      })}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  numeric = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
}) {
  return (
    <div>
      <label className="text-xs opacity-70">{label}</label>
      <input
        value={value}
        inputMode={numeric ? "numeric" : undefined}
        pattern={numeric ? "[0-9]*" : undefined}
        onChange={(e) => onChange(numeric ? e.target.value.replace(/[^\d]/g, "") : e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 h-9 text-sm"
      />
    </div>
  );
}

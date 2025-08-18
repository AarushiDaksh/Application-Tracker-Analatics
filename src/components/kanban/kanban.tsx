// src/components/kanban/kanban.tsx
"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import type { App, KanbanStage } from "@/types/kanban";

const STAGES: KanbanStage[] = [
  
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

const STAGE_STYLE: Record<KanbanStage, { ring: string; pill: string; bg: string }> = {
  Applied: { ring: "ring-blue-300/40", pill: "bg-blue-500", bg: "from-blue-50/60 dark:from-blue-500/5" },
  Interview: { ring: "ring-amber-300/40", pill: "bg-amber-500", bg: "from-amber-50/60 dark:from-amber-500/5" },
  Offer: { ring: "ring-emerald-300/40", pill: "bg-emerald-500", bg: "from-emerald-50/60 dark:from-emerald-500/5" },
  Rejected: { ring: "ring-rose-300/40", pill: "bg-rose-500", bg: "from-rose-50/60 dark:from-rose-500/5" },
};

type KanbanProps = {
  apps: App[];
  onMove: (id: string, toStage: KanbanStage) => Promise<void>;
};

export default function Kanban({ apps, onMove }: KanbanProps) {
  // bucket apps by stage
  const cols: Record<KanbanStage, App[]> = Object.fromEntries(
    STAGES.map((s) => [s, [] as App[]])
  ) as Record<KanbanStage, App[]>;

  apps.forEach((a) => (cols[a.stage] ??= []).push(a));

  async function onDragEnd(res: DropResult) {
    const { destination, draggableId } = res;
    if (!destination) return;
    const toStage = destination.droppableId as KanbanStage;
    await onMove(draggableId, toStage);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 xl:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-7">
        {STAGES.map((stage) => {
          const theme = STAGE_STYLE[stage];
          const items = cols[stage] || [];
          return (
            <Droppable droppableId={stage} key={stage}>
              {(p) => (
                <div
                  ref={p.innerRef}
                  {...p.droppableProps}
                  className={`
                    flex flex-col rounded-2xl border border-black/10 dark:border-white/10
                    bg-gradient-to-b ${theme.bg} via-white/60 to-white/40
                    dark:via-white/5 dark:to-white/[0.02]
                    backdrop-blur-md p-3 md:p-4 min-h-[420px]
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${theme.pill}`} />
                      <h4 className="text-sm font-semibold">{stage}</h4>
                    </div>
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full border
                        border-black/10 dark:border-white/10
                        ${theme.ring}
                      `}
                    >
                      {items.length}
                    </span>
                  </div>

                  <button
                    className="mb-2 text-xs w-full rounded-lg border border-dashed border-black/10 dark:border-white/10
                               py-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition"
                    onClick={() => console.log("TODO: Open 'Add Candidate' modal in", stage)}
                  >
                    + Add
                  </button>

                  <div className="space-y-2.5">
                    {items.map((a, idx) => (
                      <Draggable key={a._id} draggableId={a._id} index={idx}>
                        {(pp) => (
                          <div
                            ref={pp.innerRef}
                            {...pp.draggableProps}
                            {...pp.dragHandleProps}
                            className="
                              rounded-xl border border-black/10 dark:border-white/10 
                              bg-white/80 dark:bg-white/10 p-3 shadow-sm
                              hover:shadow transition
                            "
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{a.candidate.name}</p>
                                <p className="text-xs opacity-70 truncate">
                                  {a.job.title}{a.job.company ? ` • ${a.job.company}` : ""}
                                </p>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${theme.pill} text-white`}>
                                {stage}
                              </span>
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
                    ))}
                    {p.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}

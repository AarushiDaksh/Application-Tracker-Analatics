export type KanbanStage = "Applied" | "Interview" | "Offer" | "Rejected";

export type App = {
  _id: string;
  stage: KanbanStage;
  candidate: { name: string };
  job: { title: string; company?: string };
  skills: string[];
  createdAt: string;
  updatedAt: string;
  yearsOfExperience: number;
  resumeLink?: string;   
};

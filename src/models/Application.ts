// src/models/Application.ts
import { Schema, model, models, Types } from "mongoose";

export type Stage = "Applied" | "Screen" | "Interview" | "Offer" | "Hired" | "Rejected";

const ApplicationSchema = new Schema({
  candidate: { type: Types.ObjectId, ref: "Candidate", required: true },
  job: { type: Types.ObjectId, ref: "Job", required: true },
  stage: { type: String, enum: ["Applied", "Screen", "Interview", "Offer", "Hired", "Rejected"], default: "Applied" },
  notes: String,
  events: [{ type: String }], // quick audit/activity
}, { timestamps: true });

export default models.Application || model("Application", ApplicationSchema);

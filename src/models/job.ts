// src/models/Job.ts
import { Schema, model, models } from "mongoose";

const JobSchema = new Schema({
  title: String,
  location: String,
  department: String,
  isOpen: { type: Boolean, default: true },
}, { timestamps: true });

export default models.Job || model("Job", JobSchema);

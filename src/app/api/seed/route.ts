
import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import Candidate from "@/models/Candidates";
import Job from "@/models/job";
import { Application } from "@/models/Application";


export const runtime = "nodejs";

export async function POST() {
  await dbConnect();
  await Candidate.deleteMany({});
  await Job.deleteMany({});
  await Application.deleteMany({});

  const job = await Job.create({ title: "Frontend Engineer", location: "Remote", department: "Engineering" });

  const candidates = await Candidate.insertMany([
    { name: "Isha Verma", email: "isha@ex.com", source: "LinkedIn", experience: 3, skills: ["React","TS"], avatar: "" },
    { name: "Rohit Singh", email: "rohit@ex.com", source: "Referral", experience: 4, skills: ["SQL","Python"], avatar: "" },
    { name: "Aman Gupta", email: "aman@ex.com", source: "Careers", experience: 2, skills: ["Recruiting"], avatar: "" },
    { name: "Neha Rao", email: "neha@ex.com", source: "LinkedIn", experience: 5, skills: ["React","Node"], avatar: "" },
  ]);

  const [isha, rohit, aman, neha] = candidates;

  await Application.insertMany([
    { candidate: isha._id, job: job._id, stage: "Interview", notes: "Tech round" },
    { candidate: rohit._id, job: job._id, stage: "Screen", notes: "Phone screen" },
    { candidate: aman._id, job: job._id, stage: "Applied", notes: "New" },
    { candidate: neha._id, job: job._id, stage: "Offer", notes: "Negotiation" },
  ]);

  return NextResponse.json({ ok: true });
}

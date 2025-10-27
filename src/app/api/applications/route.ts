import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { Application } from "@/models/Application";

export const runtime = "nodejs";

export async function GET() {
  await dbConnect();
  const docs = await Application.find().sort({ createdAt: -1 });
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    let {
      stage,
      candidateName,
      jobTitle,
      company,
      skills,
      yearsOfExperience,
      resumeLink,
    } = body || {};


    stage = typeof stage === "string" ? stage.trim() : "";
    candidateName = typeof candidateName === "string" ? candidateName.trim() : "";
    jobTitle = typeof jobTitle === "string" ? jobTitle.trim() : "";
    company = typeof company === "string" ? company.trim() : undefined;

    if (!stage || !candidateName || !jobTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

 
    const safeSkills: string[] = Array.isArray(skills)
      ? skills
          .map((s) => (typeof s === "string" ? s.trim() : ""))
          .filter(Boolean)
      : [];


    let yoe: number | undefined = undefined;
    if (yearsOfExperience !== undefined && yearsOfExperience !== null && yearsOfExperience !== "") {
      const n = Number(yearsOfExperience);
      if (!Number.isFinite(n) || n < 0) {
        return NextResponse.json({ error: "yearsOfExperience must be a non-negative number" }, { status: 400 });
      }
      yoe = n;
    }

   
    resumeLink = typeof resumeLink === "string" ? resumeLink.trim() : undefined;
    if (resumeLink === "") resumeLink = undefined;

    const doc = await Application.create({
      stage,
      candidate: { name: candidateName },
      job: { title: jobTitle, company },
      skills: safeSkills,
      yearsOfExperience: yoe,
      resumeLink,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (e: any) {
    console.error("Create application failed:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
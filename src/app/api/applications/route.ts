
import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { Application } from "@/models/Application";

export async function GET() {
  await dbConnect();
  const docs = await Application.find().sort({ createdAt: -1 });
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      stage,
      candidateName,
      jobTitle,
      company,
      skills,
      yearsOfExperience,
      resumeLink,
    } = body || {};

    if (!stage || !candidateName || !jobTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const doc = await Application.create({
      stage,
      candidate: { name: candidateName },
      job: { title: jobTitle, company },
      skills: Array.isArray(skills) ? skills : [],
      yearsOfExperience:
        yearsOfExperience === undefined || yearsOfExperience === null
          ? undefined
          : Number(yearsOfExperience),
      resumeLink,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (e: any) {
    console.error("Create application failed:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

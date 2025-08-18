// src/app/api/applications/route.ts  (GET list; query by job/stage)
import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import Application from "@/models/Application";

export const runtime = "nodejs";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const q: any = jobId ? { job: jobId } : {};
  const apps = await Application.find(q)
    .populate("candidate")
    .populate("job")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ apps });
}

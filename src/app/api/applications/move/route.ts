// src/app/api/applications/move/route.ts  (PATCH drag → update stage order)
import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import Application from "@/models/Application";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  await dbConnect();
  const { applicationId, toStage } = await req.json();
  if (!applicationId || !toStage) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const app = await Application.findByIdAndUpdate(
    applicationId,
    { stage: toStage, $push: { events: `Moved to ${toStage} @ ${new Date().toISOString()}` } },
    { new: true }
  ).populate("candidate").populate("job");

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, app });
}

// src/app/api/applications/move/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";            // ✅ your correct path
import { Application } from "@/models/Application"; // ✅ named import

export const runtime = "nodejs";

const STAGES = ["Applied", "Interview", "Offer", "Rejected"] as const;
type Stage = (typeof STAGES)[number];

export async function PATCH(req: Request) {
  await dbConnect();

  const { applicationId, toStage } = await req.json();

  if (!applicationId || !toStage) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!STAGES.includes(toStage as Stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  const app = await Application.findByIdAndUpdate(
    applicationId,
    {
      stage: toStage,
      $push: { events: `Moved to ${toStage} @ ${new Date().toISOString()}` }, // requires events: [String] in schema
    },
    { new: true }
  );

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, app });
}

// src/app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import Application from "@/models/Application";

export const runtime = "nodejs";

export async function GET() {
  await dbConnect();
  const [counts] = await Application.aggregate([
    { $group: { _id: "$stage", n: { $sum: 1 } } }
  ]);
  const total = await Application.countDocuments();
  return NextResponse.json({ total, byStage: counts });
}

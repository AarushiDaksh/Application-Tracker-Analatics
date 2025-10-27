import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { Application } from "@/models/Application";
import { getUserId } from "@/lib/auth";

export async function POST() {
  await dbConnect();
  const userId = await getUserId().catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // DEV ONLY: assign all orphaned apps to the current user
  const result = await Application.updateMany(
    { $or: [{ user: { $exists: false } }, { user: null }] },
    { $set: { user: userId } }
  );

  return NextResponse.json({ ok: true, matched: result.matchedCount, modified: result.modifiedCount });
}

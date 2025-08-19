import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { Application } from "@/models/Application";

export const runtime = "nodejs";

function getIdFromUrl(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  return parts[parts.length - 1]; // last segment is the id
}

export async function PATCH(req: Request) {
  await dbConnect();
  const id = getIdFromUrl(req);

  const body = await req.json().catch(() => ({}));
  const update: any = {};
  if (body.stage) update.stage = body.stage;
  if (body.resumeLink !== undefined) update.resumeLink = body.resumeLink || undefined;

  const doc = await Application.findByIdAndUpdate(id, update, { new: true });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(req: Request) {
  await dbConnect();
  const id = getIdFromUrl(req);

  await Application.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}

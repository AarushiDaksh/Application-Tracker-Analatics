
import { NextResponse } from "next/server";
import { dbConnect } from "@/utils/db";
import { Application } from "@/models/Application";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await dbConnect();

  const { id } = await ctx.params; 
  const { stage } = await req.json();

  const app = await Application.findByIdAndUpdate(
    id,
    { stage },
    { new: true }
  );
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(app);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await ctx.params; 
  await Application.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}

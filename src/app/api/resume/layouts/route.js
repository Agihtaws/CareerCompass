import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { ResumeLayout } from "@/models/ResumeLayout";
import { TEMPLATE_IDS, SECTION_KEYS } from "@/lib/resume-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    const docs = await ResumeLayout.find({}, "slug name template order createdAt")
      .sort({ createdAt: -1 }).limit(20).lean();
    return NextResponse.json({
      layouts: docs.map((d) => ({ slug: d.slug, name: d.name, template: d.template, order: d.order })),
    });
  } catch (e) {
    return NextResponse.json({ layouts: [], error: e.message });
  }
}

export async function POST(request) {
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const name = typeof body?.name === "string" && body.name.trim()
    ? body.name.trim().slice(0, 60) : "Untitled layout";
  const template = TEMPLATE_IDS.includes(body?.template) ? body.template : "modern";
  const order = Array.isArray(body?.order)
    ? [...new Set(body.order.filter((k) => SECTION_KEYS.includes(k)))] : [];

  try {
    await connectToDatabase();
    const slug = crypto.randomBytes(5).toString("hex");
    await ResumeLayout.create({ slug, name, template, order });
    return NextResponse.json({ slug, name, template, order });
  } catch (e) {
    return NextResponse.json({ error: "Could not save layout.", detail: e.message }, { status: 502 });
  }
}

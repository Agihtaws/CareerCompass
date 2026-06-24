import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ResumeLayout } from "@/models/ResumeLayout";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    await connectToDatabase();
    const doc = await ResumeLayout.findOne({ slug: id }, "slug name template order").lean();
    if (!doc) return NextResponse.json({ error: "Layout not found." }, { status: 404 });
    return NextResponse.json({ slug: doc.slug, name: doc.name, template: doc.template, order: doc.order });
  } catch (e) {
    return NextResponse.json({ error: "Could not load layout.", detail: e.message }, { status: 502 });
  }
}

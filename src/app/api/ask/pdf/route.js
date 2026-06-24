import { NextResponse } from "next/server";
import { extractPdfText } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF is too large (max 8MB)." }, { status: 400 });
    }
    const text = await extractPdfText(buf);
    if (!text) {
      return NextResponse.json(
        { error: "No text found — this PDF may be scanned images. Try the image tool instead." },
        { status: 422 }
      );
    }
    return NextResponse.json({ text, chars: text.length });
  } catch (e) {
    return NextResponse.json(
      { error: "Couldn't read that PDF.", detail: e.message },
      { status: 502 }
    );
  }
}

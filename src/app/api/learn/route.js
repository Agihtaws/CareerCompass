import { NextResponse } from "next/server";
import { getLearnInfo, getVideosForTopic, normalizeLang } from "@/lib/courses";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const topic = (searchParams.get("q") || "").trim();
  const lang = normalizeLang(searchParams.get("lang"));
  const mode = searchParams.get("mode");

  if (!topic) {
    return NextResponse.json({ error: "Add a topic, e.g. ?q=python" }, { status: 400 });
  }
  if (topic.length > 100) {
    return NextResponse.json({ error: "Topic is too long." }, { status: 400 });
  }

  try {
    if (mode === "videos") {
      const r = await getVideosForTopic({ topic, lang });
      return NextResponse.json({ videos: r.videos, videosError: r.error, lang });
    }
    const data = await getLearnInfo({ topic, lang });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load learning info.", detail: e.message },
      { status: 502 }
    );
  }
}

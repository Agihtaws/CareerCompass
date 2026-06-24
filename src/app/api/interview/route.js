import { NextResponse } from "next/server";
import {
  getQuestions,
  getAnswerFeedback,
  getSpeakingFeedback,
  getVoiceInterviewQuestions,
  getInterviewSummary,
} from "@/lib/interview";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get("q") || "").trim();
  if (!role) {
    return NextResponse.json({ error: "Add a role, e.g. ?q=teacher" }, { status: 400 });
  }
  if (role.length > 100) {
    return NextResponse.json({ error: "That role is too long." }, { status: 400 });
  }
  try {
    return NextResponse.json(await getQuestions(role));
  } catch (e) {
    return NextResponse.json(
      { error: "Could not load questions.", detail: e.message },
      { status: 502 }
    );
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    if (body?.mode === "feedback") {
      if (!body.answer?.trim()) {
        return NextResponse.json({ error: "Empty answer." }, { status: 400 });
      }
      return NextResponse.json(
        await getAnswerFeedback({
          role: body.role || "",
          question: body.question || "",
          answer: body.answer,
        })
      );
    }

    if (body?.mode === "speak") {
      if (!body.transcript?.trim()) {
        return NextResponse.json({ error: "Nothing was said yet." }, { status: 400 });
      }
      return NextResponse.json(
        await getSpeakingFeedback({
          prompt: body.prompt || "",
          transcript: body.transcript,
        })
      );
    }

    if (body?.mode === "voiceset") {
      return NextResponse.json(
        await getVoiceInterviewQuestions({
          role: body.role || "",
          resume: body.resume || "",
        })
      );
    }

    if (body?.mode === "summary") {
      const qa = Array.isArray(body.qa) ? body.qa : [];
      if (!qa.length) {
        return NextResponse.json({ error: "No answers to review." }, { status: 400 });
      }
      return NextResponse.json(
        await getInterviewSummary({ role: body.role || "", qa })
      );
    }

    return NextResponse.json({ error: "Unknown mode." }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong.", detail: e.message },
      { status: 502 }
    );
  }
}

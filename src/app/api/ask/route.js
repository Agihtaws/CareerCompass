import { NextResponse } from "next/server";
import {
  chatReply,
  summarizeText,
  answerAboutText,
  makeFlashcards,
} from "@/lib/ask";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    if (body?.mode === "chat") {
      const messages = Array.isArray(body.messages) ? body.messages : [];
      if (!messages.length) {
        return NextResponse.json({ error: "No messages." }, { status: 400 });
      }
      return NextResponse.json(await chatReply(messages));
    }

    if (body?.mode === "summarize") {
      if (!body.text?.trim()) {
        return NextResponse.json({ error: "No text to summarize." }, { status: 400 });
      }
      return NextResponse.json(await summarizeText(body.text));
    }

    if (body?.mode === "ask") {
      if (!body.text?.trim() || !body.question?.trim()) {
        return NextResponse.json({ error: "Need a document and a question." }, { status: 400 });
      }
      return NextResponse.json(
        await answerAboutText({ question: body.question, text: body.text })
      );
    }

    if (body?.mode === "flashcards") {
      if (!body.text?.trim()) {
        return NextResponse.json({ error: "No text for flashcards." }, { status: 400 });
      }
      return NextResponse.json(
        await makeFlashcards({ text: body.text, count: body.count })
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

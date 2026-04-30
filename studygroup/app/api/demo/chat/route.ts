// AI-GENERATED: ChatGPT (GPT-5) — demo chat endpoint with Gemini and scripted fallback
// AI-ASSISTED: ChatGPT (GPT-5) — adds provider timeout so Gemini cannot block recorded demos
import { NextResponse } from "next/server";

const GEMINI_TIMEOUT_MS = 3000;

type DemoChatRequest = {
  message?: string;
  courseId?: string;
  location?: string;
  participants?: string[];
  selectedSlot?: {
    time?: string;
    location?: string;
  };
};

function fallbackReply(body: DemoChatRequest) {
  const course = body.courseId || "the class";
  const time = body.selectedSlot?.time || "Tuesday, 6:30 PM";
  const location = body.selectedSlot?.location || body.location || "Newman Library";

  if (body.message?.toLowerCase().includes("where")) {
    return `${location} works for me for ${course}. I can grab a table near the whiteboards.`;
  }

  if (body.message?.toLowerCase().includes("who")) {
    const peers = (body.participants ?? []).filter((name) => name !== "Aidan Nguyen");
    return `${peers[0] ?? "Priya"} and I can make it. ${time} at ${location} should work.`;
  }

  return `${time} at ${location} works for me. I can bring the ${course} sprint notes and keep it focused.`;
}

async function geminiReply(body: DemoChatRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  const prompt = [
    "You are a Virginia Tech student in CS 3704 coordinating a study group.",
    "Reply in one concise, natural sentence.",
    "Mention availability or location only if useful.",
    `Course: ${body.courseId ?? "CS 3704"}`,
    `Preferred slot: ${body.selectedSlot?.time ?? "Tuesday, 6:30 PM"}`,
    `Location: ${body.selectedSlot?.location ?? body.location ?? "Newman Library"}`,
    `Participants: ${(body.participants ?? ["Aidan Nguyen", "Priya Shah", "Marcus Johnson"]).join(", ")}`,
    `Student message: ${body.message ?? ""}`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 80,
            temperature: 0.6,
          },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim().length > 0 ? text.trim() : null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DemoChatRequest;

  try {
    const reply = await geminiReply(body);
    if (reply) {
      return NextResponse.json({ reply, source: "gemini" });
    }
  } catch {
    // Demo reliability matters more than surfacing provider errors.
  }

  return NextResponse.json({ reply: fallbackReply(body), source: "fallback" });
}

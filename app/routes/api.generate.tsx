import type { Route } from "./+types/api.generate";
import OpenAI from "openai";

export async function action({ request }: Route.ActionArgs) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), { status: 500 });
    }
    const openai = new OpenAI({ apiKey });

    const form = await request.formData();
    const sourceType = String(form.get("sourceType") || "text");
    const title = String(form.get("title") || "Imported Deck");
    let text = String(form.get("text") || "");
    const url = String(form.get("url") || "");

    if (sourceType === "url" && url) {
      try {
        const res = await fetch(url);
        const html = await res.text();
        // Naive text extraction. For MVP. Consider Readability later.
        text = html
          .replace(/<script[\s\S]*?<\/script>/g, " ")
          .replace(/<style[\s\S]*?<\/style>/g, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 12000);
      } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch URL" }), { status: 400 });
      }
    }

    if (!text || text.trim().length < 40) {
      return new Response(JSON.stringify({ error: "Not enough text to generate cards" }), { status: 400 });
    }

    const system = `You are a concise flashcard generator. Given source text, extract 5-10 high-quality study flashcards.
Return strict JSON with key \"cards\": an array of objects with properties: front, back, hint, difficulty(one of Again|Hard|Good|Easy). Keep answers short.`;

    const user = `Source text (truncated):\n\n${text.slice(0, 8000)}`;

    const chat = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 800,
    } as any);

    const content = chat.choices?.[0]?.message?.content?.toString() || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch (_) {
      parsed = { cards: [] };
    }
    const cards = Array.isArray(parsed.cards) ? parsed.cards : [];
    // Normalize
    const normalized = cards.slice(0, 10).map((c: any) => ({
      front: String(c.front || ""),
      back: String(c.back || ""),
      hint: c.hint ? String(c.hint) : undefined,
      difficulty: String(c.difficulty || "Good").toLowerCase(),
    }));

    return new Response(
      JSON.stringify({ title, cards: normalized }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), { status: 500 });
  }
}

export function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}


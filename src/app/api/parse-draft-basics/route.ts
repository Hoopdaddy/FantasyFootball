import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You read a screenshot of a fantasy football draft board (ESPN, Yahoo, Sleeper, NFL.com, or similar) — usually a grid of teams (columns) by rounds (rows), shown either before the draft starts (empty) or mid-draft (partially filled).

Return ONLY a JSON object (no prose, no markdown fences):
{"numTeams": number|null, "draftPosition": number|null, "numRounds": number|null}

Rules:
- numTeams: count the distinct team columns in the grid.
- draftPosition: the 1-indexed column number (left to right) that belongs to the viewer — look for labels like "You", "My Team", a highlighted/outlined column, or a team name that stands out as the logged-in user's. If you cannot confidently identify it, use null.
- numRounds: count the distinct round rows in the grid. If the grid only shows rounds completed so far rather than the full planned draft length, use null instead of guessing.
- If the image isn't a draft board grid at all, or you can't confidently read a value, use null for that field rather than guessing.
- Output strictly valid JSON, nothing else.`;

function extractJson(text: string): { numTeams: number | null; draftPosition: number | null; numRounds: number | null } {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  const objMatch = candidate.match(/\{[\s\S]*\}/);
  const jsonStr = objMatch ? objMatch[0] : candidate;
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      numTeams: typeof parsed.numTeams === "number" ? parsed.numTeams : null,
      draftPosition: typeof parsed.draftPosition === "number" ? parsed.draftPosition : null,
      numRounds: typeof parsed.numRounds === "number" ? parsed.numRounds : null,
    };
  } catch {
    return { numTeams: null, draftPosition: null, numRounds: null };
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("image");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");
  const mediaType = file.type && file.type.startsWith("image/") ? file.type : "image/png";

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
                data: base64,
              },
            },
            {
              type: "text",
              text: "Read the number of teams, my draft position, and number of rounds from this draft board screenshot.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const rawText = textBlock && textBlock.type === "text" ? textBlock.text : "{}";
    return NextResponse.json(extractJson(rawText));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error calling Claude.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

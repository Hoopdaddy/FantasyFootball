import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { matchPlayerName } from "@/lib/match";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You extract fantasy football draft picks from a screenshot of a draft board or player pool (ESPN, Yahoo, Sleeper, NFL.com, or similar). The layout varies by platform.

Return ONLY a JSON array (no prose, no markdown fences) of objects, one per drafted player visible in the image:
[{"name": "Player Name", "position": "QB|RB|WR|TE|K|DEF", "pickNumber": number|null, "round": number|null, "draftedByTeam": string|null}]

Rules:
- Only include players that are clearly marked/shown as already drafted (e.g. grayed out, struck through, in a "drafted" column, or assigned to a team slot). Do not include players still available in the pool.
- If a team defense is drafted, use its full team name (e.g. "Denver Broncos") as the name and "DEF" as position.
- pickNumber and round: extract if visible, otherwise null.
- draftedByTeam: the team/owner name or slot label if visible, otherwise null.
- If you cannot confidently read a name, omit that entry rather than guessing.
- Output strictly valid JSON, nothing else.`;

interface ExtractedPick {
  name: string;
  position?: string;
  pickNumber?: number | null;
  round?: number | null;
  draftedByTeam?: string | null;
}

function extractJson(text: string): ExtractedPick[] {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  const arrayMatch = candidate.match(/\[[\s\S]*\]/);
  const jsonStr = arrayMatch ? arrayMatch[0] : candidate;
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
      max_tokens: 2048,
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
              text: "Extract all already-drafted players from this draft board screenshot as JSON.",
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const rawText = textBlock && textBlock.type === "text" ? textBlock.text : "[]";
    const extracted = extractJson(rawText);

    const matched = extracted.map((entry) => {
      const { player, confidence } = matchPlayerName(entry.name, entry.position);
      return {
        rawName: entry.name,
        rawPosition: entry.position ?? null,
        pickNumber: entry.pickNumber ?? null,
        round: entry.round ?? null,
        draftedByTeam: entry.draftedByTeam ?? null,
        matchedPlayerId: player?.id ?? null,
        matchedPlayerName: player?.name ?? null,
        confidence,
      };
    });

    return NextResponse.json({ picks: matched });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error calling Claude.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

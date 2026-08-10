import { PLAYERS } from "./players";
import { Player } from "./types";

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

export interface MatchResult {
  player: Player | null;
  confidence: number; // 0-1
}

/** Best-effort fuzzy match of an OCR/vision-extracted name against the player pool. */
export function matchPlayerName(rawName: string, positionHint?: string): MatchResult {
  const target = normalize(rawName);
  if (!target) return { player: null, confidence: 0 };

  const candidates = positionHint ? PLAYERS.filter((p) => p.position === positionHint) : PLAYERS;

  let best: Player | null = null;
  let bestScore = 0;

  for (const p of candidates) {
    const norm = normalize(p.name);
    let score: number;
    if (norm === target) {
      score = 1;
    } else if (norm.includes(target) || target.includes(norm)) {
      score = 0.85;
    } else {
      const dist = levenshtein(norm, target);
      const maxLen = Math.max(norm.length, target.length);
      score = maxLen === 0 ? 0 : 1 - dist / maxLen;
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }

  if (bestScore < 0.55) return { player: null, confidence: bestScore };
  return { player: best, confidence: bestScore };
}

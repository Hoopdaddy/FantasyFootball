import { PLAYERS } from "./players";
import { projectedPoints } from "./scoring";
import {
  DraftedPlayer,
  LeagueConfig,
  Player,
  Position,
  RecommendationReason,
} from "./types";

const FLEX_ELIGIBLE: Position[] = ["RB", "WR", "TE"];
// Rough share of FLEX starts historically consumed by each position.
const FLEX_SHARE: Partial<Record<Position, number>> = { RB: 0.45, WR: 0.45, TE: 0.1 };

interface RosterCounts {
  filled: Record<Position, number>;
  dedicatedOpen: Record<Position, boolean>;
  flexOpen: boolean;
  flexRemainingCapacity: number;
  totalRosterSize: number;
  totalSlots: number;
}

function computeRosterCounts(myRoster: Player[], league: LeagueConfig): RosterCounts {
  const slots = league.rosterSlots;
  const counts: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 };
  myRoster.forEach((p) => counts[p.position]++);

  const dedicatedFilled: Record<Position, number> = {
    QB: Math.min(counts.QB, slots.QB),
    RB: Math.min(counts.RB, slots.RB),
    WR: Math.min(counts.WR, slots.WR),
    TE: Math.min(counts.TE, slots.TE),
    K: Math.min(counts.K, slots.K),
    DEF: Math.min(counts.DEF, slots.DEF),
  };

  const overflowForFlex =
    (counts.RB - dedicatedFilled.RB) +
    (counts.WR - dedicatedFilled.WR) +
    (counts.TE - dedicatedFilled.TE);
  const flexFilled = Math.min(slots.FLEX, Math.max(0, overflowForFlex));

  const dedicatedOpen: Record<Position, boolean> = {
    QB: dedicatedFilled.QB < slots.QB,
    RB: dedicatedFilled.RB < slots.RB,
    WR: dedicatedFilled.WR < slots.WR,
    TE: dedicatedFilled.TE < slots.TE,
    K: dedicatedFilled.K < slots.K,
    DEF: dedicatedFilled.DEF < slots.DEF,
  };

  const totalSlots =
    slots.QB + slots.RB + slots.WR + slots.TE + slots.FLEX + slots.K + slots.DEF + slots.BENCH;

  return {
    filled: dedicatedFilled,
    dedicatedOpen,
    flexOpen: flexFilled < slots.FLEX,
    flexRemainingCapacity: Math.max(0, slots.FLEX - flexFilled),
    totalRosterSize: myRoster.length,
    totalSlots,
  };
}

export interface RecommendOptions {
  overrideKD?: boolean; // allow K/DEF regardless of round
  limit?: number;
}

export interface RecommendationResult {
  recommendations: RecommendationReason[];
  currentRound: number;
  runWarnings: string[];
}

export function getRecommendations(
  leagueConfig: LeagueConfig,
  draftedPlayers: DraftedPlayer[],
  myRosterPlayerIds: string[],
  options: RecommendOptions = {}
): RecommendationResult {
  const scoring = leagueConfig.scoring;
  const draftedIds = new Set(draftedPlayers.map((d) => d.playerId));
  const available = PLAYERS.filter((p) => !draftedIds.has(p.id));
  const myRoster = PLAYERS.filter((p) => myRosterPlayerIds.includes(p.id));

  const totalPicks = draftedPlayers.length;
  const currentRound = Math.floor(totalPicks / leagueConfig.numTeams) + 1;
  const roundsRemaining = leagueConfig.numRounds - currentRound;
  const kdAllowed = options.overrideKD || roundsRemaining <= 2;

  const rosterCounts = computeRosterCounts(myRoster, leagueConfig);

  // Replacement level per position: points of the player ranked just below
  // the number of teams that will start at that position league-wide.
  const byPosition: Record<Position, Player[]> = { QB: [], RB: [], WR: [], TE: [], K: [], DEF: [] };
  PLAYERS.forEach((p) => byPosition[p.position].push(p));
  (Object.keys(byPosition) as Position[]).forEach((pos) => {
    byPosition[pos].sort((a, b) => projectedPoints(b, scoring) - projectedPoints(a, scoring));
  });

  const replacementRank: Record<Position, number> = {
    QB: leagueConfig.numTeams * leagueConfig.rosterSlots.QB,
    RB: Math.round(
      leagueConfig.numTeams * leagueConfig.rosterSlots.RB +
        leagueConfig.numTeams * leagueConfig.rosterSlots.FLEX * (FLEX_SHARE.RB ?? 0)
    ),
    WR: Math.round(
      leagueConfig.numTeams * leagueConfig.rosterSlots.WR +
        leagueConfig.numTeams * leagueConfig.rosterSlots.FLEX * (FLEX_SHARE.WR ?? 0)
    ),
    TE: Math.round(
      leagueConfig.numTeams * leagueConfig.rosterSlots.TE +
        leagueConfig.numTeams * leagueConfig.rosterSlots.FLEX * (FLEX_SHARE.TE ?? 0)
    ),
    K: leagueConfig.numTeams * leagueConfig.rosterSlots.K,
    DEF: leagueConfig.numTeams * leagueConfig.rosterSlots.DEF,
  };

  const replacementPoints: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 };
  (Object.keys(byPosition) as Position[]).forEach((pos) => {
    const idx = Math.min(replacementRank[pos], byPosition[pos].length - 1);
    const replacementPlayer = byPosition[pos][Math.max(idx, 0)];
    replacementPoints[pos] = replacementPlayer ? projectedPoints(replacementPlayer, scoring) : 0;
  });

  // Startable-quality players remaining at each position (VORP > 0), for scarcity math.
  const startableRemaining: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0 };
  available.forEach((p) => {
    if (projectedPoints(p, scoring) - replacementPoints[p.position] > 0) {
      startableRemaining[p.position]++;
    }
  });

  // Run detection: look at the last full round of picks for a position skew.
  const runWarnings: string[] = [];
  const windowSize = Math.min(leagueConfig.numTeams, draftedPlayers.length);
  if (windowSize >= 4) {
    const recentPicks = [...draftedPlayers]
      .sort((a, b) => (b.pickNumber ?? 0) - (a.pickNumber ?? 0))
      .slice(0, windowSize);
    const posCounts: Partial<Record<Position, number>> = {};
    recentPicks.forEach((dp) => {
      const player = PLAYERS.find((p) => p.id === dp.playerId);
      if (!player) return;
      posCounts[player.position] = (posCounts[player.position] ?? 0) + 1;
    });
    (Object.keys(posCounts) as Position[]).forEach((pos) => {
      const share = (posCounts[pos] ?? 0) / windowSize;
      if (share >= 0.4 && startableRemaining[pos] <= leagueConfig.numTeams) {
        runWarnings.push(
          `${pos} run in progress — ${posCounts[pos]}/${windowSize} of the last picks were ${pos}s, and only ${startableRemaining[pos]} startable-quality ${pos}s remain.`
        );
      }
    });
  }

  const results: RecommendationReason[] = [];

  available.forEach((player) => {
    const pos = player.position;

    // Hard exclusions
    if ((pos === "K" || pos === "DEF") && !kdAllowed) return;
    if ((pos === "K" || pos === "DEF") && !rosterCounts.dedicatedOpen[pos]) return; // already have one
    const teLockedOut =
      pos === "TE" && !rosterCounts.dedicatedOpen.TE && !rosterCounts.flexOpen && !leagueConfig.benchTeToggle;
    if (teLockedOut) return;

    const pts = projectedPoints(player, scoring);
    const vorp = Math.round((pts - replacementPoints[pos]) * 10) / 10;

    let needMultiplier = 1;
    const reasons: string[] = [];

    if (rosterCounts.dedicatedOpen[pos]) {
      needMultiplier = 1.35;
      reasons.push(`Fills an open starting ${pos} slot.`);
    } else if (FLEX_ELIGIBLE.includes(pos) && rosterCounts.flexOpen) {
      needMultiplier = 1.15;
      reasons.push(`${pos} starters are set, but your FLEX spot is still open.`);
    } else if (rosterCounts.totalRosterSize < rosterCounts.totalSlots) {
      needMultiplier = 0.85;
      reasons.push(`Bench value — ${pos} starters (and FLEX) are already accounted for.`);
    }

    if (pos === "K" || pos === "DEF") {
      reasons.push(`Late-round timing — round ${currentRound} of ${leagueConfig.numRounds}, reasonable to lock in a ${pos} now.`);
    }

    const startable = startableRemaining[pos];
    let scarcityWarning: string | null = null;
    if (startable <= leagueConfig.numTeams * 0.75 && pos !== "K" && pos !== "DEF") {
      scarcityWarning = `Only ${startable} startable-quality ${pos}s left across ${leagueConfig.numTeams} teams.`;
      reasons.push(scarcityWarning);
    }

    reasons.push(`Ranked #${player.expertRank} overall, #${player.positionRank} among ${pos}s (ADP ${player.adp}).`);

    const scarcityBonus = startable > 0 ? Math.max(0, (leagueConfig.numTeams - startable) * 0.6) : 5;
    const score = Math.round((vorp * needMultiplier + scarcityBonus) * 10) / 10;

    results.push({
      playerId: player.id,
      score,
      vorp,
      fitScore: needMultiplier,
      reasons,
      isBestPureValue: false,
      isBestFit: false,
      scarcityWarning,
    });
  });

  results.sort((a, b) => b.score - a.score);

  if (results.length > 0) {
    const bestValue = [...results].sort((a, b) => b.vorp - a.vorp)[0];
    bestValue.isBestPureValue = true;
    results[0].isBestFit = true;
  }

  const limit = options.limit ?? 8;
  let top = results.slice(0, limit);

  // Ensure the "best pure value" player is represented even if it fell outside the fit-sorted top slice.
  const bestValuePlayer = results.find((r) => r.isBestPureValue);
  if (bestValuePlayer && !top.some((r) => r.playerId === bestValuePlayer.playerId)) {
    top = [...top.slice(0, limit - 1), bestValuePlayer];
  }

  return { recommendations: top, currentRound, runWarnings };
}

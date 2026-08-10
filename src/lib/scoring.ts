import { Player, ScoringSettings } from "./types";

const GAMES_PER_SEASON = 17;

function pointsAllowedPerGame(avg: number | undefined, s: ScoringSettings): number {
  if (avg === undefined) return 0;
  if (avg <= 0) return s.pointsAllowed0;
  if (avg <= 6) return s.pointsAllowed1to6;
  if (avg <= 13) return s.pointsAllowed7to13;
  if (avg <= 20) return s.pointsAllowed14to20;
  if (avg <= 27) return s.pointsAllowed21to27;
  if (avg <= 34) return s.pointsAllowed28to34;
  return s.pointsAllowed35plus;
}

/** Season-long projected fantasy points for a player under a league's custom scoring settings. */
export function projectedPoints(player: Player, s: ScoringSettings): number {
  const p = player.projection;
  let total = 0;

  // Passing
  if (p.passYards) total += p.passYards / s.passYardsPerPoint;
  if (p.passTds) total += p.passTds * s.passTdPoints;
  if (p.passTwoPt) total += p.passTwoPt * s.passTwoPtPoints;
  if (p.interceptions) total += p.interceptions * s.interceptionPoints;

  // Rushing
  if (p.rushYards) total += p.rushYards / s.rushYardsPerPoint;
  if (p.rushTds) total += p.rushTds * s.rushTdPoints;
  if (p.rushTwoPt) total += p.rushTwoPt * s.rushTwoPtPoints;

  // Receiving
  if (p.receptions) total += p.receptions * s.receptionPoints;
  if (p.recYards) total += p.recYards / s.recYardsPerPoint;
  if (p.recTds) total += p.recTds * s.recTdPoints;
  if (p.recTwoPt) total += p.recTwoPt * s.recTwoPtPoints;

  // Fumbles (offensive players)
  if (p.fumblesLost) total += p.fumblesLost * s.fumbleLostPoints;

  // Kicking
  if (p.fg0to39) total += p.fg0to39 * s.fg0to39;
  if (p.fg40to49) total += p.fg40to49 * s.fg40to49;
  if (p.fg50to59) total += p.fg50to59 * s.fg50to59;
  if (p.fg60plus) total += p.fg60plus * s.fg60plus;
  if (p.fgMissed) total += p.fgMissed * s.missedFgPoints;
  if (p.pat) total += p.pat * s.patPoints;

  // Defense / Special teams
  if (p.defTds) total += p.defTds * s.defTdPoints;
  if (p.sacks) total += p.sacks * s.sackPoints;
  if (p.defInterceptions) total += p.defInterceptions * s.defInterceptionPoints;
  if (p.fumbleRecoveries) total += p.fumbleRecoveries * s.fumbleRecoveryPoints;
  if (p.safeties) total += p.safeties * s.safetyPoints;
  if (p.forcedFumbles) total += p.forcedFumbles * s.forcedFumblePoints;
  if (p.blockedKicks) total += p.blockedKicks * s.blockedKickPoints;
  if (p.avgPointsAllowedPerGame !== undefined) {
    total += pointsAllowedPerGame(p.avgPointsAllowedPerGame, s) * GAMES_PER_SEASON;
  }

  return Math.round(total * 10) / 10;
}

export function projectedPointsPerGame(player: Player, s: ScoringSettings): number {
  return Math.round((projectedPoints(player, s) / GAMES_PER_SEASON) * 10) / 10;
}

export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DEF";

export interface ScoringSettings {
  passYardsPerPoint: number;
  passTdPoints: number;
  passTwoPtPoints: number;
  interceptionPoints: number;
  rushYardsPerPoint: number;
  rushTdPoints: number;
  rushTwoPtPoints: number;
  receptionPoints: number;
  recYardsPerPoint: number;
  recTdPoints: number;
  recTwoPtPoints: number;
  fumbleLostPoints: number;
  fumbleRecoveryTdPoints: number;
  // Kicking
  fg0to39: number;
  fg40to49: number;
  fg50to59: number;
  fg60plus: number;
  patPoints: number;
  missedFgPoints: number;
  // Defense/Team
  defTdPoints: number;
  pointsAllowed0: number;
  pointsAllowed1to6: number;
  pointsAllowed7to13: number;
  pointsAllowed14to20: number;
  pointsAllowed21to27: number;
  pointsAllowed28to34: number;
  pointsAllowed35plus: number;
  sackPoints: number;
  defInterceptionPoints: number;
  fumbleRecoveryPoints: number;
  safetyPoints: number;
  forcedFumblePoints: number;
  blockedKickPoints: number;
  // Special teams (both DEF and offensive players)
  specialTeamsTdPoints: number;
  specialTeamsForcedFumblePoints: number;
  specialTeamsFumbleRecoveryPoints: number;
}

export const DEFAULT_SCORING: ScoringSettings = {
  passYardsPerPoint: 25, // 1 pt per 25 yds -> stored as yards-per-point
  passTdPoints: 4,
  passTwoPtPoints: 2,
  interceptionPoints: -1,
  rushYardsPerPoint: 10,
  rushTdPoints: 6,
  rushTwoPtPoints: 2,
  receptionPoints: 1,
  recYardsPerPoint: 10,
  recTdPoints: 6,
  recTwoPtPoints: 2,
  fumbleLostPoints: -1,
  fumbleRecoveryTdPoints: 6,
  fg0to39: 3,
  fg40to49: 4,
  fg50to59: 5,
  fg60plus: 5,
  patPoints: 1,
  missedFgPoints: -1,
  defTdPoints: 6,
  pointsAllowed0: 8,
  pointsAllowed1to6: 6,
  pointsAllowed7to13: 4,
  pointsAllowed14to20: 1,
  pointsAllowed21to27: 0,
  pointsAllowed28to34: -1,
  pointsAllowed35plus: -4,
  sackPoints: 1,
  defInterceptionPoints: 2,
  fumbleRecoveryPoints: 2,
  safetyPoints: 2,
  forcedFumblePoints: 1,
  blockedKickPoints: 2,
  specialTeamsTdPoints: 6,
  specialTeamsForcedFumblePoints: 1,
  specialTeamsFumbleRecoveryPoints: 1,
};

export interface RosterSlots {
  QB: number;
  RB: number;
  WR: number;
  TE: number; // hard max 1, enforced in logic
  FLEX: number;
  K: number; // hard max 1
  DEF: number; // hard max 1
  BENCH: number;
}

export const DEFAULT_ROSTER_SLOTS: RosterSlots = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 1,
  K: 1,
  DEF: 1,
  BENCH: 6,
};

export interface LeagueConfig {
  numTeams: number;
  draftPosition: number;
  numRounds: number;
  rosterSlots: RosterSlots;
  scoring: ScoringSettings;
  benchTeToggle: boolean; // allow drafting a 2nd TE for bench
}

export const DEFAULT_LEAGUE_CONFIG: LeagueConfig = {
  numTeams: 10,
  draftPosition: 1,
  numRounds: 16,
  rosterSlots: DEFAULT_ROSTER_SLOTS,
  scoring: DEFAULT_SCORING,
  benchTeToggle: false,
};

// Rough projected per-season stat line used to compute custom-scoring projections
export interface ProjectedStatLine {
  passYards?: number;
  passTds?: number;
  passTwoPt?: number;
  interceptions?: number;
  rushYards?: number;
  rushTds?: number;
  rushTwoPt?: number;
  receptions?: number;
  recYards?: number;
  recTds?: number;
  recTwoPt?: number;
  fumblesLost?: number;
  // Kicking
  fg0to39?: number;
  fg40to49?: number;
  fg50to59?: number;
  fg60plus?: number;
  fgMissed?: number;
  pat?: number;
  // Defense
  defTds?: number;
  sacks?: number;
  defInterceptions?: number;
  fumbleRecoveries?: number;
  safeties?: number;
  forcedFumbles?: number;
  blockedKicks?: number;
  avgPointsAllowedPerGame?: number; // used to bucket points-allowed tiers
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  nflTeam: string;
  bye: number;
  adp: number; // consensus ADP (overall pick number)
  expertRank: number; // overall consensus expert rank
  positionRank: number;
  blurb: string;
  projection: ProjectedStatLine;
}

export interface DraftedPlayer {
  playerId: string;
  pickNumber: number | null;
  round: number | null;
  draftedByTeam: string | null; // team name/slot if visible, or "ME"
  isMe: boolean;
}

export interface DraftState {
  leagueConfig: LeagueConfig;
  draftedPlayers: DraftedPlayer[];
  myRosterPlayerIds: string[];
  setupComplete: boolean;
}

export interface RecommendationReason {
  playerId: string;
  score: number;
  vorp: number;
  fitScore: number;
  reasons: string[];
  isBestPureValue: boolean;
  isBestFit: boolean;
  scarcityWarning: string | null;
}

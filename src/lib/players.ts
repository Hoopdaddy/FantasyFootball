import { Player, Position, ProjectedStatLine } from "./types";

/**
 * PLACEHOLDER SEED DATA.
 * This file is a realistic-shaped stand-in for a proper ADP/rankings aggregation
 * (FantasyPros / ESPN / Yahoo consensus, etc). Ranks, ADP, and projections are
 * hand-approximated, not pulled from a live source. Swap this file for a real
 * export close to draft day (see README.md).
 */

interface PoolEntry {
  name: string;
  team: string;
  bye: number;
}

function statLineForTier(position: Position, tier: number): ProjectedStatLine {
  switch (position) {
    case "QB": {
      const t = [
        { passYards: 4300, passTds: 33, passTwoPt: 1, interceptions: 9, rushYards: 550, rushTds: 6 },
        { passYards: 4050, passTds: 28, passTwoPt: 1, interceptions: 10, rushYards: 300, rushTds: 3 },
        { passYards: 3800, passTds: 24, passTwoPt: 0, interceptions: 11, rushYards: 180, rushTds: 2 },
        { passYards: 3500, passTds: 20, passTwoPt: 0, interceptions: 12, rushYards: 110, rushTds: 1 },
        { passYards: 3100, passTds: 17, passTwoPt: 0, interceptions: 13, rushYards: 60, rushTds: 1 },
      ];
      return t[Math.min(tier, t.length - 1)];
    }
    case "RB": {
      const t = [
        { rushYards: 1350, rushTds: 11, receptions: 55, recYards: 420, recTds: 2, fumblesLost: 2 },
        { rushYards: 1150, rushTds: 9, receptions: 45, recYards: 340, recTds: 2, fumblesLost: 2 },
        { rushYards: 950, rushTds: 7, receptions: 35, recYards: 270, recTds: 1, fumblesLost: 1 },
        { rushYards: 750, rushTds: 5, receptions: 25, recYards: 190, recTds: 1, fumblesLost: 1 },
        { rushYards: 500, rushTds: 3, receptions: 16, recYards: 120, recTds: 0, fumblesLost: 1 },
        { rushYards: 300, rushTds: 2, receptions: 10, recYards: 70, recTds: 0, fumblesLost: 0 },
      ];
      return t[Math.min(tier, t.length - 1)];
    }
    case "WR": {
      const t = [
        { receptions: 98, recYards: 1350, recTds: 9, rushYards: 30, fumblesLost: 0 },
        { receptions: 85, recYards: 1120, recTds: 7, rushYards: 15, fumblesLost: 0 },
        { receptions: 70, recYards: 900, recTds: 6, rushYards: 5, fumblesLost: 0 },
        { receptions: 58, recYards: 720, recTds: 4, fumblesLost: 0 },
        { receptions: 45, recYards: 560, recTds: 3, fumblesLost: 0 },
        { receptions: 32, recYards: 400, recTds: 2, fumblesLost: 0 },
      ];
      return t[Math.min(tier, t.length - 1)];
    }
    case "TE": {
      const t = [
        { receptions: 78, recYards: 980, recTds: 7, fumblesLost: 0 },
        { receptions: 62, recYards: 780, recTds: 5, fumblesLost: 0 },
        { receptions: 48, recYards: 580, recTds: 4, fumblesLost: 0 },
        { receptions: 34, recYards: 400, recTds: 2, fumblesLost: 0 },
        { receptions: 22, recYards: 260, recTds: 1, fumblesLost: 0 },
      ];
      return t[Math.min(tier, t.length - 1)];
    }
    case "K": {
      const t = [
        { fg0to39: 15, fg40to49: 8, fg50to59: 3, fg60plus: 0, fgMissed: 3, pat: 40 },
        { fg0to39: 13, fg40to49: 6, fg50to59: 2, fg60plus: 0, fgMissed: 3, pat: 34 },
        { fg0to39: 11, fg40to49: 5, fg50to59: 2, fg60plus: 0, fgMissed: 4, pat: 28 },
      ];
      return t[Math.min(tier, t.length - 1)];
    }
    case "DEF": {
      const t = [
        { sacks: 48, defInterceptions: 15, fumbleRecoveries: 10, defTds: 3, safeties: 1, forcedFumbles: 12, blockedKicks: 2, avgPointsAllowedPerGame: 17 },
        { sacks: 42, defInterceptions: 12, fumbleRecoveries: 8, defTds: 2, safeties: 0, forcedFumbles: 10, blockedKicks: 1, avgPointsAllowedPerGame: 20.5 },
        { sacks: 37, defInterceptions: 10, fumbleRecoveries: 7, defTds: 1, safeties: 0, forcedFumbles: 8, blockedKicks: 1, avgPointsAllowedPerGame: 23 },
      ];
      return t[Math.min(tier, t.length - 1)];
    }
  }
}

const BLURB_TEMPLATES: Record<Position, string[]> = {
  QB: [
    "Consensus view has him as a stable weekly starter with rushing upside that raises his floor above pocket-passer peers.",
    "Experts like the surrounding weapons and offensive scheme; touchdown regression is the main risk flagged in rankings.",
    "Volume passer in a pass-heavy system — analysts note interception risk but strong weekly ceiling.",
    "Dual-threat profile gives him a higher floor than his raw passing stats suggest; often ranked ahead of arm-only QBs.",
    "New/changed weapons around him have experts split — some see a leap, others want to see it on the field first.",
  ],
  RB: [
    "Bell-cow workload expected; experts consistently rank him as a strong RB1 anchor given projected touch share.",
    "Committee backfield concerns show up across rankings — efficiency is there but volume is the swing factor.",
    "Pass-catching role gives him a safe PPR floor even in weeks the ground game stalls.",
    "Depends heavily on offensive line health per most analysts; talent is not in question, opportunity is.",
    "Late-round value flagged by several rankings sites due to a clearer path to touches than ADP suggests.",
    "Handcuff/committee back whose value is touchdown-dependent; mostly a bench stash per consensus.",
  ],
  WR: [
    "Target share leader in his offense; experts have him as a weekly must-start with a high floor.",
    "Big-play upside noted across rankings, though target consistency draws some concern week to week.",
    "Slot role change discussed by analysts as a boost to his catch rate and PPR floor this season.",
    "New QB or scheme fit is the top storyline in expert write-ups — outlook varies by how that settles.",
    "Consensus 'buy' as a value relative to ADP given a clearer role entering the season.",
    "Boom/bust profile per most rankings — ceiling is real but touchdown-dependent weeks are common.",
  ],
  TE: [
    "Locked into a clear top target role in his offense; one of the safer positional floors at TE.",
    "Athletic upside experts flag as a breakout candidate if target share climbs as expected.",
    "Committee usage with other pass-catchers tempers ceiling per most rankings, but red-zone role helps.",
    "Rankings site consensus treats him as a streaming-caliber option unless volume clearly increases.",
  ],
  K: [
    "High-volume offense projected to produce plenty of scoring chances and extra point opportunities.",
    "Strong leg noted for long-range attempts, which matters most in this league's 50+ yard scoring tiers.",
    "Solid but unspectacular — a serviceable streamer rather than a must-roster arm.",
  ],
  DEF: [
    "Favorable early-season schedule and a disruptive front seven make this a top streaming/rostered defense.",
    "Turnover-creating secondary is the headline per most rankings — sack production is the swing factor.",
    "Middle-of-the-pack unit; matchup-dependent streamer more than a set-and-forget DEF1.",
  ],
};

function buildPlayers(): Player[] {
  const pools: Record<Position, PoolEntry[]> = {
    QB: [
      { name: "Josh Allen", team: "BUF", bye: 7 },
      { name: "Lamar Jackson", team: "BAL", bye: 7 },
      { name: "Jayden Daniels", team: "WAS", bye: 12 },
      { name: "Joe Burrow", team: "CIN", bye: 10 },
      { name: "Patrick Mahomes", team: "KC", bye: 10 },
      { name: "Jalen Hurts", team: "PHI", bye: 5 },
      { name: "Justin Herbert", team: "LAC", bye: 8 },
      { name: "Kyler Murray", team: "ARI", bye: 8 },
      { name: "Brock Purdy", team: "SF", bye: 14 },
      { name: "C.J. Stroud", team: "HOU", bye: 14 },
      { name: "Bo Nix", team: "DEN", bye: 12 },
      { name: "Jared Goff", team: "DET", bye: 8 },
      { name: "Baker Mayfield", team: "TB", bye: 9 },
      { name: "Dak Prescott", team: "DAL", bye: 10 },
      { name: "Matthew Stafford", team: "LAR", bye: 8 },
      { name: "Trevor Lawrence", team: "JAX", bye: 8 },
      { name: "Caleb Williams", team: "CHI", bye: 5 },
      { name: "Drake Maye", team: "NE", bye: 14 },
      { name: "Anthony Richardson", team: "IND", bye: 14 },
      { name: "Geno Smith", team: "LV", bye: 8 },
      { name: "Sam Darnold", team: "SEA", bye: 8 },
      { name: "Bryce Young", team: "CAR", bye: 14 },
      { name: "J.J. McCarthy", team: "MIN", bye: 6 },
      { name: "Aaron Rodgers", team: "PIT", bye: 5 },
    ],
    RB: [
      { name: "Bijan Robinson", team: "ATL", bye: 5 },
      { name: "Jahmyr Gibbs", team: "DET", bye: 8 },
      { name: "Saquon Barkley", team: "PHI", bye: 5 },
      { name: "Christian McCaffrey", team: "SF", bye: 14 },
      { name: "De'Von Achane", team: "MIA", bye: 12 },
      { name: "Ashton Jeanty", team: "LV", bye: 8 },
      { name: "Derrick Henry", team: "BAL", bye: 7 },
      { name: "Jonathan Taylor", team: "IND", bye: 14 },
      { name: "Josh Jacobs", team: "GB", bye: 5 },
      { name: "Bucky Irving", team: "TB", bye: 9 },
      { name: "Kyren Williams", team: "LAR", bye: 8 },
      { name: "James Cook", team: "BUF", bye: 7 },
      { name: "Chase Brown", team: "CIN", bye: 10 },
      { name: "Kenneth Walker III", team: "SEA", bye: 8 },
      { name: "Breece Hall", team: "NYJ", bye: 9 },
      { name: "Omarion Hampton", team: "LAC", bye: 8 },
      { name: "Alvin Kamara", team: "NO", bye: 11 },
      { name: "Chuba Hubbard", team: "CAR", bye: 14 },
      { name: "David Montgomery", team: "DET", bye: 8 },
      { name: "James Conner", team: "ARI", bye: 8 },
      { name: "Aaron Jones", team: "MIN", bye: 6 },
      { name: "Joe Mixon", team: "HOU", bye: 14 },
      { name: "Tony Pollard", team: "TEN", bye: 10 },
      { name: "Rhamondre Stevenson", team: "NE", bye: 14 },
      { name: "Javonte Williams", team: "DAL", bye: 10 },
      { name: "Isiah Pacheco", team: "KC", bye: 10 },
      { name: "Tyrone Tracy Jr.", team: "NYG", bye: 14 },
      { name: "Zach Charbonnet", team: "SEA", bye: 8 },
      { name: "Rachaad White", team: "TB", bye: 9 },
      { name: "Najee Harris", team: "LAC", bye: 8 },
      { name: "D'Andre Swift", team: "CHI", bye: 5 },
      { name: "Brian Robinson Jr.", team: "WAS", bye: 12 },
      { name: "Tank Bigsby", team: "JAX", bye: 8 },
      { name: "Ray Davis", team: "BUF", bye: 7 },
      { name: "Jaylen Warren", team: "PIT", bye: 5 },
      { name: "Austin Ekeler", team: "WAS", bye: 12 },
      { name: "J.K. Dobbins", team: "DEN", bye: 12 },
      { name: "Braelon Allen", team: "NYJ", bye: 9 },
      { name: "Jerome Ford", team: "CLE", bye: 9 },
      { name: "Ty Chandler", team: "MIN", bye: 6 },
      { name: "Roschon Johnson", team: "CHI", bye: 5 },
      { name: "Zamir White", team: "LV", bye: 8 },
      { name: "Miles Sanders", team: "DAL", bye: 10 },
      { name: "Antonio Gibson", team: "NE", bye: 14 },
      { name: "Devin Singletary", team: "NYG", bye: 14 },
      { name: "Justice Hill", team: "BAL", bye: 7 },
      { name: "Cam Akers", team: "MIN", bye: 6 },
      { name: "Kareem Hunt", team: "KC", bye: 10 },
      { name: "Samaje Perine", team: "KC", bye: 10 },
      { name: "Jaleel McLaughlin", team: "DEN", bye: 12 },
    ],
    WR: [
      { name: "Ja'Marr Chase", team: "CIN", bye: 10 },
      { name: "CeeDee Lamb", team: "DAL", bye: 10 },
      { name: "Justin Jefferson", team: "MIN", bye: 6 },
      { name: "Amon-Ra St. Brown", team: "DET", bye: 8 },
      { name: "Malik Nabers", team: "NYG", bye: 14 },
      { name: "Puka Nacua", team: "LAR", bye: 8 },
      { name: "Nico Collins", team: "HOU", bye: 14 },
      { name: "A.J. Brown", team: "PHI", bye: 5 },
      { name: "Brian Thomas Jr.", team: "JAX", bye: 8 },
      { name: "Drake London", team: "ATL", bye: 5 },
      { name: "Ladd McConkey", team: "LAC", bye: 8 },
      { name: "Marvin Harrison Jr.", team: "ARI", bye: 8 },
      { name: "Tee Higgins", team: "CIN", bye: 10 },
      { name: "DK Metcalf", team: "PIT", bye: 5 },
      { name: "Garrett Wilson", team: "NYJ", bye: 9 },
      { name: "Terry McLaurin", team: "WAS", bye: 12 },
      { name: "Mike Evans", team: "TB", bye: 9 },
      { name: "Chris Olave", team: "NO", bye: 11 },
      { name: "DJ Moore", team: "CHI", bye: 5 },
      { name: "Zay Flowers", team: "BAL", bye: 7 },
      { name: "Rome Odunze", team: "CHI", bye: 5 },
      { name: "Jaxon Smith-Njigba", team: "SEA", bye: 8 },
      { name: "Davante Adams", team: "LAR", bye: 8 },
      { name: "Xavier Worthy", team: "KC", bye: 10 },
      { name: "Jameson Williams", team: "DET", bye: 8 },
      { name: "Jerry Jeudy", team: "CLE", bye: 9 },
      { name: "Courtland Sutton", team: "DEN", bye: 12 },
      { name: "Tyreek Hill", team: "MIA", bye: 12 },
      { name: "Jordan Addison", team: "MIN", bye: 6 },
      { name: "Rashee Rice", team: "KC", bye: 10 },
      { name: "George Pickens", team: "DAL", bye: 10 },
      { name: "Calvin Ridley", team: "TEN", bye: 10 },
      { name: "Keenan Allen", team: "LAC", bye: 8 },
      { name: "Jayden Reed", team: "GB", bye: 5 },
      { name: "Christian Kirk", team: "HOU", bye: 14 },
      { name: "Josh Downs", team: "IND", bye: 14 },
      { name: "Diontae Johnson", team: "CLE", bye: 9 },
      { name: "Rashid Shaheed", team: "NO", bye: 11 },
      { name: "Jauan Jennings", team: "SF", bye: 14 },
      { name: "Khalil Shakir", team: "BUF", bye: 7 },
      { name: "Tank Dell", team: "HOU", bye: 14 },
      { name: "Wan'Dale Robinson", team: "NYG", bye: 14 },
      { name: "Adam Thielen", team: "CAR", bye: 14 },
      { name: "Romeo Doubs", team: "GB", bye: 5 },
      { name: "Ricky Pearsall", team: "SF", bye: 14 },
      { name: "Darnell Mooney", team: "ATL", bye: 5 },
      { name: "Michael Pittman Jr.", team: "IND", bye: 14 },
      { name: "Deebo Samuel", team: "WAS", bye: 12 },
      { name: "Amari Cooper", team: "LV", bye: 8 },
      { name: "Curtis Samuel", team: "BUF", bye: 7 },
      { name: "Marquise Brown", team: "KC", bye: 10 },
      { name: "Demario Douglas", team: "NE", bye: 14 },
      { name: "Jalen McMillan", team: "TB", bye: 9 },
      { name: "Elijah Moore", team: "CLE", bye: 9 },
      { name: "Tutu Atwell", team: "LAR", bye: 8 },
      { name: "Kendrick Bourne", team: "NE", bye: 14 },
      { name: "Gabe Davis", team: "JAX", bye: 8 },
      { name: "Nelson Agholor", team: "BAL", bye: 7 },
      { name: "Tyler Lockett", team: "SEA", bye: 8 },
      { name: "Allen Lazard", team: "NYJ", bye: 9 },
      { name: "Van Jefferson", team: "TEN", bye: 10 },
    ],
    TE: [
      { name: "Brock Bowers", team: "LV", bye: 8 },
      { name: "Trey McBride", team: "ARI", bye: 8 },
      { name: "Sam LaPorta", team: "DET", bye: 8 },
      { name: "George Kittle", team: "SF", bye: 14 },
      { name: "Mark Andrews", team: "BAL", bye: 7 },
      { name: "T.J. Hockenson", team: "MIN", bye: 6 },
      { name: "Evan Engram", team: "DEN", bye: 12 },
      { name: "David Njoku", team: "CLE", bye: 9 },
      { name: "Dallas Goedert", team: "PHI", bye: 5 },
      { name: "Kyle Pitts", team: "ATL", bye: 5 },
      { name: "Jake Ferguson", team: "DAL", bye: 10 },
      { name: "Dalton Kincaid", team: "BUF", bye: 7 },
      { name: "Cole Kmet", team: "CHI", bye: 5 },
      { name: "Tucker Kraft", team: "GB", bye: 5 },
      { name: "Pat Freiermuth", team: "PIT", bye: 5 },
      { name: "Hunter Henry", team: "NE", bye: 14 },
    ],
    K: [
      { name: "Brandon Aubrey", team: "DAL", bye: 10 },
      { name: "Chris Boswell", team: "PIT", bye: 5 },
      { name: "Jake Bates", team: "DET", bye: 8 },
      { name: "Harrison Butker", team: "KC", bye: 10 },
      { name: "Cameron Dicker", team: "LAC", bye: 8 },
      { name: "Ka'imi Fairbairn", team: "HOU", bye: 14 },
      { name: "Younghoe Koo", team: "ATL", bye: 5 },
      { name: "Jason Sanders", team: "MIA", bye: 12 },
      { name: "Justin Tucker", team: "BAL", bye: 7 },
      { name: "Wil Lutz", team: "DEN", bye: 12 },
      { name: "Tyler Bass", team: "BUF", bye: 7 },
      { name: "Matt Gay", team: "IND", bye: 14 },
    ],
    DEF: [
      { name: "Denver Broncos", team: "DEN", bye: 12 },
      { name: "Pittsburgh Steelers", team: "PIT", bye: 5 },
      { name: "Minnesota Vikings", team: "MIN", bye: 6 },
      { name: "Baltimore Ravens", team: "BAL", bye: 7 },
      { name: "Philadelphia Eagles", team: "PHI", bye: 5 },
      { name: "Houston Texans", team: "HOU", bye: 14 },
      { name: "Kansas City Chiefs", team: "KC", bye: 10 },
      { name: "San Francisco 49ers", team: "SF", bye: 14 },
      { name: "Green Bay Packers", team: "GB", bye: 5 },
      { name: "Buffalo Bills", team: "BUF", bye: 7 },
      { name: "Detroit Lions", team: "DET", bye: 8 },
      { name: "Los Angeles Chargers", team: "LAC", bye: 8 },
      { name: "New York Jets", team: "NYJ", bye: 9 },
      { name: "Cleveland Browns", team: "CLE", bye: 9 },
      { name: "Seattle Seahawks", team: "SEA", bye: 8 },
      { name: "Dallas Cowboys", team: "DAL", bye: 10 },
    ],
  };

  // ADP base/step per position tier band — tuned so a sort-by-adp merge
  // produces a plausible overall snake-draft order.
  const ADP_CONFIG: Record<Position, { base: number; step: number; statTierEvery: number }> = {
    RB: { base: 1.0, step: 3.1, statTierEvery: 5 },
    WR: { base: 1.8, step: 2.7, statTierEvery: 6 },
    QB: { base: 20, step: 8.5, statTierEvery: 5 },
    TE: { base: 13, step: 11, statTierEvery: 3 },
    K: { base: 155, step: 6, statTierEvery: 6 },
    DEF: { base: 148, step: 6, statTierEvery: 6 },
  };

  const players: Player[] = [];
  let idCounter = 1;

  (Object.keys(pools) as Position[]).forEach((position) => {
    const pool = pools[position];
    const cfg = ADP_CONFIG[position];
    pool.forEach((entry, idx) => {
      const adp = Math.round((cfg.base + idx * cfg.step) * 10) / 10;
      const tier = Math.floor(idx / cfg.statTierEvery);
      const blurbSet = BLURB_TEMPLATES[position];
      const blurb = blurbSet[idx % blurbSet.length];
      players.push({
        id: `p${idCounter++}`,
        name: entry.name,
        position,
        nflTeam: entry.team,
        bye: entry.bye,
        adp,
        expertRank: 0, // filled below
        positionRank: idx + 1,
        blurb,
        projection: statLineForTier(position, tier),
      });
    });
  });

  players.sort((a, b) => a.adp - b.adp);
  players.forEach((p, idx) => {
    p.expertRank = idx + 1;
  });

  return players;
}

export const PLAYERS: Player[] = buildPlayers();

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function searchPlayers(query: string, limit = 15): Player[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PLAYERS.filter((p) => p.name.toLowerCase().includes(q))
    .sort((a, b) => a.adp - b.adp)
    .slice(0, limit);
}

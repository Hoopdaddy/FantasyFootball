import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LEAGUE_CONFIG, DraftedPlayer, LeagueConfig } from "./types";

interface DraftStore {
  leagueConfig: LeagueConfig;
  setupComplete: boolean;
  draftedPlayers: DraftedPlayer[];
  myRosterPlayerIds: string[];

  setLeagueConfig: (config: LeagueConfig) => void;
  completeSetup: () => void;
  resetSetup: () => void;

  addDraftedPlayer: (pick: DraftedPlayer) => void;
  addDraftedPlayers: (picks: DraftedPlayer[]) => void;
  removeDraftedPlayer: (playerId: string) => void;

  addToMyRoster: (playerId: string) => void;
  removeFromMyRoster: (playerId: string) => void;

  resetDraft: () => void;
}

export const useDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      leagueConfig: DEFAULT_LEAGUE_CONFIG,
      setupComplete: false,
      draftedPlayers: [],
      myRosterPlayerIds: [],

      setLeagueConfig: (config) => set({ leagueConfig: config }),
      completeSetup: () => set({ setupComplete: true }),
      resetSetup: () => set({ setupComplete: false }),

      addDraftedPlayer: (pick) => {
        const existing = get().draftedPlayers;
        if (existing.some((p) => p.playerId === pick.playerId)) return;
        set({ draftedPlayers: [...existing, pick] });
        if (pick.isMe) {
          const roster = get().myRosterPlayerIds;
          if (!roster.includes(pick.playerId)) {
            set({ myRosterPlayerIds: [...roster, pick.playerId] });
          }
        }
      },

      addDraftedPlayers: (picks) => {
        picks.forEach((pick) => get().addDraftedPlayer(pick));
      },

      removeDraftedPlayer: (playerId) => {
        set({
          draftedPlayers: get().draftedPlayers.filter((p) => p.playerId !== playerId),
          myRosterPlayerIds: get().myRosterPlayerIds.filter((id) => id !== playerId),
        });
      },

      addToMyRoster: (playerId) => {
        const roster = get().myRosterPlayerIds;
        if (!roster.includes(playerId)) {
          set({ myRosterPlayerIds: [...roster, playerId] });
        }
        const drafted = get().draftedPlayers;
        if (!drafted.some((p) => p.playerId === playerId)) {
          set({
            draftedPlayers: [
              ...drafted,
              { playerId, pickNumber: null, round: null, draftedByTeam: "ME", isMe: true },
            ],
          });
        } else {
          set({
            draftedPlayers: drafted.map((p) => (p.playerId === playerId ? { ...p, isMe: true, draftedByTeam: "ME" } : p)),
          });
        }
      },

      removeFromMyRoster: (playerId) => {
        set({ myRosterPlayerIds: get().myRosterPlayerIds.filter((id) => id !== playerId) });
      },

      resetDraft: () => set({ draftedPlayers: [], myRosterPlayerIds: [] }),
    }),
    { name: "ffl-draft-assistant" }
  )
);

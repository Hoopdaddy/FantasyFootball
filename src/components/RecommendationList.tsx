"use client";

import { useMemo, useState } from "react";
import { getPlayerById } from "@/lib/players";
import { getRecommendations } from "@/lib/recommend";
import { useDraftStore } from "@/lib/store";
import { POSITION_COLORS } from "@/lib/ui";

export default function RecommendationList({
  myTurnMode,
  onSelectPlayer,
}: {
  myTurnMode: boolean;
  onSelectPlayer: (id: string) => void;
}) {
  const leagueConfig = useDraftStore((s) => s.leagueConfig);
  const draftedPlayers = useDraftStore((s) => s.draftedPlayers);
  const myRosterPlayerIds = useDraftStore((s) => s.myRosterPlayerIds);
  const addToMyRoster = useDraftStore((s) => s.addToMyRoster);
  const addDraftedPlayer = useDraftStore((s) => s.addDraftedPlayer);
  const [overrideKD, setOverrideKD] = useState(false);

  const { recommendations, currentRound, runWarnings } = useMemo(
    () =>
      getRecommendations(leagueConfig, draftedPlayers, myRosterPlayerIds, {
        overrideKD,
        limit: myTurnMode ? 3 : 8,
      }),
    [leagueConfig, draftedPlayers, myRosterPlayerIds, overrideKD, myTurnMode]
  );

  function markMine(playerId: string) {
    addToMyRoster(playerId);
  }

  function markOther(playerId: string) {
    addDraftedPlayer({
      playerId,
      pickNumber: draftedPlayers.length + 1,
      round: currentRound,
      draftedByTeam: "Other",
      isMe: false,
    });
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">
          {myTurnMode ? "Your Best Picks Right Now" : "Recommended Picks"}
        </h2>
        <span className="text-xs text-slate-500">Round {currentRound} / {leagueConfig.numRounds}</span>
      </div>

      {!overrideKD && (
        <button
          className="mt-1 text-xs text-slate-500 underline hover:text-slate-300"
          onClick={() => setOverrideKD(true)}
        >
          Show K/DEF now anyway
        </button>
      )}

      {runWarnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {runWarnings.map((w) => (
            <p key={w} className="rounded-md border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              ⚠ {w}
            </p>
          ))}
        </div>
      )}

      {recommendations.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No eligible recommendations right now.</p>
      )}

      <div className={`mt-3 space-y-3 ${myTurnMode ? "" : ""}`}>
        {recommendations.map((rec, idx) => {
          const player = getPlayerById(rec.playerId);
          if (!player) return null;
          return (
            <div
              key={rec.playerId}
              className={`rounded-xl border p-4 ${
                idx === 0 ? "border-emerald-600/60 bg-emerald-500/5" : "border-slate-800 bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button className="text-left" onClick={() => onSelectPlayer(player.id)}>
                  <div className="flex items-center gap-2">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${POSITION_COLORS[player.position]}`}>
                      {player.position}
                    </span>
                    <span className={`font-bold text-slate-50 ${myTurnMode ? "text-lg" : "text-base"}`}>
                      {player.name}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {player.nflTeam} · Bye {player.bye} · VORP {rec.vorp > 0 ? "+" : ""}
                    {rec.vorp}
                  </p>
                </button>
                <div className="flex flex-col items-end gap-1">
                  {rec.isBestFit && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Best Fit
                    </span>
                  )}
                  {rec.isBestPureValue && !rec.isBestFit && (
                    <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Best Value
                    </span>
                  )}
                </div>
              </div>

              <ul className="mt-2 space-y-0.5">
                {rec.reasons.slice(0, myTurnMode ? 2 : 3).map((r, i) => (
                  <li key={i} className="text-xs text-slate-400">
                    • {r}
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => markMine(player.id)}
                  className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  I took him
                </button>
                <button
                  onClick={() => markOther(player.id)}
                  className="flex-1 rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-500"
                >
                  Someone else took him
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

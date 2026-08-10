"use client";

import { getPlayerById } from "@/lib/players";
import { projectedPoints, projectedPointsPerGame } from "@/lib/scoring";
import { useDraftStore } from "@/lib/store";
import { POSITION_COLORS } from "@/lib/ui";

export default function PlayerDetailModal({
  playerId,
  onClose,
}: {
  playerId: string;
  onClose: () => void;
}) {
  const player = getPlayerById(playerId);
  const scoring = useDraftStore((s) => s.leagueConfig.scoring);
  if (!player) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-slate-800 bg-slate-900 p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${POSITION_COLORS[player.position]}`}>
                {player.position}
              </span>
              <h2 className="text-xl font-bold text-slate-50">{player.name}</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {player.nflTeam} · Bye {player.bye} · ADP {player.adp} · Rank #{player.expertRank} overall (#{player.positionRank} {player.position})
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-800 p-3">
            <p className="text-xs uppercase text-slate-400">Proj. season pts</p>
            <p className="text-2xl font-bold text-emerald-400">{projectedPoints(player, scoring)}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-3">
            <p className="text-xs uppercase text-slate-400">Proj. pts / game</p>
            <p className="text-2xl font-bold text-emerald-400">{projectedPointsPerGame(player, scoring)}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs uppercase text-slate-400">Expert consensus</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-200">{player.blurb}</p>
        </div>
      </div>
    </div>
  );
}

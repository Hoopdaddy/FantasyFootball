"use client";

import { useState } from "react";
import { getPlayerById } from "@/lib/players";
import { useDraftStore } from "@/lib/store";
import { POSITION_COLORS } from "@/lib/ui";

export default function DraftedList() {
  const [open, setOpen] = useState(false);
  const draftedPlayers = useDraftStore((s) => s.draftedPlayers);
  const removeDraftedPlayer = useDraftStore((s) => s.removeDraftedPlayer);

  const sorted = [...draftedPlayers].sort((a, b) => (b.pickNumber ?? 0) - (a.pickNumber ?? 0));

  return (
    <section>
      <button
        className="flex w-full items-center justify-between text-left text-lg font-semibold text-slate-100"
        onClick={() => setOpen((v) => !v)}
      >
        All Drafted Players ({draftedPlayers.length})
        <span className="text-sm text-emerald-400">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="mt-2 max-h-96 divide-y divide-slate-800 overflow-y-auto rounded-md border border-slate-800 bg-slate-900">
          {sorted.length === 0 && <p className="px-3 py-3 text-sm text-slate-500">No picks logged yet.</p>}
          {sorted.map((dp) => {
            const player = getPlayerById(dp.playerId);
            if (!player) return null;
            return (
              <div key={dp.playerId} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${POSITION_COLORS[player.position]}`}>
                    {player.position}
                  </span>
                  <span className="text-sm text-slate-100">{player.name}</span>
                  {dp.isMe && <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">ME</span>}
                  {dp.draftedByTeam && !dp.isMe && (
                    <span className="text-xs text-slate-500">{dp.draftedByTeam}</span>
                  )}
                </div>
                <button
                  onClick={() => removeDraftedPlayer(dp.playerId)}
                  className="text-xs text-slate-500 hover:text-red-400"
                  title="Undo this pick"
                >
                  Undo
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

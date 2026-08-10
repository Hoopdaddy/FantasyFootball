"use client";

import { useState } from "react";
import { searchPlayers } from "@/lib/players";
import { useDraftStore } from "@/lib/store";
import { POSITION_COLORS } from "@/lib/ui";

export default function ManualAddPlayer() {
  const [query, setQuery] = useState("");
  const draftedPlayers = useDraftStore((s) => s.draftedPlayers);
  const addToMyRoster = useDraftStore((s) => s.addToMyRoster);
  const addDraftedPlayer = useDraftStore((s) => s.addDraftedPlayer);

  const draftedIds = new Set(draftedPlayers.map((d) => d.playerId));
  const results = searchPlayers(query).filter((p) => !draftedIds.has(p.id));

  function addMine(id: string) {
    addToMyRoster(id);
    setQuery("");
  }

  function addOther(id: string) {
    addDraftedPlayer({
      playerId: id,
      pickNumber: draftedPlayers.length + 1,
      round: null,
      draftedByTeam: "Other",
      isMe: false,
    });
    setQuery("");
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-100">Manual Correction / Add</h2>
      <p className="mt-1 text-xs text-slate-500">
        Search the full player database to fix a misread or log a pick without a screenshot.
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search player name…"
        className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
      />
      {results.length > 0 && (
        <div className="mt-2 divide-y divide-slate-800 rounded-md border border-slate-800 bg-slate-900">
          {results.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${POSITION_COLORS[p.position]}`}>
                  {p.position}
                </span>
                <span className="text-sm text-slate-100">{p.name}</span>
                <span className="text-xs text-slate-500">{p.nflTeam}</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => addMine(p.id)}
                  className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
                >
                  Mine
                </button>
                <button
                  onClick={() => addOther(p.id)}
                  className="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:border-slate-500"
                >
                  Other
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

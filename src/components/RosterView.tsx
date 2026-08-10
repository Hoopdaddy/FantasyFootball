"use client";

import { getPlayerById } from "@/lib/players";
import { useDraftStore } from "@/lib/store";
import { Player, Position } from "@/lib/types";
import { POSITION_COLORS } from "@/lib/ui";

const FLEX_ELIGIBLE: Position[] = ["RB", "WR", "TE"];

interface SlotAssignment {
  label: string;
  player: Player | null;
}

function assignSlots(myRoster: Player[], slots: ReturnType<typeof useDraftStore.getState>["leagueConfig"]["rosterSlots"]): SlotAssignment[] {
  const remaining = [...myRoster];
  const assignments: SlotAssignment[] = [];

  function takeOne(position: Position): Player | null {
    const idx = remaining.findIndex((p) => p.position === position);
    if (idx === -1) return null;
    return remaining.splice(idx, 1)[0];
  }

  function takeFlex(): Player | null {
    const idx = remaining.findIndex((p) => FLEX_ELIGIBLE.includes(p.position));
    if (idx === -1) return null;
    return remaining.splice(idx, 1)[0];
  }

  (["QB", "RB", "WR", "TE", "K", "DEF"] as Position[]).forEach((pos) => {
    for (let i = 0; i < slots[pos]; i++) {
      assignments.push({ label: pos, player: takeOne(pos) });
    }
  });
  for (let i = 0; i < slots.FLEX; i++) {
    assignments.push({ label: "FLEX", player: takeFlex() });
  }
  for (let i = 0; i < slots.BENCH; i++) {
    assignments.push({ label: "BENCH", player: remaining.shift() ?? null });
  }
  // Any leftover overflow (shouldn't normally happen) still shows as extra bench.
  remaining.forEach((p) => assignments.push({ label: "BENCH+", player: p }));

  return assignments;
}

export default function RosterView() {
  const myRosterPlayerIds = useDraftStore((s) => s.myRosterPlayerIds);
  const rosterSlots = useDraftStore((s) => s.leagueConfig.rosterSlots);
  const removeFromMyRoster = useDraftStore((s) => s.removeFromMyRoster);

  const myRoster = myRosterPlayerIds
    .map((id) => getPlayerById(id))
    .filter((p): p is Player => Boolean(p));
  const slots = assignSlots(myRoster, rosterSlots);

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-100">My Roster</h2>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {slots.map((slot, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-xs font-semibold uppercase text-slate-500">{slot.label}</span>
              {slot.player ? (
                <div className="flex items-center gap-2">
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${POSITION_COLORS[slot.player.position]}`}>
                    {slot.player.position}
                  </span>
                  <span className="text-sm text-slate-100">{slot.player.name}</span>
                </div>
              ) : (
                <span className="text-sm text-slate-600">Empty</span>
              )}
            </div>
            {slot.player && (
              <button
                className="text-xs text-slate-500 hover:text-red-400"
                onClick={() => removeFromMyRoster(slot.player!.id)}
                title="Undo — remove from my roster"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

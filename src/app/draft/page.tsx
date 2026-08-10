"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DraftedList from "@/components/DraftedList";
import ManualAddPlayer from "@/components/ManualAddPlayer";
import PlayerDetailModal from "@/components/PlayerDetailModal";
import RecommendationList from "@/components/RecommendationList";
import RosterView from "@/components/RosterView";
import ScreenshotUpload from "@/components/ScreenshotUpload";
import { useDraftStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

export default function DraftPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const setupComplete = useDraftStore((s) => s.setupComplete);
  const resetDraft = useDraftStore((s) => s.resetDraft);
  const draftedCount = useDraftStore((s) => s.draftedPlayers.length);

  const [myTurnMode, setMyTurnMode] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (hydrated && !setupComplete) router.replace("/setup");
  }, [hydrated, setupComplete, router]);

  if (!hydrated || !setupComplete) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-50">Draft Board</h1>
          <p className="text-xs text-slate-500">{draftedCount} picks logged</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/setup" className="text-xs text-slate-400 underline hover:text-slate-200">
            League Settings
          </Link>
          {confirmReset ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  resetDraft();
                  setConfirmReset(false);
                }}
                className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white"
              >
                Confirm reset
              </button>
              <button onClick={() => setConfirmReset(false)} className="text-xs text-slate-400">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="text-xs text-slate-500 underline hover:text-red-400">
              Reset draft
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => setMyTurnMode((v) => !v)}
        className={`mt-4 w-full rounded-xl px-4 py-4 text-center text-lg font-bold transition ${
          myTurnMode ? "bg-emerald-600 text-white" : "border border-emerald-600 text-emerald-400"
        }`}
      >
        {myTurnMode ? "✓ My Turn Mode — Big Picks Below" : "It's My Turn"}
      </button>

      <div className="mt-6 space-y-8">
        <RecommendationList myTurnMode={myTurnMode} onSelectPlayer={setSelectedPlayerId} />

        {!myTurnMode && (
          <>
            <ScreenshotUpload />
            <RosterView />
            <ManualAddPlayer />
            <DraftedList />
          </>
        )}
      </div>

      {selectedPlayerId && (
        <PlayerDetailModal playerId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />
      )}
    </main>
  );
}

"use client";

import { useRef, useState } from "react";
import { searchPlayers } from "@/lib/players";
import { useDraftStore } from "@/lib/store";
import { POSITION_COLORS } from "@/lib/ui";
import { Position } from "@/lib/types";

interface ReviewPick {
  key: string;
  rawName: string;
  rawPosition: string | null;
  pickNumber: number | null;
  round: number | null;
  draftedByTeam: string | null;
  matchedPlayerId: string | null;
  matchedPlayerName: string | null;
  confidence: number;
  isMe: boolean;
  include: boolean;
  searchOpen: boolean;
}

export default function ScreenshotUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picks, setPicks] = useState<ReviewPick[]>([]);
  const draftedPlayers = useDraftStore((s) => s.draftedPlayers);
  const addDraftedPlayers = useDraftStore((s) => s.addDraftedPlayers);
  const draftedIds = new Set(draftedPlayers.map((d) => d.playerId));

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setPicks([]);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/parse-screenshot", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to parse screenshot.");
        return;
      }
      const newPicks: ReviewPick[] = (data.picks ?? []).map(
        (
          p: {
            rawName: string;
            rawPosition: string | null;
            pickNumber: number | null;
            round: number | null;
            draftedByTeam: string | null;
            matchedPlayerId: string | null;
            matchedPlayerName: string | null;
            confidence: number;
          },
          idx: number
        ) => ({
          key: `${idx}-${p.rawName}`,
          rawName: p.rawName,
          rawPosition: p.rawPosition,
          pickNumber: p.pickNumber,
          round: p.round,
          draftedByTeam: p.draftedByTeam,
          matchedPlayerId: p.matchedPlayerId,
          matchedPlayerName: p.matchedPlayerName,
          confidence: p.confidence,
          isMe: false,
          include: Boolean(p.matchedPlayerId) && !draftedIds.has(p.matchedPlayerId as string),
          searchOpen: !p.matchedPlayerId || p.confidence < 0.75,
        })
      );
      setPicks(newPicks);
      if (newPicks.length === 0) {
        setError("No drafted players were detected in that screenshot. Try a clearer crop, or add picks manually below.");
      }
    } catch {
      setError("Something went wrong parsing that screenshot.");
    } finally {
      setLoading(false);
    }
  }

  function updatePick(key: string, patch: Partial<ReviewPick>) {
    setPicks((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  function confirmAll() {
    const toAdd = picks
      .filter((p) => p.include && p.matchedPlayerId)
      .map((p) => ({
        playerId: p.matchedPlayerId as string,
        pickNumber: p.pickNumber,
        round: p.round,
        draftedByTeam: p.isMe ? "ME" : p.draftedByTeam,
        isMe: p.isMe,
      }));
    addDraftedPlayers(toAdd);
    setPicks([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-100">Screenshot the Draft Board</h2>
      <p className="mt-1 text-xs text-slate-500">Upload after each round — new picks are added to what&apos;s already tracked.</p>

      <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-900 px-4 py-8 text-center hover:border-emerald-600">
        <span className="text-sm text-slate-300">{loading ? "Parsing screenshot…" : "Tap to upload or paste a screenshot"}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {picks.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-slate-300">
            Confirm what was detected ({picks.filter((p) => p.include).length} will be added):
          </p>
          {picks.map((p) => (
            <div key={p.key} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={p.include}
                    onChange={(e) => updatePick(p.key, { include: e.target.checked })}
                  />
                  <div>
                    <p className="text-sm text-slate-100">
                      {p.matchedPlayerName ?? p.rawName}{" "}
                      {p.matchedPlayerId && p.matchedPlayerName !== p.rawName && (
                        <span className="text-xs text-slate-500">(read as &quot;{p.rawName}&quot;)</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.round ? `Round ${p.round} · ` : ""}
                      {p.pickNumber ? `Pick ${p.pickNumber} · ` : ""}
                      {p.draftedByTeam ?? "Team unknown"}
                      {!p.matchedPlayerId && <span className="text-amber-400"> · No confident match</span>}
                    </p>
                  </div>
                </div>
                <button
                  className="shrink-0 text-xs text-slate-500 underline hover:text-slate-300"
                  onClick={() => updatePick(p.key, { searchOpen: !p.searchOpen })}
                >
                  {p.searchOpen ? "Close" : "Fix"}
                </button>
              </div>

              <label className="mt-2 flex items-center gap-2 pl-6 text-xs text-slate-400">
                <input type="checkbox" checked={p.isMe} onChange={(e) => updatePick(p.key, { isMe: e.target.checked })} />
                This is my pick
              </label>

              {p.searchOpen && (
                <PickCorrectionSearch
                  positionHint={(p.rawPosition as Position) ?? undefined}
                  onSelect={(id, name) => updatePick(p.key, { matchedPlayerId: id, matchedPlayerName: name, include: true, searchOpen: false })}
                />
              )}
            </div>
          ))}
          <button
            onClick={confirmAll}
            className="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Confirm & Add to Draft
          </button>
        </div>
      )}
    </section>
  );
}

function PickCorrectionSearch({
  positionHint,
  onSelect,
}: {
  positionHint?: Position;
  onSelect: (id: string, name: string) => void;
}) {
  const [q, setQ] = useState("");
  const results = searchPlayers(q).filter((p) => !positionHint || p.position === positionHint);

  return (
    <div className="mt-2 pl-6">
      <input
        autoFocus
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search correct player…"
        className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
      />
      {results.length > 0 && (
        <div className="mt-1 divide-y divide-slate-800 rounded-md border border-slate-800">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id, r.name)}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-slate-800"
            >
              <span className={`rounded border px-1 py-0.5 text-[9px] font-semibold ${POSITION_COLORS[r.position]}`}>
                {r.position}
              </span>
              <span className="text-xs text-slate-200">{r.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import NumberInput from "@/components/NumberInput";
import { usePasteImage } from "@/lib/usePasteImage";

interface DraftBasics {
  numTeams: number;
  draftPosition: number;
  numRounds: number;
}

export default function DraftBasicsUpload({
  value,
  onChange,
}: {
  value: DraftBasics;
  onChange: (patch: Partial<DraftBasics>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<{ numTeams: boolean; draftPosition: boolean; numRounds: boolean } | null>(
    null
  );

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/parse-draft-basics", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to read that screenshot.");
        return;
      }
      const patch: Partial<DraftBasics> = {};
      if (typeof data.numTeams === "number") patch.numTeams = data.numTeams;
      if (typeof data.draftPosition === "number") patch.draftPosition = data.draftPosition;
      if (typeof data.numRounds === "number") patch.numRounds = data.numRounds;
      onChange(patch);
      setDetected({
        numTeams: typeof data.numTeams === "number",
        draftPosition: typeof data.draftPosition === "number",
        numRounds: typeof data.numRounds === "number",
      });
      if (!data.numTeams && !data.draftPosition && !data.numRounds) {
        setError("Couldn't confidently read teams/position/rounds from that image — check the numbers below and fix anything wrong.");
      }
    } catch {
      setError("Something went wrong reading that screenshot.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  usePasteImage(handleFile, !loading);

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-950 px-4 py-6 text-center hover:border-emerald-600">
        <span className="text-sm text-slate-300">
          {loading ? "Reading draft board…" : "Upload a screenshot of the empty draft board"}
        </span>
        <span className="mt-1 text-xs text-slate-500">
          Most platforms show the full team × round grid before the draft starts — that&apos;s the best shot to use here. Or press Ctrl+V to paste one from Snipping Tool.
        </span>
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

      {error && <p className="mt-2 text-xs text-amber-400">{error}</p>}

      <p className="mt-3 text-xs text-slate-500">
        {detected ? "Detected values below — double-check them, especially your draft position." : "Confirm or edit these manually:"}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <div>
          <NumberInput
            label="Teams"
            value={value.numTeams}
            min={2}
            max={20}
            onChange={(v) => onChange({ numTeams: v })}
          />
          {detected && !detected.numTeams && <p className="mt-1 text-[10px] text-amber-400">Not detected</p>}
        </div>
        <div>
          <NumberInput
            label="Your position"
            value={value.draftPosition}
            min={1}
            max={value.numTeams}
            onChange={(v) => onChange({ draftPosition: v })}
          />
          {detected && !detected.draftPosition && <p className="mt-1 text-[10px] text-amber-400">Not detected</p>}
        </div>
        <div>
          <NumberInput
            label="Rounds"
            value={value.numRounds}
            min={1}
            max={30}
            onChange={(v) => onChange({ numRounds: v })}
          />
          {detected && !detected.numRounds && <p className="mt-1 text-[10px] text-amber-400">Not detected</p>}
        </div>
      </div>
    </div>
  );
}

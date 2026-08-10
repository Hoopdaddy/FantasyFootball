"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import NumberInput from "@/components/NumberInput";
import { useDraftStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { LeagueConfig, ScoringSettings } from "@/lib/types";

const SCORING_GROUPS: { title: string; fields: { key: keyof ScoringSettings; label: string }[] }[] = [
  {
    title: "Passing",
    fields: [
      { key: "passYardsPerPoint", label: "Pass yards per 1 pt" },
      { key: "passTdPoints", label: "Pass TD" },
      { key: "passTwoPtPoints", label: "Pass 2-pt conversion" },
      { key: "interceptionPoints", label: "Interception thrown" },
    ],
  },
  {
    title: "Rushing",
    fields: [
      { key: "rushYardsPerPoint", label: "Rush yards per 1 pt" },
      { key: "rushTdPoints", label: "Rush TD" },
      { key: "rushTwoPtPoints", label: "Rush 2-pt conversion" },
    ],
  },
  {
    title: "Receiving",
    fields: [
      { key: "receptionPoints", label: "Per reception" },
      { key: "recYardsPerPoint", label: "Rec yards per 1 pt" },
      { key: "recTdPoints", label: "Receiving TD" },
      { key: "recTwoPtPoints", label: "Rec 2-pt conversion" },
    ],
  },
  {
    title: "Kicking",
    fields: [
      { key: "fg0to39", label: "FG 0-39 yds" },
      { key: "fg40to49", label: "FG 40-49 yds" },
      { key: "fg50to59", label: "FG 50-59 yds" },
      { key: "fg60plus", label: "FG 60+ yds" },
      { key: "patPoints", label: "PAT made" },
      { key: "missedFgPoints", label: "Missed FG (any range)" },
    ],
  },
  {
    title: "Defense / Team",
    fields: [
      { key: "defTdPoints", label: "Defensive TD" },
      { key: "pointsAllowed0", label: "Points allowed: 0" },
      { key: "pointsAllowed1to6", label: "Points allowed: 1-6" },
      { key: "pointsAllowed7to13", label: "Points allowed: 7-13" },
      { key: "pointsAllowed14to20", label: "Points allowed: 14-20" },
      { key: "pointsAllowed21to27", label: "Points allowed: 21-27" },
      { key: "pointsAllowed28to34", label: "Points allowed: 28-34" },
      { key: "pointsAllowed35plus", label: "Points allowed: 35+" },
      { key: "sackPoints", label: "Sack" },
      { key: "defInterceptionPoints", label: "Interception" },
      { key: "fumbleRecoveryPoints", label: "Fumble recovery" },
      { key: "safetyPoints", label: "Safety" },
      { key: "forcedFumblePoints", label: "Forced fumble" },
      { key: "blockedKickPoints", label: "Blocked kick" },
    ],
  },
  {
    title: "Special Teams (Def & Player)",
    fields: [
      { key: "specialTeamsTdPoints", label: "Return / ST TD" },
      { key: "specialTeamsForcedFumblePoints", label: "ST forced fumble" },
      { key: "specialTeamsFumbleRecoveryPoints", label: "ST fumble recovery" },
    ],
  },
  {
    title: "Misc",
    fields: [
      { key: "fumbleLostPoints", label: "Fumble lost" },
      { key: "fumbleRecoveryTdPoints", label: "Fumble recovery TD" },
    ],
  },
];

export default function SetupPage() {
  const hydrated = useHydrated();
  const storeConfig = useDraftStore((s) => s.leagueConfig);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 text-slate-500">
        Loading your league settings…
      </main>
    );
  }

  return <SetupForm initialConfig={storeConfig} />;
}

function SetupForm({ initialConfig }: { initialConfig: LeagueConfig }) {
  const router = useRouter();
  const setLeagueConfig = useDraftStore((s) => s.setLeagueConfig);
  const completeSetup = useDraftStore((s) => s.completeSetup);

  const [config, setConfig] = useState<LeagueConfig>(initialConfig);
  const [showScoring, setShowScoring] = useState(false);

  function updateSlot(key: keyof LeagueConfig["rosterSlots"], value: number) {
    setConfig((c) => ({ ...c, rosterSlots: { ...c.rosterSlots, [key]: value } }));
  }

  function updateScoring(key: keyof ScoringSettings, value: number) {
    setConfig((c) => ({ ...c, scoring: { ...c.scoring, [key]: value } }));
  }

  function handleSubmit() {
    setLeagueConfig(config);
    completeSetup();
    router.push("/draft");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold text-slate-50">League Setup</h1>
      <p className="mt-1 text-sm text-slate-400">
        Pre-populated with your league defaults. Edit anything before the draft.
      </p>

      <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Draft Basics</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NumberInput label="Number of teams" value={config.numTeams} min={2} max={20}
            onChange={(v) => setConfig((c) => ({ ...c, numTeams: v }))} />
          <NumberInput label="Your draft position" value={config.draftPosition} min={1} max={config.numTeams}
            onChange={(v) => setConfig((c) => ({ ...c, draftPosition: v }))} />
          <NumberInput label="Number of rounds" value={config.numRounds} min={1} max={30}
            onChange={(v) => setConfig((c) => ({ ...c, numRounds: v }))} />
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Roster Slots</h2>
        <p className="mt-1 text-xs text-slate-500">TE, K, and DEF are hard-capped at 1 per roster.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumberInput label="QB" value={config.rosterSlots.QB} min={0} onChange={(v) => updateSlot("QB", v)} />
          <NumberInput label="RB" value={config.rosterSlots.RB} min={0} onChange={(v) => updateSlot("RB", v)} />
          <NumberInput label="WR" value={config.rosterSlots.WR} min={0} onChange={(v) => updateSlot("WR", v)} />
          <NumberInput label="TE (max 1)" value={config.rosterSlots.TE} min={0} max={1} onChange={(v) => updateSlot("TE", Math.min(1, v))} />
          <NumberInput label="FLEX" value={config.rosterSlots.FLEX} min={0} onChange={(v) => updateSlot("FLEX", v)} />
          <NumberInput label="K (max 1)" value={config.rosterSlots.K} min={0} max={1} onChange={(v) => updateSlot("K", Math.min(1, v))} />
          <NumberInput label="DEF (max 1)" value={config.rosterSlots.DEF} min={0} max={1} onChange={(v) => updateSlot("DEF", Math.min(1, v))} />
          <NumberInput label="Bench" value={config.rosterSlots.BENCH} min={0} onChange={(v) => updateSlot("BENCH", v)} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={config.benchTeToggle}
            onChange={(e) => setConfig((c) => ({ ...c, benchTeToggle: e.target.checked }))}
          />
          Allow recommending a 2nd TE for bench once starting TE slot is filled
        </label>
      </section>

      <section className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left text-lg font-semibold text-slate-100"
          onClick={() => setShowScoring((v) => !v)}
        >
          Scoring Settings
          <span className="text-sm text-emerald-400">{showScoring ? "Hide" : "Edit"}</span>
        </button>
        {showScoring && (
          <div className="mt-4 space-y-5">
            {SCORING_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{group.title}</h3>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {group.fields.map((f) => (
                    <NumberInput
                      key={f.key}
                      label={f.label}
                      value={config.scoring[f.key]}
                      step={0.1}
                      onChange={(v) => updateScoring(f.key, v)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 text-center text-base font-semibold text-white hover:bg-emerald-500"
      >
        Save & Start Draft
      </button>
    </main>
  );
}

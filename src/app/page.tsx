"use client";

import Link from "next/link";
import { useDraftStore } from "@/lib/store";

export default function Home() {
  const setupComplete = useDraftStore((s) => s.setupComplete);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">
        🏈 Draft Assistant
      </h1>
      <p className="mt-3 max-w-md text-slate-400">
        Screenshot your draft board, confirm what&apos;s on it, and get your next pick — ranked and reasoned for your roster.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link
          href={setupComplete ? "/draft" : "/setup"}
          className="rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-500"
        >
          {setupComplete ? "Go to Draft Board" : "Set Up League"}
        </Link>
        {setupComplete && (
          <Link
            href="/setup"
            className="rounded-lg border border-slate-700 px-4 py-3 text-base font-medium text-slate-300 hover:border-slate-500"
          >
            Edit League Settings
          </Link>
        )}
      </div>
    </main>
  );
}

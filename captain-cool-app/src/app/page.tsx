"use client";

import { useState } from "react";
import MatchInputForm from "@/components/MatchInputForm";
import AgentDebatePanel from "@/components/AgentDebatePanel";
import HeroSection from "@/components/HeroSection";
import SachinLiveDashboard from "@/components/SachinLiveDashboard";
import HypeManPanel from "@/components/HypeManPanel";
import { AnalysisResult, MatchState } from "@/types";

type AppMode = "sachin" | "strategist" | "hype";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>("sachin");

  const handleAnalyze = async (matchState: MatchState) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchState }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.details || "Analysis failed");
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { key: "sachin" as const, label: "🏏 Sachin LIVE", gradient: "from-orange-600 to-yellow-600", shadow: "shadow-orange-500/25" },
    { key: "strategist" as const, label: "🧠 Captain Strategist", gradient: "from-blue-600 to-purple-600", shadow: "shadow-blue-500/25" },
    { key: "hype" as const, label: "🎙️ Hype-Man", gradient: "from-fuchsia-600 to-orange-600", shadow: "shadow-fuchsia-500/25" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1420] to-[#0a0a0f]">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/[0.06] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/[0.06] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/[0.04] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        <HeroSection />

        {/* ── Mode Switcher ── */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="flex justify-center">
            <div className="inline-flex bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1.5 gap-1">
              {modes.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mode === m.key
                      ? `bg-gradient-to-r ${m.gradient} text-white shadow-lg ${m.shadow} mode-btn-active`
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          {/* ── SACHIN LIVE MODE ── */}
          {mode === "sachin" && <SachinLiveDashboard />}

          {/* ── HYPE-MAN MODE ── */}
          {mode === "hype" && <HypeManPanel />}

          {/* ── CAPTAIN STRATEGIST MODE ── */}
          {mode === "strategist" && (
            <>
              <MatchInputForm onAnalyze={handleAnalyze} loading={loading} />

              {error && (
                <div className="mt-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold">Analysis Failed</p>
                      <p className="text-sm opacity-80">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {result && <AgentDebatePanel result={result} />}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-slate-600 text-xs">
            Built with 🏏 using Google Gemini 2.5 Flash · Multi-Agent AI · Function Calling · Web Speech API
          </p>
          <p className="text-slate-700 text-[10px] mt-1">
            Captain Cool — APL 2026 Submission
          </p>
        </footer>
      </div>
    </main>
  );
}

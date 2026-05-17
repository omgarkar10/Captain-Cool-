"use client";

import { useState } from "react";
import MatchInputForm from "@/components/MatchInputForm";
import AgentDebatePanel from "@/components/AgentDebatePanel";
import HeroSection from "@/components/HeroSection";
import HypeManPanel from "@/components/HypeManPanel";
import { AnalysisResult, MatchState } from "@/types";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (!response.ok) {
        throw new Error(data.error || data.details || "Analysis failed");
      }

      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f1420] to-[#0a0a0f]">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 pb-20">
          {/* Live Hype-Man Mode */}
          <HypeManPanel />

          {/* Input Form */}
          <MatchInputForm onAnalyze={handleAnalyze} loading={loading} />

          {/* Error */}
          {error && (
            <div className="mt-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Agent Debate Results */}
          {result && <AgentDebatePanel result={result} />}
        </div>
      </div>
    </main>
  );
}

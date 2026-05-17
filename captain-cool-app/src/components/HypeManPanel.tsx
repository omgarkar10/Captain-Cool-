"use client";

import { useState, useRef, useEffect } from "react";

interface HypeResponse {
  commentary: string;
  screen_alert: string;
  image_prompt: string;
  intensity?: number;
}

export default function HypeManPanel() {
  const [feedText, setFeedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hypeData, setHypeData] = useState<HypeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = (text: string) => {
    if (!synthRef.current) return;
    
    // Stop any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find an Indian English voice for the authentic vibe
    const voices = synthRef.current.getVoices();
    const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    
    utterance.rate = 1.2; // Speak fast and hyped
    utterance.pitch = 1.3; // High energy pitch
    
    synthRef.current.speak(utterance);
  };

  const generateHype = async () => {
    if (!feedText.trim()) return;
    
    setLoading(true);
    setError(null);
    setHypeData(null);
    
    if (synthRef.current) {
        synthRef.current.cancel();
    }

    try {
      const res = await fetch("/api/hype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ live_text_feed: feedText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get hype");

      setHypeData(data.data);
      // Speak the commentary automatically when it arrives
      if (data.data && data.data.commentary) {
        speak(data.data.commentary);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-16 bg-[#0f1420]/80 border border-fuchsia-500/30 rounded-3xl p-1 relative overflow-hidden shadow-2xl shadow-fuchsia-500/10">
      {/* Glitch / Hype Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/10 via-transparent to-orange-500/10 pointer-events-none" />
      
      {hypeData && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 via-yellow-400 to-orange-500 animate-pulse" />
      )}

      <div className="bg-[#0a0a0f] rounded-[22px] p-6 md:p-10 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <span className="bg-gradient-to-r from-fuchsia-500 to-orange-500 bg-clip-text text-transparent animate-pulse">
                🎙️ Live Hype-Man Mode
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-red-500 text-white rounded font-bold animate-pulse tracking-widest">LIVE</span>
            </h2>
            <p className="text-slate-400 mt-2 font-medium">
              Feed the AI a live match event and hear the spicy Hinglish commentary!
            </p>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={() => setFeedText("Dhoni hits a massive 100-meter six out of the stadium on the final ball to win the match!")}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono text-slate-300 transition-colors border border-white/10"
             >
                Test: Dhoni Six
             </button>
             <button 
                onClick={() => setFeedText("Virat Kohli gets out on zero. Absolute silence in Chinnaswamy.")}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-mono text-slate-300 transition-colors border border-white/10"
             >
                Test: Kohli Duck
             </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            value={feedText}
            onChange={(e) => setFeedText(e.target.value)}
            placeholder="E.g. Bumrah bowls a 150kmph yorker to rip out the middle stump!"
            className="flex-1 bg-white/5 border border-fuchsia-500/20 focus:border-fuchsia-500/50 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none transition-all font-mono text-sm"
            onKeyDown={(e) => e.key === "Enter" && generateHype()}
          />
          <button
            onClick={generateHype}
            disabled={loading || !feedText}
            className={`px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-all
              ${loading || !feedText 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-fuchsia-600 to-orange-600 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(217,70,239,0.4)]"
              }
            `}
          >
            {loading ? "Hyping..." : "Go Wild 🚨"}
          </button>
        </div>

        {error && (
          <div className="text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20 mb-6 font-mono text-sm">
            Error: {error}
          </div>
        )}

        {hypeData && (
          <div className="animate-fade-in-up space-y-8">
            {/* Massive Screen Alert */}
            <div className="text-center py-10 bg-black/50 rounded-2xl border border-white/5 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 uppercase tracking-tighter mix-blend-screen drop-shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse">
                 {hypeData.screen_alert}
               </h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Audio Commentary */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/20 p-6 rounded-2xl border border-indigo-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-indigo-300 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                    <span>🔊</span> Spicy Commentary
                  </h3>
                  <button 
                    onClick={() => speak(hypeData.commentary)}
                    className="p-2 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-full transition-colors text-indigo-300"
                    title="Replay Audio"
                  >
                    ▶️
                  </button>
                </div>
                <p className="text-xl md:text-2xl font-bold text-white leading-relaxed italic">
                  "{hypeData.commentary}"
                </p>
                {hypeData.intensity && (
                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-xs text-slate-400 uppercase font-bold">Hype Level:</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
                        style={{ width: `${(hypeData.intensity / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-white font-black text-lg">{hypeData.intensity}/10</span>
                  </div>
                )}
              </div>

              {/* Imagen Prompt */}
              <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 p-6 rounded-2xl border border-emerald-500/30">
                <h3 className="text-emerald-300 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-4">
                  <span>🎨</span> Imagen 3 Prompt
                </h3>
                <p className="text-slate-300 font-mono text-sm leading-relaxed mb-4">
                  {hypeData.image_prompt}
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-400/70 font-mono bg-emerald-950/50 p-2 rounded">
                  <span>ℹ️</span>
                  <span>Feed this to Google Imagen 3 for a spectacular live graphic.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

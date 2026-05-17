"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface LiveMatchData {
  matchTitle: string;
  team1: string;
  team2: string;
  score: string;
  status: string;
  currentBatsmen: string[];
  currentBowler: string;
  recentBalls: string;
  lastWicket: string;
  runRate: string;
  overs: string;
  commentary: string[];
  raw: string;
}

interface SachinResponse {
  commentary: string;
  mood: string;
  avatar_state: string;
  intensity: number;
  meme: string;
  sachin_memory: string;
  tactical_take: string;
}

const AVATAR_STATES: Record<string, { emoji: string; label: string }> = {
  jumping: { emoji: "🤩", label: "ECSTATIC" },
  clapping: { emoji: "👏", label: "APPLAUDING" },
  thinking: { emoji: "🤔", label: "ANALYZING" },
  shocked: { emoji: "😱", label: "SHOCKED" },
  head_in_hands: { emoji: "🤦", label: "DISMAYED" },
  standing_ovation: { emoji: "🙌", label: "STANDING OVATION" },
  talking: { emoji: "🗣️", label: "COMMENTATING" },
  watching: { emoji: "👀", label: "WATCHING" },
};

const MOOD_THEMES: Record<string, { gradient: string; border: string; text: string; glow: string; ring: string }> = {
  ecstatic:   { gradient: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-500/40", text: "text-yellow-400", glow: "shadow-yellow-500/25", ring: "#facc15" },
  excited:    { gradient: "from-green-500/20 to-emerald-500/20", border: "border-green-500/40", text: "text-green-400", glow: "shadow-green-500/25", ring: "#10b981" },
  analytical: { gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/40", text: "text-blue-400", glow: "shadow-blue-500/25", ring: "#3b82f6" },
  worried:    { gradient: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/40", text: "text-amber-400", glow: "shadow-amber-500/25", ring: "#f59e0b" },
  shocked:    { gradient: "from-purple-500/20 to-fuchsia-500/20", border: "border-purple-500/40", text: "text-purple-400", glow: "shadow-purple-500/25", ring: "#a855f7" },
  emotional:  { gradient: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/40", text: "text-pink-400", glow: "shadow-pink-500/25", ring: "#ec4899" },
  angry:      { gradient: "from-red-500/20 to-rose-500/20", border: "border-red-500/40", text: "text-red-400", glow: "shadow-red-500/25", ring: "#ef4444" },
  talking:    { gradient: "from-slate-500/20 to-gray-500/20", border: "border-slate-500/40", text: "text-slate-400", glow: "shadow-slate-500/15", ring: "#64748b" },
};

// Ball color helper
function ballClass(b: string) {
  if (b === "4") return "bg-blue-500/25 text-blue-300 border-blue-500/50 shadow-blue-500/20";
  if (b === "6") return "bg-yellow-500/25 text-yellow-300 border-yellow-500/50 shadow-yellow-500/20";
  if (b === "W") return "bg-red-500/25 text-red-300 border-red-500/50 shadow-red-500/20";
  if (b === "0") return "bg-slate-800/60 text-slate-500 border-slate-600/40";
  return "bg-white/5 text-slate-300 border-white/15";
}

export default function SachinLiveDashboard() {
  const [matchData, setMatchData] = useState<LiveMatchData | null>(null);
  const [sachinData, setSachinData] = useState<SachinResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(true);
  const [autoMode, setAutoMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SachinResponse[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const autoRef = useRef<NodeJS.Timeout | null>(null);
  const prevRef = useRef<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") synthRef.current = window.speechSynthesis;
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const indian = voices.find((v) => v.lang.includes("en-IN") || v.name.includes("India"));
    if (indian) utt.voice = indian;
    utt.rate = 1.15;
    utt.pitch = 1.1;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utt);
  }, []);

  const fetchMatch = useCallback(async () => {
    try {
      setMatchLoading(true);
      const res = await fetch("/api/live-match");
      const json = await res.json();
      if (json.success) setMatchData(json.data);
    } catch (err) {
      console.error("Match fetch error:", err);
    } finally {
      setMatchLoading(false);
    }
  }, []);

  const getSachinCommentary = useCallback(async (data: LiveMatchData) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sachin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liveData: data.raw + "\n\nScore: " + data.score + " | Overs: " + data.overs + " | Recent: " + data.recentBalls + " | " + (data.commentary?.[0] || ""),
          previousCommentary: prevRef.current,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSachinData(json.data);
      prevRef.current = json.data.commentary || "";
      setHistory((prev) => [json.data, ...prev].slice(0, 15));
      if (json.data.commentary) speak(json.data.commentary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [loading, speak]);

  useEffect(() => {
    fetchMatch();
    const interval = setInterval(fetchMatch, 15000);
    return () => clearInterval(interval);
  }, [fetchMatch]);

  useEffect(() => {
    if (autoMode && matchData) {
      getSachinCommentary(matchData);
      autoRef.current = setInterval(() => {
        if (matchData) getSachinCommentary(matchData);
      }, 25000);
    } else {
      if (autoRef.current) clearInterval(autoRef.current);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, matchData]);

  const theme = MOOD_THEMES[sachinData?.mood || "talking"] || MOOD_THEMES.talking;
  const avatarInfo = AVATAR_STATES[sachinData?.avatar_state || "watching"] || AVATAR_STATES.watching;

  return (
    <section className="w-full space-y-5" id="sachin-live">
      {/* ═══ LIVE SCOREBOARD ═══ */}
      <div className="animate-scoreboard-in relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-red-950/40 via-[#0f1420] to-orange-950/40">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 via-yellow-500 to-orange-500 animate-gradient-shift" />

        <div className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: LIVE badge + Score */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1">
                <span className="live-dot" />
                <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">LIVE</span>
              </div>
              {matchLoading ? (
                <div className="shimmer h-7 w-40 rounded-lg" />
              ) : (
                <span className="text-white font-black text-xl md:text-2xl tracking-tight">{matchData?.score || "—"}</span>
              )}
              <span className="text-slate-400 text-sm font-medium">({matchData?.overs || "0.0"} ov)</span>
            </div>

            {/* Center: Match title */}
            <div className="text-center">
              <p className="text-xs text-slate-500 font-semibold tracking-wide">{matchData?.matchTitle || "Loading match..."}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{matchData?.status}</p>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-5 text-xs">
              <div className="text-center">
                <p className="text-slate-600 text-[10px] uppercase font-bold">CRR</p>
                <p className="text-white font-bold text-sm">{matchData?.runRate || "0.00"}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-600 text-[10px] uppercase font-bold">Bat</p>
                <p className="text-white text-sm truncate max-w-[140px]">{matchData?.currentBatsmen?.join(" & ") || "—"}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-600 text-[10px] uppercase font-bold">Bowl</p>
                <p className="text-white text-sm">{matchData?.currentBowler || "—"}</p>
              </div>
            </div>
          </div>

          {/* Recent Balls Strip */}
          {matchData?.recentBalls && (
            <div className="mt-3 flex items-center gap-2 justify-center">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mr-1">This Over</span>
              {matchData.recentBalls.split(" ").map((ball, i) => (
                <span key={i} className={`ball-dot w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border shadow-sm ${ballClass(ball)}`}>
                  {ball}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ SACHIN AVATAR + COMMENTARY PANEL ═══ */}
      <div className={`relative rounded-3xl border ${theme.border} bg-gradient-to-br ${theme.gradient} p-[2px] shadow-2xl ${theme.glow} transition-all duration-700`}>
        {/* Mood accent bar */}
        {sachinData && (
          <div className="absolute top-0 left-0 w-full h-[3px] rounded-t-3xl bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 animate-neon-flicker" />
        )}

        <div className="bg-[#0a0a0f]/95 rounded-[22px] p-5 md:p-8">
          {/* ── Header Row: Avatar + Name + Controls ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Animated Sachin Avatar */}
              <div className="sachin-avatar-ring w-[72px] h-[72px] flex-shrink-0">
                <div className={`sachin-avatar-inner w-full h-full text-4xl ${isSpeaking ? "animate-bounce" : sachinData?.avatar_state === "jumping" ? "animate-bounce" : "animate-avatar-breathe"}`}>
                  {sachinData ? avatarInfo.emoji : "🏏"}
                </div>
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                  <span className="gradient-text-sachin">Sachin Tendulkar</span>
                  {/* Speech waveform */}
                  {isSpeaking && (
                    <span className="flex items-end gap-[2px] h-5">
                      <span className="speech-bar speech-bar-1" />
                      <span className="speech-bar speech-bar-2" />
                      <span className="speech-bar speech-bar-3" />
                      <span className="speech-bar speech-bar-4" />
                      <span className="speech-bar speech-bar-5" />
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500 font-medium">Master Blaster · AI Commentary</span>
                  {sachinData && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${theme.border} ${theme.text}`}>
                      {avatarInfo.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoMode(!autoMode)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  autoMode
                    ? "bg-green-500/15 border-green-500/40 text-green-400 shadow-lg shadow-green-500/15 animate-pulse"
                    : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/8 hover:text-slate-300"
                }`}
              >
                {autoMode ? "🔴 AUTO ON" : "▶ Auto"}
              </button>

              <button
                onClick={() => matchData && getSachinCommentary(matchData)}
                disabled={loading || !matchData}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  loading
                    ? "bg-slate-800 text-slate-500 cursor-wait"
                    : "bg-gradient-to-r from-orange-600 to-yellow-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Thinking...
                  </span>
                ) : (
                  "🎙️ React!"
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 animate-fade-in-up">
              ⚠️ {error}
            </div>
          )}

          {/* ── Main Commentary Bubble ── */}
          {sachinData && (
            <div className="space-y-5 animate-commentary-in">
              {/* Speech Bubble */}
              <div className={`relative bg-gradient-to-br ${theme.gradient} border ${theme.border} rounded-2xl p-6 transition-all duration-500`}>
                <div className="absolute -top-2 left-10 w-4 h-4 rotate-45 border-l border-t" style={{ borderColor: theme.ring, background: '#0a0a0f' }} />
                <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
                  &ldquo;{sachinData.commentary}&rdquo;
                </p>

                {/* Replay button */}
                <button
                  onClick={() => speak(sachinData.commentary)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm transition-all hover:scale-110"
                  title="Replay voice"
                >
                  🔊
                </button>

                {/* Intensity Bar */}
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Intensity</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="intensity-bar-fill h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"
                      style={{ width: `${(sachinData.intensity / 10) * 100}%` }}
                    />
                  </div>
                  <span className={`font-black text-lg ${theme.text}`}>{sachinData.intensity}/10</span>
                </div>
              </div>

              {/* ── Three Cards: Meme / Memory / Tactical ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 🔥 Meme Card */}
                <div className="meme-card animate-meme-glow bg-fuchsia-950/30 border border-fuchsia-500/25 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🔥</span>
                    <h4 className="text-[10px] text-fuchsia-400 font-black uppercase tracking-[0.15em]">Meme Take</h4>
                  </div>
                  <p className="text-sm text-white font-semibold leading-relaxed">{sachinData.meme}</p>
                </div>

                {/* 🏏 Sachin Memory Card */}
                <div className="meme-card bg-amber-950/30 border border-amber-500/25 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg animate-bat-swing inline-block">🏏</span>
                    <h4 className="text-[10px] text-amber-400 font-black uppercase tracking-[0.15em]">Sachin Memory</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{sachinData.sachin_memory || "Every ball in cricket has a story..."}</p>
                </div>

                {/* 🧠 Tactical Take Card */}
                <div className="meme-card bg-cyan-950/30 border border-cyan-500/25 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🧠</span>
                    <h4 className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.15em]">Tactical Take</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{sachinData.tactical_take || "Patience is key..."}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Empty State ── */}
          {!sachinData && !loading && (
            <div className="text-center py-16">
              <div className="text-7xl mb-5 animate-bat-swing inline-block">🏏</div>
              <p className="text-slate-300 text-xl font-bold">Hit &ldquo;React!&rdquo; or enable Auto Mode</p>
              <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">Sachin will react to the live match with spicy commentary, memes, memories, and it&apos;ll even talk out loud!</p>
              <div className="flex items-center justify-center gap-4 mt-6 text-[10px] text-slate-600 uppercase font-bold tracking-wider">
                <span>🎙️ Voice Output</span>
                <span>·</span>
                <span>😂 Meme Engine</span>
                <span>·</span>
                <span>📡 Live Data</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !sachinData && (
            <div className="text-center py-16">
              <div className="cricket-ball-spinner mx-auto mb-5" />
              <p className="text-orange-400 animate-pulse font-bold text-lg">Sachin is watching the replay...</p>
              <p className="text-slate-500 text-xs mt-1">Gemini agents processing match data</p>
            </div>
          )}

          {/* ── Commentary History Toggle ── */}
          {history.length > 1 && (
            <div className="mt-6 border-t border-white/5 pt-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs text-slate-500 uppercase font-black tracking-wider hover:text-slate-300 transition-colors flex items-center gap-2"
              >
                📜 Previous Reactions ({history.length - 1})
                <span className={`transition-transform ${showHistory ? "rotate-180" : ""}`}>▼</span>
              </button>

              {showHistory && (
                <div className="mt-3 space-y-1.5 max-h-52 overflow-y-auto animate-fade-in-up">
                  {history.slice(1).map((item, i) => (
                    <div
                      key={i}
                      className="commentary-history-item flex items-start gap-3 p-2.5 rounded-lg cursor-pointer"
                      onClick={() => speak(item.commentary)}
                    >
                      <span className="text-base mt-0.5">{AVATAR_STATES[item.avatar_state]?.emoji || "🏏"}</span>
                      <p className="text-xs text-slate-400 leading-relaxed flex-1">&ldquo;{item.commentary}&rdquo;</p>
                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        <span className={`text-[9px] font-bold ${MOOD_THEMES[item.mood]?.text || "text-slate-500"}`}>{item.intensity}/10</span>
                        <span className="text-slate-700 text-[10px]">🔊</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ BALL-BY-BALL COMMENTARY FEED ═══ */}
      {matchData?.commentary && matchData.commentary.length > 0 && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 animate-fade-in-up">
          <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-[0.15em] mb-3 flex items-center gap-2">
            <span className="live-dot w-[6px] h-[6px]" /> Ball-by-Ball Feed
          </h4>
          <div className="space-y-1">
            {matchData.commentary.map((line, i) => (
              <div key={i} className={`text-xs font-mono leading-relaxed p-2 rounded-lg transition-colors ${
                i === 0 ? "text-white bg-white/5 border border-white/5" : "text-slate-500 hover:text-slate-400 hover:bg-white/[0.02]"
              } ${line.includes("SIX") || line.includes("FOUR") ? "!text-yellow-400" : ""} ${line.includes("WICKET") ? "!text-red-400" : ""}`}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

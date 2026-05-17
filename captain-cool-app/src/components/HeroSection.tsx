"use client";

import { useEffect, useRef } from "react";

export default function HeroSection() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;
    let frame: number;
    let opacity = 0.4;
    let dir = 1;

    const animate = () => {
      opacity += dir * 0.005;
      if (opacity >= 0.9) dir = -1;
      if (opacity <= 0.3) dir = 1;
      el.style.opacity = opacity.toString();
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <header className="relative py-16 px-4 text-center overflow-hidden">
      {/* Cricket ball glow */}
      <div
        ref={glowRef}
        className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-3xl transition-opacity"
      />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 mb-6 backdrop-blur-sm">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        Powered by Google Gemini 2.5 Flash · Multi-Agent AI · Live Tactical Engine
      </div>

      {/* Logo & Title */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-5xl animate-bounce-slow">🏏</div>
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Captain
            </span>
            <span className="text-white"> Cool</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase mt-1">
            Multi-Agent IPL Match Strategist
          </p>
        </div>
        <div className="text-5xl animate-bounce-slow animation-delay-500">🏆</div>
      </div>

      {/* Subtitle */}
      <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
        The AI captain that <span className="text-emerald-400 font-semibold">thinks like Dhoni</span>,{" "}
        <span className="text-blue-400 font-semibold">strategizes like Rohit</span>, and{" "}
        <span className="text-purple-400 font-semibold">debates like Nasser Hussain</span>.
        Four specialized Gemini agents collaborate in real-time to make every tactical call.
      </p>

      {/* Agent pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        {[
          { label: "📊 Stats Analyst", color: "blue" },
          { label: "🧠 Strategist", color: "purple" },
          { label: "😈 Devil's Advocate", color: "red" },
          { label: "🏏 Captain Cool", color: "emerald" },
        ].map((agent) => (
          <span
            key={agent.label}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border backdrop-blur-sm
              ${agent.color === "blue" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : ""}
              ${agent.color === "purple" ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : ""}
              ${agent.color === "red" ? "bg-red-500/10 border-red-500/30 text-red-400" : ""}
              ${agent.color === "emerald" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : ""}
            `}
          >
            {agent.label}
          </span>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-8 mt-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">⚡</span>
          <span>4 Gemini Agents</span>
        </div>
        <div className="w-1 h-1 bg-slate-600 rounded-full" />
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">🔧</span>
          <span>Real Tool Calls</span>
        </div>
        <div className="w-1 h-1 bg-slate-600 rounded-full" />
        <div className="flex items-center gap-2">
          <span className="text-purple-400">💬</span>
          <span>Live Debate Loop</span>
        </div>
        <div className="w-1 h-1 bg-slate-600 rounded-full" />
        <div className="flex items-center gap-2">
          <span className="text-red-400">🎯</span>
          <span>Cricket-Language Output</span>
        </div>
      </div>
    </header>
  );
}

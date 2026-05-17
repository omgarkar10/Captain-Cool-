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
    <header className="relative py-12 px-4 text-center overflow-hidden">
      {/* Animated background glow */}
      <div ref={glowRef} className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-600/15 rounded-full blur-[100px]" />
      <div className="absolute top-10 left-1/4 w-32 h-32 bg-yellow-500/10 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute top-10 right-1/4 w-32 h-32 bg-red-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />

      {/* LIVE Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 mb-5 backdrop-blur-sm animate-fade-in-up">
        <span className="live-dot w-[6px] h-[6px]" />
        <span className="font-bold tracking-widest uppercase text-[10px]">LIVE</span>
        <span className="text-slate-600">·</span>
        <span>Powered by Google Gemini 2.5 Flash</span>
        <span className="text-slate-600">·</span>
        <span>Multi-Agent AI</span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-center gap-4 mb-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="text-5xl animate-bat-swing inline-block">🏏</div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
          <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
            Captain
          </span>
          <span className="text-white"> Cool</span>
        </h1>
        <div className="text-5xl animate-bounce-slow">🏆</div>
      </div>

      <p className="text-slate-500 text-xs tracking-[0.3em] uppercase font-bold mb-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        Multi-Agent IPL Match Strategist
      </p>

      <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        Watch <span className="gradient-text-sachin font-bold">Sachin Tendulkar AI</span> react live to IPL —
        with memes, memories, and spicy Hinglish commentary that{" "}
        <span className="text-yellow-400 font-bold">talks out loud</span>!
      </p>

      {/* Feature Pills */}
      <div className="flex items-center justify-center gap-2 mt-6 flex-wrap animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        {[
          { icon: "⚡", label: "5 Gemini Agents", color: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
          { icon: "🔧", label: "Function Calling", color: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
          { icon: "🗣️", label: "Voice Output", color: "text-green-400 border-green-500/20 bg-green-500/5" },
          { icon: "📡", label: "Live Data", color: "text-red-400 border-red-500/20 bg-red-500/5" },
          { icon: "😂", label: "Meme Engine", color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" },
        ].map((s) => (
          <span key={s.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold ${s.color}`}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </span>
        ))}
      </div>
    </header>
  );
}

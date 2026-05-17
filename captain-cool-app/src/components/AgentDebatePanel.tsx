"use client";

import { useState, useEffect } from "react";
import { AnalysisResult, AgentTab, AgentTabConfig } from "@/types";
import ReactMarkdown from "react-markdown";

interface Props {
  result: AnalysisResult;
}

const TABS: AgentTabConfig[] = [
  {
    key: "captainCall",
    label: "Captain's Call",
    icon: "🏏",
    color: "emerald",
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    key: "statsAnalyst",
    label: "Stats Analyst",
    icon: "📊",
    color: "blue",
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    key: "strategist",
    label: "Strategist",
    icon: "🧠",
    color: "purple",
    gradient: "from-purple-600 to-violet-600",
  },
  {
    key: "devilsAdvocate",
    label: "Devil's Advocate",
    icon: "😈",
    color: "red",
    gradient: "from-red-600 to-orange-600",
  },
];

const COLOR_VARIANTS = {
  emerald: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    active: "border-b-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  blue: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    glow: "shadow-blue-500/20",
    active: "border-b-blue-400",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  purple: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    glow: "shadow-purple-500/20",
    active: "border-b-purple-400",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  red: {
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    text: "text-red-400",
    glow: "shadow-red-500/20",
    active: "border-b-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

function MarkdownContent({ content, color }: { content: string; color: keyof typeof COLOR_VARIANTS }) {
  const cv = COLOR_VARIANTS[color];
  return (
    <div className="prose prose-invert max-w-none prose-sm">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className={`text-2xl font-black mb-4 ${cv.text}`}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-lg font-bold mb-3 mt-5 ${cv.text} flex items-center gap-2`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mb-2 mt-4 text-white">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-slate-300 leading-relaxed mb-3 text-sm">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mb-3">{children}</ul>
          ),
          li: ({ children }) => (
            <li className={`flex items-start gap-2 text-slate-300 text-sm`}>
              <span className={`${cv.text} mt-1 flex-shrink-0`}>▸</span>
              <span>{children}</span>
            </li>
          ),
          hr: () => (
            <hr className={`border-0 border-t my-4 ${cv.border}`} />
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 ${cv.border} pl-4 italic text-slate-400 my-3`}>
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className={`${cv.badge} px-2 py-0.5 rounded text-xs font-mono border`}>
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function AgentDebatePanel({ result }: Props) {
  const [activeTab, setActiveTab] = useState<AgentTab>("captainCall");
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Entrance animation
    setTimeout(() => setVisible(true), 100);
  }, [result]);

  const switchTab = (tab: AgentTab) => {
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setAnimating(false);
    }, 150);
  };

  const activeConfig = TABS.find((t) => t.key === activeTab)!;
  const cv = COLOR_VARIANTS[activeConfig.color as keyof typeof COLOR_VARIANTS];
  const content = result.agents[activeTab];

  return (
    <div
      className={`mt-10 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">🎙️ Agent War Room</h2>
          <p className="text-slate-500 text-sm mt-1">
            4 Gemini agents debated in real-time ·{" "}
            {new Date(result.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Analysis Complete</span>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { icon: "📊", label: "Stats Analyst", color: "blue" },
          { icon: "→", label: "", color: "slate" },
          { icon: "🧠", label: "Strategist", color: "purple" },
          { icon: "→", label: "", color: "slate" },
          { icon: "😈", label: "Devil's Advocate", color: "red" },
          { icon: "→", label: "", color: "slate" },
          { icon: "🏏", label: "Captain's Call", color: "emerald" },
        ].map((step, i) => (
          <div key={i} className="flex items-center">
            {step.label ? (
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border
                    ${step.color === "blue" ? "bg-blue-500/10 border-blue-500/30" : ""}
                    ${step.color === "purple" ? "bg-purple-500/10 border-purple-500/30" : ""}
                    ${step.color === "red" ? "bg-red-500/10 border-red-500/30" : ""}
                    ${step.color === "emerald" ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-400/20" : ""}
                  `}
                >
                  {step.icon}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 whitespace-nowrap">
                  {step.label}
                </span>
              </div>
            ) : (
              <span className="text-slate-600 text-lg mx-1">{step.icon}</span>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white/3 border border-white/8 rounded-3xl overflow-hidden">
        <div className="flex border-b border-white/8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const tcv = COLOR_VARIANTS[tab.color as keyof typeof COLOR_VARIANTS];
            return (
              <button
                key={tab.key}
                onClick={() => switchTab(tab.key)}
                className={`flex-1 py-4 text-sm font-medium transition-all border-b-2 ${
                  isActive
                    ? `${tcv.text} ${tcv.active} bg-white/5`
                    : "text-slate-500 border-b-transparent hover:text-slate-300"
                }`}
              >
                <span className="hidden sm:inline mr-1">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-lg">{tab.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Agent header */}
        <div className={`px-6 py-4 border-b ${cv.border} ${cv.bg}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${activeConfig.gradient}`}
            >
              {activeConfig.icon}
            </div>
            <div>
              <h3 className={`font-bold ${cv.text}`}>{activeConfig.label}</h3>
              <p className="text-xs text-slate-500">
                {activeConfig.key === "statsAnalyst" &&
                  "Gemini 2.5 Flash · Tool calls: Win Probability, Pitch Analysis, Player Profiles"}
                {activeConfig.key === "strategist" &&
                  "Gemini 2.5 Flash · Reads Stats Analyst output · Makes primary tactical call"}
                {activeConfig.key === "devilsAdvocate" &&
                  "Gemini 2.5 Flash · Challenges the Strategist · Forces a better decision"}
                {activeConfig.key === "captainCall" &&
                  "Gemini 2.5 Flash · Synthesizes full debate · Issues the FINAL CALL"}
              </p>
            </div>
            <div
              className={`ml-auto px-3 py-1 rounded-full text-xs font-medium border ${cv.badge}`}
            >
              {activeConfig.key === "statsAnalyst" && "🔧 Tool-Augmented"}
              {activeConfig.key === "strategist" && "🧠 Proposes"}
              {activeConfig.key === "devilsAdvocate" && "😈 Challenges"}
              {activeConfig.key === "captainCall" && "✅ Final Decision"}
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className={`p-6 min-h-[300px] transition-all duration-150 ${
            animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          <MarkdownContent content={content} color={activeConfig.color as keyof typeof COLOR_VARIANTS} />
        </div>
      </div>

      {/* Match context collapsible */}
      <MatchContextCard context={result.matchContext} />
    </div>
  );
}

function MatchContextCard({ context }: { context: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 flex items-center justify-between text-left"
      >
        <span className="text-slate-400 text-sm font-medium">
          🔍 Match Context Sent to Agents
        </span>
        <span className="text-slate-600 text-xs">{open ? "▲ Hide" : "▼ Show"}</span>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap leading-relaxed">
            {context}
          </pre>
        </div>
      )}
    </div>
  );
}

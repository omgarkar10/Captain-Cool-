"use client";

import { useState } from "react";
import { MatchState } from "@/types";

interface Props {
  onAnalyze: (state: MatchState) => void;
  loading: boolean;
}

const IPL_TEAMS = [
  "Mumbai Indians",
  "Chennai Super Kings",
  "Royal Challengers Bengaluru",
  "Kolkata Knight Riders",
  "Delhi Capitals",
  "Rajasthan Royals",
  "Punjab Kings",
  "Sunrisers Hyderabad",
  "Gujarat Titans",
  "Lucknow Super Giants",
];

const IPL_VENUES = [
  "Wankhede Stadium",
  "Chinnaswamy Stadium",
  "Eden Gardens",
  "Arun Jaitley Stadium",
  "Narendra Modi Stadium",
  "MA Chidambaram Stadium",
  "Rajiv Gandhi International Stadium",
  "Sawai Mansingh Stadium",
  "PCA Stadium Mohali",
  "BRSABV Ekana Cricket Stadium",
];

const SCENARIOS: Array<{ label: string; data: Partial<MatchState> }> = [
  {
    label: "🔥 Classic CSK Chase",
    data: {
      innings: 2,
      over: 16,
      ball: 3,
      score: 158,
      wickets: 3,
      battingTeam: "Chennai Super Kings",
      bowlingTeam: "Mumbai Indians",
      striker: "MS Dhoni",
      nonStriker: "Ravindra Jadeja",
      venue: "Wankhede Stadium",
      pitchType: "flat",
      dewFactor: "heavy",
      target: 197,
      requiredRunRate: 14.8,
      currentRunRate: 9.5,
      impactPlayerAvailable: true,
      bowlerOvers: { "Jasprit Bumrah": 4, "Hardik Pandya": 3 } as Record<string, number>,
      availableBowlers: "Jasprit Bumrah (0 overs left), Hardik Pandya (1 over), Piyush Chawla (2 overs), Tim David bowler",
      availableBatters: "MS Dhoni (striker), Ravindra Jadeja, Shivam Dube",
      powerplayComplete: true,
      timeoutAvailable: false,
      additionalContext: "CSK need 39 off 21 balls. Dhoni has just walked in. Dew is heavy, spinners ineffective. 2 set batters gone.",
    },
  },
  {
    label: "⚡ MI Death Over Crisis",
    data: {
      innings: 1,
      over: 17,
      ball: 0,
      score: 142,
      wickets: 6,
      battingTeam: "Mumbai Indians",
      bowlingTeam: "Royal Challengers Bengaluru",
      striker: "Hardik Pandya",
      nonStriker: "Tim David",
      venue: "Wankhede Stadium",
      pitchType: "flat",
      dewFactor: "none",
      currentRunRate: 8.4,
      impactPlayerAvailable: true,
      bowlerOvers: { "Mohammed Siraj": 3, "Harshal Patel": 3 } as Record<string, number>,
      availableBowlers: "Harshal Patel (1 over), Mohammed Siraj (1 over), Yash Dayal (2 overs), Virat Kohli (1 over)",
      availableBatters: "Hardik Pandya, Tim David, Romario Shepherd",
      powerplayComplete: true,
      timeoutAvailable: true,
      additionalContext: "MI in trouble. Top 6 gone. Need 50+ in last 3 overs. Wankhede pitch is flat, boundaries easy.",
    },
  },
  {
    label: "🎯 KKR Powerplay Decision",
    data: {
      innings: 1,
      over: 4,
      ball: 2,
      score: 48,
      wickets: 0,
      battingTeam: "Kolkata Knight Riders",
      bowlingTeam: "Rajasthan Royals",
      striker: "Virat Kohli",
      nonStriker: "Phil Salt",
      venue: "Eden Gardens",
      pitchType: "two-paced",
      dewFactor: "light",
      currentRunRate: 11.2,
      impactPlayerAvailable: true,
      bowlerOvers: { "Trent Boult": 2 } as Record<string, number>,
      availableBowlers: "Trent Boult (2 overs), Yuzvendra Chahal (4 overs), Sandeep Sharma (3 overs)",
      availableBatters: "Full lineup intact",
      powerplayComplete: false,
      timeoutAvailable: true,
      additionalContext: "KKR flying at 11+ run rate. 2 openers set. RR captain thinking about breaking partnership NOW or saving Boult.",
    },
  },
];

export default function MatchInputForm({ onAnalyze, loading }: Props) {
  const [form, setForm] = useState<Partial<MatchState>>({
    innings: 2,
    over: 15,
    ball: 0,
    score: 140,
    wickets: 4,
    battingTeam: "Chennai Super Kings",
    bowlingTeam: "Mumbai Indians",
    striker: "MS Dhoni",
    nonStriker: "Ravindra Jadeja",
    venue: "Wankhede Stadium",
    pitchType: "flat",
    dewFactor: "heavy",
    target: 185,
    requiredRunRate: 13.2,
    currentRunRate: 9.3,
    impactPlayerAvailable: true,
    bowlerOvers: {},
    powerplayComplete: true,
    timeoutAvailable: false,
    additionalContext: "",
  });

  const [activeSection, setActiveSection] = useState<string>("match");

  const loadScenario = (scenario: { label: string; data: Partial<MatchState> }) => {
    setForm(scenario.data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(form as MatchState);
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all text-sm";
  const selectClass =
    "w-full bg-[#0f1420] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm cursor-pointer";
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider";

  const tabs = [
    { id: "match", label: "Match State", icon: "🏏" },
    { id: "players", label: "Players & Teams", icon: "👥" },
    { id: "conditions", label: "Conditions", icon: "🌤️" },
    { id: "tactics", label: "Tactical Info", icon: "🎯" },
  ];

  return (
    <section className="mt-8">
      {/* Quick Scenarios */}
      <div className="mb-6">
        <p className="text-slate-400 text-sm mb-3 text-center font-medium">
          ⚡ Quick Load Scenarios
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {SCENARIOS.map((s) => (
            <button
              key={s.label}
              onClick={() => loadScenario(s)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/3 border border-white/8 rounded-3xl overflow-hidden"
      >
        {/* Section tabs */}
        <div className="flex border-b border-white/8">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeSection === tab.id
                  ? "bg-white/8 text-white border-b-2 border-blue-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="hidden sm:inline">{tab.icon} </span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {/* Match State Tab */}
          {activeSection === "match" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Innings</label>
                <select
                  className={selectClass}
                  value={form.innings}
                  onChange={(e) =>
                    setForm({ ...form, innings: Number(e.target.value) as 1 | 2 })
                  }
                >
                  <option value={1}>1st Innings</option>
                  <option value={2}>2nd Innings</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Over</label>
                <input
                  type="number"
                  min={0}
                  max={19}
                  className={inputClass}
                  value={form.over}
                  onChange={(e) =>
                    setForm({ ...form, over: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Ball</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  className={inputClass}
                  value={form.ball}
                  onChange={(e) =>
                    setForm({ ...form, ball: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Score</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.score}
                  onChange={(e) =>
                    setForm({ ...form, score: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Wickets</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  className={inputClass}
                  value={form.wickets}
                  onChange={(e) =>
                    setForm({ ...form, wickets: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Current RR</label>
                <input
                  type="number"
                  step={0.1}
                  className={inputClass}
                  value={form.currentRunRate}
                  onChange={(e) =>
                    setForm({ ...form, currentRunRate: Number(e.target.value) })
                  }
                />
              </div>
              {form.innings === 2 && (
                <>
                  <div>
                    <label className={labelClass}>Target</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={form.target || ""}
                      onChange={(e) =>
                        setForm({ ...form, target: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Required RR</label>
                    <input
                      type="number"
                      step={0.1}
                      className={inputClass}
                      value={form.requiredRunRate || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          requiredRunRate: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Players & Teams Tab */}
          {activeSection === "players" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Batting Team</label>
                  <select
                    className={selectClass}
                    value={form.battingTeam}
                    onChange={(e) =>
                      setForm({ ...form, battingTeam: e.target.value })
                    }
                  >
                    {IPL_TEAMS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Bowling Team</label>
                  <select
                    className={selectClass}
                    value={form.bowlingTeam}
                    onChange={(e) =>
                      setForm({ ...form, bowlingTeam: e.target.value })
                    }
                  >
                    {IPL_TEAMS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Striker (On Strike)</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. MS Dhoni"
                    value={form.striker}
                    onChange={(e) =>
                      setForm({ ...form, striker: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Non-Striker</label>
                  <input
                    className={inputClass}
                    placeholder="e.g. Ravindra Jadeja"
                    value={form.nonStriker}
                    onChange={(e) =>
                      setForm({ ...form, nonStriker: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Available Bowlers & Overs Remaining</label>
                <textarea
                  className={`${inputClass} resize-none h-20`}
                  placeholder="e.g. Bumrah (1 over), Pandya (2 overs), Boult (used up)"
                  value={form.availableBowlers || ""}
                  onChange={(e) =>
                    setForm({ ...form, availableBowlers: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Remaining Batters</label>
                <textarea
                  className={`${inputClass} resize-none h-16`}
                  placeholder="e.g. Dhoni (not out), Jadeja, Pathirana (tail)"
                  value={form.availableBatters || ""}
                  onChange={(e) =>
                    setForm({ ...form, availableBatters: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Conditions Tab */}
          {activeSection === "conditions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Venue</label>
                <select
                  className={selectClass}
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                >
                  {IPL_VENUES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Pitch Type</label>
                <select
                  className={selectClass}
                  value={form.pitchType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pitchType: e.target.value as MatchState["pitchType"],
                    })
                  }
                >
                  <option value="flat">Flat (batting paradise)</option>
                  <option value="turning">Turning (spinner-friendly)</option>
                  <option value="two-paced">Two-paced (mixed)</option>
                  <option value="green-top">Green Top (seam-friendly)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Dew Factor</label>
                <select
                  className={selectClass}
                  value={form.dewFactor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dewFactor: e.target.value as MatchState["dewFactor"],
                    })
                  }
                >
                  <option value="none">None</option>
                  <option value="light">Light Dew</option>
                  <option value="heavy">Heavy Dew</option>
                </select>
              </div>
            </div>
          )}

          {/* Tactical Tab */}
          {activeSection === "tactics" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Impact Player</label>
                  <select
                    className={selectClass}
                    value={form.impactPlayerAvailable ? "yes" : "no"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        impactPlayerAvailable: e.target.value === "yes",
                      })
                    }
                  >
                    <option value="yes">Available ✅</option>
                    <option value="no">Used / N/A ❌</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Powerplay</label>
                  <select
                    className={selectClass}
                    value={form.powerplayComplete ? "yes" : "no"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        powerplayComplete: e.target.value === "yes",
                      })
                    }
                  >
                    <option value="yes">Complete ✅</option>
                    <option value="no">Ongoing/Upcoming 🔄</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Strategic Timeout</label>
                  <select
                    className={selectClass}
                    value={form.timeoutAvailable ? "yes" : "no"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        timeoutAvailable: e.target.value === "yes",
                      })
                    }
                  >
                    <option value="yes">Available ✅</option>
                    <option value="no">Used ❌</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Additional Context (optional)</label>
                <textarea
                  className={`${inputClass} resize-none h-24`}
                  placeholder="Any extra info: player injuries, recent momentum shifts, specific match-ups to consider, crowd pressure, etc."
                  value={form.additionalContext || ""}
                  onChange={(e) =>
                    setForm({ ...form, additionalContext: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="px-6 pb-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all relative overflow-hidden group
              ${
                loading
                  ? "bg-white/10 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-[1.01]"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                <span>4 Agents Debating...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <span>🏏</span>
                <span>Summon Captain Cool</span>
                <span>→</span>
              </span>
            )}
            {!loading && (
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
          {loading && (
            <p className="text-center text-xs text-slate-500 mt-3 animate-pulse">
              Stats Analyst → Strategist → Devil's Advocate → Captain's Final Call
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

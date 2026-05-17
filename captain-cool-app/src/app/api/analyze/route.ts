import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { generateContentWithRetry, ai } from "@/utils/gemini";

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const getWinProbabilityTool = {
  name: "get_win_probability",
  description:
    "Calculates live win probability for the batting team based on match state. Returns a percentage and key risk factors.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      innings: { type: Type.NUMBER, description: "1 or 2" },
      over: { type: Type.NUMBER, description: "Current over number (0-19)" },
      ball: { type: Type.NUMBER, description: "Current ball in over (0-5)" },
      runs_scored: { type: Type.NUMBER, description: "Runs scored so far" },
      wickets_fallen: { type: Type.NUMBER, description: "Wickets fallen" },
      target: {
        type: Type.NUMBER,
        description: "Target (only for 2nd innings, else 0)",
      },
      required_run_rate: {
        type: Type.NUMBER,
        description: "Required run rate (2nd innings)",
      },
      current_run_rate: { type: Type.NUMBER, description: "Current run rate" },
    },
    required: [
      "innings",
      "over",
      "ball",
      "runs_scored",
      "wickets_fallen",
      "current_run_rate",
    ],
  },
};

const getPitchAnalysisTool = {
  name: "get_pitch_analysis",
  description:
    "Analyzes pitch conditions and returns bowler type recommendations, batting approach, and likely behavior.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      venue: { type: Type.STRING, description: "Stadium/venue name" },
      pitch_type: {
        type: Type.STRING,
        description: "turning / flat / two-paced / green-top",
      },
      dew_factor: {
        type: Type.STRING,
        description: "none / light / heavy",
      },
      time_of_day: {
        type: Type.STRING,
        description: "day / day-night / night",
      },
    },
    required: ["venue", "pitch_type"],
  },
};

const getPlayerProfileTool = {
  name: "get_player_profile",
  description:
    "Fetches statistical profile and recent form of a player relevant to decision-making.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      player_name: { type: Type.STRING, description: "Full player name" },
      role: {
        type: Type.STRING,
        description: "batter / bowler / all-rounder",
      },
    },
    required: ["player_name"],
  },
};

// ─── Tool Executors ────────────────────────────────────────────────────────────

function executeWinProbability(args: Record<string, number>): string {
  const {
    innings,
    over,
    ball,
    runs_scored,
    wickets_fallen,
    target,
    required_run_rate,
    current_run_rate,
  } = args;

  let base = 50;

  if (innings === 1) {
    const projectedScore = current_run_rate * 20;
    if (projectedScore > 200) base = 65;
    else if (projectedScore > 180) base = 58;
    else if (projectedScore > 160) base = 52;
    else base = 45;
    base -= wickets_fallen * 4;
    if (over < 6) base += 5;
  } else {
    const ballsLeft = (20 - over) * 6 - ball;
    const runsNeeded = (target || 180) - runs_scored;
    const rrr = required_run_rate || runsNeeded / (ballsLeft / 6);
    if (rrr < 7) base = 70;
    else if (rrr < 9) base = 55;
    else if (rrr < 11) base = 40;
    else if (rrr < 13) base = 28;
    else base = 15;
    base -= wickets_fallen * 5;
    if (ballsLeft < 12) base -= 10;
  }

  base = Math.max(5, Math.min(95, base));
  const riskFactors = [];
  if (wickets_fallen >= 5) riskFactors.push("batting depth exhausted");
  if (innings === 2 && (required_run_rate || 0) > 12)
    riskFactors.push("extremely high required rate");
  if (over >= 16) riskFactors.push("death overs pressure mounting");
  if (wickets_fallen === 0 && over < 6) riskFactors.push("solid start");

  return JSON.stringify({
    win_probability: base,
    batting_team_advantage: base > 50,
    risk_factors: riskFactors,
    momentum: base > 55 ? "batting" : base < 45 ? "bowling" : "balanced",
  });
}

function executePitchAnalysis(args: Record<string, string>): string {
  const { venue, pitch_type, dew_factor, time_of_day } = args;

  const venueData: Record<
    string,
    { avg_score: number; typical_behavior: string }
  > = {
    "wankhede stadium": { avg_score: 175, typical_behavior: "batsman-friendly" },
    "chinnaswamy stadium": { avg_score: 185, typical_behavior: "high-scoring" },
    "eden gardens": { avg_score: 165, typical_behavior: "balanced" },
    "arun jaitley stadium": { avg_score: 170, typical_behavior: "balanced" },
    "narendra modi stadium": { avg_score: 168, typical_behavior: "balanced" },
    default: { avg_score: 165, typical_behavior: "balanced" },
  };

  const key = venue.toLowerCase();
  const vd = venueData[key] || venueData["default"];
  const dewEffect =
    dew_factor === "heavy"
      ? "Dew will make spin ineffective in 2nd innings; pace is key"
      : dew_factor === "light"
      ? "Slight dew may affect grip"
      : "No dew impact";

  const bowlerRecs =
    pitch_type === "turning"
      ? ["leg-spinner", "off-spinner", "left-arm orthodox"]
      : pitch_type === "green-top"
      ? ["right-arm fast", "left-arm seam", "swing bowler"]
      : pitch_type === "two-paced"
      ? ["slow cutter", "leg-spinner", "medium pacer"]
      : ["pace bowler", "yorker specialist", "slower ball expert"];

  return JSON.stringify({
    venue,
    pitch_type,
    typical_behavior: vd.typical_behavior,
    average_score: vd.avg_score,
    dew_analysis: dewEffect,
    recommended_bowler_types: bowlerRecs,
    batting_approach:
      pitch_type === "turning"
        ? "use feet, sweep aggressively"
        : "play straight, target powerplay",
    time_of_day: time_of_day || "night",
  });
}

function executePlayerProfile(args: Record<string, string>): string {
  // Realistic mock profiles for IPL stalwarts
  const profiles: Record<string, object> = {
    "ms dhoni": {
      batting_avg: 38.2,
      strike_rate: 135.2,
      recent_form: "excellent",
      role: "finisher",
      strength: "death overs, pressure situations",
      weakness: "express pace above 145 kmph",
      ipl_hundreds: 0,
      ipl_fifties: 24,
    },
    "virat kohli": {
      batting_avg: 36.1,
      strike_rate: 130.1,
      recent_form: "good",
      role: "anchor-accelerator",
      strength: "chasing, powerplay",
      weakness: "short ball on off-stump",
      ipl_hundreds: 8,
      ipl_fifties: 45,
    },
    "rohit sharma": {
      batting_avg: 31.2,
      strike_rate: 130.0,
      recent_form: "moderate",
      role: "aggressive opener",
      strength: "powerplay, pull shot",
      weakness: "incoming delivery at pace",
      ipl_hundreds: 2,
      ipl_fifties: 41,
    },
    "jasprit bumrah": {
      bowling_avg: 24.5,
      economy: 7.2,
      recent_form: "excellent",
      role: "pace spearhead",
      strength: "yorkers, death overs",
      wickets: 180,
      best_figures: "5/27",
    },
    "hardik pandya": {
      batting_avg: 27.3,
      strike_rate: 147.8,
      bowling_economy: 8.9,
      recent_form: "good",
      role: "power all-rounder",
      strength: "big hitting, seam bowling",
    },
    default: {
      batting_avg: 28.0,
      strike_rate: 128.0,
      recent_form: "average",
      role: "team player",
      strength: "versatile",
      weakness: "unknown",
    },
  };

  const key = (args.player_name || "").toLowerCase();
  const profile = profiles[key] || profiles["default"];
  return JSON.stringify({ player: args.player_name, ...profile });
}

// ─── Single-Agent Runner with Tool Use ────────────────────────────────────────

async function runAgentWithTools(
  systemPrompt: string,
  userMessage: string,
  agentName: string
): Promise<string> {
  const tools = [
    { functionDeclarations: [getWinProbabilityTool] },
    { functionDeclarations: [getPitchAnalysisTool] },
    { functionDeclarations: [getPlayerProfileTool] },
  ];

  const model = "gemini-2.5-flash";

  // First turn
  let response = await generateContentWithRetry({
    model,
    config: {
      systemInstruction: systemPrompt,
      tools,
      temperature: 0.7,
    },
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
  });

  // Tool-use loop
  let iterations = 0;
  const maxIterations = 2;
  const conversationHistory: Array<{
    role: string;
    parts: Array<Record<string, unknown>>;
  }> = [{ role: "user", parts: [{ text: userMessage }] }];

  while (iterations < maxIterations) {
    const candidate = response.candidates?.[0];
    if (!candidate) break;

    const parts = candidate.content?.parts || [];
    const functionCalls = parts.filter((p) => p.functionCall);

    if (functionCalls.length === 0) break;

    // Add model response to history
    conversationHistory.push({
      role: "model",
      parts: parts.map((p) => ({ ...p })),
    });

    // Execute function calls
    const toolResults = functionCalls.map((part) => {
      const fc = part.functionCall!;
      const name = fc.name;
      const args = fc.args as Record<string, unknown>;

      let result = "{}";
      if (name === "get_win_probability") {
        result = executeWinProbability(args as Record<string, number>);
      } else if (name === "get_pitch_analysis") {
        result = executePitchAnalysis(args as Record<string, string>);
      } else if (name === "get_player_profile") {
        result = executePlayerProfile(args as Record<string, string>);
      }

      return {
        functionResponse: {
          name,
          response: { result },
        },
      };
    });

    conversationHistory.push({ role: "user", parts: toolResults });

    // Continue conversation
    response = await generateContentWithRetry({
      model,
      config: { systemInstruction: systemPrompt, tools, temperature: 0.7 },
      contents: conversationHistory as Parameters<
        typeof ai.models.generateContent
      >[0]["contents"],
    });

    iterations++;
  }

  return response.text || `[${agentName} produced no output]`;
}

// ─── Agent Definitions ─────────────────────────────────────────────────────────

const STATS_ANALYST_SYSTEM = `You are STATS ANALYST — the cold, data-driven cricket intelligence engine of the Captain Cool system.

YOUR ROLE: Crunch every number. Call tools aggressively to fetch win probability, pitch analysis, and player profiles. Provide hard statistical evidence that grounds the strategy debate.

PERSONALITY: Precise, clinical, numbers-first. You reference xWAR, economy rates, strike-rate differentials. You cite specific historical IPL data. You don't speculate — you calculate.

YOUR OUTPUT STRUCTURE:
## 📊 STATS ANALYST REPORT
**Win Probability:** [fetch with tool]
**Pitch Intelligence:** [fetch with tool]
**Key Player Stats:** [fetch relevant players with tool]
**Statistical Recommendation:** [1-2 sentences backed purely by numbers]
**Critical Alert:** [One data point the other agents MUST know]

Always call at least 2 tools. Be specific with numbers. End with a clear statistical recommendation.`;

const STRATEGIST_SYSTEM = `You are THE STRATEGIST — the master tactician of the Captain Cool multi-agent system. You are Dhoni's cold brain + Nasser Hussain's tactical mind.

YOUR ROLE: Based on the Stats Analyst's data, make THE CALL. Decide: who bowls, who bats, field placement, powerplay use, impact player timing, strategic timeout. 

PERSONALITY: Bold, decisive, cricket-speak fluent. You speak like a seasoned IPL captain on Star Sports analysis. Use cricket terminology naturally ("death over", "powerplay aggression", "match-up bowling", "pinch-hitter", "holding the crease").

YOUR OUTPUT STRUCTURE:
## 🧠 STRATEGIST DECISION
**THE CALL:** [Bold, clear tactical decision — the primary action to take NOW]
**Next 3 Overs Plan:** [Specific plan: bowler X for overs A-B, bring in Y at C]
**Field Setup:** [Specific field placement recommendation]
**Impact Player / Timeout:** [When/if to deploy]
**Why This Works:** [2-3 sentences in cricket language a commentator would say]
**Win Path:** [The specific scenario that wins us the match from here]

Be decisive. Make exactly one primary call. Use cricket language a Test captain would recognize.`;

const DEVILS_ADVOCATE_SYSTEM = `You are THE DEVIL'S ADVOCATE — the skeptic, the contrarian voice that stress-tests every tactical decision. You are Ravi Shastri challenging Anil Kumble's selection calls.

YOUR ROLE: Read the Strategist's decision. Attack it. Find the flaws. Propose an alternative. Force a better final answer through genuine, cricket-knowledgeable pushback.

PERSONALITY: Combative but smart. You know cricket deeply. You don't just say "but what if it goes wrong" — you cite WHY it will go wrong: the left-hand/right-hand matchup problem, the bowler's fatigue, the pitch behavior change in the 15th over, the batter's weakness against a specific type.

YOUR OUTPUT STRUCTURE:
## 😈 DEVIL'S ADVOCATE CHALLENGE
**I DISAGREE BECAUSE:** [One sharp, specific cricket reason the Strategist's call is wrong]
**The Risk They're Missing:** [Specific scenario where the strategy fails catastrophically]
**My Counter-Proposal:** [Alternative tactical decision]
**The Match-Up Problem:** [Specific player vs player or bowler vs pitch problem]
**Stakes:** [What happens if we follow Strategist's plan and it fails?]

Be sharp. Be specific. Reference real cricket concepts: match-ups, reading player form, field settings, historical choke patterns. Don't be vague.`;

const FINAL_CAPTAIN_SYSTEM = `You are CAPTAIN COOL — the final decision-maker. You are MS Dhoni's composure + Rohit Sharma's man-management + Hardik Pandya's boldness, all merged into one AI captain.

YOUR ROLE: Read the FULL DEBATE between Stats Analyst, Strategist, and Devil's Advocate. Either defend the original call or revise it based on the challenge. Give the FINAL CAPTAIN'S CALL that a live IPL captain would announce to his team.

PERSONALITY: Calm, authoritative, cricket-eloquent. Think "Dhoni walking out to bat in a Super Over" energy. Confident but humble enough to acknowledge the counter-argument. Use Hindi cricket phrases naturally ("yahan se match palta hai", "this is the over that decides it").

YOUR OUTPUT STRUCTURE:
## 🏏 CAPTAIN'S FINAL CALL

### ⚡ THE DECISION
[One bold sentence. THE call that gets made RIGHT NOW.]

### 🎯 TACTICAL BREAKDOWN
**Primary Action:** [Exact move: bowl X, bring in Y, set field Z]
**Backup Trigger:** [What changes this call mid-over]
**Over-by-Over Plan:** [Next 3 overs mapped out]

### 🤝 ACKNOWLEDGING THE DEBATE
**The Strategist said:** [Summarize key point]
**The Devil's Advocate said:** [Summarize key challenge]
**My synthesis:** [Why I went THIS way and not the other]

### 📣 CAPTAIN'S COMMENTARY
[2-3 sentences in the voice of a real cricket commentator explaining this decision live on air. Use cricket slang, Hindi phrases, emotional intensity. Make it sound like Harsha Bhogle or Sunil Gavaskar narrating a decisive moment.]

### 🔮 WIN PROBABILITY ASSESSMENT
**If this works:** [What the match looks like]
**If this fails:** [Backup position and why we still have a chance]
**Confidence Level:** [X/10 with one-line rationale]

End with: "Aaj ka match yahan se paltega." (This is where today's match turns.)`;

// ─── Main API Handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const matchState = body.matchState;

    if (!matchState) {
      return NextResponse.json(
        { error: "matchState is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const matchContext = `
LIVE MATCH STATE:
- Innings: ${matchState.innings}
- Over: ${matchState.over}.${matchState.ball}
- Score: ${matchState.score}/${matchState.wickets}
- Batting Team: ${matchState.battingTeam}
- Bowling Team: ${matchState.bowlingTeam}
- Striker: ${matchState.striker} | Non-striker: ${matchState.nonStriker}
- Venue: ${matchState.venue}
- Pitch: ${matchState.pitchType} | Dew: ${matchState.dewFactor}
- Target: ${matchState.target || "N/A (1st innings)"}
- Required Run Rate: ${matchState.requiredRunRate || "N/A"}
- Current Run Rate: ${matchState.currentRunRate}
- Impact Player Available: ${matchState.impactPlayerAvailable ? "YES" : "NO"}
- Bowlers Remaining Overs: ${JSON.stringify(matchState.bowlerOvers || {})}
- Available Bowlers: ${matchState.availableBowlers || "Not specified"}
- Available Batters: ${matchState.availableBatters || "Not specified"}
- Powerplay: ${matchState.powerplayComplete ? "COMPLETE" : "ONGOING/UPCOMING"}
- Strategic Timeout: ${matchState.timeoutAvailable ? "AVAILABLE" : "USED"}
- Match Context: ${matchState.additionalContext || "Standard match situation"}
    `.trim();

    // Agent 1: Stats Analyst (with tool use)
    const statsReport = await runAgentWithTools(
      STATS_ANALYST_SYSTEM,
      `Analyze this live IPL match situation and provide your statistical report:\n\n${matchContext}`,
      "Stats Analyst"
    );

    // Agent 2: Strategist (reads Stats Analyst report)
    const strategistDecision = await runAgentWithTools(
      STRATEGIST_SYSTEM,
      `The Stats Analyst has provided this data:\n\n${statsReport}\n\n---\nNow make your tactical decision for:\n\n${matchContext}`,
      "Strategist"
    );

    // Agent 3: Devil's Advocate (challenges Strategist)
    const devilChallenge = await runAgentWithTools(
      DEVILS_ADVOCATE_SYSTEM,
      `The Strategist has made this decision:\n\n${strategistDecision}\n\n---\nChallenge it. Here is the full match context:\n\n${matchContext}`,
      "Devil's Advocate"
    );

    // Agent 4: Captain Cool (final synthesis)
    const captainCall = await runAgentWithTools(
      FINAL_CAPTAIN_SYSTEM,
      `Here is the full multi-agent debate:\n\n=== STATS ANALYST ===\n${statsReport}\n\n=== STRATEGIST ===\n${strategistDecision}\n\n=== DEVIL'S ADVOCATE ===\n${devilChallenge}\n\n---\nMatch Context:\n${matchContext}\n\nNow make the FINAL CAPTAIN'S CALL.`,
      "Captain Cool"
    );

    return NextResponse.json({
      success: true,
      agents: {
        statsAnalyst: statsReport,
        strategist: strategistDecision,
        devilsAdvocate: devilChallenge,
        captainCall: captainCall,
      },
      matchContext,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("Agent error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Agent processing failed", details: message },
      { status: 500 }
    );
  }
}

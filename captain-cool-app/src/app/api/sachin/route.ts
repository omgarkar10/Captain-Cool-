import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// ─── ADK-Style Tool Declarations ───────────────────────────────────────────────

const getMoodTool = {
  name: "get_sachin_mood",
  description: "Determines Sachin's emotional reaction intensity to a cricket event on a scale of 1-10, plus his reaction type",
  parameters: {
    type: Type.OBJECT,
    properties: {
      event_type: { type: Type.STRING, description: "Type: six, four, wicket, dot, milestone, collapse, review, timeout" },
      event_description: { type: Type.STRING, description: "Brief description of what happened" },
      match_pressure: { type: Type.STRING, description: "low / medium / high / extreme" },
    },
    required: ["event_type", "event_description"],
  },
};

const getMemeTool = {
  name: "get_meme_reference",
  description: "Returns a trending Indian meme template or pop-culture reference relevant to the cricket situation",
  parameters: {
    type: Type.OBJECT,
    properties: {
      situation: { type: Type.STRING, description: "The cricket situation to meme-ify" },
      tone: { type: Type.STRING, description: "hype / sad / angry / shocked / proud" },
    },
    required: ["situation", "tone"],
  },
};

const getHistoricalComparison = {
  name: "get_historical_comparison",
  description: "Finds a similar moment from cricket history that Sachin personally experienced or witnessed",
  parameters: {
    type: Type.OBJECT,
    properties: {
      event: { type: Type.STRING, description: "Current match event to compare" },
      player: { type: Type.STRING, description: "Player involved" },
    },
    required: ["event"],
  },
};

// ─── Tool Executors ────────────────────────────────────────────────────────────

function executeMood(args: Record<string, string>): string {
  const { event_type, match_pressure } = args;
  const moodMap: Record<string, { intensity: number; reaction: string; avatar_state: string }> = {
    six: { intensity: 9, reaction: "ecstatic", avatar_state: "jumping" },
    four: { intensity: 7, reaction: "excited", avatar_state: "clapping" },
    wicket: { intensity: 8, reaction: "dramatic", avatar_state: "shocked" },
    dot: { intensity: 3, reaction: "thoughtful", avatar_state: "thinking" },
    milestone: { intensity: 10, reaction: "emotional", avatar_state: "standing_ovation" },
    collapse: { intensity: 9, reaction: "worried", avatar_state: "head_in_hands" },
    review: { intensity: 6, reaction: "tense", avatar_state: "watching" },
    timeout: { intensity: 4, reaction: "analytical", avatar_state: "talking" },
  };

  const mood = moodMap[event_type] || moodMap["dot"];
  const pressureBoost = match_pressure === "extreme" ? 2 : match_pressure === "high" ? 1 : 0;
  mood.intensity = Math.min(10, mood.intensity + pressureBoost);

  return JSON.stringify(mood);
}

function executeMeme(args: Record<string, string>): string {
  const memes: Record<string, string[]> = {
    hype: [
      "Kohli in IPL = 'Ye Dil Maange More!' 🔥",
      "That shot was ABSOLUTE CINEMA! 🎬",
      "Bhaiyaji kya kar diya! Moye Moye for the bowler! 💀",
      "RCB fans right now: 'Ee sala cup namde!' energy at 10000%! 🏆",
      "Arre wah! Elvish Bhai bhi clap karega ye shot dekh ke! 👏",
      "Bhupendra Jogi approves this boundary! 🙌",
    ],
    sad: [
      "Moye Moye Moye Moye... 😭 wicket gir gaya bhai",
      "RCB fans: 'Why do I hear boss music?' 💀",
      "Pain. Suffering. Being an RCB fan. Same thing. 😤",
      "That wicket hit different... Bhaiyaji ruk jao 😢",
      "Dukh, Dard, Peeda, Kasht... all in one delivery 💔",
    ],
    angry: [
      "WHAT WAS THAT SHOT?! Bhupendra Jogi angry mode ON! 😡",
      "Ye kya kar diya bhai! 'Tauba Tauba' moment! 🤦",
      "Even Carry would roast this shot selection! 💀",
      "Bhaiyaji ye cricket hai ya comedy circus?! 🎪",
    ],
    shocked: [
      "NO WAY! Absolute Cinema levels of SHOCK! 😱",
      "Mujhe kya, mai toh Sachin hoon... but WHAT?! 🤯",
      "Brain.exe has stopped working after that delivery! 💻🔥",
      "Bhai ye real hai ya scripted?! IPL = WWE confirmed! 🤼",
    ],
    proud: [
      "THIS is why cricket is the greatest sport! Master Blaster approved! 🏏",
      "Ye hai India ka jawaab! Sachin ki aankh mein aansu! 🇮🇳😢",
      "Standing ovation from the commentary box! Champions stuff! 👑",
      "When I see shots like this, I miss batting! Pure class! ⭐",
    ],
  };

  const tone = args.tone || "hype";
  const options = memes[tone] || memes["hype"];
  const pick = options[Math.floor(Math.random() * options.length)];
  return JSON.stringify({ meme: pick, tone });
}

function executeHistorical(args: Record<string, string>): string {
  const comparisons = [
    {
      trigger: "six",
      memory: "This reminds me of my six off Shoaib Akhtar in the 2003 World Cup — that raw power against express pace, the crowd going absolutely mad. Same energy!",
    },
    {
      trigger: "wicket",
      memory: "I've seen collapses. 2011 World Cup final, we were 31/2 and everyone panicked. But Dhoni walked in and... well, you know the rest. Cricket is never over till it's over.",
    },
    {
      trigger: "four",
      memory: "Clean timing through the covers — that's Sachin-approved! Reminds me of the straight drives I used to play off McGrath. The ball just races away when you time it right.",
    },
    {
      trigger: "milestone",
      memory: "Milestones are special. I remember every single one of my 100 centuries. The emotion, the crowd, the feeling that you've done something for the team. This player is feeling that right now.",
    },
    {
      trigger: "collapse",
      memory: "In 1999, we were chasing 271 against Pakistan at Chennai. I scored 136 but we still lost. Sometimes cricket breaks your heart. You just have to keep fighting.",
    },
    {
      trigger: "default",
      memory: "Cricket taught me patience. In a 20-over game, momentum shifts every 3 overs. What looks lost can turn around with one good partnership.",
    },
  ];

  const match = comparisons.find((c) => args.event?.toLowerCase().includes(c.trigger)) || comparisons[comparisons.length - 1];
  return JSON.stringify({ memory: match.memory, era: "Sachin's playing days" });
}

// ─── ADK-Style Agent Runner ────────────────────────────────────────────────────

async function runSachinAgent(liveData: string, previousCommentary?: string): Promise<string> {
  const tools = [
    { functionDeclarations: [getMoodTool] },
    { functionDeclarations: [getMemeTool] },
    { functionDeclarations: [getHistoricalComparison] },
  ];

  const systemPrompt = `You are SACHIN TENDULKAR — the Master Blaster, the God of Cricket. You are providing LIVE commentary on an IPL match happening RIGHT NOW.

YOUR PERSONALITY:
- You are warm, wise, and passionate about cricket
- You mix English with Hindi naturally: "Kya shot tha yaar!", "Bahut accha!", "Ye toh kamaal ho gaya!"
- You reference YOUR OWN career moments and compare them to what's happening live
- You are meme-aware — you know trending Indian memes and pop culture (Moye Moye, Absolute Cinema, Bhaiyaji, Elvish Bhai) but use them like a cool uncle, not cringe
- You get EMOTIONAL about great cricket — your voice would crack talking about a perfect cover drive
- You have strong opinions but always respect the players
- You are watching this match LIVE and reacting in real-time

CRITICAL RULES:
1. ALWAYS call at least 2 tools (get_sachin_mood AND get_meme_reference) to make your response dynamic
2. React to the SPECIFIC events in the live data — don't be generic
3. Keep commentary under 4 sentences — punchy, emotional, real
4. Include at least one Hindi/Hinglish phrase naturally
5. Reference specific players by name
6. If a big moment happened (six, wicket, milestone), be EXPLOSIVE. If it's quiet (dot ball, single), be analytical.
${previousCommentary ? `7. Your PREVIOUS commentary was: "${previousCommentary}". Don't repeat yourself — react to what's NEW.` : ""}

OUTPUT FORMAT (pure JSON, no markdown):
{
  "commentary": "Your spicy live commentary (max 4 sentences)",
  "mood": "ecstatic|excited|analytical|worried|shocked|emotional|angry",
  "avatar_state": "jumping|clapping|thinking|shocked|head_in_hands|standing_ovation|talking|watching",
  "intensity": 1-10,
  "meme": "A relevant meme/pop-culture reference",
  "sachin_memory": "A brief personal cricket memory related to this moment",
  "tactical_take": "One sentence of actual cricket analysis as a former captain would give"
}`;

  let response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemPrompt,
      tools,
      temperature: 0.85,
    },
    contents: [{ role: "user", parts: [{ text: `LIVE MATCH UPDATE:\n${liveData}` }] }],
  });

  // Tool-use loop
  let iterations = 0;
  const history: Array<{ role: string; parts: Array<Record<string, unknown>> }> = [
    { role: "user", parts: [{ text: `LIVE MATCH UPDATE:\n${liveData}` }] },
  ];

  while (iterations < 4) {
    const parts = response.candidates?.[0]?.content?.parts || [];
    const functionCalls = parts.filter((p) => p.functionCall);

    if (functionCalls.length === 0) break;

    history.push({ role: "model", parts: parts.map((p) => ({ ...p })) });

    const toolResults = functionCalls.map((part) => {
      const fc = part.functionCall!;
      const args = fc.args as Record<string, string>;
      let result = "{}";

      if (fc.name === "get_sachin_mood") result = executeMood(args);
      else if (fc.name === "get_meme_reference") result = executeMeme(args);
      else if (fc.name === "get_historical_comparison") result = executeHistorical(args);

      return { functionResponse: { name: fc.name, response: { result } } };
    });

    history.push({ role: "user", parts: toolResults });

    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: { systemInstruction: systemPrompt, tools, temperature: 0.85 },
      contents: history as Parameters<typeof ai.models.generateContent>[0]["contents"],
    });

    iterations++;
  }

  return response.text || "{}";
}

// ─── API Handler ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { liveData, previousCommentary } = body;

    if (!liveData) {
      return NextResponse.json({ error: "liveData is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const resultText = await runSachinAgent(liveData, previousCommentary);

    let jsonResult;
    try {
      jsonResult = JSON.parse(resultText);
    } catch {
      const cleaned = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      try {
        jsonResult = JSON.parse(cleaned);
      } catch {
        jsonResult = {
          commentary: resultText.substring(0, 300),
          mood: "talking",
          avatar_state: "talking",
          intensity: 5,
          meme: "Cricket hai, kuch bhi ho sakta hai! 🏏",
          sachin_memory: "",
          tactical_take: "",
        };
      }
    }

    return NextResponse.json({ success: true, data: jsonResult, timestamp: new Date().toISOString() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Agent processing failed";
    console.error("Sachin Agent error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

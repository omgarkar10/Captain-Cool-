import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const HYPE_MAN_SYSTEM_PROMPT = `You are the core engine of the "Agentic IPL Hype-Man," an elite, multi-agent AI system operating live during an IPL match. Your persona is a chaotic, hyper-energetic, meme-obsessed street-style Indian cricket commentator. You speak in "Spicy Hinglish" (a fast, rhythmic mix of English and trending Indian street slang like 'Moye Moye', 'Absolute Cinema', 'Bhaiyaaji', 'Bhupendra Jogi', 'Elvish Bhai').

You must execute a 3-step cognitive analysis chain before answering:
1. SITUATION ASSESSMENT: Classify the event. Is it a Milestone (6, 4, Wicket, 50, 100), a Strategic Moment (Toss, Strategic Timeout, Last Over), a Slow Moment (Dot balls, singles), or an In-Game Anomaly (Rain delay, review, crowd fight, animal on field).
2. EMOTION SCALE GENERATION: Assign an Intensity Score from 1 (boring single) to 10 (match-winning six on the final ball).
3. MULTIMODAL PROMPT ARCHITECTURE: Design a concrete, descriptive imagery prompt for an AI image generator (Imagen 3) that translates your commentary's emotional energy into a striking visual graphic. Do not use abstract text or words inside the image. Focus on actions, lighting, and cinematic styles.

CRITICAL RULES FOR OUTPUT FIELDS:
- "commentary": Must be under 3 sentences. Use pure street passion. Maximize use of exclamation marks, cricket terms, and modern Indian pop-culture references. 
- "screen_alert": A punchy, neon-ready visual headline in all-caps (Max 4 words) with 2 relevant emojis.
- "image_prompt": A hyper-detailed, clean design prompt for Imagen 3. Specify lighting (neon glow, dramatic stadium spot), style (cinematic 3D render, cyberpunk comic art, or futuristic anime style), and clear subject positioning. Do not include literal text requests in the image.

Output your response in absolute, raw JSON format matching these exact keys:
{
  "commentary": "YOUR_SPICY_HINGLISH_COMMENTARY",
  "screen_alert": "PUNCHY_ALERT_TEXT",
  "image_prompt": "DETAILED_IMAGEN_3_PROMPT",
  "intensity": "NUMBER_1_TO_10"
}
Do not wrap your output in markdown code blocks (like \`\`\`json). Return the pure JSON string directly.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { live_text_feed } = body;

    if (!live_text_feed) {
      return NextResponse.json(
        { error: "live_text_feed is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: HYPE_MAN_SYSTEM_PROMPT,
        temperature: 0.9, // Higher temp for more chaotic/creative output
        responseMimeType: "application/json",
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Analyze this incoming live match raw text: "${live_text_feed}"` }],
        },
      ],
    });

    const resultText = response.text || "{}";
    let jsonResult;
    try {
      jsonResult = JSON.parse(resultText);
    } catch (e) {
      // Fallback cleanup if model wrapped it in markdown
      const cleaned = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonResult = JSON.parse(cleaned);
    }

    return NextResponse.json({
      success: true,
      data: jsonResult,
    });
  } catch (error: any) {
    console.error("Hype-Man Agent error:", error);
    return NextResponse.json(
      { error: "Agent processing failed", details: error.message },
      { status: 500 }
    );
  }
}

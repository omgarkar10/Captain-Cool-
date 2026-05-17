import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateContentWithRetry(
  requestOptions: any,
  maxRetries = 5
) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(requestOptions);
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isRateLimit) {
        attempt++;
        
        if (attempt >= maxRetries) {
          throw error;
        }
        
        // Try to parse the "retry in Xs" from the error message
        let waitTime = 15; // default 15s
        const match = error?.message?.match(/retry in ([\d\.]+)s/);
        if (match && match[1]) {
          waitTime = Math.ceil(parseFloat(match[1]));
        } else {
          waitTime = 15 * attempt;
        }

        // If the wait time is too long, fail fast so the UI doesn't hang forever
        if (waitTime > 10) {
          throw new Error(`Gemini API Rate Limit Exceeded. Please wait ${waitTime} seconds before trying again.`);
        }
        
        console.warn(`[Gemini API] Rate limited (429). Attempt ${attempt}/${maxRetries}. Waiting ${waitTime}s...`);
        await sleep(waitTime * 1000);
      } else {
        throw error;
      }
    }
  }
  
  throw new Error("Max retries exceeded for Gemini API call");
}

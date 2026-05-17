# How I Built "Captain Cool": A Multi-Agent AI IPL Strategist for GDG Cloud Pune's Agentic Premier League

**By Om Garkar**

Have you ever wondered what goes on inside MS Dhoni’s mind during a high-pressure IPL chase? What if we could recreate that legendary tactical brilliance using Artificial Intelligence? 

For the **GDG Cloud Pune Agentic Premier League**, I decided to build exactly that. Meet **Captain Cool**, a live, multi-agent IPL match strategist powered by Google’s Gemini 2.5 Flash. 

Instead of building a simple chatbot that gives generic cricket advice, I built a "War Room" of AI agents that debate, challenge, and synthesize data in real-time to make the ultimate captain’s call. Here is a look under the hood at how I built it.

---

## 🧠 The Multi-Agent War Room

The core of Captain Cool isn't just one AI—it's a team of four distinct Gemini agents, each with a specific persona and system prompt. When a live match situation is fed into the system, here is how the pipeline flows:

1. **📊 The Stats Analyst (Tool-Augmented):** This agent calls external tools to crunch numbers. It calculates live win probability, analyzes pitch conditions (dew factor, pitch type), and pulls up player profiles. It doesn't speculate; it provides cold, hard data.
2. **🧠 The Strategist:** Reading the Stats Analyst’s report, this agent acts like a seasoned IPL coach. It makes the primary tactical call—whether to bring in a spinner, deploy an Impact Player, or set a specific field.
3. **😈 The Devil's Advocate:** This is where it gets interesting. This agent's sole purpose is to ruthlessly attack the Strategist's plan. It looks for match-up flaws, fatigue, and statistical anomalies to force a better decision.
4. **🏏 Captain Cool:** Finally, the Captain reads the entire debate. Synthesizing the stats, the strategy, and the pushback, it makes the **Final Call** in the calm, authoritative voice of MS Dhoni.

By forcing the AI to debate itself, the resulting strategy is incredibly nuanced, deeply analytical, and shockingly realistic.

---

## 🎙️ Bringing in the Master Blaster & The Hype-Man

Cricket isn't just about stats; it's about emotion. To capture the spirit of the IPL, I added two dynamic companion modes:

* **The Sachin Tendulkar Live Dashboard:** A real-time companion that watches the match with you. Using Gemini's function calling, "Sachin" determines the mood of the current ball, pulls up trending Indian memes (like *Moye Moye* or *Absolute Cinema*), and references real historical matches from his playing days. It even uses browser speech synthesis to talk out loud!
* **Live Hype-Man Mode:** For the absolute chaos of T20 cricket, this agent speaks in "Spicy Hinglish." You feed it a match event, and it instantly generates hype commentary, a neon screen alert, and a highly-detailed prompt designed specifically for **Google Imagen 3** to generate live match graphics.

---

## 🚧 Overcoming API Rate Limits

Building a Multi-Agent system on the Gemini Free Tier came with a massive technical hurdle: **Rate Limits.**

Gemini 2.5 Flash allows 15 requests per minute on the free tier. Because my agents use a recursive tool-calling loop, a *single* click of the "Analyze" button was secretly firing up to 20 API requests in the background! The system was hitting the `429 RESOURCE_EXHAUSTED` limit almost instantly.

**The Solution:** 
I engineered a smart retry utility (`geminiWithRetry`) that automatically intercepts `429` errors. Instead of crashing the app, it dynamically reads the `retry in Xs` message from Google's API, pauses execution, and utilizes exponential backoff to pace the agents. I also optimized the agent loops, reducing maximum iterations by 50% while maintaining the quality of the debate. 

---

## 🚀 Conclusion

The GDG Cloud Pune Agentic Premier League challenged us to push the boundaries of what AI agents can do. With **Captain Cool**, I learned that the true power of LLMs isn't in a single prompt, but in **Agentic Orchestration**—chaining models together, giving them tools, and letting them argue until they find the perfect solution.

Whether you need a tactical breakdown of a Virat Kohli cover drive or a chaotic meme about an RCB collapse, Captain Cool has you covered.

*Built with Next.js, Tailwind CSS, and the Google Gen AI SDK.*

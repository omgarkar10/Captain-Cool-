    # 🏏 Captain Cool — Multi-Agent IPL Match Strategist

> **Built on Google Gemini 2.5 Flash** | APL 2025 Submission | Multi-Agent AI System

[![Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini%202.5%20Flash-blue?logo=google)](https://ai.google.dev/)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## 🎯 What Is This?

An **agentic AI system** that acts as a virtual IPL captain — making tactical decisions the way Dhoni, Rohit, or Hardik would. Plus a **live Sachin Tendulkar AI companion** that reacts to IPL matches with memes, memories, and spicy Hinglish commentary that **talks out loud**!

Input the current match state → 5 specialized Gemini agents debate in real-time → Get the captain's optimal tactical call.

---

## 🚀 Three Modes

### 🏏 Sachin LIVE Mode (Default)
- **Live Scoreboard** — Real-time match data with animated ball-by-ball feed
- **Sachin Tendulkar AI** — Reacts to live match events as the Master Blaster
- **Voice Commentary** — Speaks the commentary OUT LOUD using Web Speech API
- **Meme Engine** — Generates Indian meme references (Moye Moye, Absolute Cinema)
- **Sachin Memories** — References personal cricket history from his career
- **Tactical Analysis** — Expert cricket analysis from the God of Cricket
- **Auto Mode** — Auto-refreshes every 25 seconds for hands-free commentary

### 🧠 Captain Strategist Mode
- **4 Gemini Agents** debate the next tactical decision
- **3 Preset Scenarios** — Classic CSK Chase, MI Death Over Crisis, KKR Powerplay
- **Function Calling** — Real tool use for win probability, pitch analysis, player profiles
- **Multi-Turn Reasoning** — Full agent debate loop with dissenting opinions

### 🎙️ Hype-Man Mode
- Feed a live event → Get explosive Hinglish commentary
- **Screen Alert** — Massive neon animated text
- **Audio Output** — Speaks the hype commentary aloud
- **Imagen Prompt** — Generates prompts for Google Imagen 3

---

## 🤖 The 5 Gemini Agents

```
📊 Stats Analyst → 🧠 Strategist → 😈 Devil's Advocate → 🏏 Captain Cool → 🎙️ Sachin
```

| Agent | Role | Gemini Feature |
|-------|------|----------------|
| **📊 Stats Analyst** | Fetches win probability, pitch analysis, player profiles | Function calling / Tool use |
| **🧠 Strategist** | Makes THE tactical call — bowling, batting, field setup | Multi-turn reasoning |
| **😈 Devil's Advocate** | Challenges the strategy with cricket-smart counter-arguments | Adversarial prompting |
| **🏏 Captain Cool** | Final synthesis — Dhoni's calm + Rohit's instinct + Hardik's boldness | Multi-agent synthesis |
| **🎙️ Sachin AI** | Live commentary with mood, memes, memories, and tactical takes | Function calling + Tool use |

---

## 🔧 Real Tool Use (Gemini Function Calling)

The **Stats Analyst** uses Gemini function calling with 3 tools:

1. **`get_win_probability`** — Calculates live win probability based on match state
2. **`get_pitch_analysis`** — Returns bowler type recommendations, batting approach based on venue + pitch + dew
3. **`get_player_profile`** — Fetches player stats and recent form

The **Sachin Agent** uses 3 additional tools:

4. **`get_sachin_mood`** — Determines emotional reaction intensity (1-10) and avatar state
5. **`get_meme_reference`** — Returns trending Indian meme references matching the cricket situation
6. **`get_historical_comparison`** — Finds similar moments from Sachin's playing career

---

## 💬 Multi-Turn Reasoning Loop

```
1. Stats Analyst analyzes match → calls tools → produces statistical report
2. Strategist reads report → makes THE CALL with cricket reasoning
3. Devil's Advocate attacks the call → proposes counter-strategy
4. Captain Cool synthesizes the debate → delivers final captain's decision
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│                  Next.js Frontend                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │Sachin Live│  │Strategist│  │  Hype-Man    │   │
│  │Dashboard  │  │  Form    │  │   Panel      │   │
│  └─────┬────┘  └────┬─────┘  └──────┬───────┘   │
│        │             │               │            │
│  ┌─────▼─────────────▼───────────────▼─────────┐ │
│  │            API Routes (Server)               │ │
│  │  /api/sachin  /api/analyze  /api/hype        │ │
│  │  /api/live-match                             │ │
│  └─────┬─────────────┬───────────────┬─────────┘ │
└────────┼─────────────┼───────────────┼───────────┘
         │             │               │
   ┌─────▼─────┐ ┌────▼────┐   ┌─────▼─────┐
   │  Gemini   │ │ Gemini  │   │  Gemini   │
   │  Sachin   │ │ 4-Agent │   │  Hype-Man │
   │  Agent    │ │ Pipeline│   │  Agent    │
   │ (3 tools) │ │(3 tools)│   │           │
   └───────────┘ └─────────┘   └───────────┘
```

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-repo/captain-cool.git
cd captain-cool/captain-cool-app

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 4. Start the dev server
npm run dev

# 5. Open http://localhost:3000
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Google Gemini 2.5 Flash** | All agent reasoning, function calling, multi-turn |
| **Next.js 15** | Full-stack React framework (App Router) |
| **TypeScript** | Type-safe codebase |
| **Tailwind CSS v4** | Utility-first styling with custom animations |
| **Web Speech API** | Browser-native text-to-speech for live commentary |
| **Framer Motion** | UI animations and transitions |

---

## 📁 Project Structure

```
captain-cool-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts    # 4-agent strategist pipeline
│   │   │   ├── sachin/route.ts     # Sachin Tendulkar AI (3 tools)
│   │   │   ├── hype/route.ts       # Hype-Man commentary agent
│   │   │   └── live-match/route.ts # Live match data scraper
│   │   ├── globals.css             # Premium animations & effects
│   │   ├── layout.tsx              # Root layout with SEO
│   │   └── page.tsx                # Main page with 3-mode switcher
│   ├── components/
│   │   ├── SachinLiveDashboard.tsx  # Live avatar + commentary + memes
│   │   ├── MatchInputForm.tsx       # Match state input with presets
│   │   ├── AgentDebatePanel.tsx     # 4-agent debate visualization
│   │   ├── HypeManPanel.tsx         # Hype commentary panel
│   │   └── HeroSection.tsx          # Animated hero with feature pills
│   └── types/
│       └── index.ts                 # Shared TypeScript types
├── .env.local                       # GEMINI_API_KEY
└── package.json
```

---

## 🏆 APL Evaluation Criteria Coverage

| Criteria | How We Deliver |
|----------|---------------|
| **Gemini API** | ✅ All 5 agents use `gemini-2.5-flash` exclusively |
| **Function Calling** | ✅ 6 custom tools across agents |
| **Multi-Agent** | ✅ 4-agent debate pipeline + Sachin agent |
| **Multi-Turn** | ✅ Tool-use loops with up to 5 iterations |
| **Creativity** | ✅ Sachin persona, meme engine, voice output |
| **UI/UX** | ✅ Premium dark theme, animations, glassmorphism |
| **Live Features** | ✅ Real-time match data, auto-commenting, voice |

---

**Made with 🏏 and Google Gemini**

export interface MatchState {
  innings: 1 | 2;
  over: number;
  ball: number;
  score: number;
  wickets: number;
  battingTeam: string;
  bowlingTeam: string;
  striker: string;
  nonStriker: string;
  venue: string;
  pitchType: "turning" | "flat" | "two-paced" | "green-top";
  dewFactor: "none" | "light" | "heavy";
  target?: number;
  requiredRunRate?: number;
  currentRunRate: number;
  impactPlayerAvailable: boolean;
  bowlerOvers: Record<string, number>;
  availableBowlers?: string;
  availableBatters?: string;
  powerplayComplete: boolean;
  timeoutAvailable: boolean;
  additionalContext?: string;
}

export interface AgentResponse {
  statsAnalyst: string;
  strategist: string;
  devilsAdvocate: string;
  captainCall: string;
}

export interface AnalysisResult {
  success: boolean;
  agents: AgentResponse;
  matchContext: string;
  timestamp: string;
  error?: string;
  details?: string;
}

export type AgentTab = "statsAnalyst" | "strategist" | "devilsAdvocate" | "captainCall";

export interface AgentTabConfig {
  key: AgentTab;
  label: string;
  icon: string;
  color: string;
  gradient: string;
}

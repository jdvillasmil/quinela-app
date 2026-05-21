export type UserRole = 'user' | 'admin'
export type MatchPhase = 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final'
export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Profile {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  rules_accepted_at: string | null
}

export interface Match {
  id: number
  match_number: number
  phase: MatchPhase
  group_name: string | null
  home_team: string
  away_team: string
  home_flag: string | null
  away_flag: string | null
  match_date: string
  venue: string | null
  home_score: number | null
  away_score: number | null
  status: MatchStatus
  api_match_id: string | null
}

export interface Prediction {
  id: number
  user_id: string
  match_id: number
  predicted_home: number
  predicted_away: number
  points_earned: number
  created_at: string
}

export interface GroupPrediction {
  id: number
  user_id: string
  group_name: string
  first_place: string
  second_place: string
  points_earned: number
}

export interface SpecialPrediction {
  id: number
  user_id: string
  top_scorer: string | null
  best_player: string | null
  best_keeper: string | null
  total_goals: number | null
  most_red_cards: string | null
  most_goals_match: string | null
  fastest_goal_team: string | null
  points_earned: number
  created_at: string
}

export interface BracketPrediction {
  id: number
  user_id: string
  match_id: number
  predicted_winner: string
  points_earned: number
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  total_points: number
  group_points: number
  knockout_points: number
  special_points: number
  rank: number
}

// Minimal Supabase Database type — expand as tables are created in Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id'>
        Update: Partial<Omit<Match, 'id'>>
      }
      predictions: {
        Row: Prediction
        Insert: Omit<Prediction, 'id' | 'created_at'>
        Update: Partial<Pick<Prediction, 'predicted_home' | 'predicted_away' | 'points_earned'>>
      }
      group_predictions: {
        Row: GroupPrediction
        Insert: Omit<GroupPrediction, 'id'>
        Update: Partial<Omit<GroupPrediction, 'id' | 'user_id'>>
      }
      special_predictions: {
        Row: SpecialPrediction
        Insert: Omit<SpecialPrediction, 'id' | 'created_at'>
        Update: Partial<Omit<SpecialPrediction, 'id' | 'user_id' | 'created_at'>>
      }
      bracket_predictions: {
        Row: BracketPrediction
        Insert: Omit<BracketPrediction, 'id'>
        Update: Partial<Pick<BracketPrediction, 'predicted_winner' | 'points_earned'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      guests: {
        Row: {
          created_at: string
          id: string
          last_seen: string
          nickname: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen?: string
          nickname: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen?: string
          nickname?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          draws: number
          game: Database["public"]["Enums"]["game_type"]
          guest_id: string
          losses: number
          rating: number
          updated_at: string
          wins: number
        }
        Insert: {
          draws?: number
          game: Database["public"]["Enums"]["game_type"]
          guest_id: string
          losses?: number
          rating?: number
          updated_at?: string
          wins?: number
        }
        Update: {
          draws?: number
          game?: Database["public"]["Enums"]["game_type"]
          guest_id?: string
          losses?: number
          rating?: number
          updated_at?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          current_turn: number
          finished_at: string | null
          game: Database["public"]["Enums"]["game_type"]
          id: string
          mode: Database["public"]["Enums"]["match_mode"]
          player1_id: string | null
          player1_nickname: string | null
          player2_id: string | null
          player2_nickname: string | null
          room_code: string | null
          state: Json
          status: Database["public"]["Enums"]["match_status"]
          tournament_id: string | null
          updated_at: string
          winner: number | null
        }
        Insert: {
          created_at?: string
          current_turn?: number
          finished_at?: string | null
          game: Database["public"]["Enums"]["game_type"]
          id?: string
          mode?: Database["public"]["Enums"]["match_mode"]
          player1_id?: string | null
          player1_nickname?: string | null
          player2_id?: string | null
          player2_nickname?: string | null
          room_code?: string | null
          state?: Json
          status?: Database["public"]["Enums"]["match_status"]
          tournament_id?: string | null
          updated_at?: string
          winner?: number | null
        }
        Update: {
          created_at?: string
          current_turn?: number
          finished_at?: string | null
          game?: Database["public"]["Enums"]["game_type"]
          id?: string
          mode?: Database["public"]["Enums"]["match_mode"]
          player1_id?: string | null
          player1_nickname?: string | null
          player2_id?: string | null
          player2_nickname?: string | null
          room_code?: string | null
          state?: Json
          status?: Database["public"]["Enums"]["match_status"]
          tournament_id?: string | null
          updated_at?: string
          winner?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          eliminated: boolean
          guest_id: string
          joined_at: string
          nickname: string
          score: number
          tournament_id: string
        }
        Insert: {
          eliminated?: boolean
          guest_id: string
          joined_at?: string
          nickname: string
          score?: number
          tournament_id: string
        }
        Update: {
          eliminated?: boolean
          guest_id?: string
          joined_at?: string
          nickname?: string
          score?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          ends_at: string
          game: Database["public"]["Enums"]["game_type"]
          id: string
          max_players: number
          name: string
          prize_label: string | null
          starts_at: string
          status: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          game: Database["public"]["Enums"]["game_type"]
          id?: string
          max_players?: number
          name: string
          prize_label?: string | null
          starts_at: string
          status?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          game?: Database["public"]["Enums"]["game_type"]
          id?: string
          max_players?: number
          name?: string
          prize_label?: string | null
          starts_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_match_result: { Args: { _match_id: string }; Returns: undefined }
    }
    Enums: {
      game_type: "chess" | "xo" | "ludo"
      match_mode: "matchmaking" | "private" | "tournament"
      match_status: "waiting" | "active" | "finished" | "abandoned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_type: ["chess", "xo", "ludo"],
      match_mode: ["matchmaking", "private", "tournament"],
      match_status: ["waiting", "active", "finished", "abandoned"],
    },
  },
} as const

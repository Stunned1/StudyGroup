// AI-GENERATED: Kiro — TypeScript types generated from live Supabase schema
// AI-ASSISTED: Cursor — profiles.avatar_url column for display and storage URLs
// AI-ASSISTED: ChatGPT (GPT-5) — schedule_classes table types for weekly class schedule
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      lobbies: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          expires_at: string
          host_id: string
          id: string
          location: string
          max_size: number
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          expires_at: string
          host_id: string
          id?: string
          location: string
          max_size?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          expires_at?: string
          host_id?: string
          id?: string
          location?: string
          max_size?: number
        }
        Relationships: [
          {
            foreignKeyName: "lobbies_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lobby_members: {
        Row: {
          joined_at: string
          lobby_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          lobby_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          lobby_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_members_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lobby_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          major: string | null
          name: string
          year: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          major?: string | null
          name: string
          year?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          major?: string | null
          name?: string
          year?: string | null
        }
        Relationships: []
      }
      schedule_classes: {
        Row: {
          color: string
          course_name: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          location: string | null
          start_time: string
          user_id: string
        }
        Insert: {
          color?: string
          course_name: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          location?: string | null
          start_time: string
          user_id: string
        }
        Update: {
          color?: string
          course_name?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          location?: string | null
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_classes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Update"]

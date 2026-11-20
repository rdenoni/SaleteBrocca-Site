/* Tipos do banco, escritos à mão para casar com supabase/migrations/20261117120000_area_do_aluno.sql.
   Serão trocados pelos tipos gerados (`supabase gen types typescript`) quando o projeto Supabase existir.
   `type` (não `interface`): o supabase-js exige tipos com assinatura de índice implícita. */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type EnrollmentStatus = "active" | "refunded" | "chargeback" | "canceled";
export type EnrollmentSource = "kiwify" | "manual";

export type Database = {
  public: {
    Tables: {
      enrollments: {
        Row: {
          id: string;
          email: string;
          user_id: string | null;
          course_slug: string;
          status: EnrollmentStatus;
          source: EnrollmentSource;
          order_id: string;
          product_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          user_id?: string | null;
          course_slug: string;
          status: EnrollmentStatus;
          source?: EnrollmentSource;
          order_id: string;
          product_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          user_id?: string | null;
          course_slug?: string;
          status?: EnrollmentStatus;
          source?: EnrollmentSource;
          order_id?: string;
          product_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      kiwify_events: {
        Row: {
          id: number;
          order_id: string;
          event_type: string;
          order_status: string | null;
          payload: Json;
          received_at: string;
          processed_at: string | null;
          error: string | null;
        };
        Insert: {
          id?: never;
          order_id: string;
          event_type: string;
          order_status?: string | null;
          payload: Json;
          received_at?: string;
          processed_at?: string | null;
          error?: string | null;
        };
        Update: {
          id?: never;
          order_id?: string;
          event_type?: string;
          order_status?: string | null;
          payload?: Json;
          received_at?: string;
          processed_at?: string | null;
          error?: string | null;
        };
        Relationships: [];
      };
      lesson_progress: {
        Row: {
          user_id: string;
          course_slug: string;
          lesson_code: string;
          completed_at: string;
        };
        Insert: {
          user_id?: string;
          course_slug: string;
          lesson_code: string;
          completed_at?: string;
        };
        Update: {
          user_id?: string;
          course_slug?: string;
          lesson_code?: string;
          completed_at?: string;
        };
        Relationships: [];
      };
      /* supabase/migrations/20261120120000_lesson_videos.sql: o aluno só lê; quem grava é o servidor. */
      lesson_videos: {
        Row: {
          course_slug: string;
          lesson_code: string;
          provider: "mux";
          asset_id: string;
          playback_id: string;
          duration_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          course_slug: string;
          lesson_code: string;
          provider?: "mux";
          asset_id: string;
          playback_id: string;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          course_slug?: string;
          lesson_code?: string;
          provider?: "mux";
          asset_id?: string;
          playback_id?: string;
          duration_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

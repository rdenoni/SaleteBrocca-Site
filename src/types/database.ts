/* Tipos do banco, escritos à mão para casar com supabase/migrations/20261117120000_area_do_aluno.sql.
   Serão trocados pelos tipos gerados (`supabase gen types typescript`) quando o projeto Supabase existir.
   `type` (não `interface`): o supabase-js exige tipos com assinatura de índice implícita. */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type EnrollmentStatus = "active" | "refunded" | "chargeback" | "canceled";
export type EnrollmentSource = "kiwify" | "hotmart" | "manual";
export type ProfileStatus = "active" | "pending" | "expired" | "blocked";
export type UserRole = "admin" | "editor" | "support" | "student";
export type TransactionStatus = "paid" | "pending" | "refunded" | "chargeback" | "canceled";
export type TransactionPlatform = "kiwify" | "hotmart" | "manual";
export type LeadStatus = "new" | "contacted" | "converted" | "lost";
export type LeadSource = "avaliacao" | "contato" | "checkout" | "manual";
export type SupportTicketStatus = "open" | "answered" | "closed";
export type SupportTicketCategory = "acesso" | "pagamento" | "curso" | "tecnico" | "lgpd" | "outro";
export type UserSessionStatus = "active" | "idle" | "revoked";

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
          expires_at?: string | null;
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
          expires_at?: string | null;
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
          expires_at?: string | null;
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
      /* supabase/migrations/20261123130000_lesson_notes.sql */
      lesson_notes: {
        Row: {
          user_id: string;
          course_slug: string;
          lesson_code: string;
          body: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          course_slug: string;
          lesson_code: string;
          body?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          course_slug?: string;
          lesson_code?: string;
          body?: string;
          updated_at?: string;
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
      /* supabase/migrations/20261124120000_admin_foundation.sql */
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          status: ProfileStatus;
          expires_at: string | null;
          attribution: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          phone?: string | null;
          status?: ProfileStatus;
          expires_at?: string | null;
          attribution?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          status?: ProfileStatus;
          expires_at?: string | null;
          attribution?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: UserRole;
          granted_by: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: UserRole;
          granted_by?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: UserRole;
          granted_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          id: number;
          admin_id: string | null;
          admin_email: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          admin_id?: string | null;
          admin_email?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
        };
        Relationships: [];
      };
      /* supabase/migrations/20261124130000_admin_cms_visual.sql */
      hero_slides: {
        Row: {
          id: string;
          slug: string;
          title: string;
          text: string;
          badge: string | null;
          cta_label: string;
          cta_href: string | null;
          media_type: "image" | "video";
          media_url: string;
          image_position: string;
          tone: "blue" | "color";
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          text?: string;
          badge?: string | null;
          cta_label?: string;
          cta_href?: string | null;
          media_type?: "image" | "video";
          media_url: string;
          image_position?: string;
          tone?: "blue" | "color";
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          text?: string;
          badge?: string | null;
          cta_label?: string;
          cta_href?: string | null;
          media_type?: "image" | "video";
          media_url?: string;
          image_position?: string;
          tone?: "blue" | "color";
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          author_role: string;
          quote: string;
          photo_url: string | null;
          sort_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_name: string;
          author_role?: string;
          quote: string;
          photo_url?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_name?: string;
          author_role?: string;
          quote?: string;
          photo_url?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      /* supabase/migrations/20261124140000_admin_etapas_2_3_4.sql */
      articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          category_slug: string;
          cover_url: string | null;
          cover_alt: string;
          body_markdown: string;
          featured: boolean;
          status: "draft" | "published";
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string;
          category_slug?: string;
          cover_url?: string | null;
          cover_alt?: string;
          body_markdown?: string;
          featured?: boolean;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          category_slug?: string;
          cover_url?: string | null;
          cover_alt?: string;
          body_markdown?: string;
          featured?: boolean;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      podcasts: {
        Row: {
          id: string;
          episode_number: number;
          slug: string;
          title: string;
          summary: string;
          topics: string[];
          lesson_codes: string[];
          audio_url: string | null;
          status: "draft" | "published";
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          episode_number?: number;
          slug: string;
          title: string;
          summary?: string;
          topics?: string[];
          lesson_codes?: string[];
          audio_url?: string | null;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          episode_number?: number;
          slug?: string;
          title?: string;
          summary?: string;
          topics?: string[];
          lesson_codes?: string[];
          audio_url?: string | null;
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      blocked_ips: {
        Row: {
          id: string;
          ip_address: string;
          reason: string;
          blocked_by: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ip_address: string;
          reason?: string;
          blocked_by?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ip_address?: string;
          reason?: string;
          blocked_by?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      hotmart_events: {
        Row: {
          id: number;
          transaction_id: string;
          event_type: string;
          order_status: string | null;
          payload: Json;
          received_at: string;
          processed_at: string | null;
          error: string | null;
        };
        Insert: {
          id?: never;
          transaction_id: string;
          event_type: string;
          order_status?: string | null;
          payload: Json;
          received_at?: string;
          processed_at?: string | null;
          error?: string | null;
        };
        Update: {
          id?: never;
          transaction_id?: string;
          event_type?: string;
          order_status?: string | null;
          payload?: Json;
          received_at?: string;
          processed_at?: string | null;
          error?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          platform: TransactionPlatform;
          order_id: string;
          customer_name: string;
          customer_email: string;
          user_id: string | null;
          product_name: string;
          course_slug: string | null;
          gross_amount_cents: number;
          fee_amount_cents: number;
          net_amount_cents: number;
          currency: string;
          status: TransactionStatus;
          refund_reason: string | null;
          occurred_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          platform: TransactionPlatform;
          order_id: string;
          customer_name?: string;
          customer_email: string;
          user_id?: string | null;
          product_name?: string;
          course_slug?: string | null;
          gross_amount_cents?: number;
          fee_amount_cents?: number;
          net_amount_cents?: number;
          currency?: string;
          status: TransactionStatus;
          refund_reason?: string | null;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          platform?: TransactionPlatform;
          order_id?: string;
          customer_name?: string;
          customer_email?: string;
          user_id?: string | null;
          product_name?: string;
          course_slug?: string | null;
          gross_amount_cents?: number;
          fee_amount_cents?: number;
          net_amount_cents?: number;
          currency?: string;
          status?: TransactionStatus;
          refund_reason?: string | null;
          occurred_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      /* supabase/migrations/20261124150000_admin_etapas_5_6_7_8.sql */
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          whatsapp: string;
          source: LeadSource;
          status: LeadStatus;
          tags: string[];
          utm: Json;
          notes: string;
          converted_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string;
          whatsapp?: string;
          source?: LeadSource;
          status?: LeadStatus;
          tags?: string[];
          utm?: Json;
          notes?: string;
          converted_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          whatsapp?: string;
          source?: LeadSource;
          status?: LeadStatus;
          tags?: string[];
          utm?: Json;
          notes?: string;
          converted_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          ticket_number: number;
          user_id: string | null;
          requester_name: string;
          requester_email: string;
          subject: string;
          category: SupportTicketCategory;
          status: SupportTicketStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_number?: never;
          user_id?: string | null;
          requester_name?: string;
          requester_email: string;
          subject: string;
          category?: SupportTicketCategory;
          status?: SupportTicketStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ticket_number?: never;
          user_id?: string | null;
          requester_name?: string;
          requester_email?: string;
          subject?: string;
          category?: SupportTicketCategory;
          status?: SupportTicketStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      support_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_type: "user" | "admin";
          sender_id: string | null;
          sender_email: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          sender_type: "user" | "admin";
          sender_id?: string | null;
          sender_email?: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          sender_type?: "user" | "admin";
          sender_id?: string | null;
          sender_email?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          user_email: string;
          session_key: string;
          status: UserSessionStatus;
          ip_address: string;
          user_agent: string;
          device_label: string;
          city: string | null;
          region: string | null;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
          last_seen_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_email?: string;
          session_key: string;
          status?: UserSessionStatus;
          ip_address?: string;
          user_agent?: string;
          device_label?: string;
          city?: string | null;
          region?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          last_seen_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          user_email?: string;
          session_key?: string;
          status?: UserSessionStatus;
          ip_address?: string;
          user_agent?: string;
          device_label?: string;
          city?: string | null;
          region?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          last_seen_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      /* supabase/migrations/20261124160000_admin_etapas_9_10.sql */
      backup_history: {
        Row: {
          id: string;
          destination: "download" | "github" | "restore";
          filename: string;
          tables_count: number;
          rows_count: number;
          size_bytes: number;
          sha256: string;
          created_by: string | null;
          created_by_email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          destination: "download" | "github" | "restore";
          filename: string;
          tables_count?: number;
          rows_count?: number;
          size_bytes?: number;
          sha256?: string;
          created_by?: string | null;
          created_by_email?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          destination?: "download" | "github" | "restore";
          filename?: string;
          tables_count?: number;
          rows_count?: number;
          size_bytes?: number;
          sha256?: string;
          created_by?: string | null;
          created_by_email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_emails: {
        Row: {
          id: string;
          thread_id: string;
          direction: "inbound" | "outbound";
          from_email: string;
          to_email: string;
          subject: string;
          body_text: string;
          status: "unread" | "read" | "replied" | "archived";
          external_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          direction: "inbound" | "outbound";
          from_email: string;
          to_email: string;
          subject?: string;
          body_text?: string;
          status?: "unread" | "read" | "replied" | "archived";
          external_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          direction?: "inbound" | "outbound";
          from_email?: string;
          to_email?: string;
          subject?: string;
          body_text?: string;
          status?: "unread" | "read" | "replied" | "archived";
          external_id?: string | null;
          created_at?: string;
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          cpf_cnpj: string
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string | null
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          cpf_cnpj: string
          created_at?: string
          email: string
          id?: string
          nome: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          cpf_cnpj?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          admin_user_id: string
          amount: number
          created_at: string
          id: string
          new_balance: number
          previous_balance: number
          reason: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          admin_user_id: string
          amount: number
          created_at?: string
          id?: string
          new_balance: number
          previous_balance: number
          reason?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          admin_user_id?: string
          amount?: number
          created_at?: string
          id?: string
          new_balance?: number
          previous_balance?: number
          reason?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      faturas: {
        Row: {
          client_id: string | null
          cpf_cnpj: string
          created_at: string
          descricao: string
          email: string
          id: string
          mercado_pago_preference_id: string | null
          nome: string
          paid_amount: number | null
          payment_date: string | null
          payment_status: string | null
          payment_url: string | null
          pix_url: string | null
          qrcode: string | null
          status: string
          user_id: string | null
          valor: number
          vencimento: string
          whatsapp: string
        }
        Insert: {
          client_id?: string | null
          cpf_cnpj: string
          created_at?: string
          descricao: string
          email: string
          id?: string
          mercado_pago_preference_id?: string | null
          nome: string
          paid_amount?: number | null
          payment_date?: string | null
          payment_status?: string | null
          payment_url?: string | null
          pix_url?: string | null
          qrcode?: string | null
          status?: string
          user_id?: string | null
          valor: number
          vencimento: string
          whatsapp: string
        }
        Update: {
          client_id?: string | null
          cpf_cnpj?: string
          created_at?: string
          descricao?: string
          email?: string
          id?: string
          mercado_pago_preference_id?: string | null
          nome?: string
          paid_amount?: number | null
          payment_date?: string | null
          payment_status?: string | null
          payment_url?: string | null
          pix_url?: string | null
          qrcode?: string | null
          status?: string
          user_id?: string | null
          valor?: number
          vencimento?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "faturas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      mercado_pago_credentials: {
        Row: {
          access_token: string
          created_at: string
          public_key: string
          updated_at: string
          user_id: string
          user_mercado_pago_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          public_key: string
          updated_at?: string
          user_id: string
          user_mercado_pago_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          public_key?: string
          updated_at?: string
          user_id?: string
          user_mercado_pago_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          created_at: string
          first_login: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          first_login?: boolean | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          first_login?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      task_activities: {
        Row: {
          content: string
          created_at: string
          id: string
          task_id: string
          type: Database["public"]["Enums"]["activity_type"]
          user_avatar_url: string | null
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          task_id: string
          type: Database["public"]["Enums"]["activity_type"]
          user_avatar_url?: string | null
          user_email: string
          user_id: string
          user_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          type?: Database["public"]["Enums"]["activity_type"]
          user_avatar_url?: string | null
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_activities_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string
          id: string
          name: string
          size_bytes: number | null
          task_id: string
          type: Database["public"]["Enums"]["attachment_type"]
          uploaded_by: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          size_bytes?: number | null
          task_id: string
          type: Database["public"]["Enums"]["attachment_type"]
          uploaded_by: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          size_bytes?: number | null
          task_id?: string
          type?: Database["public"]["Enums"]["attachment_type"]
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklist: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          task_id: string
          text: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id: string
          text: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_checklist_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_labels: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          task_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          task_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_labels_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          task_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          task_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_members_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          archived: boolean
          column_id: Database["public"]["Enums"]["task_status"]
          cover_image_url: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          position: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          column_id?: Database["public"]["Enums"]["task_status"]
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          column_id?: Database["public"]["Enums"]["task_status"]
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          position?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_invoice_credits: {
        Row: {
          created_at: string
          credits_remaining: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_user_credits: {
        Args: {
          target_user_id: string
          new_amount: number
          transaction_type: string
          reason?: string
        }
        Returns: undefined
      }
      approve_user: {
        Args: { target_user_id: string; approver_user_id: string }
        Returns: undefined
      }
      check_advanced_rate_limit: {
        Args: {
          p_identifier: string
          p_action_type: string
          p_user_id?: string
          p_ip_address?: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          identifier: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_security_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decrypt_credential: {
        Args: { encrypted_text: string; encryption_key: string }
        Returns: string
      }
      detect_suspicious_login_pattern: {
        Args: { p_user_id: string; p_ip_address: string }
        Returns: boolean
      }
      encrypt_credential: {
        Args: { credential_text: string; encryption_key: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_details?: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_security_event_enhanced: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_details?: Json
          p_ip_address?: string
          p_user_agent?: string
          p_session_id?: string
          p_risk_level?: string
        }
        Returns: undefined
      }
      reject_user: {
        Args: { target_user_id: string; rejector_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      activity_type: "comment" | "action"
      app_role: "admin" | "user"
      attachment_type: "image" | "document" | "link"
      task_status: "todo" | "inProgress" | "review" | "done"
      user_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: ["comment", "action"],
      app_role: ["admin", "user"],
      attachment_type: ["image", "document", "link"],
      task_status: ["todo", "inProgress", "review", "done"],
      user_status: ["pending", "approved", "rejected"],
    },
  },
} as const

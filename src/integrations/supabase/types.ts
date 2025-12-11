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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      file_shares: {
        Row: {
          created_at: string
          file_id: string
          id: string
          permission: string | null
          shared_by_user_id: string
          shared_with_user_id: string
          tag_emoji: string | null
          tag_id: string | null
          tag_name: string | null
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          permission?: string | null
          shared_by_user_id: string
          shared_with_user_id: string
          tag_emoji?: string | null
          tag_id?: string | null
          tag_name?: string | null
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          permission?: string | null
          shared_by_user_id?: string
          shared_with_user_id?: string
          tag_emoji?: string | null
          tag_id?: string | null
          tag_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_shares_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "uploaded_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_shares_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "file_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      file_tags: {
        Row: {
          created_at: string
          emoji: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_documents: {
        Row: {
          alerts_count: number | null
          created_at: string
          document_group_id: string | null
          formatted_text: string | null
          id: string
          original_filename: string
          original_text: string | null
          processed_at: string
          suggestions_count: number | null
          template_name: string
          user_id: string | null
          version_number: number | null
        }
        Insert: {
          alerts_count?: number | null
          created_at?: string
          document_group_id?: string | null
          formatted_text?: string | null
          id?: string
          original_filename: string
          original_text?: string | null
          processed_at?: string
          suggestions_count?: number | null
          template_name: string
          user_id?: string | null
          version_number?: number | null
        }
        Update: {
          alerts_count?: number | null
          created_at?: string
          document_group_id?: string | null
          formatted_text?: string | null
          id?: string
          original_filename?: string
          original_text?: string | null
          processed_at?: string
          suggestions_count?: number | null
          template_name?: string
          user_id?: string | null
          version_number?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biometric_enabled: boolean | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          biometric_enabled?: boolean | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          biometric_enabled?: boolean | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          can_log_hours: boolean
          can_view_all_hours: boolean
          created_at: string
          id: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          can_log_hours?: boolean
          can_view_all_hours?: boolean
          created_at?: string
          id?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          can_log_hours?: boolean
          can_view_all_hours?: boolean
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          code: string
          created_at: string
          description: string | null
          end_date: string
          hard_lock_vigency: boolean
          id: string
          manager_id: string | null
          name: string
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          year_base: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          end_date: string
          hard_lock_vigency?: boolean
          id?: string
          manager_id?: string | null
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          year_base?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          end_date?: string
          hard_lock_vigency?: boolean
          id?: string
          manager_id?: string | null
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          year_base?: number
        }
        Relationships: []
      }
      saved_documents: {
        Row: {
          alerts_count: number | null
          created_at: string
          folder_id: string | null
          formatted_text: string
          id: string
          name: string
          original_text: string | null
          suggestions_count: number | null
          template_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alerts_count?: number | null
          created_at?: string
          folder_id?: string | null
          formatted_text: string
          id?: string
          name: string
          original_text?: string | null
          suggestions_count?: number | null
          template_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alerts_count?: number | null
          created_at?: string
          folder_id?: string | null
          formatted_text?: string
          id?: string
          name?: string
          original_text?: string | null
          suggestions_count?: number | null
          template_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_documents: {
        Row: {
          created_at: string
          document_id: string
          id: string
          permission: string | null
          shared_by_user_id: string
          shared_with_user_id: string
          tag_emoji: string | null
          tag_id: string | null
          tag_name: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          permission?: string | null
          shared_by_user_id: string
          shared_with_user_id: string
          tag_emoji?: string | null
          tag_id?: string | null
          tag_name?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          permission?: string | null
          shared_by_user_id?: string
          shared_with_user_id?: string
          tag_emoji?: string | null
          tag_id?: string | null
          tag_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "saved_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_documents_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "file_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_folders: {
        Row: {
          created_at: string
          folder_id: string
          id: string
          permission: string | null
          shared_by_user_id: string
          shared_with_user_id: string
        }
        Insert: {
          created_at?: string
          folder_id: string
          id?: string
          permission?: string | null
          shared_by_user_id: string
          shared_with_user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string
          id?: string
          permission?: string | null
          shared_by_user_id?: string
          shared_with_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_folders_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          activity_type: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string
          hours: number
          id: string
          logged_by_user_id: string | null
          project_id: string
          status: Database["public"]["Enums"]["time_entry_status"]
          updated_at: string
          user_id: string
          work_date: string
        }
        Insert: {
          activity_type?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description: string
          hours: number
          id?: string
          logged_by_user_id?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["time_entry_status"]
          updated_at?: string
          user_id: string
          work_date: string
        }
        Update: {
          activity_type?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string
          hours?: number
          id?: string
          logged_by_user_id?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["time_entry_status"]
          updated_at?: string
          user_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_validation_alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          details: Json | null
          document_reference_id: string | null
          id: string
          message: string
          project_id: string
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          time_entry_id: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          details?: Json | null
          document_reference_id?: string | null
          id?: string
          message: string
          project_id: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          time_entry_id?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          details?: Json | null
          document_reference_id?: string | null
          id?: string
          message?: string
          project_id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          time_entry_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_validation_alerts_document_reference_id_fkey"
            columns: ["document_reference_id"]
            isOneToOne: false
            referencedRelation: "saved_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_validation_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_validation_alerts_time_entry_id_fkey"
            columns: ["time_entry_id"]
            isOneToOne: false
            referencedRelation: "time_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_files: {
        Row: {
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          folder_id: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          folder_id?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          folder_id?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_manager: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_type:
        | "out_of_vigency"
        | "text_inconsistency"
        | "duplicate"
        | "over_hours"
      app_role: "admin" | "manager" | "collaborator"
      project_status: "active" | "suspended" | "completed"
      time_entry_status: "draft" | "submitted" | "approved" | "rejected"
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
      alert_type: [
        "out_of_vigency",
        "text_inconsistency",
        "duplicate",
        "over_hours",
      ],
      app_role: ["admin", "manager", "collaborator"],
      project_status: ["active", "suspended", "completed"],
      time_entry_status: ["draft", "submitted", "approved", "rejected"],
    },
  },
} as const

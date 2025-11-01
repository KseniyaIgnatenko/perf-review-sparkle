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
      departments: {
        Row: {
          created_at: string | null
          id: string
          manager_id: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name?: string
        }
        Relationships: []
      }
      development_recommendations: {
        Row: {
          created_at: string | null
          id: string
          recommendation_text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recommendation_text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recommendation_text?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_tasks: {
        Row: {
          created_at: string | null
          goal_id: string
          id: string
          is_done: boolean | null
          title: string
        }
        Insert: {
          created_at?: string | null
          goal_id: string
          id?: string
          is_done?: boolean | null
          title: string
        }
        Update: {
          created_at?: string | null
          goal_id?: string
          id?: string
          is_done?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          period: string | null
          progress: number | null
          status: Database["public"]["Enums"]["goal_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          period?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          period?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["goal_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          is_success: boolean
          user_identifier: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_success: boolean
          user_identifier: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          is_success?: boolean
          user_identifier?: string
        }
        Relationships: []
      }
      manager_feedbacks: {
        Row: {
          comment: string | null
          created_at: string | null
          employee_id: string
          goal_id: string | null
          id: string
          improvement_feedback: string | null
          manager_id: string
          strengths_feedback: string | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          employee_id: string
          goal_id?: string | null
          id?: string
          improvement_feedback?: string | null
          manager_id: string
          strengths_feedback?: string | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          employee_id?: string
          goal_id?: string | null
          id?: string
          improvement_feedback?: string | null
          manager_id?: string
          strengths_feedback?: string | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manager_feedbacks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      peer_reviews: {
        Row: {
          collaboration_score: number | null
          comment: string | null
          communication_score: number | null
          created_at: string | null
          goal_id: string | null
          id: string
          quality_score: number | null
          reviewee_id: string
          reviewer_id: string
          score: number | null
          status: Database["public"]["Enums"]["review_status"] | null
          updated_at: string | null
        }
        Insert: {
          collaboration_score?: number | null
          comment?: string | null
          communication_score?: number | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          quality_score?: number | null
          reviewee_id: string
          reviewer_id: string
          score?: number | null
          status?: Database["public"]["Enums"]["review_status"] | null
          updated_at?: string | null
        }
        Update: {
          collaboration_score?: number | null
          comment?: string | null
          communication_score?: number | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          quality_score?: number | null
          reviewee_id?: string
          reviewer_id?: string
          score?: number | null
          status?: Database["public"]["Enums"]["review_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_reviews_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          department_id: string | null
          full_name: string
          id: string
          is_active: boolean | null
          position_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          position_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          position_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          department_id: string | null
          file_url: string | null
          id: string
          owner_id: string
          period: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          type: Database["public"]["Enums"]["report_type"]
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          file_url?: string | null
          id?: string
          owner_id: string
          period?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          type: Database["public"]["Enums"]["report_type"]
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          file_url?: string | null
          id?: string
          owner_id?: string
          period?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          type?: Database["public"]["Enums"]["report_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      self_assessment_answers: {
        Row: {
          answer_text: string | null
          created_at: string | null
          id: string
          question_text: string
          score: number | null
          self_assessment_id: string
        }
        Insert: {
          answer_text?: string | null
          created_at?: string | null
          id?: string
          question_text: string
          score?: number | null
          self_assessment_id: string
        }
        Update: {
          answer_text?: string | null
          created_at?: string | null
          id?: string
          question_text?: string
          score?: number | null
          self_assessment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_assessment_answers_self_assessment_id_fkey"
            columns: ["self_assessment_id"]
            isOneToOne: false
            referencedRelation: "self_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      self_assessments: {
        Row: {
          created_at: string | null
          goal_id: string
          id: string
          status: Database["public"]["Enums"]["assessment_status"] | null
          total_score: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal_id: string
          id?: string
          status?: Database["public"]["Enums"]["assessment_status"] | null
          total_score?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal_id?: string
          id?: string
          status?: Database["public"]["Enums"]["assessment_status"] | null
          total_score?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_assessments_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string
          status: Database["public"]["Enums"]["support_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          status?: Database["public"]["Enums"]["support_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["support_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
    }
    Enums: {
      app_role: "admin" | "hr" | "manager" | "employee"
      assessment_status: "draft" | "submitted" | "reviewed"
      goal_status: "draft" | "completed"
      report_status: "ready" | "in_progress"
      report_type: "personal" | "team" | "company"
      review_status: "pending" | "submitted" | "received"
      support_status: "open" | "in_progress" | "closed"
      user_role: "employee" | "manager" | "hr" | "admin"
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
      app_role: ["admin", "hr", "manager", "employee"],
      assessment_status: ["draft", "submitted", "reviewed"],
      goal_status: ["draft", "completed"],
      report_status: ["ready", "in_progress"],
      report_type: ["personal", "team", "company"],
      review_status: ["pending", "submitted", "received"],
      support_status: ["open", "in_progress", "closed"],
      user_role: ["employee", "manager", "hr", "admin"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_validations: {
        Row: {
          course_id: number | null
          id: number
          validated_at: string | null
        }
        Insert: {
          course_id?: number | null
          id?: number
          validated_at?: string | null
        }
        Update: {
          course_id?: number | null
          id?: number
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_validations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_proposals: {
        Row: {
          admin_notes: string | null
          course_id: number | null
          id: string
          proposal_data: Json
          status: string
          submission_date: string
          submitter_email: string
          submitter_name: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          course_id?: number | null
          id?: string
          proposal_data: Json
          status?: string
          submission_date?: string
          submitter_email: string
          submitter_name: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          course_id?: number | null
          id?: string
          proposal_data?: Json
          status?: string
          submission_date?: string
          submitter_email?: string
          submitter_name?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_proposals_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_assignments: {
        Row: {
          course_id: number | null
          created_at: string | null
          id: number
          is_coordinator: boolean | null
          teacher_id: number | null
          updated_at: string | null
          validated_by_coord: boolean | null
          vol1_hours: number | null
          vol2_hours: number | null
        }
        Insert: {
          course_id?: number | null
          created_at?: string | null
          id?: number
          is_coordinator?: boolean | null
          teacher_id?: number | null
          updated_at?: string | null
          validated_by_coord?: boolean | null
          vol1_hours?: number | null
          vol2_hours?: number | null
        }
        Update: {
          course_id?: number | null
          created_at?: string | null
          id?: number
          is_coordinator?: boolean | null
          teacher_id?: number | null
          updated_at?: string | null
          validated_by_coord?: boolean | null
          vol1_hours?: number | null
          vol2_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_year: string | null
          code: string | null
          created_at: string | null
          duration_weeks: number | null
          faculty: string | null
          id: number
          start_date: string | null
          subcategory: string | null
          title: string
          updated_at: string | null
          vacant: boolean | null
          volume_total_vol1: number | null
          volume_total_vol2: number | null
        }
        Insert: {
          academic_year?: string | null
          code?: string | null
          created_at?: string | null
          duration_weeks?: number | null
          faculty?: string | null
          id?: number
          start_date?: string | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          vacant?: boolean | null
          volume_total_vol1?: number | null
          volume_total_vol2?: number | null
        }
        Update: {
          academic_year?: string | null
          code?: string | null
          created_at?: string | null
          duration_weeks?: number | null
          faculty?: string | null
          id?: number
          start_date?: string | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          vacant?: boolean | null
          volume_total_vol1?: number | null
          volume_total_vol2?: number | null
        }
        Relationships: []
      }
      import_reports: {
        Row: {
          id: number
          inserted: number | null
          skipped: number | null
          timestamp: string | null
          type: string | null
          updated: number | null
        }
        Insert: {
          id?: number
          inserted?: number | null
          skipped?: number | null
          timestamp?: string | null
          type?: string | null
          updated?: number | null
        }
        Update: {
          id?: number
          inserted?: number | null
          skipped?: number | null
          timestamp?: string | null
          type?: string | null
          updated?: number | null
        }
        Relationships: []
      }
      modification_requests: {
        Row: {
          admin_notes: string | null
          course_id: number | null
          created_at: string
          description: string | null
          id: string
          modification_type: string
          requester_email: string
          requester_name: string
          status: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          course_id?: number | null
          created_at?: string
          description?: string | null
          id?: string
          modification_type: string
          requester_email: string
          requester_name: string
          status?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          course_id?: number | null
          created_at?: string
          description?: string | null
          id?: string
          modification_type?: string
          requester_email?: string
          requester_name?: string
          status?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modification_requests_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_statuses: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: number
          last_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: number
          last_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: number
          last_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const

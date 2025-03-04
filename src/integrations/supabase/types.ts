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
      estimates: {
        Row: {
          availability_windows: string[] | null
          baseboards_methods: string[] | null
          best_time_to_call: string | null
          created_at: string | null
          details: Json
          discount: number | null
          doors_count_per_room: number[] | null
          estimated_hours: number
          estimated_paint_gallons: number | null
          has_high_ceilings: boolean[] | null
          id: string
          include_baseboards: boolean[] | null
          include_ceilings: boolean[] | null
          include_closets: boolean[] | null
          include_crown_moldings: boolean[] | null
          is_empty_house: boolean | null
          labor_cost: number
          lead_id: string
          material_cost: number
          needs_floor_covering: boolean | null
          notes: string | null
          paint_coverage_calculations: number[] | null
          paint_quality_descriptions: string[] | null
          paint_types: string[] | null
          preferred_contact_method: string | null
          preferred_timeline: string | null
          project_id: string | null
          room_sizes: string[] | null
          room_types: string[] | null
          status: string | null
          status_type: string
          total_cost: number
          updated_at: string | null
          wall_conditions: string[] | null
          wall_counts: number[] | null
          wall_heights: number[] | null
          wall_widths: number[] | null
          windows_count_per_room: number[] | null
        }
        Insert: {
          availability_windows?: string[] | null
          baseboards_methods?: string[] | null
          best_time_to_call?: string | null
          created_at?: string | null
          details: Json
          discount?: number | null
          doors_count_per_room?: number[] | null
          estimated_hours?: number
          estimated_paint_gallons?: number | null
          has_high_ceilings?: boolean[] | null
          id?: string
          include_baseboards?: boolean[] | null
          include_ceilings?: boolean[] | null
          include_closets?: boolean[] | null
          include_crown_moldings?: boolean[] | null
          is_empty_house?: boolean | null
          labor_cost?: number
          lead_id: string
          material_cost?: number
          needs_floor_covering?: boolean | null
          notes?: string | null
          paint_coverage_calculations?: number[] | null
          paint_quality_descriptions?: string[] | null
          paint_types?: string[] | null
          preferred_contact_method?: string | null
          preferred_timeline?: string | null
          project_id?: string | null
          room_sizes?: string[] | null
          room_types?: string[] | null
          status?: string | null
          status_type?: string
          total_cost?: number
          updated_at?: string | null
          wall_conditions?: string[] | null
          wall_counts?: number[] | null
          wall_heights?: number[] | null
          wall_widths?: number[] | null
          windows_count_per_room?: number[] | null
        }
        Update: {
          availability_windows?: string[] | null
          baseboards_methods?: string[] | null
          best_time_to_call?: string | null
          created_at?: string | null
          details?: Json
          discount?: number | null
          doors_count_per_room?: number[] | null
          estimated_hours?: number
          estimated_paint_gallons?: number | null
          has_high_ceilings?: boolean[] | null
          id?: string
          include_baseboards?: boolean[] | null
          include_ceilings?: boolean[] | null
          include_closets?: boolean[] | null
          include_crown_moldings?: boolean[] | null
          is_empty_house?: boolean | null
          labor_cost?: number
          lead_id?: string
          material_cost?: number
          needs_floor_covering?: boolean | null
          notes?: string | null
          paint_coverage_calculations?: number[] | null
          paint_quality_descriptions?: string[] | null
          paint_types?: string[] | null
          preferred_contact_method?: string | null
          preferred_timeline?: string | null
          project_id?: string | null
          room_sizes?: string[] | null
          room_types?: string[] | null
          status?: string | null
          status_type?: string
          total_cost?: number
          updated_at?: string | null
          wall_conditions?: string[] | null
          wall_counts?: number[] | null
          wall_heights?: number[] | null
          wall_widths?: number[] | null
          windows_count_per_room?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string | null
          estimate_id: string
          id: string
          paid_at: string | null
          payment_link: string | null
          status: string | null
          stripe_payment_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date?: string | null
          estimate_id: string
          id?: string
          paid_at?: string | null
          payment_link?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string | null
          estimate_id?: string
          id?: string
          paid_at?: string | null
          payment_link?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          created_at: string | null
          description: string | null
          email: string
          id: string
          name: string
          phone: string | null
          project_id: string | null
          project_name: string | null
          room_count: number | null
          service_type: string
          square_footage: number | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          project_id?: string | null
          project_name?: string | null
          room_count?: number | null
          service_type: string
          square_footage?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          project_id?: string | null
          project_name?: string | null
          room_count?: number | null
          service_type?: string
          square_footage?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          created_at: string | null
          description: string
          estimate_id: string
          id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          estimate_id: string
          id?: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          estimate_id?: string
          id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          base_price: number
          cost_per_sqft: number
          created_at: string | null
          id: string
          labor_cost_per_hour: number
          material_cost_per_gallon: number
          room_type: string | null
          service_type: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          cost_per_sqft?: number
          created_at?: string | null
          id?: string
          labor_cost_per_hour?: number
          material_cost_per_gallon?: number
          room_type?: string | null
          service_type: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          cost_per_sqft?: number
          created_at?: string | null
          id?: string
          labor_cost_per_hour?: number
          material_cost_per_gallon?: number
          room_type?: string | null
          service_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_line_items_for_estimate: {
        Args: {
          estimate_id: string
        }
        Returns: {
          created_at: string | null
          description: string
          estimate_id: string
          id: string
          quantity: number
          unit_price: number
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      user_role: "admin" | "staff" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

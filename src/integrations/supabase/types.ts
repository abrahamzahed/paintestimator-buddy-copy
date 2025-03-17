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
          created_at: string
          details: Json | null
          discount: number | null
          estimated_hours: number
          estimated_paint_gallons: number | null
          id: string
          labor_cost: number
          lead_id: string
          material_cost: number
          notes: string | null
          project_id: string | null
          project_name: string | null
          status: string | null
          status_type: string | null
          total_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          discount?: number | null
          estimated_hours: number
          estimated_paint_gallons?: number | null
          id?: string
          labor_cost: number
          lead_id: string
          material_cost: number
          notes?: string | null
          project_id?: string | null
          project_name?: string | null
          status?: string | null
          status_type?: string | null
          total_cost: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          discount?: number | null
          estimated_hours?: number
          estimated_paint_gallons?: number | null
          id?: string
          labor_cost?: number
          lead_id?: string
          material_cost?: number
          notes?: string | null
          project_id?: string | null
          project_name?: string | null
          status?: string | null
          status_type?: string | null
          total_cost?: number
          updated_at?: string
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
      extras: {
        Row: {
          category: string
          conditions: string | null
          created_at: string
          id: string
          max_price: number | null
          min_price: number | null
          name: string
          price_type: string
          unit_price: number | null
        }
        Insert: {
          category: string
          conditions?: string | null
          created_at?: string
          id?: string
          max_price?: number | null
          min_price?: number | null
          name: string
          price_type: string
          unit_price?: number | null
        }
        Update: {
          category?: string
          conditions?: string | null
          created_at?: string
          id?: string
          max_price?: number | null
          min_price?: number | null
          name?: string
          price_type?: string
          unit_price?: number | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          estimate_id: string
          id: string
          paid_at: string | null
          payment_link: string | null
          status: string | null
          stripe_payment_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          estimate_id: string
          id?: string
          paid_at?: string | null
          payment_link?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          estimate_id?: string
          id?: string
          paid_at?: string | null
          payment_link?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          updated_at?: string
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
          created_at: string
          description: string | null
          details: string | null
          email: string
          id: string
          name: string
          phone: string | null
          project_id: string | null
          project_name: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          details?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          project_id?: string | null
          project_name?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          details?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          project_id?: string | null
          project_name?: string | null
          status?: string | null
          updated_at?: string
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
          created_at: string
          description: string
          estimate_id: string
          id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          estimate_id: string
          id?: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
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
      paint_types: {
        Row: {
          created_at: string
          description: string | null
          fixed_upcharge: number | null
          id: string
          name: string
          percentage_upcharge: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          fixed_upcharge?: number | null
          id?: string
          name: string
          percentage_upcharge?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          fixed_upcharge?: number | null
          id?: string
          name?: string
          percentage_upcharge?: number | null
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          base_price: number
          cost_per_sqft: number
          created_at: string
          id: string
          labor_cost_per_hour: number
          material_cost_per_gallon: number
          room_type: string | null
          service_type: string
          updated_at: string
        }
        Insert: {
          base_price: number
          cost_per_sqft: number
          created_at?: string
          id?: string
          labor_cost_per_hour: number
          material_cost_per_gallon: number
          room_type?: string | null
          service_type: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          cost_per_sqft?: number
          created_at?: string
          id?: string
          labor_cost_per_hour?: number
          material_cost_per_gallon?: number
          room_type?: string | null
          service_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          guest_email: string | null
          id: string
          name: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          guest_email?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          guest_email?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      room_addons: {
        Row: {
          addon_type: string
          created_at: string
          description: string | null
          id: string
          name: string
          room_type_id: string | null
          value: number
        }
        Insert: {
          addon_type: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          room_type_id?: string | null
          value: number
        }
        Update: {
          addon_type?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          room_type_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "room_addons_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_sizes: {
        Row: {
          base_price: number
          created_at: string
          id: string
          room_type_id: string | null
          size: string
        }
        Insert: {
          base_price: number
          created_at?: string
          id?: string
          room_type_id?: string | null
          size: string
        }
        Update: {
          base_price?: number
          created_at?: string
          id?: string
          room_type_id?: string | null
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_sizes_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      special_conditions: {
        Row: {
          created_at: string
          description: string | null
          discount_percentage: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_percentage: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_percentage?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      volume_discounts: {
        Row: {
          created_at: string
          discount_percentage: number
          has_extra: boolean | null
          id: string
          threshold: number
        }
        Insert: {
          created_at?: string
          discount_percentage: number
          has_extra?: boolean | null
          id?: string
          threshold: number
        }
        Update: {
          created_at?: string
          discount_percentage?: number
          has_extra?: boolean | null
          id?: string
          threshold?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_line_items_for_estimate: {
        Args: {
          estimate_id: string
        }
        Returns: {
          created_at: string
          description: string
          estimate_id: string
          id: string
          quantity: number
          unit_price: number
        }[]
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      import_user_data_by_email: {
        Args: {
          p_user_id: string
          p_email: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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

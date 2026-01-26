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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      binary_ledger: {
        Row: {
          binary_income: number
          cap_applied: number
          carryforward_left: number
          carryforward_right: number
          created_at: string
          id: string
          left_bv: number
          matched_bv: number
          payout_period: string
          right_bv: number
          user_id: string
        }
        Insert: {
          binary_income?: number
          cap_applied?: number
          carryforward_left?: number
          carryforward_right?: number
          created_at?: string
          id?: string
          left_bv?: number
          matched_bv?: number
          payout_period: string
          right_bv?: number
          user_id: string
        }
        Update: {
          binary_income?: number
          cap_applied?: number
          carryforward_left?: number
          carryforward_right?: number
          created_at?: string
          id?: string
          left_bv?: number
          matched_bv?: number
          payout_period?: string
          right_bv?: number
          user_id?: string
        }
        Relationships: []
      }
      bv_ledger: {
        Row: {
          bv_amount: number
          bv_type: string
          created_at: string
          id: string
          leg: string | null
          order_id: string | null
          source_description: string | null
          terra_fee: number | null
          user_id: string
        }
        Insert: {
          bv_amount: number
          bv_type: string
          created_at?: string
          id?: string
          leg?: string | null
          order_id?: string | null
          source_description?: string | null
          terra_fee?: number | null
          user_id: string
        }
        Update: {
          bv_amount?: number
          bv_type?: string
          created_at?: string
          id?: string
          leg?: string | null
          order_id?: string | null
          source_description?: string | null
          terra_fee?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bv_ledger_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      compensation_pools: {
        Row: {
          created_at: string
          cycle_value_adjustment: number | null
          failsafe_ratio: number | null
          id: string
          is_processed: boolean | null
          membership_bv_payout: number
          payout_period: string
          pool_amount: number
          processed_at: string | null
          total_terra_fees: number
        }
        Insert: {
          created_at?: string
          cycle_value_adjustment?: number | null
          failsafe_ratio?: number | null
          id?: string
          is_processed?: boolean | null
          membership_bv_payout?: number
          payout_period: string
          pool_amount?: number
          processed_at?: string | null
          total_terra_fees?: number
        }
        Update: {
          created_at?: string
          cycle_value_adjustment?: number | null
          failsafe_ratio?: number | null
          id?: string
          is_processed?: boolean | null
          membership_bv_payout?: number
          payout_period?: string
          pool_amount?: number
          processed_at?: string | null
          total_terra_fees?: number
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          current_latitude: number | null
          current_location: string | null
          current_longitude: number | null
          deliveries_count: number | null
          email: string
          id: string
          license_plate: string
          name: string
          phone: string
          rating: number | null
          status: Database["public"]["Enums"]["driver_status"] | null
          total_earnings: number | null
          updated_at: string
          vehicle: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          created_at?: string
          current_latitude?: number | null
          current_location?: string | null
          current_longitude?: number | null
          deliveries_count?: number | null
          email: string
          id?: string
          license_plate: string
          name: string
          phone: string
          rating?: number | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_earnings?: number | null
          updated_at?: string
          vehicle?: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          created_at?: string
          current_latitude?: number | null
          current_location?: string | null
          current_longitude?: number | null
          deliveries_count?: number | null
          email?: string
          id?: string
          license_plate?: string
          name?: string
          phone?: string
          rating?: number | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          total_earnings?: number | null
          updated_at?: string
          vehicle?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: []
      }
      farmers: {
        Row: {
          created_at: string
          description: string | null
          email: string
          id: string
          image_url: string | null
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          owner: string
          phone: string
          products_count: number | null
          rating: number | null
          status: Database["public"]["Enums"]["farmer_status"] | null
          total_sales: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          email: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          owner: string
          phone: string
          products_count?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["farmer_status"] | null
          total_sales?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          owner?: string
          phone?: string
          products_count?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["farmer_status"] | null
          total_sales?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          left_leg_id: string | null
          membership_bv: number
          package_price: number
          placement_side: string | null
          right_leg_id: string | null
          sponsor_id: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          left_leg_id?: string | null
          membership_bv?: number
          package_price?: number
          placement_side?: string | null
          right_leg_id?: string | null
          sponsor_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          left_leg_id?: string | null
          membership_bv?: number
          package_price?: number
          placement_side?: string | null
          right_leg_id?: string | null
          sponsor_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_fee: number
          delivery_latitude: number | null
          delivery_longitude: number | null
          driver_id: string | null
          farmer_id: string | null
          farmer_price: number | null
          id: string
          items: Json
          items_count: number
          notes: string | null
          order_number: string
          referrer_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          terra_fee: number | null
          terra_fee_bv: number | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          driver_id?: string | null
          farmer_id?: string | null
          farmer_price?: number | null
          id?: string
          items?: Json
          items_count?: number
          notes?: string | null
          order_number: string
          referrer_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          terra_fee?: number | null
          terra_fee_bv?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          driver_id?: string | null
          farmer_id?: string | null
          farmer_price?: number | null
          id?: string
          items?: Json
          items_count?: number
          notes?: string | null
          order_number?: string
          referrer_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          terra_fee?: number | null
          terra_fee_bv?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_ledger: {
        Row: {
          bonus_type: string
          created_at: string
          gross_amount: number
          id: string
          level_depth: number | null
          net_amount: number
          notes: string | null
          payout_period: string
          source_order_id: string | null
          source_user_id: string | null
          user_id: string
        }
        Insert: {
          bonus_type: string
          created_at?: string
          gross_amount: number
          id?: string
          level_depth?: number | null
          net_amount: number
          notes?: string | null
          payout_period: string
          source_order_id?: string | null
          source_user_id?: string | null
          user_id: string
        }
        Update: {
          bonus_type?: string
          created_at?: string
          gross_amount?: number
          id?: string
          level_depth?: number | null
          net_amount?: number
          notes?: string | null
          payout_period?: string
          source_order_id?: string | null
          source_user_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_ledger_source_order_id_fkey"
            columns: ["source_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          farmer_id: string
          id: string
          image_url: string | null
          is_organic: boolean | null
          name: string
          price: number
          stock: number
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          farmer_id: string
          id?: string
          image_url?: string | null
          is_organic?: boolean | null
          name: string
          price: number
          stock?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          farmer_id?: string
          id?: string
          image_url?: string | null
          is_organic?: boolean | null
          name?: string
          price?: number
          stock?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          referral_code: string
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code: string
          referred_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      token_ledger: {
        Row: {
          created_at: string
          id: string
          php_reward_value: number
          source_description: string | null
          token_market_price: number
          tokens_issued: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          php_reward_value: number
          source_description?: string | null
          token_market_price: number
          tokens_issued: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          php_reward_value?: number
          source_description?: string | null
          token_market_price?: number
          tokens_issued?: number
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "farmer" | "business_buyer" | "member" | "driver" | "admin"
      driver_status: "online" | "offline" | "delivering"
      farmer_status: "active" | "pending" | "suspended"
      membership_tier: "free" | "starter" | "basic" | "pro" | "elite"
      order_status:
        | "pending"
        | "preparing"
        | "in_transit"
        | "delivered"
        | "cancelled"
      vehicle_type: "motorcycle" | "van" | "truck"
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
      app_role: ["farmer", "business_buyer", "member", "driver", "admin"],
      driver_status: ["online", "offline", "delivering"],
      farmer_status: ["active", "pending", "suspended"],
      membership_tier: ["free", "starter", "basic", "pro", "elite"],
      order_status: [
        "pending",
        "preparing",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      vehicle_type: ["motorcycle", "van", "truck"],
    },
  },
} as const

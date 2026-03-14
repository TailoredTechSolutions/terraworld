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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      binary_ledger: {
        Row: {
          adjusted_cycle_value: number | null
          binary_income: number
          cap_applied: number
          carryforward_left: number
          carryforward_right: number
          created_at: string
          fail_safe_triggered: boolean
          id: string
          left_bv: number
          left_membership_bv: number
          left_product_bv: number
          matched_bv: number
          payout_period: string
          right_bv: number
          right_membership_bv: number
          right_product_bv: number
          user_id: string
        }
        Insert: {
          adjusted_cycle_value?: number | null
          binary_income?: number
          cap_applied?: number
          carryforward_left?: number
          carryforward_right?: number
          created_at?: string
          fail_safe_triggered?: boolean
          id?: string
          left_bv?: number
          left_membership_bv?: number
          left_product_bv?: number
          matched_bv?: number
          payout_period: string
          right_bv?: number
          right_membership_bv?: number
          right_product_bv?: number
          user_id: string
        }
        Update: {
          adjusted_cycle_value?: number | null
          binary_income?: number
          cap_applied?: number
          carryforward_left?: number
          carryforward_right?: number
          created_at?: string
          fail_safe_triggered?: boolean
          id?: string
          left_bv?: number
          left_membership_bv?: number
          left_product_bv?: number
          matched_bv?: number
          payout_period?: string
          right_bv?: number
          right_membership_bv?: number
          right_product_bv?: number
          user_id?: string
        }
        Relationships: []
      }
      buyer_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          full_name: string | null
          id: string
          is_default: boolean
          label: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          postal_code: string
          state_province: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          full_name?: string | null
          id?: string
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          postal_code: string
          state_province?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          full_name?: string | null
          id?: string
          is_default?: boolean
          label?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          postal_code?: string
          state_province?: string | null
          updated_at?: string
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
      delivery_bookings: {
        Row: {
          booking_status: Database["public"]["Enums"]["delivery_booking_status"]
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          delivery_address: string | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          distance_km: number | null
          driver_name: string | null
          driver_phone: string | null
          driver_plate: string | null
          estimated_eta_minutes: number | null
          estimated_fee: number
          external_booking_id: string | null
          final_fee: number | null
          id: string
          order_id: string
          pickup_address: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          provider_response: Json | null
          provider_type: Database["public"]["Enums"]["delivery_provider"]
          updated_at: string
        }
        Insert: {
          booking_status?: Database["public"]["Enums"]["delivery_booking_status"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          distance_km?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_plate?: string | null
          estimated_eta_minutes?: number | null
          estimated_fee?: number
          external_booking_id?: string | null
          final_fee?: number | null
          id?: string
          order_id: string
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          provider_response?: Json | null
          provider_type: Database["public"]["Enums"]["delivery_provider"]
          updated_at?: string
        }
        Update: {
          booking_status?: Database["public"]["Enums"]["delivery_booking_status"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          distance_km?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          driver_plate?: string | null
          estimated_eta_minutes?: number | null
          estimated_fee?: number
          external_booking_id?: string | null
          final_fee?: number | null
          id?: string
          order_id?: string
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          provider_response?: Json | null
          provider_type?: Database["public"]["Enums"]["delivery_provider"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_bookings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          base_fee: number
          created_at: string
          id: string
          is_active: boolean
          max_distance_km: number
          min_distance_km: number
          per_km_rate: number
          updated_at: string
          zone_name: string
        }
        Insert: {
          base_fee?: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_distance_km?: number
          min_distance_km?: number
          per_km_rate?: number
          updated_at?: string
          zone_name: string
        }
        Update: {
          base_fee?: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_distance_km?: number
          min_distance_km?: number
          per_km_rate?: number
          updated_at?: string
          zone_name?: string
        }
        Relationships: []
      }
      digital_assets: {
        Row: {
          asset_code: string
          asset_type: string
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string
          metadata: Json | null
          order_id: string | null
          qr_data: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          shop_product_id: string
          status: string
          user_id: string
        }
        Insert: {
          asset_code: string
          asset_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          metadata?: Json | null
          order_id?: string | null
          qr_data?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          shop_product_id: string
          status?: string
          user_id: string
        }
        Update: {
          asset_code?: string
          asset_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          metadata?: Json | null
          order_id?: string | null
          qr_data?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          shop_product_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_assets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_assets_shop_product_id_fkey"
            columns: ["shop_product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
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
      farm_products: {
        Row: {
          created_at: string
          farm_id: string
          harvest_date: string | null
          id: string
          is_available: boolean
          is_organic: boolean
          price: number
          processing_time_minutes: number
          product_id: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          harvest_date?: string | null
          id?: string
          is_available?: boolean
          is_organic?: boolean
          price: number
          processing_time_minutes?: number
          product_id: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          harvest_date?: string | null
          id?: string
          is_available?: boolean
          is_organic?: boolean
          price?: number
          processing_time_minutes?: number
          product_id?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_products_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farmers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_products_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farmers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      kyc_documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["kyc_document_type"]
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          kyc_profile_id: string
          mime_type: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: Database["public"]["Enums"]["kyc_document_type"]
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          kyc_profile_id: string
          mime_type?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["kyc_document_type"]
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          kyc_profile_id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_kyc_profile_id_fkey"
            columns: ["kyc_profile_id"]
            isOneToOne: false
            referencedRelation: "kyc_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          id: string
          last_name: string | null
          middle_name: string | null
          nationality: string | null
          postal_code: string | null
          registration_number: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          state_province: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          submitted_at: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          nationality?: string | null
          postal_code?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_province?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          middle_name?: string | null
          nationality?: string | null
          postal_code?: string | null
          registration_number?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          state_province?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      manual_adjustments: {
        Row: {
          adjustment_type: string
          amount: number
          created_at: string
          created_by_user_id: string
          id: string
          notes: string | null
          reason: string
          target_user_id: string
        }
        Insert: {
          adjustment_type: string
          amount: number
          created_at?: string
          created_by_user_id: string
          id?: string
          notes?: string | null
          reason: string
          target_user_id: string
        }
        Update: {
          adjustment_type?: string
          amount?: number
          created_at?: string
          created_by_user_id?: string
          id?: string
          notes?: string | null
          reason?: string
          target_user_id?: string
        }
        Relationships: []
      }
      member_transfers: {
        Row: {
          amount: number
          created_at: string
          fee: number
          id: string
          net_amount: number
          note: string | null
          receiver_id: string
          reference_code: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          fee?: number
          id?: string
          net_amount: number
          note?: string | null
          receiver_id: string
          reference_code?: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          fee?: number
          id?: string
          net_amount?: number
          note?: string | null
          receiver_id?: string
          reference_code?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          current_rank_id: string | null
          id: string
          left_leg_id: string | null
          membership_bv: number
          package_price: number
          placement_side: string | null
          rank_achieved_at: string | null
          right_leg_id: string | null
          sponsor_id: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_rank_id?: string | null
          id?: string
          left_leg_id?: string | null
          membership_bv?: number
          package_price?: number
          placement_side?: string | null
          rank_achieved_at?: string | null
          right_leg_id?: string | null
          sponsor_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_rank_id?: string | null
          id?: string
          left_leg_id?: string | null
          membership_bv?: number
          package_price?: number
          placement_side?: string | null
          rank_achieved_at?: string | null
          right_leg_id?: string | null
          sponsor_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_current_rank_id_fkey"
            columns: ["current_rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          shop_product_id: string | null
          total_price: number
          unit_price: number
          variant_info: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_id: string
          product_id?: string | null
          quantity?: number
          shop_product_id?: string | null
          total_price: number
          unit_price: number
          variant_info?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          shop_product_id?: string | null
          total_price?: number
          unit_price?: number
          variant_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_shop_product_id_fkey"
            columns: ["shop_product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bv_type: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_booking_status: Database["public"]["Enums"]["delivery_booking_status"]
          delivery_fee: number
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_provider:
            | Database["public"]["Enums"]["delivery_provider"]
            | null
          discount: number
          driver_id: string | null
          farmer_id: string | null
          farmer_price: number | null
          id: string
          items: Json
          items_count: number
          notes: string | null
          order_number: string
          order_type: string
          payment_fee: number
          referrer_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          terra_fee: number | null
          terra_fee_bv: number | null
          total: number
          updated_at: string
        }
        Insert: {
          bv_type?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_booking_status?: Database["public"]["Enums"]["delivery_booking_status"]
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_provider?:
            | Database["public"]["Enums"]["delivery_provider"]
            | null
          discount?: number
          driver_id?: string | null
          farmer_id?: string | null
          farmer_price?: number | null
          id?: string
          items?: Json
          items_count?: number
          notes?: string | null
          order_number: string
          order_type?: string
          payment_fee?: number
          referrer_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          terra_fee?: number | null
          terra_fee_bv?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          bv_type?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_booking_status?: Database["public"]["Enums"]["delivery_booking_status"]
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_provider?:
            | Database["public"]["Enums"]["delivery_provider"]
            | null
          discount?: number
          driver_id?: string | null
          farmer_id?: string | null
          farmer_price?: number | null
          id?: string
          items?: Json
          items_count?: number
          notes?: string | null
          order_number?: string
          order_type?: string
          payment_fee?: number
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
          {
            foreignKeyName: "orders_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_entries: {
        Row: {
          amount: number
          created_at: string
          id: string
          payout_method: string | null
          payout_run_id: string
          payout_status: string
          reference_number: string | null
          target_user_id: string
          target_user_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payout_method?: string | null
          payout_run_id: string
          payout_status?: string
          reference_number?: string | null
          target_user_id: string
          target_user_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payout_method?: string | null
          payout_run_id?: string
          payout_status?: string
          reference_number?: string | null
          target_user_id?: string
          target_user_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_entries_payout_run_id_fkey"
            columns: ["payout_run_id"]
            isOneToOne: false
            referencedRelation: "payout_runs"
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
      payout_runs: {
        Row: {
          created_at: string
          created_by_user_id: string
          id: string
          notes: string | null
          payment_method: string | null
          payout_status: string
          payout_type: string
          period_end: string
          period_start: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payout_status?: string
          payout_type: string
          period_end: string
          period_start: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          payout_status?: string
          payout_type?: string
          period_end?: string
          period_start?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability_end: string | null
          availability_start: string | null
          category: string
          created_at: string
          cutoff_time: string | null
          description: string | null
          farmer_id: string
          harvest_date: string | null
          id: string
          image_url: string | null
          is_organic: boolean | null
          is_paused: boolean
          name: string
          price: number
          stock: number
          unit: string
          updated_at: string
        }
        Insert: {
          availability_end?: string | null
          availability_start?: string | null
          category: string
          created_at?: string
          cutoff_time?: string | null
          description?: string | null
          farmer_id: string
          harvest_date?: string | null
          id?: string
          image_url?: string | null
          is_organic?: boolean | null
          is_paused?: boolean
          name: string
          price: number
          stock?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          availability_end?: string | null
          availability_start?: string | null
          category?: string
          created_at?: string
          cutoff_time?: string | null
          description?: string | null
          farmer_id?: string
          harvest_date?: string | null
          id?: string
          image_url?: string | null
          is_organic?: boolean | null
          is_paused?: boolean
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
          {
            foreignKeyName: "products_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "farmers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          agri_token_balance: number | null
          avatar_url: string | null
          business_name: string | null
          created_at: string
          email: string
          external_wallet_address: string | null
          full_name: string | null
          id: string
          phone: string | null
          referral_code: string
          referred_by: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agri_token_balance?: number | null
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          email: string
          external_wallet_address?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code: string
          referred_by?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agri_token_balance?: number | null
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          email?: string
          external_wallet_address?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          tax_id?: string | null
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
      ranks: {
        Row: {
          badge_color: string
          binary_match_percent: number
          created_at: string
          daily_cap: number
          id: string
          matching_bonus_depth: number
          name: string
          rank_order: number
          required_direct_referrals: number
          required_left_leg_bv: number
          required_personal_bv: number
          required_right_leg_bv: number
        }
        Insert: {
          badge_color?: string
          binary_match_percent?: number
          created_at?: string
          daily_cap?: number
          id?: string
          matching_bonus_depth?: number
          name: string
          rank_order: number
          required_direct_referrals?: number
          required_left_leg_bv?: number
          required_personal_bv?: number
          required_right_leg_bv?: number
        }
        Update: {
          badge_color?: string
          binary_match_percent?: number
          created_at?: string
          daily_cap?: number
          id?: string
          matching_bonus_depth?: number
          name?: string
          rank_order?: number
          required_direct_referrals?: number
          required_left_leg_bv?: number
          required_personal_bv?: number
          required_right_leg_bv?: number
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          price: number
          product_type: string
          sku: string
          status: string
          stock_quantity: number | null
          terra_fee_percent: number
          token_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          price?: number
          product_type: string
          sku: string
          status?: string
          stock_quantity?: number | null
          terra_fee_percent?: number
          token_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          price?: number
          product_type?: string
          sku?: string
          status?: string
          stock_quantity?: number | null
          terra_fee_percent?: number
          token_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          closed_at: string | null
          created_at: string
          id: string
          order_id: string | null
          priority: string
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          closed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          priority?: string
          status?: string
          subject: string
          ticket_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          priority?: string
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          message: string
          sender_type: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message: string
          sender_type?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message?: string
          sender_type?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
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
      wallet_transactions: {
        Row: {
          actor_id: string | null
          amount: number
          balance_after: number
          balance_before: number | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          status: string
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          actor_id?: string | null
          amount: number
          balance_after: number
          balance_before?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          transaction_type: string
          user_id: string
          wallet_id: string
        }
        Update: {
          actor_id?: string | null
          amount?: number
          balance_after?: number
          balance_before?: number | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number
          created_at: string
          id: string
          pending_balance: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          id?: string
          pending_balance?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          id?: string
          pending_balance?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          account_details: Json | null
          amount: number
          created_at: string
          fee: number
          id: string
          method: string
          net_amount: number
          reference_code: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          account_details?: Json | null
          amount: number
          created_at?: string
          fee?: number
          id?: string
          method: string
          net_amount: number
          reference_code?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          account_details?: Json | null
          amount?: number
          created_at?: string
          fee?: number
          id?: string
          method?: string
          net_amount?: number
          reference_code?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      farmers_public: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string | null
          products_count: number | null
          rating: number | null
          status: Database["public"]["Enums"]["farmer_status"] | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          products_count?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["farmer_status"] | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string | null
          products_count?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["farmer_status"] | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_asset_code: { Args: { prefix?: string }; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      post_wallet_entry: {
        Args: {
          p_actor_id?: string
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: {
          balance_after: number
          balance_before: number
          wallet_id: string
        }[]
      }
    }
    Enums: {
      account_type: "individual" | "company"
      app_role:
        | "farmer"
        | "business_buyer"
        | "member"
        | "driver"
        | "admin"
        | "buyer"
        | "affiliate"
      delivery_booking_status:
        | "none"
        | "pending"
        | "confirmed"
        | "in_transit"
        | "completed"
        | "cancelled"
      delivery_provider: "lalamove" | "grab"
      driver_status: "online" | "offline" | "delivering"
      farmer_status: "active" | "pending" | "suspended"
      kyc_document_type:
        | "government_id"
        | "passport"
        | "drivers_license"
        | "proof_of_address"
        | "selfie"
        | "business_registration"
        | "articles_of_incorporation"
        | "tax_certificate"
      kyc_status:
        | "not_started"
        | "pending"
        | "in_review"
        | "approved"
        | "rejected"
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
      account_type: ["individual", "company"],
      app_role: [
        "farmer",
        "business_buyer",
        "member",
        "driver",
        "admin",
        "buyer",
        "affiliate",
      ],
      delivery_booking_status: [
        "none",
        "pending",
        "confirmed",
        "in_transit",
        "completed",
        "cancelled",
      ],
      delivery_provider: ["lalamove", "grab"],
      driver_status: ["online", "offline", "delivering"],
      farmer_status: ["active", "pending", "suspended"],
      kyc_document_type: [
        "government_id",
        "passport",
        "drivers_license",
        "proof_of_address",
        "selfie",
        "business_registration",
        "articles_of_incorporation",
        "tax_certificate",
      ],
      kyc_status: [
        "not_started",
        "pending",
        "in_review",
        "approved",
        "rejected",
      ],
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

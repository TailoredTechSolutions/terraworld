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
      activation_events: {
        Row: {
          activation_status: string
          amount_paid: number
          created_at: string
          id: string
          package_id: string
          payment_reference: string | null
          user_id: string
        }
        Insert: {
          activation_status?: string
          amount_paid: number
          created_at?: string
          id?: string
          package_id: string
          payment_reference?: string | null
          user_id: string
        }
        Update: {
          activation_status?: string
          amount_paid?: number
          created_at?: string
          id?: string
          package_id?: string
          payment_reference?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activation_events_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_scopes: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          scope_key: string
          scope_value: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          scope_key: string
          scope_value?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          scope_key?: string
          scope_value?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          ended_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean
          started_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean
          started_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean
          started_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          module: string
          reason: string | null
          request_payload: Json
          requested_by: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          module: string
          reason?: string | null
          request_payload?: Json
          requested_by: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          module?: string
          reason?: string | null
          request_payload?: Json
          requested_by?: string
          status?: string
        }
        Relationships: []
      }
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
      burn_events: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          source_reference: string | null
          source_type: string
          token_amount: number
          treasury_account_id: string | null
          tx_hash: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          source_reference?: string | null
          source_type: string
          token_amount: number
          treasury_account_id?: string | null
          tx_hash?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          source_reference?: string | null
          source_type?: string
          token_amount?: number
          treasury_account_id?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "burn_events_treasury_account_id_fkey"
            columns: ["treasury_account_id"]
            isOneToOne: false
            referencedRelation: "treasury_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      bv_expiry_events: {
        Row: {
          bv_type: string
          expired_at: string
          expired_bv: number
          id: string
          leg_side: string
          reason: string | null
          user_id: string
          volume_id: string
        }
        Insert: {
          bv_type: string
          expired_at?: string
          expired_bv: number
          id?: string
          leg_side: string
          reason?: string | null
          user_id: string
          volume_id: string
        }
        Update: {
          bv_type?: string
          expired_at?: string
          expired_bv?: number
          id?: string
          leg_side?: string
          reason?: string | null
          user_id?: string
          volume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bv_expiry_events_volume_id_fkey"
            columns: ["volume_id"]
            isOneToOne: false
            referencedRelation: "volumes"
            referencedColumns: ["id"]
          },
        ]
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
      campaign_coupon_links: {
        Row: {
          campaign_id: string
          coupon_id: string
          id: string
        }
        Insert: {
          campaign_id: string
          coupon_id: string
          id?: string
        }
        Update: {
          campaign_id?: string
          coupon_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_coupon_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotion_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_coupon_links_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_reward_rule_links: {
        Row: {
          campaign_id: string
          id: string
          reward_rule_id: string
        }
        Insert: {
          campaign_id: string
          id?: string
          reward_rule_id: string
        }
        Update: {
          campaign_id?: string
          id?: string
          reward_rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_reward_rule_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "promotion_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_reward_rule_links_reward_rule_id_fkey"
            columns: ["reward_rule_id"]
            isOneToOne: false
            referencedRelation: "token_reward_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      carry_forward_ledger: {
        Row: {
          created_at: string
          id: string
          left_membership_bv_after: number
          left_membership_bv_before: number
          left_product_bv_after: number
          left_product_bv_before: number
          matched_membership_bv: number
          matched_product_bv: number
          right_membership_bv_after: number
          right_membership_bv_before: number
          right_product_bv_after: number
          right_product_bv_before: number
          run_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          left_membership_bv_after?: number
          left_membership_bv_before?: number
          left_product_bv_after?: number
          left_product_bv_before?: number
          matched_membership_bv?: number
          matched_product_bv?: number
          right_membership_bv_after?: number
          right_membership_bv_before?: number
          right_product_bv_after?: number
          right_product_bv_before?: number
          run_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          left_membership_bv_after?: number
          left_membership_bv_before?: number
          left_product_bv_after?: number
          left_product_bv_before?: number
          matched_membership_bv?: number
          matched_product_bv?: number
          right_membership_bv_after?: number
          right_membership_bv_before?: number
          right_product_bv_after?: number
          right_product_bv_before?: number
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carry_forward_ledger_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "commission_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: string
        }
        Relationships: []
      }
      commission_lines: {
        Row: {
          binary_cap_applied: number
          binary_cap_limit: number
          binary_membership_paid: number
          binary_product_paid: number
          binary_total_before_cap: number
          binary_total_paid: number
          carry_left_membership_bv: number
          carry_left_product_bv: number
          carry_right_membership_bv: number
          carry_right_product_bv: number
          created_at: string
          id: string
          left_membership_bv: number
          left_product_bv: number
          matched_membership_bv: number
          matched_product_bv: number
          qualification_passed: boolean
          right_membership_bv: number
          right_product_bv: number
          run_id: string
          statement_json: Json
          user_id: string
        }
        Insert: {
          binary_cap_applied?: number
          binary_cap_limit?: number
          binary_membership_paid?: number
          binary_product_paid?: number
          binary_total_before_cap?: number
          binary_total_paid?: number
          carry_left_membership_bv?: number
          carry_left_product_bv?: number
          carry_right_membership_bv?: number
          carry_right_product_bv?: number
          created_at?: string
          id?: string
          left_membership_bv?: number
          left_product_bv?: number
          matched_membership_bv?: number
          matched_product_bv?: number
          qualification_passed?: boolean
          right_membership_bv?: number
          right_product_bv?: number
          run_id: string
          statement_json?: Json
          user_id: string
        }
        Update: {
          binary_cap_applied?: number
          binary_cap_limit?: number
          binary_membership_paid?: number
          binary_product_paid?: number
          binary_total_before_cap?: number
          binary_total_paid?: number
          carry_left_membership_bv?: number
          carry_left_product_bv?: number
          carry_right_membership_bv?: number
          carry_right_product_bv?: number
          created_at?: string
          id?: string
          left_membership_bv?: number
          left_product_bv?: number
          matched_membership_bv?: number
          matched_product_bv?: number
          qualification_passed?: boolean
          right_membership_bv?: number
          right_product_bv?: number
          run_id?: string
          statement_json?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_lines_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "commission_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_reversals: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          original_run_id: string
          reason: string
          reversal_run_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          original_run_id: string
          reason: string
          reversal_run_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          original_run_id?: string
          reason?: string
          reversal_run_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_reversals_original_run_id_fkey"
            columns: ["original_run_id"]
            isOneToOne: false
            referencedRelation: "commission_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_reversals_reversal_run_id_fkey"
            columns: ["reversal_run_id"]
            isOneToOne: false
            referencedRelation: "commission_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_runs: {
        Row: {
          adjusted_cycle_value: number
          base_cycle_value: number
          binary_after_caps_total: number
          binary_before_caps_total: number
          compensation_pool: number
          completed_at: string | null
          created_at: string
          direct_membership_bonus_total: number
          direct_product_bonus_total: number
          fail_safe_triggered: boolean
          id: string
          initiated_by: string | null
          matching_total: number
          membership_binary_required: number
          membership_payout_ratio: number
          notes: string | null
          period_end: string
          period_start: string
          run_code: string
          run_type: string
          status: string
          total_terra_fee: number
        }
        Insert: {
          adjusted_cycle_value?: number
          base_cycle_value?: number
          binary_after_caps_total?: number
          binary_before_caps_total?: number
          compensation_pool?: number
          completed_at?: string | null
          created_at?: string
          direct_membership_bonus_total?: number
          direct_product_bonus_total?: number
          fail_safe_triggered?: boolean
          id?: string
          initiated_by?: string | null
          matching_total?: number
          membership_binary_required?: number
          membership_payout_ratio?: number
          notes?: string | null
          period_end: string
          period_start: string
          run_code: string
          run_type?: string
          status?: string
          total_terra_fee?: number
        }
        Update: {
          adjusted_cycle_value?: number
          base_cycle_value?: number
          binary_after_caps_total?: number
          binary_before_caps_total?: number
          compensation_pool?: number
          completed_at?: string | null
          created_at?: string
          direct_membership_bonus_total?: number
          direct_product_bonus_total?: number
          fail_safe_triggered?: boolean
          id?: string
          initiated_by?: string | null
          matching_total?: number
          membership_binary_required?: number
          membership_payout_ratio?: number
          notes?: string | null
          period_end?: string
          period_start?: string
          run_code?: string
          run_type?: string
          status?: string
          total_terra_fee?: number
        }
        Relationships: []
      }
      commission_statements: {
        Row: {
          created_at: string
          id: string
          run_id: string
          statement_data: Json
          statement_period_end: string
          statement_period_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          run_id: string
          statement_data?: Json
          statement_period_end: string
          statement_period_start: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          run_id?: string
          statement_data?: Json
          statement_period_end?: string
          statement_period_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_statements_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "commission_runs"
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
      country_rules: {
        Row: {
          country_code: string
          id: string
          is_allowed: boolean
          kyc_required: boolean
          notes: string | null
          updated_at: string
          updated_by: string | null
          withdrawals_allowed: boolean
        }
        Insert: {
          country_code: string
          id?: string
          is_allowed?: boolean
          kyc_required?: boolean
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
          withdrawals_allowed?: boolean
        }
        Update: {
          country_code?: string
          id?: string
          is_allowed?: boolean
          kyc_required?: boolean
          notes?: string | null
          updated_at?: string
          updated_by?: string | null
          withdrawals_allowed?: boolean
        }
        Relationships: []
      }
      coupon_abuse_flags: {
        Row: {
          coupon_id: string | null
          created_at: string
          flagged_by: string | null
          id: string
          reason: string
          redemption_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          flagged_by?: string | null
          id?: string
          reason: string
          redemption_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          flagged_by?: string | null
          id?: string
          reason?: string
          redemption_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_abuse_flags_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_abuse_flags_redemption_id_fkey"
            columns: ["redemption_id"]
            isOneToOne: false
            referencedRelation: "coupon_redemptions"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_packages: {
        Row: {
          bonus_percent: number
          bv_type: string
          created_at: string
          description: string | null
          expiry_days: number | null
          id: string
          is_active: boolean
          name: string
          price: number
          terra_fee_percent: number
          token_reward_percent: number
          updated_at: string
          usable_value_percent: number
        }
        Insert: {
          bonus_percent?: number
          bv_type?: string
          created_at?: string
          description?: string | null
          expiry_days?: number | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          terra_fee_percent?: number
          token_reward_percent?: number
          updated_at?: string
          usable_value_percent?: number
        }
        Update: {
          bonus_percent?: number
          bv_type?: string
          created_at?: string
          description?: string | null
          expiry_days?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          terra_fee_percent?: number
          token_reward_percent?: number
          updated_at?: string
          usable_value_percent?: number
        }
        Relationships: []
      }
      coupon_purchases: {
        Row: {
          balance_remaining: number
          bonus_value: number
          bv_generated: number
          created_at: string
          expires_at: string | null
          id: string
          package_id: string
          price_paid: number
          status: string
          terra_fee: number
          token_reward: number
          updated_at: string
          usable_value: number
          user_id: string
        }
        Insert: {
          balance_remaining: number
          bonus_value?: number
          bv_generated?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id: string
          price_paid: number
          status?: string
          terra_fee: number
          token_reward?: number
          updated_at?: string
          usable_value: number
          user_id: string
        }
        Update: {
          balance_remaining?: number
          bonus_value?: number
          bv_generated?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string
          price_paid?: number
          status?: string
          terra_fee?: number
          token_reward?: number
          updated_at?: string
          usable_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "coupon_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          discount_applied: number
          id: string
          redeemed_at: string
          reference_id: string | null
          reference_type: string | null
          status: string
          token_bonus_issued: number | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_applied?: number
          id?: string
          redeemed_at?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          token_bonus_issued?: number | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_applied?: number
          id?: string
          redeemed_at?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          token_bonus_issued?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applies_to: string
          audience_type: string
          code: string
          created_at: string
          created_by: string | null
          discount_value: number | null
          ends_at: string | null
          id: string
          is_stackable: boolean
          max_discount: number | null
          name: string
          per_user_limit: number | null
          starts_at: string | null
          status: string
          token_bonus_php: number | null
          type: string
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          applies_to: string
          audience_type: string
          code: string
          created_at?: string
          created_by?: string | null
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_stackable?: boolean
          max_discount?: number | null
          name: string
          per_user_limit?: number | null
          starts_at?: string | null
          status?: string
          token_bonus_php?: number | null
          type: string
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          applies_to?: string
          audience_type?: string
          code?: string
          created_at?: string
          created_by?: string | null
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_stackable?: boolean
          max_discount?: number | null
          name?: string
          per_user_limit?: number | null
          starts_at?: string | null
          status?: string
          token_bonus_php?: number | null
          type?: string
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: []
      }
      data_integrity_checks: {
        Row: {
          check_code: string
          details: Json
          executed_at: string
          id: string
          module: string
          status: string
        }
        Insert: {
          check_code: string
          details?: Json
          executed_at?: string
          id?: string
          module: string
          status: string
        }
        Update: {
          check_code?: string
          details?: Json
          executed_at?: string
          id?: string
          module?: string
          status?: string
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
      delivery_events: {
        Row: {
          created_at: string
          delivery_booking_id: string
          event_payload: Json
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string
          delivery_booking_id: string
          event_payload?: Json
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string
          delivery_booking_id?: string
          event_payload?: Json
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_events_delivery_booking_id_fkey"
            columns: ["delivery_booking_id"]
            isOneToOne: false
            referencedRelation: "delivery_bookings"
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
      direct_bonus_lines: {
        Row: {
          base_amount: number
          bonus_paid: number
          created_at: string
          id: string
          rate: number
          run_id: string
          source_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          base_amount: number
          bonus_paid: number
          created_at?: string
          id?: string
          rate: number
          run_id: string
          source_id?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          base_amount?: number
          bonus_paid?: number
          created_at?: string
          id?: string
          rate?: number
          run_id?: string
          source_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_bonus_lines_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "commission_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          resolution_notes: string | null
          resolution_status: string
          resolved_at: string | null
          resolved_by: string | null
          ticket_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          resolution_notes?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          ticket_id?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          resolution_notes?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          ticket_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_performance_daily: {
        Row: {
          assigned_count: number
          avg_delivery_minutes: number | null
          delivered_count: number
          driver_id: string
          failed_count: number
          id: string
          stat_date: string
        }
        Insert: {
          assigned_count?: number
          avg_delivery_minutes?: number | null
          delivered_count?: number
          driver_id: string
          failed_count?: number
          id?: string
          stat_date: string
        }
        Update: {
          assigned_count?: number
          avg_delivery_minutes?: number | null
          delivered_count?: number
          driver_id?: string
          failed_count?: number
          id?: string
          stat_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_performance_daily_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
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
      feature_flags: {
        Row: {
          config: Json
          flag_code: string
          flag_name: string
          id: string
          is_enabled: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config?: Json
          flag_code: string
          flag_name: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config?: Json
          flag_code?: string
          flag_name?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      fraud_flags: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          entity_id: string | null
          entity_type: string
          id: string
          module: string
          reason: string
          resolved_at: string | null
          rule_code: string | null
          severity: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          module: string
          reason: string
          resolved_at?: string | null
          rule_code?: string | null
          severity?: string
          status?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          module?: string
          reason?: string
          resolved_at?: string | null
          rule_code?: string | null
          severity?: string
          status?: string
        }
        Relationships: []
      }
      genealogy_snapshots: {
        Row: {
          id: string
          left_active_count: number
          left_count: number
          right_active_count: number
          right_count: number
          snapshot_date: string
          user_id: string
        }
        Insert: {
          id?: string
          left_active_count?: number
          left_count?: number
          right_active_count?: number
          right_count?: number
          snapshot_date: string
          user_id: string
        }
        Update: {
          id?: string
          left_active_count?: number
          left_count?: number
          right_active_count?: number
          right_count?: number
          snapshot_date?: string
          user_id?: string
        }
        Relationships: []
      }
      high_risk_actions: {
        Row: {
          action_code: string
          approval_required: boolean
          approval_status: string
          approved_by: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          executed_at: string | null
          id: string
          module: string
          reason: string | null
          requested_by: string | null
        }
        Insert: {
          action_code: string
          approval_required?: boolean
          approval_status?: string
          approved_by?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          executed_at?: string | null
          id?: string
          module: string
          reason?: string | null
          requested_by?: string | null
        }
        Update: {
          action_code?: string
          approval_required?: boolean
          approval_status?: string
          approved_by?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          executed_at?: string | null
          id?: string
          module?: string
          reason?: string | null
          requested_by?: string | null
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          product_id: string
          qty: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          product_id: string
          qty: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          product_id?: string
          qty?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      kyc_reviews: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          profile_id: string
          review_status: string
          reviewed_at: string | null
          reviewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          profile_id: string
          review_status?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          profile_id?: string
          review_status?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
        }
        Relationships: []
      }
      ledger_reversals: {
        Row: {
          created_at: string
          created_by: string
          id: string
          original_entry_id: string
          reason: string
          reversal_entry_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          original_entry_id: string
          reason: string
          reversal_entry_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          original_entry_id?: string
          reason?: string
          reversal_entry_id?: string | null
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
      matching_lines: {
        Row: {
          created_at: string
          downline_binary_paid: number
          downline_user_id: string
          id: string
          level_no: number
          matching_paid: number
          matching_rate: number
          qualification_passed: boolean
          run_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          downline_binary_paid: number
          downline_user_id: string
          id?: string
          level_no: number
          matching_paid: number
          matching_rate: number
          qualification_passed?: boolean
          run_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          downline_binary_paid?: number
          downline_user_id?: string
          id?: string
          level_no?: number
          matching_paid?: number
          matching_rate?: number
          qualification_passed?: boolean
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matching_lines_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "commission_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      member_package_history: {
        Row: {
          action_type: string
          created_at: string
          created_by: string | null
          effective_at: string
          expires_at: string | null
          id: string
          package_id: string
          source_id: string | null
          source_type: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          created_by?: string | null
          effective_at?: string
          expires_at?: string | null
          id?: string
          package_id: string
          source_id?: string | null
          source_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          created_by?: string | null
          effective_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string
          source_id?: string | null
          source_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_package_history_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      member_rank_history: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string
          id: string
          new_rank_id: string | null
          old_rank_id: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_rank_id?: string | null
          old_rank_id?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_rank_id?: string | null
          old_rank_id?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_rank_history_new_rank_id_fkey"
            columns: ["new_rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_rank_history_old_rank_id_fkey"
            columns: ["old_rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
        ]
      }
      member_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_activation_status: string | null
          new_binary_status: string | null
          old_activation_status: string | null
          old_binary_status: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_activation_status?: string | null
          new_binary_status?: string | null
          old_activation_status?: string | null
          old_binary_status?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_activation_status?: string | null
          new_binary_status?: string | null
          old_activation_status?: string | null
          old_binary_status?: string | null
          reason?: string | null
          user_id?: string
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
      packages: {
        Row: {
          binary_cap_daily: number
          binary_rate: number
          bv: number
          code: string
          created_at: string
          direct_membership_bonus_rate: number
          direct_product_bonus_rate: number
          id: string
          is_active: boolean
          is_free: boolean
          matching_levels: number
          name: string
          price: number
          pv: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          binary_cap_daily?: number
          binary_rate?: number
          bv?: number
          code: string
          created_at?: string
          direct_membership_bonus_rate?: number
          direct_product_bonus_rate?: number
          id?: string
          is_active?: boolean
          is_free?: boolean
          matching_levels?: number
          name: string
          price?: number
          pv?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          binary_cap_daily?: number
          binary_rate?: number
          bv?: number
          code?: string
          created_at?: string
          direct_membership_bonus_rate?: number
          direct_product_bonus_rate?: number
          id?: string
          is_active?: boolean
          is_free?: boolean
          matching_levels?: number
          name?: string
          price?: number
          pv?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_reconciliation: {
        Row: {
          id: string
          notes: string | null
          payment_transaction_id: string
          reconciled_amount: number
          reconciled_at: string | null
          reconciled_by: string | null
          reconciliation_status: string
          variance_amount: number
        }
        Insert: {
          id?: string
          notes?: string | null
          payment_transaction_id: string
          reconciled_amount: number
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string
          variance_amount?: number
        }
        Update: {
          id?: string
          notes?: string | null
          payment_transaction_id?: string
          reconciled_amount?: number
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string
          variance_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_reconciliation_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string | null
          payload: Json
          provider: string
          provider_reference: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payload?: Json
          provider: string
          provider_reference?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payload?: Json
          provider?: string
          provider_reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
      payout_postings: {
        Row: {
          amount: number
          created_at: string
          id: string
          posted_at: string | null
          posting_status: string
          posting_type: string
          run_id: string
          source_line_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          posted_at?: string | null
          posting_status?: string
          posting_type: string
          run_id: string
          source_line_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          posted_at?: string | null
          posting_status?: string
          posting_type?: string
          run_id?: string
          source_line_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_postings_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "commission_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_records: {
        Row: {
          created_at: string
          fee_amount: number
          gross_amount: number
          id: string
          net_amount: number
          paid_at: string | null
          payment_reference: string | null
          recipient_id: string
          recipient_type: string
          source_id: string | null
          source_type: string
          status: string
        }
        Insert: {
          created_at?: string
          fee_amount?: number
          gross_amount: number
          id?: string
          net_amount: number
          paid_at?: string | null
          payment_reference?: string | null
          recipient_id: string
          recipient_type: string
          source_id?: string | null
          source_type: string
          status?: string
        }
        Update: {
          created_at?: string
          fee_amount?: number
          gross_amount?: number
          id?: string
          net_amount?: number
          paid_at?: string | null
          payment_reference?: string | null
          recipient_id?: string
          recipient_type?: string
          source_id?: string | null
          source_type?: string
          status?: string
        }
        Relationships: []
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
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          label: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          label: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      placement_lock_events: {
        Row: {
          changed_by: string | null
          commission_run_id: string | null
          created_at: string
          id: string
          lock_status: string
          member_id: string
          reason: string | null
        }
        Insert: {
          changed_by?: string | null
          commission_run_id?: string | null
          created_at?: string
          id?: string
          lock_status: string
          member_id: string
          reason?: string | null
        }
        Update: {
          changed_by?: string | null
          commission_run_id?: string | null
          created_at?: string
          id?: string
          lock_status?: string
          member_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "placement_lock_events_commission_run_id_fkey"
            columns: ["commission_run_id"]
            isOneToOne: false
            referencedRelation: "commission_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          proposed_parent_user_id: string
          proposed_side: string
          reason: string | null
          request_type: string
          requested_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          proposed_parent_user_id: string
          proposed_side: string
          reason?: string | null
          request_type: string
          requested_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          proposed_parent_user_id?: string
          proposed_side?: string
          reason?: string | null
          request_type?: string
          requested_by?: string | null
          status?: string
          user_id?: string
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
      pricing_rules: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          rule_name: string
          starts_at: string | null
          tax_mode: string
          tax_value: number
          terra_fee_mode: string
          terra_fee_value: number
          transport_config: Json
          transport_mode: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          rule_name: string
          starts_at?: string | null
          tax_mode?: string
          tax_value?: number
          terra_fee_mode?: string
          terra_fee_value?: number
          transport_config?: Json
          transport_mode?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          rule_name?: string
          starts_at?: string | null
          tax_mode?: string
          tax_value?: number
          terra_fee_mode?: string
          terra_fee_value?: number
          transport_config?: Json
          transport_mode?: string
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
      promotion_campaigns: {
        Row: {
          config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          kpi_target: Json | null
          name: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          kpi_target?: Json | null
          name: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          kpi_target?: Json | null
          name?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      rank_qualification_snapshots: {
        Row: {
          id: string
          is_qualified: boolean
          qualification_data: Json
          rank_id: string
          snapshot_date: string
          user_id: string
        }
        Insert: {
          id?: string
          is_qualified?: boolean
          qualification_data?: Json
          rank_id: string
          snapshot_date: string
          user_id: string
        }
        Update: {
          id?: string
          is_qualified?: boolean
          qualification_data?: Json
          rank_id?: string
          snapshot_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rank_qualification_snapshots_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
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
      refund_cases: {
        Row: {
          approved_amount: number | null
          created_at: string
          id: string
          order_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          requested_amount: number
          status: string
          ticket_id: string | null
        }
        Insert: {
          approved_amount?: number | null
          created_at?: string
          id?: string
          order_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_amount: number
          status?: string
          ticket_id?: string | null
        }
        Update: {
          approved_amount?: number | null
          created_at?: string
          id?: string
          order_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_amount?: number
          status?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_cases_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_cases_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      report_exports: {
        Row: {
          completed_at: string | null
          created_at: string
          file_format: string
          file_url: string | null
          filter_payload: Json
          id: string
          report_type: string
          requested_by: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          file_format: string
          file_url?: string | null
          filter_payload?: Json
          id?: string
          report_type: string
          requested_by?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          file_format?: string
          file_url?: string | null
          filter_payload?: Json
          id?: string
          report_type?: string
          requested_by?: string | null
          status?: string
        }
        Relationships: []
      }
      return_cases: {
        Row: {
          created_at: string
          id: string
          order_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          status: string
          ticket_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          status?: string
          ticket_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          status?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_cases_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_cases_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_reviews: {
        Row: {
          created_at: string
          fraud_flag_id: string
          id: string
          notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewer_id: string | null
        }
        Insert: {
          created_at?: string
          fraud_flag_id: string
          id?: string
          notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
        }
        Update: {
          created_at?: string
          fraud_flag_id?: string
          id?: string
          notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_reviews_fraud_flag_id_fkey"
            columns: ["fraud_flag_id"]
            isOneToOne: false
            referencedRelation: "fraud_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
        ]
      }
      saved_report_views: {
        Row: {
          created_at: string
          filter_payload: Json
          id: string
          name: string
          report_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filter_payload?: Json
          id?: string
          name: string
          report_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          filter_payload?: Json
          id?: string
          name?: string
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          id: string
          setting_code: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_code: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_code?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      settlement_cycles: {
        Row: {
          closed_at: string | null
          created_at: string
          cycle_code: string
          gross_settlement_php: number
          id: string
          logistics_settlement_php: number
          merchant_settlement_php: number
          period_end: string
          period_start: string
          status: string
          treasury_allocation_php: number
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          cycle_code: string
          gross_settlement_php?: number
          id?: string
          logistics_settlement_php?: number
          merchant_settlement_php?: number
          period_end: string
          period_start: string
          status?: string
          treasury_allocation_php?: number
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          cycle_code?: string
          gross_settlement_php?: number
          id?: string
          logistics_settlement_php?: number
          merchant_settlement_php?: number
          period_end?: string
          period_start?: string
          status?: string
          treasury_allocation_php?: number
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
      system_toggles: {
        Row: {
          created_at: string
          description: string | null
          feature_key: string
          id: string
          is_enabled: boolean
          label: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          feature_key: string
          id?: string
          is_enabled?: boolean
          label: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          feature_key?: string
          id?: string
          is_enabled?: boolean
          label?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
      token_allocations: {
        Row: {
          allocation_amount: number
          allocation_percent: number
          bucket_code: string
          bucket_name: string
          burned_amount: number
          created_at: string
          distributed_amount: number
          id: string
          is_locked: boolean
          released_amount: number
          remaining_amount: number
          updated_at: string
        }
        Insert: {
          allocation_amount?: number
          allocation_percent?: number
          bucket_code: string
          bucket_name: string
          burned_amount?: number
          created_at?: string
          distributed_amount?: number
          id?: string
          is_locked?: boolean
          released_amount?: number
          remaining_amount?: number
          updated_at?: string
        }
        Update: {
          allocation_amount?: number
          allocation_percent?: number
          bucket_code?: string
          bucket_name?: string
          burned_amount?: number
          created_at?: string
          distributed_amount?: number
          id?: string
          is_locked?: boolean
          released_amount?: number
          remaining_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      token_burn_events: {
        Row: {
          bucket_id: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          reference_id: string | null
          source_type: string
          token_amount: number | null
          tokens_burned: number
          tx_hash: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          reference_id?: string | null
          source_type: string
          token_amount?: number | null
          tokens_burned: number
          tx_hash?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          reference_id?: string | null
          source_type?: string
          token_amount?: number | null
          tokens_burned?: number
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_burn_events_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "token_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      token_issuance_reversals: {
        Row: {
          created_at: string
          created_by: string
          id: string
          original_issuance_id: string
          reason: string
          reversal_issuance_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          original_issuance_id: string
          reason: string
          reversal_issuance_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          original_issuance_id?: string
          reason?: string
          reversal_issuance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_issuance_reversals_original_issuance_id_fkey"
            columns: ["original_issuance_id"]
            isOneToOne: false
            referencedRelation: "token_issuances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_issuance_reversals_reversal_issuance_id_fkey"
            columns: ["reversal_issuance_id"]
            isOneToOne: false
            referencedRelation: "token_issuances"
            referencedColumns: ["id"]
          },
        ]
      }
      token_issuances: {
        Row: {
          bucket_id: string | null
          created_at: string
          id: string
          issued_at: string
          issued_by: string | null
          recipient_id: string | null
          recipient_type: string
          recipient_user_id: string
          reference_id: string | null
          reference_type: string | null
          reward_php: number
          reward_rule_id: string | null
          rule_id: string | null
          status: string
          token_price_php: number
          tokens_issued: number
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          recipient_id?: string | null
          recipient_type?: string
          recipient_user_id: string
          reference_id?: string | null
          reference_type?: string | null
          reward_php: number
          reward_rule_id?: string | null
          rule_id?: string | null
          status?: string
          token_price_php: number
          tokens_issued: number
        }
        Update: {
          bucket_id?: string | null
          created_at?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          recipient_id?: string | null
          recipient_type?: string
          recipient_user_id?: string
          reference_id?: string | null
          reference_type?: string | null
          reward_php?: number
          reward_rule_id?: string | null
          rule_id?: string | null
          status?: string
          token_price_php?: number
          tokens_issued?: number
        }
        Relationships: [
          {
            foreignKeyName: "token_issuances_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "token_allocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_issuances_reward_rule_id_fkey"
            columns: ["reward_rule_id"]
            isOneToOne: false
            referencedRelation: "token_reward_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_issuances_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "token_reward_rules"
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
      token_market_snapshots: {
        Row: {
          captured_at: string
          id: string
          price_php: number
          source: string
        }
        Insert: {
          captured_at?: string
          id?: string
          price_php: number
          source?: string
        }
        Update: {
          captured_at?: string
          id?: string
          price_php?: number
          source?: string
        }
        Relationships: []
      }
      token_reserve_releases: {
        Row: {
          allocation_id: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          governance_mode: string
          id: string
          purpose: string
          released_at: string | null
          released_by: string | null
          requested_amount: number
          requested_by: string | null
          status: string
        }
        Insert: {
          allocation_id: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          governance_mode?: string
          id?: string
          purpose: string
          released_at?: string | null
          released_by?: string | null
          requested_amount: number
          requested_by?: string | null
          status?: string
        }
        Update: {
          allocation_id?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          governance_mode?: string
          id?: string
          purpose?: string
          released_at?: string | null
          released_by?: string | null
          requested_amount?: number
          requested_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_reserve_releases_allocation_id_fkey"
            columns: ["allocation_id"]
            isOneToOne: false
            referencedRelation: "token_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      token_reward_rules: {
        Row: {
          basis_type: string
          code: string
          created_at: string
          daily_cap: number | null
          distribution_bucket_id: string | null
          id: string
          is_active: boolean
          name: string
          qualification_rules: Json | null
          reward_php: number
          updated_at: string
        }
        Insert: {
          basis_type: string
          code: string
          created_at?: string
          daily_cap?: number | null
          distribution_bucket_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          qualification_rules?: Json | null
          reward_php?: number
          updated_at?: string
        }
        Update: {
          basis_type?: string
          code?: string
          created_at?: string
          daily_cap?: number | null
          distribution_bucket_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          qualification_rules?: Json | null
          reward_php?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_reward_rules_distribution_bucket_id_fkey"
            columns: ["distribution_bucket_id"]
            isOneToOne: false
            referencedRelation: "token_allocations"
            referencedColumns: ["id"]
          },
        ]
      }
      token_wallet_postings: {
        Row: {
          burn_event_id: string | null
          created_at: string
          id: string
          issuance_id: string | null
          ledger_entry_id: string | null
          posting_type: string
          wallet_id: string | null
        }
        Insert: {
          burn_event_id?: string | null
          created_at?: string
          id?: string
          issuance_id?: string | null
          ledger_entry_id?: string | null
          posting_type: string
          wallet_id?: string | null
        }
        Update: {
          burn_event_id?: string | null
          created_at?: string
          id?: string
          issuance_id?: string | null
          ledger_entry_id?: string | null
          posting_type?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_wallet_postings_burn_event_id_fkey"
            columns: ["burn_event_id"]
            isOneToOne: false
            referencedRelation: "token_burn_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_wallet_postings_issuance_id_fkey"
            columns: ["issuance_id"]
            isOneToOne: false
            referencedRelation: "token_issuances"
            referencedColumns: ["id"]
          },
        ]
      }
      treasury_accounts: {
        Row: {
          asset_type: string
          code: string
          created_at: string
          current_balance: number
          id: string
          name: string
          status: string
          treasury_type: string
        }
        Insert: {
          asset_type?: string
          code: string
          created_at?: string
          current_balance?: number
          id?: string
          name: string
          status?: string
          treasury_type: string
        }
        Update: {
          asset_type?: string
          code?: string
          created_at?: string
          current_balance?: number
          id?: string
          name?: string
          status?: string
          treasury_type?: string
        }
        Relationships: []
      }
      treasury_movements: {
        Row: {
          amount: number
          approved_by: string | null
          asset_type: string
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          reason_code: string
          reference_id: string | null
          reference_type: string | null
          treasury_account_id: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          asset_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          reason_code: string
          reference_id?: string | null
          reference_type?: string | null
          treasury_account_id: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          asset_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          reason_code?: string
          reference_id?: string | null
          reference_type?: string | null
          treasury_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasury_movements_treasury_account_id_fkey"
            columns: ["treasury_account_id"]
            isOneToOne: false
            referencedRelation: "treasury_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      treasury_release_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          asset_type: string
          created_at: string
          governance_mode: string
          id: string
          purpose: string
          released_at: string | null
          released_by: string | null
          requested_amount: number
          requested_by: string | null
          status: string
          treasury_account_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          asset_type?: string
          created_at?: string
          governance_mode?: string
          id?: string
          purpose: string
          released_at?: string | null
          released_by?: string | null
          requested_amount: number
          requested_by?: string | null
          status?: string
          treasury_account_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          asset_type?: string
          created_at?: string
          governance_mode?: string
          id?: string
          purpose?: string
          released_at?: string | null
          released_by?: string | null
          requested_amount?: number
          requested_by?: string | null
          status?: string
          treasury_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasury_release_requests_treasury_account_id_fkey"
            columns: ["treasury_account_id"]
            isOneToOne: false
            referencedRelation: "treasury_accounts"
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
      volume_balances_daily: {
        Row: {
          carry_left_bv: number
          carry_right_bv: number
          id: string
          left_membership_bv: number
          left_product_bv: number
          right_membership_bv: number
          right_product_bv: number
          stat_date: string
          user_id: string
        }
        Insert: {
          carry_left_bv?: number
          carry_right_bv?: number
          id?: string
          left_membership_bv?: number
          left_product_bv?: number
          right_membership_bv?: number
          right_product_bv?: number
          stat_date: string
          user_id: string
        }
        Update: {
          carry_left_bv?: number
          carry_right_bv?: number
          id?: string
          left_membership_bv?: number
          left_product_bv?: number
          right_membership_bv?: number
          right_product_bv?: number
          stat_date?: string
          user_id?: string
        }
        Relationships: []
      }
      volume_propagation: {
        Row: {
          created_at: string
          depth: number
          from_user_id: string | null
          id: string
          leg_side: string
          to_user_id: string
          volume_id: string
        }
        Insert: {
          created_at?: string
          depth?: number
          from_user_id?: string | null
          id?: string
          leg_side: string
          to_user_id: string
          volume_id: string
        }
        Update: {
          created_at?: string
          depth?: number
          from_user_id?: string | null
          id?: string
          leg_side?: string
          to_user_id?: string
          volume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volume_propagation_volume_id_fkey"
            columns: ["volume_id"]
            isOneToOne: false
            referencedRelation: "volumes"
            referencedColumns: ["id"]
          },
        ]
      }
      volumes: {
        Row: {
          beneficiary_user_id: string
          bv_amount: number
          bv_type: string
          created_at: string
          expires_at: string | null
          id: string
          leg_side: string
          meta: Json
          origin_user_id: string | null
          posted_at: string
          pv_amount: number
          source_id: string | null
          source_type: string
          status: string
        }
        Insert: {
          beneficiary_user_id: string
          bv_amount?: number
          bv_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          leg_side: string
          meta?: Json
          origin_user_id?: string | null
          posted_at?: string
          pv_amount?: number
          source_id?: string | null
          source_type: string
          status?: string
        }
        Update: {
          beneficiary_user_id?: string
          bv_amount?: number
          bv_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          leg_side?: string
          meta?: Json
          origin_user_id?: string | null
          posted_at?: string
          pv_amount?: number
          source_id?: string | null
          source_type?: string
          status?: string
        }
        Relationships: []
      }
      wallet_adjustment_requests: {
        Row: {
          adjustment_type: string
          amount: number
          applied_at: string | null
          asset_type: string
          created_at: string
          final_approved_at: string | null
          final_approved_by: string | null
          first_approved_at: string | null
          first_approved_by: string | null
          id: string
          reason: string
          reference_id: string | null
          reference_type: string | null
          requested_by: string
          status: string
          wallet_id: string
        }
        Insert: {
          adjustment_type: string
          amount: number
          applied_at?: string | null
          asset_type?: string
          created_at?: string
          final_approved_at?: string | null
          final_approved_by?: string | null
          first_approved_at?: string | null
          first_approved_by?: string | null
          id?: string
          reason: string
          reference_id?: string | null
          reference_type?: string | null
          requested_by: string
          status?: string
          wallet_id: string
        }
        Update: {
          adjustment_type?: string
          amount?: number
          applied_at?: string | null
          asset_type?: string
          created_at?: string
          final_approved_at?: string | null
          final_approved_by?: string | null
          first_approved_at?: string | null
          first_approved_by?: string | null
          id?: string
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          requested_by?: string
          status?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_adjustment_requests_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
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
          internal_balance: number
          pending_balance: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          id?: string
          internal_balance?: number
          pending_balance?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          id?: string
          internal_balance?: number
          pending_balance?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_batch_items: {
        Row: {
          batch_id: string
          id: string
          withdrawal_id: string
        }
        Insert: {
          batch_id: string
          id?: string
          withdrawal_id: string
        }
        Update: {
          batch_id?: string
          id?: string
          withdrawal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_batch_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "withdrawal_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_batches: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          batch_code: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          fee_amount: number
          gross_amount: number
          id: string
          item_count: number
          method: string
          net_amount: number
          status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          batch_code: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          fee_amount?: number
          gross_amount?: number
          id?: string
          item_count?: number
          method: string
          net_amount?: number
          status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          batch_code?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          fee_amount?: number
          gross_amount?: number
          id?: string
          item_count?: number
          method?: string
          net_amount?: number
          status?: string
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
      withdrawal_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          old_status: string | null
          reason: string | null
          withdrawal_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
          reason?: string | null
          withdrawal_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
          reason?: string | null
          withdrawal_id?: string
        }
        Relationships: []
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
      vw_activation_summary: {
        Row: {
          activation_count: number | null
          activation_date: string | null
          total_amount: number | null
        }
        Relationships: []
      }
      vw_bv_summary_daily: {
        Row: {
          bv_date: string | null
          bv_type: string | null
          entry_count: number | null
          total_bv: number | null
        }
        Relationships: []
      }
      vw_package_distribution: {
        Row: {
          member_count: number | null
          tier: Database["public"]["Enums"]["membership_tier"] | null
          total_revenue: number | null
        }
        Relationships: []
      }
      vw_rank_distribution: {
        Row: {
          member_count: number | null
          rank_name: string | null
        }
        Relationships: []
      }
      vw_sales_summary_daily: {
        Row: {
          order_count: number | null
          sale_date: string | null
          total_fees: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_asset_code: { Args: { prefix?: string }; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      get_ancestry_path: {
        Args: { p_user_id: string }
        Returns: {
          depth: number
          full_name: string
          tier: string
          user_id: string
        }[]
      }
      get_subtree_flat: {
        Args: { p_max_depth?: number; p_root_user_id: string }
        Returns: {
          carryforward_left: number
          carryforward_right: number
          child_side: string
          created_at: string
          depth: number
          email: string
          full_name: string
          left_bv: number
          left_leg_id: string
          left_membership_bv: number
          left_product_bv: number
          matched_bv: number
          membership_bv: number
          package_price: number
          parent_user_id: string
          placement_side: string
          rank_name: string
          right_bv: number
          right_leg_id: string
          right_membership_bv: number
          right_product_bv: number
          sponsor_id: string
          tier: string
          user_id: string
        }[]
      }
      has_permission: {
        Args: { _permission_key: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_descendant_of: {
        Args: { p_ancestor_user_id: string; p_target_user_id: string }
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
        | "admin_readonly"
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
        "admin_readonly",
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

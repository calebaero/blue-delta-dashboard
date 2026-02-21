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
      customers: {
        Row: {
          active_alterations: number
          average_order_spent: number
          average_product_spent: number
          billing_address: Json | null
          call_notes: string | null
          channel: string
          climate: string | null
          company: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          favorite_color: string | null
          first_name: string
          has_empty_measurements: boolean
          has_fit_confirmation: boolean
          height: string | null
          how_heard_about_us: string
          id: string
          is_white_glove: boolean
          items_altered: number
          land_line: string | null
          last_contact_date: string | null
          last_contact_method: string | null
          last_name: string
          last_order_date: string | null
          loyalty_tier: string
          mexico_shipping_tax_id: string | null
          nickname: string | null
          normal_pants_type: string | null
          orders_returned: number
          other_addresses: Json | null
          phone: string
          preferred_contact: string
          preferred_purchase: string
          profile_note: string | null
          referral_source: string | null
          reward_points: number
          shipping_address: Json
          social_media_handles: string | null
          spouse_account_id: string | null
          spouse_name: string | null
          total_orders: number
          total_spent: number
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          active_alterations?: number
          average_order_spent?: number
          average_product_spent?: number
          billing_address?: Json | null
          call_notes?: string | null
          channel?: string
          climate?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          favorite_color?: string | null
          first_name: string
          has_empty_measurements?: boolean
          has_fit_confirmation?: boolean
          height?: string | null
          how_heard_about_us: string
          id: string
          is_white_glove?: boolean
          items_altered?: number
          land_line?: string | null
          last_contact_date?: string | null
          last_contact_method?: string | null
          last_name: string
          last_order_date?: string | null
          loyalty_tier?: string
          mexico_shipping_tax_id?: string | null
          nickname?: string | null
          normal_pants_type?: string | null
          orders_returned?: number
          other_addresses?: Json | null
          phone: string
          preferred_contact?: string
          preferred_purchase?: string
          profile_note?: string | null
          referral_source?: string | null
          reward_points?: number
          shipping_address: Json
          social_media_handles?: string | null
          spouse_account_id?: string | null
          spouse_name?: string | null
          total_orders?: number
          total_spent?: number
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          active_alterations?: number
          average_order_spent?: number
          average_product_spent?: number
          billing_address?: Json | null
          call_notes?: string | null
          channel?: string
          climate?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          favorite_color?: string | null
          first_name?: string
          has_empty_measurements?: boolean
          has_fit_confirmation?: boolean
          height?: string | null
          how_heard_about_us?: string
          id?: string
          is_white_glove?: boolean
          items_altered?: number
          land_line?: string | null
          last_contact_date?: string | null
          last_contact_method?: string | null
          last_name?: string
          last_order_date?: string | null
          loyalty_tier?: string
          mexico_shipping_tax_id?: string | null
          nickname?: string | null
          normal_pants_type?: string | null
          orders_returned?: number
          other_addresses?: Json | null
          phone?: string
          preferred_contact?: string
          preferred_purchase?: string
          profile_note?: string | null
          referral_source?: string | null
          reward_points?: number
          shipping_address?: Json
          social_media_handles?: string | null
          spouse_account_id?: string | null
          spouse_name?: string | null
          total_orders?: number
          total_spent?: number
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_spouse_account_id_fkey"
            columns: ["spouse_account_id"]
            isOneToOne: false
            referencedRelation: "customer_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_spouse_account_id_fkey"
            columns: ["spouse_account_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      fabric_rolls: {
        Row: {
          batch_dye_lot: string
          color: string
          composition: string
          cost_per_yard: number
          created_at: string
          current_yards: number
          fabric_family: string
          id: string
          initial_yards: number
          location: string
          material_name: string
          notes: string | null
          received_date: string
          reorder_point_yards: number
          shrinkage_warp_pct: number
          shrinkage_weft_pct: number
          status: string
          supplier: string
          updated_at: string | null
          weight_oz: number
          width_inches: number
        }
        Insert: {
          batch_dye_lot: string
          color: string
          composition: string
          cost_per_yard: number
          created_at?: string
          current_yards: number
          fabric_family: string
          id?: string
          initial_yards: number
          location: string
          material_name: string
          notes?: string | null
          received_date: string
          reorder_point_yards?: number
          shrinkage_warp_pct: number
          shrinkage_weft_pct: number
          status?: string
          supplier: string
          updated_at?: string | null
          weight_oz: number
          width_inches: number
        }
        Update: {
          batch_dye_lot?: string
          color?: string
          composition?: string
          cost_per_yard?: number
          created_at?: string
          current_yards?: number
          fabric_family?: string
          id?: string
          initial_yards?: number
          location?: string
          material_name?: string
          notes?: string | null
          received_date?: string
          reorder_point_yards?: number
          shrinkage_warp_pct?: number
          shrinkage_weft_pct?: number
          status?: string
          supplier?: string
          updated_at?: string | null
          weight_oz?: number
          width_inches?: number
        }
        Relationships: []
      }
      hardware_items: {
        Row: {
          bom_quantity_per_jean: number
          cost_per_unit: number
          created_at: string
          current_stock: number
          id: string
          location: string
          name: string
          reorder_point: number
          status: string
          supplier: string
          type: string
          updated_at: string | null
          variant: string
        }
        Insert: {
          bom_quantity_per_jean?: number
          cost_per_unit: number
          created_at?: string
          current_stock?: number
          id?: string
          location: string
          name: string
          reorder_point: number
          status?: string
          supplier: string
          type: string
          updated_at?: string | null
          variant: string
        }
        Update: {
          bom_quantity_per_jean?: number
          cost_per_unit?: number
          created_at?: string
          current_stock?: number
          id?: string
          location?: string
          name?: string
          reorder_point?: number
          status?: string
          supplier?: string
          type?: string
          updated_at?: string | null
          variant?: string
        }
        Relationships: []
      }
      measurement_profiles: {
        Row: {
          alteration_notes: string | null
          ankle: number | null
          back_pocket_placement: string | null
          belt_measure_method: string | null
          belt_size: string | null
          calf: number | null
          created_at: string
          customer_id: string
          date_taken: string
          fit: string | null
          fit_note: string | null
          fitted_by: string | null
          front_pocket_style: string | null
          heel_height: string | null
          hip: number
          id: string
          inseam: number
          is_active: boolean
          jacket_size: string | null
          knee: number
          last_monogram: string | null
          last_thread_color: string | null
          leg_opening: number
          measurement_note: string | null
          monogram_style: string | null
          outseam: number
          pocket_bag_depth: string | null
          rise_back: number
          rise_front: number
          seat: number
          shoe_size: string | null
          source: string
          split_belt_loops: boolean
          thigh: number
          updated_at: string | null
          waist: number
        }
        Insert: {
          alteration_notes?: string | null
          ankle?: number | null
          back_pocket_placement?: string | null
          belt_measure_method?: string | null
          belt_size?: string | null
          calf?: number | null
          created_at?: string
          customer_id: string
          date_taken: string
          fit?: string | null
          fit_note?: string | null
          fitted_by?: string | null
          front_pocket_style?: string | null
          heel_height?: string | null
          hip: number
          id?: string
          inseam: number
          is_active?: boolean
          jacket_size?: string | null
          knee: number
          last_monogram?: string | null
          last_thread_color?: string | null
          leg_opening: number
          measurement_note?: string | null
          monogram_style?: string | null
          outseam: number
          pocket_bag_depth?: string | null
          rise_back: number
          rise_front: number
          seat: number
          shoe_size?: string | null
          source: string
          split_belt_loops?: boolean
          thigh: number
          updated_at?: string | null
          waist: number
        }
        Update: {
          alteration_notes?: string | null
          ankle?: number | null
          back_pocket_placement?: string | null
          belt_measure_method?: string | null
          belt_size?: string | null
          calf?: number | null
          created_at?: string
          customer_id?: string
          date_taken?: string
          fit?: string | null
          fit_note?: string | null
          fitted_by?: string | null
          front_pocket_style?: string | null
          heel_height?: string | null
          hip?: number
          id?: string
          inseam?: number
          is_active?: boolean
          jacket_size?: string | null
          knee?: number
          last_monogram?: string | null
          last_thread_color?: string | null
          leg_opening?: number
          measurement_note?: string | null
          monogram_style?: string | null
          outseam?: number
          pocket_bag_depth?: string | null
          rise_back?: number
          rise_front?: number
          seat?: number
          shoe_size?: string | null
          source?: string
          split_belt_loops?: boolean
          thigh?: number
          updated_at?: string | null
          waist?: number
        }
        Relationships: [
          {
            foreignKeyName: "measurement_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "measurement_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_metrics: {
        Row: {
          average_lead_time_days: number
          b2b_orders: number
          created_at: string
          dtc_store_orders: number
          dtc_web_orders: number
          fabric_yards_consumed: number
          fabric_yards_received: number
          id: string
          month: string
          new_customers: number
          on_time_delivery_rate: number
          order_count: number
          revenue: number
          trunk_show_orders: number
          updated_at: string | null
        }
        Insert: {
          average_lead_time_days: number
          b2b_orders: number
          created_at?: string
          dtc_store_orders: number
          dtc_web_orders: number
          fabric_yards_consumed: number
          fabric_yards_received: number
          id?: string
          month: string
          new_customers: number
          on_time_delivery_rate: number
          order_count: number
          revenue: number
          trunk_show_orders: number
          updated_at?: string | null
        }
        Update: {
          average_lead_time_days?: number
          b2b_orders?: number
          created_at?: string
          dtc_store_orders?: number
          dtc_web_orders?: number
          fabric_yards_consumed?: number
          fabric_yards_received?: number
          id?: string
          month?: string
          new_customers?: number
          on_time_delivery_rate?: number
          order_count?: number
          revenue?: number
          trunk_show_orders?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          assigned_artisan: string | null
          branding_pack_id: string | null
          channel: string
          completed_date: string | null
          created_at: string
          customer_id: string
          display_id: string
          fabric_roll_id: string | null
          gift_note: string | null
          gift_recipient: string | null
          gift_sender: string | null
          hardware: string
          id: string
          measurement_profile_id: string
          monogram: string | null
          monogram_style: string | null
          order_date: string
          order_note: string | null
          partner_id: string | null
          partner_order_ref: string | null
          partner_rep_id: string | null
          pocket_style: string
          product_id: string
          promised_date: string
          quantity: number
          status: string
          thread_color: string
          total_price: number
          unit_price: number
          updated_at: string | null
          yardage_used: number | null
        }
        Insert: {
          assigned_artisan?: string | null
          branding_pack_id?: string | null
          channel: string
          completed_date?: string | null
          created_at?: string
          customer_id: string
          display_id: string
          fabric_roll_id?: string | null
          gift_note?: string | null
          gift_recipient?: string | null
          gift_sender?: string | null
          hardware?: string
          id: string
          measurement_profile_id: string
          monogram?: string | null
          monogram_style?: string | null
          order_date?: string
          order_note?: string | null
          partner_id?: string | null
          partner_order_ref?: string | null
          partner_rep_id?: string | null
          pocket_style?: string
          product_id: string
          promised_date: string
          quantity?: number
          status?: string
          thread_color?: string
          total_price: number
          unit_price: number
          updated_at?: string | null
          yardage_used?: number | null
        }
        Update: {
          assigned_artisan?: string | null
          branding_pack_id?: string | null
          channel?: string
          completed_date?: string | null
          created_at?: string
          customer_id?: string
          display_id?: string
          fabric_roll_id?: string | null
          gift_note?: string | null
          gift_recipient?: string | null
          gift_sender?: string | null
          hardware?: string
          id?: string
          measurement_profile_id?: string
          monogram?: string | null
          monogram_style?: string | null
          order_date?: string
          order_note?: string | null
          partner_id?: string | null
          partner_order_ref?: string | null
          partner_rep_id?: string | null
          pocket_style?: string
          product_id?: string
          promised_date?: string
          quantity?: number
          status?: string
          thread_color?: string
          total_price?: number
          unit_price?: number
          updated_at?: string | null
          yardage_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_fabric_roll_id_fkey"
            columns: ["fabric_roll_id"]
            isOneToOne: false
            referencedRelation: "fabric_rolls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_measurement_profile_id_fkey"
            columns: ["measurement_profile_id"]
            isOneToOne: false
            referencedRelation: "measurement_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_partner_rep_id_fkey"
            columns: ["partner_rep_id"]
            isOneToOne: false
            referencedRelation: "partner_reps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_reps: {
        Row: {
          average_return_rate: number
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          partner_id: string
          phone: string
          territory: string
          total_orders: number
          total_revenue: number
          updated_at: string | null
        }
        Insert: {
          average_return_rate?: number
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          partner_id: string
          phone: string
          territory: string
          total_orders?: number
          total_revenue?: number
          updated_at?: string | null
        }
        Update: {
          average_return_rate?: number
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          partner_id?: string
          phone?: string
          territory?: string
          total_orders?: number
          total_revenue?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_reps_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          account_since: string
          active_orders: number
          address: Json
          contact_email: string
          contact_phone: string
          created_at: string
          id: string
          name: string
          notes: string | null
          payment_terms: string
          total_orders: number
          total_revenue: number
          type: string
          updated_at: string | null
        }
        Insert: {
          account_since: string
          active_orders?: number
          address: Json
          contact_email: string
          contact_phone: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string
          total_orders?: number
          total_revenue?: number
          type: string
          updated_at?: string | null
        }
        Update: {
          account_since?: string
          active_orders?: number
          address?: Json
          contact_email?: string
          contact_phone?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string
          total_orders?: number
          total_revenue?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          artisan: string | null
          created_at: string
          entered_at: string
          exited_at: string | null
          id: string
          notes: string | null
          order_id: string
          stage: string
        }
        Insert: {
          artisan?: string | null
          created_at?: string
          entered_at: string
          exited_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          stage: string
        }
        Update: {
          artisan?: string | null
          created_at?: string
          entered_at?: string
          exited_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_detail_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string
          created_at: string
          customization_options: Json | null
          description: string
          fabric_family: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          category: string
          created_at?: string
          customization_options?: Json | null
          description: string
          fabric_family?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          customization_options?: Json | null
          description?: string
          fabric_family?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shipment_stages: {
        Row: {
          created_at: string
          id: string
          location: string
          shipment_id: string
          status: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          shipment_id: string
          status: string
          timestamp: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          shipment_id?: string
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_stages_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery: string | null
          carrier: string
          cost: number
          created_at: string
          customer_id: string
          estimated_delivery: string
          id: string
          order_id: string
          shipped_date: string
          shipping_address: Json
          status: string
          tracking_number: string
          updated_at: string | null
          weight: string
        }
        Insert: {
          actual_delivery?: string | null
          carrier: string
          cost: number
          created_at?: string
          customer_id: string
          estimated_delivery: string
          id: string
          order_id: string
          shipped_date: string
          shipping_address: Json
          status?: string
          tracking_number: string
          updated_at?: string | null
          weight: string
        }
        Update: {
          actual_delivery?: string | null
          carrier?: string
          cost?: number
          created_at?: string
          customer_id?: string
          estimated_delivery?: string
          id?: string
          order_id?: string
          shipped_date?: string
          shipping_address?: Json
          status?: string
          tracking_number?: string
          updated_at?: string | null
          weight?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_detail_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      customer_summary: {
        Row: {
          channel: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          is_white_glove: boolean | null
          last_name: string | null
          last_order_date: string | null
          loyalty_tier: string | null
          phone: string | null
          reward_points: number | null
          state: string | null
          total_orders: number | null
          total_spent: number | null
        }
        Insert: {
          channel?: string | null
          city?: never
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          is_white_glove?: boolean | null
          last_name?: string | null
          last_order_date?: string | null
          loyalty_tier?: string | null
          phone?: string | null
          reward_points?: number | null
          state?: never
          total_orders?: number | null
          total_spent?: number | null
        }
        Update: {
          channel?: string | null
          city?: never
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          is_white_glove?: boolean | null
          last_name?: string | null
          last_order_date?: string | null
          loyalty_tier?: string | null
          phone?: string | null
          reward_points?: number | null
          state?: never
          total_orders?: number | null
          total_spent?: number | null
        }
        Relationships: []
      }
      inventory_alerts: {
        Row: {
          color: string | null
          id: string | null
          item_type: string | null
          name: string | null
          remaining: string | null
          reorder_point: string | null
          severity: string | null
          status: string | null
        }
        Relationships: []
      }
      order_detail_view: {
        Row: {
          assigned_artisan: string | null
          branding_pack_id: string | null
          channel: string | null
          completed_date: string | null
          created_at: string | null
          customer_email: string | null
          customer_first_name: string | null
          customer_id: string | null
          customer_last_name: string | null
          display_id: string | null
          fabric_color: string | null
          fabric_name: string | null
          fabric_roll_id: string | null
          gift_note: string | null
          gift_recipient: string | null
          gift_sender: string | null
          hardware: string | null
          id: string | null
          measurement_profile_id: string | null
          monogram: string | null
          monogram_style: string | null
          order_date: string | null
          order_note: string | null
          partner_id: string | null
          partner_name: string | null
          partner_order_ref: string | null
          partner_rep_id: string | null
          partner_rep_name: string | null
          pocket_style: string | null
          product_category: string | null
          product_id: string | null
          product_name: string | null
          promised_date: string | null
          quantity: number | null
          status: string | null
          thread_color: string | null
          total_price: number | null
          unit_price: number | null
          updated_at: string | null
          yardage_used: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_fabric_roll_id_fkey"
            columns: ["fabric_roll_id"]
            isOneToOne: false
            referencedRelation: "fabric_rolls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_measurement_profile_id_fkey"
            columns: ["measurement_profile_id"]
            isOneToOne: false
            referencedRelation: "measurement_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_partner_rep_id_fkey"
            columns: ["partner_rep_id"]
            isOneToOne: false
            referencedRelation: "partner_reps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_pipeline_summary: {
        Row: {
          avg_days_in_stage: number | null
          order_count: number | null
          stage: string | null
        }
        Relationships: []
      }
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

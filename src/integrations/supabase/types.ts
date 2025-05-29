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
      mentorship_applications: {
        Row: {
          additional_info: string | null
          budget_range: string | null
          business_experience: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          income_goal: string | null
          investment_amount: string | null
          phone_number: string | null
          session_id: string | null
          why_mentorship: string | null
        }
        Insert: {
          additional_info?: string | null
          budget_range?: string | null
          business_experience?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          income_goal?: string | null
          investment_amount?: string | null
          phone_number?: string | null
          session_id?: string | null
          why_mentorship?: string | null
        }
        Update: {
          additional_info?: string | null
          budget_range?: string | null
          business_experience?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          income_goal?: string | null
          investment_amount?: string | null
          phone_number?: string | null
          session_id?: string | null
          why_mentorship?: string | null
        }
        Relationships: []
      }
      product_uploads: {
        Row: {
          benefits: Json | null
          created_at: string
          description: string | null
          detailed_description: string | null
          features: Json | null
          gif_urls: Json | null
          id: string
          images: Json | null
          niche: string
          price: number | null
          product_type: string | null
          return_policy: string | null
          session_id: string | null
          shipping_info: string | null
          shopify_product_id: string | null
          tags: string | null
          target_audience: string | null
          title: string
          variants: Json | null
          vendor: string | null
          video_url: string | null
        }
        Insert: {
          benefits?: Json | null
          created_at?: string
          description?: string | null
          detailed_description?: string | null
          features?: Json | null
          gif_urls?: Json | null
          id?: string
          images?: Json | null
          niche: string
          price?: number | null
          product_type?: string | null
          return_policy?: string | null
          session_id?: string | null
          shipping_info?: string | null
          shopify_product_id?: string | null
          tags?: string | null
          target_audience?: string | null
          title: string
          variants?: Json | null
          vendor?: string | null
          video_url?: string | null
        }
        Update: {
          benefits?: Json | null
          created_at?: string
          description?: string | null
          detailed_description?: string | null
          features?: Json | null
          gif_urls?: Json | null
          id?: string
          images?: Json | null
          niche?: string
          price?: number | null
          product_type?: string | null
          return_policy?: string | null
          session_id?: string | null
          shipping_info?: string | null
          shopify_product_id?: string | null
          tags?: string | null
          target_audience?: string | null
          title?: string
          variants?: Json | null
          vendor?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      store_builder_sessions: {
        Row: {
          access_token: string | null
          additional_info: string | null
          business_type: string | null
          completed_steps: number | null
          created_at: string
          created_via_affiliate: boolean | null
          id: string
          mentorship_requested: boolean | null
          niche: string | null
          plan_activated: boolean | null
          products_added: boolean | null
          session_id: string
          shopify_url: string | null
          store_style: string | null
          target_audience: string | null
          theme_color: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          additional_info?: string | null
          business_type?: string | null
          completed_steps?: number | null
          created_at?: string
          created_via_affiliate?: boolean | null
          id?: string
          mentorship_requested?: boolean | null
          niche?: string | null
          plan_activated?: boolean | null
          products_added?: boolean | null
          session_id: string
          shopify_url?: string | null
          store_style?: string | null
          target_audience?: string | null
          theme_color?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          additional_info?: string | null
          business_type?: string | null
          completed_steps?: number | null
          created_at?: string
          created_via_affiliate?: boolean | null
          id?: string
          mentorship_requested?: boolean | null
          niche?: string | null
          plan_activated?: boolean | null
          products_added?: boolean | null
          session_id?: string
          shopify_url?: string | null
          store_style?: string | null
          target_audience?: string | null
          theme_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      upload_sessions: {
        Row: {
          created_at: string
          failed_uploads: number
          id: string
          niche: string
          results: Json | null
          session_id: string
          successful_uploads: number
          total_products: number
        }
        Insert: {
          created_at?: string
          failed_uploads?: number
          id?: string
          niche: string
          results?: Json | null
          session_id: string
          successful_uploads?: number
          total_products?: number
        }
        Update: {
          created_at?: string
          failed_uploads?: number
          id?: string
          niche?: string
          results?: Json | null
          session_id?: string
          successful_uploads?: number
          total_products?: number
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
    Enums: {},
  },
} as const

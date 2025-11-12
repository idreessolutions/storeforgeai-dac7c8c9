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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      aliexpress_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string | null
          scope: string | null
          session_id: string
          token_type: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token?: string | null
          scope?: string | null
          session_id: string
          token_type?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string | null
          scope?: string | null
          session_id?: string
          token_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      automation_results: {
        Row: {
          created_at: string
          execution_date: string
          id: string
          results: Json | null
          session_id: string
          stores_processed: number
          stores_successful: number
          total_products_added: number
        }
        Insert: {
          created_at?: string
          execution_date: string
          id?: string
          results?: Json | null
          session_id: string
          stores_processed?: number
          stores_successful?: number
          total_products_added?: number
        }
        Update: {
          created_at?: string
          execution_date?: string
          id?: string
          results?: Json | null
          session_id?: string
          stores_processed?: number
          stores_successful?: number
          total_products_added?: number
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          store_url: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          store_url?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          store_url?: string | null
        }
        Relationships: []
      }
      curated_products: {
        Row: {
          bucket_name: string
          compare_at_price: number | null
          created_at: string
          id: string
          is_active: boolean | null
          niche: string
          price: number
          product_folder: string
          product_type: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          niche: string
          price: number
          product_folder: string
          product_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          niche?: string
          price?: number
          product_folder?: string
          product_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
          why_mentorship?: string | null
        }
        Relationships: []
      }
      product_data: {
        Row: {
          category: string | null
          compare_at_price: number | null
          created_at: string
          currency: string
          description_md: string
          id: string
          is_active: boolean
          main_images: string[] | null
          niche: string
          options: Json | null
          price: number
          product_folder: string
          tags: string[] | null
          title: string
          variants: Json | null
        }
        Insert: {
          category?: string | null
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description_md: string
          id?: string
          is_active?: boolean
          main_images?: string[] | null
          niche: string
          options?: Json | null
          price?: number
          product_folder: string
          tags?: string[] | null
          title: string
          variants?: Json | null
        }
        Update: {
          category?: string | null
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description_md?: string
          id?: string
          is_active?: boolean
          main_images?: string[] | null
          niche?: string
          options?: Json | null
          price?: number
          product_folder?: string
          tags?: string[] | null
          title?: string
          variants?: Json | null
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      get_store_access_token: {
        Args: { p_session_id: string }
        Returns: string
      }
      has_store_access_token: {
        Args: { p_session_id: string }
        Returns: boolean
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

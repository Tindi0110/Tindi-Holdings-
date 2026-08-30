export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          ip_address: string | null;
          new_data: Json | null;
          old_data: Json | null;
          performed_by: string | null;
          performed_by_name: string | null;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip_address?: string | null;
          new_data?: Json | null;
          old_data?: Json | null;
          performed_by?: string | null;
          performed_by_name?: string | null;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          ip_address?: string | null;
          new_data?: Json | null;
          old_data?: Json | null;
          performed_by?: string | null;
          performed_by_name?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          description: string | null;
          display_order: number;
          founded_date: string | null;
          icon_name: string | null;
          id: string;
          industry: string | null;
          is_public: boolean;
          is_subsidiary: boolean;
          launch_date: string | null;
          logo_url: string | null;
          name: string;
          parent_id: string | null;
          slug: string;
          status: Database["public"]["Enums"]["entity_status"];
          status_note: string | null;
          tagline: string | null;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          founded_date?: string | null;
          icon_name?: string | null;
          id?: string;
          industry?: string | null;
          is_public?: boolean;
          is_subsidiary?: boolean;
          launch_date?: string | null;
          logo_url?: string | null;
          name: string;
          parent_id?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["entity_status"];
          status_note?: string | null;
          tagline?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          founded_date?: string | null;
          icon_name?: string | null;
          id?: string;
          industry?: string | null;
          is_public?: boolean;
          is_subsidiary?: boolean;
          launch_date?: string | null;
          logo_url?: string | null;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["entity_status"];
          status_note?: string | null;
          tagline?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      corporate_metrics: {
        Row: {
          auto_compute_sql: string | null;
          category: string;
          classification: Database["public"]["Enums"]["metric_classification"];
          company_id: string | null;
          created_at: string;
          current_display: string | null;
          current_value: number | null;
          description: string | null;
          display_order: number;
          id: string;
          is_auto_computed: boolean;
          is_featured: boolean;
          last_verified_at: string | null;
          last_verified_by: string | null;
          name: string;
          prefix: string | null;
          slug: string;
          source: string | null;
          suffix: string | null;
          target_date: string | null;
          target_display: string | null;
          target_value: number | null;
          unit: string | null;
          updated_at: string;
          visibility: Database["public"]["Enums"]["metric_visibility"];
        };
        Insert: {
          auto_compute_sql?: string | null;
          category?: string;
          classification?: Database["public"]["Enums"]["metric_classification"];
          company_id?: string | null;
          created_at?: string;
          current_display?: string | null;
          current_value?: number | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_auto_computed?: boolean;
          is_featured?: boolean;
          last_verified_at?: string | null;
          last_verified_by?: string | null;
          name: string;
          prefix?: string | null;
          slug: string;
          source?: string | null;
          suffix?: string | null;
          target_date?: string | null;
          target_display?: string | null;
          target_value?: number | null;
          unit?: string | null;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["metric_visibility"];
        };
        Update: {
          auto_compute_sql?: string | null;
          category?: string;
          classification?: Database["public"]["Enums"]["metric_classification"];
          company_id?: string | null;
          created_at?: string;
          current_display?: string | null;
          current_value?: number | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_auto_computed?: boolean;
          is_featured?: boolean;
          last_verified_at?: string | null;
          last_verified_by?: string | null;
          name?: string;
          prefix?: string | null;
          slug?: string;
          source?: string | null;
          suffix?: string | null;
          target_date?: string | null;
          target_display?: string | null;
          target_value?: number | null;
          unit?: string | null;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["metric_visibility"];
        };
        Relationships: [];
      };
      metric_history: {
        Row: {
          change_note: string | null;
          changed_by: string | null;
          changed_by_name: string | null;
          created_at: string;
          id: string;
          metric_id: string;
          new_display: string | null;
          new_value: number | null;
          old_display: string | null;
          old_value: number | null;
        };
        Insert: {
          change_note?: string | null;
          changed_by?: string | null;
          changed_by_name?: string | null;
          created_at?: string;
          id?: string;
          metric_id: string;
          new_display?: string | null;
          new_value?: number | null;
          old_display?: string | null;
          old_value?: number | null;
        };
        Update: {
          change_note?: string | null;
          changed_by?: string | null;
          changed_by_name?: string | null;
          created_at?: string;
          id?: string;
          metric_id?: string;
          new_display?: string | null;
          new_value?: number | null;
          old_display?: string | null;
          old_value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "metric_history_metric_id_fkey";
            columns: ["metric_id"];
            isOneToOne: false;
            referencedRelation: "corporate_metrics";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          description: string | null;
          id: string;
          is_public: boolean;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: string | null;
          value_json: Json | null;
        };
        Insert: {
          description?: string | null;
          id?: string;
          is_public?: boolean;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: string | null;
          value_json?: Json | null;
        };
        Update: {
          description?: string | null;
          id?: string;
          is_public?: boolean;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: string | null;
          value_json?: Json | null;
        };
        Relationships: [];
      };
      branches: {
        Row: {
          address: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          phone: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          phone?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          quantity: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          quantity?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          quantity?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          icon: string | null;
          id: string;
          image_url: string | null;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          branch_id: string | null;
          created_at: string;
          id: string;
          order_number: string;
          payment_method: string | null;
          payment_phone: string | null;
          payment_reference: string | null;
          payment_status: string | null;
          shipping: number;
          shipping_address: string | null;
          shipping_city: string | null;
          shipping_name: string | null;
          shipping_phone: string | null;
          shipping_zip: string | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          tax: number;
          total: number;
          user_id: string;
        };
        Insert: {
          branch_id?: string | null;
          created_at?: string;
          id?: string;
          order_number?: string;
          payment_method?: string | null;
          payment_phone?: string | null;
          payment_reference?: string | null;
          payment_status?: string | null;
          shipping?: number;
          shipping_address?: string | null;
          shipping_city?: string | null;
          shipping_name?: string | null;
          shipping_phone?: string | null;
          shipping_zip?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          tax?: number;
          total?: number;
          user_id: string;
        };
        Update: {
          branch_id?: string | null;
          created_at?: string;
          id?: string;
          order_number?: string;
          payment_method?: string | null;
          payment_phone?: string | null;
          payment_reference?: string | null;
          payment_status?: string | null;
          shipping?: number;
          shipping_address?: string | null;
          shipping_city?: string | null;
          shipping_name?: string | null;
          shipping_phone?: string | null;
          shipping_zip?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          tax?: number;
          total?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          branch_id: string | null;
          category_id: string | null;
          compare_at_price: number | null;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          name: string;
          price: number;
          rating: number | null;
          reviews_count: number | null;
          slug: string;
          stock: number;
          updated_at: string;
        };
        Insert: {
          branch_id?: string | null;
          category_id?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          name: string;
          price: number;
          rating?: number | null;
          reviews_count?: number | null;
          slug: string;
          stock?: number;
          updated_at?: string;
        };
        Update: {
          branch_id?: string | null;
          category_id?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          name?: string;
          price?: number;
          rating?: number | null;
          reviews_count?: number | null;
          slug?: string;
          stock?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          branch_id: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          branch_id?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          branch_id?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "manager" | "customer";
      entity_status:
        | "PRE_LAUNCH"
        | "ACTIVE"
        | "IN_DEVELOPMENT"
        | "PILOT"
        | "PLANNED"
        | "FUTURE"
        | "PAUSED"
        | "CLOSED";
      metric_classification: "VERIFIED" | "PROJECTED" | "TARGET" | "ESTIMATED" | "INTERNAL";
      metric_visibility: "PUBLIC" | "ADMIN_ONLY" | "HIDDEN";
      order_status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "customer"],
      entity_status: [
        "PRE_LAUNCH",
        "ACTIVE",
        "IN_DEVELOPMENT",
        "PILOT",
        "PLANNED",
        "FUTURE",
        "PAUSED",
        "CLOSED",
      ],
      metric_classification: ["VERIFIED", "PROJECTED", "TARGET", "ESTIMATED", "INTERNAL"],
      metric_visibility: ["PUBLIC", "ADMIN_ONLY", "HIDDEN"],
      order_status: ["pending", "processing", "shipped", "delivered", "cancelled"],
    },
  },
} as const;

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
      clients: {
        Row: {
          address: string | null
          contactname: string | null
          email: string
          id: number
          name: string
          notes: string | null
          phone: string
          startdate: string
          status: string
          taxid: string | null
        }
        Insert: {
          address?: string | null
          contactname?: string | null
          email: string
          id?: number
          name: string
          notes?: string | null
          phone: string
          startdate: string
          status: string
          taxid?: string | null
        }
        Update: {
          address?: string | null
          contactname?: string | null
          email?: string
          id?: number
          name?: string
          notes?: string | null
          phone?: string
          startdate?: string
          status?: string
          taxid?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          clientid: number | null
          id: number
          name: string
          projectid: number | null
          type: string
          uploaddate: string
          url: string
        }
        Insert: {
          clientid?: number | null
          id?: number
          name: string
          projectid?: number | null
          type: string
          uploaddate: string
          url: string
        }
        Update: {
          clientid?: number | null
          id?: number
          name?: string
          projectid?: number | null
          type?: string
          uploaddate?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_clientid_fkey"
            columns: ["clientid"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_documents_projects"
            columns: ["projectid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          currency: string
          date: string
          description: string
          frequency: string | null
          id: number
          is_recurring: boolean | null
          next_due_date: string | null
          notes: string | null
          paymentmethod: string
          receipt: string | null
        }
        Insert: {
          amount: number
          category: string
          currency: string
          date: string
          description: string
          frequency?: string | null
          id?: number
          is_recurring?: boolean | null
          next_due_date?: string | null
          notes?: string | null
          paymentmethod: string
          receipt?: string | null
        }
        Update: {
          amount?: number
          category?: string
          currency?: string
          date?: string
          description?: string
          frequency?: string | null
          id?: number
          is_recurring?: boolean | null
          next_due_date?: string | null
          notes?: string | null
          paymentmethod?: string
          receipt?: string | null
        }
        Relationships: []
      }
      gastos_causados: {
        Row: {
          amount: number
          category: string
          currency: string
          date: string
          description: string
          id: number
          notes: string | null
          paid_date: string | null
          paymentmethod: string
          receipt: string | null
          source_id: number
          source_type: string
          status: string | null
        }
        Insert: {
          amount: number
          category: string
          currency: string
          date: string
          description: string
          id?: number
          notes?: string | null
          paid_date?: string | null
          paymentmethod: string
          receipt?: string | null
          source_id: number
          source_type: string
          status?: string | null
        }
        Update: {
          amount?: number
          category?: string
          currency?: string
          date?: string
          description?: string
          id?: number
          notes?: string | null
          paid_date?: string | null
          paymentmethod?: string
          receipt?: string | null
          source_id?: number
          source_type?: string
          status?: string | null
        }
        Relationships: []
      }
      gastos_recurrentes: {
        Row: {
          amount: number
          category: string
          currency: string
          description: string
          end_date: string | null
          frequency: string
          id: number
          is_active: boolean
          is_auto_debit: boolean
          notes: string | null
          paymentmethod: string
          receipt: string | null
          start_date: string
        }
        Insert: {
          amount: number
          category: string
          currency: string
          description: string
          end_date?: string | null
          frequency: string
          id?: number
          is_active?: boolean
          is_auto_debit?: boolean
          notes?: string | null
          paymentmethod: string
          receipt?: string | null
          start_date: string
        }
        Update: {
          amount?: number
          category?: string
          currency?: string
          description?: string
          end_date?: string | null
          frequency?: string
          id?: number
          is_active?: boolean
          is_auto_debit?: boolean
          notes?: string | null
          paymentmethod?: string
          receipt?: string | null
          start_date?: string
        }
        Relationships: []
      }
      gastos_variables: {
        Row: {
          amount: number
          category: string
          currency: string
          date: string
          description: string
          id: number
          notes: string | null
          paymentmethod: string
          receipt: string | null
        }
        Insert: {
          amount: number
          category: string
          currency: string
          date: string
          description: string
          id?: number
          notes?: string | null
          paymentmethod: string
          receipt?: string | null
        }
        Update: {
          amount?: number
          category?: string
          currency?: string
          date?: string
          description?: string
          id?: number
          notes?: string | null
          paymentmethod?: string
          receipt?: string | null
        }
        Relationships: []
      }
      incomes: {
        Row: {
          amount: number
          client: string | null
          currency: string
          date: string
          description: string
          id: number
          notes: string | null
          paymentmethod: string
          receipt: string | null
          type: string
        }
        Insert: {
          amount: number
          client?: string | null
          currency: string
          date: string
          description: string
          id?: number
          notes?: string | null
          paymentmethod: string
          receipt?: string | null
          type: string
        }
        Update: {
          amount?: number
          client?: string | null
          currency?: string
          date?: string
          description?: string
          id?: number
          notes?: string | null
          paymentmethod?: string
          receipt?: string | null
          type?: string
        }
        Relationships: []
      }
      payment_plans: {
        Row: {
          created_at: string | null
          id: number
          implementation_fee_currency: string | null
          implementation_fee_installments: number | null
          implementation_fee_total: number | null
          project_id: number
          recurring_fee_amount: number | null
          recurring_fee_currency: string | null
          recurring_fee_day_of_charge: number | null
          recurring_fee_discount_percentage: number | null
          recurring_fee_discount_periods: number | null
          recurring_fee_frequency: string | null
          recurring_fee_grace_periods: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          implementation_fee_currency?: string | null
          implementation_fee_installments?: number | null
          implementation_fee_total?: number | null
          project_id: number
          recurring_fee_amount?: number | null
          recurring_fee_currency?: string | null
          recurring_fee_day_of_charge?: number | null
          recurring_fee_discount_percentage?: number | null
          recurring_fee_discount_periods?: number | null
          recurring_fee_frequency?: string | null
          recurring_fee_grace_periods?: number | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: number
          implementation_fee_currency?: string | null
          implementation_fee_installments?: number | null
          implementation_fee_total?: number | null
          project_id?: number
          recurring_fee_amount?: number | null
          recurring_fee_currency?: string | null
          recurring_fee_day_of_charge?: number | null
          recurring_fee_discount_percentage?: number | null
          recurring_fee_discount_periods?: number | null
          recurring_fee_frequency?: string | null
          recurring_fee_grace_periods?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          clientid: number
          currency: string
          date: string
          document_url: string | null
          id: number
          installmentnumber: number | null
          invoicenumber: string | null
          invoiceurl: string | null
          notes: string | null
          paiddate: string | null
          projectid: number
          status: string
          type: string
        }
        Insert: {
          amount: number
          clientid: number
          currency: string
          date: string
          document_url?: string | null
          id?: number
          installmentnumber?: number | null
          invoicenumber?: string | null
          invoiceurl?: string | null
          notes?: string | null
          paiddate?: string | null
          projectid: number
          status: string
          type: string
        }
        Update: {
          amount?: number
          clientid?: number
          currency?: string
          date?: string
          document_url?: string | null
          id?: number
          installmentnumber?: number | null
          invoicenumber?: string | null
          invoiceurl?: string | null
          notes?: string | null
          paiddate?: string | null
          projectid?: number
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_clientid_fkey"
            columns: ["clientid"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_projectid_fkey"
            columns: ["projectid"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          clientid: number
          description: string
          enddate: string | null
          id: number
          name: string
          notes: string | null
          startdate: string
          status: string
        }
        Insert: {
          clientid: number
          description: string
          enddate?: string | null
          id?: number
          name: string
          notes?: string | null
          startdate: string
          status: string
        }
        Update: {
          clientid?: number
          description?: string
          enddate?: string | null
          id?: number
          name?: string
          notes?: string | null
          startdate?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_clientid_fkey"
            columns: ["clientid"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_cash_flow_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          year: number
          ingresos: number
          gastos: number
          balance: number
          category: string
          category_amount: number
          client: string
          client_amount: number
        }[]
      }
      get_expense_by_category: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          total: number
        }[]
      }
      get_income_analytics: {
        Args: { start_date: string; end_date: string }
        Returns: {
          total_month: number
          avg_month: number
          client_income: number
          client_percentage: number
          monthly_data: Json
        }[]
      }
      get_income_by_client: {
        Args: Record<PropertyKey, never>
        Returns: {
          client: string
          total: number
        }[]
      }
      get_monthly_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          year: number
          total_income: number
          total_expense: number
          net_income: number
        }[]
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

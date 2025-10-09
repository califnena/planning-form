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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          bank_name: string
          created_at: string
          id: string
          plan_id: string
          pod: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          bank_name: string
          created_at?: string
          id?: string
          plan_id: string
          pod?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          bank_name?: string
          created_at?: string
          id?: string
          plan_id?: string
          pod?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          partnership_info: string | null
          plan_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          partnership_info?: string | null
          plan_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          partnership_info?: string | null
          plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts_notify: {
        Row: {
          auto_injected: boolean | null
          contact: string | null
          created_at: string
          id: string
          name: string
          plan_id: string
          relationship: string | null
          updated_at: string
        }
        Insert: {
          auto_injected?: boolean | null
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          plan_id: string
          relationship?: string | null
          updated_at?: string
        }
        Update: {
          auto_injected?: boolean | null
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          plan_id?: string
          relationship?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_notify_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_notify_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts_professional: {
        Row: {
          company: string | null
          contact: string | null
          created_at: string
          id: string
          name: string | null
          plan_id: string
          role: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          name?: string | null
          plan_id: string
          role: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          name?: string | null
          plan_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_professional_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_professional_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          account_number: string | null
          created_at: string
          creditor: string
          debt_type: string | null
          id: string
          plan_id: string
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          created_at?: string
          creditor: string
          debt_type?: string | null
          id?: string
          plan_id: string
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          created_at?: string
          creditor?: string
          debt_type?: string | null
          id?: string
          plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      funeral_funding: {
        Row: {
          account: string | null
          created_at: string
          id: string
          plan_id: string
          source: string
          updated_at: string
        }
        Insert: {
          account?: string | null
          created_at?: string
          id?: string
          plan_id: string
          source: string
          updated_at?: string
        }
        Update: {
          account?: string | null
          created_at?: string
          id?: string
          plan_id?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funeral_funding_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funeral_funding_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_policies: {
        Row: {
          company: string
          contact_person: string | null
          created_at: string
          id: string
          notes: string | null
          phone_or_url: string | null
          plan_id: string
          policy_number: string | null
          type: Database["public"]["Enums"]["insurance_type"]
          updated_at: string
        }
        Insert: {
          company: string
          contact_person?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phone_or_url?: string | null
          plan_id: string
          policy_number?: string | null
          type?: Database["public"]["Enums"]["insurance_type"]
          updated_at?: string
        }
        Update: {
          company?: string
          contact_person?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          phone_or_url?: string | null
          plan_id?: string
          policy_number?: string | null
          type?: Database["public"]["Enums"]["insurance_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_policies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_policies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          account_number: string | null
          account_type: string | null
          brokerage: string
          created_at: string
          id: string
          plan_id: string
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          brokerage: string
          created_at?: string
          id?: string
          plan_id: string
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          brokerage?: string
          created_at?: string
          id?: string
          plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          audience: string
          body: string | null
          created_at: string
          id: string
          plan_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          audience: string
          body?: string | null
          created_at?: string
          id?: string
          plan_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          plan_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      orgs: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      personal_profiles: {
        Row: {
          accomplishments: string | null
          address: string | null
          birthplace: string | null
          child_names: string[] | null
          citizenship: string | null
          created_at: string
          dob: string | null
          ex_spouse_name: string | null
          father_name: string | null
          full_name: string | null
          hobbies: string | null
          id: string
          maiden_name: string | null
          marital_status: string | null
          mother_name: string | null
          partner_name: string | null
          plan_id: string
          religion: string | null
          remembered: string | null
          ssn: string | null
          updated_at: string
          vet_branch: string | null
          vet_discharge: string | null
          vet_entry: string | null
          vet_rank: string | null
          vet_serial: string | null
          vet_war: string | null
        }
        Insert: {
          accomplishments?: string | null
          address?: string | null
          birthplace?: string | null
          child_names?: string[] | null
          citizenship?: string | null
          created_at?: string
          dob?: string | null
          ex_spouse_name?: string | null
          father_name?: string | null
          full_name?: string | null
          hobbies?: string | null
          id?: string
          maiden_name?: string | null
          marital_status?: string | null
          mother_name?: string | null
          partner_name?: string | null
          plan_id: string
          religion?: string | null
          remembered?: string | null
          ssn?: string | null
          updated_at?: string
          vet_branch?: string | null
          vet_discharge?: string | null
          vet_entry?: string | null
          vet_rank?: string | null
          vet_serial?: string | null
          vet_war?: string | null
        }
        Update: {
          accomplishments?: string | null
          address?: string | null
          birthplace?: string | null
          child_names?: string[] | null
          citizenship?: string | null
          created_at?: string
          dob?: string | null
          ex_spouse_name?: string | null
          father_name?: string | null
          full_name?: string | null
          hobbies?: string | null
          id?: string
          maiden_name?: string | null
          marital_status?: string | null
          mother_name?: string | null
          partner_name?: string | null
          plan_id?: string
          religion?: string | null
          remembered?: string | null
          ssn?: string | null
          updated_at?: string
          vet_branch?: string | null
          vet_discharge?: string | null
          vet_entry?: string | null
          vet_rank?: string | null
          vet_serial?: string | null
          vet_war?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: true
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: true
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          breed: string | null
          care_instructions: string | null
          caregiver: string | null
          created_at: string
          id: string
          name: string
          plan_id: string
          updated_at: string
          vet_contact: string | null
        }
        Insert: {
          breed?: string | null
          care_instructions?: string | null
          caregiver?: string | null
          created_at?: string
          id?: string
          name: string
          plan_id: string
          updated_at?: string
          vet_contact?: string | null
        }
        Update: {
          breed?: string | null
          care_instructions?: string | null
          caregiver?: string | null
          created_at?: string
          id?: string
          name?: string
          plan_id?: string
          updated_at?: string
          vet_contact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pets_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      phones: {
        Row: {
          access_info: string | null
          carrier: string | null
          created_at: string
          id: string
          phone_number: string
          plan_id: string
          updated_at: string
        }
        Insert: {
          access_info?: string | null
          carrier?: string | null
          created_at?: string
          id?: string
          phone_number: string
          plan_id: string
          updated_at?: string
        }
        Update: {
          access_info?: string | null
          carrier?: string | null
          created_at?: string
          id?: string
          phone_number?: string
          plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_revisions: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          revision_date: string
          signature_png: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          revision_date: string
          signature_png?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          revision_date?: string
          signature_png?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_revisions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_revisions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          about_me_notes: string | null
          checklist_notes: string | null
          created_at: string
          digital_notes: string | null
          financial_notes: string | null
          funeral_wishes_notes: string | null
          id: string
          instructions_notes: string | null
          insurance_notes: string | null
          last_signed_at: string | null
          last_updated_date: string | null
          legal_notes: string | null
          messages_notes: string | null
          org_id: string
          owner_user_id: string
          percent_complete: number | null
          pets_notes: string | null
          prepared_for: string | null
          preparer_name: string | null
          property_notes: string | null
          title: string | null
          to_loved_ones_message: string | null
          updated_at: string
        }
        Insert: {
          about_me_notes?: string | null
          checklist_notes?: string | null
          created_at?: string
          digital_notes?: string | null
          financial_notes?: string | null
          funeral_wishes_notes?: string | null
          id?: string
          instructions_notes?: string | null
          insurance_notes?: string | null
          last_signed_at?: string | null
          last_updated_date?: string | null
          legal_notes?: string | null
          messages_notes?: string | null
          org_id: string
          owner_user_id: string
          percent_complete?: number | null
          pets_notes?: string | null
          prepared_for?: string | null
          preparer_name?: string | null
          property_notes?: string | null
          title?: string | null
          to_loved_ones_message?: string | null
          updated_at?: string
        }
        Update: {
          about_me_notes?: string | null
          checklist_notes?: string | null
          created_at?: string
          digital_notes?: string | null
          financial_notes?: string | null
          funeral_wishes_notes?: string | null
          id?: string
          instructions_notes?: string | null
          insurance_notes?: string | null
          last_signed_at?: string | null
          last_updated_date?: string | null
          legal_notes?: string | null
          messages_notes?: string | null
          org_id?: string
          owner_user_id?: string
          percent_complete?: number | null
          pets_notes?: string | null
          prepared_for?: string | null
          preparer_name?: string | null
          property_notes?: string | null
          title?: string | null
          to_loved_ones_message?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["property_kind"]
          manager: string | null
          mortgage_bank: string | null
          notes: string | null
          plan_id: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["property_kind"]
          manager?: string | null
          mortgage_bank?: string | null
          notes?: string | null
          plan_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["property_kind"]
          manager?: string | null
          mortgage_bank?: string | null
          notes?: string | null
          plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          action: string | null
          created_at: string
          id: string
          plan_id: string
          platform: string
          updated_at: string
          username: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          id?: string
          plan_id: string
          platform: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          id?: string
          plan_id?: string
          platform?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_accounts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          disposition: string | null
          id: string
          make_model: string
          plan_id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          disposition?: string | null
          id?: string
          make_model: string
          plan_id: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          disposition?: string | null
          id?: string
          make_model?: string
          plan_id?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          notes: string | null
          plan_id: string
          updated_at: string
          vendor_type: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          plan_id: string
          updated_at?: string
          vendor_type: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          plan_id?: string
          updated_at?: string
          vendor_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_plans_safe: {
        Row: {
          created_at: string | null
          id: string | null
          org_id: string | null
          org_name: string | null
          percent_complete: number | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_executor_access: {
        Args: { _plan_id: string; _user_id: string }
        Returns: boolean
      }
      has_org_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_owner: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_plan_owner: {
        Args: { _plan_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "member" | "executor" | "admin"
      insurance_type: "health" | "life" | "other"
      property_kind: "primary" | "investment"
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
      app_role: ["owner", "member", "executor", "admin"],
      insurance_type: ["health", "life", "other"],
      property_kind: ["primary", "investment"],
    },
  },
} as const

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
      app_tour_steps: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          screen: string
          selector: string | null
          step_order: number
          title: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          screen: string
          selector?: string | null
          step_order: number
          title?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          screen?: string
          selector?: string | null
          step_order?: number
          title?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          channel: string | null
          created_at: string | null
          ends_at: string
          id: string
          notes: string | null
          starts_at: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          ends_at: string
          id?: string
          notes?: string | null
          starts_at: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          ends_at?: string
          id?: string
          notes?: string | null
          starts_at?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assistant_conversations: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assistant_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      cases: {
        Row: {
          case_status: string
          created_at: string
          decedent_id: string | null
          executor_contact_id: string | null
          form_data: Json | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_status?: string
          created_at?: string
          decedent_id?: string | null
          executor_contact_id?: string | null
          form_data?: Json | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_status?: string
          created_at?: string
          decedent_id?: string | null
          executor_contact_id?: string | null
          form_data?: Json | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_decedent_id_fkey"
            columns: ["decedent_id"]
            isOneToOne: false
            referencedRelation: "decedents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_executor_contact_id_fkey"
            columns: ["executor_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          case_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          case_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          case_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
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
      death_cert_requests: {
        Row: {
          case_id: string
          created_at: string
          id: string
          ordered_on: string | null
          quantity_requested: number
          received_on: string | null
          recipients_json: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          ordered_on?: string | null
          quantity_requested?: number
          received_on?: string | null
          recipients_json?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          ordered_on?: string | null
          quantity_requested?: number
          received_on?: string | null
          recipients_json?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "death_cert_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
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
      decedents: {
        Row: {
          case_id: string
          citizenship: string | null
          cod_text: string | null
          created_at: string
          dob: string | null
          dod: string | null
          id: string
          legal_name: string
          marital_status: string | null
          military_branch: string | null
          notes: string | null
          physician_name: string | null
          place_of_death: string | null
          pob_city: string | null
          pob_state: string | null
          religion: string | null
          residence_address: string | null
          ssn_encrypted: string | null
          tod: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          citizenship?: string | null
          cod_text?: string | null
          created_at?: string
          dob?: string | null
          dod?: string | null
          id?: string
          legal_name: string
          marital_status?: string | null
          military_branch?: string | null
          notes?: string | null
          physician_name?: string | null
          place_of_death?: string | null
          pob_city?: string | null
          pob_state?: string | null
          religion?: string | null
          residence_address?: string | null
          ssn_encrypted?: string | null
          tod?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          citizenship?: string | null
          cod_text?: string | null
          created_at?: string
          dob?: string | null
          dod?: string | null
          id?: string
          legal_name?: string
          marital_status?: string | null
          military_branch?: string | null
          notes?: string | null
          physician_name?: string | null
          place_of_death?: string | null
          pob_city?: string | null
          pob_state?: string | null
          religion?: string | null
          residence_address?: string | null
          ssn_encrypted?: string | null
          tod?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decedents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string
          created_at: string
          doc_type: string
          file_url: string | null
          id: string
          storage_location_text: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          doc_type: string
          file_url?: string | null
          id?: string
          storage_location_text?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          doc_type?: string
          file_url?: string | null
          id?: string
          storage_location_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          id: string
          keywords: string[] | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          id?: string
          keywords?: string[] | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          id?: string
          keywords?: string[] | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
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
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_pdf: string | null
          status: string
          stripe_invoice_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_pdf?: string | null
          status: string
          stripe_invoice_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_pdf?: string | null
          status?: string
          stripe_invoice_id?: string
          user_id?: string
        }
        Relationships: []
      }
      kb_articles: {
        Row: {
          body: string
          embedding: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          embedding?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          embedding?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      notices: {
        Row: {
          case_id: string
          confirmation_ref: string | null
          created_at: string
          id: string
          notes: string | null
          notice_type: string
          status: string
          submitted_on: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          confirmation_ref?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          notice_type: string
          status?: string
          submitted_on?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          confirmation_ref?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          notice_type?: string
          status?: string
          submitted_on?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      obituary: {
        Row: {
          case_id: string
          created_at: string
          draft_text: string | null
          id: string
          newspapers_json: Json | null
          other_outlets: string | null
          published_links_json: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          draft_text?: string | null
          id?: string
          newspapers_json?: Json | null
          other_outlets?: string | null
          published_links_json?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          draft_text?: string | null
          id?: string
          newspapers_json?: Json | null
          other_outlets?: string | null
          published_links_json?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obituary_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
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
      service_plan: {
        Row: {
          case_id: string
          casket_open_viewing_bool: boolean | null
          created_at: string
          date_time: string | null
          disposition: string | null
          flowers_json: Json | null
          honors_json: Json | null
          id: string
          music_json: Json | null
          officiants_json: Json | null
          pallbearers_json: Json | null
          readings_json: Json | null
          service_type: string | null
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          case_id: string
          casket_open_viewing_bool?: boolean | null
          created_at?: string
          date_time?: string | null
          disposition?: string | null
          flowers_json?: Json | null
          honors_json?: Json | null
          id?: string
          music_json?: Json | null
          officiants_json?: Json | null
          pallbearers_json?: Json | null
          readings_json?: Json | null
          service_type?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          case_id?: string
          casket_open_viewing_bool?: boolean | null
          created_at?: string
          date_time?: string | null
          disposition?: string | null
          flowers_json?: Json | null
          honors_json?: Json | null
          id?: string
          music_json?: Json | null
          officiants_json?: Json | null
          pallbearers_json?: Json | null
          readings_json?: Json | null
          service_type?: string | null
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_plan_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          default_task_templates_json: Json | null
          id: string
          logo_url: string | null
          org_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_task_templates_json?: Json | null
          id?: string
          logo_url?: string | null
          org_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_task_templates_json?: Json | null
          id?: string
          logo_url?: string | null
          org_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_contact_id: string | null
          case_id: string
          category: string
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_contact_id?: string | null
          case_id: string
          category: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_contact_id?: string | null
          case_id?: string
          category?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_contact_id_fkey"
            columns: ["assigned_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      transport: {
        Row: {
          case_id: string
          created_at: string
          escort_required_bool: boolean | null
          from_funeral_home: string | null
          id: string
          to_funeral_home: string | null
          updated_at: string
          vehicles_json: Json | null
        }
        Insert: {
          case_id: string
          created_at?: string
          escort_required_bool?: boolean | null
          from_funeral_home?: string | null
          id?: string
          to_funeral_home?: string | null
          updated_at?: string
          vehicles_json?: Json | null
        }
        Update: {
          case_id?: string
          created_at?: string
          escort_required_bool?: boolean | null
          from_funeral_home?: string | null
          id?: string
          to_funeral_home?: string | null
          updated_at?: string
          vehicles_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
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
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          selected_sections: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          selected_sections?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          selected_sections?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
      vendor_directory: {
        Row: {
          address: string | null
          category: string
          city: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          notes: string | null
          phone: string | null
          state: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          state: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
      get_user_subscription: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["subscription_plan"]
      }
      has_app_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
      has_vip_access: { Args: { _user_id: string }; Returns: boolean }
      is_case_owner: {
        Args: { _case_id: string; _user_id: string }
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
      kb_semantic_search: {
        Args: { match_count: number; query_text: string }
        Returns: {
          id: string
          similarity: number
          snippet: string
          title: string
        }[]
      }
    }
    Enums: {
      app_role: "owner" | "member" | "executor" | "admin" | "vip"
      insurance_type: "health" | "life" | "other"
      property_kind: "primary" | "investment"
      subscription_plan:
        | "free"
        | "basic"
        | "premium"
        | "vip_annual"
        | "vip_monthly"
      subscription_status: "active" | "canceled" | "past_due" | "trialing"
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
      app_role: ["owner", "member", "executor", "admin", "vip"],
      insurance_type: ["health", "life", "other"],
      property_kind: ["primary", "investment"],
      subscription_plan: [
        "free",
        "basic",
        "premium",
        "vip_annual",
        "vip_monthly",
      ],
      subscription_status: ["active", "canceled", "past_due", "trialing"],
    },
  },
} as const

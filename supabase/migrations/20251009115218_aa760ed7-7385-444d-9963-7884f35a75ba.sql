-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('owner', 'member', 'executor', 'admin');
CREATE TYPE public.property_kind AS ENUM ('primary', 'investment');
CREATE TYPE public.insurance_type AS ENUM ('health', 'life', 'other');

-- Organizations table
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization members (for role-based access)
CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Main plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL,
  title TEXT,
  last_signed_at TIMESTAMPTZ,
  prepared_for TEXT,
  preparer_name TEXT,
  last_updated_date DATE,
  to_loved_ones_message TEXT,
  instructions_notes TEXT,
  about_me_notes TEXT,
  checklist_notes TEXT,
  funeral_wishes_notes TEXT,
  financial_notes TEXT,
  insurance_notes TEXT,
  property_notes TEXT,
  pets_notes TEXT,
  digital_notes TEXT,
  legal_notes TEXT,
  messages_notes TEXT,
  percent_complete INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Personal profiles table
CREATE TABLE public.personal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  maiden_name TEXT,
  address TEXT,
  ssn TEXT, -- Will be encrypted at app level
  dob DATE,
  birthplace TEXT,
  citizenship TEXT,
  religion TEXT,
  marital_status TEXT,
  partner_name TEXT,
  ex_spouse_name TEXT,
  father_name TEXT,
  mother_name TEXT,
  child_names TEXT[],
  hobbies TEXT,
  accomplishments TEXT,
  remembered TEXT,
  vet_branch TEXT,
  vet_rank TEXT,
  vet_serial TEXT,
  vet_war TEXT,
  vet_entry DATE,
  vet_discharge DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plan revisions (signatures)
CREATE TABLE public.plan_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  revision_date DATE NOT NULL,
  signature_png TEXT, -- base64 or storage URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contacts to notify
CREATE TABLE public.contacts_notify (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  contact TEXT,
  auto_injected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Professional contacts
CREATE TABLE public.contacts_professional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  name TEXT,
  company TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Preferred vendors
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  vendor_type TEXT NOT NULL,
  contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Funeral funding sources
CREATE TABLE public.funeral_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  account TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bank accounts
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_type TEXT,
  account_number TEXT, -- Will be encrypted at app level
  pod TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Investments
CREATE TABLE public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  brokerage TEXT NOT NULL,
  account_type TEXT,
  account_number TEXT, -- Will be encrypted at app level
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Properties
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  kind public.property_kind NOT NULL DEFAULT 'primary',
  address TEXT NOT NULL,
  manager TEXT,
  mortgage_bank TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicles
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  make_model TEXT NOT NULL,
  year INTEGER,
  disposition TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Businesses
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  partnership_info TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Debts
CREATE TABLE public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  creditor TEXT NOT NULL,
  account_number TEXT, -- Will be encrypted at app level
  debt_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pets
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  caregiver TEXT,
  vet_contact TEXT,
  care_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phones
CREATE TABLE public.phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  carrier TEXT,
  access_info TEXT, -- Will be encrypted at app level
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social accounts
CREATE TABLE public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT,
  action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insurance policies
CREATE TABLE public.insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  type public.insurance_type NOT NULL DEFAULT 'other',
  company TEXT NOT NULL,
  policy_number TEXT, -- Will be encrypted at app level
  contact_person TEXT,
  phone_or_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  audience TEXT NOT NULL,
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_plans_owner ON public.plans(owner_user_id);
CREATE INDEX idx_plans_org ON public.plans(org_id);
CREATE INDEX idx_plans_updated ON public.plans(updated_at DESC);
CREATE INDEX idx_org_members_user ON public.org_members(user_id);
CREATE INDEX idx_org_members_org ON public.org_members(org_id);
CREATE INDEX idx_contacts_notify_plan ON public.contacts_notify(plan_id);
CREATE INDEX idx_contacts_notify_name ON public.contacts_notify(name);
CREATE INDEX idx_personal_profiles_plan ON public.personal_profiles(plan_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for all tables with updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_profiles_updated_at BEFORE UPDATE ON public.personal_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plan_revisions_updated_at BEFORE UPDATE ON public.plan_revisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_notify_updated_at BEFORE UPDATE ON public.contacts_notify
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_professional_updated_at BEFORE UPDATE ON public.contacts_professional
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funeral_funding_updated_at BEFORE UPDATE ON public.funeral_funding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_phones_updated_at BEFORE UPDATE ON public.phones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_notify ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_professional ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funeral_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has role in org
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = _user_id
      AND org_id = _org_id
      AND role = _role
  )
$$;

-- Helper function to check if user is owner of plan
CREATE OR REPLACE FUNCTION public.is_plan_owner(_user_id UUID, _plan_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.plans
    WHERE id = _plan_id
      AND owner_user_id = _user_id
  )
$$;

-- Helper function to check if user has executor access to plan
CREATE OR REPLACE FUNCTION public.has_executor_access(_user_id UUID, _plan_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.plans p
    JOIN public.org_members om ON om.org_id = p.org_id
    WHERE p.id = _plan_id
      AND om.user_id = _user_id
      AND om.role = 'executor'
  )
$$;

-- RLS Policies for orgs
CREATE POLICY "Users can view orgs they are members of"
  ON public.orgs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = orgs.id
        AND org_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create orgs"
  ON public.orgs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for org_members
CREATE POLICY "Users can view org members of their orgs"
  ON public.org_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om2
      WHERE om2.org_id = org_members.org_id
        AND om2.user_id = auth.uid()
    )
  );

CREATE POLICY "Org owners can manage members"
  ON public.org_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om2
      WHERE om2.org_id = org_members.org_id
        AND om2.user_id = auth.uid()
        AND om2.role = 'owner'
    )
  );

CREATE POLICY "Users can add themselves to orgs"
  ON public.org_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for plans
CREATE POLICY "Plan owners can view and edit their plans"
  ON public.plans FOR ALL
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Executors can view plans"
  ON public.plans FOR SELECT
  USING (public.has_executor_access(auth.uid(), id));

CREATE POLICY "Admins can view safe plan data"
  ON public.plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = plans.org_id
        AND org_members.user_id = auth.uid()
        AND org_members.role = 'admin'
    )
  );

-- RLS Policies for child tables (inherit from plans)
CREATE POLICY "Users can access personal profiles for their plans"
  ON public.personal_profiles FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access revisions for their plans"
  ON public.plan_revisions FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access contacts for their plans"
  ON public.contacts_notify FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access professional contacts for their plans"
  ON public.contacts_professional FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access vendors for their plans"
  ON public.vendors FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access funeral funding for their plans"
  ON public.funeral_funding FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access bank accounts for their plans"
  ON public.bank_accounts FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access investments for their plans"
  ON public.investments FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access properties for their plans"
  ON public.properties FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access vehicles for their plans"
  ON public.vehicles FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access businesses for their plans"
  ON public.businesses FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access debts for their plans"
  ON public.debts FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access pets for their plans"
  ON public.pets FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access phones for their plans"
  ON public.phones FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access social accounts for their plans"
  ON public.social_accounts FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access insurance policies for their plans"
  ON public.insurance_policies FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

CREATE POLICY "Users can access messages for their plans"
  ON public.messages FOR ALL
  USING (
    public.is_plan_owner(auth.uid(), plan_id) OR
    public.has_executor_access(auth.uid(), plan_id)
  );

-- Create admin-safe view for plans (excludes sensitive data)
CREATE OR REPLACE VIEW public.admin_plans_safe AS
SELECT 
  p.id,
  p.org_id,
  p.title,
  p.percent_complete,
  p.updated_at,
  p.created_at,
  o.name as org_name
FROM public.plans p
JOIN public.orgs o ON o.id = p.org_id;
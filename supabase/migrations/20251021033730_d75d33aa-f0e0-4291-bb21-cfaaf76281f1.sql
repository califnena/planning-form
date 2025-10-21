-- Create cases table for executor-phase case management
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_status TEXT NOT NULL DEFAULT 'open' CHECK (case_status IN ('open', 'on_hold', 'closed')),
  decedent_id UUID,
  executor_contact_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create decedents table for vital stats
CREATE TABLE public.decedents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  legal_name TEXT NOT NULL,
  dob DATE,
  pob_city TEXT,
  pob_state TEXT,
  ssn_encrypted TEXT,
  religion TEXT,
  citizenship TEXT,
  marital_status TEXT,
  military_branch TEXT,
  place_of_death TEXT,
  dod DATE,
  tod TIME,
  cod_text TEXT,
  physician_name TEXT,
  residence_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('executor', 'attorney', 'funeral_director', 'next_of_kin', 'pallbearer', 'clergy', 'vendor', 'notify_contact')),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('will', 'trust', 'insurance', 'deed', 'title', 'tax_return', 'burial_plot', 'safe_deposit', 'obituary_draft', 'death_cert_order', 'receipt')),
  storage_location_text TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('legal', 'funeral', 'finance', 'digital', 'home', 'obituary', 'veterans', 'transport')),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done', 'blocked')),
  assigned_contact_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notices table
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  notice_type TEXT NOT NULL CHECK (notice_type IN ('ssa', 'employer', 'bank', 'insurance', 'mortgage', 'credit_card', 'utilities', 'subscriptions', 'dmv', 'irs', 'va', 'pension')),
  submitted_on DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'confirmed', 'completed')),
  confirmation_ref TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create death_cert_requests table
CREATE TABLE public.death_cert_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  quantity_requested INTEGER NOT NULL DEFAULT 0,
  recipients_json JSONB,
  ordered_on DATE,
  received_on DATE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ordered', 'received')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create obituary table
CREATE TABLE public.obituary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  newspapers_json JSONB,
  other_outlets TEXT,
  draft_text TEXT,
  published_links_json JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'published')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_plan table
CREATE TABLE public.service_plan (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  service_type TEXT CHECK (service_type IN ('traditional', 'memorial', 'graveside', 'direct')),
  disposition TEXT CHECK (disposition IN ('burial', 'cremation', 'donation', 'other')),
  casket_open_viewing_bool BOOLEAN DEFAULT false,
  venue_name TEXT,
  venue_address TEXT,
  date_time TIMESTAMP WITH TIME ZONE,
  officiants_json JSONB,
  pallbearers_json JSONB,
  music_json JSONB,
  readings_json JSONB,
  flowers_json JSONB,
  honors_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transport table
CREATE TABLE public.transport (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL,
  from_funeral_home TEXT,
  to_funeral_home TEXT,
  escort_required_bool BOOLEAN DEFAULT false,
  vehicles_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settings table
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  org_name TEXT,
  logo_url TEXT,
  default_task_templates_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.cases ADD CONSTRAINT cases_decedent_id_fkey 
  FOREIGN KEY (decedent_id) REFERENCES public.decedents(id) ON DELETE SET NULL;

ALTER TABLE public.cases ADD CONSTRAINT cases_executor_contact_id_fkey 
  FOREIGN KEY (executor_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.decedents ADD CONSTRAINT decedents_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE public.contacts ADD CONSTRAINT contacts_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE public.documents ADD CONSTRAINT documents_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE public.tasks ADD CONSTRAINT tasks_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE public.tasks ADD CONSTRAINT tasks_assigned_contact_id_fkey 
  FOREIGN KEY (assigned_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

ALTER TABLE public.notices ADD CONSTRAINT notices_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE public.death_cert_requests ADD CONSTRAINT death_cert_requests_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE public.obituary ADD CONSTRAINT obituary_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE public.service_plan ADD CONSTRAINT service_plan_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE public.transport ADD CONSTRAINT transport_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decedents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.death_cert_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obituary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases
CREATE POLICY "Users can view their own cases"
  ON public.cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cases"
  ON public.cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cases"
  ON public.cases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cases"
  ON public.cases FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to check case ownership
CREATE OR REPLACE FUNCTION public.is_case_owner(_user_id UUID, _case_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cases
    WHERE id = _case_id AND user_id = _user_id
  )
$$;

-- RLS Policies for decedents
CREATE POLICY "Users can access decedents for their cases"
  ON public.decedents FOR ALL
  USING (is_case_owner(auth.uid(), case_id));

-- RLS Policies for contacts
CREATE POLICY "Users can access contacts for their cases"
  ON public.contacts FOR ALL
  USING (is_case_owner(auth.uid(), case_id));

-- RLS Policies for documents
CREATE POLICY "Users can access documents for their cases"
  ON public.documents FOR ALL
  USING (is_case_owner(auth.uid(), case_id));

-- RLS Policies for tasks
CREATE POLICY "Users can access tasks for their cases"
  ON public.tasks FOR ALL
  USING (is_case_owner(auth.uid(), case_id));

-- RLS Policies for notices
CREATE POLICY "Users can access notices for their cases"
  ON public.notices FOR ALL
  USING (is_case_owner(auth.uid(), case_id));

-- RLS Policies for death_cert_requests
CREATE POLICY "Users can access death cert requests for their cases"
  ON public.death_cert_requests FOR ALL
  USING (is_case_owner(auth.uid(), case_id));

-- RLS Policies for obituary
CREATE POLICY "Users can access obituary for their cases"
  ON public.obituary FOR ALL
  USING (is_case_owner(auth.uid(), case_id));

-- RLS Policies for service_plan
CREATE POLICY "Users can access service plans for their cases"
  ON public.service_plan FOR ALL
  USING (is_case_owner(auth.uid(), case_id));

-- RLS Policies for transport
CREATE POLICY "Users can access transport for their cases"
  ON public.transport FOR ALL
  USING (is_case_owner(auth.uid(), case_id));

-- RLS Policies for settings
CREATE POLICY "Users can view their own settings"
  ON public.settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create update triggers
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_decedents_updated_at
  BEFORE UPDATE ON public.decedents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_death_cert_requests_updated_at
  BEFORE UPDATE ON public.death_cert_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_obituary_updated_at
  BEFORE UPDATE ON public.obituary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_plan_updated_at
  BEFORE UPDATE ON public.service_plan
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transport_updated_at
  BEFORE UPDATE ON public.transport
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
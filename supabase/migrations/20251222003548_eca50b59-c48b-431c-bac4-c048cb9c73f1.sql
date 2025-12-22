-- Create section selections per plan (for PDF inclusion)
create table if not exists public.plan_section_selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid not null,
  section_id text not null,
  is_selected boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, section_id)
);

alter table public.plan_section_selections enable row level security;

create policy "Users can view their own section selections"
on public.plan_section_selections
for select
using (auth.uid() = user_id);

create policy "Users can create their own section selections"
on public.plan_section_selections
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own section selections"
on public.plan_section_selections
for update
using (auth.uid() = user_id);

create policy "Users can delete their own section selections"
on public.plan_section_selections
for delete
using (auth.uid() = user_id);

-- Store references to generated PDFs
create table if not exists public.generated_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid not null,
  doc_type text not null check (doc_type in ('full', 'family_one_page')),
  storage_bucket text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

alter table public.generated_documents enable row level security;

create policy "Users can view their own generated documents"
on public.generated_documents
for select
using (auth.uid() = user_id);

create policy "Users can create their own generated documents"
on public.generated_documents
for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own generated documents"
on public.generated_documents
for delete
using (auth.uid() = user_id);

-- updated_at trigger function (reusable)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_plan_section_selections_updated_at on public.plan_section_selections;
create trigger trg_plan_section_selections_updated_at
before update on public.plan_section_selections
for each row execute function public.update_updated_at_column();

create index if not exists idx_plan_section_selections_user_plan on public.plan_section_selections(user_id, plan_id);
create index if not exists idx_generated_documents_user_plan on public.generated_documents(user_id, plan_id);
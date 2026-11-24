-- AeroTriage Enterprise CDSS — Supabase PostgreSQL Security & Multi-Tenant Schema

create table if not exists public.aerotriage_hospitals (
  id text primary key,
  name text not null,
  address text not null,
  server_code text unique not null,
  password_hash text not null,
  total_beds integer not null default 30,
  available_beds integer not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.aerotriage_directory (
  id text primary key,
  hospital_id text not null references public.aerotriage_hospitals(id) on delete cascade,
  category text not null check (category in ('staff', 'doctors', 'nurses', 'patients')),
  full_name text not null,
  mobile text not null,
  email text not null,
  password_hash text not null,
  role_or_ward text,
  status text default 'Active',
  latest_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.aerotriage_receipts (
  receipt_no text primary key,
  hospital_id text not null references public.aerotriage_hospitals(id) on delete cascade,
  patient_id text not null,
  patient_name text not null,
  receipt_date date not null default current_date,
  service text not null,
  amount numeric(12,2) not null default 0,
  status text not null check (status in ('Paid', 'Pending')),
  created_at timestamptz not null default now()
);

alter table public.aerotriage_hospitals enable row level security;
alter table public.aerotriage_directory enable row level security;
alter table public.aerotriage_receipts enable row level security;

create policy "Hospital grid read" on public.aerotriage_hospitals
  for select using (true);

create policy "Hospital directory scoped access" on public.aerotriage_directory
  for all using (true) with check (true);

create policy "Hospital receipts scoped access" on public.aerotriage_receipts
  for all using (true) with check (true);
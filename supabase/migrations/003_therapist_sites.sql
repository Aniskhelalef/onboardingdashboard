-- Stores published site data for public preview
create table therapist_sites (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  data       jsonb not null,
  published  boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_therapist_sites_slug on therapist_sites (slug);

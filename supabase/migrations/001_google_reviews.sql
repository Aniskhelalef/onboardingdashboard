-- Google Reviews feature tables
-- Run this in your Supabase SQL Editor: Dashboard > SQL Editor > New query

-- ============================================================
-- 1. google_review_sources — one per therapist
-- ============================================================
create table if not exists google_review_sources (
  id            uuid primary key default gen_random_uuid(),
  therapist_id  text not null,
  google_maps_url text not null,
  google_place_id text,
  last_scraped_at timestamptz,
  next_refresh_available_at timestamptz,
  total_reviews_found integer not null default 0,
  status        text not null default 'pending'
                check (status in ('pending', 'scraping', 'completed', 'failed')),
  error_message text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- One source per therapist
create unique index if not exists idx_review_sources_therapist
  on google_review_sources (therapist_id);

-- ============================================================
-- 2. google_reviews — the actual reviews (max 15 per source)
-- ============================================================
create table if not exists google_reviews (
  id              uuid primary key default gen_random_uuid(),
  source_id       uuid not null references google_review_sources(id) on delete cascade,
  reviewer_name   text not null,
  review_text     text not null,
  rating          integer not null default 5,
  published_at    timestamptz,
  reviewer_photo_url text,
  google_review_url  text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_reviews_source
  on google_reviews (source_id);

-- ============================================================
-- 3. Auto-update updated_at on google_review_sources
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_review_sources_updated_at on google_review_sources;
create trigger trg_review_sources_updated_at
  before update on google_review_sources
  for each row execute function update_updated_at();

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================
-- Enable RLS but allow all operations for now (service role / anon key).
-- Tighten these policies once you add auth.

alter table google_review_sources enable row level security;
alter table google_reviews enable row level security;

-- Allow all operations (temporary — restrict once auth is in place)
create policy "Allow all on google_review_sources"
  on google_review_sources for all
  using (true) with check (true);

create policy "Allow all on google_reviews"
  on google_reviews for all
  using (true) with check (true);

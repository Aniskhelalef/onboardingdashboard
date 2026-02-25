-- CTA click tracking for therapist sites
create table cta_events (
  id          uuid primary key default gen_random_uuid(),
  therapist_id text not null,
  session_id  text not null,
  event_type  text not null check (event_type in ('page_view', 'cta_rdv_click', 'cta_appeler_click')),
  page_slug   text not null,
  placement   text check (placement in ('navbar', 'hero', 'after_specialties', 'after_deroulement', 'after_faq', 'sticky_footer')),
  created_at  timestamptz default now()
);

-- Fast lookups by therapist + date range
create index idx_cta_events_therapist on cta_events (therapist_id, created_at);

-- Fast unique session counts
create index idx_cta_events_session on cta_events (therapist_id, session_id);

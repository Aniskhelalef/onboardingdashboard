-- Add real Google Maps total review count and rating to sources
-- Run this in your Supabase SQL Editor

alter table google_review_sources
  add column if not exists google_total_reviews integer,
  add column if not exists google_rating numeric(2,1);

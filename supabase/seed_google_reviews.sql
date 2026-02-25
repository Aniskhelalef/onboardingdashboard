-- Seed data for Google Reviews feature (development only)
-- Run this AFTER 001_google_reviews.sql in Supabase SQL Editor.
--
-- Creates a fake therapist source + 15 sample reviews so you can develop
-- and test the widget without hitting Apify.
--
-- To reset: DELETE FROM google_review_sources WHERE therapist_id = 'demo-therapist';
-- (reviews cascade-delete automatically)

-- ── 1. Source ────────────────────────────────────────────────
INSERT INTO google_review_sources (
  id, therapist_id, google_maps_url, google_place_id,
  status, total_reviews_found,
  last_scraped_at, next_refresh_available_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo-therapist',
  'https://www.google.com/maps/place/Cabinet+Thérapeutique+Exemple',
  'ChIJexamplePlaceId',
  'completed',
  15,
  now(),
  now() + interval '15 days'
)
ON CONFLICT (therapist_id) DO UPDATE SET
  status = 'completed',
  total_reviews_found = 15,
  last_scraped_at = now(),
  next_refresh_available_at = now() + interval '15 days',
  error_message = null;

-- ── 2. Reviews (15 five-star, newest first) ─────────────────
-- Delete any existing seed reviews first
DELETE FROM google_reviews WHERE source_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO google_reviews (source_id, reviewer_name, review_text, rating, published_at, reviewer_photo_url, google_review_url) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Marie Dupont',
  'Un thérapeute exceptionnel ! Après seulement 3 séances, mes douleurs chroniques au dos ont pratiquement disparu. Je recommande vivement à tous ceux qui souffrent.',
  5,
  now() - interval '2 days',
  'https://lh3.googleusercontent.com/a/default-user=s120',
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Pierre Martin',
  'Professionnel, à l''écoute et très compétent. L''ambiance du cabinet est apaisante. Mes migraines se sont nettement améliorées.',
  5,
  now() - interval '5 days',
  NULL,
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Sophie Laurent',
  'Je suis venue pour des problèmes de stress et d''anxiété. Les techniques utilisées sont efficaces et les résultats sont visibles dès la première séance.',
  5,
  now() - interval '1 week',
  'https://lh3.googleusercontent.com/a/default-user=s120',
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Jean Bernard',
  'Magnifique expérience. Le praticien prend le temps d''expliquer chaque étape du traitement. Résultats concrets et durables.',
  5,
  now() - interval '10 days',
  NULL,
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Camille Rousseau',
  'Je consulte régulièrement depuis 6 mois et les progrès sont remarquables. Mon sommeil s''est amélioré et mes tensions ont diminué de façon significative.',
  5,
  now() - interval '2 weeks',
  'https://lh3.googleusercontent.com/a/default-user=s120',
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Thomas Petit',
  'Excellent praticien ! Approche holistique et personnalisée. Je me sens enfin compris et accompagné dans ma démarche de soin.',
  5,
  now() - interval '3 weeks',
  NULL,
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Isabelle Moreau',
  'Suite à un accident de voiture, j''avais des douleurs cervicales intenses. Après un mois de suivi, je peux enfin tourner la tête sans douleur. Merci !',
  5,
  now() - interval '1 month',
  'https://lh3.googleusercontent.com/a/default-user=s120',
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Lucas Girard',
  'Cabinet propre et accueillant. Le thérapeute est ponctuel et professionnel. Mes douleurs lombaires ont beaucoup diminué.',
  5,
  now() - interval '5 weeks',
  NULL,
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Emma Lefevre',
  'Une approche douce et efficace. Je recommande particulièrement pour les sportifs. Mes performances se sont améliorées depuis que je consulte.',
  5,
  now() - interval '6 weeks',
  'https://lh3.googleusercontent.com/a/default-user=s120',
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Alexandre Dubois',
  'Très satisfait du suivi. Le praticien adapte ses techniques à chaque patient. Mes problèmes de posture se corrigent progressivement.',
  5,
  now() - interval '2 months',
  NULL,
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Claire Fontaine',
  'J''ai essayé plusieurs thérapeutes avant et c''est de loin le meilleur. Compétent, humain et les résultats parlent d''eux-mêmes.',
  5,
  now() - interval '10 weeks',
  'https://lh3.googleusercontent.com/a/default-user=s120',
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Nicolas Roux',
  'Prise en charge rapide et efficace de ma tendinite. Le thérapeute m''a aussi donné des exercices à faire chez moi. Très pro.',
  5,
  now() - interval '3 months',
  NULL,
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Julie Lambert',
  'Cadre apaisant, écoute attentive. Les séances m''aident à gérer mon stress au travail. Un vrai moment de bien-être.',
  5,
  now() - interval '14 weeks',
  'https://lh3.googleusercontent.com/a/default-user=s120',
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'François Blanc',
  'Souffrant d''une sciatique depuis des mois, j''ai retrouvé ma mobilité grâce à ce thérapeute. Approche complète et rassurante.',
  5,
  now() - interval '4 months',
  NULL,
  NULL
),
(
  '00000000-0000-0000-0000-000000000001',
  'Aurélie Mercier',
  'Le bouche-à-oreille ne ment pas ! Chaque séance est un soulagement. Professionnel attentif qui prend le temps avec ses patients.',
  5,
  now() - interval '5 months',
  'https://lh3.googleusercontent.com/a/default-user=s120',
  NULL
);

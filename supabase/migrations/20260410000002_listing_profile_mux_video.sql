-- Mux video: listings (tour) + profiles (intro). Run in Supabase SQL editor or CLI.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS video_id text,
  ADD COLUMN IF NOT EXISTS video_playback_id text,
  ADD COLUMN IF NOT EXISTS video_provider text NOT NULL DEFAULT 'mux',
  ADD COLUMN IF NOT EXISTS video_status text NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS video_view_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS intro_video_id text,
  ADD COLUMN IF NOT EXISTS intro_video_playback_id text,
  ADD COLUMN IF NOT EXISTS intro_video_provider text NOT NULL DEFAULT 'mux',
  ADD COLUMN IF NOT EXISTS intro_video_status text NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS intro_video_view_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.listings.video_id IS 'Mux asset id (set when asset is ready)';
COMMENT ON COLUMN public.listings.video_playback_id IS 'Mux public playback id for Mux Player';
COMMENT ON COLUMN public.listings.video_status IS 'processing | ready | failed';

-- Northing: profiles extensions, enquiries, saved_listings, RLS
-- Run via Supabase CLI or SQL Editor.

-- ---- profiles ----
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobile_number text;
UPDATE public.profiles SET mobile_number = COALESCE(NULLIF(TRIM(mobile_number), ''), phone) WHERE mobile_number IS NULL OR mobile_number = '';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rera_number text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- ---- saved_listings ----
CREATE TABLE IF NOT EXISTS public.saved_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS saved_listings_user_id_idx ON public.saved_listings (user_id);
CREATE INDEX IF NOT EXISTS saved_listings_listing_id_idx ON public.saved_listings (listing_id);

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own saved listings" ON public.saved_listings;
CREATE POLICY "Users manage own saved listings"
  ON public.saved_listings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- enquiries ----
CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings (id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enquiries_listing_id_idx ON public.enquiries (listing_id);
CREATE INDEX IF NOT EXISTS enquiries_seller_id_idx ON public.enquiries (seller_id);
CREATE INDEX IF NOT EXISTS enquiries_buyer_id_idx ON public.enquiries (buyer_id);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers insert enquiries" ON public.enquiries;
CREATE POLICY "Buyers insert enquiries"
  ON public.enquiries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Parties read enquiries" ON public.enquiries;
CREATE POLICY "Parties read enquiries"
  ON public.enquiries FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Seller updates enquiry status" ON public.enquiries;
CREATE POLICY "Seller updates enquiry status"
  ON public.enquiries FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

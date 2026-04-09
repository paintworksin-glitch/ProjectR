-- Admin: masters can read all profiles; listings.featured; RPCs for master listing ops (avoids breaking public feed RLS).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS listings_featured_active_idx ON public.listings (featured) WHERE featured = true;

DROP POLICY IF EXISTS "Masters can read all profiles" ON public.profiles;
CREATE POLICY "Masters can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_master());

CREATE OR REPLACE FUNCTION public.master_update_listing(
  p_listing_id uuid,
  p_status text DEFAULT NULL,
  p_featured boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'master') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  UPDATE public.listings
  SET
    status = CASE WHEN p_status IS NULL THEN status ELSE p_status END,
    featured = CASE WHEN p_featured IS NULL THEN featured ELSE p_featured END
  WHERE id = p_listing_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.master_delete_listing(p_listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'master') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.listings WHERE id = p_listing_id;
END;
$$;

REVOKE ALL ON FUNCTION public.master_update_listing(uuid, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.master_delete_listing(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.master_update_listing(uuid, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.master_delete_listing(uuid) TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'enquiries') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Masters can read all enquiries" ON public.enquiries';
    EXECUTE 'CREATE POLICY "Masters can read all enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.is_master())';
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';

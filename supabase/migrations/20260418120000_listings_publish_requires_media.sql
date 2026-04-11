-- Block publishing (non-Draft) without at least one photo or an in-flight video tour (processing/ready).

CREATE OR REPLACE FUNCTION public.listings_enforce_publish_media()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  photo_count int;
  has_vid boolean;
BEGIN
  IF NEW.status IS NULL OR trim(NEW.status) = '' OR NEW.status = 'Draft' THEN
    RETURN NEW;
  END IF;

  photo_count := coalesce(jsonb_array_length(to_jsonb(NEW.photos)), 0);

  has_vid :=
    NEW.video_id IS NOT NULL
    AND trim(NEW.video_id) <> ''
    AND NEW.video_status IN ('ready', 'processing');

  IF photo_count > 0 OR has_vid THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION '%', 'Please add at least one photo or a video tour before publishing'
    USING ERRCODE = '23514';
END;
$$;

DROP TRIGGER IF EXISTS listings_enforce_publish_media_trigger ON public.listings;
CREATE TRIGGER listings_enforce_publish_media_trigger
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.listings_enforce_publish_media();

NOTIFY pgrst, 'reload schema';

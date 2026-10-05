BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marketplace_listing_type') THEN
    CREATE TYPE public.marketplace_listing_type AS ENUM ('rental', 'part', 'service', 'accessory');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marketplace_listing_status') THEN
    CREATE TYPE public.marketplace_listing_status AS ENUM ('draft', 'active', 'paused', 'rented', 'sold', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marketplace_proposal_status') THEN
    CREATE TYPE public.marketplace_proposal_status AS ENUM ('pending', 'reviewing', 'accepted', 'rejected', 'cancelled');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.marketplace_current_company_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'company_id', '')::uuid,
    (SELECT company_id FROM public.carcontrol_profiles WHERE id = auth.uid()),
    (SELECT company_id FROM public.carcontrol_user WHERE id = auth.uid())
  )
$$;

CREATE TABLE IF NOT EXISTS public.marketplace_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  listing_type public.marketplace_listing_type NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.carcontrol_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  city TEXT,
  state TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.carcontrol_companies(id) ON DELETE CASCADE,
  seller_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.carcontrol_vehicles(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
  listing_type public.marketplace_listing_type NOT NULL DEFAULT 'rental',
  status public.marketplace_listing_status NOT NULL DEFAULT 'active',
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  period TEXT,
  condition_label TEXT NOT NULL DEFAULT 'Disponivel',
  city TEXT,
  state TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
  proposals_count INTEGER NOT NULL DEFAULT 0 CHECK (proposals_count >= 0),
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.carcontrol_companies(id) ON DELETE CASCADE,
  storage_path TEXT,
  public_url TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_listing_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS public.marketplace_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  seller_company_id UUID NOT NULL REFERENCES public.carcontrol_companies(id) ON DELETE CASCADE,
  seller_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.marketplace_proposal_status NOT NULL DEFAULT 'pending',
  proposed_start_date DATE,
  message TEXT,
  buyer_name TEXT,
  buyer_phone TEXT,
  buyer_rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (buyer_rating >= 0 AND buyer_rating <= 5),
  buyer_experience TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  seller_company_id UUID REFERENCES public.carcontrol_companies(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON public.marketplace_listings(status, is_featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_company ON public.marketplace_listings(company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON public.marketplace_listings(category_id, price);
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_images_listing ON public.marketplace_listing_images(listing_id, is_cover DESC, sort_order);
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_specs_listing ON public.marketplace_listing_specs(listing_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_marketplace_proposals_seller ON public.marketplace_proposals(seller_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_proposals_buyer ON public.marketplace_proposals(buyer_user_id, status, created_at DESC);

CREATE OR REPLACE FUNCTION public.marketplace_set_company_and_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := public.marketplace_current_company_id();
  END IF;
  IF NEW.seller_user_id IS NULL THEN
    NEW.seller_user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.marketplace_set_image_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT company_id INTO NEW.company_id
  FROM public.marketplace_listings
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.marketplace_set_proposal_seller()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT company_id, seller_user_id
  INTO NEW.seller_company_id, NEW.seller_user_id
  FROM public.marketplace_listings
  WHERE id = NEW.listing_id;

  IF NEW.buyer_user_id IS NULL THEN
    NEW.buyer_user_id := auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.marketplace_update_proposals_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.marketplace_listings
    SET proposals_count = proposals_count + 1
    WHERE id = NEW.listing_id;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE public.marketplace_listings
    SET proposals_count = GREATEST(proposals_count - 1, 0)
    WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.marketplace_increment_listing_views(p_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.marketplace_listings
  SET views_count = views_count + 1
  WHERE id = p_listing_id AND status = 'active';
END;
$$;

DROP TRIGGER IF EXISTS marketplace_listings_set_owner ON public.marketplace_listings;
CREATE TRIGGER marketplace_listings_set_owner
  BEFORE INSERT ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.marketplace_set_company_and_user();

DROP TRIGGER IF EXISTS marketplace_listing_images_set_company ON public.marketplace_listing_images;
CREATE TRIGGER marketplace_listing_images_set_company
  BEFORE INSERT OR UPDATE OF listing_id ON public.marketplace_listing_images
  FOR EACH ROW EXECUTE FUNCTION public.marketplace_set_image_company();

DROP TRIGGER IF EXISTS marketplace_proposals_set_seller ON public.marketplace_proposals;
CREATE TRIGGER marketplace_proposals_set_seller
  BEFORE INSERT OR UPDATE OF listing_id ON public.marketplace_proposals
  FOR EACH ROW EXECUTE FUNCTION public.marketplace_set_proposal_seller();

DROP TRIGGER IF EXISTS marketplace_proposals_count_insert ON public.marketplace_proposals;
CREATE TRIGGER marketplace_proposals_count_insert
  AFTER INSERT ON public.marketplace_proposals
  FOR EACH ROW EXECUTE FUNCTION public.marketplace_update_proposals_count();

DROP TRIGGER IF EXISTS marketplace_proposals_count_delete ON public.marketplace_proposals;
CREATE TRIGGER marketplace_proposals_count_delete
  AFTER DELETE ON public.marketplace_proposals
  FOR EACH ROW EXECUTE FUNCTION public.marketplace_update_proposals_count();

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'marketplace_categories',
    'marketplace_seller_profiles',
    'marketplace_listings',
    'marketplace_proposals',
    'marketplace_reviews'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t || '_updated_at', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t || '_updated_at', t);
  END LOOP;
END $$;

ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listing_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_categories_read ON public.marketplace_categories;
CREATE POLICY marketplace_categories_read ON public.marketplace_categories
  FOR SELECT TO authenticated USING (active = true);

DROP POLICY IF EXISTS marketplace_seller_profiles_read ON public.marketplace_seller_profiles;
CREATE POLICY marketplace_seller_profiles_read ON public.marketplace_seller_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS marketplace_seller_profiles_manage_own ON public.marketplace_seller_profiles;
CREATE POLICY marketplace_seller_profiles_manage_own ON public.marketplace_seller_profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR company_id = public.marketplace_current_company_id())
  WITH CHECK (user_id = auth.uid() AND company_id = public.marketplace_current_company_id());

DROP POLICY IF EXISTS marketplace_listings_read_active ON public.marketplace_listings;
CREATE POLICY marketplace_listings_read_active ON public.marketplace_listings
  FOR SELECT TO authenticated
  USING (status = 'active' OR seller_user_id = auth.uid() OR company_id = public.marketplace_current_company_id());

DROP POLICY IF EXISTS marketplace_listings_insert_own_company ON public.marketplace_listings;
CREATE POLICY marketplace_listings_insert_own_company ON public.marketplace_listings
  FOR INSERT TO authenticated
  WITH CHECK (seller_user_id = auth.uid() AND company_id = public.marketplace_current_company_id());

DROP POLICY IF EXISTS marketplace_listings_update_own_company ON public.marketplace_listings;
CREATE POLICY marketplace_listings_update_own_company ON public.marketplace_listings
  FOR UPDATE TO authenticated
  USING (seller_user_id = auth.uid() OR company_id = public.marketplace_current_company_id())
  WITH CHECK (seller_user_id = auth.uid() AND company_id = public.marketplace_current_company_id());

DROP POLICY IF EXISTS marketplace_listings_delete_own ON public.marketplace_listings;
CREATE POLICY marketplace_listings_delete_own ON public.marketplace_listings
  FOR DELETE TO authenticated
  USING (seller_user_id = auth.uid());

DROP POLICY IF EXISTS marketplace_listing_images_read ON public.marketplace_listing_images;
CREATE POLICY marketplace_listing_images_read ON public.marketplace_listing_images
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.marketplace_listings l WHERE l.id = listing_id AND (l.status = 'active' OR l.seller_user_id = auth.uid() OR l.company_id = public.marketplace_current_company_id())));

DROP POLICY IF EXISTS marketplace_listing_images_manage_own ON public.marketplace_listing_images;
CREATE POLICY marketplace_listing_images_manage_own ON public.marketplace_listing_images
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.marketplace_listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.marketplace_listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid()));

DROP POLICY IF EXISTS marketplace_listing_specs_read ON public.marketplace_listing_specs;
CREATE POLICY marketplace_listing_specs_read ON public.marketplace_listing_specs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.marketplace_listings l WHERE l.id = listing_id AND (l.status = 'active' OR l.seller_user_id = auth.uid() OR l.company_id = public.marketplace_current_company_id())));

DROP POLICY IF EXISTS marketplace_listing_specs_manage_own ON public.marketplace_listing_specs;
CREATE POLICY marketplace_listing_specs_manage_own ON public.marketplace_listing_specs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.marketplace_listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.marketplace_listings l WHERE l.id = listing_id AND l.seller_user_id = auth.uid()));

DROP POLICY IF EXISTS marketplace_wishlist_manage_own ON public.marketplace_wishlist;
CREATE POLICY marketplace_wishlist_manage_own ON public.marketplace_wishlist
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS marketplace_proposals_read_participant ON public.marketplace_proposals;
CREATE POLICY marketplace_proposals_read_participant ON public.marketplace_proposals
  FOR SELECT TO authenticated
  USING (buyer_user_id = auth.uid() OR seller_user_id = auth.uid() OR seller_company_id = public.marketplace_current_company_id());

DROP POLICY IF EXISTS marketplace_proposals_insert_buyer ON public.marketplace_proposals;
CREATE POLICY marketplace_proposals_insert_buyer ON public.marketplace_proposals
  FOR INSERT TO authenticated
  WITH CHECK (buyer_user_id = auth.uid());

DROP POLICY IF EXISTS marketplace_proposals_update_participant ON public.marketplace_proposals;
CREATE POLICY marketplace_proposals_update_participant ON public.marketplace_proposals
  FOR UPDATE TO authenticated
  USING (buyer_user_id = auth.uid() OR seller_user_id = auth.uid() OR seller_company_id = public.marketplace_current_company_id())
  WITH CHECK (buyer_user_id = auth.uid() OR seller_user_id = auth.uid() OR seller_company_id = public.marketplace_current_company_id());

DROP POLICY IF EXISTS marketplace_reviews_read ON public.marketplace_reviews;
CREATE POLICY marketplace_reviews_read ON public.marketplace_reviews
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS marketplace_reviews_insert_own ON public.marketplace_reviews;
CREATE POLICY marketplace_reviews_insert_own ON public.marketplace_reviews
  FOR INSERT TO authenticated WITH CHECK (reviewer_user_id = auth.uid());

INSERT INTO public.marketplace_categories (id, name, listing_type, description, icon, sort_order)
VALUES
  ('cars', 'Veiculos', 'rental', 'Veiculos para locacao e trabalho', 'Car', 10),
  ('parts', 'Pecas', 'part', 'Pecas automotivas', 'Wrench', 20),
  ('services', 'Servicos', 'service', 'Servicos automotivos', 'Shield', 30),
  ('accessories', 'Acessorios', 'accessory', 'Acessorios e equipamentos', 'Zap', 40)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  listing_type = EXCLUDED.listing_type,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  active = true,
  updated_at = now();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-images',
  'marketplace-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  BEGIN
    DROP POLICY IF EXISTS marketplace_images_public_read ON storage.objects;
    DROP POLICY IF EXISTS marketplace_images_authenticated_insert ON storage.objects;
    DROP POLICY IF EXISTS marketplace_images_authenticated_update ON storage.objects;
    DROP POLICY IF EXISTS marketplace_images_authenticated_delete ON storage.objects;

    CREATE POLICY marketplace_images_public_read
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'marketplace-images');

    CREATE POLICY marketplace_images_authenticated_insert
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'marketplace-images');

    CREATE POLICY marketplace_images_authenticated_update
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'marketplace-images')
      WITH CHECK (bucket_id = 'marketplace-images');

    CREATE POLICY marketplace_images_authenticated_delete
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'marketplace-images');
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping marketplace storage policies: current role cannot manage storage.objects policies.';
  END;
END $$;

GRANT SELECT ON public.marketplace_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_seller_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listing_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listing_specs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_wishlist TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.marketplace_proposals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.marketplace_reviews TO authenticated;
GRANT EXECUTE ON FUNCTION public.marketplace_increment_listing_views(UUID) TO authenticated;

COMMIT;

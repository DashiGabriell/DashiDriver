import { supabase } from "@/integrations/supabase/client";
import { mktListingLimitFor } from "@/lib/billing/plans";

export type MarketplaceProduct = {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  period?: string | null;
  rating: number;
  reviews?: number;
  image: string;
  images: string[];
  category: string;
  categoryId?: string | null;
  condition: string;
  isFeatured?: boolean;
  status?: string;
  views?: number;
  proposals?: number;
  date?: string;
  sellerUserId?: string;
  whatsappClicks?: number;
  seller?: {
    // Nome exibido no marketplace (pode ser o nome da locadora ou fallback)
    name: string;
    // Nome da empresa (locadora) obtido da tabela carcontrol_companies
    companyName: string;
    // Avaliação da locadora
    rating: number;
    // Indica se a locadora está verificada
    isVerified: boolean;
    // URL da foto/avatar da locadora
    avatar: string;
    // WhatsApp da locadora (opcional)
    whatsapp?: string | null;
  };
  city?: string | null;
  state?: string | null;
  garagem?: boolean;
  tempoPlataforma?: string | null;
  specs?: Array<{ label: string; value: string }>;
};

export type MarketplaceProposal = {
  id: string;
  listing_id: string;
  status: string;
  proposed_start_date: string | null;
  message: string | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_rating: number;
  buyer_experience: string | null;
  created_at: string;
  marketplace_listings?: {
    id: string;
    title: string;
    price: number;
    period: string | null;
    condition_label: string;
    marketplace_listing_images?: Array<{ public_url: string | null; storage_path: string | null }>;
  } | null;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800";
const DEFAULT_AVATAR = "/assets/cabeca.png";

function storageUrl(path?: string | null) {
  if (!path) return null;
  const { data } = supabase.storage.from("marketplace-images").getPublicUrl(path);
  return data.publicUrl;
}

function coverUrl(images?: Array<{ public_url?: string | null; storage_path?: string | null }>) {
  const first = images?.[0];
  return first?.public_url || storageUrl(first?.storage_path) || FALLBACK_IMAGE;
}

function normalizeListing(row: any): MarketplaceProduct {
  const images = (row.marketplace_listing_images || [])
    .map((img: any) => img.public_url || storageUrl(img.storage_path))
    .filter(Boolean);
  const category = row.marketplace_categories?.name || row.category_id || "Marketplace";
  const seller = row.marketplace_seller_profiles;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price || 0),
    period: row.period,
    rating: Number(row.rating || seller?.rating || 5),
    reviews: Number(row.reviews_count || 0),
    image: images[0] || FALLBACK_IMAGE,
    images: images.length ? images : [FALLBACK_IMAGE],
    category,
    categoryId: row.category_id,
    condition: row.condition_label || "Disponivel",
    isFeatured: Boolean(row.is_featured),
    status: row.status,
    views: Number(row.views_count || 0),
    proposals: Number(row.proposals_count || 0),
    date: row.created_at,
    sellerUserId: row.seller_user_id,
    city: row.city || null,
    state: row.state || null,
    garagem: Boolean(row.garagem),
    tempoPlataforma: row.tempo_plataforma || null,
    whatsappClicks: Number(row.metadata?.whatsapp_clicks || 0),
    seller: {
      name: seller?.display_name || "Locadora DashiDrive",
      companyName: seller?.display_name || "",
      // Avaliação da locadora
      rating: Number(seller?.rating || row.rating || 5),
      // Indica se a locadora está verificada
      isVerified: Boolean(seller?.is_verified),
      // URL da foto/avatar da locadora
      avatar: seller?.avatar_url || DEFAULT_AVATAR,
      // WhatsApp da locadora (opcional)
      whatsapp: seller?.whatsapp || null,
    },
    specs: (row.marketplace_listing_specs || []).map((spec: any) => ({
      label: spec.label,
      value: spec.value,
    })),
  };
}

const listingSelect = `
  *,
  marketplace_categories(name),
  marketplace_listing_images(public_url, storage_path, is_cover, sort_order),
  marketplace_listing_specs(label, value, sort_order),
  marketplace_seller_profiles(whatsapp, display_name, rating, is_verified, avatar_url, company_id)
`;

export async function listCategories() {
  const { data, error } = await (supabase as any)
    .from("marketplace_categories")
    .select("id, name");
  if (error) throw error;
  return data as Array<{ id: string; name: string }>;
}

export async function listMarketplaceProducts(filters?: {
  search?: string;
  categoryId?: string | null;
  condition?: string | null;
  maxPrice?: number | null;
  cambio?: string | null;
  combustivel?: string | null;
  arCondicionado?: boolean | null;
  includeOwn?: boolean;
  limit?: number;
  sortBy?: 'featured' | 'newest';
  page?: number;
  pageSize?: number;
  marca?: string;
  modelo?: string;
  city?: string;
  state?: string;
  garagem?: boolean | null;
  tempoPlataforma?: string;
}): Promise<{ products: any[]; total: number }> {
  // Primary query with rich joins
  let query = (supabase as any)
    .from("marketplace_listings")
    .select(listingSelect);

  // Count query for pagination
  let countQuery = (supabase as any)
    .from("marketplace_listings")
    .select("*", { count: "exact", head: true });

  const applyFilters = (q: any) => {
    if (!filters?.includeOwn) q = q.eq("status", "active");
    if (filters?.categoryId) q = q.eq("category_id", filters.categoryId);
    if (filters?.condition) q = q.eq("condition_label", filters.condition);
    if (filters?.maxPrice) q = q.lte("price", filters.maxPrice);

    if (filters?.garagem !== null && filters?.garagem !== undefined) {
      q = q.eq("garagem", filters.garagem);
    }
    if (filters?.tempoPlataforma) {
      q = q.eq("tempo_plataforma", filters.tempoPlataforma);
    }

    if (filters?.search?.trim()) {
      const term = filters.search.trim().split(",").join(" ");
      q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }
    if (filters?.marca?.trim()) {
      q = q.ilike("title", `%${filters.marca.trim()}%`);
    }
    if (filters?.modelo?.trim()) {
      q = q.ilike("title", `%${filters.modelo.trim()}%`);
    }
    if (filters?.city?.trim()) {
      q = q.ilike("city", `%${filters.city.trim()}%`);
    }
    if (filters?.state?.trim()) {
      q = q.eq("state", filters.state.trim());
    }

    return q;
  };

  query = applyFilters(query);
  countQuery = applyFilters(countQuery);

  if (filters?.sortBy === 'newest') {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("is_featured", { ascending: false })
                 .order("created_at", { ascending: false });
  }

  const specFiltersActive = !!filters?.cambio || !!filters?.combustivel || filters?.arCondicionado === true || filters?.arCondicionado === false;

  if (specFiltersActive) {
    let specQuery = (supabase as any).from("marketplace_listing_specs").select("listing_id");

    if (filters?.cambio) specQuery = specQuery.eq("label", "Câmbio").eq("value", filters.cambio);
    if (filters?.combustivel) specQuery = specQuery.eq("label", "Combustível").eq("value", filters.combustivel);
    if (filters?.arCondicionado === true || filters?.arCondicionado === false) specQuery = specQuery.eq("label", "Ar Condicionado").eq("value", filters.arCondicionado ? "Sim" : "Não");

    const { data: specMatches } = await specQuery;
    const listingIds = specMatches?.map((m: any) => m.listing_id) || [];
    query = query.in("id", listingIds);
    countQuery = countQuery.in("id", listingIds);
  }

  const page = filters?.page ?? 0;
  const pageSize = filters?.pageSize ?? 0;

  if (page > 0 && pageSize > 0) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    query = query.range(start, end);
  } else if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const [{ data, error }, countResult] = await Promise.all([
    query,
    page > 0 && pageSize > 0 ? countQuery : Promise.resolve({ count: null }),
  ]);

  // If the rich query fails with a 400, fallback to a simple select to keep the UI functional.
  if (error && error.code === "400") {
    const fallback = await (supabase as any)
      .from("marketplace_listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(filters?.limit ?? 20);
    if (fallback.error) throw fallback.error;
    return { products: fallback.data.map(normalizeListing), total: fallback.data.length };
  }

  if (error) throw error;
  return {
    products: (data || []).map(normalizeListing),
    total: countResult?.count ?? 0,
  };
}

export async function getMarketplaceProduct(id: string) {
  const { data, error } = await (supabase as any)
    .from("marketplace_listings")
    .select(listingSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  await (supabase as any).rpc("marketplace_increment_listing_views", { p_listing_id: id });
  return normalizeListing(data);
}

export async function listMyMarketplaceAds(userId: string) {
  const simpleSelect = `
    *,
    marketplace_categories(name),
    marketplace_listing_images(public_url, storage_path, is_cover, sort_order),
    marketplace_listing_specs(label, value, sort_order)
  `;

  const { data, error } = await (supabase as any)
    .from("marketplace_listings")
    .select(simpleSelect)
    .eq("seller_user_id", userId)
    .order("created_at", { ascending: false });

  // Fallback to a basic select if the complex one triggers a 400.
  if (error && error.code === "400") {
    const fallback = await (supabase as any)
      .from("marketplace_listings")
      .select("*")
      .eq("seller_user_id", userId)
      .order("created_at", { ascending: false });
    if (fallback.error) throw fallback.error;
    return fallback.data.map(normalizeListing);
  }

  if (error) throw error;

  // Attach seller profile separately (avoids 400 if FK relationship doesn't exist yet)
  const enriched = await Promise.all(
    (data || []).map(async (row: any) => {
      let seller = null;
      if (row.company_id) {
        const { data: profile } = await (supabase as any)
          .from("marketplace_seller_profiles")
          .select("whatsapp, display_name, rating, is_verified, avatar_url")
          .eq("company_id", row.company_id)
          .maybeSingle();
        seller = profile;
      }
      return { ...row, marketplace_seller_profiles: seller };
    }),
  );

  return enriched.map(normalizeListing);
}

export async function checkPlanLimit(companyId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  plan: string;
}> {
  const { data: company } = await (supabase as any)
    .from("carcontrol_companies")
    .select("mkt_plan")
    .eq("id", companyId)
    .single();

  const plan = company?.mkt_plan || "FREE";
  const limit = mktListingLimitFor(plan);

  const { count } = await (supabase as any)
    .from("marketplace_listings")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "active");

  const current = count ?? 0;
  return { allowed: current < limit, current, limit, plan };
}

export async function createMarketplaceListing(input: {
  title: string;
  description?: string;
  price: number;
  period?: string | null;
  categoryId: string;
  condition: string;
  files?: File[];
  companyId: string;
  marca: string;
  modelo: string;
  ano: number;
  cambio: "manual" | "automatico";
  ar_condicionado: boolean;
  direcao: "hidraulica" | "eletrica" | "mecanica";
  combustivel: "flex" | "gasolina" | "etanol" | "diesel" | "hibrido" | "eletrico";
  valor_caucao: number;
  garagem: boolean;
  tempo_plataforma: "1+" | "3+" | "5+";
  city?: string;
  state?: string;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Usuario nao autenticado.");

  // TODO(marketplace): limite checado só no cliente e campos do veículo (marca, garagem etc.) não são enviados.
  // Ver planejamento/MARKETPLACE-ESTADO-ATUAL.md, itens 3.3 e 3.4.
  const planCheck = await checkPlanLimit(input.companyId);
  if (!planCheck.allowed) {
    throw new Error(
      `Limite de anúncios ativos atingido (${planCheck.current}/${planCheck.limit}). Seu plano ${planCheck.plan} permite até ${planCheck.limit} anúncio(s).`
    );
  }

  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error("Sessao expirada");

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace-create-listing`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId: input.companyId,
        category_id: input.categoryId,
        title: input.title,
        description: input.description || null,
        price: input.price,
        period: input.period || null,
        condition_label: input.condition,
        city: input.city || null,
        state: input.state || null,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Erro ao criar anuncio");
  }

  const listing = await response.json();

  await (supabase as any).from("marketplace_listing_specs").insert([
    { listing_id: listing.id, label: "Marca", value: input.marca, sort_order: 1 },
    { listing_id: listing.id, label: "Modelo", value: input.modelo, sort_order: 2 },
    { listing_id: listing.id, label: "Ano", value: String(input.ano), sort_order: 3 },
    { listing_id: listing.id, label: "Câmbio", value: input.cambio, sort_order: 4 },
    { listing_id: listing.id, label: "Ar Condicionado", value: input.ar_condicionado ? "Sim" : "Não", sort_order: 5 },
    { listing_id: listing.id, label: "Direção", value: input.direcao, sort_order: 6 },
    { listing_id: listing.id, label: "Combustível", value: input.combustivel, sort_order: 7 },
    { listing_id: listing.id, label: "Caução", value: String(input.valor_caucao), sort_order: 8 },
  ]);

  if (input.files?.length) {
    const rows = [];
    for (const [index, file] of input.files.entries()) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${listing.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("marketplace-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      rows.push({ listing_id: listing.id, storage_path: path, sort_order: index, is_cover: index === 0 });
    }

    const { error: imageError } = await (supabase as any).from("marketplace_listing_images").insert(rows);
    if (imageError) throw imageError;
  }

  return listing.id as string;
}

export async function updateListingStatus(id: string, status: string) {
  const { error } = await (supabase as any)
    .from("marketplace_listings")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function updateMarketplaceListing(
  id: string,
  updates: {
    title?: string;
    description?: string | null;
    price?: number;
    period?: string | null;
    condition_label?: string;
    city?: string | null;
    state?: string | null;
  },
) {
  const { error } = await (supabase as any)
    .from("marketplace_listings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function checkWishlist(listingId: string, userId: string) {
  const { data, error } = await (supabase as any)
    .from("marketplace_wishlist")
    .select("id")
    .eq("listing_id", listingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function toggleWishlist(listingId: string, userId: string) {
  const { data: existing, error: fetchError } = await (supabase as any)
    .from("marketplace_wishlist")
    .select("id")
    .eq("listing_id", listingId)
    .eq("user_id", userId)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (existing?.id) {
    const { error } = await (supabase as any).from("marketplace_wishlist").delete().eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await (supabase as any).from("marketplace_wishlist").insert({ listing_id: listingId, user_id: userId });
  if (error) throw error;
  return true;
}

export async function listWishlist(userId: string) {
  const { data, error } = await (supabase as any)
    .from("marketplace_wishlist")
    .select("id, created_at, marketplace_listings(id, title, price, period, condition_label, marketplace_listing_images(public_url, storage_path))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((item: any) => ({
    id: item.id,
    type: "wishlist",
    listingId: item.marketplace_listings?.id,
    title: item.marketplace_listings?.title || "Anuncio indisponivel",
    price: Number(item.marketplace_listings?.price || 0),
    image: coverUrl(item.marketplace_listings?.marketplace_listing_images),
    status: item.marketplace_listings?.condition_label || "Salvo",
    date: item.created_at?.slice(0, 10),
  }));
}

// TODO(marketplace): nenhuma tela chama esta função ainda (ver MARKETPLACE-ESTADO-ATUAL.md, item 3.1).
export async function createProposal(input: {
  listingId: string;
  buyerName?: string;
  buyerPhone?: string;
  message?: string;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const user = userData.user;
  if (!user) throw new Error("Usuario nao autenticado.");

  const { error } = await (supabase as any).from("marketplace_proposals").insert({
    listing_id: input.listingId,
    buyer_user_id: user.id,
    buyer_name: input.buyerName || user.user_metadata?.full_name || user.email || "Interessado",
    buyer_phone: input.buyerPhone || null,
    message: input.message || "Tenho interesse nesta oferta.",
    proposed_start_date: new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
}

export async function listReceivedProposals(userId: string) {
  const { data, error } = await (supabase as any)
    .from("marketplace_proposals")
    .select("*, marketplace_listings(id, title, price, period, condition_label, marketplace_listing_images(public_url, storage_path))")
    .eq("seller_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as MarketplaceProposal[];
}

export async function listSentProposals(userId: string) {
  const { data, error } = await (supabase as any)
    .from("marketplace_proposals")
    .select("*, marketplace_listings(id, title, price, period, condition_label, marketplace_listing_images(public_url, storage_path))")
    .eq("buyer_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as MarketplaceProposal[];
}

export async function updateProposalStatus(id: string, status: string) {
  const { error } = await (supabase as any)
    .from("marketplace_proposals")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function getSellerProfile(userId: string) {
  const { data, error } = await (supabase as any)
    .from("marketplace_seller_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as {
    id: string;
    display_name: string;
    bio: string | null;
    whatsapp: string | null;
    phone: string | null;
    city: string | null;
    state: string | null;
    avatar_url: string | null;
    company_id: string;
  } | null;
}

export async function upsertSellerProfile(userId: string, companyId: string, updates: {
  display_name?: string;
  bio?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
}) {
  const existing = await getSellerProfile(userId);
  if (existing) {
    const { error } = await (supabase as any)
      .from("marketplace_seller_profiles")
      .update(updates)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await (supabase as any)
      .from("marketplace_seller_profiles")
      .insert({ user_id: userId, company_id: companyId, display_name: updates.display_name || "Locadora", ...updates });
    if (error) throw error;
  }
}

export async function updateCompany(companyId: string, updates: {
  nome?: string;
  cnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  endereco?: string | null;
}) {
  const { error } = await (supabase as any)
    .from("carcontrol_companies")
    .update(updates)
    .eq("id", companyId);
  if (error) throw error;
}

export async function uploadSellerAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `avatars/${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("marketplace-images")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from("marketplace-images")
    .getPublicUrl(path);

  const { error: updateError } = await (supabase as any)
    .from("marketplace_seller_profiles")
    .update({ avatar_url: publicUrl })
    .eq("user_id", userId);
  if (updateError) throw updateError;

  return publicUrl;
}

export async function incrementWhatsappClick(listingId: string) {
  const { error } = await (supabase as any)
    .rpc("record_whatsapp_click", { p_listing_id: listingId });
  if (error) throw error;
}

export type WhatsappClickRecord = {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
  listing_title?: string;
};

export async function listWhatsappClickRecords(companyId: string, limit = 50) {
  const { data, error } = await (supabase as any)
    .from("marketplace_whatsapp_clicks")
    .select("id, listing_id, user_id, created_at, marketplace_listings!inner(title)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id,
    listing_id: row.listing_id,
    user_id: row.user_id,
    created_at: row.created_at,
    listing_title: row.marketplace_listings?.title || "Anuncio",
  })) as WhatsappClickRecord[];
}

export async function getWhatsappClickCountByListing(companyId: string) {
  const { data, error } = await (supabase as any)
    .from("marketplace_whatsapp_clicks")
    .select("listing_id")
    .eq("company_id", companyId);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data || []) {
    counts[row.listing_id] = (counts[row.listing_id] || 0) + 1;
  }
  return counts;
}

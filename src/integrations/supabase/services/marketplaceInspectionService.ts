import { supabase } from "@/integrations/supabase/client";

export async function createInspection(input: {
  listingId: string;
  driverName: string;
  checklistData: Record<string, any>;
  photos: File[];
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Usuário não autenticado.");

  // Upload photos
  const photoUrls: string[] = [];
  for (const file of input.photos) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `inspections/${input.listingId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("marketplace-images")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
        .from("marketplace-images")
        .getPublicUrl(path);
    photoUrls.push(publicUrl);
  }

  // Insert inspection record
  const { data, error } = await (supabase as any)
    .from("marketplace_inspections")
    .insert({
      listing_id: input.listingId,
      driver_name: input.driverName,
      checklist_data: input.checklistData,
      photos: photoUrls,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listInspections(listingId: string) {
  const { data, error } = await (supabase as any)
    .from("marketplace_inspections")
    .select("*")
    .eq("listing_id", listingId)
    .order("inspection_date", { ascending: false });
  if (error) throw error;
  return data;
}

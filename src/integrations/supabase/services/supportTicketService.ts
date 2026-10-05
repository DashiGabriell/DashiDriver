import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'support-tickets';

export const supportTicketService = {
  async uploadImages(files: File[], ticketId: string) {
    const urls: string[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const filePath = `${ticketId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Erro ao fazer upload de imagem do ticket:', uploadError);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      urls.push(publicUrlData.publicUrl);
    }

    return urls;
  },

  async create(input: {
    company_id: string;
    user_id: string;
    subject: string;
    message: string;
    files?: File[];
  }) {
    let imageUrls: string[] = [];

    const { data: ticket, error: insertError } = await supabase
      .from('support_tickets')
      .insert({
        company_id: input.company_id,
        user_id: input.user_id,
        subject: input.subject,
        message: input.message,
        image_urls: [],
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (input.files && input.files.length > 0) {
      imageUrls = await this.uploadImages(input.files, ticket.id);

      if (imageUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('support_tickets')
          .update({ image_urls: imageUrls })
          .eq('id', ticket.id);

        if (updateError) {
          console.error('Erro ao atualizar URLs das imagens no ticket:', updateError);
        }
      }
    }

    return ticket;
  },

  async listByCompany(companyId: string) {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async listAll() {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userIds = [...new Set(data.map((t: any) => t.user_id))];

    if (userIds.length === 0) return data;

    const { data: profiles } = await supabase
      .from('carcontrol_profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.id, { email: p.email, full_name: p.full_name }])
    );

    return data.map((ticket: any) => ({
      ...ticket,
      carcontrol_profiles: profileMap.get(ticket.user_id) || null,
    }));
  },

  async updateStatus(id: string, status: "open" | "in_progress" | "resolved" | "closed") {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: { status?: string; priority?: string }) {
    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

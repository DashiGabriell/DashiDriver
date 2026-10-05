import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listInspections } from "@/integrations/supabase/services/marketplaceInspectionService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const InspectionsListPage = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();

  const { data: inspections, isLoading } = useQuery({
    queryKey: ["inspections", listingId],
    queryFn: () => listInspections(listingId!),
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-2xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-black uppercase tracking-tighter">Vistorias</h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {inspections?.map((insp: any) => (
            <div key={insp.id} className="p-4 rounded-2xl bg-card border shadow-sm">
                <p className="font-bold">{insp.driver_name}</p>
                <p className="text-xs text-muted-foreground">
                    {format(new Date(insp.inspection_date), "dd 'de' MMM 'de' yyyy HH:mm", { locale: ptBR })}
                </p>
                <div className="mt-2 text-sm">
                    {Object.entries(insp.checklist_data as Record<string, any>).map(([key, val]) => (
                        <p key={key}>{key}: {typeof val === 'boolean' ? (val ? '✅' : '❌') : val}</p>
                    ))}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InspectionsListPage;

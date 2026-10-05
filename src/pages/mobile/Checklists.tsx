import { useState } from "react";
import MobileHeader from "@/layouts/mobile/MobileHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Car, User, ClipboardCheck, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useChecklistsList } from "@/hooks/useChecklistsList";
import { getChecklistStatusLabel, getChecklistTypeLabel } from "@/lib/checklist/labels";

const Checklists = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: checklists = [], isLoading } = useChecklistsList();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finalizado":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "em_andamento":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "cancelado":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredChecklists = checklists.filter(
    (item) =>
      (item.vehicle_placa?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.motorista_nome?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.type?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="animate-fade-in pb-24">
      <MobileHeader />

      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Checklists
          </h1>
          <Button
            onClick={() => navigate("/mobile/checklists/novo")}
            size="sm"
            className="gap-2 bg-black text-white neu active:neu-inset"
          >
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa ou motorista..."
              className="pl-9 neu-inset"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="neu">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-4">Carregando vistorias...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChecklists.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-l-4 border-l-primary active:scale-[0.98] transition-transform cursor-pointer neu"
                onClick={() => navigate(`/mobile/checklists/${item.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {getChecklistStatusLabel(item.status)}
                      </Badge>
                      <h3 className="font-bold text-lg mt-1 font-display">
                        {getChecklistTypeLabel(item.type)}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block font-mono">
                        {item.started_at
                          ? format(new Date(item.started_at), "dd/MM/yyyy", { locale: ptBR })
                          : "—"}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mt-1">
                        {item.total_images} fotos
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Car className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold leading-none">
                          Veículo
                        </p>
                        <p className="font-medium font-mono">{item.vehicle_placa || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold leading-none">
                          Motorista
                        </p>
                        <p className="font-medium truncate max-w-[100px]">
                          {item.motorista_nome || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredChecklists.length === 0 && (
              <div className="text-center py-20 neu rounded-2xl">
                <ClipboardCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum checklist encontrado.</p>
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-primary"
                >
                  Limpar busca
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Checklists;

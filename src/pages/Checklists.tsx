import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Eye, Loader2, CheckCircle2, Clock, AlertCircle, FileText, Trash2 } from "lucide-react";
import { fmtDate } from "@/lib/utils";
import { toast } from "sonner";
import { ChecklistItem, useChecklistsList } from "@/hooks/useChecklistsList";
import { useChecklistPDF } from "@/hooks/useChecklistPDF";
import { ChecklistPDFModal } from "@/components/checklist/ChecklistPDFModal";
import { checklistService } from "@/integrations/supabase/services/checklistService";
import { CHECKLIST_STATUS_LABEL, CHECKLIST_TYPE_LABEL } from "@/lib/checklist/labels";

const statusConfig = {
  em_andamento: {
    label: CHECKLIST_STATUS_LABEL.em_andamento,
    color: "bg-blue-500",
    icon: Clock,
  },
  finalizado: {
    label: CHECKLIST_STATUS_LABEL.finalizado,
    color: "bg-green-500",
    icon: CheckCircle2,
  },
  cancelado: {
    label: CHECKLIST_STATUS_LABEL.cancelado,
    color: "bg-red-500",
    icon: AlertCircle,
  },
};

const typeConfig: Record<string, string> = CHECKLIST_TYPE_LABEL;

export default function Checklists() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [checklistToDelete, setChecklistToDelete] = useState<ChecklistItem | null>(null);

  // Buscar checklists
  const { data: checklists = [], isLoading, error: listError } = useChecklistsList();

  // Hook para gerar PDF
  const { generate, share, pdfUrl, isGenerating, error: pdfError, reset } = useChecklistPDF();

  const deleteChecklistMutation = useMutation({
    mutationFn: async (checklistId: string) => {
      await checklistService.remove(checklistId);
    },
    onMutate: async (checklistId) => {
      await queryClient.cancelQueries({ queryKey: ["checklists-list"] });

      const previousChecklists = queryClient.getQueriesData<ChecklistItem[]>({
        queryKey: ["checklists-list"],
      });

      queryClient.setQueriesData<ChecklistItem[]>(
        { queryKey: ["checklists-list"] },
        (old) => old?.filter((checklist) => checklist.checklist_id !== checklistId)
      );

      return { previousChecklists };
    },
    onSuccess: () => {
      toast.success("Checklist excluido com sucesso.");
      setChecklistToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["checklists-list"] });
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
      queryClient.invalidateQueries({ queryKey: ["checklists-count"] });
    },
    onError: (error, _checklistId, context) => {
      context?.previousChecklists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });

      toast.error("Erro ao excluir checklist. Tente novamente.");
    },
  });

  // Filtrar checklists
  const filteredChecklists = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return checklists.filter((checklist) => {
      const matchesSearch =
        (checklist.vehicle_placa ?? "").toLowerCase().includes(normalizedSearch) ||
        (checklist.vehicle_modelo ?? "").toLowerCase().includes(normalizedSearch) ||
        (checklist.driver_name ?? "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || checklist.status === statusFilter;

      const matchesType =
        typeFilter === "all" || checklist.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [checklists, searchTerm, statusFilter, typeFilter]);

  const handleNewChecklist = () => {
    navigate("/checklists/novo");
  };

  const handleViewChecklist = (checklistId: string) => {
    navigate(`/checklists/${checklistId}`);
  };

  const handleViewPdf = async (checklistId: string) => {
    setSelectedChecklistId(checklistId);
    setShowPdfModal(true);
    await generate(checklistId);
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setSelectedChecklistId(null);
    reset();
  };

  const handleDownloadPdf = () => {
    if (pdfUrl && selectedChecklistId) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `checklist-${selectedChecklistId}.pdf`;
      link.click();
    }
  };

  const handleSharePdf = async () => {
    if (selectedChecklistId) {
      await share(selectedChecklistId);
    }
  };

  const handleDeleteChecklist = () => {
    if (checklistToDelete) {
      deleteChecklistMutation.mutate(checklistToDelete.checklist_id);
    }
  };

  if (listError) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Checklists</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciar vistorias de veículos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/ajuda/gestao/checklists")}
              className="neu-sm h-8 w-8 grid place-items-center rounded-full text-muted-foreground/50 hover:text-foreground transition-all"
              title="Ajuda"
            >
              <img src="/assets/question.png" alt="Ajuda" className="w-4 h-4" />
            </button>
            <Button onClick={handleNewChecklist} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Checklist
            </Button>
          </div>
        </div>

        <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="pt-6">
              <p className="text-red-600">
                Erro ao carregar checklists. Tente novamente.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Checklists</h1>
            <p className="text-muted-foreground mt-1">
              Gerenciar vistorias de veículos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/ajuda/gestao/checklists")}
              className="neu-sm h-8 w-8 grid place-items-center rounded-full text-muted-foreground/50 hover:text-foreground transition-all"
              title="Ajuda"
            >
              <img src="/assets/question.png" alt="Ajuda" className="w-4 h-4" />
            </button>
            <Button onClick={handleNewChecklist} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Checklist
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por placa, modelo ou motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro de Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro de Tipo */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
                  <SelectItem value="devolucao">Devolução</SelectItem>
                  <SelectItem value="avaria">Avaria</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="semanal_automatizada">Vistoria Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Checklists */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredChecklists.length} checklist
              {filteredChecklists.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredChecklists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum checklist encontrado
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Motorista</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Fotos</TableHead>
                      <TableHead>Iniciado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChecklists.map((checklist) => {
                      const statusInfo =
                        statusConfig[
                          checklist.status as keyof typeof statusConfig
                        ];
                      const typeLabel =
                        typeConfig[checklist.type as keyof typeof typeConfig];

                      /*
                      // Link para o motorista
                      const whatsappLink = `https://wa.me/?text=Olá! Por favor, realize a vistoria do veículo através deste link: ${window.location.origin}/marketplace/inspection/${checklist.listing_id}`;
                      */

                      return (
                        <TableRow key={checklist.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold">
                                {checklist.vehicle_modelo || "Veiculo sem modelo"}
                              </p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {checklist.vehicle_placa || "Sem placa"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{checklist.driver_name || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{typeLabel}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${statusInfo?.color} text-white`}
                            >
                              {statusInfo?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">
                              {checklist.total_images}
                            </span>
                          </TableCell>
                          <TableCell>
                            {fmtDate(checklist.started_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {/*
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(whatsappLink, '_blank')}
                                className="gap-2"
                              >
                                Enviar Link WhatsApp
                              </Button>
                              */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewChecklist(checklist.checklist_id)
                                }
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Ver
                              </Button>
                              {checklist.status === "finalizado" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleViewPdf(checklist.checklist_id)
                                  }
                                  className="gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  PDF
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setChecklistToDelete(checklist)}
                                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Visualização de PDF */}
      <ChecklistPDFModal
        open={showPdfModal}
        onOpenChange={handleClosePdfModal}
        checklistId={selectedChecklistId}
        pdfUrl={pdfUrl}
        isGenerating={isGenerating}
        error={pdfError}
        onGenerate={async () => {
          if (selectedChecklistId) {
            await generate(selectedChecklistId);
          }
        }}
        onDownload={handleDownloadPdf}
        onShare={handleSharePdf}
      />

      <AlertDialog
        open={!!checklistToDelete}
        onOpenChange={(open) => {
          if (!open && !deleteChecklistMutation.isPending) {
            setChecklistToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Excluir checklist?</AlertDialogTitle>
          <AlertDialogDescription>
            Nao sera possivel recuperar este checklist depois da exclusao. Esta acao remove o registro do banco de dados imediatamente.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={deleteChecklistMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChecklist}
              disabled={deleteChecklistMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteChecklistMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

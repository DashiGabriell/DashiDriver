import { DevPageContainer } from "@/components/dev/DevPageContainer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useFeatureFlags,
  useToggleFeatureFlag,
  useCreateFeatureFlag,
  useUpdateFeatureFlag,
  useDeleteFeatureFlag,
  type FeatureFlag,
} from "@/hooks/dev/useFeatureFlags";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

function FlagRow({
  flag,
  onToggle,
  onEdit,
  onDelete,
  isToggling,
  isDeleting,
}: {
  flag: FeatureFlag;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  return (
    <TableRow>
      <TableCell>
        <code className="text-sm font-mono bg-zinc-800 px-2 py-0.5 rounded">
          {flag.key}
        </code>
      </TableCell>
      <TableCell className="text-zinc-400 max-w-xs truncate">
        {flag.description || "—"}
      </TableCell>
      <TableCell>
        <Badge variant={flag.enabled ? "default" : "secondary"}>
          {flag.enabled ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      <TableCell className="text-zinc-400 text-xs">
        {formatDate(flag.updated_at || flag.created_at)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={flag.enabled ? "destructive" : "default"}
            onClick={onToggle}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : flag.enabled ? (
              "Desativar"
            ) : (
              "Ativar"
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3 text-red-400" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function NewFlagForm({
  onSubmit,
  isCreating,
}: {
  onSubmit: (key: string, description: string) => void;
  isCreating: boolean;
}) {
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    onSubmit(key.trim(), description.trim());
    setKey("");
    setDescription("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
    >
      <div className="flex-1">
        <label className="block text-xs text-zinc-400 mb-1">Key</label>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          placeholder="nova-feature"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
        />
      </div>
      <div className="flex-[2]">
        <label className="block text-xs text-zinc-400 mb-1">Descrição</label>
        <input
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          placeholder="Descrição da feature flag"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isCreating || !key.trim()}>
        {isCreating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Plus className="h-4 w-4 mr-1" />
        )}
        Criar
      </Button>
    </form>
  );
}

function EditFlagDialog({
  flag,
  onSave,
  onClose,
}: {
  flag: FeatureFlag;
  onSave: (key: string, description: string) => void;
  onClose: () => void;
}) {
  const [key, setKey] = useState(flag.key);
  const [description, setDescription] = useState(flag.description);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-white mb-4">
          Editar Feature Flag
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Key</label>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Descrição
            </label>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={() => onSave(key, description)}>Salvar</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const { data: flags, isLoading, error } = useFeatureFlags();
  const toggleMutation = useToggleFeatureFlag();
  const createMutation = useCreateFeatureFlag();
  const updateMutation = useUpdateFeatureFlag();
  const deleteMutation = useDeleteFeatureFlag();

  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  if (error) {
    return (
      <DevPageContainer title="Feature Flags">
        <p className="text-red-500">
          Erro ao carregar feature flags: {(error as Error).message}
        </p>
        <p className="text-zinc-400 text-sm mt-2">
          Certifique-se de que a tabela <code>feature_flags</code> existe no
          banco. Execute o script em{" "}
          <code>supabase/migrations/20260615000001_create_feature_flags.sql</code>
        </p>
      </DevPageContainer>
    );
  }

  return (
    <DevPageContainer title="Feature Flags">
      <div className="space-y-6">
        <div>
          <p className="text-zinc-400 text-sm mb-4">
            Ative ou desative funcionalidades globalmente na plataforma.
          </p>
          <NewFlagForm
            onSubmit={(key, description) =>
              createMutation.mutate({ key, description })
            }
            isCreating={createMutation.isPending}
          />
        </div>

        {isLoading ? (
          <p className="text-zinc-400">Carregando feature flags...</p>
        ) : !flags || flags.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            Nenhuma feature flag cadastrada. Crie uma acima.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizada em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => (
                <FlagRow
                  key={flag.id}
                  flag={flag}
                  onToggle={() =>
                    toggleMutation.mutate({
                      id: flag.id,
                      enabled: !flag.enabled,
                    })
                  }
                  onEdit={() => setEditingFlag(flag)}
                  onDelete={() => deleteMutation.mutate(flag.id)}
                  isToggling={toggleMutation.isPending}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </TableBody>
          </Table>
        )}

        {editingFlag && (
          <EditFlagDialog
            flag={editingFlag}
            onSave={(key, description) => {
              updateMutation.mutate({
                id: editingFlag.id,
                key,
                description,
              });
              setEditingFlag(null);
            }}
            onClose={() => setEditingFlag(null)}
          />
        )}
      </div>
    </DevPageContainer>
  );
}

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Topbar } from "@/components/layout/Topbar";
import {
  useCompanyUsers, useUpdateUserRole, useRemoveUserFromCompany,
  useCompanyUsersStats, useCompanyInvites, useCheckUserSlot,
  useInviteUser, useCancelInvite,
} from "@/hooks/useCompanyUsers";
import { useAuth } from "@/integrations/supabase/auth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, Users, Shield, UserCog, Trash2, Crown, User,
  Plus, Copy, CheckCircle2, XCircle, Link, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { fmtDate } from "@/lib/utils";

const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useCompanyUsers();
  const { data: profile } = useProfile();
  const stats = useCompanyUsersStats();
  const { data: slotInfo } = useCheckUserSlot();
  const { data: pendingInvites = [] } = useCompanyInvites();
  const updateRole = useUpdateUserRole();
  const removeUser = useRemoveUserFromCompany();
  const inviteUser = useInviteUser();
  const cancelInvite = useCancelInvite();

  const [userToRemove, setUserToRemove] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteNome, setInviteNome] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"user" | "admin">("user");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const currentUserProfile = users.find((u) => u.id === currentUser?.id);
  const isAdmin = currentUserProfile?.role === "admin" || currentUserProfile?.role === "dev";
  const isDev = currentUserProfile?.role === "dev";

  const slotAvailable = slotInfo?.available ?? false;
  const slotTotal = slotInfo?.max ?? 0;
  const slotRemaining = slotInfo?.remaining ?? 0;
  const slotHasPlan = slotInfo?.has_plan ?? false;
  const slotCurrentCount = slotInfo?.total ?? users.length;

  const canInvite = isAdmin && slotAvailable && slotHasPlan;

  const handleRoleChange = async (userId: string, newRole: "user" | "admin" | "dev") => {
    try {
      await updateRole.mutateAsync({ userId, newRole });
      toast.success("Role atualizada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar role");
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    try {
      await removeUser.mutateAsync(userToRemove);
      toast.success("Usuário removido da empresa");
      setUserToRemove(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover usuário");
    }
  };

  const handleInvite = async () => {
    if (!inviteNome.trim() || !inviteEmail.trim()) {
      toast.error("Preencha nome e email do convidado");
      return;
    }
    try {
      const result = await inviteUser.mutateAsync({
        nome: inviteNome.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      const link = `${window.location.origin}/aceitar-convite?token=${result.token}`;
      setInviteOpen(false);
      setInviteNome("");
      setInviteEmail("");
      setInviteRole("user");
      toast.success("Convite criado com sucesso!");
      navigator.clipboard.writeText(link).then(() => {
        toast.success("Link copiado para a área de transferência");
      }).catch(() => {
        setCopiedToken(result.token);
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar convite");
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite.mutateAsync(inviteId);
      toast.success("Convite cancelado");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar convite");
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/aceitar-convite?token=${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
      toast.success("Link copiado!");
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "dev":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <UserCog className="w-3 h-3 mr-1" />
            Dev
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-border/50 text-muted-foreground">
            <User className="w-3 h-3 mr-1" />
            Usuário
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Topbar
        title="Gerenciamento de Usuários"
        subtitle="Gerencie os usuários da sua empresa"
        helpPath="/ajuda/gestao/usuarios"
      />

      {/* Indicador de vagas (apenas admin) */}
      {isAdmin && slotTotal > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">
                  {slotRemaining === -1
                    ? "Usuários ilimitados"
                    : `${slotRemaining} ${slotRemaining === 1 ? "vaga disponível" : "vagas disponíveis"}`
                  }
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {slotCurrentCount}{slotRemaining !== -1 && slotTotal > 0 ? ` / ${slotTotal}` : ""} usuários
              </span>
            </div>
            {slotRemaining !== -1 && slotTotal > 0 && (
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((slotCurrentCount / slotTotal) * 100, 100)}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Aviso de plano para admin sem plano ativo */}
      {isAdmin && !slotHasPlan && (
        <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-500">Plano necessário</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Faça um upgrade do seu plano para convidar outros usuários para sua empresa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Usuários</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Administradores</CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.admins}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Usuários Regulares</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.regularUsers}</CardTitle>
          </CardHeader>
        </Card>
        {isDev && (
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Desenvolvedores</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.devs}</CardTitle>
            </CardHeader>
          </Card>
        )}
      </section>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuários da Empresa
              </CardTitle>
              <CardDescription className="mt-1">
                {isAdmin
                  ? "Você pode alterar e remover usuários"
                  : "Visualização dos usuários da empresa"}
              </CardDescription>
            </div>

            {isAdmin && canInvite && (
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Convidar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Convidar Usuário</DialogTitle>
                    <DialogDescription>
                      Envie um convite para um novo usuário entrar na sua empresa.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do convidado</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: João Silva"
                        value={inviteNome}
                        onChange={(e) => setInviteNome(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email do convidado</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ex: joao@email.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Cargo</Label>
                      <Select
                        value={inviteRole}
                        onValueChange={(v: "user" | "admin") => setInviteRole(v)}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleInvite} disabled={inviteUser.isPending}>
                      {inviteUser.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {inviteUser.isPending ? "Criando..." : "Criar convite"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || user.email}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            {(user.full_name || user.email).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {user.full_name || "Sem nome"}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">Você</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Membro desde {fmtDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block">{getRoleBadge(user.role)}</div>
                      {isAdmin && !isCurrentUser && (
                        <Select
                          value={user.role}
                          onValueChange={(value: "user" | "admin" | "dev") =>
                            handleRoleChange(user.id, value)
                          }
                          disabled={updateRole.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            {isDev && <SelectItem value="dev">Dev</SelectItem>}
                          </SelectContent>
                        </Select>
                      )}
                      {!isAdmin && (
                        <div className="w-32">{getRoleBadge(user.role)}</div>
                      )}
                      {isAdmin && !isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setUserToRemove(user.id)}
                          disabled={removeUser.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convites Pendentes */}
      {isAdmin && pendingInvites.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Link className="w-4 h-4" />
              Convites Pendentes
            </CardTitle>
            <CardDescription>
              {pendingInvites.length} {pendingInvites.length === 1 ? "convite aguardando" : "convites aguardando"} aceite
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvites.map((invite: any) => {
              const link = `${window.location.origin}/aceitar-convite?token=${invite.token}`;
              return (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{invite.nome}</p>
                    <p className="text-sm text-muted-foreground truncate">{invite.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {invite.role === "admin" ? "Admin" : "Usuário"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        Convidado em {fmtDate(invite.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => handleCopyLink(invite.token)}
                    >
                      {copiedToken === invite.token ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Link
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleCancelInvite(invite.id)}
                      disabled={cancelInvite.isPending}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Dialog de Confirmação de Remoção */}
      <AlertDialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este usuário da empresa? Ele perderá acesso a todos os
              dados e não poderá mais fazer login no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeUser.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removendo...</>
              ) : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Aviso para não-admins */}
      {!isAdmin && (
        <Card className="mt-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-500">Permissões Limitadas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Você está visualizando os usuários da empresa. Apenas administradores podem
                  alterar roles e remover usuários.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
};

export default Usuarios;

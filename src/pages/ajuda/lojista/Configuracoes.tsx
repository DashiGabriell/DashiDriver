import {
  Settings,
  Bell,
  Shield,
  Lock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  ToggleLeft,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Configurações",
    descricao: "No menu do lojista, clique em 'Configurações' ou navegue pela rota /lojista/configuracoes. A página exibe opções de personalização da conta.",
    icone: <Settings className="w-5 h-5" />,
  },
  {
    titulo: "Notificações",
    descricao: "Configure quais notificações deseja receber: novas oportunidades, propostas recebidas, alterações em anúncios e comunicados do sistema. Personalize por email e push.",
    icone: <Bell className="w-5 h-5" />,
  },
  {
    titulo: "Privacidade do perfil",
    descricao: "Defina a visibilidade das suas informações no marketplace. Escolha se telefone e email aparecem publicamente ou apenas para usuários logados.",
    icone: <Eye className="w-5 h-5" />,
  },
  {
    titulo: "Segurança",
    descricao: "Altere sua senha, configure autenticação de dois fatores (2FA) e veja o histórico de login da sua conta.",
    icone: <Lock className="w-5 h-5" />,
  },
  {
    titulo: "Preferências regionais",
    descricao: "Configure moeda, formato de data e idioma preferidos. As preferências são aplicadas a todo o portal do lojista.",
    icone: <Globe className="w-5 h-5" />,
  },
  {
    titulo: "Salvando preferências",
    descricao: "Clique em 'Salvar' após fazer alterações. As configurações são aplicadas imediatamente à sua conta.",
    icone: <ToggleLeft className="w-5 h-5" />,
  },
];

const dicas = [
  "Ative as notificações de novas oportunidades para não perder leads importantes.",
  "Use autenticação de dois fatores para aumentar a segurança da sua conta.",
  "Revise as configurações de privacidade se não quiser que seu contato seja público.",
  "Configure o idioma para português se preferir a interface nesse idioma.",
  "Mantenha a senha forte e atualize regularmente para proteger sua conta.",
];

const AjudaConfiguracoes = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/lojista" className="hover:text-foreground transition-colors">Lojista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Configurações</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-cyan-500" />
          Configurações
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Personalize sua experiência no portal do lojista com notificações, segurança, privacidade e preferências regionais.
        </p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-cyan-500" />
            Visão Geral
          </h2>
          <div className="neu p-6 bg-card border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A página de Configurações permite personalizar sua experiência no portal. Controle notificações, segurança da conta, privacidade dos dados e preferências de região e idioma.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-cyan-500" />
            Passo a Passo
          </h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="neu p-5 bg-card border flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 grid place-items-center text-cyan-500 shrink-0 mt-0.5">
                  {step.icone}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-cyan-500 uppercase tracking-widest">Passo {index + 1}</span>
                  </div>
                  <h3 className="font-display text-base font-bold mb-1">{step.titulo}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Dicas Importantes
          </h2>
          <div className="neu p-6 bg-card border">
            <ul className="space-y-3">
              {dicas.map((dica, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                  {dica}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AjudaConfiguracoes;

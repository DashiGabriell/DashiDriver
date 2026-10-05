import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Phone,
  FileText,
  BadgeCheck,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Motoristas",
    descricao: "No bottom nav, toque em 'Frota' e depois na aba 'Motoristas', ou navegue para /mobile/motoristas.",
    icone: <Users className="w-5 h-5" />,
  },
  {
    titulo: "Buscando motoristas",
    descricao: "Use o campo de busca para localizar motoristas por nome ou CPF. A busca é feita em tempo real enquanto você digita.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Entendendo os status",
    descricao: "Cada motorista possui um badge de status: Ativo (verde), Inativo (cinza) ou Suspenso (vermelho). Isso ajuda a identificar rapidamente a situação.",
    icone: <BadgeCheck className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando informações",
    descricao: "O card exibe nome, CPF, telefone, categoria e validade da CNH. Toque no card para ver detalhes completos.",
    icone: <FileText className="w-5 h-5" />,
  },
  {
    titulo: "Acessando detalhes",
    descricao: "Toque em um card para acessar a página de detalhes com perfil, financeiro, documentos e pagamentos recentes.",
    icone: <ArrowRight className="w-5 h-5" />,
  },
];

const dicas = [
  "Mantenha a CNH dos motoristas sempre atualizada para evitar multas.",
  "Use a busca por CPF para localizar motoristas rapidamente.",
  "Verifique o status antes de vincular um motorista a um veículo.",
  "Acesse os detalhes para ver o resumo financeiro do motorista.",
  "Motoristas com status 'Suspenso' não podem realizar novas locações.",
];

const AjudaMotoristas = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/motorista" className="hover:text-foreground transition-colors">Motorista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Motoristas</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Users className="w-8 h-8 text-cyan-500" />
          Motoristas
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie a lista de motoristas com busca, status visual e acesso rápido a detalhes e documentos.
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
              A página de Motoristas lista todos os motoristas cadastrados com busca por nome ou CPF, status visual e acesso rápido aos detalhes de cada um.
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

export default AjudaMotoristas;

import {
  Wrench,
  Plus,
  Search,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Calendar,
  DollarSign,
  Camera,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Manutenção",
    descricao: "No menu lateral, clique em 'Manutenção' ou navegue pela rota /manutencao. A tela exibe o histórico completo de manutenções da frota.",
    icone: <Wrench className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando manutenções",
    descricao: "Cada registro mostra veículo, tipo de manutenção (preventiva, corretiva ou revisão), data agendada, valor e status. Use os filtros para refinar a busca.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Agendando nova manutenção",
    descricao: "Clique em 'Nova Manutenção' para agendar. Selecione o veículo, tipo, descreva o serviço necessário, informe a data agendada, quilometragem e valor estimado.",
    icone: <Plus className="w-5 h-5" />,
  },
  {
    titulo: "Registrando manutenção corretiva",
    descricao: "Para manutenções corretivas não programadas, registre o problema encontrado, as peças substituídas e o custo total. Fotos ajudam a documentar o serviço realizado.",
    icone: <Wrench className="w-5 h-5" />,
  },
  {
    titulo: "Anexando fotos e notas",
    descricao: "Ao finalizar uma manutenção, anexe fotos do serviço realizado e notas fiscais. Isso cria um histórico completo para consulta e garantia.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Controlando custos",
    descricao: "Cada manutenção registra o valor gasto, permitindo acompanhar os custos por veículo ao longo do tempo. Essencial para decidir sobre a renovação da frota.",
    icone: <DollarSign className="w-5 h-5" />,
  },
  {
    titulo: "Acompanhando preventivas",
    descricao: "Use as manutenções preventivas programadas para evitar falhas. O sistema pode alertar quando um veículo estiver próximo da quilometragem de revisão.",
    icone: <Calendar className="w-5 h-5" />,
  },
];

const dicas = [
  "Agende preventivas com base na quilometragem de cada veículo para evitar quebras inesperadas.",
  "Anexe sempre a nota fiscal do serviço para manter o histórico fiscal organizado.",
  "Compare os custos de manutenção entre veículos similares para identificar unidades problemáticas.",
  "Registre fotos do antes e depois para comprovar os serviços realizados.",
  "Manutenções preventivas regulares aumentam a vida útil dos veículos e o valor de revenda.",
];

const AjudaManutencao = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/gestao" className="hover:text-foreground transition-colors">Gestão</a>
          <span>/</span>
          <span className="text-foreground font-medium">Manutenção</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Wrench className="w-8 h-8 text-blue-600" />
          Manutenção
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie manutenções preventivas e corretivas da frota com agendamento, controle de custos e histórico detalhado por veículo.
        </p>
      </header>

      <div className="space-y-12">
        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Visão Geral
          </h2>
          <div className="neu p-6 bg-card border">
            <p className="text-sm text-muted-foreground leading-relaxed">
              O módulo de Manutenção permite agendar e acompanhar todos os serviços realizados nos veículos da frota. Diferencie manutenções preventivas (programadas) de corretivas (emergenciais), controle custos por veículo e mantenha um histórico completo para tomada de decisões.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Preventiva", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Corretiva", cor: "bg-destructive/10 text-destructive" },
                { label: "Revisão", cor: "bg-yellow/10 text-yellow" },
                { label: "Agendada", cor: "bg-muted text-muted-foreground" },
                { label: "Concluída", cor: "bg-success/10 text-success" },
              ].map((item) => (
                <div key={item.label} className={`${item.cor} rounded-xl px-4 py-3`}>
                  <div className="text-xs font-bold uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-600" />
            Passo a Passo
          </h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="neu p-5 bg-card border flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 grid place-items-center text-blue-600 shrink-0 mt-0.5">
                  {step.icone}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Passo {index + 1}</span>
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

export default AjudaManutencao;

import {
  Package,
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Meu Estoque",
    descricao: "No menu do lojista, clique em 'Meu Estoque' ou navegue pela rota /lojista/estoque. A tela exibe todos os veículos cadastrados para venda.",
    icone: <Package className="w-5 h-5" />,
  },
  {
    titulo: "Visualizando a listagem",
    descricao: "A tabela exibe foto, modelo, ano, quilometragem, preço, cidade e status de cada veículo. A barra de busca permite localizar rapidamente.",
    icone: <Search className="w-5 h-5" />,
  },
  {
    titulo: "Entendendo os status",
    descricao: "Cada veículo possui um status: Disponível (verde), Vendido (azul) ou Reservado (amarelo). O status determina se o veículo aparece nas buscas do marketplace.",
    icone: <BadgeCheck className="w-5 h-5" />,
  },
  {
    titulo: "Adicionando novo veículo",
    descricao: "Clique em 'Adicionar Veículo' para cadastrar um novo item no estoque. Você será redirecionado ao formulário de cadastro completo.",
    icone: <Plus className="w-5 h-5" />,
  },
  {
    titulo: "Ações rápidas",
    descricao: "Cada linha da tabela possui botões de ação: editar informações, visualizar detalhes ou remover do estoque. As ações são rápidas e intuitivas.",
    icone: <Edit3 className="w-5 h-5" />,
  },
  {
    titulo: "Gerenciando o estoque",
    descricao: "Mantenha o estoque sempre atualizado. Veículos vendidos devem ter o status alterado para 'Vendido' para não aparecerem mais nas buscas.",
    icone: <Trash2 className="w-5 h-5" />,
  },
];

const dicas = [
  "Atualize o status dos veículos imediatamente após uma venda para evitar leads duplicados.",
  "Veículos com fotos de qualidade geram até 3x mais visualizações.",
  "Mantenha o preço competitivo pesquisando veículos similares no marketplace.",
  "Adicione o máximo de informações possível para aumentar a confiança do comprador.",
  "Revise o estoque semanalmente para garantir que todos os dados estão corretos.",
];

const AjudaEstoque = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/lojista" className="hover:text-foreground transition-colors">Lojista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Meu Estoque</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Package className="w-8 h-8 text-cyan-500" />
          Meu Estoque
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie o estoque de veículos do seu negócio com listagem completa, status e ações rápidas.
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
              O Meu Estoque é o centro de controle dos veículos que você oferece no marketplace. Aqui você cadastra, edita e gerencia o ciclo de vida de cada anúncio.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Disponível", cor: "bg-success/10 text-success" },
                { label: "Vendido", cor: "bg-blue-500/10 text-blue-600" },
                { label: "Reservado", cor: "bg-yellow/10 text-yellow" },
              ].map((status) => (
                <div key={status.label} className={`${status.cor} rounded-xl px-4 py-3`}>
                  <div className="text-xs font-bold uppercase tracking-wider">{status.label}</div>
                </div>
              ))}
            </div>
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

export default AjudaEstoque;

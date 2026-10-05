import {
  User,
  Camera,
  Mail,
  Phone,
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Perfil",
    descricao: "No bottom nav, clique em 'Perfil' ou navegue para /marketplace/profile. A página exibe seus dados de vendedor.",
    icone: <User className="w-5 h-5" />,
  },
  {
    titulo: "Dados do vendedor",
    descricao: "Visualize e edite seu nome, foto, telefone e email. Estas informações são exibidas nos seus anúncios.",
    icone: <Mail className="w-5 h-5" />,
  },
  {
    titulo: "Foto de perfil",
    descricao: "Faça upload de uma foto ou logotipo. Uma boa foto de perfil transmite credibilidade aos compradores.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Avaliações",
    descricao: "Veja as avaliações que você recebeu de compradores. A reputação é importante para gerar confiança no marketplace.",
    icone: <Star className="w-5 h-5" />,
  },
  {
    titulo: "Salvando alterações",
    descricao: "Após editar, clique em 'Salvar' para aplicar as alterações. Os dados atualizados refletem imediatamente nos seus anúncios.",
    icone: <Save className="w-5 h-5" />,
  },
];

const dicas = [
  "Use uma foto profissional ou o logotipo da sua empresa como foto de perfil.",
  "Mantenha telefone e email atualizados para não perder contato com compradores.",
  "Boas avaliações aumentam a confiança e aceleram as vendas.",
  "Um perfil completo e bem preenchido gera mais credibilidade no marketplace.",
  "Responda avaliações recebidas para mostrar que você se importa com a experiência do comprador.",
];

const AjudaPerfil = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
          <span>/</span>
          <span className="text-foreground font-medium">Perfil</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-cyan-500" />
          Perfil
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie suas informações de vendedor, foto de perfil e acompanhe suas avaliações no marketplace.
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
              O Perfil do vendedor reúne suas informações de contato, foto e avaliações. Manter o perfil completo e atualizado transmite confiança e profissionalismo aos compradores.
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

export default AjudaPerfil;

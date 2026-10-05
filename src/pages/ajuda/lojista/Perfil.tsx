import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Perfil",
    descricao: "No menu do lojista, clique em 'Perfil' ou navegue pela rota /lojista/perfil. A página exibe seus dados cadastrais.",
    icone: <User className="w-5 h-5" />,
  },
  {
    titulo: "Dados da loja",
    descricao: "Edite as informações da sua loja: nome fantasia, razão social, CNPJ, endereço completo e telefone de contato.",
    icone: <MapPin className="w-5 h-5" />,
  },
  {
    titulo: "Informações de contato",
    descricao: "Mantenha email e telefone atualizados. Estes dados são usados para contato de compradores interessados nos seus veículos.",
    icone: <Mail className="w-5 h-5" />,
  },
  {
    titulo: "Foto do perfil",
    descricao: "Faça upload de uma foto ou logotipo da sua loja. A imagem aparece nos anúncios e no perfil público do lojista.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Salvando alterações",
    descricao: "Após editar os dados, clique em 'Salvar' para aplicar as alterações. Os dados atualizados refletem imediatamente nos anúncios.",
    icone: <Save className="w-5 h-5" />,
  },
];

const dicas = [
  "Mantenha os dados da loja sempre atualizados para passar credibilidade aos compradores.",
  "Use o logotipo da sua loja como foto de perfil para fortalecer sua marca.",
  "Verifique se o telefone e email estão corretos — é por eles que os compradores entram em contato.",
  "Um perfil completo e bem preenchido gera mais confiança no marketplace.",
  "Atualize o endereço da loja sempre que houver mudança de localização.",
];

const AjudaPerfil = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/lojista" className="hover:text-foreground transition-colors">Lojista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Perfil</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-cyan-500" />
          Perfil
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie as informações da sua loja, dados de contato e foto do perfil para manter seus dados sempre atualizados.
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
              A página de Perfil permite gerenciar todos os dados da sua loja. Informações atualizadas geram mais confiança nos compradores e melhoram sua reputação no marketplace.
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

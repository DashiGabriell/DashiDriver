import {
  User,
  Camera,
  Settings,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Smartphone,
  Save,
  Shield,
} from "lucide-react";

const steps = [
  {
    titulo: "Acessando Perfil",
    descricao: "No bottom nav, toque em 'Perfil' ou navegue para /mobile/perfil. Suas informações pessoais serão exibidas.",
    icone: <User className="w-5 h-5" />,
  },
  {
    titulo: "Editando dados pessoais",
    descricao: "Toque em 'Editar' para alterar nome, email, telefone e outros dados cadastrais.",
    icone: <Settings className="w-5 h-5" />,
  },
  {
    titulo: "Alterando foto",
    descricao: "Toque na foto de perfil para alterá-la. Você pode tirar uma foto ou selecionar da galeria.",
    icone: <Camera className="w-5 h-5" />,
  },
  {
    titulo: "Preferências do app",
    descricao: "Configure notificações, tema (claro/escuro), idioma e outras preferências do aplicativo.",
    icone: <Smartphone className="w-5 h-5" />,
  },
  {
    titulo: "Segurança",
    descricao: "Altere sua senha e configure a autenticação biométrica (digital ou facial) para acesso rápido e seguro.",
    icone: <Shield className="w-5 h-5" />,
  },
  {
    titulo: "Salvando alterações",
    descricao: "Após editar, toque em 'Salvar' para aplicar as alterações. Os dados são atualizados imediatamente.",
    icone: <Save className="w-5 h-5" />,
  },
];

const dicas = [
  "Use a autenticação biométrica para acesso rápido e seguro ao app.",
  "Mantenha seu email e telefone atualizados para receber notificações.",
  "Configure o tema escuro para economizar bateria em dispositivos OLED.",
  "Altere a senha regularmente para manter sua conta segura.",
  "As preferências são sincronizadas entre dispositivos.",
];

const AjudaPerfil = () => {
  return (
    <div>
      <header className="mb-8 animate-blur-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <a href="/ajuda/motorista" className="hover:text-foreground transition-colors">Motorista</a>
          <span>/</span>
          <span className="text-foreground font-medium">Perfil</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-cyan-500" />
          Perfil
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Gerencie suas informações pessoais, foto, preferências do aplicativo e segurança da conta.
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
              A página de Perfil permite gerenciar todos os seus dados pessoais, foto, preferências do aplicativo e configurações de segurança como senha e biometria.
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

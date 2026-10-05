import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import DisplayCards from "@/components/ui/display-cards";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validators/login";
import { setRememberMe } from "@/lib/rememberMe";
import { authService } from "@/integrations/supabase/services/authService";
import { getErrorMessage } from "@/integrations/supabase/services/errors";
import { z } from "zod";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [rememberMe, setRememberMeChecked] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  type FormValues = LoginInput & RegisterInput;
  const form = useForm<FormValues>({
    resolver: async (data, context, options) => {
      if (isRegistering) {
        return zodResolver(registerSchema)(data, context, options);
      }
      return zodResolver(loginSchema)(data, context, options);
    },
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });
  const watchPassword = form.watch('password');
  const watchConfirmPassword = form.watch('confirmPassword');
  const passwordsMatch = watchConfirmPassword ? watchConfirmPassword === watchPassword : true;

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);

  const { session } = useAuth();
  
  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (isRegistering) {
        setRememberMe(true);
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/bem-vindo`,
            data: {
              full_name: data.name,
            },
          },
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso! Verifique seu e-mail.");
        setIsRegistering(false);
        form.reset();
      } else {
        setRememberMe(rememberMe);
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        toast.success("Bem-vindo ao DashiDrive!");
        navigate("/bem-vindo");
      }
    } catch (error: any) {
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("E-mail ou senha incorretos");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Por favor, confirme seu e-mail antes de fazer login");
      } else if (error.message?.includes("User already registered")) {
        toast.error("Este e-mail já está cadastrado");
      } else {
        toast.error(error.message || "Erro ao processar autenticação");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      setRememberMe(rememberMe);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/bem-vindo`,
        },
      });
      if (error) throw error;
    } catch (error: any) {

      toast.error(error.message || "Erro ao entrar com Google");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = form.getValues("email").trim();
    if (!z.string().email().safeParse(email).success) {
      toast.error("Digite seu e-mail no campo acima para recuperar a senha");
      form.setFocus("email");
      return;
    }

    setIsSendingReset(true);
    try {
      await authService.sendPasswordReset(email, `${window.location.origin}/redefinir-senha`);
      toast.success("Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Erro ao enviar o e-mail de recuperação"));
    } finally {
      setIsSendingReset(false);
    }
  };



  const fleetCards = [
    {
      imageSrc: "/assets/receitatotal.png",
      imageAlt: "Receita",
      title: "Otimize resultados",
      description: "Relatórios inteligentes para decisões estratégicas",
      className:
        "[grid-area:stack] translate-x-0 translate-y-0 hover:-translate-y-[60px]",
    },
    {
      imageSrc: "/assets/mapa.png",
      imageAlt: "Mapa",
      title: "Acompanhe em tempo real",
      description: "Dados ao vivo sobre operações e desempenho",
      className:
        "[grid-area:stack] translate-x-16 translate-y-4 hover:-translate-y-[60px]",
    },
    {
      imageSrc: "/assets/grupo.png",
      imageAlt: "Equipe",
      title: "Atribua motoristas",
      description: "Gestão simplificada de condutores e permissões",
      className:
        "[grid-area:stack] translate-x-32 translate-y-8 hover:-translate-y-[60px]",
    },
    {
      imageSrc: "/assets/carroPreto.png",
      imageAlt: "Carro",
      title: "Cadastre sua frota",
      description: "Painel intuitivo para gerenciar todos os veículos",
      className:
        "[grid-area:stack] translate-x-48 translate-y-12 hover:-translate-y-[60px]",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Animated Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse-soft delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px]" />
      </motion.div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-[1400px] grid lg:grid-cols-2 gap-8 lg:gap-20 items-start py-4">
          
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block space-y-6"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
                <div className="relative">
                  <img 
                    src="/assets/loading-carcontrol-coelho.gif" 
                    alt="DashiDrive Logo" 
                    className="w-[75px] h-[75px] object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">
                  DashiDrive
                </h1>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Gestão Inteligente de Frotas
                </p>
              </div>
            </motion.div>

            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-4 max-w-lg"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
                Controle total da sua frota
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Gerencie veículos, motoristas, manutenções e pagamentos em uma plataforma moderna e intuitiva.
              </p>
            </motion.div>

            {/* Display Cards */}
            <div className="mt-8 lg:-ml-[15%]">
              <DisplayCards cards={fleetCards} />
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md mx-auto lg:mx-0 flex flex-col justify-center"
          >
            {/* Mobile Logo Section - Restyled & Premium */}
            <div className="lg:hidden text-center mb-10 pt-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 
                }}
                className="relative inline-block"
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full -z-10 animate-pulse-soft" />
                
                <div className="relative flex flex-col items-center">
                  <div className="w-28 h-28 neu rounded-full flex items-center justify-center p-5 mb-4 group overflow-hidden relative shadow-neu-lg">
                    {/* Inner dynamic glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <img 
                      src="/assets/cabeca.png" 
                      alt="DashiDrive Logo" 
                      className="w-full h-full object-contain drop-shadow-2xl animate-bounce-subtle relative z-10"
                    />
                  </div>
                  <h1 className="font-display text-4xl font-bold tracking-tighter bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                    DashiDrive
                  </h1>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] mt-1 font-semibold opacity-70">
                    Gestão Inteligente de Frotas
                  </p>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: 40 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-1 bg-accent mt-3 rounded-full shadow-[0_0_10px_rgba(var(--accent),0.5)]" 
                  />
                </div>
              </motion.div>
            </div>

            <div className="neu p-7 md:p-8 relative overflow-hidden shadow-neu-lg border border-white/5 backdrop-blur-[2px]">
              {/* Decorative Elements - Enhanced for Premium Feel */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/10 rounded-full blur-[80px] animate-pulse-soft" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-primary/10 rounded-full blur-[60px] animate-pulse-soft delay-1000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

              <div className="relative">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-8"
                >
               
                  <h2 className="font-display text-2xl font-bold mb-1.5 tracking-tight text-balance">
                    {isRegistering ? "Crie sua conta" : "Bem-vindo de volta"}
                  </h2>
                 
                  <p className="text-muted-foreground text-xs leading-relaxed max-w-[280px]">
                    {isRegistering
                      ? "Abra sua conta e comece a gerenciar sua frota agora mesmo."
                      : "Entre com suas credenciais para continuar sua jornada no DashiDrive."}
                  </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isRegistering ? "register" : "login"}
                      initial={{ opacity: 0, x: isRegistering ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRegistering ? -50 : 50 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-4"
                    >
                  {isRegistering && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <div className="relative">
                        <input
                          {...form.register('name', { onBlur: () => setFocusedField(null) })}
                          id="name"
                          type="text"
                          onFocus={() => setFocusedField("name")}
                          placeholder=" "
                          className="peer w-full h-11 px-4 neu-inset bg-transparent border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 pt-4"
                          required
                        />
                        <label
                          htmlFor="name"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:-translate-y-0"
                        >
                          Nome completo
                        </label>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: focusedField === "name" ? 1 : 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-accent to-primary rounded-full origin-center"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <div className="relative">
                      <input
                        {...form.register('email', { onBlur: () => setFocusedField(null) })}
                        id="email"
                        type="email"
                        onFocus={() => setFocusedField("email")}
                        placeholder=" "
                        className="peer w-full h-11 px-4 neu-inset bg-transparent border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 pt-4"
                        required
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:-translate-y-0"
                      >
                        E-mail
                      </label>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: focusedField === "email" ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-accent to-primary rounded-full origin-center"
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <div className="relative">
                      <input
                        {...form.register('password', { onBlur: () => setFocusedField(null) })}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        onFocus={() => setFocusedField("password")}
                        placeholder=" "
                        className="peer w-full h-11 px-4 pr-12 neu-inset bg-transparent border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 pt-4"
                        required
                      />
                      <label
                        htmlFor="password"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:-translate-y-0"
                      >
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: focusedField === "password" ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-accent to-primary rounded-full origin-center"
                      />
                    </div>
                    {isRegistering && watchPassword && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 space-y-1"
                      >
                        <div className="flex gap-1">
                          <div className={`h-1 flex-1 rounded-full transition-colors ${
                            watchPassword.length >= 8 ? "bg-green-500" : "bg-muted"
                          }`} />
                          <div className={`h-1 flex-1 rounded-full transition-colors ${
                            watchPassword.length >= 12 ? "bg-green-500" : "bg-muted"
                          }`} />
                          <div className={`h-1 flex-1 rounded-full transition-colors ${
                            /[A-Z]/.test(watchPassword) && /[0-9]/.test(watchPassword) ? "bg-green-500" : "bg-muted"
                          }`} />
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {watchPassword.length < 8 && "Mínimo 8 caracteres"}
                          {watchPassword.length >= 8 && watchPassword.length < 12 && "Senha boa"}
                          {watchPassword.length >= 12 && "Senha forte"}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Confirm Password - Only for Registration */}
                  {isRegistering && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55, duration: 0.5 }}
                    >
                      <div className="relative">
                        <input
                          {...form.register('confirmPassword', { onBlur: () => setFocusedField(null) })}
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          onFocus={() => setFocusedField("confirmPassword")}
                          placeholder=" "
                          className={`peer w-full h-11 px-4 pr-12 neu-inset bg-transparent border-0 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all duration-300 pt-4 ${
                            watchConfirmPassword && !passwordsMatch
                              ? "focus:ring-red-500/50"
                              : "focus:ring-primary/50"
                          }`}
                          required
                        />
                        <label
                          htmlFor="confirmPassword"
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:-translate-y-0"
                        >
                          Confirmar senha
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: focusedField === "confirmPassword" ? 1 : 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full origin-center ${
                            watchConfirmPassword && !passwordsMatch
                              ? "bg-red-500"
                              : "bg-gradient-to-r from-accent to-primary"
                          }`}
                        />
                      </div>
                      {watchConfirmPassword && !passwordsMatch && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[10px] text-red-500 mt-1 flex items-center gap-1"
                        >
                          <span className="w-1 h-1 rounded-full bg-red-500" />
                          As senhas não coincidem
                        </motion.p>
                      )}
                    </motion.div>
                  )}

                  {/* Remember & Forgot - Only for Login */}
                  {!isRegistering && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="flex items-center justify-between text-xs"
                    >
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMeChecked(e.target.checked)}
                          className="peer w-3.5 h-3.5 rounded border-2 border-border appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer"
                        />
                        <svg
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        Lembrar-me
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isSendingReset}
                      className="text-primary hover:underline font-medium transition-all disabled:opacity-50"
                    >
                      {isSendingReset ? "Enviando..." : "Esqueceu a senha?"}
                    </button>
                  </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full h-12 bg-gradient-sunset hover:bg-gradient-sunset-hover text-black font-semibold rounded-xl shadow-md border-none group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {/* Shine effect on hover */}
                      <motion.div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.3),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      {/* Loading pulse */}
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={false}
                        animate={{
                          scale: isLoading ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                          duration: 1,
                          repeat: isLoading ? Infinity : 0,
                        }}
                      />
                      <span className="relative flex items-center justify-center gap-2 text-sm font-semibold">
                        {isLoading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                            />
                            {isRegistering ? "Criando..." : "Entrando..."}
                          </>
                        ) : (
                          <>
                            {isRegistering ? "Criar conta" : "Entrar"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>
                  </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </form>

                {/* Divider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="relative my-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-[10px] text-muted-foreground bg-background">
                      ou
                    </span>
                  </div>
                </motion.div>

                {/* Google Sign In */}
                <motion.button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.5 }}
                  className="relative w-full h-12 neu-interactive group overflow-hidden mb-4 flex items-center justify-center gap-3 text-sm font-semibold"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </motion.button>


                {/* Sign Up */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-xs text-muted-foreground">
                    {isRegistering ? "Já tem conta?" : "Novo por aqui?"}{" "}
                    <button
                      type="button"
                      onClick={() => { setIsRegistering(!isRegistering); form.reset(); }}
                      className="text-primary hover:underline font-semibold inline-flex items-center gap-1 group"
                    >
                      {isRegistering ? "Entrar" : "Criar conta"}
                      <img src="/assets/cabeca.png" alt="" className="w-3 h-3 object-contain group-hover:rotate-12 transition-transform" />
                    </button>
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center text-[10px] text-muted-foreground mt-4"
            >
              © 2026 DashiDrive. Todos os direitos reservados.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;

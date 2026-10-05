import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AnimatedBanner = ({ text, direction, bgColor }: { text: string; direction: "left" | "right"; bgColor: string }) => {
  return (
    <div className={`w-full overflow-hidden ${bgColor} py-3 flex items-center mt-auto`}>
      <div
        className={`whitespace-nowrap flex items-center ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
      >
        {Array(20).fill(text).map((t, i) => (
          <span key={i} className="flex items-center gap-2 text-white font-bold text-lg mx-8">
            <img src="/logo.png" alt="DashiDrive Logo" className="h-6 w-auto" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

const gestaoPlans = [
  { name: "Básico", slug: "gestao-basico", price: 199, desc: "5 veículos, 10 motoristas, 1 usuário" },
  { name: "Pro", slug: "gestao-pro", price: 399, desc: "20 veículos, 40 motoristas, 3 usuários" },
  { name: "Master", slug: "gestao-master", price: 799, desc: "100 veículos, 200 motoristas, 200 usuários" },
];

const mktPlans = [
  { name: "Free", slug: "marketplace-free", price: 0, desc: "1 anúncio ativo, perfil básico" },
  { name: "Pro", slug: "marketplace-pro", price: 119, desc: "10 anúncios, métricas, selo verificado" },
  { name: "Elite", slug: "marketplace-elite", price: 299, desc: "25 anúncios, destaque, prioridade na busca" },
];

const PlanCard = ({ name, price, desc, slug }: { name: string; price: number; desc: string; slug: string }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
      <p className="text-3xl font-black text-[#009ee3] mb-2">
        R$ {price.toFixed(2).replace(".", ",")}
        <span className="text-sm font-normal text-gray-500">/mês</span>
      </p>
      <p className="text-sm text-gray-500 mb-5 flex-1">{desc}</p>
      <Button
        onClick={() => navigate(`/checkout/${slug}`)}
        className="w-full bg-[#009ee3] hover:bg-[#0082c4] text-white rounded-lg"
      >
        {price === 0 ? "Ativar Grátis" : "Assinar"}
      </Button>
    </div>
  );
};

const PlanosPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-[#009ee3] p-3 flex items-center shadow-md relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 text-white hover:opacity-80 transition-opacity"
          aria-label="Voltar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <img src="/assets/escudoazul.png" alt="Compra Segura" className="h-8 w-auto" />
          <span className="text-white text-xl font-bold">COMPRA SEGURA</span>
        </div>
      </header>

      <main className="flex-1 container max-w-5xl mx-auto py-10 px-4 space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-800">Escolha seu plano</h1>
          <p className="text-gray-500 mt-2">Selecione o plano ideal para sua locadora</p>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Planos de Gestão</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gestaoPlans.map((p) => (
              <PlanCard key={p.slug} {...p} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Planos de Marketplace</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mktPlans.map((p) => (
              <PlanCard key={p.slug} {...p} />
            ))}
          </div>
        </section>
      </main>

      <footer>
        <AnimatedBanner
          text="DashiDrive, gestão inteligente para locadoras!            "
          direction="left"
          bgColor="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600"
        />
      </footer>
    </div>
  );
};

export default PlanosPage;

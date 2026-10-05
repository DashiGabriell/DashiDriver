import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PlanSelection = () => {
  const navigate = useNavigate();

  const gestaoPlans = [
    { name: "Basico", slug: "gestao-basico", price: 199, limit: "5 veiculos" },
    { name: "Pro", slug: "gestao-pro", price: 399, limit: "20 veiculos" },
    { name: "Master", slug: "gestao-master", price: 799, limit: "100 veiculos" },
  ];

  const mktPlans = [
    { name: "Free", slug: "marketplace-free", price: 0, limit: "1 anuncio" },
    { name: "Pro", slug: "marketplace-pro", price: 119, limit: "10 anuncios" },
    { name: "Elite", slug: "marketplace-elite", price: 299, limit: "25 anuncios" },
  ];

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Escolha seu plano</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">Gestao de Frotas (SaaS)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gestaoPlans.map((plan) => (
            <Card key={plan.slug} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>R$ {plan.price}/mes</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="mb-4">{plan.limit}</p>
                <Button className="w-full" onClick={() => navigate(`/checkout/${plan.slug}`)}>Selecionar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-center">Marketplace</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mktPlans.map((plan) => (
            <Card key={plan.slug} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>R$ {plan.price}/mes</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="mb-4">{plan.limit}</p>
                <Button className="w-full" onClick={() => navigate(`/checkout/${plan.slug}`)}>Selecionar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;

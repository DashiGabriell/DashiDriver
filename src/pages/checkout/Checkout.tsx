import { Navigate, useParams } from "react-router-dom";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { PLAN_CATALOG, isPlanSlug, planSummaryFor } from "@/lib/billing/plans";
import CheckoutMarketplaceFree from "./CheckoutMarketplaceFree";

const Checkout = () => {
  const { plano } = useParams<{ plano: string }>();

  if (!isPlanSlug(plano)) return <Navigate to="/planos" replace />;
  if (plano === "marketplace-free") return <CheckoutMarketplaceFree />;

  const plan = PLAN_CATALOG[plano];
  return (
    <CheckoutLayout title={`Assinar o ${planSummaryFor(plano).name}`}>
      <CheckoutForm key={plano} slug={plano} amount={plan.price} planType={plan.planType} />
    </CheckoutLayout>
  );
};

export default Checkout;

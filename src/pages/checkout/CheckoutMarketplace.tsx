import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";

const CheckoutMarketplace = () => (
  <CheckoutLayout title="Plano Marketplace">
    <CheckoutForm planName="Marketplace" amount={299.00} planType="marketplace" />
  </CheckoutLayout>
);

export default CheckoutMarketplace;
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";

const CheckoutMarketplaceElite = () => (
  <CheckoutLayout title="Plano Marketplace Elite">
    <CheckoutForm planName="marketplace-elite" amount={299.00} planType="marketplace" />
  </CheckoutLayout>
);

export default CheckoutMarketplaceElite;

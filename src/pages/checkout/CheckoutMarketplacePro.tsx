import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";

const CheckoutMarketplacePro = () => (
  <CheckoutLayout title="Plano Marketplace Pro">
    <CheckoutForm planName="marketplace-pro" amount={119.00} planType="marketplace" />
  </CheckoutLayout>
);

export default CheckoutMarketplacePro;

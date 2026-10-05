import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";

const CheckoutGestaoPro = () => (
  <CheckoutLayout title="Plano Gestao Pro">
    <CheckoutForm planName="gestao-pro" amount={399.00} planType="gestao" />
  </CheckoutLayout>
);

export default CheckoutGestaoPro;

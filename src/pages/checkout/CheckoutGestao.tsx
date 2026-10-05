import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";

const CheckoutGestao = () => (
  <CheckoutLayout title="Plano Gestão">
    <CheckoutForm planName="Gestão" amount={399.00} planType="gestao" />
  </CheckoutLayout>
);

export default CheckoutGestao;
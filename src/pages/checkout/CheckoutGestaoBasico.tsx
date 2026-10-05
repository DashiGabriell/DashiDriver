import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";

const CheckoutGestaoBasico = () => (
  <CheckoutLayout title="Plano Gestao Basico">
    <CheckoutForm planName="gestao-basico" amount={199.00} planType="gestao" />
  </CheckoutLayout>
);

export default CheckoutGestaoBasico;

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";

const CheckoutMotorista = () => (
  <CheckoutLayout title="Plano Motorista">
    <CheckoutForm planName="Motorista" amount={0} planType="gestao" />
  </CheckoutLayout>
);

export default CheckoutMotorista;
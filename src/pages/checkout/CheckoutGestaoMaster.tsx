import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";

const CheckoutGestaoMaster = () => (
  <CheckoutLayout title="Plano Gestao Master">
    <CheckoutForm planName="gestao-master" amount={799.00} planType="gestao" />
  </CheckoutLayout>
);

export default CheckoutGestaoMaster;

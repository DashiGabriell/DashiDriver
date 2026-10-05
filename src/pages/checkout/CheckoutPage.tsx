import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { useParams, useSearchParams } from "react-router-dom";

const CheckoutPage = () => {
  const { plan } = useParams();
  const [searchParams] = useSearchParams();
  const price = parseFloat(searchParams.get("price") || "0");
  const type = searchParams.get("type") || "gestao";
  
  return (
    <CheckoutLayout title={`Checkout: ${plan}`}>
      <CheckoutForm planName={plan || "Básico"} amount={price} planType={type as 'gestao' | 'marketplace'} />
    </CheckoutLayout>
  );
};

export default CheckoutPage;
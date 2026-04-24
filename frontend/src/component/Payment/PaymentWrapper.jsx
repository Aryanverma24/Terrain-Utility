import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import LandPayment from './LandPayment';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentWrapper = ({ landId, price, land, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <LandPayment landId={landId} price={price} land={land} onSuccess={onSuccess} />
    </Elements>
  );
};

export default PaymentWrapper;

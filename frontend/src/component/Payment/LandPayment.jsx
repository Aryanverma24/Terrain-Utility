import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { API } from '../../../utils/API';

const LandPayment = ({ landId, land, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);

  const payableAmount =
    land?.transferStatus === 'token_paid'
      ? land.price
      : land?.tokenConfig?.amount || Math.round(land.price * 0.05);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // 1️⃣ Create Payment Intent
      const { data } = await API.post(
        '/api/payment/create-intent',
        { landId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data?.clientSecret) {
        toast.error('Payment initialization failed');
        return;
      }

      // 2️⃣ Confirm Payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      // 3️⃣ Success check
      const paymentIntent = result?.paymentIntent;

      if (paymentIntent?.status === 'succeeded') {
        const confirmResponse = await API.post(
          '/api/payment/confirm',
          { paymentIntentId: paymentIntent.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success('Payment Successful 🎉');

        // 🔥 SAFE CALLBACK
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(confirmResponse.data);
        }
      } else {
        toast.error('Payment not completed');
      }
    } catch (err) {
      console.error('🔥 PAYMENT ERROR:', err);

      toast.error(
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        'Payment failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="border p-3 rounded-lg">
        <CardElement />
      </div>

      <div className="bg-emerald-50 p-3 rounded-lg text-sm">
        <p className="text-gray-600">Payable Amount</p>
        <p className="text-2xl font-bold text-emerald-700">
          ₹{payableAmount.toLocaleString('en-IN')}
        </p>
        <p className="text-xs text-gray-500">
          {land?.transferStatus === 'token_paid'
            ? 'Final payment'
            : 'Token payment (advance)'}
        </p>
      </div>

      <button
        disabled={!stripe || loading}
        className="w-full bg-green-600 text-white py-2 rounded-lg"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default LandPayment;
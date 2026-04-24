import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DirectPaymentForm = ({ landId, landPrice, onClose, onSuccess, landDetails }) => {
  console.log('DirectPaymentForm rendering - NEW VERSION'); // Debug log
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Stripe is not loaded yet');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // 1️⃣ Create Payment Intent
      const { data } = await axios.post(
        '/api/payment/create-intent',
        { landId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

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

      // 3️⃣ Success - Confirm on backend
      if (result.paymentIntent.status === 'succeeded') {
        try {
          const confirmResponse = await axios.post(
            '/api/payment/confirm',
            { paymentIntentId: result.paymentIntent.id },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          console.log('Backend confirmation successful:', confirmResponse.data);
          toast.success('Payment Successful 🎉');
          onSuccess();
          onClose();

          // Redirect to congratulations page with land details
          navigate('/congratulations', {
            state: {
              landDetails: landDetails || { title: 'Property', price: landPrice },
              transactionId:
                confirmResponse.data.transactionId || result.paymentIntent.id,
            },
          });
        } catch (confirmError) {
          console.error(
            'Backend confirmation failed:',
            confirmError.response?.data || confirmError,
          );
          toast.error(
            `Payment succeeded but confirmation failed: ${confirmError.response?.data?.error || confirmError.message}`,
          );
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(`Payment failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xs text-gray-500 mb-2">
        💳 Test Card: 4000002760003184 (INR)
      </div>
      <div className="border p-3 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      <p className="text-sm text-gray-600">
        Amount: <strong>₹{landPrice}</strong>
      </p>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-600 text-white py-2 rounded-lg disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default DirectPaymentForm;

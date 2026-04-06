import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LandPayment = ({ landId, price, land }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // 1️⃣ Create Payment Intent
      const { data } = await axios.post(
        "/api/payment/create-intent",
        { landId },
        { headers: { Authorization: `Bearer ${token}` } }
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

      // 3️⃣ Success
      if (result.paymentIntent.status === "succeeded") {
        const confirmResponse = await axios.post(
          "/api/payment/confirm",
          { paymentIntentId: result.paymentIntent.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Payment Successful 🎉");

        // Redirect to congratulations page with land details
        navigate('/congratulations', { 
          state: { 
            landDetails: {
              title: land?.title || land?.name || 'Property',
              price: price || land?.price,
              location: land?.location,
              area: land?.area
            },
            transactionId: confirmResponse.data.transactionId || result.paymentIntent.id
          } 
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">

      <div className="border p-3 rounded-lg">
        <CardElement />
      </div>

      <p className="text-sm text-gray-600">
        Amount: <strong>₹{price}</strong>
      </p>

      <button
        disabled={!stripe || loading}
        className="w-full bg-green-600 text-white py-2 rounded-lg"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

export default LandPayment;
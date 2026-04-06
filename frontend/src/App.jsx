import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./component/Navigation";
import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/authContext";
import { useLocation } from "react-router-dom";
import Footer from "./component/Footer.jsx";
import "leaflet/dist/leaflet.css";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const stripePromise = loadStripe(stripeKey);

function App() {
  const { getUser, user } = useContext(AuthContext);
  
  useEffect(() => {
    getUser();
  }, []);

  const location = useLocation();

  // Hide footer on specific routes (no need for useEffect)
  const hideFooter = ["/login", "/register", "/chat", "/adminDashboard", "/uploads", "/congratulations"].includes(location.pathname);

  return (
    <>
    <Elements stripe={stripePromise}>
      <ToastContainer />
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow bg-[#atb69b]">
         <Outlet context={{ user }} />
        </main>
        {!hideFooter && <Footer />}
      </div>
      </Elements>
    </>
  );
}

export default App;

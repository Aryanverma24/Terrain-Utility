import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './component/Navigation';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/authContext';
import { useLocation } from 'react-router-dom';
import Footer from './component/Footer.jsx';
import 'leaflet/dist/leaflet.css';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const stripePromise = loadStripe(stripeKey);

function App() {
  const { getUser, user } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
  if (localStorage.getItem("token")) {
    getUser();
  }
}, []);

  const hideFooter = [
    '/login',
    '/register',
    '/chat',
    '/adminDashboard',
    '/uploads',
    '/registrar-activate',
    '/registrar-login',
    '/congratulations',
  ].includes(location.pathname);

  const isRegistrarRoute =
    location.pathname.startsWith("/registrar") ||
    location.pathname.startsWith("/registrarDashboard");

  return (
    <Elements stripe={stripePromise}>
      <ToastContainer />

      <div className="flex flex-col min-h-screen">

        {/* ✅ HIDE NAVBAR FOR REGISTRAR */}
        {!isRegistrarRoute && <Navigation />}

        <main className="flex-grow bg-[#atb69b]">
          <Outlet context={{ user }} />
        </main>

        {!hideFooter && <Footer />}
      </div>
    </Elements>
  );
}

export default App;

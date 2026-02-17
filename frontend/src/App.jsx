import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./component/Navigation";
import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/authContext";
import { useLocation } from "react-router-dom";
import Footer from "./component/Footer.jsx";

function App() {
  const { getUser, user } = useContext(AuthContext);
  
  useEffect(() => {
    getUser();
  }, []);

  const location = useLocation();

  // Hide footer on specific routes (no need for useEffect)
  const hideFooter = ["/login", "/register", "/chat", "/adminDashboard", "/uploads"].includes(location.pathname);

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow bg-[#atb69b]">
         <Outlet context={{ user }} />
        </main>
        {!hideFooter && <Footer />}
      </div>
    </>
  );
}

export default App;

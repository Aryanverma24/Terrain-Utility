import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navigation from "./component/Navigation";
import { API } from "../utils/API";
import { useContext, useEffect } from "react";
import Login from "./component/Login";
import Home from "./component/Home";
import { AuthContext } from "../contexts/authContext";

function App() {
  const { getUser, user } = useContext(AuthContext);
  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col">
        <div className="bg-gray-800">
          <Navigation />
        </div>
        <main className="bg-[#eeecec] h-full">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;

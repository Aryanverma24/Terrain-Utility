import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/authContext";
import { toast } from "react-toastify";

const Login = () => {
  const { isAuthenticated, getUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyerSeller"); // default buyer
  const navigate = useNavigate();

  const getLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/api/users/auth", { email, password, role });
      if (data) {
        localStorage.setItem("token", data?.token);
        localStorage.setItem("user", JSON.stringify(data?.user));
        localStorage.setItem("role", role);
        getUser();
        if (role === "lawyer") navigate("/lawyer-dashboard");
        else navigate("/");
      }
    } catch (error) {
      toast.error("Invalid username or password");
      console.log(error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated]);

  return (
    <section className="bg-[#daf1de] min-h-screen flex items-center justify-center p-6">
      <div className="flex flex-col md:flex-row w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden">

        {/* FORM CONTAINER */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1b3a31] to-[#235347] p-10 relative flex flex-col justify-center rounded-l-3xl">

          <h1 className="text-4xl md:text-5xl text-[#fff5f5] font-extrabold mb-12 text-center tracking-wide">
            SIGN IN
          </h1>

          <form onSubmit={getLogin} className="w-full space-y-6">

            {/* Role Selector */}
            <div>
              <label className="block text-lg md:text-xl font-semibold text-[#fff5f5] mb-2">Login As:</label>
              <div className="flex gap-6 text-[#fff5f5]">
                <label className="flex items-center gap-2 text-lg md:text-xl">
                  <input
                    type="radio"
                    value="buyerSeller"
                    checked={role === "buyerSeller"}
                    onChange={(e) => setRole(e.target.value)}
                    className="accent-[#ffd1c1]"
                  />
                  Buyer / Seller
                </label>
                <label className="flex items-center gap-2 text-lg md:text-xl">
                  <input
                    type="radio"
                    value="lawyer"
                    checked={role === "lawyer"}
                    onChange={(e) => setRole(e.target.value)}
                    className="accent-[#ffd1c1]"
                  />
                  Lawyer
                </label>
              </div>
            </div>

            {/* Email & Password */}
            <div>
              <label className="block text-lg md:text-xl font-semibold text-[#fff5f5] mb-1">Email:</label>
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1] shadow-lg"
              />
            </div>
            <div>
              <label className="block text-lg md:text-xl font-semibold text-[#fff5f5] mb-1">Password:</label>
              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1] shadow-lg"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4caf50] to-[#2e7d32] py-3 rounded-xl text-[#fff5f5] font-bold text-lg transition-all shadow-lg hover:scale-105 hover:shadow-2xl"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-2 rounded-lg bg-gray-700 text-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 shadow-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-800 py-2 rounded-lg text-white font-semibold"
          >
            Sign In
          </button>
         {/* <Link to='/facial-auth'>
         <button 
            className="w-full mt-4 bg-green-600 hover:bg-green-800 py-2 rounded-lg text-white font-semibold">
            Facial Login
          </button>
         </Link> */}
        </form>

        <div className="mt-4 text-center">
          <p>
            New User?{" "}
            <Link to="/register" className="text-green-600 hover:underline">
              Register
            </Link>
          </form>

          <div className="mt-6 text-center text-[#fff5f5]">
            <p>
              New User?{" "}
              <Link to="/register" className="underline hover:text-[#ffd1c1]">
                Register
              </Link>
            </p>
          </div>

        </div>

        {/* IMAGE CONTAINER */}
        <div className="w-full md:w-1/2 flex justify-center items-center bg-gradient-to-br from-[#dab0aa] to-[#e0b7ad] p-6 relative rounded-r-3xl">
          
          {/* Go to Home Button */}
          <Link
            to="/"
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4caf50] to-[#2e7d32] rounded-3xl hover:scale-105 transition-all shadow-md text-white font-semibold"
          >
            Go to Home
          </Link>

          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/customer-feedback-9175733-7525331.png"
            alt="Login Illustration"
            className="h-[28rem] w-[30rem] rounded-2xl object-cover shadow-2xl"
          />
        </div>

      </div>
    </section>
  );
};

export default Login;

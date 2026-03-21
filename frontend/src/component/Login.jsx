import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../utils/API";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const Login = () => {
  const { isAuthenticated, getUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyerSeller");

  const navigate = useNavigate();

  const getLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/api/users/auth", {
        email,
        password,
        role,
      });

      if (data) {
        localStorage.setItem("token", data?.token);
        localStorage.setItem("user", JSON.stringify(data?.user));
        localStorage.setItem("role", role);

        await getUser();

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
  }, [isAuthenticated, navigate]);

  return (
    <section className="bg-[#daf1de] min-h-screen flex items-center justify-center p-6">
      <div className="flex flex-col md:flex-row w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden">
        
        {/* LEFT: FORM */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#1b3a31] to-[#235347] p-10 flex flex-col justify-center rounded-l-3xl">
          
          <h1 className="text-4xl md:text-5xl text-[#fff5f5] font-extrabold mb-10 text-center">
            SIGN IN
          </h1>

          <form onSubmit={getLogin} className="space-y-6">

            {/* Role Selector */}
            <div>
              <label className="block text-lg font-semibold text-[#fff5f5] mb-2">
                Login As:
              </label>

              <div className="flex gap-6 text-[#fff5f5]">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="buyerSeller"
                    checked={role === "buyerSeller"}
                    onChange={(e) => setRole(e.target.value)}
                    className="accent-[#ffd1c1]"
                  />
                  Buyer / Seller
                </label>

                <label className="flex items-center gap-2">
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

            {/* Email */}
            <div>
              <label className="block text-lg font-semibold text-[#fff5f5] mb-1">
                Email:
              </label>
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-lg font-semibold text-[#fff5f5] mb-1">
                Password:
              </label>
              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 rounded-xl bg-[#2c5c4b] text-[#fff5f5] placeholder-[#d1e8d0] focus:outline-none focus:ring-2 focus:ring-[#ffd1c1]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4caf50] to-[#2e7d32] py-3 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              Sign In
            </button>

            {/* Register */}
            <p className="text-center text-[#fff5f5]">
              New User?{" "}
              <Link to="/register" className="underline hover:text-[#ffd1c1]">
                Register
              </Link>
            </p>

          </form>
        </div>

        {/* RIGHT: IMAGE */}
        <div className="w-full md:w-1/2 flex justify-center items-center bg-gradient-to-br from-[#dab0aa] to-[#e0b7ad] p-6 relative rounded-r-3xl">
          
          <Link
            to="/"
            className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-[#4caf50] to-[#2e7d32] rounded-3xl text-white font-semibold hover:scale-105"
          >
            Go to Home
          </Link>

          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/customer-feedback-9175733-7525331.png"
            alt="Login Illustration"
            className="h-[26rem] w-[28rem] rounded-2xl object-cover shadow-2xl"
          />
        </div>

      </div>
    </section>
  );
};

export default Login;
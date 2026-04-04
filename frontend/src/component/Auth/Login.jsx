import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../../utils/API";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaEnvelope, FaShieldAlt, FaHome, FaUserShield, FaHandshake } from "react-icons/fa";

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
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          
          {/* LEFT: HERO SECTION */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-emerald-600 via-cyan-600 to-emerald-700 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                  <FaShieldAlt className="mr-2" />
                  Secure Authentication
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  Welcome Back
                  <span className="block text-2xl lg:text-3xl font-light text-emerald-100 mt-2">
                    to Bhu-Parichiye
                  </span>
                </h1>
                
                <p className="text-emerald-100 text-lg lg:text-xl max-w-md">
                  Access your account and continue your journey in finding the perfect property
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <FaUser className={`mx-auto h-6 w-6 mb-2 text-emerald-200`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Professional Network</h3>
                    <p className="text-emerald-200 text-sm">Connect with verified users</p>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <FaLock className={`mx-auto h-6 w-6 mb-2 text-emerald-200`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Login</h3>
                    <p className="text-emerald-200 text-sm">Protected authentication</p>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <FaHandshake className={`mx-auto h-6 w-6 mb-2 text-emerald-200`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Trusted Platform</h3>
                    <p className="text-emerald-200 text-sm">Verified properties only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LOGIN FORM */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            
            {/* Header */}
            <div className="text-center mb-8">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-sm font-medium mb-6 hover:from-emerald-200 hover:to-cyan-200 transition-all duration-300"
              >
                <FaHome className="mr-2" />
                Back to Home
              </Link>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign In
                <span className="block text-lg font-medium text-gray-600 mt-1">
                  Enter your credentials to access your account
                </span>
              </h2>
            </div>

            <form onSubmit={getLogin} className="space-y-6">

              {/* Role Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  I want to login as:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                    role === "buyerSeller" 
                      ? "border-emerald-500 bg-emerald-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                    <input
                      type="radio"
                      value="buyerSeller"
                      checked={role === "buyerSeller"}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <FaUser className={`mx-auto h-6 w-6 mb-2 ${
                        role === "buyerSeller" ? "text-emerald-600" : "text-gray-400"
                      }`} />
                      <span className={`text-sm font-medium ${
                        role === "buyerSeller" ? "text-emerald-900" : "text-gray-700"
                      }`}>
                        Buyer / Seller
                      </span>
                    </div>
                  </label>

                  <label className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                    role === "lawyer" 
                      ? "border-emerald-500 bg-emerald-50" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}>
                    <input
                      type="radio"
                      value="lawyer"
                      checked={role === "lawyer"}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <FaUserShield className={`mx-auto h-6 w-6 mb-2 ${
                        role === "lawyer" ? "text-emerald-600" : "text-gray-400"
                      }`} />
                      <span className={`text-sm font-medium ${
                        role === "lawyer" ? "text-emerald-900" : "text-gray-700"
                      }`}>
                        Lawyer
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-[1.02]"
              >
                Sign In
              </button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  New to Bhu-Parichiye?{" "}
                  <Link 
                    to="/register" 
                    className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
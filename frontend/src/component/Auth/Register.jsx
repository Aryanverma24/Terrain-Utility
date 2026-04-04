import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/authContext";
import { FaArrowLeft, FaUser, FaEnvelope, FaLock, FaPhone, FaUserShield, FaHome, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";

const Register = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [number, setNumber] = useState("");
  const [role, setRole] = useState("buyerSeller");

  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();

    // Password validation
    if (password !== rePassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, contactNumber: number, role }),
      });

      const response = await res.json();
      
      if (!res.ok) {
        toast.error(response.message || "Registration failed");
        return;
      }

      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

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
                  <FaCheckCircle className="mr-2" />
                  Join Our Community
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  Create Account
                  <span className="block text-2xl lg:text-3xl font-light text-emerald-100 mt-2">
                    Start Your Journey
                  </span>
                </h1>
                
                <p className="text-emerald-100 text-lg lg:text-xl max-w-md">
                  Join thousands of users finding their perfect properties with verified listings and professional services
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <FaUser className="text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Easy Registration</h3>
                    <p className="text-emerald-200 text-sm">Quick and simple signup process</p>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <FaShieldAlt className="text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Platform</h3>
                    <p className="text-emerald-200 text-sm">Your data is always protected</p>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <FaUserShield className="text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Verified Listings</h3>
                    <p className="text-emerald-200 text-sm">Access to authenticated properties</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: REGISTRATION FORM */}
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
                Create Account
                <span className="block text-lg font-medium text-gray-600 mt-1">
                  Fill in your details to get started
                </span>
              </h2>
            </div>

            <form onSubmit={submitForm} className="space-y-6">

              {/* Name & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="Enter your number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength="10"
                    />
                  </div>
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
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  I want to register as:
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

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      required
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Min. 8 characters</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={rePassword}
                      onChange={(e) => setRePassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-[1.02]"
              >
                Create Account
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                  >
                    Sign in
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

export default Register;

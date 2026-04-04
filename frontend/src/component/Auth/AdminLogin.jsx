import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../../utils/API";
import { FaShieldAlt, FaLock, FaUser, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheckCircle, FaArrowLeft, FaUserShield } from "react-icons/fa";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await API.post("/api/users/auth", {
        email: formData.email,
        password: formData.password,
        role: "admin"
      });
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("role", "admin");
        
        toast.success("Welcome back, Admin!");
        navigate("/adminDashboard");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Invalid credentials. Please check your email and password.");
      } else if (error.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
      } else if (error.response?.status === 404) {
        toast.error("Admin account not found.");
      } else {
        toast.error(error.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToUserLogin = () => {
    navigate("/login");
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          
          {/* LEFT: HERO SECTION */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
            
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
                  Admin Authentication
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  Admin Portal
                  <span className="block text-2xl lg:text-3xl font-light text-purple-100 mt-2">
                    Secure Access Control
                  </span>
                </h1>
                
                <p className="text-purple-100 text-lg lg:text-xl max-w-md">
                  Enter your admin credentials to access the dashboard and manage the platform
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <FaUserShield className={`mx-auto h-6 w-6 mb-2 text-purple-200`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Admin Privileges</h3>
                    <p className="text-purple-200 text-sm">Full system access</p>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <FaLock className={`mx-auto h-6 w-6 mb-2 text-purple-200`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enhanced Security</h3>
                    <p className="text-purple-200 text-sm">Multi-layer protection</p>
                  </div>
                </div>
                
                <div className="flex items-center text-white">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-4">
                    <FaShieldAlt className={`mx-auto h-6 w-6 mb-2 text-purple-200`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">System Management</h3>
                    <p className="text-purple-200 text-sm">Complete control panel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LOGIN FORM */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            
            {/* Header */}
            <div className="text-center mb-8">
              <button
                onClick={handleBackToUserLogin}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-sm font-medium mb-6 hover:from-purple-200 hover:to-indigo-200 transition-all duration-300"
              >
                <FaArrowLeft className="mr-2" />
                Back to User Login
              </button>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Sign In
                <span className="block text-lg font-medium text-gray-600 mt-1">
                  Enter your admin credentials to access the dashboard
                </span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 ${
                      errors.email 
                        ? 'border-red-400 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="admin@example.com"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <FaExclamationTriangle className="mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 ${
                      errors.password 
                        ? 'border-red-400 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Enter your admin password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <FaExclamationTriangle className="mr-1" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 text-purple-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="w-5 h-5" />
                    Access Admin Dashboard
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-800 text-sm font-medium mb-1">Security Notice</p>
                    <p className="text-yellow-700 text-xs">
                      This is a restricted area. Unauthorized access attempts will be logged and reported.
                    </p>
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminLogin;

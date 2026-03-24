import { Link } from "react-router-dom";
import { FaSearch, FaArrowRight, FaCheckCircle, FaPlay } from "react-icons/fa";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";

const Hero = () => {
  const { user } = useContext(AuthContext);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 0v40M0 20h40' stroke='%23ffffff' stroke-width='0.5' fill-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-slate-900/50"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-sm font-medium mb-6 backdrop-blur-sm">
              <FaCheckCircle className="mr-2" />
              Trusted by 10,000+ Landowners & Renters
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mt-2">
                Land Property
              </span>
            </h1>

            {/* Enhanced Subheading */}
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
              Connect with premium land opportunities for agriculture, commercial, recreation, and urban development. 
              Transparent, secure, and efficient land management platform.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/lands"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
              >
                <FaSearch className="mr-3 group-hover:scale-110 transition-transform" />
                Explore Properties
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/register"
                className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
                <FaPlay className="ml-2 text-sm group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stats with Enhanced Design */}
            <div className="grid grid-cols-3 gap-6 max-w-lg">
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">5,000+</div>
                <div className="text-gray-400 text-sm">Active Listings</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1">98%</div>
                <div className="text-gray-400 text-sm">Satisfaction</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">24/7</div>
                <div className="text-gray-400 text-sm">Support</div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Element */}
          <div className="relative">
            {/* Floating Card */}
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="space-y-4">
                {/* Property Preview */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl p-4 border border-emerald-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-emerald-400 font-semibold">Premium Land</span>
                    <span className="text-cyan-400 text-sm">Verified ✓</span>
                  </div>
                  <div className="text-white text-2xl font-bold mb-1">₹2,50,000</div>
                  <div className="text-gray-300 text-sm">Agricultural • 5 Acres</div>
                </div>

                {/* Stats Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-lg font-bold">450+</div>
                      <div className="text-gray-400 text-sm">New Properties</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <FaSearch className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-4 pt-4">
                  <div className="flex items-center text-emerald-400">
                    <FaCheckCircle className="mr-1" />
                    <span className="text-sm">Verified</span>
                  </div>
                  <div className="flex items-center text-cyan-400">
                    <FaCheckCircle className="mr-1" />
                    <span className="text-sm">Secure</span>
                  </div>
                  <div className="flex items-center text-emerald-400">
                    <FaCheckCircle className="mr-1" />
                    <span className="text-sm">Trusted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
    </section>
  );
};

export default Hero;

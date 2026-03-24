import { FaArrowRight, FaHandshake, FaRocket, FaPhone, FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-emerald-600 via-cyan-600 to-emerald-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6">
              <FaRocket className="mr-2" />
              Ready to Get Started?
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Join Us in
              <span className="block text-emerald-100">
                Revolutionizing Land Management
              </span>
            </h2>

            <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed mb-12">
              Whether you're looking to manage your land investments, find your perfect property, 
              or partner with us, we're here to help you succeed.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/lands"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <span className="mr-2">Explore Properties</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/contact"
                className="group inline-flex items-center justify-center px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 border border-emerald-400"
              >
                <span className="mr-2">Contact Us</span>
                <FaHandshake className="group-hover:scale-110 transition-transform" />
              </Link>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <FaPhone className="text-white text-xl" />
                </div>
                <h3 className="text-white font-bold mb-2">Call Us</h3>
                <p className="text-emerald-100">+91 XXXXX XXXXX</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <FaEnvelope className="text-white text-xl" />
                </div>
                <h3 className="text-white font-bold mb-2">Email Us</h3>
                <p className="text-emerald-100">info@bhu-parichiye.com</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <FaHandshake className="text-white text-xl" />
                </div>
                <h3 className="text-white font-bold mb-2">Partner With Us</h3>
                <p className="text-emerald-100">partners@bhu-parichiye.com</p>
              </div>
            </div>
          </div>

          {/* Bottom Badge */}
          <div className="mt-16">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl border border-white/30">
              <FaHandshake className="mr-3 text-xl" />
              <span className="font-bold text-lg">Building Tomorrow's Land Solutions Today</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

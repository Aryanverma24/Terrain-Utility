import { Link } from "react-router-dom";
import { FaRocket, FaPhone, FaEnvelope, FaArrowRight } from "react-icons/fa";

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main CTA */}
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12 max-w-4xl mx-auto mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                <FaRocket className="text-white text-3xl" />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Land?
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of satisfied customers who discovered their ideal property through Bhu-Parichiye. 
              Start your journey today!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 group"
              >
                Get Started Now
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/lands"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                Browse Properties
              </Link>
            </div>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaPhone className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Call Us
              </h3>
              <p className="text-gray-300 mb-3">
                Get expert assistance from our team
              </p>
              <a 
                href="tel:+919876543210" 
                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
              >
                +91 98765 43210
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Email Us
              </h3>
              <p className="text-gray-300 mb-3">
                Send your queries and we'll respond
              </p>
              <a 
                href="mailto:support@bhu-parichiye.com" 
                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
              >
                support@bhu-parichiye.com
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FaRocket className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Live Chat
              </h3>
              <p className="text-gray-300 mb-3">
                Chat with our experts instantly
              </p>
              <Link 
                to="/chat" 
                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
              >
                Start Chat Now
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Verified Properties</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Legal Compliance</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowUp, FaShieldAlt, FaCheckCircle, FaBuilding, FaUsers, FaLeaf, FaGlobe, FaRocket, FaStar, FaAward, FaClock, FaChartLine, FaSeedling, FaTree, FaCity, FaHandshake } from "react-icons/fa";
import { useState, useEffect } from "react";

const scrollOntop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

const Footer = () => {
  const [currentYear] = useState(new Date().getFullYear());
  const [emailHovered, setEmailHovered] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [visitorCount, setVisitorCount] = useState(52347);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate visitor count update
  useEffect(() => {
    const countTimer = setInterval(() => {
      setVisitorCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(countTimer);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      console.log('Newsletter subscription:', email);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const stats = [
    { icon: FaUsers, label: 'Active Users', value: '50,000+', color: 'from-emerald-500 to-cyan-500' },
    { icon: FaBuilding, label: 'Properties Listed', value: '12,500+', color: 'from-blue-500 to-purple-500' },
    { icon: FaShieldAlt, label: 'Verified Listings', value: '100%', color: 'from-emerald-500 to-green-500' },
    { icon: FaGlobe, label: 'Cities Covered', value: '200+', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern - Matching Hero */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 0v40M0 20h40' stroke='%23ffffff' stroke-width='0.5' fill-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Animated Gradient Overlay - Matching Hero */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-slate-900/50"></div>

      <div className="relative z-10">
        {/* Main Content - Matching Landing Page Style */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          {/* Brand Section - Matching Hero Style */}
          <div className="text-center mb-16">
            {/* Premium Badge - Matching Hero */}
            <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-sm font-medium mb-6 backdrop-blur-sm">
              <FaCheckCircle className="mr-2" />
              Trusted by 50,000+ Landowners & Renters
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Connect With
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mt-2">
                Bhu-Parichiye
              </span>
            </h2>

            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Your trusted partner for agricultural, commercial, recreational, and urban land opportunities. 
              Secure, transparent, and efficient land management platform.
            </p>
          </div>

          {/* Live Stats Section - Matching Landing Page Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Section - Matching Features Component Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-emerald-400/30 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <FaSeedling className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Agricultural Land</h3>
              <p className="text-gray-300 text-sm mb-4">Fertile farmland perfect for crops and sustainable agriculture</p>
              <div className="space-y-2">
                <div className="flex items-center text-emerald-400 text-sm">
                  <FaCheckCircle className="mr-2" />
                  Organic Certified
                </div>
                <div className="flex items-center text-emerald-400 text-sm">
                  <FaCheckCircle className="mr-2" />
                  Irrigation Ready
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-emerald-400/30 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                <FaBuilding className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Commercial Properties</h3>
              <p className="text-gray-300 text-sm mb-4">Prime commercial spaces for businesses and development</p>
              <div className="space-y-2">
                <div className="flex items-center text-emerald-400 text-sm">
                  <FaCheckCircle className="mr-2" />
                  High Traffic
                </div>
                <div className="flex items-center text-emerald-400 text-sm">
                  <FaCheckCircle className="mr-2" />
                  Zoning Approved
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-emerald-400/30 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4">
                <FaTree className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Recreational Land</h3>
              <p className="text-gray-300 text-sm mb-4">Beautiful natural spaces for parks and resorts</p>
              <div className="space-y-2">
                <div className="flex items-center text-emerald-400 text-sm">
                  <FaCheckCircle className="mr-2" />
                  Scenic Views
                </div>
                <div className="flex items-center text-emerald-400 text-sm">
                  <FaCheckCircle className="mr-2" />
                  Natural Resources
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-emerald-400/30 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <FaCity className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">Urban Development</h3>
              <p className="text-gray-300 text-sm mb-4">Strategic urban plots for modern development</p>
              <div className="space-y-2">
                <div className="flex items-center text-emerald-400 text-sm">
                  <FaCheckCircle className="mr-2" />
                  City Center
                </div>
                <div className="flex items-center text-emerald-400 text-sm">
                  <FaCheckCircle className="mr-2" />
                  Future Growth
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Newsletter Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-emerald-400/30 transition-all duration-500">
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
                  <FaEnvelope className="mr-3" />
                  Get In Touch
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                    <FaEnvelope className="mr-3 text-emerald-400" />
                    <div>
                      <p className="text-emerald-400 font-semibold">Email Support</p>
                      <p className="text-gray-300 text-sm">support@bhu-parichiye.com</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                    <FaPhone className="mr-3 text-emerald-400" />
                    <div>
                      <p className="text-emerald-400 font-semibold">Phone Support</p>
                      <p className="text-gray-300 text-sm">+91 XXXXX XXXXX</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                    <FaMapMarkerAlt className="mr-3 text-emerald-400" />
                    <div>
                      <p className="text-emerald-400 font-semibold">Visit Office</p>
                      <p className="text-gray-300 text-sm">Mumbai, India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/30 backdrop-blur-lg border border-emerald-400/40 rounded-2xl p-8 text-center hover:border-emerald-400/60 transition-all duration-500">
                <FaRocket className="text-4xl text-emerald-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
                <p className="text-emerald-100 text-lg leading-relaxed mb-6">
                  Get exclusive access to premium properties and market insights
                </p>
                
                {!subscribed ? (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105"
                    >
                      Subscribe
                    </button>
                  </form>
                ) : (
                  <div className="text-center">
                    <FaCheckCircle className="text-5xl text-emerald-400 mb-3" />
                    <p className="text-emerald-100 text-xl font-semibold">Successfully Subscribed!</p>
                    <p className="text-emerald-200/80">Check your email for exclusive insights</p>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Quick Navigation */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                Quick Access
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li>
                  <Link to="/" onClick={scrollOntop} className="group flex items-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all duration-300">
                    <span className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <span className="text-lg">🏠</span>
                    </span>
                    <div>
                      <p className="text-white text-base">Browse Listings</p>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="space-y-6 mt-4">
              <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                Premium Services
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:border-emerald-400/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaUsers className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-emerald-400 font-semibold">Expert Consultation</p>
                    <p className="text-gray-300 text-sm">Professional guidance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:border-emerald-400/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaShieldAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-emerald-400 font-semibold">Verified Listings</p>
                    <p className="text-gray-300 text-sm">100% authentic</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Hub */}
            <div className="space-y-6 mt-4">
              <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                Connect With Us
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:border-emerald-400/30 transition-all duration-300">
                  <FaEnvelope className="text-3xl text-emerald-400 mb-2" />
                  <p className="text-emerald-400 font-semibold">Email Support</p>
                  <p className="text-gray-300 text-sm">24/7 Response</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:border-emerald-400/30 transition-all duration-300">
                  <FaPhone className="text-3xl text-emerald-400 mb-2" />
                  <p className="text-emerald-400 font-semibold">Phone Support</p>
                  <p className="text-gray-300 text-sm">Expert Assistance</p>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:border-emerald-400/30 transition-all duration-300">
                  <FaMapMarkerAlt className="text-3xl text-emerald-400 mb-2" />
                  <p className="text-emerald-400 font-semibold">Visit Office</p>
                  <p className="text-gray-300 text-sm">Mumbai, India</p>
                </div>
              </div>
            </div>

            {/* Newsletter Premium */}
            <div className="lg:col-span-2 mt-12">
              <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/30 backdrop-blur-lg border border-emerald-400/40 rounded-2xl p-8 text-center hover:border-emerald-400/60 transition-all duration-500">
                <FaLeaf className="text-4xl text-emerald-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Stay Premium</h3>
                <p className="text-emerald-100 text-lg leading-relaxed mb-6">
                  Get exclusive access to premium properties, market insights, and expert recommendations
                </p>
                
                {!subscribed ? (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="Enter your premium email"
                      className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105"
                    >
                      Subscribe
                    </button>
                  </form>
                ) : (
                  <div className="text-center">
                    <FaCheckCircle className="text-5xl text-emerald-400 mb-3" />
                    <p className="text-emerald-100 text-xl font-semibold">Premium Access Activated!</p>
                    <p className="text-emerald-200/80">Check your email for exclusive insights</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Premium Divider */}
          <div className="my-12 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
            <div className="px-4">
              <span className="px-3 py-1 bg-emerald-400/20 backdrop-blur-sm border border-emerald-400/50 rounded-full text-xs font-semibold text-emerald-300">
                Trusted by {visitorCount.toLocaleString()} Users
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-400 to-transparent via-transparent"></div>
          </div>

          {/* Premium Bottom Section */}
          <div className="flex flex-col lg:flex-row justify-around items-center mt-10 pb-10">
            {/* Premium Copyright */}
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <div className="flex items-center mb-2">
                <span className="text-white text-sm">© {currentYear}</span>
                <span className="text-emerald-400 font-bold text-lg mx-2">Bhu-Parichiye</span>
                <span className="text-white text-xs bg-emerald-500/20 px-2 py-1 rounded-full">PREMIUM</span>
              </div>
              <p className="text-white text-sm">
                Empowering land transactions with <span className="text-emerald-400">AI technology</span> and <span className="text-cyan-400">blockchain security</span>
              </p>
              <div className="flex items-center mt-2 text-xs text-white">
                <FaClock className="mr-2" />
                <span>Server Time: {currentTime}</span>
              </div>
            </div>

            {/* Premium Social */}
            <div className="flex flex-col space-y-4">
              <div className="flex  space-x-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-2xl flex items-center justify-center hover:from-emerald-500/30 hover:to-cyan-500/30 hover:border-emerald-400/60 transition-all duration-300 hover:scale-110"
              >
                <FaFacebookF className="text-gray-300 group-hover:text-emerald-400 transition-colors text-xl" />
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-xs font-semibold text-emerald-100">Facebook</span>
                </div>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-2xl flex items-center justify-center hover:from-emerald-500/30 hover:to-cyan-500/30 hover:border-emerald-400/60 transition-all duration-300 hover:scale-110"
              >
                <FaTwitter className="text-gray-300 group-hover:text-emerald-400 transition-colors text-xl" />
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-xs font-semibold text-emerald-100">Twitter</span>
                </div>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-2xl flex items-center justify-center hover:from-emerald-500/30 hover:to-cyan-500/30 hover:border-emerald-400/60 transition-all duration-300 hover:scale-110"
              >
                <FaInstagram className="text-gray-300 group-hover:text-emerald-400 transition-colors text-xl" />
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-xs font-semibold text-emerald-100">Instagram</span>
                </div>
              </a>
              <a 
                href="https://linkedin.com/in/aryan-verma-554115283/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-2xl flex items-center justify-center hover:from-emerald-500/30 hover:to-cyan-500/30 hover:border-emerald-400/60 transition-all duration-300 hover:scale-110"
              >
                <FaLinkedinIn className="text-gray-300 group-hover:text-emerald-400 transition-colors text-xl" />
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-xs font-semibold text-emerald-100">LinkedIn</span>
                </div>
              </a>
              <a 
                href="https://github.com/Aryanverma24" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/30 rounded-2xl flex items-center justify-center hover:from-emerald-500/30 hover:to-cyan-500/30 hover:border-emerald-400/60 transition-all duration-300 hover:scale-110"
              >
                <FaGithub className="text-gray-300 group-hover:text-emerald-400 transition-colors text-xl" />
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-xs font-semibold text-emerald-100">GitHub</span>
                </div>
              </a>
            </div>
            </div>
        </div>
      </div>
  
    </footer>
  );
};

export default Footer;

import { FaSearch, FaMapMarkerAlt, FaFilter, FaChartLine } from "react-icons/fa";
import { useState } from "react";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All Properties", icon: FaSearch },
    { id: "trending", label: "Trending", icon: FaChartLine },
    { id: "featured", label: "Featured", icon: FaFilter }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Background Grid Pattern - Matching Hero */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M20 0v40M0 20h40' stroke='%23ffffff' stroke-width='0.5' fill-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Animated Gradient Overlay - Matching Hero */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-slate-900/50"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Premium Badge - Matching Hero */}
          <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-400 text-sm font-medium mb-6 backdrop-blur-sm">
            <FaMapMarkerAlt className="mr-2" />
            Premium Land Properties
          </div>

          {/* Main Heading - Matching Hero */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Discover Your
            <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mt-2">
              Perfect Land
            </span>
          </h1>

          {/* Enhanced Subheading - Matching Hero */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
            Browse through our extensive collection of premium land properties, 
            from residential plots to commercial spaces, find exactly what you're looking for.
          </p>

          {/* Search Bar - Matching Landing Page Style */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-emerald-400 text-xl" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all duration-300"
                placeholder="Search by location, property type, or keywords..."
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Tabs - Matching Landing Page Style */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105 ${
                    activeTab === tab.id
                      ? "ring-2 ring-emerald-400/50"
                      : "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                  }`}
                >
                  <Icon className="mr-3 group-hover:scale-110 transition-transform" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Stats with Enhanced Design - Matching Hero */}
          <div className="grid grid-cols-3 gap-6 max-w-lg">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">5,000+</div>
              <div className="text-gray-400 text-sm">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-1">98%</div>
              <div className="text-gray-400 text-sm">Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-1">24/7</div>
              <div className="text-gray-400 text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade - Matching Hero */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
    </section>
  );
};

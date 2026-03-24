import { FaSeedling, FaBuilding, FaTree, FaCity, FaShieldAlt, FaHandshake, FaChartLine, FaUsers, FaArrowRight, FaCheck } from "react-icons/fa";

const Features = () => {
  const features = [
    {
      icon: FaSeedling,
      title: "Agricultural Land",
      description: "Fertile farmland perfect for crops, livestock, and sustainable agriculture projects.",
      color: "from-green-500 to-emerald-600",
      highlights: ["Organic Certified", "Irrigation Ready", "High Yield"]
    },
    {
      icon: FaBuilding,
      title: "Commercial Properties",
      description: "Prime commercial spaces for businesses, retail, and industrial development.",
      color: "from-blue-500 to-cyan-600",
      highlights: ["High Traffic", "Zoning Approved", "Infrastructure"]
    },
    {
      icon: FaTree,
      title: "Recreational Land",
      description: "Beautiful natural spaces perfect for parks, resorts, and outdoor activities.",
      color: "from-emerald-500 to-teal-600",
      highlights: ["Scenic Views", "Natural Resources", "Tourism Potential"]
    },
    {
      icon: FaCity,
      title: "Urban Development",
      description: "Strategic urban plots for residential complexes and modern city development.",
      color: "from-purple-500 to-indigo-600",
      highlights: ["City Center", "Future Growth", "Smart City Ready"]
    }
  ];

  const benefits = [
    {
      icon: FaShieldAlt,
      title: "Verified Listings",
      description: "All properties are thoroughly verified by legal experts for your peace of mind.",
      features: ["Legal Verification", "Document Authentication", "Title Clearance"]
    },
    {
      icon: FaHandshake,
      title: "Secure Transactions",
      description: "End-to-end encrypted transactions with smart contract protection.",
      features: ["Escrow Protection", "Smart Contracts", "Instant Settlement"]
    },
    {
      icon: FaChartLine,
      title: "Market Insights",
      description: "Real-time market data and analytics to make informed decisions.",
      features: ["Price Trends", "ROI Analysis", "Market Reports"]
    },
    {
      icon: FaUsers,
      title: "Expert Support",
      description: "24/7 customer support with land management and legal experts.",
      features: ["24/7 Available", "Expert Consultation", "Dedicated Manager"]
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-emerald-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            Discover Our Premium Land Types
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Diverse
            <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Land Opportunities
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From fertile farmland to prime commercial spaces, find the perfect land for your vision
          </p>
        </div>

        {/* Enhanced Land Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 border border-gray-100 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-700`}></div>
              
              {/* Icon */}
              <div className={`relative w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <feature.icon className="text-white text-3xl" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Highlights */}
              <div className="space-y-2">
                {feature.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-500">
                    <FaCheck className="text-emerald-500 mr-2 text-xs" />
                    {highlight}
                  </div>
                ))}
              </div>

              {/* Arrow Indicator */}
              <div className="mt-6 flex items-center text-emerald-600 font-medium text-sm group-hover:text-emerald-700 transition-colors">
                Learn more
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Benefits Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-3xl p-12 shadow-xl border border-emerald-100 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                Why Choose Bhu-Parichiye
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Premium Features for
                <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Smart Land Investment
                </span>
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience the future of land management with cutting-edge technology and expert support
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center group">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform duration-500 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 transform rotate-45 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                    <benefit.icon className="text-white text-3xl relative z-10" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {benefit.description}
                  </p>
                  <div className="space-y-1">
                    {benefit.features.map((feature, idx) => (
                      <div key={idx} className="text-xs text-gray-500 flex items-center justify-center">
                        <FaCheck className="text-emerald-500 mr-1" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

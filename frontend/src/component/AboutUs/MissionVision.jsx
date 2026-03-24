import { FaBullseye, FaEye, FaLightbulb, FaHandshake } from "react-icons/fa";

export const MissionVision = () => {
  return (
    <section className="py-20 lg:py-24 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <FaLightbulb className="mr-2" />
            Our Purpose
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Mission &
            <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Vision
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Guided by our commitment to excellence and innovation in land management solutions
          </p>
        </div>

        {/* Mission and Vision Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Mission Card */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-3xl p-8 lg:p-12 shadow-2xl border border-emerald-100 hover:shadow-3xl transition-all duration-700">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                  <FaBullseye className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                To revolutionize land management through innovative technology solutions that empower 
                individuals and organizations to make informed decisions about land assets. We strive to 
                simplify complex processes and provide accessible tools for everyone.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Innovative technology solutions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Empowering informed decisions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Accessible tools for everyone</span>
                </div>
              </div>
            </div>
            
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
          </div>

          {/* Vision Card */}
          <div className="relative group">
            <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-3xl p-8 lg:p-12 shadow-2xl border border-cyan-100 hover:shadow-3xl transition-all duration-700">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                  <FaEye className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"></div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                To become the global leader in land management technology, creating a world where 
                land-related decisions are data-driven, transparent, and efficient. We envision a future 
                where land management is seamless and accessible to all.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Global leadership in technology</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Data-driven decision making</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Transparent and efficient processes</span>
                </div>
              </div>
            </div>
            
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl shadow-xl">
            <FaHandshake className="mr-3 text-xl" />
            <span className="font-bold text-lg">Built on Trust & Innovation</span>
          </div>
        </div>
      </div>
    </section>
  );
};

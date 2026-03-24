import { FaMapMarkerAlt, FaLandmark, FaChartLine, FaCity } from "react-icons/fa";
import { useState, useEffect } from "react";

export const Stats = ({ stats }) => {
  const [animatedStats, setAnimatedStats] = useState({
    totalLands: 0,
    avgPrice: 0,
    cities: 0,
    landTypes: 0
  });

  const targetStats = {
    totalLands: stats.totalLands || 1247,
    avgPrice: stats.avgPrice || 2500000,
    cities: stats.cities || 45,
    landTypes: stats.landTypes || 7
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      setAnimatedStats(prev => {
        const newStats = { ...prev };
        let allComplete = true;

        Object.keys(newStats).forEach(key => {
          const target = targetStats[key];
          const increment = (target - prev[key]) / (steps - Object.keys(prev).filter(k => prev[k] >= targetStats[k]).length);
          
          if (newStats[key] < target) {
            newStats[key] = Math.min(newStats[key] + increment, target);
            allComplete = false;
          }
        });

        if (allComplete) {
          clearInterval(timer);
        }

        return newStats;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [stats]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return Math.round(num).toString();
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return '₹' + (price / 10000000).toFixed(1) + 'Cr+';
    } else if (price >= 100000) {
      return '₹' + (price / 100000).toFixed(1) + 'L+';
    }
    return '₹' + Math.round(price).toLocaleString();
  };

  const statsData = [
    {
      icon: FaLandmark,
      value: formatNumber(animatedStats.totalLands),
      label: "Total Properties",
      color: "from-emerald-500 to-cyan-500",
      bgColor: "from-emerald-100 to-cyan-100"
    },
    {
      icon: FaChartLine,
      value: formatPrice(animatedStats.avgPrice),
      label: "Average Price",
      color: "from-blue-500 to-purple-500",
      bgColor: "from-blue-100 to-purple-100"
    },
    {
      icon: FaCity,
      value: Math.round(animatedStats.cities) + '+',
      label: "Cities Covered",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-100 to-red-100"
    },
    {
      icon: FaMapMarkerAlt,
      value: Math.round(animatedStats.landTypes) + '+',
      label: "Land Types",
      color: "from-rose-500 to-pink-500",
      bgColor: "from-rose-100 to-pink-100"
    }
  ];

  return (
    <section className="py-12 lg:py-16 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Platform
            <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Statistics
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real-time data showing our growing network and market presence
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Stat Card */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-700 border border-white/20 text-center">
                  
                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor}/10 transition-opacity duration-700 opacity-0 group-hover:opacity-100`}></div>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className={`text-2xl text-black/80`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    
                    <p className="text-gray-600 font-medium">
                      {stat.label}
                    </p>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700`}></div>
              </div>
            );
          })}
        </div>

        {/* Achievement Badges */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-sm font-medium">
              <FaChartLine className="mr-2 text-emerald-600 " />
              Growing Fast
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">
              <FaCity className="mr-2 text-blue-600" />
              Nationwide Coverage
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full text-sm font-medium">
              <FaLandmark className="mr-2 text-orange-600" />
              Premium Properties
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { FaUsers, FaMapMarkerAlt, FaRocket, FaShieldAlt, FaClock, FaStar } from "react-icons/fa";
import { useState, useEffect } from "react";

export const Stats = () => {
  const [counters, setCounters] = useState({
    users: 0,
    properties: 0,
    satisfaction: 0,
    years: 0
  });

  const targetStats = {
    users: 10000,
    properties: 5000,
    satisfaction: 98,
    years: 5
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      setCounters(prev => {
        const newCounters = { ...prev };
        let allComplete = true;

        Object.keys(newCounters).forEach(key => {
          const target = targetStats[key];
          const increment = (target - prev[key]) / (steps - Object.keys(prev).filter(k => prev[k] >= targetStats[k]).length);
          
          if (newCounters[key] < target) {
            newCounters[key] = Math.min(newCounters[key] + increment, target);
            allComplete = false;
          }
        });

        if (allComplete) {
          clearInterval(timer);
        }

        return newCounters;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      icon: FaUsers,
      value: Math.round(counters.users).toLocaleString(),
      label: "Active Users",
      suffix: "+",
      color: "from-emerald-500 to-cyan-500",
      bgColor: "from-emerald-100 to-cyan-100"
    },
    {
      icon: FaMapMarkerAlt,
      value: Math.round(counters.properties).toLocaleString(),
      label: "Properties Listed",
      suffix: "+",
      color: "from-blue-500 to-purple-500",
      bgColor: "from-blue-100 to-purple-100"
    },
    {
      icon: FaStar,
      value: Math.round(counters.satisfaction),
      label: "Satisfaction Rate",
      suffix: "%",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-100 to-orange-100"
    },
    {
      icon: FaClock,
      value: Math.round(counters.years),
      label: "Years of Innovation",
      suffix: "+",
      color: "from-rose-500 to-pink-500",
      bgColor: "from-rose-100 to-pink-100"
    }
  ];

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <FaRocket className="mr-2" />
            Our Impact
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Numbers That
            <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Speak for Themselves
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our growth and impact measured in real numbers, reflecting our commitment to excellence
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Stat Card */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-700 border border-white/20 hover:border-emerald-200/50 text-center">
                  
                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor}/20 transition-opacity duration-700 opacity-0 group-hover:opacity-100`}></div>

                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110`}>
                      <Icon className={`text-2xl bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                      {stat.value}
                      <span className="text-2xl sm:text-3xl">{stat.suffix}</span>
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
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-sm font-medium">
              <FaShieldAlt className="mr-2" />
              Trusted Platform
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">
              <FaStar className="mr-2" />
              Top Rated
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 rounded-full text-sm font-medium">
              <FaRocket className="mr-2" />
              Fast Growing
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

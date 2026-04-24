import {
  FaHeart,
  FaLightbulb,
  FaHandshake,
  FaRocket,
  FaShieldAlt,
  FaUsers,
} from 'react-icons/fa';

export const Values = () => {
  const values = [
    {
      icon: FaHeart,
      title: 'User-Centric',
      description:
        'We prioritize user needs and experience in every decision we make, ensuring our solutions truly solve real problems.',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: FaLightbulb,
      title: 'Innovation',
      description:
        'We constantly push boundaries and explore new technologies to deliver cutting-edge solutions.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: FaHandshake,
      title: 'Integrity',
      description:
        'We operate with transparency and honesty, building trust through our actions and commitments.',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: FaRocket,
      title: 'Excellence',
      description:
        'We strive for the highest quality in everything we do, never compromising on standards.',
      color: 'from-emerald-500 to-cyan-500',
    },
    {
      icon: FaShieldAlt,
      title: 'Security',
      description:
        'We protect user data and ensure the safety and reliability of our platform.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FaUsers,
      title: 'Collaboration',
      description:
        'We believe in the power of teamwork and diverse perspectives to create better solutions.',
      color: 'from-teal-500 to-green-500',
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <FaHeart className="mr-2" />
            Our Core Values
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Principles That
            <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Guide Us
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            These core values are the foundation of our culture and the driving force
            behind our innovation
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;

            return (
              <div key={index} className="group relative">
                {/* Value Card */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-700 border border-white/20 hover:border-emerald-200/50 h-full">
                  {/* Gradient Overlay on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${value.color}/5 transition-opacity duration-700 opacity-0 group-hover:opacity-100`}
                  ></div>

                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon className="text-white text-2xl" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center relative z-10">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                      {value.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${value.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <FaRocket className="mr-3 text-xl" />
            <span className="font-bold text-lg">Living Our Values Every Day</span>
          </div>
        </div>
      </div>
    </section>
  );
};

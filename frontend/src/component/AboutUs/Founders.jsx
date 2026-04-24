import {
  FaUsers,
  FaCode,
  FaLaptopCode,
  FaPaintBrush,
  FaCogs,
  FaLinkedin,
  FaGithub,
  FaTwitter,
} from 'react-icons/fa';
import { useState } from 'react';

export const Founders = () => {
  const [hoveredFounder, setHoveredFounder] = useState(null);

  const founders = [
    {
      name: 'Ankur Painyuli',
      role: 'Co-Founder',
      specialization: 'Product Vision & Innovation',
      description:
        'Focused on product vision, innovation, and overall platform development. Driving the strategic direction and ensuring cutting-edge solutions.',
      icon: FaLaptopCode,
      skills: ['Product Strategy', 'Innovation', 'Platform Development'],
      color: 'from-emerald-500 to-cyan-500',
    },
    {
      name: 'Aryan Verma',
      role: 'Co-Founder',
      specialization: 'Backend Development',
      description:
        'Specializing in backend development and system architecture. Building robust and scalable infrastructure for our platform.',
      icon: FaCode,
      skills: ['Backend Development', 'System Architecture', 'Scalability'],
      color: 'from-blue-500 to-purple-500',
    },
    {
      name: 'Raunak Singh',
      role: 'Co-Founder',
      specialization: 'Technical Implementation',
      description:
        'Driving technical implementation and system integration. Ensuring seamless functionality and optimal performance.',
      icon: FaCogs,
      skills: ['Technical Implementation', 'System Integration', 'Performance'],
      color: 'from-orange-500 to-red-500',
    },
    {
      name: 'Simran Kaur',
      role: 'Co-Founder',
      specialization: 'Design & UX',
      description:
        'Leading design, user experience, and frontend development. Creating intuitive and beautiful user interfaces.',
      icon: FaPaintBrush,
      skills: ['UI/UX Design', 'Frontend Development', 'User Experience'],
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <FaUsers className="mr-2" />
            Our Founders
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Meet the
            <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Leadership Team
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4">
            Bhu-Parichiye was founded by a team of passionate innovators who aim to solve
            real-world land management challenges through technology:
          </p>
        </div>

        {/* Founders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {founders.map((founder, index) => {
            const Icon = founder.icon;
            const isHovered = hoveredFounder === index;

            return (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => setHoveredFounder(index)}
                onMouseLeave={() => setHoveredFounder(null)}
              >
                {/* Founder Card */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden border border-white/20 hover:border-emerald-200/50">
                  {/* Gradient Overlay on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${founder.color}/5 transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                  ></div>

                  {/* Profile Section */}
                  <div className="relative p-6 sm:p-8">
                    {/* Avatar Placeholder */}
                    <div className="flex justify-center mb-6">
                      <div
                        className={`w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br ${founder.color} rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
                      >
                        <Icon className="text-white text-3xl sm:text-4xl" />
                      </div>
                    </div>

                    {/* Founder Info */}
                    <div className="text-center">
                      <div className="mb-2">
                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-xs font-bold">
                          {founder.role}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {founder.name}
                      </h3>

                      <p className="text-sm font-semibold text-emerald-600 mb-4">
                        {founder.specialization}
                      </p>

                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        {founder.description}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {founder.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Social Links */}
                      <div className="flex justify-center space-x-3">
                        <button className="w-8 h-8 bg-gray-100 hover:bg-emerald-100 rounded-full flex items-center justify-center transition-colors">
                          <FaLinkedin className="text-gray-600 hover:text-emerald-600 text-sm" />
                        </button>
                        <button className="w-8 h-8 bg-gray-100 hover:bg-emerald-100 rounded-full flex items-center justify-center transition-colors">
                          <FaGithub className="text-gray-600 hover:text-emerald-600 text-sm" />
                        </button>
                        <button className="w-8 h-8 bg-gray-100 hover:bg-emerald-100 rounded-full flex items-center justify-center transition-colors">
                          <FaTwitter className="text-gray-600 hover:text-emerald-600 text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${founder.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Team Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  4+
                </div>
                <div className="text-sm text-gray-600">Founders</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  100%
                </div>
                <div className="text-sm text-gray-600">Dedicated</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Innovation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

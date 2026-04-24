import { FaSearch, FaHandshake, FaFileContract, FaCheckCircle } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: FaSearch,
      title: 'Search & Discover',
      description:
        'Browse through our extensive collection of verified land properties with advanced filters.',
      details: [
        'Advanced search filters',
        'Interactive maps',
        'Detailed property information',
      ],
    },
    {
      icon: FaHandshake,
      title: 'Connect & Negotiate',
      description:
        'Get in touch with property owners and negotiate terms through our secure platform.',
      details: ['Direct messaging', 'Secure communication', 'Negotiation tools'],
    },
    {
      icon: FaFileContract,
      title: 'Legal Verification',
      description:
        'Our legal experts verify all documents and ensure compliance with regulations.',
      details: ['Document verification', 'Legal compliance', 'Expert review'],
    },
    {
      icon: FaCheckCircle,
      title: 'Complete Transaction',
      description:
        'Finalize your deal with secure payment processing and instant documentation.',
      details: ['Secure payments', 'Digital contracts', 'Instant documentation'],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-emerald-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Four simple steps to find and secure your perfect land property
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                  {index + 1}
                </div>

                {/* Step Card */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-500 hover:scale-105 group">
                  {/* Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="text-white text-3xl" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{step.description}</p>

                  {/* Details List */}
                  <ul className="space-y-2 text-left">
                    {step.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-center text-sm text-gray-400"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow Connector (Mobile) */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 transform rotate-45"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-gray-300 mb-6">
              Join thousands of satisfied customers who found their perfect land through
              Bhu-Parichiye
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25">
                Browse Properties
              </button>
              <button className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

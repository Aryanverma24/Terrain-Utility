import React, { useState } from 'react';
import {
  FaHeadset,
  FaBook,
  FaQuestionCircle,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
  FaVideo,
  FaDownload,
  FaExternalLinkAlt,
  FaLifeRing,
  FaTools,
  FaShieldAlt,
  FaClock,
} from 'react-icons/fa';
import AdminDashboardLayout from '../AdminDashoardLayout';

const HelpSupport = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: FaRocket,
      color: 'emerald',
    },
    {
      id: 'account-management',
      title: 'Account Management',
      icon: FaUserCircle,
      color: 'blue',
    },
    {
      id: 'land-listing',
      title: 'Land Listing',
      icon: FaLandmark,
      color: 'purple',
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: FaCreditCard,
      color: 'green',
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: FaTools,
      color: 'orange',
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: FaShieldAlt,
      color: 'red',
    },
  ];

  const faqs = {
    'getting-started': [
      {
        question: 'How do I create an account?',
        answer:
          'Click on the "Register" button in the top navigation and follow the simple registration process. You\'ll need to provide your email, create a password, and verify your email address.',
      },
      {
        question: 'What documents do I need to list a property?',
        answer:
          'For residential properties: Title deed, property tax records, recent utility bills. For commercial properties: Business license, zoning permits, environmental impact reports. For agricultural land: Soil test results, water rights documentation, crop history.',
      },
      {
        question: 'How do I contact customer support?',
        answer:
          'You can reach our support team through multiple channels: Email: support@bhu-parichiye.com, Phone: 1-800-BHUPARI, Live Chat: Available on our website, Help Center: Comprehensive FAQ and video tutorials.',
      },
      {
        question: 'What are the platform fees?',
        answer:
          'Listing fees: 2% of final sale price for successful transactions. Featured listings: $10/month for premium placement. Verification services: $50 per property verification. Withdrawal fees: 2% processing fee for bank withdrawals.',
      },
    ],
    'account-management': [
      {
        question: 'How do I reset my password?',
        answer:
          'Click on "Forgot Password" link on the login page. Enter your registered email address and we\'ll send you a password reset link. The link expires in 24 hours for security reasons.',
      },
      {
        question: 'How do I update my profile information?',
        answer:
          'Navigate to your profile section and click "Edit Profile". Update your personal information, contact details, and preferences. Changes are saved automatically.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'Go to Settings > Account Management > Delete Account. Please note that account deletion is permanent and cannot be undone. We recommend downloading your data before deleting.',
      },
      {
        question: 'What is two-factor authentication?',
        answer:
          "2FA adds an extra layer of security to your account. Even if someone knows your password, they won't be able to access your account without the verification code sent to your phone or email.",
      },
    ],
    'land-listing': [
      {
        question: 'What makes a good property listing?',
        answer:
          'High-quality photos from multiple angles, detailed and accurate descriptions, competitive pricing, clear title, complete location details, and all required legal documentation.',
      },
      {
        question: 'How do I mark my property as sold?',
        answer:
          'Once you have a buyer, go to your property listing and click "Mark as Sold". You\'ll need to provide the sale price and transaction details. Both parties will receive confirmation.',
      },
      {
        question: 'What are the listing guidelines?',
        answer:
          'Properties must be accurately described, legally owned, have proper documentation, comply with zoning laws, and not misrepresent any facts. Prohibited items: illegal properties, fraudulent information, misleading descriptions.',
      },
    ],
    payments: [
      {
        question: 'What payment methods are accepted?',
        answer:
          'We accept credit/debit cards, bank transfers, and digital wallets. All payments are processed securely through our encrypted payment gateway. Processing time: 1-3 business days.',
      },
      {
        question: 'How do I get paid?',
        answer:
          'Funds are typically released within 24-48 hours after a successful transaction. You can choose to receive payments via direct deposit, check, or wire transfer to your bank account.',
      },
      {
        question: 'Are there any hidden fees?',
        answer:
          'We believe in transparency. All fees are clearly displayed before you confirm any transaction. No hidden charges or surprise costs.',
      },
    ],
    technical: [
      {
        question: 'What browsers are supported?',
        answer:
          'We recommend using the latest versions of Chrome, Firefox, Safari, or Edge for the best experience. Make sure JavaScript and cookies are enabled for full functionality.',
      },
      {
        question: 'Is my data secure?',
        answer:
          'Yes, we use industry-standard SSL encryption for all data transmission. Your information is stored securely and never shared with third parties without your consent.',
      },
      {
        question: 'What if I encounter a bug?',
        answer:
          'Report any issues through our Help Center or email support@bhu-parichiye.com. Our technical team typically responds within 24 hours. For urgent issues, call our hotline at 1-800-BHUPARI.',
      },
    ],
    security: [
      {
        question: 'How does Bhu-Parichiye protect my data?',
        answer:
          'We use bank-level encryption, regular security audits, GDPR compliance, and never share your data without explicit consent. You can request a copy of your data at any time.',
      },
      {
        question: "What is Bhu-Parichiye's privacy policy?",
        answer:
          'We collect only essential information needed for our services. We never sell your data to third parties, and you can review, update, or delete your information at any time through your account settings.',
      },
      {
        question: 'What should I do if I suspect unauthorized access?',
        answer:
          'Immediately change your password and enable two-factor authentication. Review your account activity for any suspicious actions and contact our support team immediately.',
      },
    ],
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setExpandedFaq(null);
  };

  const handleFaqToggle = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const getCategoryFaqs = () => {
    return faqs[activeCategory] || [];
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl mr-4">
            <FaHeadset className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Help & Support</h2>
            <p className="text-gray-400 text-sm mt-1">
              Comprehensive guides and support resources
            </p>
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'ring-2 ring-emerald-500 border-emerald-500'
                    : 'hover:ring-2 ring-gray-300 border-gray-400'
                }`}
              >
                <div className="text-center">
                  <Icon
                    className={`text-3xl mb-3 ${category.color === 'emerald' ? 'text-emerald-400' : category.color === 'blue' ? 'text-blue-400' : category.color === 'purple' ? 'text-purple-400' : category.color === 'green' ? 'text-green-400' : category.color === 'orange' ? 'text-orange-400' : 'text-red-400'}`}
                  />
                  <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">Browse help articles</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Frequently Asked Questions
            </h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all duration-200">
                Search FAQs
              </button>
              <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200">
                Contact Support
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {getCategoryFaqs().map((faq, index) => (
              <div key={index} className="border-b border-white/10 last:border-b-0">
                <button
                  onClick={() => handleFaqToggle(index)}
                  className="w-full text-left p-4 hover:bg-white/15 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-300">{faq.question}</h4>
                    <FaQuestionCircle className="text-gray-400 flex-shrink-0" />
                  </div>
                  <FaBook
                    className={`text-emerald-400 transition-transform duration-200 ${expandedFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedFaq === index && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300">
            <FaVideo className="text-3xl text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white">Video Tutorials</h3>
            <p className="text-gray-400 text-sm mt-1">Step-by-step guides</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300">
            <FaFileAlt className="text-3xl text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white">Documentation</h3>
            <p className="text-gray-400 text-sm mt-1">User guides & API docs</p>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
          <div className="text-center">
            <FaEnvelope className="text-3xl text-emerald-400 mb-3" />
            <h3 className="text-lg font-semibold text-white">Contact Support</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <FaPhone className="text-gray-400" />
                <span className="text-gray-300">1-800-TERRAIN</span>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <FaEnvelope className="text-gray-400" />
                <span className="text-gray-300">support@terrainutility.com</span>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <FaExternalLinkAlt className="text-gray-400" />
                <span className="text-gray-300">Live Chat</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105">
              <FaLifeRing className="mr-2" />
              24/7 Premium Support
            </button>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default HelpSupport;

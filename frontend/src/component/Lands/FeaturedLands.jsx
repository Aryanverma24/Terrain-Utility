import { Link } from 'react-router-dom';
import {
  FaStar,
  FaMapMarkerAlt,
  FaHeart,
  FaEye,
  FaArrowRight,
  FaShieldAlt,
} from 'react-icons/fa';
import { useState } from 'react';
import { getFileUrl } from '../../../../backend/utils/getFileUrl';
export const FeaturedLands = ({ lands, loading }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const calculateAverageRating = (reviews) => {
    if (!reviews?.length) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`text-xs ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center mb-6">
          <FaShieldAlt className="text-emerald-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Featured Properties</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-32 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (lands.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center mb-6">
          <FaShieldAlt className="text-emerald-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Featured Properties</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg">No featured properties available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaShieldAlt className="text-emerald-600 mr-3 text-xl" />
          <h3 className="text-xl font-bold text-gray-900">Featured Properties</h3>
        </div>
        <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-xs font-bold">
          Premium
        </div>
      </div>

      {/* Featured Lands Grid */}
      <div className="space-y-6">
        {lands
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map((land, index) => {
            const averageRating = calculateAverageRating(land.reviews);
            const isHovered = hoveredCard === land._id;

            return (
              <div
                key={land._id}
                className="group relative"
                onMouseEnter={() => setHoveredCard(land._id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Premium Card */}
                <div className="relative overflow-hidden rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all duration-300">
                  {/* Property Image */}
                  <div className="relative h-32">
                    {land.image ? (
                      <img
                        src={getFileUrl(land.image)}
                        alt={land.landtype || 'land'}
                        className="w-full h-full object-cover transition-transform duration-500"
                        style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                        <FaMapMarkerAlt className="text-emerald-600 text-3xl" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    {/* Premium Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                        PREMIUM
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div
                      className={`absolute top-3 right-3 flex space-x-2 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300">
                        <FaHeart className="text-sm text-gray-600 hover:text-red-500" />
                      </button>
                      <Link
                        to={`/land/${land._id}`}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                      >
                        <FaEye className="text-sm text-gray-600 hover:text-emerald-600" />
                      </Link>
                    </div>

                    {/* Location Badge */}
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <FaMapMarkerAlt className="mr-1 text-xs" />
                        {land.city?.charAt(0).toUpperCase() + land.city?.slice(1) ||
                          'Location'}
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors truncate">
                          {land.city?.charAt(0).toUpperCase() + land.city?.slice(1) ||
                            'Prime Location'}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {land.landtype?.charAt(0).toUpperCase() +
                            land.landtype?.slice(1) || 'Land'}{' '}
                          • {land.area || 'N/A'} acres
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                          ₹
                          {land.price
                            ? (land.price / 100000).toFixed(1) + 'L'
                            : 'Contact'}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {renderStars(averageRating)}
                        <span className="text-xs text-gray-500 ml-1">
                          ({land.reviews?.length || 0})
                        </span>
                      </div>
                      <div className="text-xs text-emerald-600 font-medium">Verified</div>
                    </div>

                    {/* CTA Button */}
                    <div
                      className={`mt-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
                    >
                      <Link
                        to={`/land/${land._id}`}
                        className="flex items-center justify-center w-full px-3 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-emerald-500/25"
                      >
                        View Details
                        <FaArrowRight className="ml-1 text-xs" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          to="/lands?filter=featured"
          className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
        >
          View All Featured
          <FaArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

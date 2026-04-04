import { Link } from "react-router-dom";
import { FaChartLine, FaHeart, FaMapMarkerAlt, FaEye, FaStar, FaArrowRight } from "react-icons/fa";
import { useState } from "react";

export const TrendingLands = ({ lands, loading }) => {
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
          <FaChartLine className="text-emerald-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Trending Properties</h3>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex space-x-4">
                <div className="bg-gray-200 rounded-xl w-24 h-24"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
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
          <FaChartLine className="text-emerald-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Trending Properties</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg">No trending properties available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaChartLine className="text-emerald-600 mr-3 text-xl" />
          <h3 className="text-xl font-bold text-gray-900">Trending Properties</h3>
        </div>
        <div className="flex items-center text-sm text-emerald-600">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
          Live
        </div>
      </div>

      {/* Trending Lands List */}
      <div className="space-y-4">
        {lands.slice(0, 4).map((land, index) => {
          const averageRating = calculateAverageRating(land.reviews);
          const isHovered = hoveredCard === land._id;

          return (
            <div
              key={land._id}
              className="group relative"
              onMouseEnter={() => setHoveredCard(land._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex space-x-4 p-3 rounded-xl hover:bg-emerald-50/50 transition-all duration-300 cursor-pointer">
                {/* Property Image */}
                <div className="relative flex-shrink-0">
                  {land.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${land.image}`}
                      alt={land.landtype || "land"}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-xl flex items-center justify-center">
                      <FaMapMarkerAlt className="text-emerald-600 text-2xl" />
                    </div>
                  )}
                  
                  {/* Trending Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <FaChartLine className="mr-1 text-xs" />
                    #{index + 1}
                  </div>
                </div>

                {/* Property Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors truncate">
                        {land.city?.charAt(0).toUpperCase() + land.city?.slice(1) || 'Prime Location'}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {land.landtype?.charAt(0).toUpperCase() + land.landtype?.slice(1) || 'Land'} • {land.area || 'N/A'} acres
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        ₹{land.price ? (land.price / 100000).toFixed(1) + 'L' : 'Contact'}
                      </div>
                    </div>
                  </div>

                  {/* Rating and Location */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {renderStars(averageRating)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({land.reviews?.length || 0})
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaMapMarkerAlt className="mr-1" />
                      {land.city || 'Location'}
                    </div>
                  </div>

                  {/* Action Buttons on Hover */}
                  <div className={`flex items-center space-x-2 mt-2 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button className="flex items-center px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                      <FaHeart className="mr-1" />
                      Save
                    </button>
                    <Link
                      to={`/land/${land._id}`}
                      className="flex items-center px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-colors"
                    >
                      <FaEye className="mr-1" />
                      View
                    </Link>
                  </div>
                </div>
              </div>

              {/* Divider */}
              {index < lands.slice(0, 4).length - 1 && (
                <div className="border-b border-gray-100"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          to="/lands?filter=trending"
          className="flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
        >
          View All Trending
          <FaArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

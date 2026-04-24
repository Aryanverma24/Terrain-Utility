import { Link } from 'react-router-dom';
import {
  FaHeart,
  FaMapMarkerAlt,
  FaExpand,
  FaTag,
  FaEye,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa';
import { useState } from 'react';
import { getFileUrl } from '../../../../backend/utils/getFileUrl';
export const LandGrid = ({ lands, loading, currentPage }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const calculateAverageRating = (reviews) => {
    if (!reviews?.length) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleWishlist = (e, landId) => {
    e.preventDefault();
    const isInWishlist = wishlist.includes(landId);

    if (isInWishlist) {
      setWishlist(wishlist.filter((id) => id !== landId));
      // TODO: Call API to remove from wishlist
    } else {
      setWishlist([...wishlist, landId]);
      // TODO: Call API to add to wishlist
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (lands.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
          <FaMapMarkerAlt className="text-3xl text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No Properties Found</h3>
        <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
          Try adjusting your filters or search criteria to find more properties.
        </p>
        <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25">
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lands.map((land, index) => {
        const averageRating = calculateAverageRating(land.reviews);
        const isInWishlist = wishlist.includes(land._id);
        const isHovered = hoveredCard === land._id;

        return (
          <div
            key={land._id}
            className="group relative"
            onMouseEnter={() => setHoveredCard(land._id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Premium Card - Matching Landing Page Style */}
            <div className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:border-emerald-400/30 transition-all duration-500 overflow-hidden hover:-translate-y-2">
              {/* Gradient Overlay on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              ></div>

              {/* Property Image */}
              <div className="relative h-48 overflow-hidden">
                {land.image ? (
                  <>
                    <img
                      src={getFileUrl(land.image)}
                      alt={land.landtype || 'land'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                    <div className="text-emerald-600 text-4xl">
                      <FaMapMarkerAlt />
                    </div>
                  </div>
                )}

                {/* Floating Action Buttons */}
                <div
                  className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-500 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                >
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => handleWishlist(e, land._id)}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
                  >
                    <FaHeart
                      className={`text-lg transition-colors ${
                        isInWishlist
                          ? 'text-red-500'
                          : 'text-gray-400 group-hover:text-red-500'
                      }`}
                    />
                  </button>

                  {/* Quick View Button */}
                  <Link
                    to={`/land/${land._id}`}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                  >
                    <FaEye className="text-lg text-gray-600 hover:text-emerald-600 transition-colors" />
                  </Link>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                    {land.status === 'approved' ? (
                      <>
                        <FaCheckCircle className="mr-1" />
                        VERIFIED
                      </>
                    ) : (
                      <span>PENDING</span>
                    )}
                  </div>
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
              <div className="p-4 relative z-10">
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <FaTag className="mr-1 text-xs" />
                      {land.landtype?.charAt(0).toUpperCase() + land.landtype?.slice(1) ||
                        'Land'}
                    </span>
                    <div className="flex items-center">
                      {renderStars(averageRating)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({land.reviews?.length || 0})
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {land.city?.charAt(0).toUpperCase() + land.city?.slice(1) ||
                      'Prime Location'}
                  </h3>

                  <p className="text-sm text-gray-600">
                    by{' '}
                    {land.ownerName?.charAt(0).toUpperCase() + land.ownerName?.slice(1) ||
                      'Unknown Owner'}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center text-gray-600">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                      <FaExpand className="text-sm text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Area</div>
                      <div className="text-sm font-semibold">
                        {land.area || 'N/A'} acres
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center mr-2">
                      <FaMapMarkerAlt className="text-sm text-cyan-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="text-sm font-semibold truncate">
                        {land.city || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500">Price</div>
                    <div className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                      ₹{land.price ? land.price.toLocaleString() : 'Contact'}
                    </div>
                  </div>

                  <Link
                    to={`/land/${land._id}`}
                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-emerald-500/25 hover:scale-105 text-xs relative z-30 pointer-events-auto"
                  >
                    View
                    <FaArrowRight className="ml-1 text-xs" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>
          </div>
        );
      })}
    </div>
  );
};

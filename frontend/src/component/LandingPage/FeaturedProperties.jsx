import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaHeart, FaMapMarkerAlt, FaExpand, FaTag, FaShieldAlt, FaEye, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { API } from "../../../utils/API";
import { AuthContext } from "../../../contexts/AuthContext.jsx"
import { useContext } from "react";
import { toast } from "react-toastify";

const FeaturedProperties = () => {
  const { user } = useContext(AuthContext);
  const [lands, setLands] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Prepare headers
        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch("http://localhost:5000/api/lands/get-land", {
          headers: headers
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data); // Debug log
        
        let allLands = Array.isArray(data.data) ? data.data : [];
        console.log("All lands:", allLands); // Debug log

        // Filter for approved lands and take only featured ones
        const approvedLands = allLands.filter(land => land.status === "approved");
        const featuredLands = approvedLands.slice(0, 6); // Show 6 featured properties
        
        console.log("Featured lands:", featuredLands); // Debug log

        setLands(featuredLands);
      } catch (error) {
        console.error("Error fetching lands:", error);
        // Set empty array on error to prevent infinite loading
        setLands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, []);

  useEffect(() => {
    if (user) {
      API.get(`/api/wishlist/${user._id}`)
        .then((response) => {
          setWishlist(response.data[0]?.lands || []);
        })
        .catch((error) => {
          console.error("Error fetching wishlist:", error);
        });
    }
  }, [user]);

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

  const handleWishlist = async (land) => {
    if (!user?._id) {
      toast.error("Please log in first.");
      return;
    }

    const isInWishlist = wishlist.includes(land._id);
    try {
      if (isInWishlist) {
        await API.delete(`/api/wishlist/${user._id}/${land._id}`);
        setWishlist(wishlist.filter((id) => id !== land._id));
        toast.success("Land removed from wishlist!");
      } else {
        await API.post(`/api/wishlist/${user._id}/${land._id}`);
        setWishlist([...wishlist, land._id]);
        toast.success("Land added to wishlist!");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Something went wrong while updating the wishlist.");
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mb-6">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg text-gray-600 font-medium">Loading premium properties...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Section Header */}
        <div className="text-center mb-12 lg:mb-20">
          <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <FaShieldAlt className="mr-1.5 sm:mr-2 text-sm sm:text-base" />
            Handpicked Premium Properties
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            Featured
            <span className="block bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Land Opportunities
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            Discover our exclusive collection of verified and premium land properties, 
            carefully selected for quality, location, and investment potential
          </p>
        </div>

        {/* Premium Properties Grid */}
        {lands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 lg:mb-16 px-4">
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
                {/* Premium Card with Glassmorphism */}
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden border border-white/20 hover:border-emerald-200/50">
                  
                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-emerald-50/5 to-cyan-50/5 transition-opacity duration-700 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>

                  {/* Property Image Section */}
                  <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                    {land.image ? (
                      <>
                        <img
                          src={`http://localhost:5000/uploads/${land.image}`}
                          alt={land.landtype || "land"}
                          className="w-full h-full object-cover transition-transform duration-700"
                          style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                        />
                        {/* Dark Overlay for Better Text Visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                        <div className="text-emerald-600 text-5xl">
                          <FaMapMarkerAlt />
                        </div>
                      </div>
                    )}

                    {/* Floating Action Buttons */}
                    <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-2 sm:gap-3 transition-all duration-500 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                      {/* Wishlist Button */}
                      <button
                        onClick={() => handleWishlist(land)}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 group"
                      >
                        <FaHeart
                          className={`text-lg sm:text-xl transition-colors ${
                            isInWishlist ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'
                          }`}
                        />
                      </button>
                      
                      {/* Quick View Button */}
                      <Link
                        to={`/land/${land._id}`}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                      >
                        <FaEye className="text-lg sm:text-xl text-gray-600 hover:text-emerald-600 transition-colors" />
                      </Link>
                    </div>

                    {/* Premium Badge */}
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs font-bold flex items-center shadow-lg">
                        <FaCheckCircle className="mr-1 text-xs" />
                        <span className="hidden xs:inline">PREMIUM</span>
                        <span className="xs:hidden">P</span>
                      </div>
                    </div>

                    {/* Location Badge */}
                    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                      <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
                        <FaMapMarkerAlt className="mr-1 text-xs" />
                        <span className="truncate max-w-20 sm:max-w-none">
                          {land.city?.charAt(0).toUpperCase() + land.city?.slice(1) || 'Location'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4 sm:p-6 lg:p-8 relative z-10 pointer-events-auto">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <FaTag className="mr-1 text-xs" />
                            <span className="truncate max-w-16 sm:max-w-none">
                              {land.landtype?.charAt(0).toUpperCase() + land.landtype?.slice(1) || 'Land'}
                            </span>
                          </span>
                          <div className="flex items-center">
                            {renderStars(averageRating)}
                            <span className="text-xs text-gray-500 ml-1 sm:ml-2">
                              ({land.reviews?.length || 0})
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-emerald-600 transition-colors truncate">
                          {land.city?.charAt(0).toUpperCase() + land.city?.slice(1) || 'Prime Location'}
                        </h3>
                        
                        <p className="text-sm sm:text-base text-gray-600 font-medium truncate">
                          by {land.ownerName?.charAt(0).toUpperCase() + land.ownerName?.slice(1) || 'Unknown Owner'}
                        </p>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex items-center text-gray-600">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                          <FaExpand className="text-sm sm:text-base text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm text-gray-500">Area</div>
                          <div className="font-semibold text-sm sm:text-base truncate">{land.area || 'N/A'} acres</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                          <FaMapMarkerAlt className="text-sm sm:text-base text-cyan-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm text-gray-500">Location</div>
                          <div className="font-semibold text-sm sm:text-base truncate">{land.city || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-500 mb-1">Starting from</div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                          ₹{land.price ? land.price.toLocaleString() : 'Contact'}
                        </div>
                      </div>
                      
                      <Link
                        to={`/land/${land._id}`}
                        className="group inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-emerald-500/25 hover:scale-105 text-xs sm:text-sm relative z-30 pointer-events-auto"
                      >
                        <span className="truncate">View Details</span>
                        <FaArrowRight className="ml-1.5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      </Link>
                    </div>

                    {/* Verification Info */}
                    {land.status === "approved" && land.approvedBy && (
                      <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className="text-emerald-700 font-semibold flex items-center">
                            <FaCheckCircle className="mr-1 text-xs" />
                            Verified by
                          </span>
                          <span className="text-emerald-600 font-bold truncate">
                            {land.approvedBy?.username || "Expert"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Glow Effect on Hover */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`}></div>
              </div>
            );
          })}
          </div>
        ) : (
          /* No Properties State */
          <div className="text-center py-12 sm:py-16 mb-12 lg:mb-16 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full mb-4 sm:mb-6">
              <FaMapMarkerAlt className="text-2xl sm:text-3xl text-emerald-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No Featured Properties Available</h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto mb-6 sm:mb-8">
              We're currently updating our premium land collection. Check back soon for exclusive opportunities!
            </p>
            <Link
              to="/lands"
              className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 text-sm sm:text-base"
            >
              Browse All Properties
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        )}

        {/* Premium CTA Section */}
        <div className="text-center px-4">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 max-w-md sm:max-w-none">
            <span className="text-gray-700 font-medium text-sm sm:text-base text-center sm:text-left">
              Explore more premium properties
            </span>
            <Link
              to="/lands"
              className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-emerald-500/25 hover:scale-105 text-sm"
            >
              View All Properties
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;

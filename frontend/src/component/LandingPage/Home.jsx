import { AuthContext } from "../../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { API } from "../../../utils/API";
import BackToTop from "../BackToTop";
import LandCardSlideshow from "../LandCardSlideShow";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import FeaturedProperties from "./FeaturedProperties";
import CTA from "./CTA";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [lands, setLands] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filteredLands, setFilteredLands] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  // Fetch land data from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    fetch("http://localhost:5000/api/lands/get-land", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res) => res.json())
    .then((data) => {
      let allLands = Array.isArray(data.data) ? data.data : [];
      
      if (user && user.role === "lawyer") {
        setLands(allLands);
        setFilteredLands(allLands);
      } else {
        const approved = allLands.filter((land) => land.status === "approved");
        setLands(approved);
        setFilteredLands(approved);
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
  }, [user]);

  useEffect(() => {
    if (user) {
      API.get(`/api/wishlist/${user._id}`)
        .then((response) => {
          setWishlist(response.data[0]?.lands || []);
        })
        .catch((error) => {
          console.log("error while fetching wishlist", error);
          toast.error("something went wrong while fetching wishlist");
        });
    }
  }, [user]);

  useEffect(() => {
    let result = lands;
    if (cityFilter) result = result.filter((l) => l.city && l.city.toLowerCase().includes(cityFilter.toLowerCase()));
    if (maxPrice) result = result.filter((l) => Number(l.price) <= Number(maxPrice));
    setFilteredLands(result);
  }, [cityFilter, maxPrice, lands]);

  const calculateAverageRating = (reviews) => reviews?.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <div className="flex space-x-1">
        {Array(fullStars).fill(0).map((_, i) => <FaStar key={`full-${i}`} className="text-yellow-500 w-5 h-5" />)}
        {Array(emptyStars).fill(0).map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-300 w-5 h-5" />)}
      </div>
    );
  };

  const handleWishlist = async (land) => {
    if (!user?._id) { toast.error("Please log in first."); navigate("/login"); return; }
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
      console.log("Error while updating the wishlist:", error);
      toast.error("Something went wrong while updating the wishlist.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Admin/Upload Buttons */}
      <div className="fixed top-20 right-4 z-40 flex flex-col gap-2">
        {user?.isAdmin && (
          <Link to="/adminDashboard" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium">
            Dashboard
          </Link>
        )}
        {user && !user.isAdmin && (
          <Link to="/uploads" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-medium">
            Upload Lands
          </Link>
        )}
      </div>

      {/* Landing Page Components */}
      <Hero />
      <Features />
      <FeaturedProperties />
      <HowItWorks />
      <Testimonials />
      <CTA />
      
      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Platform Statistics</h2>
            <p className="text-xl text-emerald-100">Real-time metrics from our growing community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{filteredLands.length}+</div>
              <div className="text-emerald-100">Active Properties</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{wishlist.length}</div>
              <div className="text-emerald-100">Wishlist Items</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">4.9</div>
              <div className="text-emerald-100">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-emerald-100">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Trending Lands Section */}
      {filteredLands.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-slate-50 to-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Trending Properties
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our most sought-after land opportunities, handpicked for quality and value
              </p>
            </div>
            
            {/* Filter Options */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
                <button 
                  onClick={() => { setCityFilter(""); setMaxPrice(""); }}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium transition-colors"
                >
                  All Properties
                </button>
                <button 
                  onClick={() => { setCityFilter("agricultural"); setMaxPrice(""); }}
                  className="px-4 py-2 rounded-lg hover:bg-emerald-100 text-gray-700 font-medium transition-colors"
                >
                  Agricultural
                </button>
                <button 
                  onClick={() => { setCityFilter("commercial"); setMaxPrice(""); }}
                  className="px-4 py-2 rounded-lg hover:bg-emerald-100 text-gray-700 font-medium transition-colors"
                >
                  Commercial
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLands.slice(0, 6).map((land) => {
                const averageRating = calculateAverageRating(land.reviews);
                return (
                  <div
                    key={land._id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
                  >
                    <div className="relative">
                      {/* Property Image */}
                      <div className="h-48 overflow-hidden">
                        {land.image ? (
                          <img
                            src={`http://localhost:5000/uploads/${land.image}`}
                            alt={land.landtype || "land"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                            <div className="text-emerald-600 text-4xl">
                              <FaMapMarkerAlt />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => handleWishlist(land)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
                      >
                        <FaStar
                          className={`text-lg transition-colors ${
                            wishlist.includes(land._id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        />
                      </button>

                      {/* Status Badges */}
                      <div className="absolute top-4 left-4">
                        {land.status === "approved" && land.approvedBy && (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                            <span className="mr-1">✓</span>
                            Verified
                          </div>
                        )}
                        {user?.role === "lawyer" && land.status !== "approved" && (
                          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                            <span className="mr-1">⚠</span>
                            Under Review
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      {/* Land Type and Rating */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {land.landtype?.charAt(0).toUpperCase() + land.landtype?.slice(1) || 'Land'}
                        </span>
                        <div className="flex items-center space-x-1">
                          {renderStars(averageRating)}
                          <span className="text-xs text-gray-500 ml-1">
                            ({land.reviews?.length || 0})
                          </span>
                        </div>
                      </div>

                      {/* Title and Location */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {land.city?.charAt(0).toUpperCase() + land.city?.slice(1) || 'Location'}
                      </h3>

                      {/* Owner Info */}
                      <p className="text-gray-600 mb-4 flex items-center">
                        <span className="text-sm">Owner: </span>
                        <span className="font-medium ml-1">
                          {land.ownerName?.charAt(0).toUpperCase() + land.ownerName?.slice(1) || 'Unknown'}
                        </span>
                      </p>

                      {/* Price */}
                      <div className="text-2xl font-bold text-emerald-600 mb-4">
                        ₹{land.price ? land.price.toLocaleString() : 'Contact for Price'}
                      </div>

                      {/* View Details Button */}
                      <Link
                        to={`/land/${land._id}`}
                        className="block w-full text-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300"
                      >
                        View Details
                      </Link>

                      {/* Approval Info */}
                      {land.status === "approved" && land.approvedBy && (
                        <div className="mt-3 p-2 bg-emerald-50 rounded-lg">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-emerald-600 font-semibold">
                              👨‍⚖️ Approved by
                            </span>
                            <span className="text-emerald-700 font-bold">
                              {land.approvedBy?.username || "Unknown"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link
                to="/lands"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
              >
                View All Properties
              </Link>
            </div>
          </div>
        </section>
      )}
      
      <BackToTop />
    </div>
  );
};

export default Home;

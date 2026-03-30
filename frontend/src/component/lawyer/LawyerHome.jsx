import { AuthContext } from "../../../contexts/authContext";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaMapMarkerAlt, FaHeart, FaEye, FaCheckCircle } from "react-icons/fa";
import { API } from "../../../utils/API";
import { getFileUrl } from "../../../../backend/utils/getFileUrl.js";

import Hero from "../LandingPage/Hero";
import Features from "../LandingPage/Features";
import HowItWorks from "../LandingPage/HowItWorks";
import Testimonials from "../LandingPage/Testimonials";
import BackToTop from "../BackToTop";

const LawyerHome = () => {
  const { user } = useContext(AuthContext);
  const [lands, setLands] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch all lands for lawyers
  useEffect(() => {
    if (!user || user.role?.toLowerCase() !== "lawyer") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchLands = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/lands/get-land", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const allLands = Array.isArray(data.data) ? data.data : [];
        setLands(allLands);
      } catch (error) {
        console.error("Error fetching lands:", error);
        toast.error("Failed to fetch lands.");
        setLands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, [user]);

  // Fetch wishlist
  useEffect(() => {
    if (!user) return;

    API.get(`/api/wishlist/${user._id}`)
      .then((res) => setWishlist(res.data[0]?.lands || []))
      .catch((err) => console.error("Error fetching wishlist:", err));
  }, [user]);

  
  const calculateAverageRating = (reviews) => {
    if (!reviews?.length) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`text-sm ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading lands...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Hero />
      <Features />

      {/* All Lands Section for Lawyers */}
      {user?.role?.toLowerCase() === "lawyer" && (
        <section className="py-20 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50 relative overflow-hidden">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
              All Lands
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lands.map((land) => {
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
                    {/* Card */}
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden border border-white/20 hover:border-emerald-200/50">
                      <div className={`absolute inset-0 bg-gradient-to-br from-emerald-50/5 to-cyan-50/5 transition-opacity duration-700 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>

                      <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                        {land.image ? (
                          <>
                            <img
                              src={getFileUrl(land.image)}
                              alt={land.landtype || "land"}
                              className="w-full h-full object-cover transition-transform duration-700"
                              style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
                            <FaMapMarkerAlt className="text-emerald-600 text-5xl" />
                          </div>
                        )}
 {/* Dynamic Badge */}
  <div className="absolute top-3 left-3">
    {land.status === "approved" ? (
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
        <FaCheckCircle className="mr-1 text-xs" /> VERIFIED
      </div>
    ) : !land.assignedLawyer ? (
      <div className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
        NEW
      </div>
    ) : (
      <div className="bg-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
        UNDER REVIEW
      </div>
    )}
  </div>

                        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-500 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                          
                          <Link to={`/land/${land._id}`} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300">
                            <FaEye className="text-lg text-gray-600 hover:text-emerald-600 transition-colors" />
                          </Link>
                        </div>

                        {land.status === "approved" && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                            <FaCheckCircle className="mr-1 text-xs" /> Verified
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-6 lg:p-8 relative z-10">
                        <div className="flex flex-col mb-3">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{land.city}</h3>
                          <p className="text-sm sm:text-base text-gray-600">by {land.ownerName || "Unknown Owner"}</p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="text-xl sm:text-2xl font-bold text-emerald-600">₹{land.price?.toLocaleString()}</div>
                          <Link to={`/land/${land._id}`} className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-sm">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`}></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <HowItWorks />
      <Testimonials />
      <BackToTop />
    </div>
  );
};

export default LawyerHome;
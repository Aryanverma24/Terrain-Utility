import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import { API } from "../../utils/API";
import BackToTop from "./BackToTop";
import LandCardSlideshow from "./LandCardSlideShow";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [lands, setLands] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filteredLands, setFilteredLands] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/get-land")
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
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (user) {
      API.get(`/api/wishlist/${user._id}`)
        .then((res) => setWishlist(res.data[0].lands))
        .catch(() => toast.error("Something went wrong while fetching wishlist"));
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
    } catch { toast.error("Something went wrong while updating the wishlist."); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-16 pb-10 bg-[#daf1de]">

      {/* Top Section */}
      <div className="w-full p-10 flex flex-col md:flex-row items-stretch justify-between gap-8">
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="text-[#235347] text-7xl font-bold tracking-wide drop-shadow-sm" style={{ fontFamily: "'Dancing Script', cursive" }}>LAND STRIDER</h1>
          <div className="text-lg mt-4 max-w-[34rem] border-t-2 border-black pt-4 leading-snug text-[#8E5E5E] space-y-3">
            <p>A streamlined platform designed to simplify land discovery, verification and documentation with clarity and transparency.</p>
            <p>Landowners, buyers and legal experts can securely view, review and assess every detail through a clean and organized digital experience.</p>
            <p>With structured information and verified listings, Land Strider brings confidence and ease to the entire real-estate exploration process.</p>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center relative">
          <img src="https://www.cyberswift.com/blog/wp-content/uploads/2024/09/the-evolving-landscape-of-land-management-harnessing-technology-for-sustainable-growth.jpg" alt="home" className="rounded-3xl w-full h-full object-cover shadow-xl" />
        </div>
      </div>

      {/* Trend Lands */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-center text-[#235347] mb-6">Trend Lands</h2>

      {/* Filters + Upload Button */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8 px-4">
        <div className="flex items-center gap-3 flex-1">
          <input type="text" placeholder="Filter by city" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="px-3 py-2 border rounded-lg focus:outline-none flex-1" />
          <input type="number" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="px-3 py-2 border rounded-lg focus:outline-none flex-1" />
          <button onClick={() => { setCityFilter(""); setMaxPrice(""); setFilteredLands(lands); }} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Reset</button>
          <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-green-600 text-white rounded-lg shadow-md hover:opacity-90">Apply Filters</button>
        </div>
        {user && (
          <Link to="/uploads" className="py-2 px-6 rounded-lg text-lg bg-gradient-to-r from-yellow-500 to-green-600 text-white font-semibold shadow-md hover:scale-105 transition-all mt-3 md:mt-0">
            Upload Lands
          </Link>
        )}
      </div>

      {/* Cards */}
      <ul className="flex flex-wrap justify-center gap-8 px-4">
        {filteredLands.length > 0 ? filteredLands.map((land) => {
          const avgRating = calculateAverageRating(land.reviews);
          const dims = land.dimensions ? `${land.dimensions.length} ft × ${land.dimensions.breadth} ft` : "N/A";

          return (
            <div key={land._id} className="w-[20rem] bg-[#f0d3d3] rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:scale-105 border p-4 flex flex-col">
              <div className="relative">
                <FaStar onClick={() => handleWishlist(land)} className={`absolute right-3 top-3 w-7 h-7 cursor-pointer ${wishlist.includes(land._id) ? "text-yellow-500" : "text-gray-300"}`} />
                <Link to={`/land/${land._id}`}>
                 <LandCardSlideshow land={land} fullDocs={land.documents} />

                  <h2 className="text-[#235347] font-extrabold text-lg mb-1">{land.landtype?.charAt(0).toUpperCase() + land.landtype?.slice(1)}</h2>
                  <p className="text-[#235347] text-sm font-semibold mb-1">Owner: <span className="font-bold">{land.ownerName || "N/A"}</span></p>
                  <p className="text-[#235347] text-sm font-semibold mb-1">City: <span className="font-bold">{land.city || "N/A"}</span></p>
                  <div className="flex items-center mt-2">{avgRating > 0 ? renderStars(avgRating) : <span className="text-sm text-gray-500">No ratings yet</span>}</div>
                  <p className="mt-2 text-sm text-[#235347] font-semibold">Reviews: {land.reviews?.length || 0}</p>
                  <span className="inline-block bg-[#235347] text-[#f0d3d3] font-bold px-3 py-1 rounded-full mt-2">₹{land.price ?? "N/A"}</span>
                  <p className="mt-2 text-sm text-[#235347] font-semibold">Dimensions: <span className="font-medium">{dims}</span></p>
                </Link>
              </div>
            </div>
          );
        }) : <p className="text-center text-[#235347] mt-10 font-semibold">No lands match the selected filters.</p>}
      </ul>
    </div>
  );
};

export default Home;

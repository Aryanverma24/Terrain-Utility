import { AuthContext } from "../../contexts/authContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import { API } from "../../utils/API";
import BackToTop from "./BackToTop";
import LandCardSlideshow from "./LandCardSlideShow";
import { getFileUrl } from "../../../backend/utils/getFileUrl";

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
     const token = localStorage.getItem("token"); // ✅ read token from localStorage
  if (!token) return;
   fetch("http://localhost:5000/api/lands/get-land", {
  headers: {
    Authorization: `Bearer ${token}` // ✅ Use token, not user object
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
      
  }, []);

  useEffect(() => {
    if (user) {
      API.get(`/api/wishlist/${user._id}`)
        .then((response) => {
          setWishlist(response.data[0].lands);
          console.log("fetching done");
          console.log(response.data[0].lands);
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
      navigate("/");
    } catch (error) {
      console.log("Error while updating the wishlist:", error);
      toast.error("Something went wrong while updating the wishlist.");
    }
  };

  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <div className="min-h-screen flex flex-col justify-start items-center pt-[3rem]  pb-5 relative">
        <div className="bg-olive min-w-full p-4 mx-0">
          <div className="flex justify-end mt-[1rem]">
            <div className="bg-beige rounded-bl-3xl h-[27.5rem] rounded-tr-3xl px-5 py-5 mt-4 w-[60%]">
              <img
                src="https://www.cyberswift.com/blog/wp-content/uploads/2024/09/the-evolving-landscape-of-land-management-harnessing-technology-for-sustainable-growth.jpg"
                alt="home image"
                className="w-[65rem] rounded-xl"
              />
            </div>
          </div>

          <div className="mb-[1.5rem]">
            <h1 className="text-gold text-8xl font-bold absolute top-[5rem] left-8">
              LAND
            </h1>
            <h1 className="text-gold text-6xl font-semibold absolute top-[11rem] left-[11rem]">
              STRIDER
            </h1>
            <div className="text-xl absolute top-[16rem] left-[2rem] max-w-[25rem] px-2 border-black border-t-2">
              <h1 className="mt-2">
                A digital platform connecting Landowners and renters for various
                land uses - agriculture, commercial, recreation, urban.
              </h1>
              <br />
              <h3>
                Improving land utilzation through efficient and transparent
                processes.
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-mintGreen pb-10">
          <div className="relative">
            {user?.isAdmin && (
              <div className="absolute top-8 left-5 py-2 px-6 rounded-lg text-lg bg-gold text-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-green-600 transition duration-300 shadow-md">
                <Link to="/adminDashboard" className="font-semibold">
                  Dashboard
                </Link>
              </div>
            )}
          </div>
          {!user ? (
            <div className="absolute right-8 mt-[2rem] w-[7rem] py-2 px-6 rounded-lg text-xl bg-gold text-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-green-600 transition duration-300 shadow-md text-center">
              <Link to="/login" className="font-semibold">
                Login
              </Link>
            </div>
          ) : (
            <div className="absolute mt-[1rem] right-5 py-2 px-6 rounded-lg text-lg bg-gold text-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-green-600 transition duration-300 shadow-md">
              <Link to="/uploads" className="font-semibold">
                Upload Lands
              </Link>
            </div>
          )}

          <div className="text-4xl text-center font-semibold pt-[2rem] text-darkGreen">
            <h2>Trend Lands</h2>
          </div>
          <BackToTop />
          {lands && (
            <ul className="flex flex-wrap justify-center gap-8 mt-10 px-4 mb-0">
              {lands.length > 0 ? (
                lands.map((land) => {
                  const averageRating = calculateAverageRating(land.reviews);
                  return (
                    <div
                      key={land._id}
                      className="w-[20rem] p-2 bg-cardGreen rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
                    >
                      <div className="relative">
                        <FaStar
                          onClick={() => handleWishlist(land)}
                          className={`absolute right-2 w-8 h-8 cursor-pointer ${
                            wishlist.includes(land._id)
                              ? "text-yellow-500"
                              : "text-gray-500"
                          }`}
                        />
                        <Link to={`/land/${land._id}`}>
                          <div className="p-4">
                            {land.image && (
                              <img
                                src={getFileUrl(land.image)}
                                alt={land.landtype || "land"}
                                className="rounded-lg h-48 w-full object-cover mb-4"
                              />
                            )}
                         {land.status === "approved" && land.approvedBy && (
  <div className="mt-2">
    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
      ✅ Verified by Lawyer
    </span>

    <div className="mt-2 flex items-center justify-between bg-emerald-700/40 border border-emerald-500/30 rounded-lg px-3 py-2 shadow-sm">
  <span className="text-xs text-emerald-200 font-semibold tracking-wide">
    👨‍⚖️ Approved by
  </span>

  <span className="text-sm text-white font-bold bg-emerald-600 px-2 py-1 rounded-md shadow">
    {land.approvedBy?.username || "Unknown"}
  </span>
</div>
  </div>
)}
{/* Under Review Badge - Only for Lawyers */}
{user?.role === "lawyer" && land.status !== "approved" && (
  <div className="mt-2">
    <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
      ⚠️ Under Review
    </span>

    <div className="mt-2 flex items-center justify-between bg-orange-700/40 border border-orange-500/30 rounded-lg px-3 py-2 shadow-sm">
      <span className="text-xs text-orange-200 font-semibold tracking-wide">
        👨‍⚖️ Reviewing by
      </span>

      <span className="text-sm text-white font-bold bg-orange-600 px-2 py-1 rounded-md shadow">
        {land.assignedLawyer?.username || "Not Assigned"}
      </span>
    </div>
  </div>
)}
                            <div className="text-black text-md">
                              <h2 className="font-semibold text-lg mb-2">
                                LAND TYPE:{" "}
                                <span className="font-normal">
                                  {land.landtype[0].toUpperCase() +
                                    land.landtype.substring(1)}
                                </span>
                              </h2>
                              <p className="text-sm  mb-2">
                                OWNER:{" "}
                                <span className="font-bold">
                                  {land.ownerName[0].toUpperCase() +
                                    land.ownerName.substring(1)}
                                </span>
                              </p>
                              <p className="text-sm mb-2">
                                CITY:{" "}
                                <span className="font-bold">
                                  {land.city[0].toUpperCase() +
                                    land.city.substring(1)}
                                </span>
                              </p>
                              <div className="flex items-center mt-2">
                                Rating:{" "}
                                {averageRating > 0 ? (
                                  renderStars(averageRating)
                                ) : (
                                  <span>No ratings yet</span>
                                )}
                              </div>
                              <p className="mt-2 text-sm">
                                Number of Reviews:{" "}
                                {land.reviews ? land.reviews.length : 0}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })
                
              ) : (
                <p>No lands available to display.</p>
              )}
            </ul>
            
          )}
            
        </div>
      </div>
    </>
  );
};

export default Home;

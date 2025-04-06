import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";
import { API } from "../../utils/API";
import BackToTop from "./BackToTop";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [lands, setLands] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  // Fetch land data from backend
  useEffect(() => {
    fetch("http://localhost:5000/get-land")
      .then((response) => response.json())
      .then((data) => {
        console.log("Land data received:", data);
        setLands(Array.isArray(data.data) ? data.data : []);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);



  useEffect(() => {
    if (user) {
      API.get(`/api/wishlist/${user._id}`).then((response) => {
        setWishlist(response.data[0].lands);
        console.log("fetching done");
        console.log(response.data[0].lands);
      }).catch((error) => {
        console.log("error while fetching wishlist", error);
        toast.error("something went wrong while fetching wishlist");
      });
    }
  }, [user]);

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <div className="flex space-x-1">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <svg
              key={`full-${i}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="gold"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path d="M12 .587l3.668 7.419L24 9.575l-6 5.848 1.415 8.252L12 18.902 4.585 23.675 6 15.423 0 9.575l8.332-1.569z" />
            </svg>
          ))}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <svg
              key={`empty-${i}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="gray"
              viewBox="0 0 24 24"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 .587l3.668 7.419L24 9.575l-6 5.848 1.415 8.252L12 18.902 4.585 23.675 6 15.423 0 9.575l8.332-1.569z"
              />
            </svg>
          ))}
      </div>
    );
  };

  const handleWishlist = async (land) => {
    const userId = user?._id;
    if (!userId) {
      toast.error("Please log in first.");
      navigate("/login");
      return;
    }

    const isInWishlist = wishlist.some((item) => item === land._id);
    try {
      if (isInWishlist) {
        await API.delete(`/api/wishlist/${userId}/${land._id}`);
        toast.success("Land removed from wishlist!");
        setWishlist(wishlist.filter((item) => item !== land._id));
      } else {
        await API.post(`/api/wishlist/${user._id}/${land._id}`);
        toast.success("Land added to wishlist!");
        setWishlist([...wishlist, land._id]);
      }
      navigate('/');
    } catch (error) {
      console.log("Error while updating the wishlist:", error);
      toast.error("Something went wrong while updating the wishlist.");
    }
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
                  className="w-[65rem] rounded-xl" />
            </div>
          </div>

          <div className="mb-[1.5rem]">
            <h1 className="text-gold text-8xl font-bold absolute top-[5rem] left-8">LAND</h1>
            <h1 className="text-gold text-6xl font-semibold absolute top-[11rem] left-[11rem]">STRIDER</h1>
            <div className="text-xl absolute top-[16rem] left-[2rem] max-w-[25rem] px-2 border-black border-t-2">
              <h1 className="mt-2">A digital platform connecting Landowners and renters for various land uses - agriculture, commercial, recreation, urban.</h1>
              <br />
            <h3>Improving land utilzation through efficient and transparent processes.</h3>
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
              <Link to="/login" className="font-semibold">Login</Link>
            </div> ) : (
               <div className="absolute mt-[1rem] right-5 py-2 px-6 rounded-lg text-lg bg-gold text-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-green-600 transition duration-300 shadow-md">
               <Link to="/uploads" className="font-semibold">
                 Upload Lands
               </Link>
               </div> 
            )
          }

          <div className="text-4xl text-center font-semibold pt-[2rem] text-darkGreen">
            <h2>Trend Lands</h2>
          </div>
         <BackToTop  />
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
                          wishlist.includes(land._id) ? "text-yellow-500" : "text-gray-500"
                        }`}
                      />
                      <Link to={`/land/${land._id}`}>
                        <div className="p-4">
                          {land.image && (
                            <img
                              src={`http://localhost:5000/uploads/${land.image}`}
                              alt={land.landtype || "land"}
                              className="rounded-lg h-48 w-full object-cover mb-4"
                            />
                          )}
                          <div className="text-black text-md">
                            <h2 className="font-semibold text-lg mb-2">
                              LAND TYPE:{" "}
                              <span className="font-normal">{land.landtype[0].toUpperCase()+land.landtype.substring(1)}</span>
                            </h2>
                            <p className="text-sm  mb-2">
                              OWNER: <span className="font-bold">{land.ownerName[0].toUpperCase()+land.ownerName.substring(1)}</span>
                            </p>
                            <p className="text-sm mb-2">
                              CITY: <span className="font-bold">{land.city[0].toUpperCase() + land.city.substring(1)}</span>
                            </p>
                            <div className="flex items-center mt-2">
                              Rating:{" "}
                              {averageRating > 0 ? renderStars(averageRating) : <span>No ratings yet</span>}
                            </div>
                            <p className="mt-2 text-sm">
                              Number of Reviews: {land.reviews ? land.reviews.length : 0}
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

import { useEffect, useState, useContext } from "react";
import { API } from "../../utils/API";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import { toast } from "react-toastify";

const WishlistLand = ({ landId }) => {
  const [land, setLand] = useState();
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);

  const reloadPage = () => {
    console.log("reloded");
    navigate("/wishlist");
  };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const { data } = await API.get(`/api/lands/${landId}`);
        setLand(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLand();
  }, []);

  if (land) {
    console.log(land.ownerName);
  }

  useEffect(() => {
    if (user) {
      API.get(`/api/wishlist/${user._id}`)
        .then((response) => {
          setWishlist(response.data[0].lands || []);
          console.log("fetching done");
        })
        .catch((error) => {
          console.log("error while fetching wishlist", error);
          toast.error("something went wrong while fetching wishlist");
        });
    }
  }, [user]);

  const handleWishlist = async (land) => {
    const userId = user._id;

    if (!userId) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      const response = await API.delete(`/api/wishlist/${userId}/${land._id}`);
      if (response.status === 200) {
        toast.success("Wishlist updated successfully!");
        console.log(wishlist);
        // Remove the land from the wishlist immediately from the UI
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => console.log(item === land._id))
        );
        console.log(wishlist);

        API.get(`/api/wishlist/${user._id}`)
          .then((response) => {
            setWishlist(response.data[0].lands || []);
          })
          .catch((error) => {
            console.log("Error fetching updated wishlist", error);
            toast.error("Error fetching updated wishlist");
          });
        navigate("/");
      } else {
        toast.error("Some error occurred while updating wishlist.");
      }
      console.log(wishlist);
    } catch (error) {
      console.error("Error while updating the wishlist:", error);
      toast.error("Something went wrong while updating the wishlist");
    }
  };

  // Function to calculate average rating
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length; // Average as a floating-point number
  };

  // Function to render stars
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

  const averageRating = calculateAverageRating(land?.reviews);
  // const isInWishlist = wishlist?.some((item) => item !== land._id);

  // console.log(wishlist?.some((item) => item))

  return (
    <>
      {land && (
        <div className="w-[20rem] ml-[2.5rem] mb-[2rem]">
          <div className="bg-[#ededed] rounded-xl relative">
            <FaStar
              onClick={() => handleWishlist(land)}
              className={`absolute  right-1 w-8 h-8 cursor-pointer text-yellow-500`}
            />

            <Link to={`/land/${land._id}`}>
              <div className="p-4">
                {/* Image */}
                {land.image && (
                  <div>
                    <img
                      src={`http://localhost:5000/uploads/${land.image}`}
                      alt={land.landtype || "land"}
                      className="rounded-lg h-48 w-full object-cover mb-4"
                    />
                  </div>
                )}

                {/* Land Info */}
                <div className="text-black text-md">
                  <h2 className="font-semibold text-lg mb-2">
                    LAND TYPE:{" "}
                    <span className="font-normal">{land.landtype}</span>
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    OWNER: {land.ownerName}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    CITY: {land.city}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    STATE: {land.state}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    PINCODE: {land.pincode}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mt-2">
                    Rating:{" "}
                    {averageRating > 0 ? (
                      renderStars(averageRating)
                    ) : (
                      <span className="text-gray-400">No ratings yet</span>
                    )}
                  </div>

                  {/* Reviews Count */}
                  <p className="mt-2 text-sm text-gray-400">
                    Number of Reviews: {land.reviews ? land.reviews.length : 0}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default WishlistLand;

import { AuthContext } from "../../contexts/authContext";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [lands, setLands] = useState([]);

  // Fetch land data from backend
  useEffect(() => {
    fetch("http://localhost:5000/get-land")
      .then((response) => response.json())
      .then((data) => {
        console.log("Land data received:", data); // Log the entire response
        setLands(Array.isArray(data.data) ? data.data : []); // Assuming response is wrapped in "data"
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

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

  const handleAddToWishlist = async (landId) => {
    try {
      await API.post(`/api/wishlist/${landId}/`, user._id);
      alert("Land added to wishlist!");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  return (
    <>
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 py-6">
        <h1 className="text-6xl text-white text-center font-bold leading-tight">
          LAND STRIDE<i className="text-yellow-400">R</i>
        </h1>
        <h3 className="text-2xl font-medium text-center text-yellow-200 mt-2">
          Fast and Simple...
        </h3>
      </div>

      {/* Main Content Section */}
      <div className="bg-black text-white min-h-screen flex flex-col justify-start items-center pt-10 pb-5 relative">
        {/* Upload Lands Button positioned at the top-right corner */}
        <div className="absolute top-5 right-5 py-2 px-6 rounded-lg text-lg bg-gradient-to-r from-yellow-400 to-green-500 text-white hover:bg-gradient-to-r hover:from-yellow-500 hover:to-green-600 transition duration-300 shadow-md">
          <Link to="/uploads" className="font-semibold">
            Upload Lands
          </Link>
        </div>

        {/* Welcome Message */}
        {user?.username ? (
          <div className="text-5xl text-center font-semibold text-white mb-8">
            <h2>
              WELCOME{" "}
              <span className="font-bold uppercase text-yellow-400">
                {user?.username}
              </span>
            </h2>
          </div>
        ) : (
          <div className="text-xl text-center">
            <h2 className="font-semibold">WELCOME</h2>
          </div>
        )}

        {/* Lands Section */}
        <ul className="flex flex-wrap justify-center gap-8 mt-10 px-4">
          {Array.isArray(lands) && lands.length > 0 ? (
            lands.map((land) => {
              const averageRating = calculateAverageRating(land.reviews);

              return (
                <div
                  key={land._id}
                  className="w-[20rem] p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105"
                >
                  <Link to={`/land/${land._id}`}>
                    <div className="p-4">
                      {/* Image */}
                      {land.image && (
                        <img
                          src={`http://localhost:5000/uploads/${land.image}`}
                          alt={land.landtype || "land"}
                          className="rounded-lg h-48 w-full object-cover mb-4"
                        />
                      )}

                      {/* Land Info */}
                      <div className="text-black text-md">
                        <h2 className="font-semibold text-lg mb-2">
                          LAND TYPE: <span className="font-normal">{land.landtype}</span>
                        </h2>
                        <p className="text-sm text-gray-600 mb-2">OWNER: {land.ownerName}</p>
                        <p className="text-sm text-gray-600 mb-2">CITY: {land.city}</p>
                        <p className="text-sm text-gray-600 mb-2">STATE: {land.state}</p>
                        <p className="text-sm text-gray-600 mb-2">PINCODE: {land.pincode}</p>

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
              );
            })
          ) : (
            <p>No lands available to display.</p>
          )}
        </ul>
      </div>
    </>
  );
};

export default Home;

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

  return (
    <>
      <div className="bg-black">
        <h1 className="text-6xl text-green-500 text-center py-5 mb-0">
          LAND STRIDE<i>R</i>
        </h1>
        <h3 className="mt-[-1.4rem] text-2xl semibold ml-[33rem] text-yellow-500 text-center">
          Fast and Simple...
        </h3>
      </div>
      <div className="bg-black text-white h-full">
        {user?.username ? (
          <>
            <div className="flex justify-between mb-[1rem] mx-[2rem]">
              <div className="text-2xl text-center ml-[28rem]">
                <h2 className="pt-[3rem] font-semibold">
                  WELCOME{" "}
                  <span className="font-bold uppercase text-green-600">
                    {user?.username}
                  </span>
                </h2>
              </div>
              <div
                className="mt-[2.5rem] py-1 px-2 rounded-2xl font-bold text-xl bg-green-400
                  hover:bg-green-600 hover:text-orange-400"
              >
                <Link to="/uploads">Upload Lands</Link>
              </div>
            </div>
          </>
        ) : (
          <div className="text-xl text-center">
            <h2 className="pt-[3rem] font-semibold">WELCOME</h2>
          </div>
        )}

        <ul className="flex justify-evenly ml-[5rem] mr-[1rem] flex-wrap">
          {Array.isArray(lands) && lands.length > 0 ? (
            lands.map((land) => {
              console.log("Land item:", land);

              const averageRating = calculateAverageRating(land.reviews);

              return (
                <div key={land._id} className="w-[20rem]">
                  {/* Link to SingleLand page with correct land id */}
                  <Link to={`/land/${land._id}`}>
                    <div className="bg-blue-200 p-[0.5rem] m-5 rounded-xl">
                      {/* Image */}
                      {land.image && (
                        <img
                          src={`http://localhost:5000/uploads/${land.image}`}
                          alt={land.landtype || "land"}
                          className="rounded-xl h-44"
                        />
                      )}
                      <div className="text-black text-md mt-[0.5rem] px-[0.5rem] capitalize">
                        <h2>
                          LAND TYPE: <span>{land.landtype}</span>
                        </h2>
                        <p>OWNER: {land.ownerName}</p>
                        <p>CITY: {land.city}</p>
                        <p>STATE: {land.state}</p>
                        <p>PINCODE: {land.pincode}</p>

                        {/* Display the Average Rating */}
                        <div className="flex items-center">
                          Rating:{" "}
                          {averageRating > 0 ? (
                            renderStars(averageRating)
                          ) : (
                            <span>No ratings yet</span>
                          )}
                        </div>

                        {/* Display Number of Reviews */}
                        <p>Number of Reviews: {land.reviews ? land.reviews.length : 0}</p>
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

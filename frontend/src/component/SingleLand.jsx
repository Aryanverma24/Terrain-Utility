import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// Manual JWT decoding function
const decodeJWT = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );
  return JSON.parse(jsonPayload);
};

const SingleLand = () => {
  const { id } = useParams();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the logged-in user's ID from the token
  const token = localStorage.getItem("token");
  const decoded = token ? decodeJWT(token) : null;

  useEffect(() => {
    const fetchLandDetails = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/lands/${id}/reviews-with-usernames`
        );
        setLand(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch land details. Please try again later.");
        setLoading(false);
      }
    };

    fetchLandDetails();
  }, [id]);

  const handleDeleteReview = async (userId) => {
    try {
      if (!token) {
        alert("You must be logged in to delete a review.");
        return;
      }

      if (!userId) {
        alert("User ID is missing.");
        return;
      }

      // Send the DELETE request
      const response = await axios.delete(
        `http://localhost:5000/api/lands/${id}/reviews/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh reviews after successful deletion
      const { data } = await axios.get(`http://localhost:5000/api/lands/${id}/reviews-with-usernames`);
      setLand(data); // Update state with new data
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete the review. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-xl">Loading land details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  if (!land)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">Land details are not available.</p>
      </div>
    );

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl mt-8">
      <h1 className="text-4xl font-semibold text-gray-800 mb-6">
        {land.landtype || "Land Type Not Specified"}
      </h1>
      {land.image && (
        <div className="relative w-full max-w-3xl mx-auto mb-8 rounded-lg overflow-hidden shadow-md">
          <img
            src={`http://localhost:5000/uploads/${land.image}`}
            alt={land.landtype || "Land"}
            className="w-full h-80 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Reviews:</h3>
      {land.reviews && land.reviews.length > 0 ? (
        land.reviews.map((review, index) => (
          <div
            key={index}
            className="border border-gray-200 p-6 mb-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-700 font-semibold">
                <strong>User:</strong> {review.user.username || "Anonymous"}
              </p>
              {/* Conditionally show Delete button only if the logged-in user is the review's author */}
              {decoded && decoded.userId === review.user.id && (
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                  onClick={() => handleDeleteReview(review.user.id)}
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-gray-700">
              <strong>Rating:</strong> {review.rating}/5
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Review:</strong> {review.review}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-600">No reviews yet.</p>
      )}
    </div>
  );
};

export default SingleLand;

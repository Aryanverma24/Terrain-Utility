import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // Import Toastify

// Manual JWT decoding function
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('') 
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error.message);
    return null;
  }
};

const SingleLand = () => {
  const { id } = useParams();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form states
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the logged-in user's ID from the token
  const token = localStorage.getItem("token");
  const decoded = token ? decodeJWT(token) : null;
  const navigate = useNavigate(); // Initialize navigate for programmatic navigation

  const handleRedirectToChat = () => {
    if (land && decoded) {
      const landId = land._id; // Make sure this is populated correctly
      const buyerId = decoded.userId;
      const ownerName = land.ownerName;
  
      console.log("Navigating with:", landId, buyerId, ownerName); // Log to check values
  
      if (landId && buyerId && ownerName) {
        navigate(`/chat/${landId}/${buyerId}/${ownerName}`);
      } else {
        toast.error("Missing parameters for chat.");
      }
    } else {
      toast.error("Missing land or user information.");
    }
  };
  
  
  

 
    
      useEffect(() => {
        const fetchLandDetails = async () => {
          try {
            const { data } = await axios.get(`http://localhost:5000/api/lands/${id}`);
            console.log("Land data received:", data);  // Log to verify if _id is present
            setLand(data);  // Set land state to the response data
            setLoading(false);
          } catch (err) {
            setError("Failed to fetch land details. Please try again later.");
            setLoading(false);
          }
        };
      
        fetchLandDetails();
      }, [id]);
      
 


  const handleDeleteReview = async (reviewUserId) => {
    if (!decoded || !decoded.userId) {
      toast.error("You must be logged in to delete a review.");
      return;
    }

    if (decoded.userId !== reviewUserId) {
      toast.error("You can only delete your own review.");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/lands/${id}/reviews/${reviewUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh reviews after successful deletion
      const { data } = await axios.get(
        `http://localhost:5000/api/lands/${id}/reviews-with-usernames`
      );
      setLand(data); // Update the land state with the new reviews
      toast.success("Review deleted successfully!");
    } catch (err) {
      console.error("Error deleting review:", err.response?.data || err.message);
      toast.error("Failed to delete the review. Please try again.");
    }
  };

  // Function to handle new review submission
  const handleSubmitReview = async () => {
    if (!newReview.trim() || !newRating) {
      toast.error("Please provide a rating and a review.");
      return;
    }

    if (!token) {
      toast.error("You must be logged in to submit a review.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(
        `http://localhost:5000/api/lands/${id}/reviews`,
        {
          review: newReview,
          rating: newRating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch the updated reviews
      const { data } = await axios.get(
        `http://localhost:5000/api/lands/${id}/reviews-with-usernames`
      );
      setLand(data); // Update the land state with the refreshed reviews

      // Clear the form
      setNewReview("");
      setNewRating(5);
      toast.success("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error("Failed to submit the review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading, error, or main content
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-semibold text-gray-800">{land.landtype || "Land Type Not Specified"}</h1>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
          onClick={handleRedirectToChat}
        >
          Chat with {land.ownerName || "Owner"} {/* Fallback in case ownerName is unavailable */}
        </button>
      </div>

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
      <div className="single-land-container">
        <h2>{land.landtype} in {land.city}</h2>
        <p>{land.description}</p>
      </div>

      {land.reviews && land.reviews.length > 0 ? (
        land.reviews.map((review, index) => (
          <div
            key={index}
            className="border border-gray-200 p-6 mb-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-700 font-semibold">
                <strong>User:</strong> {review.user.username || "Anonymous"}
              </p>
              {decoded && decoded.userId === review.user.id && (
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
                  onClick={() => handleDeleteReview(review.user.id)}
                >
                  Delete
                </button>
              )}
            </div>
            <p className="text-gray-700 flex items-center">
              <strong>Rating:</strong>
              <span className="ml-2 flex items-center">
                <span className="text-gray-700 font-semibold">{review.rating}</span>
                <span className="ml-2 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-8 h-8 ${review.rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.5 3L6 12 1 7l6.5-.5L10 1l2.5 5.5L20 7l-5 5 1.5 6.5z" />
                    </svg>
                  ))}
                </span>
              </span>
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Review:</strong> {review.review}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-2xl">No reviews yet.</p>
      )}

      {/* Review Submission Form */}
      {decoded && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Submit a Review:</h3>

          {/* Review Textarea */}
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            placeholder="Write your review here..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            rows="4"
          ></textarea>

          {/* Star Rating */}
          <div className="mb-4">
            <label htmlFor="rating" className="text-gray-700 mr-4">
              Rating:
            </label>
            <select
              id="rating"
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value))}
              className="w-64 p-2 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Star{i === 0 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200"
            onClick={handleSubmitReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SingleLand;

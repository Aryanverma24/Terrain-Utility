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
      const landId = land._id;  // Make sure land._id is present
      const senderId = decoded.userId || decoded._id;  // Sender is the logged-in user
      const receiverId = land.owner;  // Land owner as receiver
  
      console.log("Navigating with:", landId, senderId, receiverId); // Log to check values
  
      if (landId && senderId && receiverId) {
        // Pass the data to the next route
        navigate("/chat", {
          state: {
            room: landId,         // Pass the land ID as room
            senderId,             // Pass the logged-in user's ID as sender
            receiverId,           // Pass the land owner as receiver
            landDetails: land,     // Optionally, pass land details
          },
        });
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
    <div className="container mx-auto p-6 pt-[6rem] bg-mintGreen  rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-5xl font-semibold text-gray-800">{land.landtype[0].toUpperCase() + land.landtype.substring(1) + " Lands" || "Land Type Not Specified"}</h1>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
          onClick={handleRedirectToChat}
        >
          Chat with {land.ownerName || "Owner"} {/* Fallback in case ownerName is unavailable */}
        </button>
      </div>

      {land.image && (
        <div className="relative w-[28rem] p-4 bg-cardGreen max-w-3xl mx-auto mb-8 rounded-lg overflow-hidden shadow-md">
          <img
            src={`http://localhost:5000/uploads/${land.image}`}
            alt={land.landtype || "Land"}
            className="w-full h-80 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Reviews:</h3>
      <div className="single-land-container">
        <h2>{land.landtype} Land in {land.city}</h2>
        <p>{land.description}</p>
      </div>

      {land.reviews && land.reviews.length > 0 ? (
        land.reviews.map((review, index) => (
          <div
            key={index}
            className="border bg-cardGreen mt-2 border-gray-200 p-6 mb-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-700 font-semibold">
                {console.log(review.user)}
                <strong>User:</strong> {review.username || "Anonymous"}
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
                      className={`h-5 w-5 ${star <= review.rating ? "text-yellow-500" : "text-gray-300"}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 15l-5.454 2.858L5.918 11 1 6.857l6.182-.591L10 1l2.818 5.266L19 6.857l-4.918 4.143L15.454 17z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                </span>
              </span>
            </p>
            <p>{review.review}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet. Be the first to leave a review!</p>
      )}

      {/* Review form */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Your Review:</h3>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          rows="4"
          className="w-full border border-gray-300 rounded-lg p-4 mb-4"
          placeholder="Write your review here..."
        />
        <div className="flex justify-between">
          <select
            value={newRating}
            onChange={(e) => setNewRating(parseInt(e.target.value))}
            className="w-32 border border-gray-300 rounded-lg p-2"
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Stars
              </option>
            ))}
          </select>
          <button
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-green-600 transition duration-200 disabled:bg-gray-400"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleLand;

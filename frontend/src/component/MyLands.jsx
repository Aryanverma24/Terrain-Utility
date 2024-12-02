import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import axios from "axios";

const MyLand = () => {
  const [lands, setLands] = useState([]); // Store the list of lands
  const [loading, setLoading] = useState(true); // Handle loading state
  const [error, setError] = useState(null); // Handle error state
  const [editingLand, setEditingLand] = useState(null); // Store the land being edited
  const [formData, setFormData] = useState({
    landtype: "",
    city: "",
    state: "",
    pincode: "",
  });
  const navigate = useNavigate(); // Initialize navigate for programmatic navigation

  // Fetch lands when the component mounts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      console.log("Fetching lands for user:", user.username);
      fetchUserLands(user.username); // Fetch lands by username
    } else {
      console.error("User not logged in");
      setError("User not logged in.");
    }
  }, []); // Run only once on component mount

  const fetchUserLands = async (username) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/lands/user/${username}`);
      const data = response.data;

      // Check if data is an array before calling .filter()
      if (Array.isArray(data)) {
        console.log(data);  // Process the lands data
        setLands(data);  // Set the lands state
        setLoading(false); // Stop loading
      } else {
        console.error("API response is not an array:", data);
        setError("Failed to fetch lands.");
      }
    } catch (error) {
      console.error("API call failed:", error);
      setError("Failed to fetch lands.");
      setLoading(false); // Stop loading in case of error
    }
  };

  // Handle when an edit button is clicked
  const handleEditClick = (land) => {
    console.log("Editing land:", land);
    setEditingLand(land);
    setFormData({
      landtype: land.landtype,
      city: land.city,
      state: land.state,
      pincode: land.pincode,
    });
  };

  // Update form data when input fields change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating form field "${name}" to value:`, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit the form and save changes
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);

    const authToken = localStorage.getItem("token"); // Retrieve the token from localStorage

    if (!authToken) {
      console.error("Authorization token is missing");
      setError("Authorization token is missing"); // Display error if token is missing
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/lands/${editingLand._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`, // Attach the token in the header
        },
        body: JSON.stringify(formData), // Send the updated land data
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Land updated successfully:", data);
        // Update the land data in the local state to reflect the changes
        setLands((prevLands) =>
          prevLands.map((land) =>
            land._id === editingLand._id ? { ...land, ...formData } : land
          )
        );
        setEditingLand(null); // Close the edit form
        setError(null);
        toast.success("Land details updated successfully!");  // Success message
      } else {
        console.error("Error updating land:", data.message);
        setError(data.message || "Error updating land.");
        toast.error("Failed to update land details.");  // Error message
      }
    } catch (error) {
      console.error("API call failed:", error);
      setError("Failed to update land. Please try again later.");
      toast.error("Failed to update land. Please try again later.");  // Error message
    }
  };

  // Handle the "Check Received Messages" button click
  const handleCheckMessagesAndNavigate = async (landId) => {
    try {
      // Check if landId is valid
      if (!landId) {
        console.error("Land ID is missing");
        toast.error("Land ID is missing. Cannot fetch messages.");
        return;
      }

      // First event: Log or fetch messages for the land ID
      console.log("Fetching messages for land ID:", landId);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        toast.error("You must be logged in to view messages");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/messages/land/${landId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // Add token to the header
          "Content-Type": "application/json",
        },
      });

      // Check if response status is okay
      if (response.ok) {
        const contentType = response.headers.get("Content-Type");

        // Check if the response is in JSON format
        if (contentType && contentType.includes("application/json")) {
          const messages = await response.json();
          console.log("Fetched messages:", messages);
        } else {
          // Handle unexpected non-JSON response
          const errorText = await response.text(); // If response is not JSON (e.g., HTML)
          console.error("Unexpected non-JSON response:", errorText);
          toast.error("Unexpected response format received.");
        }
      } else {
        // Handle API error (non-2xx status)
        const errorData = await response.text(); // For error responses that are not JSON
        console.error("Error fetching messages:", errorData);
        toast.error("Failed to fetch messages. Please try again.");
      }

      // Second event: Navigate to the Messages page
      navigate(`/messages/land/${landId}`);
    } catch (error) {
      console.error("Error handling messages or navigation:", error);
      toast.error("Failed to fetch messages or navigate. Please try again.");
    }
  };

  if (loading) return <p className="text-center text-lg font-semibold text-gray-700">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">My Lands</h1>

      {Array.isArray(lands) && lands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lands.map((land) => (
            <div 
              key={land._id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out"
            >
              <img 
                src={`http://localhost:5000/uploads/${land.image}`} 
                alt={land.city} 
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">{land.landtype}</h3>
                <p className="text-lg text-gray-600">{land.city}, {land.state}</p>
                <div className="text-sm text-gray-500">
                  <p><strong>Owner Name:</strong> {land.ownerName}</p>
                  <p><strong>Pincode:</strong> {land.pincode}</p>
                  <p><strong>Created At:</strong> {new Date(land.createdAt).toLocaleString()}</p>
                  <p><strong>Average Rating:</strong> {land.averageRating}</p>
                </div>

                {/* Edit Button */}
                <button
                  className="w-full py-2 bg-yellow-500 text-white rounded-md mt-4 hover:bg-yellow-600"
                  onClick={() => handleEditClick(land)}
                >
                  Edit
                </button>

                {/* Check Received Messages Button */}
                <button
                  className="w-full py-2 bg-blue-500 text-white rounded-md mt-4 hover:bg-blue-600"
                  onClick={() => handleCheckMessagesAndNavigate(land._id)} // Call the function on click
                >
                  Check Received Messages
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-lg text-gray-600">No lands found.</p>
      )}
    </div>
  );
};

export default MyLand;

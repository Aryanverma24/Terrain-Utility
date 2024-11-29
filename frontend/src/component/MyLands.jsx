import { useEffect, useState } from "react";
import { toast } from "react-toastify";  // Import Toastify

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

  // Fetch lands when the component mounts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      fetchUserLands(user.username);
    } else {
      console.error("User not logged in");
      setError("User not logged in.");
    }
  }, []); // Run only once on component mount

  const fetchUserLands = async (username) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lands/user/${username}`);
      const data = await response.json();
  
      const userLands = data.filter((land) => land.ownerName === username); // Filter lands for the logged-in user
  
      if (response.ok) {
        setLands(userLands); // Set the state with filtered lands
        setError(null);
      } else {
        setError(data.message || "Error fetching lands.");
      }
    } catch (error) {
      console.error("API call failed:", error);
      setError("Failed to fetch lands. Please try again later.");
    } finally {
      setLoading(false); // Stop loading after API call
    }
  };

  // Handle when an edit button is clicked
  const handleEditClick = (land) => {
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit the form and save changes
  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
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
        setError(data.message || "Error updating land.");
        toast.error("Failed to update land details.");  // Error message
      }
    } catch (error) {
      console.error("API call failed:", error);
      setError("Failed to update land. Please try again later.");
      toast.error("Failed to update land. Please try again later.");  // Error message
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-lg text-gray-600">No lands available.</p>
      )}

      {/* Edit Land Form */}
      {editingLand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 w-96">
            <h2 className="text-2xl font-semibold mb-4">Edit Land Details</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700" htmlFor="landtype">Land Type</label>
                  <input
                    type="text"
                    id="landtype"
                    name="landtype"
                    value={formData.landtype}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700" htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700" htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700" htmlFor="pincode">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  className="py-2 px-4 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                  onClick={() => setEditingLand(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLand;

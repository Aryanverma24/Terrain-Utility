import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import axios from "axios";
import Chat from "./Chat";

const MyLand = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLand, setEditingLand] = useState(null);
  const [formData, setFormData] = useState({
    landtype: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [selectedLand, setSelectedLand] = useState(null);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.username) {
      fetchUserLands(user.username);
    } else {
      toast.error("User not logged in.");
      setError("User not logged in.");
    }
  }, []);

  const fetchUserLands = async (username) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/lands/user/${username}`
      );
      if (Array.isArray(response.data)) {
        setLands(response.data);
      } else {
        toast.error("Failed to fetch lands.");
        setError("Failed to fetch lands.");
      }
    } catch (error) {
      console.error("Error fetching lands:", error);
      setError("Failed to fetch lands.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (land) => {
    setEditingLand(land);
    setFormData({
      landtype: land.landtype,
      city: land.city,
      state: land.state,
      pincode: land.pincode,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      toast.error("Authorization token is missing.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/lands/${editingLand._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        setLands((prevLands) =>
          prevLands.map((land) =>
            land._id === editingLand._id ? { ...land, ...formData } : land
          )
        );
        setEditingLand(null);
        toast.success("Land details updated successfully!");
      } else {
        toast.error("Failed to update land details.");
      }
    } catch (error) {
      console.error("Error updating land:", error);
      toast.error("Failed to update land details.");
    }
  };

  const handleCheckMessagesAndNavigate = async (landId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/messages/land/${landId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        console.log("Fetched messages:", response.data);
        setMessages(response.data);
        navigate(`/messages/land/${landId}`);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 404) {
          toast.error(data.message || "No messages found for this land.");
        } else {
          toast.error(data.message || "An error occurred. Please try again.");
        }
      } else {
        toast.error("Failed to fetch messages. Check your connection.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-center mb-8">My Lands</h1>

      {lands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lands.map((land) => (
            <div
              key={land._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <img
                src={`http://localhost:5000/uploads/${land.image}`}
                alt={land.city}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-semibold">{land.landtype}</h3>
                <p>
                  {land.city}, {land.state}
                </p>
                <p>Owner: {land.ownerName}</p>
                <button
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md"
                  onClick={() => handleCheckMessagesAndNavigate(land._id)}
                >
                  Check Received Messages
                </button>
                <button
                  className="mt-4 w-full bg-green-500 text-white py-2 rounded-md"
                  onClick={() => handleEditClick(land)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No lands found.</p>
      )}

      {/* Edit Form */}
      {editingLand && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-6 rounded shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Edit Land Details</h2>
            <div>
              <label className="block font-semibold">Land Type</label>
              <input
                type="text"
                name="landtype"
                value={formData.landtype}
                onChange={handleFormChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleFormChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-semibold">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleFormChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setEditingLand(null)}
                className="mr-2 bg-gray-500 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyLand;

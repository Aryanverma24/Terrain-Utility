import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import axios from "axios";
import "./fallBounce.css";

const MyLand = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLand, setEditingLand] = useState(null);

  // Added new fields here
  const [formData, setFormData] = useState({
    landtype: "",
    city: "",
    state: "",
    pincode: "",
    price: "",
    dimensions: "",
    ratings: "",
    description:"",
  });

  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.username) {
      fetchUserLands(user?.username);
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

      if (Array.isArray(response.data) && response.data.length > 0) {
        setLands(response.data);
      } else {
        setLands([]);
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

    // PRE-FILL WITH NEW FIELDS
    setFormData({
      landtype: land.landtype,
      city: land.city,
      state: land.state,
      pincode: land.pincode,
      price: land.price || "",
      dimensions: land.dimensions || "",
      ratings: land.ratings || "",
      description: land.description || "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/lands/${editingLand._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
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

  // const handleCheckMessagesAndNavigate = async (landId) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.get(
  //       `http://localhost:5000/api/messages/land/${landId}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     setMessages(response.data);
  //     navigate(`/messages/land/${landId}`);
  //   } catch (error) {
  //     if (error.response && error.response.status === 404) {
  //       setMessages([]);
  //       toast.info("No messages found for this land yet.");
  //       navigate(`/messages/land/${landId}`);
  //     } else {
  //       toast.error("Failed to fetch messages. Try again.");
  //     }
  //   }
  // };
const handleCheckMessagesAndNavigate = (land) => {
  navigate(`/chat/owner/list`, {
    state: {
      receiverId: land.buyerId,
      receiverName: land.buyerName,
      landDetails: land
    },
  });
};
  if (loading)
    return (
      <>
        <div className="text-green-700 bg-gray-800 flex flex-col pt-3 pl-[15%] h-screen">
          <h1 className="text-3xl font-semi-bold mt-[1rem] mb-[1rem] pl-[15%]">
            User not logged in{" "}
            <Link
              to="/login"
              className="text-yellow-600 underline underline-offset-4 hover:text-orange-400"
            >
              Login
            </Link>{" "}
            please...
          </h1>
          <img
            className="w-[600px] h-[350px] rounded-2xl shadow-sm"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf6ElDgp_-OzsHJ19TPFgYnLrzUJXVj7qOdA&s"
            alt="sad kitten"
          />
        </div>
      </>
    );

  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-mintGreen text-black h-screen pt-[5rem]">
      <h1 className="text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 animate-pulse mb-8">
        My Lands
      </h1>

      {lands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lands.map((land) => (
            <div
              key={land._id}
              className="bg-cardGreen p-4 rounded-lg shadow-lg overflow-hidden"
            >
              {/* IMAGE */}
              <Link to={`/land/${land._id}`}>
                <img
                  src={`http://localhost:5000/uploads/${land.image}`}
                  alt={land.city}
                  className="w-full h-44 object-cover rounded-xl"
                />
              </Link>

              <div className="p-4">
                <h3 className="text-2xl font-semibold">
                  {land.landtype[0].toUpperCase() + land.landtype.substring(1)}
                </h3>

                <p>
                  {land.city}, {land.state}
                </p>
                <p>Owner: {land.ownerName}</p>

                {/* NEW FIELDS */}
                <p className="mt-2 font-medium">💰 Price: ₹{land.price || "N/A"}</p>
               <p className="font-medium">
  📏 Dimensions:{" "}
  {land.dimensions && typeof land.dimensions === "object"
    ? `${land.dimensions.length} × ${land.dimensions.breadth} ft`
    : typeof land.dimensions === "string"
    ? land.dimensions.replace("*", " × ") + " ft"
    : "N/A"}
</p>



        


                <div className="flex gap-8 mt-3">
                  <button
                    className="w-full bg-blue-500 text-white py-2 rounded-md"
                    onClick={() => handleCheckMessagesAndNavigate(land)}
                  >
                    Check Messages
                  </button>
                  <button
                    className="w-full bg-green-500 text-white py-2 rounded-md"
                    onClick={() => handleEditClick(land)}
                  >
                    Edit Land
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <img
              className="w-[520px] absolute z-10 h-[365px] rounded-2xl shadow-sm"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf6ElDgp_-OzsHJ19TPFgYnLrzUJXVj7qOdA&s"
              alt="sad kitten"
            />
          </div>
          <p className="text-3xl left-[46%] absolute bottom-8 mt-3 fall-bounce">
            No lands found.
          </p>
        </>
      )}

      {/* EDIT FORM */}
      {editingLand && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Land Details</h2>

            {/* Old Fields */}
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

            {/* NEW EDITABLE FIELDS */}
            <div>
              <label className="block font-semibold">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block font-semibold">Dimensions</label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
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
              <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
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

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import axios from "axios";
import { getFileUrl } from "../../../../backend/utils/getFileUrl";

const MyLand = () => {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLand, setEditingLand] = useState(null);

  const [formData, setFormData] = useState({
    landtype: "",
    city: "",
    state: "",
    pincode: "",
    price: "",
    dimensions: "",
    description: "",
  });

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Format Dimensions Safely
  const formatDimensions = (dim) => {
    if (!dim) return "N/A";
    if (typeof dim === "object") {
      return `${dim.length} × ${dim.breadth} ft`;
    }
    return dim;
  };

  // 🔐 Decode JWT
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const decoded = token ? decodeJWT(token) : null;
  const currentUserId = decoded?.userId || decoded?._id || decoded?.id;
  const role = decoded?.role;

  // 🔄 Fetch Lands
  useEffect(() => {
    if (user?.username) {
      fetchUserLands(user.username);
    }
  }, []);

  const fetchUserLands = async (identifier) => {
    try {
      setLoading(true);

      let response;

      if (role === "lawyer") {
        response = await axios.get(
          `http://localhost:5000/api/lands/lawyer/${currentUserId}`
        );
      } else {
        response = await axios.get(
          `http://localhost:5000/api/lands/user/${identifier}`
        );
      }

      setLands(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      toast.error("Failed to fetch lands");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit
  const handleEditClick = (land) => {
    setEditingLand(land);
    setFormData({
      landtype: land.landtype || "",
      city: land.city || "",
      state: land.state || "",
      pincode: land.pincode || "",
      price: land.price || "",
      dimensions: land.dimensions || "",
      description: land.description || "",
    });
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/api/lands/${editingLand._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLands((prev) =>
        prev.map((l) =>
          l._id === editingLand._id ? { ...l, ...formData } : l
        )
      );

      setEditingLand(null);
      toast.success("Updated successfully");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleCheckMessagesAndNavigate = () => {
    navigate("/owner-inbox");
  };

  // 🔥 LOADING SKELETON
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-10 grid md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white/10 rounded-xl p-5"
          >
            <div className="h-40 bg-gray-600 rounded mb-4"></div>
            <div className="h-5 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-gray-600 rounded mb-4"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-600 rounded w-1/2"></div>
              <div className="h-10 bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50  pt-16">
      <h1 className="text-3xl text-black text-center mb-10">
        My Land
      </h1>

      {lands.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6 px-6">
          {lands.map((land) => {
            const isApprovedByMe =
              String(land.approvedBy?._id || land.approvedBy) ===
              String(currentUserId);

            const isAssignedToMe =
              String(land.assignedLawyer?._id || land.assignedLawyer) ===
              String(currentUserId);

            return (
              <div
  key={land._id}
  onClick={() => navigate(`/land/${land._id}`)}
  className="bg-[#ACE1AF] backdrop-blur-lg p-5 rounded-xl text-white 
             cursor-pointer hover:scale-[1.02] transition-all duration-200"
>
                {/* Image */}
                {land.image && (
                  <img
                    src={getFileUrl(land.image)}
                    alt="land"
                    className="h-40 w-full object-cover rounded-lg mb-3"
                  />
                )}

                {/* Details */}
                <h2 className="text-xl text-gray-900 font-bold">
                  {land.city}, {land.state}
                </h2>

                <p className="text-gray-900 font-bold italic">₹ {land.price || "N/A"}</p>

                <p className="text-gray-800 text-sm">
                  {formatDimensions(land.dimensions)}
                </p>

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleEditClick(land)}
                    className="bg-green-500 px-3 py-2 rounded-md"
                  >
                    Edit
                  </button>

                  <button
                    onClick={handleCheckMessagesAndNavigate}
                    className="bg-blue-500 px-3 py-2 rounded-md"
                  >
                    Messages
                  </button>
                </div>

                {/* Lawyer UI */}
                {role === "lawyer" && (
                  <>
                    {land.status === "approved" && isApprovedByMe && (
                      <div className="mt-3 bg-green-600 py-2 rounded text-center">
                        ✅ Approved by You
                      </div>
                    )}

                    {land.status !== "approved" && isAssignedToMe && (
                      <div className="mt-3 bg-yellow-500 py-2 rounded text-center">
                        🔍 Reviewing
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-white">
          <p className="mb-4">No lands found</p>
          <Link to="/add-land" className="text-green-400 underline">
            Add Land
          </Link>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingLand && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white p-6 rounded w-[400px]"
          >
            <input
              name="city"
              value={formData.city}
              onChange={handleFormChange}
              placeholder="City"
              className="w-full mb-3 p-2 border"
            />

            <input
              name="state"
              value={formData.state}
              onChange={handleFormChange}
              placeholder="State"
              className="w-full mb-3 p-2 border"
            />

            <input
              name="price"
              value={formData.price}
              onChange={handleFormChange}
              placeholder="Price"
              className="w-full mb-3 p-2 border"
            />

            <div className="flex justify-between">
              <button className="bg-green-500 px-4 py-2 text-white">
                Save
              </button>

              <button
                type="button"
                onClick={() => setEditingLand(null)}
                className="bg-gray-500 px-4 py-2 text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyLand;
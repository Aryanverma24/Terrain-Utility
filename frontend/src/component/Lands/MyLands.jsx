import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../contexts/authContext";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getFileUrl } from "../../../../backend/utils/getFileUrl";

const MyLand = () => {
  // ================= STATE =================
  const [lands, setLands] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLand, setEditingLand] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
const [consultationLands, setConsultationLands] = useState([]);
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

  // ================= JWT =================
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      return JSON.parse(atob(base64Url));
    } catch {
      return null;
    }
  };

  const decoded = token ? decodeJWT(token) : null;
  const currentUserId = decoded?.userId || decoded?._id || decoded?.id;
  const role = decoded?.role;

  // ================= FETCH =================
  useEffect(() => {
    if (user?.username) {
      fetchUserLands(user.username);
      if (role === "lawyer") fetchApprovedUsers();
    }
     fetchConsultationLands();
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
    } catch {
      toast.error("Failed to fetch lands");
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/users/approved-users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setApprovedUsers(res.data || []);
    } catch {
      toast.error("Failed to fetch approved users");
    }
  };

  // ================= VIEW DOCS =================
  const handleViewDocuments = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/user-documents/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedDocs(res.data);
      setShowDocsModal(true);
    } catch {
      toast.error("Failed to fetch documents");
    }
  };

  // ================= DEDUP USERS =================
  const uniqueApprovedUsers = Object.values(
    approvedUsers.reduce((acc, doc) => {
      if (doc.user?._id) {
        acc[doc.user._id] = doc;
      }
      return acc;
    }, {})
  );

  // ================= EDIT =================
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
const fetchConsultationLands = async () => {
  try {
    const res = await axios.get(
  "http://localhost:5000/api/chat/consultation",
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

    // console.log("CONSULTATION API:", res.data); 
    
    if (Array.isArray(res.data)) {
      setConsultationLands(res.data);
    } else {
      setConsultationLands([]);
    }
  } catch (err) {
    console.error("Error fetching consultation lands", err);
    setConsultationLands([]); // fallback
  }
};
  const formatDimensions = (dim) => {
    if (!dim) return "N/A";
    if (typeof dim === "object") {
      return `${dim.length} × ${dim.breadth} ft`;
    }
    return dim;
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50 pt-16 px-6">

      {/* ================= LAND SECTION ================= */}
      <h1 className="text-3xl text-center mb-8">My Lands</h1>

      {lands.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {lands.map((land) => {
            const isApprovedByMe =
              String(land.approvedBy?._id || land.approvedBy) ===
              String(currentUserId);

            return (
              <div
                key={land._id}
                onClick={() => navigate(`/land/${land._id}`)}
                className="bg-[#ACE1AF] p-5 rounded-xl cursor-pointer hover:scale-105"
              >
                {land.image && (
                  <img
                    src={getFileUrl(land.image)}
                    className="h-40 w-full object-cover rounded mb-2"
                  />
                )}

                <h2 className="font-bold text-lg">
                  {land.city}, {land.state}
                </h2>

                <p>₹ {land.price}</p>
                <p>{formatDimensions(land.dimensions)}</p>

                {role === "lawyer" && isApprovedByMe && (
                  <div className="mt-2 bg-green-600 text-white text-center py-1 rounded">
                    Approved by You
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>No lands found</p>
      )}

      {/* ================= APPROVED USERS ================= */}
      {role === "lawyer" && (
        <>
          <h1 className="text-3xl text-center mt-16 mb-6">
            Users Documents Approved By You
          </h1>

          {uniqueApprovedUsers.length === 0 ? (
            <p className="text-center">No approved users yet</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {uniqueApprovedUsers.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white p-5 rounded-xl shadow-md"
                >
                  <h2 className="font-bold text-lg">
                    {doc.user?.username}
                  </h2>

                  <p className="text-sm text-gray-600">
                    {doc.user?.email}
                  </p>

                  <div className="mt-3 bg-green-500 text-white text-center py-1 rounded">
                    Fully Verified ✅
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDocuments(doc.user._id);
                    }}
                    className="mt-3 bg-purple-600 text-white px-3 py-2 rounded-md w-full"
                  >
                    View Documents
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ================= DOCUMENT MODAL ================= */}
      {showDocsModal && selectedDocs && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50 px-4">

    <div className="w-full max-w-4xl bg-mintGreen rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6 md:p-8 max-h-[85vh] overflow-y-auto animate-fadeInUp">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-darkWalnut">
          {selectedDocs.user.username}'s Documents
        </h2>

        <button
          onClick={() => setShowDocsModal(false)}
          className="text-gray-400 hover:text-black text-xl"
        >
          ✖
        </button>
      </div>

      {/* DOCUMENT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

        {selectedDocs.documents.map((doc) => (
          <div
            key={doc._id}
            className="bg-white/80 backdrop-blur-md border border-sand500 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300"
          >

            {/* IMAGE */}
            <img
              src={
                doc.file.cloudinary ||
                `http://localhost:5000/${doc.file.local}`
              }
              alt={doc.type}
              className="w-full h-40 object-cover rounded-xl mb-3 cursor-pointer hover:opacity-90"
              onClick={() =>
                window.open(
                  doc.file.cloudinary ||
                  `http://localhost:5000/${doc.file.local}`,
                  "_blank"
                )
              }
            />

            {/* TYPE */}
            <p className="text-sm font-semibold text-darkWalnut text-center">
              {doc.type}
            </p>

            {/* STATUS BADGE */}
            <div className="flex justify-center mt-2">
              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold
                  ${
                    doc.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : doc.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {doc.status}
              </span>
            </div>

            {/* TIMESTAMP */}
            <p className="text-xs text-gray-500 text-center mt-2">
              {new Date(doc.uploadedAt).toLocaleDateString()}
            </p>

          </div>
        ))}

      </div>

      {/* FOOTER */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setShowDocsModal(false)}
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-medium shadow-md transition"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
      {/* ================= EDIT MODAL ================= */}
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
              className="w-full mb-3 p-2 border"
            />

            <input
              name="state"
              value={formData.state}
              onChange={handleFormChange}
              className="w-full mb-3 p-2 border"
            />

            <input
              name="price"
              value={formData.price}
              onChange={handleFormChange}
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

      {/* Consultation Lands (Only for Lawyers) */}
{role === "lawyer" && consultationLands.length > 0 && (
  <div className="mt-10">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      🟣 Consultation Lands
    </h2>

    <div className="grid md:grid-cols-2 gap-4">
      {consultationLands.map((land) => (
        <div
          key={land._id}
          className="bg-white border border-purple-200 rounded-2xl shadow-sm p-4 hover:shadow-md transition"
        >
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800">
            {land.title}
          </h3>

          {/* City */}
          <p className="text-sm text-gray-500">{land.city}</p>

          {/* Tag */}
          <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Consultation Access
          </span>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <Link
              to={`/land/${land._id}`}
              className="text-sm px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-black transition"
            >
              View Land
            </Link>

            <Link
  to={`/inbox?chatId=${land.chatId}`}
              className="text-sm px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Open Chat
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
    </div>
  );
};

export default MyLand;
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../contexts/authContext';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getFileUrl } from '../../../../backend/utils/getFileUrl';

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
    landtype: '',
    city: '',
    state: '',
    pincode: '',
    price: '',
    dimensions: '',
    description: '',
    tokenPercentage: '',
  });
  const [tokenWarning, setTokenWarning] = useState("");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ================= JWT =================
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
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
      if (role === 'lawyer') fetchApprovedUsers();
    }
    fetchConsultationLands();
  }, []);

  const fetchUserLands = async (identifier) => {
    try {
      setLoading(true);

      let response;

      if (role === 'lawyer') {
        response = await axios.get(
          `http://localhost:5000/api/lands/lawyer/${currentUserId}`,
        );
      } else {
        response = await axios.get(`http://localhost:5000/api/lands/user/${identifier}`);
      }

      setLands(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error('Failed to fetch lands');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/approved-users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApprovedUsers(res.data || []);
    } catch {
      toast.error('Failed to fetch approved users');
    }
  };

  // ================= VIEW DOCS =================
  const handleViewDocuments = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/user-documents/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSelectedDocs(res.data);
      setShowDocsModal(true);
    } catch {
      toast.error('Failed to fetch documents');
    }
  };

  // ================= DEDUP USERS =================
  const uniqueApprovedUsers = Object.values(
    approvedUsers.reduce((acc, doc) => {
      if (doc.user?._id) {
        acc[doc.user._id] = doc;
      }
      return acc;
    }, {}),
  );

  // ================= EDIT =================
  const handleEditClick = (land) => {
    setEditingLand(land);
    setFormData({
      landtype: land.landtype || '',
      city: land.city || '',
      state: land.state || '',
      pincode: land.pincode || '',
      price: land.price || '',
      dimensions: land.dimensions || '',
      description: land.description || '',
      tokenPercentage:
  land.tokenConfig?.percentage || 5,
    });
  };

  //token amount calc
  const calculateTokenAmount = (price, percent) => {
  const p = Number(price || 0);
  const per = Number(percent || 0);
  return Math.round((p * per) / 100);
};
//to check whether token money is valid or not 
const isTokenValid =
  formData.tokenPercentage &&
  Number(formData.tokenPercentage) > 0 &&
  Number(formData.tokenPercentage) <= 20;

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

const handleFormSubmit = async (e) => {
  e.preventDefault();

  try {
    const tokenPercentage = Number(formData.tokenPercentage);
    const price = Number(formData.price);

    // 🔥 FRONTEND SAFETY CHECK (UX layer)
    if (tokenPercentage > 20) {
      toast.error("Token percentage cannot exceed 20%");
      return;
    }

    if (tokenPercentage <= 0) {
      toast.error("Token percentage must be greater than 0");
      return;
    }

    const payload = {
      landtype: formData.landtype,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      price,
      dimensions: formData.dimensions,
      description: formData.description,
      tokenPercentage,
    };

    const { data } = await axios.put(
      `http://localhost:5000/api/lands/${editingLand._id}`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setLands((prev) =>
      prev.map((l) =>
        l._id === editingLand._id ? data : l
      )
    );

    setEditingLand(null);
    toast.success("Updated successfully");
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Update failed"
    );
  }
};
  const fetchConsultationLands = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat/consultation', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("CONSULTATION API:", res.data);

      if (Array.isArray(res.data)) {
        setConsultationLands(res.data);
      } else {
        setConsultationLands([]);
      }
    } catch (err) {
      console.error('Error fetching consultation lands', err);
      setConsultationLands([]); // fallback
    }
  };
  const formatDimensions = (dim) => {
    if (!dim) return 'N/A';
    if (typeof dim === 'object') {
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
  <div className="grid md:grid-cols-3 gap-8">
    {lands.map((land) => {
      const isApprovedByMe =
        String(land.approvedBy?._id || land.approvedBy) ===
        String(currentUserId);

      return (
        <div
          key={land._id}
          onClick={() => navigate(`/land/${land._id}`)}
          className="
            group
            bg-white
            rounded-3xl
            overflow-hidden
            shadow-lg
            hover:shadow-2xl
            transition-all
            duration-300
            cursor-pointer
            hover:-translate-y-2
            border border-emerald-100
          "
        >
          {/* IMAGE */}
          <div className="relative overflow-hidden">
            {land.image && (
              <img
                src={getFileUrl(land.image)}
                alt="land"
                className="
                  h-56
                  w-full
                  object-cover
                  group-hover:scale-110
                  transition-transform
                  duration-500
                "
              />
            )}

            {/* Type Badge */}
            <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow">
              {land.landtype || 'Land'}
            </div>

            {/* Approved Badge */}
            {role === 'lawyer' && isApprovedByMe && (
              <div className="absolute top-4 right-4 bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">
                Approved By You
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-6">

            {/* Location */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              📍 {land.city}, {land.state}
            </h2>

            {/* Price */}
            <div className="mb-3">
              <p className="text-gray-500 text-sm">
                Property Price
              </p>
              <p className="text-2xl font-bold text-emerald-700">
                ₹ {Number(land.price).toLocaleString()}
              </p>
            </div>

            {/* Token */}
            <div className="mb-4 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-sm text-gray-500">
                Token Money
              </p>

             <p className="font-semibold text-emerald-700">
  ₹{" "}
  {Number(
    land.tokenConfig?.amount ||
    Math.round(land.price * 0.05)
  ).toLocaleString()}
</p>
            </div>

            {/* Dimensions */}
            <div className="mb-5 text-gray-600">
              📐 {formatDimensions(land.dimensions)}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(land);
                }}
                className="
                  flex-1
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  py-3
                  rounded-xl
                  font-semibold
                  shadow-md
                  transition
                "
              >
                ✏ Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/land/${land._id}`);
                }}
                className="
                  flex-1
                  bg-emerald-600
                  hover:bg-emerald-700
                  text-white
                  py-3
                  rounded-xl
                  font-semibold
                  shadow-md
                  transition
                "
              >
                View
              </button>
            </div>

          </div>
        </div>
      );
    })}
  </div>
) : (
  <div className="text-center py-20">
    <h2 className="text-2xl font-semibold text-gray-600">
      No lands found
    </h2>

    <p className="text-gray-500 mt-2">
      Start by listing your first property.
    </p>
  </div>
)}

      {/* ================= APPROVED USERS ================= */}
      {role === 'lawyer' && (
        <>
          <h1 className="text-3xl text-center mt-16 mb-6">
            Users Documents Approved By You
          </h1>

          {uniqueApprovedUsers.length === 0 ? (
            <p className="text-center">No approved users yet</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {uniqueApprovedUsers.map((doc) => (
                <div key={doc._id} className="bg-white p-5 rounded-xl shadow-md">
                  <h2 className="font-bold text-lg">{doc.user?.username}</h2>

                  <p className="text-sm text-gray-600">{doc.user?.email}</p>

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
                    src={doc.file.cloudinary || `http://localhost:5000/${doc.file.local}`}
                    alt={doc.type}
                    className="w-full h-40 object-cover rounded-xl mb-3 cursor-pointer hover:opacity-90"
                    onClick={() =>
                      window.open(
                        doc.file.cloudinary || `http://localhost:5000/${doc.file.local}`,
                        '_blank',
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
                    doc.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : doc.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
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
{/* ================= EDIT MODAL ================= */}
{editingLand && (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
  <form
    onSubmit={handleFormSubmit}
    className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-5"
  >
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
      Edit Land Details
    </h2>

    {/* City */}
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">
        City
      </label>
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleFormChange}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    {/* State */}
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">
        State
      </label>
      <input
        type="text"
        name="state"
        value={formData.state}
        onChange={handleFormChange}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    {/* Price */}
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">
        Price (₹)
      </label>
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleFormChange}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    {/* Token Money % (optional if adding this feature now) */}
<div>
  <label className="block mb-2 text-sm font-semibold text-gray-700">
    Token Percentage (%)
  </label>

  <input
    type="number"
    name="tokenPercentage"
    value={formData.tokenPercentage}
    onChange={handleFormChange}
    min={1}
    max={20}
    className={`w-full p-3 border rounded-xl outline-none transition
      ${
        formData.tokenPercentage > 20
          ? "border-red-500 focus:ring-2 focus:ring-red-400"
          : "focus:ring-2 focus:ring-green-500"
      }`}
  />

  {/* LIVE WARNING */}
  {formData.tokenPercentage > 20 && (
    <p className="text-red-500 text-sm mt-2 font-medium animate-pulse">
      ⚠ Token percentage cannot exceed 20%
    </p>
  )}

  {/* LIVE CALCULATION */}
  <p className="text-sm mt-2 text-emerald-600 font-semibold">
    Token Amount: ₹{" "}
    {calculateTokenAmount(
      formData.price,
      Math.min(formData.tokenPercentage || 0, 20)
    )}
  </p>
</div>

    {/* Description */}
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-700">
        Description
      </label>
      <textarea
        name="description"
        rows="4"
        value={formData.description}
        onChange={handleFormChange}
        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    {/* Buttons */}
    <div className="flex justify-between gap-4 pt-4">
  <button
    type="button"
    onClick={() => setEditingLand(null)}
    className="w-1/2 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold"
  >
    Cancel
  </button>

  <button
    type="submit"
    disabled={!isTokenValid}
    className={`w-1/2 py-3 rounded-xl font-semibold text-white transition
      ${
        isTokenValid
          ? "bg-green-600 hover:bg-green-700"
          : "bg-green-300 cursor-not-allowed"
      }`}
  >
    Save Changes
  </button>
</div>
  </form>
</div>
)}

      {/* Consultation Lands (Only for Lawyers) */}
      {role === 'lawyer' && consultationLands.length > 0 && (
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
                <h3 className="text-lg font-semibold text-gray-800">{land.title}</h3>

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

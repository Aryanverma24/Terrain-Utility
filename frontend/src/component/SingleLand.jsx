import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../utils/API";
import StarIcon from "@heroicons/react/24/solid/StarIcon";
import StarIconOutline from "@heroicons/react/24/outline/StarIcon";
import axios from "axios";

/**
 * Decode JWT (very small utility) - returns parsed payload or null
 */
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * UnitConverter sub-component
 */
const UnitConverter = ({ dimensions }) => {
  if (!dimensions) return null;
  const length = Number(dimensions.length) || 0;
  const breadth = Number(dimensions.breadth) || 0;
  const sqFt = length * breadth;

  const conversions = {
    "Square Feet (sq ft)": sqFt,
    "Square Meter (sq m)": sqFt * 0.092903,
    "Square Yard / Gaj": sqFt / 9,
    Acre: sqFt / 43560,
    Hectare: sqFt / 107639,
    Bigha: sqFt / 27225,
    "Bighadi (Half Bigha)": sqFt / 13612.5,
    Biswa: sqFt / 1361.25,
    Guntha: sqFt / 1089,
    Kanal: sqFt / 5445,
    Marla: sqFt / 272.25,
    Rood: sqFt / 10890,
    Cent: sqFt / 435.6,
    Killa: sqFt / 108900,
    Murabba: sqFt / 1089000,
  };

  const [selectedUnit, setSelectedUnit] = useState("Square Feet (sq ft)");

  return (
<div className="max-w-6xl mx-auto mt-10 p-6 bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 backdrop-blur-xl rounded-2xl border border-teal-700 shadow-lg">

  <h3 className="text-lg font-semibold text-emerald-50 mb-4">Unit Conversion</h3>

  <div className="flex flex-col md:flex-row gap-5">

    {/* Base Unit */}
    <div className="flex-1">
      <label className="text-emerald-50 text-xs mb-1 block">Base Unit</label>
      <input
        type="text"
        value={`${sqFt} sq ft`}
        disabled
        className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 border border-teal-700 rounded-xl text-emerald-50 text-sm focus:ring-2 focus:ring-teal-300 transition-transform duration-300 hover:scale-105"
      />
    </div>

    {/* Dropdown Unit Selection */}
    <div className="flex-1">
      <label className="text-emerald-50 text-xs mb-1 block">Convert Into</label>
      <select
        value={selectedUnit}
        onChange={(e) => setSelectedUnit(e.target.value)}
        className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 border border-teal-700 rounded-xl text-emerald-50 text-sm focus:ring-2 focus:ring-teal-300 transition-transform duration-300 hover:scale-105"
      >
        {Object.keys(conversions).map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>
    </div>

  </div>

  {/* Converted Value Section — NO HOVER EFFECTS */}
  <div className="mt-6 bg-gradient-to-br from-teal-700 via-teal-600 to-teal-700 border border-teal-800 rounded-xl p-4 shadow-inner">

    <label className="text-emerald-50 font-medium text-xs">Converted Value</label>

    <div className="mt-2 px-4 py-3 
      bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600
      border border-teal-700 rounded-xl 
      text-emerald-50 font-semibold text-sm text-center shadow-sm">
      {Number(conversions[selectedUnit] || 0).toLocaleString()} {selectedUnit}
    </div>

  </div>
</div>



  );
};

/**
 * Main SingleLand component
 */
const SingleLand = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const decoded = token ? decodeJWT(token) : null;
  const currentUserId = decoded?.userId || decoded?._id || decoded?.id || null;
  const currentUsername = decoded?.username || decoded?.userName || decoded?.name || null;
  const role = decoded?.role || null;

  // Reviews
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);


  // fullDocs holds an array of parent document objects each containing a `documents` array
  const [fullDocs, setFullDocs] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [notifications, setNotifications] = useState([]);

// Combine main photo + additional land photos
const landPhotos = [
   land?.image,, // main image uploaded during land creation
  ...fullDocs.filter(doc => doc.type === "LandPhotos").map(doc => doc.file)
].filter(Boolean); // remove undefined/null

const prevSlide = () => {
  setCurrentSlide((prev) => (prev === 0 ? landPhotos.length - 1 : prev - 1));
};

const nextSlide = () => {
  setCurrentSlide((prev) => (prev === landPhotos.length - 1 ? 0 : prev + 1));
};




  useEffect(() => {
  const interval = setInterval(() => {
    nextSlide();
  }, 3000); // slide every 5 seconds
  return () => clearInterval(interval);
}, [landPhotos.length]);
// --- Inside fetchLand or wherever you set fullDocs ---
// Extract full sub-documents for lawyer/owner actions
const fetchLand = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const { data: landData } = await API.get(`/api/lands/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    setLand(landData);

    // Flatten and dedupe sub-documents (works for nested documents)
    const documentIds = landData.documents.map(doc => (typeof doc === "string" ? doc : doc._id));
    
    const documentDocs = await Promise.all(
      documentIds.map(async docId => {
        const res = await API.get(`/api/documents/${docId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return res.data;
      })
    );

    const flattenedDocs = documentDocs.flatMap(doc =>
      doc.documents
        ? doc.documents.map(subDoc => ({
            _id: subDoc._id,
            type: subDoc.type,
            file: subDoc.file,
            uploadedAt: subDoc.uploadedAt,
            status: subDoc.status || doc.status,
            parentDocumentId: doc._id,
          }))
        : doc
    );

    const uniqueDocs = Array.from(new Map(flattenedDocs.map(d => [d._id, d])).values());

    setFullDocs(uniqueDocs);
    console.log("Frontend unique sub-documents:", uniqueDocs);

  } catch (err) {
    console.error("Fetch land error:", err?.response?.data || err.message || err);
    setError(err?.response?.data?.message || "Failed to fetch land details.");
  } finally {
    setLoading(false);
  }
}, [id, token]);


  useEffect(() => {
    fetchLand();
  }, [fetchLand]);






  // Chat navigation
const handleRedirectToChat = async () => {
  if (role === "lawyer") return toast.error("Lawyer cannot chat.");
  if (!land) return toast.error("No land selected.");
  if (!currentUserId) return toast.error("Login required.");

  try {
    // 🔥 STEP 1: Create or get chat
    const res = await axios.post(
      "http://localhost:5000/api/chat/get-or-create",
      {
        landId: land._id,
        buyerId: currentUserId,
        ownerId: land.owner,
        buyerName: currentUsername,
      }
    );

    const chat = res.data;

    // 🔥 STEP 2: Navigate using chatId ONLY
    navigate(`/chat/${chat._id}`, {
      state: { chat },
    });

  } catch (err) {
    console.error("Chat creation error:", err);
    toast.error("Failed to start chat");
  }
};


  // Approve handler
  const handleApprove = async () => {
    if (!token) return toast.error("Login required.");
    if (!land) return;
    try {
      setProcessingAction(true);
      await API.put(
        `/api/lawyer/${land._id}/action`,
        { action: "approve" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Land approved!");
      setLand((prev) => ({
        ...prev,
        status: "approved",
        approvedBy: { _id: currentUserId, username: currentUsername },
        rejectionReason: null,
      }));
    } catch (err) {
      console.error("Approve error:", err?.response?.data || err.message || err);
      toast.error(err?.response?.data?.message || "Failed to approve land.");
    } finally {
      setProcessingAction(false);
    }
  };

  // Reject handler (submit)
  const handleRejectSubmit = async () => {
    if (!token) return toast.error("Login required.");
    if (!rejectReason.trim()) return toast.error("Please provide a reason for rejection.");
    if (!land) return;

    try {
      setProcessingAction(true);
      await API.put(
        `/api/lawyer/${land._id}/action`,
        { action: "reject", reason: rejectReason.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Land rejected and owner notified.");
      setLand((prev) => ({
        ...prev,
        status: "rejected",
        approvedBy: null,
        rejectionReason: rejectReason.trim(),
        rejectedBy: { _id: currentUserId, username: currentUsername },
      }));
      setRejectReason("");
      setShowRejectModal(false);
    } catch (err) {
      console.error("Reject error:", err?.response?.data || err.message || err);
      toast.error(err?.response?.data?.message || "Failed to reject land.");
    } finally {
      setProcessingAction(false);
    }
  };

  // Submit review
const handleSubmitReview = async () => {
  if (!token) return toast.error("Login required.");
  const trimmed = (newReview || "").trim();
  if (!trimmed) return toast.error("Review cannot be empty!");
  if (!newRating || Number(newRating) < 1 || Number(newRating) > 5)
    return toast.error("Please select a rating between 1 and 5 stars!");

  try {
    setSubmittingReview(true);

    // 1️⃣ Call the backend API
    const payload = { review: trimmed, rating: Number(newRating) };
    const { data } = await API.post(`/api/lands/${land._id}/reviews`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2️⃣ Update local state with the review returned from backend
    if (data?.createdReview) {
      setLand((prev) => ({
        ...prev,
        reviews: [...(prev?.reviews || []), data.createdReview],
      }));
    }

    // 3️⃣ Reset inputs
    setNewReview("");
    setNewRating(5);

    toast.success("Review submitted!");
  } catch (err) {
    console.error("Submit review error:", err?.response?.data?.message || err.message);
    toast.error(err?.response?.data?.message || "Failed to submit review.");
  } finally {
    setSubmittingReview(false);
  }
};

  // Resubmit rejected land
  const handleResubmit = async () => {
    if (!window.confirm("Are you sure you want to resubmit this land for re-evaluation?")) return;

    try {
      await API.put(
        `/api/lands/${land._id}/resubmit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Land resubmitted successfully!");
      fetchLand();
    } catch (error) {
      console.error("Resubmit error:", error?.response?.data || error.message || error);
      toast.error("Failed to resubmit land");
    }
  };

  // Document actions
const updateDocStatus = async (docId, status) => {
  if (!token) return toast.error("Login required.");

  try {
    const endpoint = `/api/documents/file/${docId}/${status}`;
    const res = await API.put(endpoint, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const updatedDoc = res.data.doc; // the updated document returned from backend
    const notification = res.data.notification; // the notification created

    // Update state for document list
    setFullDocs(prev =>
      prev.map(doc => doc._id === docId ? { ...doc, status } : doc)
    );

    // Show toast for document update
    if (status === "approved") {
      toast.success("Document approved successfully!");
    } else if (status === "rejected") {
      toast.error("Document rejected.");
    }

    // Optional: If you have notifications panel open, append the new notification
    if (notification) {
      setNotifications(prev => [notification, ...prev]);
    }

    console.log(`${status} success for`, docId, updatedDoc, notification);
  } catch (err) {
    console.error("updateDocStatus err:", err?.response?.data || err.message || err);
    toast.error("Failed to update document status.");
  }
};



const handleReuploadDocument = async (parentDocumentId,docId, file) => {
  if (!file) return toast.error("No file selected.");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await API.put(
      `/api/documents/${docId}/reupload`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      }
    );

    // Update the state locally
    setFullDocs(prev =>
      prev.map(doc =>
        doc._id === docId ? { ...doc, file: res.data.document.file, status: res.data.document.status } : doc
      )
    );

    toast.success("Document reuploaded successfully!");
  } catch (err) {
    console.error("Reupload error:", err?.response?.data || err.message);
    toast.error(err?.response?.data?.message || "Failed to reupload document");
  }
};





  // Delete review
  const handleDeleteReview = async (reviewUserId) => {
    if (!token) return toast.error("Login required.");
    if (!currentUserId || currentUserId !== reviewUserId) return toast.error("You can delete only your review.");
    try {
      await API.delete(`/api/lands/${land._id}/reviews/${reviewUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLand((prev) => ({
        ...prev,
        reviews: (prev.reviews || []).filter((r) => {
          const uid = r.user?._id || r.user || r.userId;
          return String(uid) !== String(reviewUserId);
        }),
      }));
      toast.success("Review deleted.");
    } catch (err) {
      console.error("Delete review error:", err?.response?.data || err.message || err);
      toast.error(err?.response?.data?.message || "Failed to delete review.");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading land details...</div>;
  if (error) return <div className="flex justify-center pt-[7rem] text-red-400">{error}</div>;
  if (!land) return <div className="flex justify-center pt-[7rem]">No data found.</div>;

  return (
<div className="min-h-screen bg-gradient-to-b from-green-100 via-green-50 to-green-100 text-green-900 py-14 px-6">






  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
 {/* LEFT: image slideshow */}
{landPhotos.length > 0 && (
  <div className="flex flex-col w-full">
    {/* Slideshow container */}
    <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500">
      <img
        src={`http://localhost:5000/uploads/${landPhotos[currentSlide]}`}
        alt={`Land Photo ${currentSlide + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />

      {/* Left/Right arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gray-900/20 hover:bg-gray-900/40 text-gray-200 hover:text-white rounded-full p-3 transition-all duration-300 flex items-center justify-center opacity-70 hover:opacity-100"
      >
        ◀
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-900/20 hover:bg-gray-900/40 text-gray-200 hover:text-white rounded-full p-3 transition-all duration-300 flex items-center justify-center opacity-70 hover:opacity-100"
      >
        ▶
      </button>

      {/* Dots inside slideshow */}
      {landPhotos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {landPhotos.map((_, idx) => (
            <span
              key={idx}
              className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                currentSlide === idx ? "bg-cyan-400" : "bg-gray-400"
              }`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      )}
    </div>

  {/* Chat button below slideshow */}
{role !== "owner" && (
  <button
    onClick={handleRedirectToChat}
    className="mt-4 px-4 py-3 bg-pink-400 hover:bg-pink-500 text-gray-100 rounded-lg shadow-md w-full text-center font-semibold transition-transform duration-300 hover:scale-105"
  >
    Chat with Owner
  </button>
)}


  </div>
)}

{/* RIGHT: Land Details */}
<div className="bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-teal-700 relative overflow-hidden hover:shadow-3xl transition-shadow duration-500 h-full flex flex-col justify-between">
  
  {/* subtle animated overlay */}
  <div className="absolute inset-0 bg-teal-200/10 pointer-events-none animate-pulse-slow rounded-3xl"></div>

  <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-50 mb-4 text-center sm:text-left drop-shadow-lg">
    📌 Land Details
  </h2>

  <div className="space-y-3 text-md sm:text-lg z-10 relative text-emerald-50">

    <p>
      <span className="font-semibold text-teal-100">💰 Price:</span>{" "}
      <span className="ml-2">{land.price ? `₹ ${land.price}` : "N/A"}</span>
    </p>

    <p>
      <span className="font-semibold text-teal-100">📏 Dimensions:</span>
      <span className="ml-2">
        {land.dimensions?.length && land.dimensions?.breadth
          ? `${land.dimensions.length} × ${land.dimensions.breadth} ft`
          : "N/A"}
      </span>
    </p>

    <p>
      <span className="font-semibold text-teal-100">📐 Area:</span>
      <span className="ml-2">
        {land.dimensions?.length && land.dimensions?.breadth
          ? `${land.dimensions.length * land.dimensions.breadth} sq.ft`
          : "N/A"}
      </span>
    </p>

    <p>
      <span className="font-semibold text-teal-100">👤 Owner:</span>{" "}
      <span className="ml-2">{land.ownerName}</span>
    </p>

    <p>
      <span className="font-semibold text-teal-100">📍 Pincode:</span>{" "}
      <span className="ml-2">{land.pincode}</span>
    </p>

    {/* NEWLY ADDED FIELDS */}
    <p>
      <span className="font-semibold text-teal-100">🏙 City:</span>{" "}
      <span className="ml-2">{land.city || "N/A"}</span>
    </p>

    <p>
      <span className="font-semibold text-teal-100">🗺 State:</span>{" "}
      <span className="ml-2">{land.state || "N/A"}</span>
    </p>

    <p>
      <span className="font-semibold text-teal-100">🏡 Land Type:</span>{" "}
      <span className="ml-2">{land.landtype || "N/A"}</span>
    </p>

    {/* approval states */}
    {land.status === "approved" && land.approvedBy && (
      <p className="mt-2 text-green-200 font-medium drop-shadow">
        ✅ Approved by Lawyer: {land.approvedBy.username || land.approvedBy}
      </p>
    )}

    {land.status === "rejected" && land.rejectionReason && (
      <p className="mt-2 text-yellow-200 font-medium drop-shadow">
        ❌ Rejected — Reason: {land.rejectionReason}
      </p>
    )}

    {String(currentUserId) === String(land.owner) &&
      land.status === "rejected" && (
        <button
          className="mt-3 bg-teal-600 hover:bg-teal-700 text-emerald-50 font-semibold py-2 px-4 rounded-xl transition-transform duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          onClick={handleResubmit}
        >
          🔄 Reconsider / Resubmit to Lawyer
        </button>
      )}

    {/* Lawyer controls */}
    {role === "lawyer" && (
      <div className="mt-3 flex gap-3">
        <button
          disabled={processingAction || land.status === "approved" || land.status === "rejected"}
          onClick={handleApprove}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl font-semibold disabled:opacity-60 transition-transform duration-300 hover:scale-105 shadow-md hover:shadow-xl text-emerald-50"
        >
          ✅ Approve
        </button>

        <button
          disabled={processingAction || land.status === "approved" || land.status === "rejected"}
          onClick={() => setShowRejectModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl font-semibold disabled:opacity-60 transition-transform duration-300 hover:scale-105 shadow-md hover:shadow-xl text-emerald-50"
        >
          ❌ Reject
        </button>
      </div>
    )}

  </div>
</div>




</div>


      {/* Unit converter */}
      {land.dimensions && <UnitConverter dimensions={land.dimensions} />}

{/* Description */}
<div className="max-w-6xl mx-auto mt-12 bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-teal-700">
  <h2 className="text-3xl font-extrabold text-rose-200 tracking-wide mb-5 drop-shadow">
    📝 Land Description
  </h2>

  <p className="text-rose-100/90 text-lg leading-relaxed font-medium drop-shadow-sm">
    {land.description || "No description provided by the owner."}
  </p>
</div>

      {/* documents for lawyer and owner */}
{Array.isArray(fullDocs) && fullDocs.length > 0 && (String(currentUserId) === String(land.owner) || role === "lawyer") && (
  <div className="max-w-6xl mx-auto mt-12 p-6 bg-gradient-to-b from-teal-600 via-teal-700 to-teal-800 text-emerald-50 backdrop-blur-xl rounded-3xl border border-teal-700 shadow-lg">
    <h2 className="text-3xl font-extrabold text-rose-300 mb-6 text-center">
      📄 Uploaded Documents & Photos
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {fullDocs.map((doc) => (
        <div
          key={doc._id}
          className="bg-rose-200/80 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col items-center p-3"
        >
          <img
            src={doc.file ? `http://localhost:5000/uploads/${doc.file}` : "/default-image.jpg"}
            alt={doc.type || "Document"}
            className="w-full h-40 object-cover rounded-lg border border-rose-300 mb-3"
          />

          <p className="text-rose-800 font-semibold text-lg text-center truncate w-full">
            {doc.type || "Document"}
          </p>

          <a
            href={doc.file ? `http://localhost:5000/uploads/${doc.file}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
          >
            View / Download
          </a>

          <div className="mt-2">
            {doc.status === "approved" && <span className="text-green-400 font-bold text-xl">✔️ Approved</span>}
            {doc.status === "rejected" && <span className="text-red-400 font-bold text-xl">❌ Rejected</span>}
            {doc.status === "pending" && <span className="text-yellow-400 font-bold text-xl">⏳ Pending</span>}
          </div>
          
    {/* Lawyer action buttons */}
{role === "lawyer" && (
  <div className="mt-3 flex gap-2">
    <button
      onClick={() => updateDocStatus(doc._id, "approved")}
      className="px-3 py-1 rounded bg-green-600 font-semibold disabled:opacity-50"
      disabled={doc.status === "approved" || doc.status === "rejected"}
    >
      Approve
    </button>
    <button
      onClick={() => updateDocStatus(doc._id, "rejected")}
      className="px-3 py-1 rounded bg-red-600 font-semibold disabled:opacity-50"
      disabled={doc.status === "approved" || doc.status === "rejected"}
    >
      Reject
    </button>
  </div>
)}


          {/* Owner re-upload */}
{String(currentUserId) === String(land.owner) && doc.status === "rejected" && (
  <div className="mt-3 text-center">
    <label className="group cursor-pointer inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      🔄 Re-upload
      <input
        type="file"
        className="hidden"
        onChange={(e) => handleReuploadDocument(doc.parentDocumentId || doc._id, doc._id, e.target.files?.[0])}
      />
      {/* Tooltip text */}
      <span className="absolute mt-10 w-max bg-gray-800 text-gray-200 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Upload a new file to replace the rejected document
      </span>
    </label>
  </div>
)}


        </div>
      ))}
    </div>
  </div>
)}


{/* LAND PHOTOS FOR BUYERS */}
{/* LAND PHOTOS SECTION FOR BUYERS */}
{Array.isArray(fullDocs) &&
 fullDocs.length > 0 &&
  (String(currentUserId) === String(land.owner))  ||
 role !== "lawyer" &&
 fullDocs.some(doc => doc.type === "LandPhotos") && (
  <div className="max-w-6xl mx-auto mt-12 p-6 bg-gradient-to-b from-teal-600 via-teal-700 to-teal-800 text-emerald-50 backdrop-blur-xl rounded-3xl border border-teal-700 shadow-lg">
    <h2 className="text-3xl font-extrabold text-rose-300 mb-6 text-center">
      🖼️ Land Photos
    </h2>
 <div className="flex flex-wrap justify-center gap-6">
      {fullDocs
        .filter(doc => doc.type === "LandPhotos")
        .map((doc) => (
          <div
            key={doc._id}
            className="bg-rose-200/80 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col items-center p-3 w-60 border border-rose-300"
          >
            <img
              src={doc.file ? `http://localhost:5000/uploads/${doc.file}` : "/default-image.jpg"}
              alt={doc.type || "Land Photo"}
              className="w-full h-40 object-cover rounded-lg border border-rose-400 mb-3"
            />

            <p className="text-rose-900 font-semibold text-lg text-center truncate w-full">
              {doc.type || "Land Photo"}
            </p>

            <a
              href={doc.file ? `http://localhost:5000/uploads/${doc.file}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm font-medium text-rose-700 hover:text-rose-800 transition-colors"
            >
              View / Download
            </a>
          </div>
        ))}
    </div>
  </div>
)}




      {/* Reviews section (hidden for lawyers) */}
      {role !== "lawyer" && (
        <div className="max-w-5xl mx-auto mt-12">
          <h2 className="text-3xl font-bold text-cyan-300 mb-10">⭐ Reviews & Ratings</h2>

          {/* Existing reviews */}
          <div className="space-y-8">
            {land.reviews && land.reviews.length > 0 ? (
              land.reviews.map((review, idx) => {
                const rating = review.rating ?? review.stars ?? 0;
                const text = review.review ?? review.comment ?? review.text ?? "";
                const username = review.user?.username || review.username || review.userName || (typeof review.user === "string" ? review.user : "Anonymous");
                const userId = review.user?._id || review.user || review.userId;

                return (
                 <div
  key={review._id || idx}
  className="
    bg-gradient-to-b from-teal-600 via-teal-700 to-teal-800
    backdrop-blur-6xl
    border border-teal-700
    p-6 rounded-xl shadow-lg
    transition-all duration-300
    hover:shadow-xl hover:-translate-y-1
  "
>
  <div className="flex justify-between items-center">

    {/* Username */}
    <h4 className="text-xl font-semibold text-rose-200 drop-shadow-md">
      {username}
    </h4>

    <div className="flex items-center gap-3">

      {/* Stars */}
      <div className="flex text-2xl">
        {[1,2,3,4,5].map((n) =>
          n <= rating ? (
            <StarIcon
              key={n}
              className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,220,90,0.6)] transition-transform hover:scale-110"
            />
          ) : (
            <StarIconOutline
              key={n}
              className="w-6 h-6 text-gray-400 hover:text-yellow-300 transition-all hover:scale-110"
            />
          )
        )}
      </div>

      {/* Delete Button */}
      {String(userId) === String(currentUserId) && (
        <button
          onClick={() => handleDeleteReview(userId)}
          className="
            ml-4 px-3 py-1 rounded-full text-sm font-semibold
            bg-gradient-to-r from-red-500 to-red-700
            hover:scale-105 hover:shadow-lg
            transition-all text-white
          "
        >
          Delete
        </button>
      )}
    </div>
  </div>

  {/* Review Text */}
  <p className="text-rose-100 mt-4 text-lg leading-relaxed tracking-wide drop-shadow">
    {text}
  </p>
</div>

                );
              })
            ) : (
              <p className="text-gray-400 text-lg">No reviews yet — be the first to review!</p>
            )}
          </div>

          {/* Add review form (buyers only, not owner) */}
       {String(land.owner) !== String(currentUserId) && role !== "lawyer" && (
  <div
  className="
    mt-14 max-w-9xl mx-auto     /* ⬅ widened */
    bg-gradient-to-b from-teal-600 via-teal-700 to-teal-800
    backdrop-blur-xl
    p-4                    /* ⬅ decreased height */
    rounded-3xl border border-teal-700 shadow-2xl
    transition-all
  "
>

  
    {/* Title */}
    <h3 className="text-3xl font-semibold text-rose-200 mb-8 tracking-wide drop-shadow-lg">
      ⭐ Add a Review
    </h3>

    {/* Rating Section */}
    <div
      className="
        mb-8 p-6 rounded-2xl
        bg-teal-800/40 backdrop-blur-lg
        border border-teal-700 shadow-lg
      "
    >
      <label className="block mb-3 text-lg font-medium text-rose-100 drop-shadow">
        Your Rating:
      </label>

      <div className="flex space-x-2 text-4xl cursor-pointer">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            onClick={() => setNewRating(num)} // logic untouched
            className={`
              transition-all duration-200 drop-shadow
              ${
                newRating >= num
                  ? "text-yellow-400 scale-125 drop-shadow-[0_0_14px_rgba(255,230,120,0.7)]"
                  : "text-teal-300/40 hover:text-yellow-300 hover:scale-110"
              }
            `}
          >
            ★
          </span>
        ))}
      </div>
    </div>

    {/* Review Input */}
    <div
      className="
        mb-8 p-6 rounded-2xl
        bg-teal-800/40 backdrop-blur-lg
        border border-teal-700 shadow-lg
      "
    >
      <textarea
        value={newReview}
        onChange={(e) => setNewReview(e.target.value)} // logic untouched
        rows="4"
        placeholder="Share your experience about this land..."
        className="
          w-full p-4 rounded-xl
          bg-teal-900/40 border border-teal-700
          text-rose-100 placeholder-rose-200/50
          focus:ring-2 focus:ring-rose-300
          outline-none transition-all
        "
      />
    </div>

    {/* Submit Button */}
    <button
      onClick={handleSubmitReview} // logic untouched
      disabled={submittingReview}
      className="
        w-full py-3 text-lg font-semibold rounded-xl
        bg-gradient-to-r from-rose-500 to-pink-600
        text-white shadow-lg
        transition-all hover:scale-[1.04] hover:shadow-rose-500/40
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {submittingReview ? "Submitting..." : "Submit Review"}
    </button>
  </div>
)}


</div>
      )}


      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-3 text-cyan-300">Reject Land — Provide a reason</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white" />

            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 rounded bg-gray-600">Cancel</button>
              <button onClick={handleRejectSubmit} disabled={processingAction} className="px-4 py-2 rounded bg-red-600 font-semibold">{processingAction ? "Processing..." : "Submit Rejection"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleLand;

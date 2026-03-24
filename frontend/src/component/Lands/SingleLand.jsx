import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../../utils/API";
import StarIcon from "@heroicons/react/24/solid/StarIcon";
import StarIconOutline from "@heroicons/react/24/outline/StarIcon";
import axios from "axios";
import { FaMapMarkerAlt, FaRulerCombined, FaTag, FaUser, FaPhone, FaStar, FaShieldAlt, FaHome, FaCheckCircle, FaTimesCircle, FaClock, FaImage, FaFileAlt, FaComments, FaArrowLeft, FaArrowRight, FaRegStar, FaStar as FaStarSolid, FaHeart, FaHistory, FaTimes } from "react-icons/fa";

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
    <div className="max-w-6xl mx-auto mt-10 p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200">
      <div className="flex items-center mb-6">
        <FaRulerCombined className="text-emerald-600 text-2xl mr-3" />
        <h3 className="text-2xl font-bold text-gray-900">Unit Converter</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Base Unit */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Base Area
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaRulerCombined className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={`${sqFt.toLocaleString()} sq ft`}
              disabled
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Target Unit Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Convert To
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaTag className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
            >
              {Object.keys(conversions).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Converted Value */}
      <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-gray-700">Converted Value</label>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {Number(conversions[selectedUnit] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600 mt-1">{selectedUnit}</p>
          </div>
          <div className="text-emerald-200">
            <FaRulerCombined className="text-6xl" />
          </div>
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
  
  // Interested users functionality
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [loadingInterest, setLoadingInterest] = useState(false);
  
  // Modal state for interested users
  const [showInterestedUsersModal, setShowInterestedUsersModal] = useState(false);
  const [interestedUsersData, setInterestedUsersData] = useState([]);
  const [loadingInterestedUsers, setLoadingInterestedUsers] = useState(false);

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

    // Set interested users data
    setInterestedCount(landData.interestedUsers?.length || 0);
    setIsInterested(landData.interestedUsers?.includes(currentUserId) || false);

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

  // Handle interest toggle
  const handleInterestToggle = async () => {
    if (!token) return toast.error("Login required.");
    if (!land) return toast.error("No land selected.");
    if (String(currentUserId) === String(land.owner)) return toast.error("Cannot mark own property as interested.");
    
    setLoadingInterest(true);
    
    try {
      const endpoint = isInterested ? `/api/lands/${land._id}/uninterested` : `/api/lands/${land._id}/interested`;
      const response = await API.post(endpoint, {});
      
      // Update local state
      setIsInterested(!isInterested);
      setInterestedCount(prev => isInterested ? prev - 1 : prev + 1);
      
      // Update land data
      setLand(prev => ({
        ...prev,
        interestedUsers: isInterested 
          ? prev.interestedUsers.filter(id => id !== currentUserId)
          : [...prev.interestedUsers, currentUserId]
      }));
      
      toast.success(response.data.message);
      
    } catch (err) {
      console.error("Interest toggle error:", err);
      toast.error(err?.response?.data?.message || "Failed to update interest status");
    } finally {
      setLoadingInterest(false);
    }
  };

  // Handle ownership history
  const handleOwnershipHistory = () => {
    if (!token) return toast.error("Login required.");
    if (!land) return toast.error("No land selected.");
    
    // Navigate to ownership history page or show modal
    // For now, show a toast message (can be extended to show actual history)
    toast.info("Ownership history feature coming soon! This will show the complete transfer history of this property.");
    
    // Future implementation: 
    // navigate(`/land/${land._id}/ownership-history`);
    // Or show a modal with ownership history data
  };

  // Handle fetching interested users
  const handleFetchInterestedUsers = async () => {
    if (!token) return toast.error("Login required.");
    if (!land) return toast.error("No land selected.");
    
    setLoadingInterestedUsers(true);
    
    try {
      const response = await API.get(`/api/lands/${land._id}/interested-users`);
      setInterestedUsersData(response.data.interestedUsers || []);
      setShowInterestedUsersModal(true);
    } catch (err) {
      console.error("Error fetching interested users:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch interested users");
    } finally {
      setLoadingInterestedUsers(false);
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
const handleAssignLawyer = async () => {
  if (!token) return toast.error("Login required.");
  if (!land) return;

  try {
    const res = await API.put(
      `/api/lawyer/${land._id}/assign`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("You are now assigned to this land");

    // update local state
    setLand((prev) => ({
      ...prev,
      assignedLawyer: currentUserId,
    }));

  } catch (err) {
    console.error("Assign error:", err?.response?.data || err.message);
    toast.error(err?.response?.data?.message || "Failed to assign");
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
console.log( land?.owner?._id || land?.owner);
const hasRejectedDocs = Array.isArray(fullDocs) &&
  fullDocs.some(doc => doc.status === "rejected");

const allDocsApproved =
  Array.isArray(fullDocs) &&
  fullDocs.length > 0 &&
  fullDocs.every(doc => doc.status === "approved");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl px-6 py-3 shadow-sm border border-emerald-100">
            <nav className="flex items-center space-x-3 text-sm">
              <Link to="/" className="flex items-center text-emerald-600 hover:text-emerald-700 transition-all duration-200 font-medium">
                <FaHome className="mr-2" />
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link to="/lands" className="flex items-center text-emerald-600 hover:text-emerald-700 transition-all duration-200 font-medium">
                Lands
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-700 font-semibold">Property Details</span>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* LEFT: Image Gallery */}
{landPhotos.length > 0 && (
  <div className="flex flex-col w-full space-y-4">
    {/* Image Slideshow */}
    <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group">
      <img
        src={`http://localhost:5000/uploads/${landPhotos[currentSlide]}`}
        alt={`Land Photo ${currentSlide + 1}`}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 rounded-full p-3 transition-all duration-300 shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
      >
        <FaArrowLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 rounded-full p-3 transition-all duration-300 shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
      >
        <FaArrowRight className="w-5 h-5" />
      </button>

      {/* Image Indicators */}
      {landPhotos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
          {landPhotos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx 
                  ? "bg-white w-8 shadow-lg" 
                  : "bg-white/60 hover:bg-white/80 hover:w-3"
              }`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
        {currentSlide + 1} / {landPhotos.length}
      </div>

      {/* Quick Actions */}
      <div className="absolute top-6 left-6 flex gap-2">
        <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          <FaImage className="inline mr-1" />
          Gallery
        </div>
      </div>
    </div>

    {/* Thumbnail Strip */}
    {landPhotos.length > 1 && (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {landPhotos.map((photo, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
              currentSlide === idx 
                ? "ring-3 ring-emerald-500 ring-offset-2 scale-110" 
                : "opacity-70 hover:opacity-100 hover:scale-105"
            }`}
          >
            <img
              src={`http://localhost:5000/uploads/${photo}`}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    )}

      {/* Interested Users Modal */}
        {showInterestedUsersModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center ">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FaHeart className="text-purple-600" />
                  Interested Users
                </h3>
                <button
                  onClick={() => setShowInterestedUsersModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                {interestedUsersData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interestedUsersData.map((user, index) => (
                          <tr key={user._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {user.username || 'Unknown User'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ID: {user._id?.slice(-8) || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-gray-700">{user.email || 'N/A'}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-gray-700">{user.contactNumber || 'N/A'}</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' || user.isAdmin
                                  ? 'bg-red-100 text-red-800'
                                  : user.role === 'lawyer'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.role || 'user'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => {
                                    // Navigate to user profile or start chat
                                    toast.info(`Chat with ${user.username} feature coming soon!`);
                                  }}
                                  className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors"
                                  title="Start Chat"
                                >
                                  <FaComments className="text-sm" />
                                </button>
                                <button
                                  onClick={() => {
                                    // View user details
                                    toast.info(`View ${user.username} profile feature coming soon!`);
                                  }}
                                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                                  title="View Profile"
                                >
                                  <FaUser className="text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No users have shown interest in this property yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Interested users will appear here once they mark this property as interested.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Total {interestedUsersData.length} {interestedUsersData.length === 1 ? 'person' : 'people'} interested
                  </p>
                  <button
                    onClick={() => setShowInterestedUsersModal(false)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

    {/* Action Buttons */}
    {String(currentUserId) !== String(land.owner) && (
      <div className="space-y-3">
        {/* Interested Button */}
        <button
          onClick={handleInterestToggle}
          disabled={loadingInterest}
          className={`group relative w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-[1.02] flex items-center justify-between overflow-hidden ${
            isInterested 
              ? 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white shadow-pink-500/30' 
              : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-gray-500/30'
          } ${loadingInterest ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
            isInterested 
              ? 'bg-gradient-to-r from-pink-400 to-red-400' 
              : 'bg-gradient-to-r from-gray-400 to-gray-500'
          }`} />
          
          <div className="flex items-center gap-3 relative z-10">
            <FaHeart className={`w-5 h-5 ${isInterested ? 'fill-current' : ''}`} />
            <span>
              {loadingInterest ? 'Processing...' : (isInterested ? 'Remove Interest' : 'Mark as Interested')}
            </span>
          </div>
          
          <div className="relative z-10">
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {interestedCount} {interestedCount === 1 ? 'person' : 'people'} interested
            </span>
          </div>
        </button>

        {/* Ownership History Button */}
        <button
          onClick={handleOwnershipHistory}
          className="group relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 transform hover:scale-[1.02] flex items-center justify-between overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          <div className="flex items-center gap-3 relative z-10">
            <FaHistory className="w-5 h-5" />
            <span>Track Ownership History</span>
          </div>
          
          <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FaArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Chat Button */}
        <button
          onClick={handleRedirectToChat}
          className="group relative w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-[1.02] flex items-center justify-between overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          <div className="flex items-center gap-3 relative z-10">
            <FaComments className="w-5 h-5" />
            <span>Start Conversation with Owner</span>
          </div>
          
          <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FaArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    )}

    {/* Owner Action Buttons */}
    {String(currentUserId) === String(land.owner) && (
      <div className="space-y-3">
        {/* Check Interested Users Button */}
        <button
          onClick={handleFetchInterestedUsers}
          disabled={loadingInterestedUsers}
          className={`group relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 transform hover:scale-[1.02] flex items-center justify-between overflow-hidden ${
            loadingInterestedUsers ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          <div className="flex items-center gap-3 relative z-10">
            <FaHeart className="w-5 h-5" />
            <span>
              {loadingInterestedUsers ? 'Loading...' : 'Check Interested Users'}
            </span>
          </div>
          
          <div className="relative z-10">
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {interestedCount} {interestedCount === 1 ? 'person' : 'people'} interested
            </span>
          </div>
        </button>

        {/* Ownership History Button */}
        <button
          onClick={handleOwnershipHistory}
          className="group relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 transform hover:scale-[1.02] flex items-center justify-between overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          <div className="flex items-center gap-3 relative z-10">
            <FaHistory className="w-5 h-5" />
            <span>Track Ownership History</span>
          </div>
          
          <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FaArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    )}
  </div>
)}

{/* RIGHT: Property Details */}
<div className="bg-white/85 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-200 h-full flex flex-col">
  
  {/* Header with Status */}
  <div className="flex justify-between items-start mb-8">
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center">
        <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full mr-3" />
        Property Overview
      </h2>
      <div className="flex items-center gap-3">
        {land.status === "approved" && (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-md">
            <FaCheckCircle className="mr-2" />
            Verified Property
          </span>
        )}
        {land.status === "rejected" && (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 shadow-md">
            <FaTimesCircle className="mr-2" />
            Review Required
          </span>
        )}
        {land.status === "pending" && (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 shadow-md">
            <FaClock className="mr-2" />
            Under Review
          </span>
        )}
      </div>
    </div>

    {/* Lawyer Actions */}
    {role === "lawyer" && land.status === "pending" && (
      <div className="flex flex-col gap-2">
        {!land.assignedLawyer && (
          <button
            onClick={handleAssignLawyer}
            className="group px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            <FaShieldAlt className="inline mr-2" />
            Start Reviewing
          </button>
        )}
        {land.assignedLawyer && String(land.assignedLawyer) === String(currentUserId) && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-lg font-bold border border-emerald-200">
            <FaShieldAlt className="inline mr-1" />
            Assigned to You
          </span>
        )}
        {land.assignedLawyer && String(land.assignedLawyer) !== String(currentUserId) && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium border border-gray-200">
            <FaClock className="inline mr-1" />
            In Review
          </span>
        )}
      </div>
    )}
  </div>

  {/* Property Information Cards */}
  <div className="space-y-4 flex-1 overflow-y-auto">
    <div className="grid grid-cols-1 gap-4">
      {/* Price Card */}
      <div className="group relative p-5 bg-gradient-to-br from-emerald-50 via-emerald-100 to-cyan-50 rounded-2xl border border-emerald-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute top-3 right-3 w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <FaTag className="text-white text-lg" />
        </div>
        <div className="pr-12">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Property Price</p>
          <p className="text-2xl font-bold text-gray-900">
            {land.price ? `₹${Number(land.price).toLocaleString('en-IN')}` : "Price Not Available"}
          </p>
        </div>
      </div>

      {/* Dimensions Card */}
      <div className="group relative p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute top-3 right-3 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <FaRulerCombined className="text-white text-lg" />
        </div>
        <div className="pr-12">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Land Dimensions</p>
          <p className="text-xl font-bold text-gray-900">
            {land.dimensions?.length && land.dimensions?.breadth
              ? `${land.dimensions.length} × ${land.dimensions.breadth} ft`
              : "Dimensions Not Available"}
          </p>
        </div>
      </div>

      {/* Area Card */}
      <div className="group relative p-5 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl border border-purple-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute top-3 right-3 w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <FaRulerCombined className="text-white text-lg" />
        </div>
        <div className="pr-12">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Total Area</p>
          <p className="text-xl font-bold text-gray-900">
            {land.dimensions?.length && land.dimensions?.breadth
              ? `${(land.dimensions.length * land.dimensions.breadth).toLocaleString()} sq.ft`
              : "Area Not Available"}
          </p>
        </div>
      </div>

      {/* Location Card */}
      <div className="group relative p-5 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl border border-orange-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute top-3 right-3 w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <FaMapMarkerAlt className="text-white text-lg" />
        </div>
        <div className="pr-12">
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Location</p>
          <p className="text-lg font-bold text-gray-900">
            {land.city && land.state ? `${land.city}, ${land.state}` : land.city || land.state || "Location Not Available"}
          </p>
          <p className="text-sm text-gray-600 mt-1">Pincode: {land.pincode || "N/A"}</p>
        </div>
      </div>

      {/* Owner Card */}
      <div className="group relative p-5 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 rounded-2xl border border-teal-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute top-3 right-3 w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <FaUser className="text-white text-lg" />
        </div>
        <div className="pr-12">
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">Property Owner</p>
          <p className="text-lg font-bold text-gray-900">{land.ownerName || "Owner Information Not Available"}</p>
        </div>
      </div>

      {/* Land Type Card */}
      <div className="group relative p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 rounded-2xl border border-green-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="absolute top-3 right-3 w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <FaHome className="text-white text-lg" />
        </div>
        <div className="pr-12">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Land Type</p>
          <p className="text-lg font-bold text-gray-900">{land.landtype || "Land Type Not Specified"}</p>
        </div>
      </div>
    </div>

    {/* Status Messages */}
    {land.status === "approved" && land.approvedBy && (
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-md">
        <p className="text-green-800 font-semibold flex items-center">
          <FaCheckCircle className="mr-2 text-green-600" />
          Approved by: {land.approvedBy.username || land.approvedBy}
        </p>
      </div>
    )}

    {land.status === "rejected" && land.rejectionReason && (
      <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-md">
        <p className="text-red-800 font-semibold flex items-center">
          <FaTimesCircle className="mr-2 text-red-600" />
          Review Notes: {land.rejectionReason}
        </p>
      </div>
    )}

    {/* Action Buttons */}
    <div className="mt-6 space-y-3">
      {/* Owner Resubmit */}
      {String(currentUserId) === String(land.owner) && land.status === "rejected" && (
        <button
          onClick={handleResubmit}
          className="w-full group relative bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          <FaCheckCircle className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Resubmit Property for Review</span>
        </button>
      )}

      {/* Lawyer Controls */}
      {role === "lawyer" && String(land.assignedLawyer) === String(currentUserId) && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={
                processingAction ||
                land.status === "approved" ||
                land.status === "rejected" ||
                hasRejectedDocs ||
                !allDocsApproved
              }
              onClick={handleApprove}
              className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/30 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-2"
            >
              <FaCheckCircle className="w-4 h-4" />
              Approve
            </button>
            
            <button
              disabled={
                processingAction ||
                land.status === "approved" ||
                land.status === "rejected"
              }
              onClick={() => setShowRejectModal(true)}
              className="group relative bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-2"
            >
              <FaTimesCircle className="w-4 h-4" />
              Reject
            </button>
          </div>

          {hasRejectedDocs && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-semibold flex items-center">
                <FaTimesCircle className="mr-2" />
                Cannot approve: Some documents need review
              </p>
            </div>
          )}

          {!allDocsApproved && !hasRejectedDocs && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-700 text-sm font-semibold flex items-center">
                <FaClock className="mr-2" />
                Waiting for document approvals
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</div>
</div>



{/* Unit converter */}
        {land.dimensions && <UnitConverter dimensions={land.dimensions} />}


        {/* Description */}
        <div className="mt-12 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-200">
          <div className="flex items-center mb-6">
            <FaFileAlt className="text-emerald-600 text-2xl mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Property Description</h2>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">
            {land.description || "No description provided by the owner."}
          </p>
        </div>

      {/* Documents Section */}
        {Array.isArray(fullDocs) && fullDocs.length > 0 && (String(currentUserId) === String(land.owner) || role === "lawyer") && (
        
        <div className="mt-12 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-200">

            <div className="flex items-center mb-6">
              <FaFileAlt className="text-emerald-600 text-2xl mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Uploaded Documents</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

              {fullDocs.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-video bg-gray-100">
                    {doc.file ? (
                      <img
                        src={`http://localhost:5000/uploads/${doc.file}`}
                        alt={doc.type || "Document"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaFileAlt className="text-gray-400 text-3xl" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-center mb-2 truncate">
                      {doc.type || "Document"}
                    </h3>

                    <div className="flex justify-center mb-3">

                      {doc.status === "approved" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="mr-1" />
                          Approved
                        </span>
                      )}

                      {doc.status === "rejected" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaTimesCircle className="mr-1" />
                          Rejected
                        </span>
                      )}

                      {doc.status === "pending" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <FaClock className="mr-1" />
                          Pending
                        </span>
                      )}

                    </div>

                    <a
                      href={doc.file ? `http://localhost:5000/uploads/${doc.file}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                    >
                      View Document
                    </a>

                    {/* Lawyer action buttons */}
                    {role === "lawyer" && String(land.assignedLawyer) === String(currentUserId) && (
                      <div className="mt-3 flex gap-2">
   
                        <button
                          onClick={() => updateDocStatus(doc._id, "approved")}
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50"
                          disabled={doc.status === "approved" || doc.status === "rejected"}
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => updateDocStatus(doc._id, "rejected")}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50"
                          disabled={doc.status === "approved" || doc.status === "rejected"}
                        >
                          Reject
                        </button>

                      </div>
                    )}

                    {/* Owner re-upload */}
                    {doc.status === "rejected" && String(currentUserId) === String(land.owner) && (
                      <div className="mt-3">
                        <label className="block w-full cursor-pointer">
                          <div className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors duration-200">
                            Re-upload Document
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleReuploadDocument(doc.parentDocumentId || doc._id, doc._id, e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    )}

                  </div>

                </div>
              ))}

          </div>

        {/* Reviews section */}
        {role !== "lawyer" && (
          <div className="mt-12 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-emerald-200">
            <div className="flex items-center mb-8">
              <FaStar className="text-emerald-600 text-2xl mr-3" />
              <h2 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h2>
            </div>

            {/* Existing reviews */}
            <div className="space-y-6 mb-8">
              {land.reviews && land.reviews.length > 0 ? (
                land.reviews.map((review, idx) => {
                  const rating = review.rating ?? review.stars ?? 0;
                  const text = review.review ?? review.comment ?? review.text ?? "";
                  const username = review.user?.username || review.username || review.userName || (typeof review.user === "string" ? review.user : "Anonymous");
                  const userId = review.user?._id || review.user || review.userId;

                  return (
                    <div
                      key={review._id || idx}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{username}</h4>
                          <div className="flex text-yellow-400 mt-1">
                            {[1,2,3,4,5].map((n) =>
                              n <= rating ? (
                                <FaStarSolid key={n} className="w-4 h-4" />
                              ) : (
                                <FaRegStar key={n} className="w-4 h-4 text-gray-300" />
                              )
                            )}
                          </div>
                        </div>
                        {String(userId) === String(currentUserId) && (
                          <button
                            onClick={() => handleDeleteReview(userId)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{text}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaStar className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-lg">No reviews yet — be the first to review!</p>
                </div>
              )}
            </div>


            {/* Add review form */}
            {String(land.owner) !== String(currentUserId) && role !== "lawyer" && (
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Add a Review</h3>
                
                {/* Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
                  <div className="flex space-x-2 text-3xl">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNewRating(num)}
                        className={`transition-all duration-200 ${
                          newRating >= num
                            ? "text-yellow-400 scale-110"
                            : "text-gray-300 hover:text-yellow-300 hover:scale-105"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    rows={4}
                    placeholder="Share your experience about this land..."
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>

              </div>
            )}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999]">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Reject Land — Provide a reason</h3>
              <textarea 
                value={rejectReason} 
                onChange={(e) => setRejectReason(e.target.value)} 
                rows={4} 
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                placeholder="Please provide a reason for rejection..."
              />

              <div className="mt-6 flex gap-3 justify-end">
                <button 
                  onClick={() => setShowRejectModal(false)} 
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRejectSubmit} 
                  disabled={processingAction} 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-50"
                >
                  {processingAction ? "Processing..." : "Submit Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
        )}


      </div>
      </div>
      </>
  );
};

export default SingleLand;

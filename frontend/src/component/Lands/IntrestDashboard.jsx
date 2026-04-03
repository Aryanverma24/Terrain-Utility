import React, { useEffect, useState } from "react";
import { useParams ,useNavigate} from "react-router-dom";
import { API } from "../../../utils/API";
import { toast } from "react-toastify";
import axios from "axios";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
const InterestDashboard = () => {
  const { landId } = useParams();

  const [land, setLand] = useState(null);
  const [ownershipHistory, setOwnershipHistory] = useState([]);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  //all the below states are for legal processd and chat with lawyer 
const [showHistoryModal, setShowHistoryModal] = useState(false);
const [lawyers, setLawyers] = useState([]);
const [selectedLandId, setSelectedLandId] = useState(null);
const [hasConsultation, setHasConsultation] = useState(false);
const [showLawyerModal, setShowLawyerModal] = useState(false);
const [hasLegalChat, setHasLegalChat] = useState(false);
const [showGeoDialog, setShowGeoDialog] = useState(false);
const [existingChatId, setExistingChatId] = useState(null);
const navigate = useNavigate();
//to check whether the leagl chats exists to sethasleagl chat and change button veiw to leagla process started
const checkLegalChatExists = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.get(`/api/chat/exists/${landId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setHasLegalChat(res.data.exists);
    setExistingChatId(res.data.chatId); 

  } catch (err) {
    console.error(err);
  }
};
//to start a legal case ( case means lawyer owner and bueyr can chat with each other but privately )
const handleStartLegal = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.post(
      "/api/chat/start-legal",
      { landId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Legal process started");

    //  Redirect to buyer-lawyer legal chat
    navigate(`/chat/${res.data.buyerLawyerChat}`);

  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to start legal process");
  }
};


//to check whether user has a previously selcted consultation
const checkConsultationExists = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.get(`/api/chat/consultation-exists/${landId}`, {
  headers: { Authorization: `Bearer ${token}` },
});

console.log("CONSULTATION CHECK:", res.data); // 👈 ADD THIS, {
     

    setHasConsultation(res.data.exists);

  } catch (err) {
    console.error(err);
  }
};
//to start a chat with lawyer in dahboaard
const startLawyerChat = async (landId, lawyerId = null) => {
  try {
    const token = localStorage.getItem("token");

    // STEP 1: Check if consultation already exists
    const check = await API.get(`/api/chat/consultation-exists/${landId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("CONSULTATION CHECK:", check.data);

    // If exists → go directly
    if (check.data.exists) {
    navigate(`/inbox?chatId=${check.data.chatId}`);
      return;
    }

    // STEP 2: Create chat
    const res = await API.post(
      "/api/chat/lawyer",
      { landId, lawyerId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // console.log("CHAT CREATED:", res.data);

    navigate(`/inbox?chatId=${check.data.chatId}`);

    setHasConsultation(true);

    setTimeout(() => {
      checkConsultationExists();
    }, 500);

  } catch (err) {
    // HANDLE LAWYER REQUIRED
    if (
      err.response?.data?.message ===
      "Please select a lawyer to start consultation"
    ) {
      console.log("No lawyer selected → opening modal");

      fetchLawyers(landId); // open modal
    } else {
      console.error("FULL ERROR:", err.response || err);
      toast.error("Failed to start lawyer chat");
    }
  }
};
//fucntion to fecth allll the lawyers for the user (buyer)
const fetchLawyers = async (landId) => {
  try {
    const token = localStorage.getItem("token");

    const res = await API.get("/api/users/lawyers", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLawyers(res.data);

    //  store landId for later selection
    setSelectedLandId(landId);

    setShowLawyerModal(true);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch lawyers");
  }
};
//for rendering 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");

      try {
        // 🔹 Get logged in user
        if (token) {
          const userRes = await axios.get("/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUserId(userRes.data.id || userRes.data._id);
          console.log( "user results here " ,userRes.data);
          console.log(currentUserId);
        }

        // 🔹 Dashboard API
        const res = await API.get(`/api/lands/dashboard/${landId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setLand(res.data.land);
        console.log("Land Coordinates:", res.data.land.coordinates);
        setOwnershipHistory(res.data.ownershipHistory || []);
        setCurrentOwner(res.data.currentOwner);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (landId) {
  fetchData();
  
}
  }, [landId]);
  //ti chekc if consulation exists 
useEffect(() => {
  if (landId) {
    checkConsultationExists();
    checkLegalChatExists();
  }
}, [landId]);

  if (loading)
    return (
      <div className="pt-24 text-center text-lg text-gray-700">
        Loading...
      </div>
    );

  if (!land)
    return (
      <div className="pt-24 text-center text-lg text-gray-700">
        Land not found
      </div>
    );

  // =========================
  // 🔹 OLD FEATURE (MESSAGES)
  // =========================
  const totalInterested = land.interestedUsers?.length || 0;

  const otherUsers =
    currentUserId !== null
      ? totalInterested -
        (land.interestedUsers?.some(
          (i) => i.user?._id === currentUserId
        )
          ? 1
          : 0)
      : totalInterested;

  const welcomeMessage =
    currentUserId !== null
      ? "Welcome! Thank you for showing interest in this land."
      : "Viewing as guest";

  const interestMessage =
    totalInterested === 1
      ? "You are the first person interested!"
      : currentUserId !== null
      ? totalInterested === 1 && otherUsers === 0
        ? "You are the only one interested!"
        : `Hurry! ${otherUsers} other user${
            otherUsers > 1 ? "s" : ""
          } also interested.`
      : `Total interested users: ${totalInterested}`;

  // =========================
  // 🔹 SORT INTERESTS
  // =========================
  const sortedInterests = [...(land.interestedUsers || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );



  // =========================
  // 🔹 LAST HASH
  // =========================
  const lastHash =
    ownershipHistory[ownershipHistory.length - 1]?.currentHash;
return (
  <div className="min-h-screen pt-24 pb-10 px-6 bg-gradient-to-br from-[#f8fafc] to-[#eef2f7]">

    <div className="max-w-5xl mx-auto space-y-8">

      {/* ========================= */}
      {/*  HERO INFO */}
      {/* ========================= */}
      <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{welcomeMessage}</h2>
        <p className="text-gray-600 text-sm">{interestMessage}</p>
      </div>

      {/* ========================= */}
      {/*INTEREST COUNT */}
      {/* ========================= */}
      {totalInterested > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 text-center shadow-md">
          <p className="text-emerald-700 font-semibold text-lg">
            {totalInterested} {totalInterested === 1 ? "User" : "Users"} Interested
          </p>
        </div>
      )}

{/*  SELECTED LOCATION MAP */}
<div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-4 text-center">
  
  {/* HEADER */}
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-lg font-semibold text-gray-800">
      📍 Selected Location
    </h3>

    {/*STATUS BADGE */}
    {land?.geoVerification?.status !== "pending" && (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          land.geoVerification.status === "matched"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {land.geoVerification.status === "matched"
          ? "✔ Geo Verified Land"
          : "⚠ Suspicious Land"}
      </span>
    )}
  </div>

  {/* OWNER COORDINATES */}
  {land?.location?.coordinates && (
    <p className="text-sm text-gray-600 mb-2">
      Lat: {land.location.coordinates[1]} | Lng: {land.location.coordinates[0]}
    </p>
  )}

  {land?.location?.coordinates ? (
    <div className="h-64 w-full">
      <MapContainer
        center={[land.location.coordinates[1], land.location.coordinates[0]]}
        zoom={13}
        scrollWheelZoom={false}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[land.location.coordinates[1], land.location.coordinates[0]]} />
      </MapContainer>
    </div>
  ) : (
    <p className="text-gray-500 text-sm">
      No location selected for this land.
    </p>
  )}

  {/*  VIEW DETAILS BUTTON */}
  {land?.geoVerification?.status !== "pending" && (
    <button
      onClick={() => setShowGeoDialog(true)}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      View Verification Details
    </button>
  )}
</div>
{/*dailog to showcase the deatils */}
{showGeoDialog && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    
    <div className="bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-xl relative">

      {/* CLOSE */}
      <button
        onClick={() => setShowGeoDialog(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-black"
      >
        ✖
      </button>

      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Geo Verification Details
      </h2>

      <div className="space-y-2 text-sm text-gray-700">

        <p>
          <strong>Status:</strong>{" "}
          <span className={`font-semibold ${
            land.geoVerification.status === "matched"
              ? "text-green-600"
              : "text-red-600"
          }`}>
            {land.geoVerification.status}
          </span>
        </p>

        <p>
          <strong>Distance:</strong>{" "}
          {land.geoVerification.distance?.toFixed(3)} km
        </p>

        <p>
          <strong>Owner Coordinates:</strong>{" "}
          Lat: {land.location?.coordinates?.[1]} | 
          Lng: {land.location?.coordinates?.[0]}
        </p>

        <p>
          <strong>Lawyer Coordinates:</strong>{" "}
          Lat: {land.geoVerification.lawyerCoordinates?.[1]} | 
          Lng: {land.geoVerification.lawyerCoordinates?.[0]}
        </p>

        <p>
          <strong>Lawyer Note:</strong>{" "}
          {land.geoVerification.note || "No note provided"}
        </p>

        <p className="text-xs text-gray-500 mt-2">
          Verified at:{" "}
          {new Date(land.geoVerification.verifiedAt).toLocaleString()}
        </p>

      </div>
    </div>
  </div>
)}
      {/* ========================= */}
      {/* ⚖️ LEGAL SECTION */}
      {/* ========================= */}
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">⚖️ Legal Actions</h3>

        {/* Consultation Button */}
        <button
          onClick={() => startLawyerChat(land._id)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition flex justify-between items-center"
        >
          <span>{hasConsultation ? "Continue Consultation" : "Talk to Lawyer"}</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{hasConsultation ? "You have consulted" : "Consultation Required"}</span>
        </button>

        {/*  Start Legal Process */}
        {!hasConsultation && (
          <button
            disabled
            className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg shadow cursor-not-allowed flex justify-between items-center"
          >
            <span>Start Legal</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Consultation Required</span>
          </button>
        )}

        {hasConsultation && !hasLegalChat && (
          <button
            onClick={handleStartLegal}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition flex justify-between items-center"
          >
            <span>Start Legal Process</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Begin formal procedure</span>
          </button>
        )}

        {/*  Continue Legal Process */}
        {hasLegalChat && (
          <button
            onClick={() => navigate(`/chat/${existingChatId}`)}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition flex justify-between items-center"
          >
            <span>Continue Legal Process</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Chat ongoing</span>
          </button>
        )}

        {/*  Lawyer Modal */}
        {showLawyerModal && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40">
            <div className="bg-white w-96 rounded-xl shadow-2xl p-6 space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Select a Lawyer</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lawyers.map((lawyer) => (
                  <div
                    key={lawyer._id}
                    className="p-3 border rounded-lg hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => {
                      startLawyerChat(selectedLandId, lawyer._id);
                      setShowLawyerModal(false);
                    }}
                  >
                    {lawyer.username}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowLawyerModal(false)}
                className="mt-2 w-full text-sm text-gray-500 border-t pt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================= */}
      {/*  INTEREST LIST */}
      {/* ========================= */}
      {sortedInterests.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Interested Users</h3>

          <div className="space-y-3">
            
  {sortedInterests.map((i, index) => {
   const userIdStr = typeof i.user === "object" ? i.user._id : i.user; // handle populated or raw id
  const isCurrentUser = userIdStr === currentUserId;
  const displayName = isCurrentUser
    ? "You"
    : (i.user?.fullName || i.user?.username || "Anonymous");

    return (
      <div
        key={i._id}
        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-white transition shadow-sm hover:shadow-md border border-transparent hover:border-gray-200"
      >
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* INDEX */}
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-semibold">
            {index + 1}
          </div>

          {/* USER */}
          <div>
            <p className="text-sm font-semibold text-gray-800">{displayName}</p>
            <p className="text-xs text-gray-400">
              {new Date(i.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* STATUS */}
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium
            ${i.status === "accepted"
              ? "bg-green-100 text-green-700"
              : i.status === "withdrawn"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {i.status || "pending"}
        </span>
      </div>
    );
  })}

          
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* OWNERSHIP HISTORY */}
      {/* ========================= */}
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-800">Ownership History</h3>
          <p className="text-sm text-gray-600">
            Current Owner: <span className="font-semibold text-gray-800">{ownershipHistory?.[ownershipHistory.length - 1]?.toOwnerName || "N/A"}</span>
          </p>
          <p className="text-xs text-gray-400">Total Records: {ownershipHistory.length}</p>
        </div>

        <button
          onClick={() => setShowHistoryModal(true)}
          className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg shadow hover:shadow-md hover:scale-[1.02] transition"
        >
          View Full History
        </button>
      </div>

    </div>

    {/* ========================= */}
    {/*  MODAL: Ownership Flow */}
    {/* ========================= */}
    {showHistoryModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white w-[90%] max-w-3xl max-h-[80vh] rounded-3xl shadow-2xl p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Ownership Flow</h2>
            <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200"></div>

            <div className="space-y-8">
              {ownershipHistory.map((h, index) => {
                const isGenesis = h.fromOwnerName === h.toOwnerName;
                const isCurrent = index === ownershipHistory.length - 1;

                return (
                  <div key={h._id} className="flex items-start gap-4">
                    <div className="z-10">
                      <div className={`w-9 h-9 flex items-center justify-center rounded-full text-white text-xs font-bold shadow ${isGenesis ? "bg-emerald-500" : "bg-indigo-500"}`}>
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-gray-800">{isGenesis ? "Original Ownership" : "Transfer"}</p>
                        {isCurrent && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">CURRENT</span>}
                      </div>

                      <div className="text-sm text-gray-700 flex flex-wrap items-center gap-2">
                        {isGenesis ? (
                          <>🏁 Owned by <span className="font-semibold text-emerald-600">{h.toOwnerName}</span></>
                        ) : (
                          <>
                            <span>{h.fromOwnerName}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-semibold text-indigo-600">{h.toOwnerName}</span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-2">{new Date(h.dateOfTransfer).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {ownershipHistory.length === 1 && (
              <p className="text-sm text-gray-400 mt-4 ml-10">No transfers yet</p>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default InterestDashboard;
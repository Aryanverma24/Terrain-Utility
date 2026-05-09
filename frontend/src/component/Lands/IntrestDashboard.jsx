import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../../../utils/API';
import { toast } from 'react-toastify';
import axios from 'axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import PaymentModal from '../Payment/PaymentModal';

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

  //payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
 const [userLoaded, setUserLoaded] = useState(false);
const refreshLand = async () => {
  try {
    const res = await API.get(`/api/lands/dashboard/${landId}`);

    console.log("REFRESHED LAND:", res.data.land);

    setLand(res.data.land);
    setOwnershipHistory(res.data.ownershipHistory || []);
    setCurrentOwner(res.data.currentOwner);

    // refresh chat gating too
    await checkConsultationExists();
    await checkLegalChatExists();

  } catch (err) {
    console.error(err);
  }
};
  //to check whether the leagl chats exists to sethasleagl chat and change button veiw to leagla process started
  const checkLegalChatExists = async () => {
    try {
      const token = localStorage.getItem('token');

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
      const token = localStorage.getItem('token');

      const check = await API.get(`/api/chat/exists/${landId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('LEGAL CHECK:', check.data);

      // ✅ If already exists → use check response
      if (check.data.exists) {
        const chatId = check.data.chatId;

        if (!chatId) {
          console.error('❌ Existing chatId missing:', check.data);
          return;
        }

        navigate(`/inbox?chatId=${chatId}`);
        return;
      }

      // ✅ Create new legal chat
      const res = await API.post(
        '/api/chat/start-legal',
        { landId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('LEGAL CHAT CREATED:', res.data);

      const chatId = res.data.buyerLawyerChat;

      if (!chatId) {
        console.error('❌ ChatId missing from backend:', res.data);
        toast.error('Chat creation failed');
        return;
      }

      toast.success('Legal process started');

      navigate(`/inbox?chatId=${chatId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to start legal process');
    }
  };

  //to check whether user has a previously selcted consultation
  const checkConsultationExists = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await API.get(`/api/chat/consultation-exists/${landId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('CONSULTATION CHECK:', res.data);

      setHasConsultation(res.data.exists);
    } catch (err) {
      console.error(err);
    }
  };
  //to start a chat with lawyer in dahboaard
  const startLawyerChat = async (landId, lawyerId = null) => {
    try {
      const token = localStorage.getItem('token');

      // STEP 1: Check existing
      const check = await API.get(`/api/chat/consultation-exists/${landId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('CONSULTATION CHECK:', check.data);

      if (check.data.exists) {
        const chatId = check.data.chatId;

        if (!chatId) {
          console.error('❌ Existing consultation chatId missing:', check.data);
          return;
        }

        navigate(`/inbox?chatId=${chatId}`);
        return;
      }

      // STEP 2: Create new chat
      const res = await API.post(
        '/api/chat/lawyer',
        { landId, lawyerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('CHAT CREATED:', res.data);

      const chatId = res.data?.chatId || res.data?._id;

      if (!chatId) {
        console.error('❌ ChatId missing after creation:', res.data);
        return;
      }

      if (!chatId) {
        console.error('❌ ChatId missing after creation:', res.data);
        return;
      }

      navigate(`/inbox?chatId=${chatId}`);

      setHasConsultation(true);

      setTimeout(() => {
        checkConsultationExists();
      }, 500);
    } catch (err) {
      if (
        err.response?.data?.message === 'Please select a lawyer to start consultation'
      ) {
        console.log('No lawyer selected → opening modal');
        fetchLawyers(landId);
      } else {
        console.error('FULL ERROR:', err.response || err);
        toast.error('Failed to start lawyer chat');
      }
    }
  };
  //fucntion to fecth allll the lawyers for the user (buyer)
  const fetchLawyers = async (landId) => {
    try {
      const token = localStorage.getItem('token');

      const res = await API.get('/api/users/lawyers', {
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
      toast.error('Failed to fetch lawyers');
    }
  };
  //for rendering
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     const token = localStorage.getItem('token');

  //     try {
  //       let userPromise = null;

  //       if (token) {
  //         userPromise = API.get('/api/users/profile');
  //       }

  //       const landPromise = API.get(`/api/lands/dashboard/${landId}`);

  //       const [userRes, landRes] = await Promise.all([userPromise, landPromise]);

  //       // ✅ USER
  //       if (userRes) {
  //         const userData = userRes.data?.data || userRes.data?.user || userRes.data;

  //         const userId = userData?._id || userData?.id;

  //         setCurrentUserId(userId);
  //       }

  //       // ✅ LAND
  //       setLand(landRes.data.land);
  //       setOwnershipHistory(landRes.data.ownershipHistory || []);
  //       setCurrentOwner(landRes.data.currentOwner);
  //     } catch (err) {
  //       console.error(err);
  //       toast.error('Failed to load dashboard');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   if (landId) {
  //     fetchData();
  //   }
  // }, [landId]);

  const fetchData = async () => {
  setLoading(true);
  const token = localStorage.getItem('token');

  try {
    let userPromise = null;

    if (token) {
      userPromise = API.get('/api/users/profile');
    }

    const landPromise = API.get(`/api/lands/dashboard/${landId}`);

    const [userRes, landRes] = await Promise.all([userPromise, landPromise]);

    if (userRes) {
      const userData = userRes.data?.data || userRes.data?.user || userRes.data;
      const userId = userData?._id || userData?.id;
      setCurrentUserId(userId);
    }
setUserLoaded(true); 
console.log("📦 LAND FROM API:", landRes.data.land);
    setLand(landRes.data.land);
    setOwnershipHistory(landRes.data.ownershipHistory || []);
    setCurrentOwner(landRes.data.currentOwner);

  } catch (err) {
    console.error(err);
    toast.error('Failed to load dashboard');
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  if (landId) fetchData();
}, [landId]);
useEffect(() => {
  console.log("🔥 LAND STATE UPDATED:", land);
}, [land]);
  //ti chekc if consulation exists
  useEffect(() => {
    if (landId) {
      checkConsultationExists();
      checkLegalChatExists();
    }
  }, [landId]);

  if (loading)
    return <div className="pt-24 text-center text-lg text-gray-700">Loading...</div>;

  if (!land)
    return <div className="pt-24 text-center text-lg text-gray-700">Land not found</div>;

  // =========================
  // 🔹 OLD FEATURE (MESSAGES)
  // =========================
  const totalInterested = land.interestedUsers?.length || 0;

  const otherUsers =
    currentUserId !== null
      ? totalInterested -
        (land.interestedUsers?.some((i) => i.user?._id === currentUserId) ? 1 : 0)
      : totalInterested;

  const welcomeMessage =
    currentUserId !== null
      ? 'Welcome! Thank you for showing interest in this land.'
      : 'Viewing as guest';

  const interestMessage =
    totalInterested === 1
      ? 'You are the first person interested!'
      : currentUserId !== null
        ? totalInterested === 1 && otherUsers === 0
          ? 'You are the only one interested!'
          : `Hurry! ${otherUsers} other user${otherUsers > 1 ? 's' : ''} also interested.`
        : `Total interested users: ${totalInterested}`;

  // =========================
  // 🔹 SORT INTERESTS
  // =========================
  const sortedInterests = [...(land.interestedUsers || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // =========================
  // 🔹 LAST HASH
  // =========================
  const lastHash = ownershipHistory[ownershipHistory.length - 1]?.currentHash;


// =========================
// PAYMENT STATES
// =========================
const paymentStatus = land?.paymentStatus || "available";

const hasValidTokenStage =
  paymentStatus === "partial" &&
  !!land?.tokenBuyer;

const isTokenPaid = paymentStatus === "partial";
const isFullPaid = paymentStatus === "completed";
const isNotPaid = !isTokenPaid && !isFullPaid;
// =========================
// OWNER STATES
// =========================
const isOwner =
  !!land?.owner &&
  String(currentUserId) === String(land.owner);

const tokenBuyerId =
 typeof land?.tokenBuyer === "object"
   ? land.tokenBuyer?._id
   : land?.tokenBuyer;

const isTokenBuyer =
 !!tokenBuyerId &&
 String(currentUserId) === String(tokenBuyerId);

 const hasTokenBuyer = !!land?.tokenBuyer;

 const tokenLocked = paymentStatus === "partial";

// =========================
// LOCK STATES
// =========================
// // payment button
const canPay =
 !isFullPaid &&
 !isOwner &&
 !hasValidTokenStage;

  const canAccessChatButtons =
  !tokenLocked || isTokenBuyer;
//for stroing all staages for the deal room 
  const allowedStagesForDealRoom = [
  "token_paid",
  "mutation_pending",
  "appointment_booked",
  "registrar_assigned",
  "legal_process"
];
//to check pay buttons status
const allowedToPay = [
  "token_pending",
  "token_paid",
  "appointment_booked",
  "registrar_assigned",
  "legal_process"
]; 
//for keping track of the deal room
const showDealRoom =
  userLoaded &&
  isTokenBuyer &&
  hasLegalChat &&
  allowedStagesForDealRoom.includes(land?.transferStatus);
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
              {totalInterested} {totalInterested === 1 ? 'User' : 'Users'} Interested
            </p>
          </div>
        )}

        {/*  SELECTED LOCATION MAP */}
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-4 text-center">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">📍 Selected Location</h3>

            {/*STATUS BADGE */}
            {land?.geoVerification?.status !== 'pending' && (
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  land.geoVerification.status === 'matched'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {land.geoVerification.status === 'matched'
                  ? '✔ Geo Verified Land'
                  : '⚠ Suspicious Land'}
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
                <Marker
                  position={[land.location.coordinates[1], land.location.coordinates[0]]}
                />
              </MapContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No location selected for this land.</p>
          )}

          {/*  VIEW DETAILS BUTTON */}
          {land?.geoVerification?.status !== 'pending' && (
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
                  <strong>Status:</strong>{' '}
                  <span
                    className={`font-semibold ${
                      land.geoVerification.status === 'matched'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {land.geoVerification.status}
                  </span>
                </p>

                <p>
                  <strong>Distance:</strong> {land.geoVerification.distance?.toFixed(3)}{' '}
                  km
                </p>

                <p>
                  <strong>Owner Coordinates:</strong> Lat:{' '}
                  {land.location?.coordinates?.[1]} | Lng:{' '}
                  {land.location?.coordinates?.[0]}
                </p>

                <p>
                  <strong>Lawyer Coordinates:</strong> Lat:{' '}
                  {land.geoVerification.lawyerCoordinates?.[1]} | Lng:{' '}
                  {land.geoVerification.lawyerCoordinates?.[0]}
                </p>

                <p>
                  <strong>Lawyer Note:</strong>{' '}
                  {land.geoVerification.note || 'No note provided'}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  Verified at:{' '}
                  {new Date(land.geoVerification.verifiedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
       
        {/* ⚖️ LEGAL SECTION */}
    


<div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md p-6 space-y-4">

<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
⚖️ Legal Actions
</h3>

{canAccessChatButtons ? (
<>
  {/* TALK TO LAWYER */}
  <button
    onClick={() => startLawyerChat(land._id)}
    className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white"
  >
    {hasConsultation
      ? 'Continue Consultation'
      : 'Talk To Lawyer'}
  </button>


  {/* START LEGAL only if no case yet */}
  {!hasLegalChat && (
    <button
      onClick={handleStartLegal}
      disabled={!hasConsultation}
      className={`w-full px-4 py-3 rounded-lg
      ${
        !hasConsultation
        ? 'bg-gray-300 cursor-not-allowed'
        : 'bg-purple-600 text-white'
      }`}
    >
      {!hasConsultation
       ? 'Consult Lawyer First'
       : 'Start Legal Process'}
    </button>
  )}


  {/* EXISTING LEGAL CHAT */}
  {hasLegalChat && (
    <button
      onClick={() =>
       navigate(`/inbox?chatId=${existingChatId}`)
      }
      className="w-full px-4 py-3 rounded-lg bg-green-600 text-white"
    >
      Continue Legal Process
    </button>
  )}

</>
) : (

<>
  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
    Another buyer has already paid token.
    Legal chat access is locked.
  </div>

  <button
   disabled
   className="w-full bg-gray-300 py-3 rounded-lg cursor-not-allowed"
  >
   Talk To Lawyer (Locked)
  </button>

  <button
   disabled
   className="w-full bg-gray-300 py-3 rounded-lg cursor-not-allowed"
  >
   Legal Process Locked
  </button>
</>

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
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Interested Users
            </h3>

            <div className="space-y-3">
              {sortedInterests.map((i, index) => {
                const userIdStr = typeof i.user === 'object' ? i.user._id : i.user; // handle populated or raw id
                const isCurrentUser = userIdStr === currentUserId;
                const displayName = isCurrentUser
                  ? 'You'
                  : i.user?.fullName || i.user?.username || 'Anonymous';

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
                        <p className="text-sm font-semibold text-gray-800">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(i.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium
            ${
              i.status === 'accepted'
                ? 'bg-green-100 text-green-700'
                : i.status === 'withdrawn'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
            }`}
                    >
                      {i.status || 'pending'}
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
              Current Owner:{' '}
              <span className="font-semibold text-gray-800">
                {ownershipHistory?.[ownershipHistory.length - 1]?.toOwnerName || 'N/A'}
              </span>
            </p>
            <p className="text-xs text-gray-400">
              Total Records: {ownershipHistory.length}
            </p>
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
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
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
                        <div
                          className={`w-9 h-9 flex items-center justify-center rounded-full text-white text-xs font-bold shadow ${isGenesis ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        >
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-semibold text-gray-800">
                            {isGenesis ? 'Original Ownership' : 'Transfer'}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                              CURRENT
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-700 flex flex-wrap items-center gap-2">
                          {isGenesis ? (
                            <>
                              🏁 Owned by{' '}
                              <span className="font-semibold text-emerald-600">
                                {h.toOwnerName}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>{h.fromOwnerName}</span>
                              <span className="text-gray-400">→</span>
                              <span className="font-semibold text-indigo-600">
                                {h.toOwnerName}
                              </span>
                            </>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(h.dateOfTransfer).toLocaleDateString()}
                        </p>
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

      {/* ========================= */}
      {/* 💳 PAYMENT SECTION */}
     
      <div className="bg-white/90 backdrop-blur-md max-w-5xl mx-auto border border-gray-200 rounded-2xl shadow-md p-6 space-y-4 mt-6">
  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
    💳 Payment
  </h3>
{/* 💳 PAYMENT STATUS BANNER */}
<div className="space-y-3">

  {isTokenPaid && isTokenBuyer && (
  <div className="bg-blue-100 border border-blue-200 text-blue-800 p-4 rounded-xl text-center shadow-sm">
    💰 Token payment completed. Remaining payment pending.
  </div>
)}

{isTokenPaid && !isTokenBuyer && (
  <div className="bg-amber-100 border border-amber-200 text-amber-800 p-4 rounded-xl text-center shadow-sm">
    🔒 Token payment completed by another buyer.
  </div>
)}
  {isFullPaid && (
    <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl text-center shadow-sm">
      🎉 Full payment completed. Ownership processing ongoing.
    </div>
  )}

  {!isFullPaid && !isTokenPaid && (
    <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-center shadow-sm">
      ⏳ No payment done yet. Token payment required to proceed.
    </div>
  )}

</div>
  {/* STATUS */}
{/* STATUS */}
<div className="flex justify-between items-center">
  <span className="text-gray-600 text-sm">Payment Status:</span>

  <span
    className={`px-3 py-1 text-xs rounded-full font-semibold ${
      paymentStatus === 'completed'
        ? 'bg-green-100 text-green-700'
        : paymentStatus === 'partial'
        ? 'bg-blue-100 text-blue-700'
        : land.isLocked
        ? 'bg-blue-100 text-blue-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}
  >
    {paymentStatus === 'completed'
      ? 'Paid'
      : paymentStatus === 'partial'
      ? 'Token Paid'
      : land.isLocked
      ? 'Processing'
      : 'Not Paid'}
  </span>
</div>

  {/* TOKEN INFO (NEW IMPORTANT ADDITION) */}
  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
    <p className="text-sm text-gray-600">Token Required</p>

    <p className="text-emerald-700 font-semibold">
      ₹ {land.tokenConfig?.amount || Math.round(land.price * 0.05)}
    </p>
  </div>

  {/* BUTTON */}
  <button
    onClick={() => setShowPaymentModal(true)}
   disabled={
  isFullPaid ||
  land.isLocked ||
  String(currentUserId) === String(land.owner) ||
  land.transferStatus !== 'available'
}
    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
  >
   {!allowedToPay.includes(land.transferStatus)
  ? 'Pay Now'
  : land.transferStatus === 'token_pending'
  ? 'Complete Token First'
  : land.transferStatus === 'appointment_booked'
  ? 'Appointment Scheduled'
  : 'Pay & Buy Land'}
  </button>
</div>

     <PaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  land={land}
  onSuccess={(data) => {
    setShowPaymentModal(false);
   

    toast.success(data?.msg);

    refreshLand(); // 👈 THIS is correct function
  }}
/>
{showDealRoom && (
<div className="mt-6 pt-5 border-t border-indigo-100">
  <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 shadow-lg text-white">
    
    <div className="flex items-center justify-between gap-4">
      
      <div>
        <p className="text-xs uppercase tracking-wider text-indigo-100 font-semibold">
          Next Step
        </p>

        <h4 className="text-lg font-bold mt-1">
          Continue Property Transfer Process
        </h4>

        <p className="text-sm text-indigo-100 mt-1">
          Book registrar appointment and continue legal formalities.
        </p>
      </div>

      <button
        onClick={() => navigate(`/transaction-workflow/${land._id}`)}
        className="shrink-0 bg-white text-indigo-700 font-semibold px-5 py-3 rounded-xl shadow hover:scale-105 transition"
      >
        Open Deal Room →
      </button>

    </div>

  </div>
</div>
)}
    </div>
  );
};

export default InterestDashboard;

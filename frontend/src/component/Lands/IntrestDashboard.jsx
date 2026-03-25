import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../../../utils/API";
import { toast } from "react-toastify";
import axios from "axios";

const InterestDashboard = () => {
  const { landId } = useParams();

  const [land, setLand] = useState(null);
  const [ownershipHistory, setOwnershipHistory] = useState([]);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
const [showHistoryModal, setShowHistoryModal] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const token = localStorage.getItem("token");

      try {
        // 🔹 Get logged in user
        if (token) {
          const userRes = await axios.get("/api/users/current", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUserId(userRes.data.id || userRes.data._id);
        }

        // 🔹 Dashboard API
        const res = await API.get(`/api/lands/dashboard/${landId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setLand(res.data.land);
        setOwnershipHistory(res.data.ownershipHistory || []);
        setCurrentOwner(res.data.currentOwner);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (landId) fetchData();
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
    totalInterested === 0
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
   <div className="min-h-screen pt-24 bg-gray-50 px-6">

  {/* 🔹 HEADER */}
  <div className="max-w-5xl mx-auto">

    {/* INFO CARD */}
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        {welcomeMessage}
      </h2>
      <p className="text-gray-600">{interestMessage}</p>
    </div>

    {/* COUNT */}
    {totalInterested > 0 && (
      <div className="bg-white rounded-xl shadow p-4 mb-6 text-center">
        <p className="text-gray-700 font-medium">
          {totalInterested} Users Interested
        </p>
      </div>
    )}

    {/* =========================
        📊 INTEREST TABLE
    ========================= */}
    {sortedInterests.length > 0 && (
     <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
  <h3 className="text-lg font-semibold text-gray-800 mb-5">
    Interested Users
  </h3>

  <div className="overflow-x-auto">
    <table className="w-full border-separate border-spacing-y-2 text-sm">

      {/* HEADER */}
      <thead>
        <tr className="text-gray-500 text-xs uppercase tracking-wide">
          <th className="text-left px-4">#</th>
          <th className="text-left px-4">User</th>
          <th className="text-left px-4">Date</th>
          <th className="text-right px-4">Status</th>
        </tr>
      </thead>

      {/* BODY */}
      <tbody>
        {sortedInterests.map((i, index) => (
          <tr
            key={i._id}
            className="bg-gray-50 hover:bg-gray-100 transition rounded-xl"
          >

            {/* NUMBER */}
            <td className="px-4 py-3 font-medium text-gray-700">
              {index + 1}
            </td>

            {/* USER */}
            <td className="px-4 py-3 font-semibold text-gray-800">
              {i.user?.username || "Anonymous"}
            </td>

            {/* DATE */}
            <td className="px-4 py-3 text-gray-600">
              {new Date(i.createdAt).toLocaleDateString()}
            </td>

            {/* STATUS */}
            <td className="px-4 py-3 text-right">
              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  i.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : i.status === "withdrawn"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {i.status || "pending"}
              </span>
            </td>

          </tr>
        ))}
      </tbody>

    </table>
  </div>
</div>
    )}

{/* =========================
    🧾 OWNERSHIP PREVIEW CARD
========================= */}
<div className="bg-white rounded-2xl shadow-md p-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">
    Ownership History
  </h3>

  <div className="flex items-center justify-between">

    <div className="text-sm text-gray-600 space-y-1">
      <p>
        Current Owner:{" "}
        <span className="font-semibold text-gray-800">
          {ownershipHistory?.[ownershipHistory.length - 1]?.toOwnerName || "N/A"}
        </span>
      </p>

      <p className="text-xs text-gray-400">
        Total Records: {ownershipHistory.length}
      </p>
    </div>

    <button
      onClick={() => setShowHistoryModal(true)}
      className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
    >
      View Full History
    </button>
  </div>
</div>

{/* =========================
    📊 MODAL FLOWCHART
========================= */}
{showHistoryModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

    <div className="bg-white w-[90%] max-w-3xl max-h-[80vh] rounded-2xl shadow-xl p-6 overflow-y-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Ownership Flow
        </h2>

        <button
          onClick={() => setShowHistoryModal(false)}
          className="text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
      </div>

      {/* FLOW */}
      <div className="relative">

        {/* LINE */}
        <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gray-200"></div>

        <div className="space-y-8">
          {ownershipHistory.map((h, index) => {
            const isGenesis = h.fromOwnerName === h.toOwnerName;
            const isCurrent = index === ownershipHistory.length - 1;

            return (
              <div key={h._id} className="flex items-start gap-4">

                {/* STEP */}
                <div className="z-10">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-xs font-bold shadow
                      ${isGenesis ? "bg-green-500" : "bg-blue-500"}
                    `}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* CARD */}
                <div
                  className={`flex-1 rounded-xl p-4 transition duration-200
                    ${
                      isGenesis
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 hover:shadow-md"
                    }
                  `}
                >

                  {/* TITLE */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {isGenesis
                        ? "Original Ownership"
                        : "Ownership Transferred"}
                    </p>

                    {isGenesis && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        GENESIS
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}
                  {isGenesis ? (
                    <div className="text-sm text-gray-700">
                      🏁 Land originally owned by{" "}
                      <span className="font-semibold text-green-600">
                        {h.toOwnerName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm flex-wrap">

                      <span className="text-gray-600">
                        {h.fromOwnerName}
                      </span>

                      <span className="text-gray-400 text-lg">→</span>

                      <span className="font-semibold text-indigo-600">
                        {h.toOwnerName}
                      </span>

                      {isCurrent && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full ml-2">
                          CURRENT OWNER
                        </span>
                      )}
                    </div>
                  )}

                  {/* DATE */}
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(h.dateOfTransfer).toLocaleDateString()}
                  </p>

                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {ownershipHistory.length === 1 && (
          <p className="text-sm text-gray-500 mt-4 ml-10">
            No transfers yet
          </p>
        )}
      </div>
    </div>
  </div>
)}
  </div>
</div>
  );
};

export default InterestDashboard;
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CaseList = ({ cases }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [reasonType, setReasonType] = useState("");
  const [reasonText, setReasonText] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const openModal = (caseId) => {
    setSelectedCaseId(caseId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setReasonType("");
    setReasonText("");
    setSelectedCaseId(null);
  };

  const openChat = (chatId) => {
    if (!chatId) return;
    navigate(`/inbox?chatId=${chatId}`);
  };

  const handleTerminateCase = async () => {
    if (!reasonType) {
      alert("Please select a reason");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.put(
        `http://localhost:5000/api/chat/case/${selectedCaseId}/terminate`,
        {
          reasonType,
          reasonText,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // ✅ HANDLE "already closed" CASE CLEANLY
      if (res.data?.alreadyClosed) {
        alert("Case is already closed");
        closeModal();
        return;
      }

      // ❌ DO NOT MUTATE PROPS DIRECTLY (FIXED)
      cases.forEach((c) => {
        if (c._id === selectedCaseId) {
          c.status = "closed";
        }
      });

      closeModal();
    } catch (err) {
      console.error("Terminate case error:", err);

      // optional UX improvement
      if (err.response?.status === 400) {
        alert("Case already closed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">

      {/* EMPTY STATE */}
      {cases.length === 0 && (
        <div className="text-gray-400 text-center mt-20">
          ⚖️ No legal cases found
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cases.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
          >

            {/* HEADER */}
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Case ID</span>

                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    c.status === "closed"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {c.status === "closed" ? "Closed" : "Active"}
                </span>
              </div>

              <div className="font-semibold text-gray-800 mt-1 break-all">
                {c._id}
              </div>

              {/* PARTICIPANTS */}
              <div className="mt-4 text-sm">
                <div className="text-xs text-gray-400 mb-1">
                  Participants
                </div>

                <div className="space-y-1 font-medium text-gray-800">
                  {c.buyerId?.username && (
                    <div>🛒 Buyer: {c.buyerId.username}</div>
                  )}
                  {c.ownerId?.username && (
                    <div>🏡 Owner: {c.ownerId.username}</div>
                  )}
                  {c.lawyerId?.username && (
                    <div>⚖️ Lawyer: {c.lawyerId.username}</div>
                  )}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-5 flex flex-col gap-2">

              {/* CHAT BUTTONS */}
              <div className="flex gap-2">

                <button
                  onClick={() => openChat(c.buyerChatId)}
                  disabled={!c.buyerChatId}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg text-white ${
                    c.buyerChatId
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  💬 Buyer Chat
                </button>

                <button
                  onClick={() => openChat(c.ownerChatId)}
                  disabled={!c.ownerChatId}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg text-white ${
                    c.ownerChatId
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  🏡 Owner Chat
                </button>

              </div>

              {/* CLOSE CASE */}
              {c.status !== "closed" ? (
                <button
                  onClick={() => openModal(c._id)}
                  className="w-full px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Close Case
                </button>
              ) : (
                <span className="text-xs text-gray-400 text-center">
                  Case Closed
                </span>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl p-5 shadow-lg">

            <h2 className="text-lg font-semibold mb-3">
              Close Legal Case
            </h2>

            <select
              value={reasonType}
              onChange={(e) => setReasonType(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="">Select reason</option>
              <option value="resolved">Resolved</option>
              <option value="mutual_agreement">Mutual Agreement</option>
              <option value="other">Other</option>
            </select>

            <textarea
              placeholder="Optional details..."
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-3 py-1 text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleTerminateCase}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                {loading ? "Closing..." : "Confirm"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CaseList;
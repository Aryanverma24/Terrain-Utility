import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

export default function OwnerChatList() {
  const { user } = useContext(AuthContext);
  const ownerId = user?._id;
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [lands, setLands] = useState({}); // key: landId, value: land details
  const [unreadCounts, setUnreadCounts] = useState({}); // key: chatId, value: unread count

  useEffect(() => {
    if (!ownerId) return;

    const fetchChatsAndUnread = async () => {
      try {
        // Fetch owner chats
        const res = await axios.get(`http://localhost:5000/api/chat/owner/${ownerId}`);
        setChats(res.data);

        // Fetch land details
        const landIds = res.data.map((c) => c.landId);
        const landRes = await Promise.all(
          landIds.map((id) => axios.get(`http://localhost:5000/api/lands/${id}`))
        );
        const landMap = {};
        landRes.forEach((lr) => {
          landMap[lr.data._id] = lr.data;
        });
        setLands(landMap);

        // Fetch notifications for owner (unread only)
        const notifRes = await axios.get(`http://localhost:5000/api/notifications/${ownerId}`);
        const notifs = notifRes.data;

        // Count unread messages per chat
        const counts = {};
        notifs.forEach((n) => {
          if (!n.isRead && n.chatId) {
            counts[n.chatId] = (counts[n.chatId] || 0) + 1;
          }
        });
        setUnreadCounts(counts);
      } catch (err) {
        console.error("Error fetching owner chats, lands or notifications:", err);
      }
    };

    fetchChatsAndUnread();
  }, [ownerId]);

  const openChat = (chat) => {
    navigate(`/chat/owner/${chat.landId}/${chat.buyerId}`, {
      state: {
        chatId: chat._id,
        buyerId: chat.buyerId,
        buyerName: chat.buyerName || "Buyer",
        landId: chat.landId,
        ownerId: ownerId,
        ownerName: user?.username || "Owner",
      },
    });
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700 drop-shadow-lg">
        Buyers Interested in Chatting
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chats.length === 0 && (
          <p className="col-span-full text-center text-gray-500 text-lg">
            No buyers have messaged yet.
          </p>
        )}

        {chats.map((c) => {
          const land = lands[c.landId];
          const unread = unreadCounts[c._id] || 0;

          return (
            <div
              key={c._id}
              onClick={() => openChat(c)}
              className="relative cursor-pointer rounded-xl bg-white p-5 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out border-t-4 border-indigo-500 group"
            >
              {/* Buyer Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {c.buyerName?.[0] || "B"}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">{c.buyerName || "Buyer"}</p>
                  {land ? (
                    <p className="text-sm text-gray-500">
                      is interested in chatting with you regarding your{" "}
                      <span className="font-medium">
                        {land.type || "land"} in {land.city || "Unknown City"}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Loading land details...</p>
                  )}
                </div>
              </div>

              {/* Owner Info */}
              <div className="mt-2">
                <p className="text-sm text-gray-600">Owner: {user?.username || "Owner"}</p>
              </div>

              {/* Unread badge */}
              {unread > 0 && (
  <div className="absolute top-1 right-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
    {unread}
  </div>
)}

              {/* Hover overlay effect */}
              <div className="absolute inset-0 rounded-xl bg-indigo-50 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

              {/* Animated icon on hover */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-500 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-2M7 8H5a2 2 0 00-2 2v8a2 2 0 002 2h2m10-12V6a4 4 0 00-8 0v2"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

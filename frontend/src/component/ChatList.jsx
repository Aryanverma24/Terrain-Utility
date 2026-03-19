import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const getId = (val) => {
  if (!val) return null;
  return typeof val === "object" ? val._id?.toString() : val.toString();
};

// ✅ ADDED apiEndpoint PROP
export default function ChatList({ apiEndpoint, onSelectChat }) {
  const { user } = useContext(AuthContext);
  const userId = getId(user?._id);
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [lands, setLands] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

 const fetchChats = async () => {
  try {
    if (!userId) return;

    // ✅ FIX: dynamic API
    const res = await axios.get(
      `http://localhost:5000/api/chat/${apiEndpoint}/${userId}`
    );

    const chatData = res.data;
    setChats(chatData);

    // 🔥 LAND DATA
    const landIds = chatData.map((c) => c.landId);

    const landRes = await Promise.all(
      landIds.map((id) =>
        axios.get(`http://localhost:5000/api/lands/${id}`)
      )
    );

    const landMap = {};
    landRes.forEach((lr) => {
      landMap[lr.data._id] = lr.data;
    });

    setLands(landMap);

    // 🔥 UNREAD COUNTS FROM MESSAGE API
    const unreadRes = await axios.get(
      `http://localhost:5000/api/chat/unread/${userId}`
    );

    setUnreadCounts(unreadRes.data); // already { chatId: count }

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchChats();

  const interval = setInterval(fetchChats, 3000);
  return () => clearInterval(interval);

}, [userId, apiEndpoint]); // ✅ FIXED dependency // ✅ added dependency

 const openChat = async (chat) => {
  try {
    // ✅ mark messages as read
    await axios.put(
      `http://localhost:5000/api/chat/read/${chat._id}/${userId}`
    );

    // ✅ update UI instantly
    setUnreadCounts((prev) => ({
      ...prev,
      [getId(chat._id)]: 0,
    }));
if (onSelectChat) onSelectChat(chat);
    navigate(`/chat/${chat._id}`, {
      state: { chat },
    });

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-br from-indigo-50 to-pink-50">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">
        Your Conversations
      </h1>

      <div className="grid gap-6">
        {chats.map((c) => {
          const land = lands[c.landId];
          const unread = unreadCounts[c._id] || 0;

          const isOwner = getId(c.ownerId) === userId;

          const otherUserName = isOwner
            ? c.buyerName || "Buyer"
            : c.ownerName || "Owner";

          return (
            <div
              key={c._id}
              onClick={() => openChat(c)}
              className="cursor-pointer p-5 bg-white rounded-xl shadow hover:shadow-lg relative"
            >
              <h2 className="font-semibold text-lg">
                {otherUserName}
              </h2>

              {land && (
                <div className="text-sm text-gray-600 mt-1 space-y-1">
                  <p>📍 {land.city} - {land.pincode}</p>
                  <p>💰 ₹{land.price}</p>
                  <p>
                    📐 {land.dimensions.length} ✕ {land.dimensions.breadth}sq.ft
                  </p>
                  <p className="truncate">📝 {land.description}</p>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-2 truncate">
                💬 {c.lastMessage || "No messages yet"}
              </p>

              <p className="text-xs text-gray-400">
                {new Date(c.lastMessageAt).toLocaleString()}
              </p>

              {unread > 0 && (
                <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
                  {unread}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
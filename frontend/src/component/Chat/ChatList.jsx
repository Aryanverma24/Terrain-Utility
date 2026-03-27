import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../contexts/AuthContext";

const getId = (val) => {
  if (!val) return null;
  return typeof val === "object" ? val._id?.toString() : val.toString();
};

export default function ChatList({ type, onSelectChat }) { // ✅ added type
  const { user } = useContext(AuthContext);
  const userId = getId(user?._id);
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const fetchChats = async () => {
    try {
      if (!userId) return;

      const res = await axios.get(
        `http://localhost:5000/api/chat/user/${userId}`
      );

      setChats(res.data);

      const unreadRes = await axios.get(
        `http://localhost:5000/api/chat/unread/${userId}`
      );

      setUnreadCounts(unreadRes.data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const openChat = async (chat) => {
    try {
      await axios.put(
        `http://localhost:5000/api/chat/read/${chat._id}/${userId}`
      );

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

  // ✅ 🔥 ONLY ADDITION: FILTER BASED ON ROLE
  const filteredChats = chats.filter((chat) => {
    const landOwnerId = getId(chat.land?.owner);
    if (!landOwnerId) return false;

    if (type === "buyer") return landOwnerId !== userId;
    if (type === "owner") return landOwnerId === userId;

    return true;
  });

  return (
    <div className="min-h-screen pt-24 px-6 bg-gradient-to-br from-indigo-50 to-pink-50">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">
        Your Conversations
      </h1>

      <div className="grid gap-6">
        {filteredChats.map((c) => {  // ✅ changed here
          const unread = unreadCounts[c._id] || 0;

          const otherUser = c.participants.find(
            (p) => getId(p._id || p) !== userId
          );

          const otherUserName = otherUser?.username || "User";
          const land = c.land;

          return (
            <div
              key={c._id}
              onClick={() => openChat(c)}
              className="cursor-pointer p-5 bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 relative border border-gray-100"
            >
              <h2 className="font-semibold text-lg text-indigo-700">
                {otherUserName}
              </h2>

              {land && (
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <p>📍 {land.title || "Land listing"}</p>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-2 truncate">
                💬 {c.lastMessage || "No messages yet"}
              </p>

              <p className="text-xs text-gray-400">
                {c.lastMessageAt
                  ? new Date(c.lastMessageAt).toLocaleString()
                  : ""}
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
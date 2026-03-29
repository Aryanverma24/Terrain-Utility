import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../contexts/AuthContext";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

const getId = (val) => {
  if (!val) return null;
  return typeof val === "object" ? val._id?.toString() : val.toString();
};

export default function ChatList({ type, onSelectChat }) {
  const { user } = useContext(AuthContext);
  const userId = getId(user?._id);

  const [chats, setChats] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

 const fetchChats = async () => {
  try {
  

    if (!userId) {
     
      return;
    }

    const res = await axios.get(`http://localhost:5000/api/chat/user/${userId}`);
    
    setChats(res.data);

    const unreadRes = await axios.get(`http://localhost:5000/api/chat/unread/${userId}`);
   
    setUnreadCounts(unreadRes.data);

  } catch (err) {
    console.error("❌ ChatList | Error fetching chats:", err);
  }
};
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("join", user._id);

    const handleOnlineUsers = (users) => setOnlineUsers(users);
    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [user?._id]);

  useEffect(() => {
    fetchChats();
  }, [userId]);

 const openChat = async (chat) => {
  

  try {
    await axios.put(`http://localhost:5000/api/chat/read/${chat._id}/${userId}`);
    setUnreadCounts((prev) => ({ ...prev, [getId(chat._id)]: 0 }));

    if (onSelectChat) {
      
      onSelectChat(chat);
    }
  } catch (err) {
    console.error("❌ ChatList | Error in openChat:", err);
  }
};

  // 🔹 Filter chats based on section type
 const filteredChats = chats.filter((chat) => {
  

  const landOwnerId = getId(chat.land?.owner);
  const isLegalChat = chat.chatType === "legal";
  const isConsultationChat = chat.chatType === "consultation";

  if (type === "buyer") return landOwnerId !== userId && !isLegalChat && !isConsultationChat;
  if (type === "owner") return landOwnerId === userId && !isLegalChat && !isConsultationChat;
  if (type === "legal") return isLegalChat || isConsultationChat;

  return true;
});


  return (
    <div className="flex flex-col">
      {filteredChats.length === 0 && (
        <div className="text-center text-gray-400 text-sm py-10">
          No conversations yet
        </div>
      )}

      {filteredChats.map((c) => {
        const unread = unreadCounts[c._id] || 0;
        const otherUser = c.participants.find((p) => getId(p._id || p) !== userId);
        const otherUserName = otherUser?.username || "User";
        const land = c.land;

        return (
          <div
            key={c._id}
            onClick={() => openChat(c)}
            className="group flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-300 hover:bg-gray-50 relative"
          >
            {/* AVATAR */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold shadow-md">
                {otherUserName.charAt(0).toUpperCase()}
              </div>

              {/* ONLINE DOT */}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                  onlineUsers.includes(getId(otherUser._id)) ? "bg-green-500" : "bg-gray-400"
                }`}
                title={onlineUsers.includes(getId(otherUser._id)) ? "Online" : "Offline"}
              ></span>
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0">
              {/* NAME + TIME */}
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-gray-800 truncate group-hover:text-emerald-600 transition">
                  {otherUserName}
                </h2>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {c.lastMessageAt
                    ? new Date(c.lastMessageAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>

              {/* LAND INFO */}
              {land && (
                <div className="mt-2 flex flex-col gap-1">
                  <p className="text-xs font-semibold text-emerald-600 truncate">
                    {land.landtype || "Land"}
                  </p>
                  <span className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <span>📍</span>
                    <span>
                      {land.city || "Unknown City"}, {land.state || "Unknown State"}
                      {land.pincode ? ` - ${land.pincode}` : ""}
                    </span>
                  </span>
                </div>
              )}

              {/* LAST MESSAGE */}
              <p className="text-sm text-gray-600 truncate mt-1">
                {c.lastMessage || "No messages yet"}
              </p>
            </div>

            {/* UNREAD BADGE */}
            {unread > 0 && (
              <div className="flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow">
                {unread}
              </div>
            )}

            {/* HOVER INDICATOR */}
            <div className="absolute left-0 top-0 h-full w-[3px] bg-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </div>
        );
      })}
    </div>
  );
}
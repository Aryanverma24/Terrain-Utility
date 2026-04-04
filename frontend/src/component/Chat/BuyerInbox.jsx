import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import ChatList from "../Chat/ChatList";
import ChatWindow from "../Chat/ChatWindow";
import axios from "axios";

const getId = (val) => (val?._id ? val._id.toString() : val?.toString());

const Inbox = () => {
  const { user } = useContext(AuthContext);
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeSection, setActiveSection] = useState("buyer"); // "buyer" | "owner" | "legal"
  const [unreadCounts, setUnreadCounts] = useState({ buyer: 0, owner: 0, legal: 0 });

  const userId = getId(user);

  // Fetch unread counts for each section
  useEffect(() => {
    const fetchUnread = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/unread/${userId}`);
        // Process unread counts per chat type (placeholder logic, can refine)
        const counts = { buyer: 0, owner: 0, legal: 0 };
        Object.entries(res.data).forEach(([chatId, count]) => {
          // Real implementation would fetch chat type here
          counts.buyer += 0;
          counts.owner += 0;
          counts.legal += 0;
        });
        setUnreadCounts(counts);
      } catch (err) {
        console.error("Error fetching unread counts", err);
      }
    };
    fetchUnread();
  }, [userId]);

  const sections = [
    { key: "buyer", label: "Buyer Chats", color: "emerald" },
    { key: "owner", label: "Owner Chats", color: "blue" },
    { key: "legal", label: "Legal / Consultation", color: "purple" },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#f4f7f6]">

      {/* TOPMOST SECTION: Section selection with unread badges */}
     {/* TOPMOST SECTION: Section selection with unread badges */}
<div className="flex justify-center gap-4 px-5 py-3 bg-white border-b shadow-sm mt-20">
  {sections.map((s) => (
    <button
      key={s.key}
      onClick={() => setActiveSection(s.key)}
      className={`relative px-5 py-2 rounded-full font-medium text-sm transition ${
        activeSection === s.key
          ? `bg-${s.color}-500 text-white`
          : `bg-gray-100 text-gray-700 hover:bg-${s.color}-100`
      }`}
    >
      {s.label}
      {unreadCounts[s.key] > 0 && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
          {unreadCounts[s.key]}
        </span>
      )}
    </button>
  ))}
</div>
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL: Chat List */}
        <div className="md:w-1/3 w-full flex flex-col border-r bg-white shadow-sm overflow-y-auto">
          <ChatList
            type={activeSection}
            onSelectChat={(chat) => setSelectedChat(chat)}
          />
        </div>

        {/* RIGHT PANEL: Chat Window */}
        <div className="md:w-2/3 w-full bg-white flex flex-col shadow-sm">
          <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              {activeSection === "buyer"
                ? "Buyer Chats"
                : activeSection === "owner"
                ? "Owner Chats"
                : "Legal / Consultation Chats"}
            </h2>
            <p className="text-xs text-gray-500">
              {selectedChat
                ? `Chat with ${selectedChat.participants
                    .map((p) => p.username)
                    .filter((u) => u !== user.username)
                    .join(", ")}`
                : "Select a chat to start messaging"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {selectedChat ? (
              <ChatWindow chat={selectedChat} />
            ) : (
              <div className="text-center text-gray-400 mt-20">
                Select a chat from the left to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
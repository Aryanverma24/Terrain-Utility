import socket from "../../../utils/socket";
import React, {
  useContext,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { useLocation } from "react-router-dom"; // ✅ ADD THIS
import ChatList from "../Chat/ChatList";
import ChatWindow from "../Chat/ChatWindow";
import axios from "axios";
import { useRef } from "react";


const getId = (val) => (val?._id ? val._id.toString() : val?.toString());

const Inbox = forwardRef((props, ref) => {
  const { user } = useContext(AuthContext);
  const location = useLocation(); // ✅ ADD THIS
const chatsRef = useRef([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeSection, setActiveSection] = useState("buyer");
  const [unreadCounts, setUnreadCounts] = useState({
    buyer: 0,
    owner: 0,
    legal: 0,
  });

  const userId = getId(user);
useEffect(() => {
  const handleMessage = (msg) => {
    const chatId = msg.chatId;

    // ✅ Ignore if currently open chat
   if (getId(selectedChat?._id) === getId(chatId)) return;

    const chat = chatsRef.current.find(
      (c) => getId(c._id) === getId(chatId)
    );

    // 🔥 NEW CHAT CASE
    if (!chat) {
      axios
        .get(`http://localhost:5000/api/chat/${chatId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          chatsRef.current.push(res.data);
          updateUnread(res.data);
        })
        .catch(() => {});
      return;
    }

    // EXISTING CHAT
    fetchUnread(); // 🔥 FULL SYNC
  };

  socket.on("message", handleMessage);

  return () => {
    socket.off("message", handleMessage); // ✅ CORRECT CLEANUP
  };
}, [selectedChat, userId]);

const updateUnread = (chat) => {
  setUnreadCounts((prev) => {
    const updated = { ...prev };

    const landOwnerId = getId(chat.land?.owner);
    const isLegal =
      chat.chatType === "legal" || chat.chatType === "consultation";

    if (isLegal) updated.legal += 1;
    else if (landOwnerId === userId) updated.owner += 1;
    else updated.buyer += 1;

    return updated;
  });
};
const openChatInInbox = (chat) => {
  if (!chat) return;

  setSelectedChat(chat);

  const section =
    chat.chatType === "legal" || chat.chatType === "consultation"
      ? "legal"
      : getId(chat.land?.owner) === userId
      ? "owner"
      : "buyer";

  setActiveSection(section);

  // ✅ RESET ONLY THAT SECTION
  setUnreadCounts((prev) => ({
    ...prev,
    [section]: 0,
  }));
};
  // ✅ 🔥 NEW: Open chat from URL (MAIN FIX)
  useEffect(() => {
    const chatId = new URLSearchParams(location.search).get("chatId");

    if (!chatId || !userId) return;

    const fetchChatAndOpen = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chat/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        openChatInInbox(res.data); // ✅ open automatically
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    };

    fetchChatAndOpen();
  }, [location.search, userId]);

  // ✅ EXISTING: Fetch unread counts

  const fetchUnread = async () => {
    if (!userId) return;

    try {
      const [unreadRes, chatsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/chat/unread/${userId}`),
        axios.get(`http://localhost:5000/api/chat/user/${userId}`)
      ]);
;

// ✅ ADD THIS

      const unreadMap = unreadRes.data;
      const chats = chatsRes.data;
chatsRef.current = chats;
      const counts = { buyer: 0, owner: 0, legal: 0 };

      chats.forEach((chat) => {
        const chatId = getId(chat._id);
        const unread = unreadMap[chatId] || 0;

        if (unread === 0) return;

        const landOwnerId = getId(chat.land?.owner);
        const isLegal =
          chat.chatType === "legal" || chat.chatType === "consultation";

        if (isLegal) {
          counts.legal += unread;
        } else if (landOwnerId === userId) {
          counts.owner += unread;
        } else {
          counts.buyer += unread;
        }
      });

      setUnreadCounts(counts);

    } catch (err) {
      console.error("Unread fetch error:", err);
    }
  };

  fetchUnread();
useEffect(() => {
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
  <ChatWindow key={selectedChat._id} chat={selectedChat} />
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
});

export default Inbox;
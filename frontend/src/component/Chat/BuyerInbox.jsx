import socket from "../../../utils/socket";
import React, {
  useContext,
  useState,
  useEffect,
  forwardRef,
} from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import ChatList from "../Chat/ChatList";
import ChatWindow from "../Chat/ChatWindow";
import axios from "axios";
import { useRef } from "react";
import CaseList from "../lawyer/caseList";
const getId = (val) => (val?._id ? val._id.toString() : val?.toString());

/* ✅ NEW HELPER (NON-BREAKING ADDITION) */
const getChatRole = (chat, userId, isLawyer) => {
  if (!chat) return "buyer";

  // Legal / Consultation chats
  if (chat.chatType === "legal" || chat.chatType === "consultation") {
    return isLawyer ? "buyer" : "legal";
  }

  const ownerId = getId(chat.land?.owner);

  if (ownerId === userId) return "owner";

  return "buyer";
};

const Inbox = forwardRef((props, ref) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const chatsRef = useRef([]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [activeSection, setActiveSection] = useState("buyer");
  const [unreadCounts, setUnreadCounts] = useState({
    buyer: 0,
    owner: 0,
    legal: 0,
  });


  const isLawyer = user?.role === "lawyer";
  const userId = getId(user);
  //states for cases
  const [cases, setCases] = useState([]);
const [selectedCase, setSelectedCase] = useState(null);
//for fetching cases 
  useEffect(() => {
  if (!isLawyer) return;

  const fetchCases = async () => {
    try {
      const res = await axios.get(
  `http://localhost:5000/api/lawyer/${userId}/cases`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);
      setCases(res.data);
    } catch (err) {
      console.error("Case fetch error:", err);
    }
  };

  fetchCases();
}, [isLawyer, userId]);

  useEffect(() => {
    if (isLawyer && activeSection === "legal") {
      setActiveSection("buyer");
    }
  }, [isLawyer]);

  /* SOCKET MESSAGE LISTENER */
  useEffect(() => {
    const handleMessage = (msg) => {
      const chatId = msg.chatId;

      if (getId(selectedChat?._id) === getId(chatId)) return;

      const chat = chatsRef.current.find(
        (c) => getId(c._id) === getId(chatId)
      );

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

      fetchUnread();
    };

    socket.on("message", handleMessage);

    return () => {
      socket.off("message", handleMessage);
    };
  }, [selectedChat, userId]);

  /* ✅ UPDATED (SAFE) */
  const updateUnread = (chat) => {
    setUnreadCounts((prev) => {
      const updated = { ...prev };

      const role = getChatRole(chat, userId, isLawyer);
      updated[role] += 1;

      return updated;
    });
  };

  /* ✅ UPDATED (SAFE) */
  const openChatInInbox = (chat) => {
    if (!chat) return;

    setSelectedChat(chat);

    const section = getChatRole(chat, userId, isLawyer);
    setActiveSection(section);

    setUnreadCounts((prev) => ({
      ...prev,
      [section]: 0,
    }));
  };

  /* OPEN CHAT FROM URL */
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

        openChatInInbox(res.data);
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    };

    fetchChatAndOpen();
  }, [location.search, userId]);

  /* FETCH UNREAD COUNTS */
  const fetchUnread = async () => {
    if (!userId) return;

    try {
      const [unreadRes, chatsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/chat/unread/${userId}`),
        axios.get(`http://localhost:5000/api/chat/user/${userId}`),
      ]);

      const unreadMap = unreadRes.data;
      const chats = chatsRes.data;

      chatsRef.current = chats;

      const counts = { buyer: 0, owner: 0, legal: 0 };

      chats.forEach((chat) => {
        const chatId = getId(chat._id);
        const unread = unreadMap[chatId] || 0;

        if (unread === 0) return;

        const role = getChatRole(chat, userId, isLawyer);
        counts[role] += unread;
      });

      setUnreadCounts(counts);
    } catch (err) {
      console.error("Unread fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUnread();
  }, [userId]);

  const sections = isLawyer
  ? [
      { key: "buyer", label: "Buyer Chats", color: "emerald" },
      { key: "owner", label: "Owner Chats", color: "blue" },
      { key: "cases", label: "Legal Cases", color: "purple" }, // ✅ NEW
    ]
  : [
      { key: "buyer", label: "Buyer Chats", color: "emerald" },
      { key: "owner", label: "Owner Chats", color: "blue" },
      { key: "legal", label: "Legal / Consultation", color: "purple" },
    ];

  return (
    <div className="h-screen flex flex-col bg-[#f4f7f6]">

      {/* TOP SECTION */}
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
{/* ✅ SECTION DESCRIPTION BANNER */}
<div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b text-sm text-gray-600 text-center">

  {/* 🏡 OWNER */}
  {activeSection === "owner" && (
    <span>
      🏡 <b>Owner Chats:</b>{" "}
      {isLawyer ? (
        <>
          These are <b>legal case-related chats initiated by land owners</b> for dispute resolution, documentation, or legal assistance.
        </>
      ) : (
        <>
          These are chats where <b>buyers contacted you</b> regarding your land listings.
        </>
      )}
    </span>
  )}

  {/* 🛒 BUYER */}
  {activeSection === "buyer" && (
    <span>
      🛒 <b>Buyer Chats:</b>{" "}
      {isLawyer ? (
        <>
          These are chats where <b>buyers contacted you for consultation or general queries</b>, including legal advice or discussions not tied to a formal case.
        </>
      ) : (
        <>
          These are chats where <b>you reached out to land owners</b> for their properties.
        </>
      )}
    </span>
  )}

  {/* ⚖️ CASES */}
  {activeSection === "cases" && isLawyer && (
    <span>
      ⚖️ <b>Legal Cases:</b> This section shows <b>all legal cases where you are assigned as a lawyer</b>. You can view participants and manage case closure.
    </span>
  )}

  {/* ⚖️ LEGAL (NON-LAWYER) */}
  {activeSection === "legal" && !isLawyer && (
    <span>
      ⚖️ <b>Legal / Consultation:</b> These are your <b>legal discussions and lawyer consultations</b>.
    </span>
  )}

</div>
     <div className={`flex flex-1 overflow-hidden ${activeSection === "cases" && isLawyer ? "flex-col" : ""}`}>

        {/* LEFT PANEL */}
     <div className={`${activeSection === "cases" && isLawyer ? "w-full" : "md:w-1/3 w-full"} flex flex-col border-r bg-white shadow-sm overflow-y-auto`}>

  {activeSection === "cases" && isLawyer ? (
    <CaseList
      cases={cases}
      onSelectCase={(c) => {
        setSelectedCase(c);
        setSelectedChat(null);
      }}
    />
  ) : (
    <ChatList
      type={activeSection}
      onSelectChat={(chat) => {
        setSelectedChat(chat);
        setSelectedCase(null);
      }}
    />
  )}

</div>

        {/* RIGHT PANEL */}
{!(activeSection === "cases" && isLawyer) && (
  <div className="md:w-2/3 w-full bg-white flex flex-col shadow-sm">

    <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b">
      <h2 className="text-lg font-semibold text-gray-800">
        {activeSection === "buyer"
          ? "Buyer Chats"
          : activeSection === "owner"
          ? "Owner Chats"
          : !isLawyer
          ? "Legal / Consultation Chats"
          : ""}
      </h2>

      <p className="text-xs text-gray-500">
        {selectedChat ? (
          <>
            Chat with{" "}
            {selectedChat.participants
              .map((p) => p.username)
              .filter((u) => u !== user.username)
              .join(", ")}
            {" • "}
            <span className="font-semibold capitalize">
              {getChatRole(selectedChat, userId, isLawyer)} chat
            </span>
          </>
        ) : (
          "Select a chat from the left"
        )}
      </p>
    </div>

    <div className="flex-1 overflow-y-auto p-5">
      {selectedChat ? (
        <ChatWindow key={selectedChat._id} chat={selectedChat} />
      ) : (
        <div className="text-center text-gray-400 mt-20">
          Select a chat from the left
        </div>
      )}
    </div>

  </div>
)}
      </div>
    </div>
  );
});

export default Inbox;
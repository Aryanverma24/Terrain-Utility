import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../contexts/AuthContext";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const getId = (val) => {
  if (!val) return null;
  return typeof val === "object" ? val._id?.toString() : val.toString();
};

export default function ChatWindow() {
  const { chatId } = useParams();
  const { state } = useLocation();
  const { user } = useContext(AuthContext);

  const initialChat = state?.chat;
  const userId = getId(user?._id);

  const [chat, setChat] = useState(initialChat);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState("");

  const typingTimeoutRef = useRef(null);

  // ✅ SOCKET SETUP
  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinRoom", { room: chatId });

    const handleHistory = (history) => {
      console.log("📜 HISTORY:", history);
      setMessages(history);
    };

    const handleMessage = (msg) => {
      console.log("🔥 LIVE MESSAGE:", msg);

      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    // ✅ SOCKET typing handler (FIXED)
    const handleTyping = ({ senderName }) => {
      setTypingUser(senderName);
    };

    const handleStopTyping = () => {
      setTypingUser("");
    };

    const handleRead = () => {
      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          isRead: true,
        }))
      );
    };

    socket.on("messageHistory", handleHistory);
    socket.on("message", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messagesRead", handleRead);

    return () => {
      socket.off("messageHistory", handleHistory);
      socket.off("message", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messagesRead", handleRead);
    };
  }, [chatId]);

  // ✅ MARK AS READ
  useEffect(() => {
    if (!chatId || !userId) return;

    socket.emit("markAsRead", {
      chatId,
      userId,
    });
  }, [chatId, userId]);

  // ✅ FETCH FALLBACK
  useEffect(() => {
    if (!chatId) return;

    axios
      .get(`http://localhost:5000/api/chat/${chatId}/messages`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, [chatId]);

  // ✅ SEND MESSAGE
  const sendMessage = () => {
    if (!text.trim()) return;

    const receiver = chat.participants.find(
      (p) => getId(p._id || p) !== userId
    );

    socket.emit("sendMessage", {
      chatId,
      room: chatId,
      senderId: userId,
      senderName: user.username,
      receiverId: getId(receiver._id || receiver),
      receiverName: receiver.username,
      message: text,
    });

    setText("");

    // ✅ stop typing when message sent
    socket.emit("stopTyping", { room: chatId });
  };

  // ✅ INPUT HANDLER (FIXED)
  const handleInputChange = (e) => {
    setText(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit("typing", {
      room: chatId,
      senderName: user.username,
    });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { room: chatId });
    }, 1000);
  };

  const otherUser = chat?.participants?.find(
    (p) => getId(p._id || p) !== userId
  );

  if (!chat) return <div>Loading...</div>;
return (
<div className="flex justify-center items-start min-h-screen pt-24 pb-6 bg-gradient-to-br from-[#f8fafc] to-[#eef2f7] px-4">

    {/* 💎 FLOATING CHAT PANEL */}
    <div className="w-full max-w-3xl h-[88vh] flex flex-col rounded-3xl overflow-hidden 
    bg-white/80 backdrop-blur-xl border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

      {/* 🔥 CONTEXT BAR */}
      <div className="text-center text-xs text-gray-500 py-2 bg-white/60 border-b">
        You are chatting with{" "}
        <span className="font-semibold text-gray-700">
          {otherUser?.username}
        </span>
      </div>

      {/* 🔥 HEADER */}
      <div className="px-6 py-4 flex items-center gap-4 bg-white/70 backdrop-blur-md border-b">

        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold shadow-sm">
          {otherUser?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {otherUser?.username}
          </h2>
          <p className="text-xs text-gray-400">
            Active conversation
          </p>
        </div>
      </div>

      {/* 🔥 CHAT BODY */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-gradient-to-b from-white/40 to-transparent">

        {messages.map((msg) => {
          const isMine = getId(msg.senderId) === userId;

          return (
            <div
              key={msg._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col max-w-[70%]">

                {/* NAME (only other user) */}
                {!isMine && (
                  <span className="text-[11px] text-gray-400 mb-1 ml-1">
                    {otherUser?.username}
                  </span>
                )}

                {/* MESSAGE */}
                <div
                  className={`
                    px-4 py-2.5 text-sm leading-relaxed
                    ${isMine
                      ? "bg-emerald-500/90 text-white rounded-2xl rounded-br-md shadow-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm"}
                  `}
                >
                  {msg.message}
                </div>

                {/* META */}
                <div
                  className={`text-[10px] mt-1 ${
                    isMine ? "text-right text-gray-400" : "text-gray-400"
                  }`}
                >
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}

                  {isMine && (
                    <span className="ml-1">
                      {msg.isRead ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}

   
       {/* 🔥 TYPING BAR (FIXED POSITION) */}
{ typingUser && (
  <div className="px-5 py-2 flex items-center gap-2 text-xs text-gray-500 bg-white border-t">
    <span>{typingUser}</span>

    <div className="flex gap-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </div>
  </div>
)}

      </div>

      {/* 🔥 INPUT */}
      <div className="px-4 py-3 bg-white/70 backdrop-blur-md border-t flex items-center gap-3">

        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 text-sm bg-gray-100/80 rounded-full outline-none 
          focus:ring-2 focus:ring-emerald-300 transition"
        />

        <button
          onClick={sendMessage}
          className="px-5 py-2.5 text-sm font-medium text-white 
          bg-gradient-to-r from-emerald-500 to-teal-500 
          rounded-full shadow-sm 
          hover:shadow-md hover:scale-[1.02] 
          active:scale-[0.97] transition-all"
        >
          Send
        </button>

      </div>
    </div>
  </div>
);
}
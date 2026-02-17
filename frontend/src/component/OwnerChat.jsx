import React, { useEffect, useState, useRef, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { AuthContext } from "../../contexts/AuthContext";

const SOCKET_URL = "http://localhost:5000";

export default function OwnerChat() {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const ownerId = user?._id;
  const ownerName = user?.username;

  const { chatId, buyerId, buyerName, landId } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // --- Socket connection ---
  useEffect(() => {
    if (!chatId) return;
    const s = io(SOCKET_URL);
    setSocket(s);

    s.emit("joinRoom", { room: chatId });

    s.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => s.disconnect();
  }, [chatId]);

  // --- Fetch messages from backend ---
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      try {
        const res = await axios.get(`${SOCKET_URL}/api/chat/${chatId}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [chatId]);

  // --- Scroll to bottom on new message ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send message ---
  const handleSend = async () => {
    if (!text.trim()) return;

    const msgPayload = {
      chatId,
      senderId: ownerId,
      senderName: ownerName,
      receiverId: buyerId,
      receiverName: buyerName,
      message: text.trim(),
    };

    try {
      await axios.post(`${SOCKET_URL}/api/chat/send`, msgPayload);

      socket?.emit("sendMessage", msgPayload);

      setMessages((prev) => [...prev, { ...msgPayload, timestamp: new Date().toISOString() }]);
      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-green-50 to-green-100 px-4 pb-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 flex flex-col h-[80vh]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 animate-pulse">
            Chat with {buyerName || "Buyer"}
          </h2>
          <span className="text-sm text-gray-500">{ownerName}</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 italic mt-8">No messages yet. Start the conversation!</p>
          )}
       {messages.map((m, i) => {
  const mine = m.senderId === ownerId;
  return (
    <div
      key={m._id || i}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`p-3 rounded-2xl max-w-[80%] break-words transition-shadow duration-200 ${
          mine
            ? "bg-rose-200 text-rose-900 hover:shadow-lg"
            : "bg-gray-100 text-gray-900 hover:shadow-md"
        }`}
        style={{
          boxShadow: mine
            ? "6px 6px 18px rgba(219, 39, 119, 0.15)"
            : "6px 6px 18px rgba(15,23,42,0.05)",
        }}
      >
        <div className="text-sm font-semibold mb-1">{m.senderName}</div>
        <div className="mt-1 text-gray-800">{m.message}</div>
        <div className="text-xs text-gray-400 mt-2 text-right">
          {new Date(m.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
})}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="mt-4 flex gap-3 items-center border-t border-gray-200 pt-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-2xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all duration-200 shadow-sm"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-rose-600 active:scale-95 transition-all duration-200 shadow-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

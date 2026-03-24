import React, { useEffect, useState, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const getId = (val) => {
  if (!val) return null;
  return typeof val === "object" ? val._id?.toString() : val.toString();
};

export default function ChatWindow() {
  const { chatId } = useParams();
  const { state } = useLocation();
  const { user } = useContext(AuthContext);

  const chat = state?.chat; // 🔥 coming from navigation
  const userId = getId(user?._id);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // 🚨 HANDLE REFRESH CASE
  if (!chat) {
    return (
      <div className="p-10 text-center text-red-500">
        Chat not loaded. Please go back and open again.
      </div>
    );
  }

  // 🔥 FETCH MESSAGES ONLY (NO CHAT API)
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/${chatId}/messages`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  useEffect(() => {
    if (!chatId) return;

    fetchMessages();

    // 🔥 AUTO REFRESH
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  // 🔥 SEND MESSAGE
  const sendMessage = async () => {
    if (!text.trim()) return;

    const ownerId = getId(chat.ownerId);
    const buyerId = getId(chat.buyerId);

    if (!ownerId || !buyerId) {
      console.error("Invalid chat users");
      return;
    }

    const receiverId =
      ownerId === userId ? buyerId : ownerId;

    try {
      const payload = {
        chatId,
        senderId: userId,
        receiverId,
        message: text,
      };

      const res = await axios.post(
        "http://localhost:5000/api/chat/send",
        payload
      );

      // 🔥 instant UI update
      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error("Send error:", err.response?.data || err);
    }
  };

  // 🔥 CORRECT USER NAME
  const otherUserName =
    getId(chat.ownerId) === userId
      ? chat.buyerName || "Buyer"
      : chat.ownerName || "Owner";

  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">
        Chat with {otherUserName}
      </h2>

      <div className="bg-white p-4 rounded shadow h-[60vh] overflow-y-auto">
        {messages.map((msg) => {
          const isMine = getId(msg.senderId) === userId;

          return (
            <div
              key={msg._id}
              className={`mb-3 flex ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  isMine
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
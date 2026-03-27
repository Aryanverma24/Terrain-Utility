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
    <div className="min-h-screen pt-24 px-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">
        Chat with {otherUser?.username}
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
                    : "bg-gray-200"
                }`}
              >
                {msg.message}

                {isMine && (
                  <div className="text-xs mt-1 text-right">
                    {msg.isRead
                      ? "✓✓ Seen"
                      : msg.delivered
                      ? "✓✓"
                      : "✓"}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ✅ typing UI */}
        {typingUser && (
          <p className="text-sm text-gray-500">
            {typingUser} is typing...
          </p>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={handleInputChange}  // ✅ FIXED
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
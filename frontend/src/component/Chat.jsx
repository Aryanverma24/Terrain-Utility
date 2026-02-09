// components/Chat/ChatRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";

const socketUrl = "http://localhost:5000"; // adjust if needed
let socket;

export default function ChatRoom({
  roomId,         // string room id (use same convention on buyer & owner: `${landId}-${buyerId}`)
  landId,         // optional
  currentUserId,
  currentUserName,
  otherUserId,
  otherUserName,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingFrom, setTypingFrom] = useState(null);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    if (!roomId || !currentUserId) return;

    socket = io(socketUrl, { autoConnect: true });
    socket.emit("joinRoom", { room: roomId });

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ senderName }) => {
      setTypingFrom(senderName);
      setTimeout(() => setTypingFrom(null), 1500);
    });

    // fetch history
    (async () => {
      try {
        const res = await axios.get(`/api/messages/land/${roomId}`);
        // res may be array or { messages: [] } depending on backend — we return array
        const data = res.data || [];
        setMessages(Array.isArray(data) ? data : data.messages || []);
      } catch (err) {
        console.error("fetch messages:", err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      socket.off("message");
      socket.off("typing");
      socket.disconnect();
    };
  }, [roomId, currentUserId]);

  useEffect(() => {
    // scroll to bottom on new message
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const messageData = {
      room: roomId,
      landId,
      senderId: currentUserId,
      senderName: currentUserName,
      receiverId: otherUserId,
      receiverName: otherUserName,
      message: trimmed,
    };

    try {
      // Optimistic UI
      setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);
      setText("");

      // Emit socket (server will also persist and re-emit)
      socket.emit("sendMessage", messageData);

      // Save via REST as fallback / authoritative
      await axios.post("/api/messages", messageData);
    } catch (err) {
      console.error("sendMessage error", err);
      toast.error("Failed to send message.");
    }
  };

  const handleTyping = (val) => {
    setText(val);
    if (!socket) return;
    socket.emit("typing", { room: roomId, senderName: currentUserName });
  };

  return (
    <div className="pt-20 min-h-screen bg-mintGreen px-4">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Chat with {otherUserName}</h2>
              {typingFrom && <p className="text-sm text-gray-500">{typingFrom} is typing...</p>}
            </div>
            <div className="text-sm text-gray-500">Room: {roomId}</div>
          </div>

          <div ref={listRef} className="space-y-3 overflow-y-auto max-h-[60vh] p-2 mb-4">
            {loading ? (
              <p className="text-center text-gray-500">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet</p>
            ) : (
              messages.map((m, i) => {
                const mine = String(m.senderId) === String(currentUserId);
                return (
                  <div key={m._id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-xl px-4 py-2 max-w-[75%] break-words shadow-sm
                        ${mine ? "bg-rose-100 text-rose-900" : "bg-gray-100 text-gray-900"}`}
                    >
                      <div className="text-sm font-medium mb-1">{mine ? "You" : m.senderName}</div>
                      <div className="text-base">{m.message}</div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {new Date(m.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

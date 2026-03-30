import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../contexts/AuthContext";
import { io } from "socket.io-client";
import { getFileUrl } from "../../../../backend/utils/getFileUrl";

const socket = io("http://localhost:5000");

const getId = (val) => {
  if (!val) return null;
  return typeof val === "object" ? val._id?.toString() : val.toString();
};



export default function ChatWindow({ chat: propChat }) {
  const { user } = useContext(AuthContext);
  const userId = getId(user?._id);

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [chat, setChat] = useState(propChat || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState("");

  const effectiveChatId = chat?._id;

  // Fetch chat if not passed as prop (optional, fallback)
  useEffect(() => {
    if (!effectiveChatId) return;
    if (chat) return;

    const fetchChat = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/${effectiveChatId}`);
        setChat(res.data);
      } catch (err) {
        console.error("❌ ChatWindow | Error fetching chat:", err);
      }
    };

    fetchChat();
  }, [effectiveChatId, chat]);

  // Socket setup and message handling remains identical
  useEffect(() => {
    if (!effectiveChatId) return;

    socket.emit("joinRoom", { room: effectiveChatId });

    const handleHistory = (history) => setMessages(history);
    const handleMessage = (msg) =>
      setMessages((prev) => (prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]));
    const handleTyping = ({ senderName }) => setTypingUser(senderName);
    const handleStopTyping = () => setTypingUser("");
    const handleRead = () =>
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));

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
  }, [effectiveChatId]);

  // Mark messages as read
  useEffect(() => {
    if (!effectiveChatId || !userId) return;
    socket.emit("markAsRead", { chatId: effectiveChatId, userId });
  }, [effectiveChatId, userId]);

  // Fetch messages fallback
  useEffect(() => {
    if (!effectiveChatId) return;

    axios
      .get(`http://localhost:5000/api/chat/${effectiveChatId}/messages`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("❌ ChatWindow | Error fetching messages fallback:", err));
  }, [effectiveChatId]);

  // sendMessage, typing, scroll logic remain the same

  // Send message
  const sendMessage = () => {
    if (!text.trim() || !chat) return;

    const receiver = chat.participants.find((p) => getId(p._id || p) !== userId);
   

    socket.emit("sendMessage", {
      chatId: effectiveChatId,
      room: effectiveChatId,
      senderId: userId,
      senderName: user.username,
      receiverId: getId(receiver._id || receiver),
      receiverName: receiver.username,
      message: text,
    });

    setText("");
    socket.emit("stopTyping", { room: effectiveChatId });
  };

  // Typing input handler
  const handleInputChange = (e) => {
    setText(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);


    socket.emit("typing", { room: effectiveChatId, senderName: user.username });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { room: effectiveChatId });
    }, 1000);
  };

  // Scroll to bottom
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
     
    }
  }, [messages, typingUser]);

  const otherUser = chat?.participants?.find((p) => getId(p._id || p) !== userId);

  if (!chat) return <div>Loading chat...</div>;

  return (
    <div className="flex justify-center items-start min-h-screen pt-24 pb-6 bg-gradient-to-br from-[#f8fafc] to-[#eef2f7] px-4">
      <div className="w-full max-w-3xl h-[88vh] flex flex-col rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <div className="text-center text-xs text-gray-500 py-2 bg-white/60 border-b">
          You are chatting with <span className="font-semibold text-gray-700">{otherUser?.username}</span>
        </div>

        {chat.chatType === "consultation" && (
          <div className="p-2 bg-yellow-100 text-xs text-gray-600 text-center">
            ⚖️ This is a consultation chat. Start legal process to proceed further.
          </div>
        )}

        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-gradient-to-b from-white/40 to-transparent">
          {messages.map((msg) => {
            const isMine = getId(msg.senderId) === userId;
            return (
              <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className="flex flex-col max-w-[70%]">
                  {!isMine && <span className="text-[11px] text-gray-400 mb-1 ml-1">{otherUser?.username}</span>}
                  <div className={`px-4 py-2.5 text-sm leading-relaxed ${isMine ? "bg-emerald-500/90 text-white rounded-2xl rounded-br-md shadow-sm" : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm"}`}>
                    {msg.message}
                  </div>
                  <div className={`text-[10px] mt-1 ${isMine ? "text-right text-gray-400" : "text-gray-400"}`}>
                    {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {isMine && <span className="ml-1">{msg.isRead ? "✓✓" : "✓"}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {typingUser && (
            <div className="px-5 py-2 flex items-center gap-2 text-xs text-gray-500 bg-yellow-100 border-t mb-10">
              <span>{typingUser}</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-white/70 backdrop-blur-md border-t flex items-center gap-3">
          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 text-sm bg-gray-100/80 rounded-full outline-none focus:ring-2 focus:ring-emerald-300 transition"
          />
          <button
            onClick={sendMessage}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.97] transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
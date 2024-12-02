import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Chat = () => {
  const { landId, buyerId, ownerName } = useParams();
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/${landId}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to fetch messages.");
      }
    };

    if (landId) fetchMessages();
  }, [landId]);

  const fetchReplies = async (messageId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/reply/${messageId}`);
      setReplies((prev) => ({
        ...prev,
        [messageId]: response.data.replies,
      }));
    } catch (error) {
      console.error(`Error fetching replies for message ${messageId}:`, error);
      toast.error("Failed to fetch replies.");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/messages`,
        { landId, buyerId, ownerId, message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessages([...messages, { message, senderId: buyerId, landId }]);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message.");
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Chat with {ownerName}</h2>
      <div className="flex flex-col space-y-4 mb-4 overflow-y-auto h-96 p-4 border-b border-gray-300">
        {messages.map((msg) => (
          <div key={msg._id} className="flex flex-col">
            {/* Message Display */}
            <div className={`flex ${msg.senderId === buyerId ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.senderId === buyerId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                <p>{msg.message}</p>
              </div>
            </div>

            {/* Replies Section */}
            {replies[msg._id] && (
              <div className="ml-6 mt-2">
                {replies[msg._id].map((reply) => (
                  <div key={reply._id} className="bg-gray-100 p-2 rounded-lg text-sm mb-1">
                    {reply.message}
                  </div>
                ))}
              </div>
            )}

            {/* "View Replies" Button */}
            {!replies[msg._id] && (
              <button
                onClick={() => fetchReplies(msg._id)}
                className="text-blue-500 text-sm self-start mt-2"
              >
                View Replies
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Send Message Section */}
      <div className="flex items-center space-x-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          rows="3"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={handleSendMessage}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// OwnerChats Component
const OwnerChats = () => {
  const [conversations, setConversations] = useState([]); // To store all conversations
  const [selectedChat, setSelectedChat] = useState(null); // To store the current selected conversation
  const [message, setMessage] = useState(""); // To store the current message input

  // Fetch conversations for the owner when the component mounts
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/chat/owner", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setConversations(data.conversations); // Set the conversations state with fetched data
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };

    fetchConversations();
  }, []);

  // Handle the selection of a specific chat
  const handleChatSelection = (chat) => {
    setSelectedChat(chat); // Set the selected conversation
  };

  // Handle sending a message from the owner
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Don't send empty messages

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `http://localhost:5000/api/chat/owner/${selectedChat.userId}`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the selected chat with the new message
      setSelectedChat({
        ...selectedChat,
        messages: [...selectedChat.messages, data.newMessage],
      });
      setMessage(""); // Clear the input field
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="owner-chats-container">
      <div className="conversations-list">
        <h2 className="text-xl font-semibold">Conversations</h2>
        {conversations.length > 0 ? (
          <ul>
            {conversations.map((conversation) => (
              <li
                key={conversation.userId}
                className="conversation-item"
                onClick={() => handleChatSelection(conversation)}
              >
                <div className="conversation-summary">
                  <h3>{conversation.buyerName}</h3>
                  <p>{conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1].text : "No messages yet"}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No conversations available.</p>
        )}
      </div>

      {/* Chat with selected buyer */}
      {selectedChat && (
        <div className="chat-window">
          <div className="chat-header">
            <h2>Chat with {selectedChat.buyerName}</h2>
          </div>
          <div className="chat-messages">
            {selectedChat.messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === "owner" ? "owner" : "buyer"}`}
              >
                <p><strong>{msg.sender === "owner" ? "You" : "Buyer"}:</strong> {msg.text}</p>
              </div>
            ))}
          </div>

          {/* Message input and send button */}
          <form onSubmit={handleSendMessage} className="chat-form">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply..."
              className="chat-input"
            />
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OwnerChats;

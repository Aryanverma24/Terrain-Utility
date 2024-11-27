import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

// Chat Component
const Chat = () => {
  const { ownerId } = useParams(); // Get the ownerId from the URL
  const [messages, setMessages] = useState([]); // To store chat messages
  const [message, setMessage] = useState(""); // To store the current message input
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState(""); // For error handling

  // Fetch messages when the component mounts or ownerId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/chat/${ownerId}`);
        setMessages(data.messages); // Assuming response has a 'messages' array
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch messages.");
        setLoading(false);
      }
    };

    fetchMessages();
  }, [ownerId]);

  // Handle form submission (send message)
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    if (!message.trim()) return; // Don't send empty messages

    try {
      // Send the message to the server
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `http://localhost:5000/api/chat/${ownerId}`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Authorization header with JWT
          },
        }
      );

      // Update messages array with the new message
      setMessages([...messages, data.newMessage]);
      setMessage(""); // Clear the input field
    } catch (err) {
      setError("Failed to send message.");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="text-2xl">Chat with Land Owner</h1>
      </div>
      {loading ? (
        <div>Loading messages...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender === "owner" ? "owner" : "user"}`}>
              <p><strong>{msg.sender === "owner" ? "Owner" : "You"}:</strong> {msg.text}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default Chat;

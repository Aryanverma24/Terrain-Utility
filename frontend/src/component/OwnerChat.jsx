import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const OwnerChat = ({ landId, ownerId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = io("http://localhost:5000"); // Backend URL

  useEffect(() => {
    // Join the room on component mount
    socket.emit("join-room", { roomId: landId });

    // Listen for incoming messages
    socket.on("receive-message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    // Clean up on component unmount
    return () => {
      socket.disconnect();
    };
  }, [landId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("send-message", {
        roomId: landId,
        sender: ownerId,
        message: newMessage,
      });
      setMessages((prev) => [...prev, { sender: ownerId, message: newMessage }]);
      setNewMessage(""); // Clear input field
    }

  };

  
  return (
    <div >
      <h2>Chat for Land ID: {landId}</h2>
      <div className="chat-messages">
      
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default OwnerChat;

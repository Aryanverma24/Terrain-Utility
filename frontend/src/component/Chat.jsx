import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";  // Add this import for axios

const Chat = () => {
  const location = useLocation();
  const { room, senderId, receiverId, landDetails } = location.state || {};

  const [messages, setMessages] = useState([]);  // State to hold messages
  const [newMessage, setNewMessage] = useState("");  // State for input
  const [socket, setSocket] = useState(null);  // Socket state

  // Establish socket connection and join the room
  useEffect(() => {
    if (room && senderId && receiverId) {
      const socketInstance = io("http://localhost:5000");
      socketInstance.emit("joinRoom", { room, senderId, receiverId });

      setSocket(socketInstance);

      // Listen for incoming messages
      socketInstance.on("message", (receivedMessage) => {
        if (receivedMessage?.message && receivedMessage?.senderId) {
          setMessages((prevMessages) => [...prevMessages, receivedMessage]); // Update messages with new message
        }
      });

      return () => {
        socketInstance.disconnect();  // Clean up on unmount
      };
    }
  }, [room, senderId, receiverId]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageToSend = {
        senderId,
        receiverId,
        message: newMessage,
        timestamp: new Date(),
      };

      // Emit the message to the server
      socket.emit("sendMessage", { room, senderId, receiverId, message: newMessage });

      // Clear the input field after sending the message
      setNewMessage("");
    }
  };

  // Fetch messages when the component is mounted
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/land/${room}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.status === 200) {
          // Set the fetched messages to state (to show previous messages)
          setMessages(response.data); 
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (room) {
      fetchMessages();  // Fetch messages when room is available
    }
  }, [room]); // Re-run when room changes

  // Log messages to verify updates
  useEffect(() => {
    console.log("Messages State:", messages); // Log the messages state to see the changes
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg flex flex-col">
        <div className="bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h1 className="text-xl font-bold">Chat with {landDetails?.ownerName || "Owner"}</h1>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50" style={{ maxHeight: "70vh" }}>
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.senderId === senderId ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs p-2 rounded-lg text-white ${
                    msg.senderId === senderId ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No messages found.</p> // Display when there are no messages
          )}
        </div>

        <div className="flex items-center p-4 bg-white border-t">
          <textarea
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          ></textarea>
          <button
            onClick={handleSendMessage}
            className="ml-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

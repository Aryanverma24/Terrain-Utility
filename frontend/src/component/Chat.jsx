import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Chat = () => {
  const { landId, buyerId, ownerName } = useParams();  // Access parameters
  const [land, setLand] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    console.log("landId:", landId);
    console.log("buyerId:", buyerId);
    console.log("ownerName:", ownerName);

    if (!landId || !buyerId || !ownerName) {
      toast.error("Invalid parameters. Cannot load chat.");
      return;
    }

    const fetchOwnerDetails = async () => {
      try {
        console.log("Fetching owner details for:", ownerName);

        // Fetch user ID based on username (ownerName)
        const response = await axios.get(`http://localhost:5000/api/users/id/${ownerName}`);
        console.log("Owner details fetched:", response.data);

        // Save the user ID (ownerId) from the response
        setOwnerId(response.data.userId);
      } catch (error) {
        console.error("Error fetching owner details:", error.response?.data || error.message);
        toast.error("Unable to fetch owner details.");
      } finally {
        setLoading(false);  // Set loading to false after fetching data
      }
    };

    // Fetch owner details if parameters are valid
    if (landId && buyerId && ownerName) {
      fetchOwnerDetails();
    } else {
      toast.error("Missing required parameters.");
      setLoading(false); // Set loading to false if parameters are invalid
    }
  }, [landId, buyerId, ownerName]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
  
    try {
      console.log("Sending message:", { landId, buyerId, ownerId, message }); // Log the data being sent
  
      await axios.post(
        `http://localhost:5000/api/messages`,
        {
          landId, 
          buyerId,
          ownerId,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      setMessages([...messages, { message, senderId: buyerId,landId }]);
      setMessage(""); // Clear the input field
    } catch (error) {
      toast.error("Failed to send message.");
      console.error("Error sending message:", error); // Log the error on the client side
    }
  };
  
  if (loading) return <div className="text-center text-xl font-semibold mt-10">Loading chat...</div>;  // Show loading message until data is fetched

  return (
    <div className="flex flex-col max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Chat with {ownerName}</h2>
      
      <div className="flex flex-col space-y-4 mb-4 overflow-y-auto h-96 p-4 border-b border-gray-300">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.senderId === buyerId ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs p-3 rounded-lg ${msg.senderId === buyerId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
            >
              <p>{msg.message}</p>
            </div>
          </div>
        ))}
      </div>

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

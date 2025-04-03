import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MessagePage = ({ landId }) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/messages/land/${landId}`);
        console.log("Fetched messages:", response.data); // Log the response for debugging
        setMessages(response.data || []); // Ensure messages array is set correctly
      } catch (err) {
        setError("Error fetching messages");
        console.error("Error fetching messages:", err);
      }
    };

    if (landId) fetchMessages();
  }, [landId]);

  return (
    <div className='pt-[6rem] bg-mintGreen min-h-screen text-black font-semibold text-lg px-6 pb-[1rem]'>
      <h1>Messages for Land {landId}</h1>
      {error && <p className="error">{error}</p>}
      <div>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg._id} className="message">
              <p><strong>{msg.senderId}:</strong> {msg.message}</p>
            </div>
          ))
        ) : (
          <p>No messages available for this land.</p>
        )}
      </div>
    </div>
  );
};

export default MessagePage;

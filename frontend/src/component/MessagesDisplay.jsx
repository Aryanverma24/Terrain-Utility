// MessagesDisplay.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MessagesDisplay = ({ selectedUserId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUserId) return; // No user selected

      try {
        const response = await axios.get(`http://localhost:5000/api/messages/${selectedUserId}`);
        setMessages(response.data); // Assuming the response contains messages
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedUserId]);

  return (
    <div className="flex-1 p-4 bg-white">
      {selectedUserId ? (
        <>
          <div className="mb-4 text-lg font-semibold">Chat with {selectedUserId}</div>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`p-3 rounded-lg ${message.senderId === selectedUserId ? 'bg-gray-200' : 'bg-blue-100'} max-w-xs`}>
                <p>{message.text}</p>
                <span className="text-sm text-gray-500">{message.timestamp}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">Select a user to start chatting</p>
      )}
    </div>
  );
};

export default MessagesDisplay;

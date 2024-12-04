import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chat = ({ landId }) => {
  console.log('Land ID:', landId);
  const [messages, setMessages] = useState([]);  // Ensure it's an empty array by default
  const [replies, setReplies] = useState([]);     // Initialize replies as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch messages for the land
  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${landId}`);
      if (Array.isArray(response.data)) {
        setMessages(response.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError('Failed to fetch messages');
    }
  };

  // Fetch replies for the land
  const fetchReplies = async () => {
    try {
      const response = await axios.get(`/api/replies/${landId}`);
      // Ensure replies is always treated as an array
      if (Array.isArray(response.data)) {
        setReplies(response.data);
      } else {
        setReplies([]); // Set to empty array if the data isn't an array
      }
    } catch (err) {
      setError('Failed to fetch replies');
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchReplies();
    
  }, [landId]);

  return (
    <div>
      <h2>Chat for Land ID: {landId}</h2>

      {/* Display error message if fetching fails */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* If no messages are found, show the replies */}
      {messages.length === 0 ? (
        <div>
          <h3>No messages found for this land. Here are the replies:</h3>

          {/* Display replies if there are any */}
          {replies.length === 0 ? (
            <p>No replies available yet.</p>
          ) : (
            <div>
              <h4>Replies</h4>
              {replies.map((reply) => (
                <div key={reply._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
                  <p><strong>{reply.userId}:</strong></p>
                  <p>{reply.replyText}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Messages:</h3>
          {messages.map((message) => (
            <div key={message._id}>
              <p>{message.text}</p>
              {message.replies && message.replies.length > 0 && (
                <div style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <h5>Replies:</h5>
                  {message.replies.map((reply) => (
                    <div key={reply._id} style={{ padding: '5px', borderBottom: '1px solid #ddd' }}>
                      <p>{reply.replyText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chat;

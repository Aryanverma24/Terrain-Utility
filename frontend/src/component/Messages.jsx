import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const Messages = () => {
  const { chatId } = useParams();  // Get chatId from the URL
  const [messages, setMessages] = useState([]); // Store the messages
  const [newMessage, setNewMessage] = useState(''); // Store the new message
  const [senderId, setSenderId] = useState('');  // Get the senderId from context or JWT
  const [receiverId, setReceiverId] = useState(''); // The ownerId or userId as receiver

  useEffect(() => {
    // Fetch messages for the given chatId
    axios.get(`http://localhost:5000/api/messages/${chatId}`)
      .then((response) => {
        setMessages(response.data);  // Set the messages in state
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
      });
  }, [chatId]);

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value); // Update newMessage on input change
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        chatId,
        senderId,  // The sender (owner or user)
        receiverId,  // The other person (buyer or owner)
        content: newMessage,  // The content of the new message
      };

      // Send the message to the backend
      axios.post('http://localhost:5000/api/messages', messageData)
        .then((response) => {
          setMessages((prevMessages) => [...prevMessages, response.data]); // Update state with the new message
          setNewMessage(''); // Clear the input field
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    }
  };

  return (
    <div>
      <h1>Messages</h1>
      <div className="messages-list">
        {/* Display the list of messages */}
        {messages.length > 0 ? (
          messages.map((message) => (
            <div key={message._id} className="message">
              <p><strong>{message.senderId}</strong>: {message.content}</p>
              <small>{new Date(message.timestamp).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>No messages yet...</p>
        )}
      </div>

      {/* Message Input Section */}
      <div className="reply-section">
        <textarea 
          value={newMessage} 
          onChange={handleMessageChange} 
          placeholder="Write a reply..." 
        />
        <button onClick={handleSendMessage}>Send Reply</button>
      </div>

      {/* Navigation Link to go back or check received messages */}
      <div>
        <Link to={`/messages/${chatId}`} className="check-received-msg">
          Check Received Messages
        </Link>
      </div>
    </div>
  );
};

export default Messages;

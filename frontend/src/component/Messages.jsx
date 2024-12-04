import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Messages = () => {
  const { landId } = useParams(); // Get landId from the URL params
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    console.log('Land ID:', landId);

    if (!landId) {
      setError('Land ID is missing');
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/land/${landId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        setError('Error fetching messages');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [landId]);

  const handleReplyChange = (e) => {
    setReplyContent(e.target.value); // Update reply content state
  };

  const handleReplySubmit = async (messageId) => {
    if (!replyContent) {
      alert('Reply content is required');
      return;
    }
  
    try {
      const token = localStorage.getItem('token'); // or sessionStorage, wherever you store the token
  
      if (!token) {
        throw new Error('No authorization token found');
      }
  
      const response = await axios.post(
        `http://localhost:5000/api/messages/reply/${messageId}`,
        { replyContent }, // Only sending replyContent; senderId is handled in the backend
        {
          headers: {
            Authorization: `Bearer ${token}` // Include token in the Authorization header
          }
        }
      );
  
      console.log('Reply submitted successfully:', response.data);
      toast.success('Reply submitted successfully!');
      setReplyContent(''); // Clear the reply content after submission
      setReplyingTo(null); // Close the reply form
  
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert(`Failed to submit reply: ${error.response ? error.response.data.error : error.message}`);
    }
  };
  
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent(''); // Clear the content when canceling
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h3 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
        Messages for Land ID: {landId}
      </h3>

      {error && <p className="text-center text-red-500">{error}</p>}

      {messages.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li key={message._id} className="bg-white rounded-lg shadow-lg p-4 hover:bg-gray-50 transition duration-300 ease-in-out">
              <div className="flex flex-col space-y-2">
                <div>
                  <strong className="text-lg text-gray-800">Sender ID:</strong>
                  <span className="text-gray-600">{message.senderId}</span>
                </div>
                <div>
                  <strong className="text-lg text-gray-800">Message:</strong>
                  <p className="text-gray-600">{message.content}</p>
                </div>
                <div>
                  <strong className="text-lg text-gray-800">Created At:</strong>
                  <span className="text-gray-600">{new Date(message.createdAt).toLocaleString()}</span>
                </div>

                {/* Reply Form */}
                {replyingTo === message._id ? (
                  <div className="mt-4">
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows="4"
                      value={replyContent}
                      onChange={handleReplyChange}
                      placeholder="Type your reply here..."
                    ></textarea>
                    <button
                      className="mt-2 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      onClick={() => handleReplySubmit(message._id)} // Pass message._id to handleReplySubmit
                    >
                      Send Reply
                    </button>
                    <button
                      className="mt-2 w-full py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      onClick={handleCancelReply}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="mt-4 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
                    onClick={() => setReplyingTo(message._id)} // Set replyingTo to the message being replied to
                  >
                    Reply
                  </button>
                )}
              </div>

              {/* Display Replies */}
              {message.replies.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold text-gray-700">Replies:</h4>
                  {message.replies.map((reply, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-md shadow-sm">
                      <p className="text-gray-600">{reply.reply}</p> <p>{reply.replyContent}</p> {/* Display reply content */}
                      <span className="text-gray-400 text-sm">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Messages;

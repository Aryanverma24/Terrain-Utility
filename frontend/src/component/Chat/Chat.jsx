import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import socket from '../../../utils/socket';

export default function ChatRoom({
  chat, // ✅ FULL CHAT OBJECT
  currentUserId,
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingFrom, setTypingFrom] = useState(null);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  const chatId = chat?._id;

  // ✅ GET OTHER USER NAME CORRECTLY
  const otherUserName =
    String(chat?.buyerId) === String(currentUserId) ? chat?.ownerName : chat?.buyerName;

  const otherUserId =
    String(chat?.buyerId) === String(currentUserId) ? chat?.ownerId : chat?.buyerId;

  useEffect(() => {
    if (!chatId || !currentUserId) return;

    // ✅ JOIN USING chatId
    socket.emit('joinRoom', { room: chatId });

    socket.on('message', (msg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => String(m._id) === String(msg._id));

        if (exists) return prev; // ✅ prevent duplicate

        return [...prev, msg];
      });
    });
    socket.on('typing', ({ senderName }) => {
      setTypingFrom(senderName);
      setTimeout(() => setTypingFrom(null), 1500);
    });

    // ✅ FETCH FROM CORRECT API
    (async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/${chatId}/messages`);
        setMessages(res.data || []);
      } catch (err) {
        console.error('fetch messages:', err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.disconnect();
    };
  }, [chatId, currentUserId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const messageData = {
      chatId,
      senderId: currentUserId,
      senderName: otherUserName === chat.ownerName ? chat.buyerName : chat.ownerName,
      receiverId: otherUserId,
      receiverName: otherUserName,
      message: trimmed,
    };

    try {
      // ✅ Optimistic UI
      setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);

      setText('');

      // ✅ SOCKET EMIT
      socket.emit('sendMessage', messageData);

      // ✅ SAVE TO DB
      await axios.post('http://localhost:5000/api/chat/send', messageData);
    } catch (err) {
      console.error('sendMessage error', err);
      toast.error('Failed to send message.');
    }
  };

  const handleTyping = (val) => {
    setText(val);
    socket.emit('typing', {
      room: chatId,
      senderName:
        String(chat?.buyerId) === String(currentUserId)
          ? chat?.buyerName
          : chat?.ownerName,
    });
  };

  return (
    <div className="pt-20 min-h-screen bg-mintGreen px-4">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Chat with {otherUserName || 'User'}
              </h2>
              {typingFrom && (
                <p className="text-sm text-gray-500">{typingFrom} is typing...</p>
              )}
            </div>
            <div className="text-sm text-gray-500">Chat ID: {chatId}</div>
          </div>

          <div ref={listRef} className="space-y-3 overflow-y-auto max-h-[60vh] p-2 mb-4">
            {loading ? (
              <p className="text-center text-gray-500">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet</p>
            ) : (
              messages.map((m, i) => {
                const mine = String(m.senderId) === String(currentUserId);

                return (
                  <div
                    key={m._id || i}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-xl px-4 py-2 max-w-[75%] break-words shadow-sm
                      ${
                        mine ? 'bg-rose-100 text-rose-900' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {mine ? 'You' : m.senderName}
                      </div>
                      <div className="text-base">{m.message}</div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {new Date(m.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

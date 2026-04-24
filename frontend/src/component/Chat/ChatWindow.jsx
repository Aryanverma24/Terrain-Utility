import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../../contexts/AuthContext';
import { io } from 'socket.io-client';
import { getFileUrl } from '../../../../backend/utils/getFileUrl';
import socket from '../../../utils/socket';

const getId = (val) => {
  if (!val) return null;
  return typeof val === 'object' ? val._id?.toString() : val.toString();
};

export default function ChatWindow({ chat: propChat }) {
  const { user } = useContext(AuthContext);
  const userId = getId(user?._id);

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [chat, setChat] = useState(propChat || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState('');
  //terminataion   states
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminationReasonType, setTerminationReasonType] = useState('');
  const [terminationReasonText, setTerminationReasonText] = useState('');
  const [terminating, setTerminating] = useState(false);

  const effectiveChatId = chat?._id;
  useEffect(() => {
    if (!chat?._id) return;

    socket.emit('joinChat', chat._id);

    return () => {
      socket.emit('leaveChat', chat._id);
    };
  }, [chat._id]);

  // Fetch chat if not passed as prop (optional, fallback)
  useEffect(() => {
    if (!effectiveChatId) return;

    const fetchChat = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/${effectiveChatId}`);
        setChat(res.data);
      } catch (err) {
        console.error('❌ ChatWindow | Error fetching chat:', err);
      }
    };

    fetchChat();
  }, [effectiveChatId]);
  // Socket setup and message handling remains identical
  useEffect(() => {
    if (!effectiveChatId) return;

    socket.emit('joinRoom', { room: effectiveChatId });

    const handleHistory = (history) => setMessages(history);
    const handleMessage = (msg) =>
      setMessages((prev) =>
        prev.find((m) => m._id === msg._id) ? prev : [...prev, msg],
      );
    const handleTyping = ({ senderName }) => setTypingUser(senderName);
    const handleStopTyping = () => setTypingUser('');
    const handleRead = () =>
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));

    socket.on('messageHistory', handleHistory);
    socket.on('message', handleMessage);
    socket.on('typing', handleTyping);
    socket.on('stopTyping', handleStopTyping);
    socket.on('messagesRead', handleRead);

    return () => {
      socket.off('messageHistory', handleHistory);
      socket.off('message', handleMessage);
      socket.off('typing', handleTyping);
      socket.off('stopTyping', handleStopTyping);
      socket.off('messagesRead', handleRead);
    };
  }, [effectiveChatId]);

  // Mark messages as read
  useEffect(() => {
    if (!effectiveChatId || !userId) return;
    socket.emit('markAsRead', { chatId: effectiveChatId, userId });
  }, [effectiveChatId, userId]);

  useEffect(() => {
    if (!chat?._id) return;

    const handleChatTerminated = (data) => {
      console.log('🔥 ChatWindow termination event:', data);

      const { chatIds } = data;

      if (!chatIds || chatIds.length === 0) return;

      const isThisChatTerminated = chatIds.includes(getId(chat._id));

      if (!isThisChatTerminated) return;

      console.log('❌ THIS CHAT TERMINATED');

      setChat((prev) => ({
        ...prev,
        status: 'terminated',
      }));

      setMessages([]); // 🔥 HARD STOP
    };

    socket.on('chatTerminated', handleChatTerminated);

    return () => {
      socket.off('chatTerminated', handleChatTerminated);
    };
  }, [chat?._id]);

  //function to handle terminataion of chat
  const handleTerminateChat = async () => {
    if (!terminationReasonType) {
      alert('Please select a reason');
      return;
    }

    try {
      setTerminating(true);

      const res = await axios.put(
        `http://localhost:5000/api/chat/${chat._id}/terminate`,
        {
          reasonType: terminationReasonType,
          reasonText: terminationReasonText,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      // ✅ Prefer backend response if available
      if (res?.data?.chat) {
        setChat(res.data.chat);
      } else {
        // ✅ Fallback: update locally (with FULL user object, not just ID)
        setChat((prev) => ({
          ...prev,
          status: 'terminated',
          terminatedBy: {
            _id: user._id,
            username: user.username,
          },
          terminatedAt: new Date(),
          terminationReasonType,
          terminationReasonText,
        }));
      }

      setShowTerminateModal(false);
    } catch (err) {
      console.error('Terminate error:', err);
    } finally {
      setTerminating(false);
    }
  };

  // Send message
  const sendMessage = () => {
    // 🛑 Basic guards
    if (!text.trim()) return;
    if (!chat) {
      console.log('❌ No chat found');
      return;
    }

    if (chat.status === 'terminated') {
      console.log('❌ Chat is terminated');
      return;
    }

    if (!effectiveChatId) {
      console.log('❌ Missing chatId');
      return;
    }

    const receiver = chat.participants.find((p) => getId(p._id || p) !== userId);

    if (!receiver) {
      console.log('❌ Receiver not found', chat.participants);
      return;
    }

    const payload = {
      chatId: effectiveChatId,
      room: effectiveChatId,
      senderId: userId,
      senderName: user?.username,
      receiverId: getId(receiver._id || receiver),
      receiverName: receiver.username,
      message: text.trim(),
    };

    // 🔥 DEBUG (VERY IMPORTANT)
    console.log('🚀 Sending message:', payload);

    socket.emit('sendMessage', payload);

    setText('');

    socket.emit('stopTyping', { room: effectiveChatId });
  };

  // Typing input handler
  const handleInputChange = (e) => {
    setText(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    socket.emit('typing', { room: effectiveChatId, senderName: user.username });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { room: effectiveChatId });
    }, 1000);
  };

  // Scroll to bottom
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typingUser]);

  const otherUser = chat?.participants?.find((p) => getId(p._id || p) !== userId);

  if (!chat) return <div>Loading chat...</div>;

  return (
    <div className="flex justify-center items-start h-full w-full bg-gradient-to-br from-[#f8fafc] to-[#eef2f7] px-4">
      <div className="w-full max-w-3xl h-full flex flex-col rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 bg-white/60 border-b">
          <div className="text-xs text-gray-500">
            You are chatting with{' '}
            <span className="font-semibold text-gray-700">{otherUser?.username}</span>
          </div>

          {chat.status === 'active' && (
            <button
              onClick={() => setShowTerminateModal(true)}
              className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
            >
              Terminate
            </button>
          )}
        </div>

        {/* CONSULTATION NOTICE */}
        {chat.chatType === 'consultation' && (
          <div className="p-2 bg-yellow-100 text-xs text-gray-600 text-center border-b">
            ⚖️ This is a consultation chat. Start legal process to proceed further.
          </div>
        )}

        {/* TERMINATED BANNER */}
        {chat.status === 'terminated' && (
          <div className="p-3 bg-red-50 text-red-600 text-xs text-center border-b">
            ❌ Chat terminated{' '}
            {chat.terminatedBy && (
              <>
                by <b>{chat.terminatedBy?.username || 'User'}</b>
              </>
            )}
            <br />
            Reason: {chat.terminationReasonType}
          </div>
        )}

        {/* MESSAGES */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-gradient-to-b from-white/40 to-transparent"
        >
          {messages.map((msg) => {
            const isMine = getId(msg.senderId) === userId;

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col max-w-[70%]">
                  {!isMine && (
                    <span className="text-[11px] text-gray-400 mb-1 ml-1">
                      {otherUser?.username}
                    </span>
                  )}

                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                      isMine
                        ? 'bg-emerald-500/90 text-white rounded-2xl rounded-br-md shadow-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm'
                    }`}
                  >
                    {msg.message}
                  </div>

                  <div
                    className={`text-[10px] mt-1 ${isMine ? 'text-right text-gray-400' : 'text-gray-400'}`}
                  >
                    {msg.createdAt &&
                      new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    {isMine && <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* TYPING */}
          {typingUser && chat.status === 'active' && (
            <div className="px-5 py-2 flex items-center gap-2 text-xs text-gray-500 bg-yellow-100 border-t mb-10">
              <span>{typingUser}</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="px-4 py-3 bg-white/70 backdrop-blur-md border-t flex items-center gap-3">
          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder={
              chat.status === 'terminated' ? 'Chat is closed' : 'Type a message...'
            }
            disabled={chat.status === 'terminated'}
            className="flex-1 px-4 py-2.5 text-sm bg-gray-100/80 rounded-full outline-none focus:ring-2 focus:ring-emerald-300 transition disabled:opacity-60"
          />

          <button
            onClick={sendMessage}
            disabled={chat.status === 'terminated'}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-full transition-all ${
              chat.status === 'terminated'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.02]'
            }`}
          >
            Send
          </button>
        </div>

        {/* TERMINATION MODAL */}
        {showTerminateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Terminate Chat</h2>

              <p className="text-sm text-gray-500 mb-4">
                This action will close the chat permanently.
              </p>

              <select
                value={terminationReasonType}
                onChange={(e) => setTerminationReasonType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
              >
                <option value="">Select Reason</option>
                <option value="deal_completed">Deal Completed</option>
                <option value="not_interested">Not Interested</option>
                <option value="no_response">No Response</option>
                <option value="spam">Spam</option>
                <option value="other">Other</option>
              </select>

              <textarea
                placeholder="Additional details (optional)"
                value={terminationReasonText}
                onChange={(e) => setTerminationReasonText(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTerminateModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleTerminateChat}
                  disabled={terminating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {terminating ? 'Terminating...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

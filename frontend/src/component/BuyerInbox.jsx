import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/authContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

const Inbox = () => {
  const { user } = useContext(AuthContext);
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="pt-20 h-screen flex">

      {/* 🔹 LEFT: CHAT LIST */}
      <div className="w-1/3 border-r bg-white overflow-y-auto">
        {/* ✅ ONLY CHANGE HERE */}
        <ChatList 
          apiEndpoint="buyer" 
          onSelectChat={setSelectedChat} 
        />
      </div>

      {/* 🔹 RIGHT: CHAT WINDOW */}
      <div className="w-2/3 bg-gray-50">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>

    </div>
  );
};

export default Inbox;
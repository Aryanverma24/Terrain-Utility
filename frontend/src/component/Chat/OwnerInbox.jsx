import React, { useState } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

const OwnerInbox = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="pt-20 h-screen flex">

      {/* 🔹 LEFT: CHAT LIST */}
      <div className="w-1/3 border-r bg-white overflow-y-auto">
        <ChatList 
          type="owner"   // ✅ FIXED
          onSelectChat={setSelectedChat}
        />
      </div>

      {/* 🔹 RIGHT: CHAT WINDOW */}
      <div className="w-2/3 bg-gray-50">
        {selectedChat ? (
          <ChatWindow chat={selectedChat} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to view messages
          </div>
        )}
      </div>

    </div>
  );
};

export default OwnerInbox;
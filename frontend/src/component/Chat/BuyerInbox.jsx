import React, { useContext, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import ChatList from "../Chat/ChatList";
import ChatWindow from "../Chat/ChatWindow";

const Inbox = () => {
  const { user } = useContext(AuthContext);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedSection, setSelectedSection] = useState("buyer");

  return (
    <div className="pt-20 h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-100 to-gray-200">

      {/* 🔹 LEFT / TOP: Buyer Chats */}
      <div className="md:w-1/2 w-full border-b md:border-b-0 md:border-r bg-white/90 backdrop-blur-md overflow-y-auto shadow-xl">

        {/* HEADER */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-5 border-b z-10">
          <h2 className="text-xl font-bold text-gray-800 tracking-wide">
            💬 Your Conversations
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Chats you've initiated with land owners
          </p>
        </div>

        <ChatList 
          type="buyer"   // ✅ FIXED
          onSelectChat={(chat) => { 
            setSelectedChat(chat); 
            setSelectedSection("buyer"); 
          }} 
        />
      </div>

      {/* 🔹 RIGHT / BOTTOM: Owner Inbox */}
      <div className="md:w-1/2 w-full bg-white/90 backdrop-blur-md overflow-y-auto shadow-xl">

        {/* HEADER */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-5 border-b z-10">
          <h2 className="text-xl font-bold text-gray-800 tracking-wide">
            📥 Buyer Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            People interested in your land listings
          </p>
        </div>

        <ChatList 
          type="owner"   // ✅ FIXED
          onSelectChat={(chat) => { 
            setSelectedChat(chat); 
            setSelectedSection("owner"); 
          }} 
        />
      </div>

      {/* 🔹 CHAT WINDOW */}
      {selectedChat && (
        <div className="absolute bottom-0 md:relative md:w-full md:flex-1 md:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 border-t md:border-t-0 md:border-l shadow-2xl">

          {/* CHAT HEADER */}
          <div className="p-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedSection === "buyer"
                  ? `Land Owner: ${selectedChat.name || "User"}`
                  : `Buyer: ${selectedChat.name || "User"}`}
              </h3>
              <p className="text-xs text-gray-500">
                {selectedSection === "buyer"
                  ? "You're discussing a property"
                  : "This user showed interest in your land"}
              </p>
            </div>

            {/* Status Dot */}
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          </div>

          {/* CHAT BODY */}
          <div className="p-4 h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            <ChatWindow chat={selectedChat} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
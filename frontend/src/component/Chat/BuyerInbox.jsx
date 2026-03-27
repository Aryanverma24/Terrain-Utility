import React, { useContext, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import ChatList from "../Chat/ChatList";
import ChatWindow from "../Chat/ChatWindow";

const Inbox = () => {
  const { user } = useContext(AuthContext);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedSection, setSelectedSection] = useState("buyer");

    return (
  <div className="pt-20 h-screen flex flex-col md:flex-row bg-[#f4f7f6]">

    {/* 🔹 LEFT PANEL */}
    <div className="md:w-1/2 w-full border-r bg-white flex flex-col shadow-sm">

      {/* HEADER */}
      <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Conversations
          </h2>
          <p className="text-xs text-gray-500">
            Chats with land owners
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 font-medium">
          Buyer
        </span>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto divide-y">
        <ChatList 
          type="buyer"
          onSelectChat={(chat) => { 
            setSelectedChat(chat); 
            setSelectedSection("buyer"); 
          }} 
        />
      </div>
    </div>

    {/* 🔹 RIGHT PANEL */}
    <div className="md:w-1/2 w-full bg-white flex flex-col shadow-sm">

      <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Buyer Requests
          </h2>
          <p className="text-xs text-gray-500">
            Interested buyers
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
          Owner
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y">
        <ChatList 
          type="owner"
          onSelectChat={(chat) => { 
            setSelectedChat(chat); 
            setSelectedSection("owner"); 
          }} 
        />
      </div>
    </div>

    {/* 🔹 CHAT WINDOW */}
    {selectedChat && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">

        {/* PANEL */}
        <div className="relative w-full max-w-2xl h-[85%] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden animate-fadeUp">

          {/* HEADER */}
          <div className="px-5 py-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md">

            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold shadow">
                {selectedChat.name?.charAt(0) || "U"}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {selectedSection === "buyer"
                    ? selectedChat.name || "Land Owner"
                    : selectedChat.name || "Buyer"}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedSection === "buyer"
                    ? "Property discussion"
                    : "Interested in your listing"}
                </p>
              </div>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500">Online</span>
            </div>
          </div>

          {/* CHAT BODY */}
          <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
            <ChatWindow chat={selectedChat} />
          </div>

          {/* INPUT AREA PLACEHOLDER (if ChatWindow doesn't have one visually strong) */}
          <div className="p-3 border-t bg-white/80 backdrop-blur-md">
            <div className="text-xs text-gray-400 text-center">
              Messaging active
            </div>
          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={() => setSelectedChat(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
          >
            ✕
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default Inbox;
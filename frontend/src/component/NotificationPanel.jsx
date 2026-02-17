// NotificationPanel.jsx
import { useEffect, useState } from "react";
import { BellAlertIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import socket from "../../utils/socket";

export default function NotificationPanel({ currentUserId, role }) {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const userId = currentUserId;

  // Load notifications from backend
  const loadNotifications = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
      const data = await res.json();

      // Filter notifications based on role / userId
      const filtered = data.filter((n) => {
        if (!n.userId) return false;
        if (role === "lawyer") return n.targetRole === "lawyer" && n.userId.toString() === userId;
        if (role === "owner") return n.userId.toString() === userId;
        return n.userId.toString() === userId;
      });

      setNotifications(filtered);

      const unreadCount = filtered.filter((n) => !n.isRead).length;
      setUnread(unreadCount);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    loadNotifications();

    // Join personal and role rooms
    socket.emit("join", userId);
    socket.emit("join-role", role);

    // Listen for live notifications
    const handleNewNotification = (notif) => {
      if (!notif.userId) return;

      const shouldShow =
        (role === "lawyer" && notif.targetRole === "lawyer" && notif.userId.toString() === userId) ||
        (role === "owner" && notif.userId.toString() === userId);

      if (shouldShow) {
        setNotifications((prev) => [notif, ...prev]);
        setUnread((prev) => prev + 1); // increment immediately
      }
    };

    socket.on("receive-notification", handleNewNotification);

    return () => socket.off("receive-notification", handleNewNotification);
  }, [userId, role]);

  // Open notifications page and mark all as read
  const openNotifications = async () => {
    if (!userId) return;

    navigate("/notifications");

    try {
      await fetch(`http://localhost:5000/api/notifications/mark-read/${userId}`, {
        method: "PUT",
      });
      setUnread(0); // remove red dot immediately
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

return (
  <div className="relative">
    <button
  onClick={openNotifications}
  className="relative px-4 py-2 rounded-xl
             bg-gradient-to-r from-rose-200 to-rose-300
             hover:from-rose-300 hover:to-rose-400
             shadow-lg hover:shadow-rose-300/70
             transition-all duration-300 flex items-center gap-2"
>
  <BellAlertIcon className="h-6 w-6 text-rose-700 drop-shadow" />
  <span className="font-semibold text-rose-800 tracking-wide">
   
  </span>

  {unread > 0 && (
    <span className="absolute -top-1 -right-1 h-5 w-5 
                     bg-red-500 rounded-full text-white text-xs
                     flex items-center justify-center shadow-md">
      {unread}
    </span>
  )}
</button>


  </div>
);

}

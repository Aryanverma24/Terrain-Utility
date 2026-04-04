// NotificationPanel.jsx
import { useEffect, useState } from "react";
import { 
  BellAlertIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  SparklesIcon,
  FireIcon
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import socket from "../../utils/socket";

export default function NotificationPanel({ currentUserId, role }) {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const userId = currentUserId;

  // Toggle dropdown with animation
  const toggleDropdown = () => {
    if (isDropdownOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsDropdownOpen(false);
        setIsAnimating(false);
      }, 300);
    } else {
      setIsDropdownOpen(true);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
      default:
        return <SparklesIcon className="w-5 h-5 text-purple-400" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

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
  <div className="relative z-50">
    {/* Modern Notification Button */}
    <button
      onClick={toggleDropdown}
      className="relative group px-4 py-3 rounded-2xl
                 bg-gradient-to-r from-slate-800/90 to-slate-900/90
                 hover:from-emerald-600/20 hover:to-cyan-600/20
                 border border-emerald-400/20 hover:border-emerald-400/40
                 shadow-lg hover:shadow-emerald-400/20
                 backdrop-blur-md
                 transition-all duration-300 
                 flex items-center gap-3
                 transform hover:scale-105"
    >
      {/* Animated Bell Icon */}
      <div className="relative">
        <BellAlertIcon className="h-6 w-6 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
        {unread > 0 && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </div>
      
      {/* Notification Count Badge */}
      <span className="text-emerald-400 font-semibold text-sm">
        Notifications
      </span>

      {/* Unread Count Badge */}
      {unread > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[24px] h-6 
                       bg-gradient-to-r from-red-500 to-pink-500 
                       rounded-full text-white text-xs font-bold
                       flex items-center justify-center 
                       shadow-lg shadow-red-500/30
                       animate-bounce">
          {unread > 99 ? '99+' : unread}
        </span>
      )}

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>

    {/* Modern Dropdown */}
    {isDropdownOpen && (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={toggleDropdown}
        ></div>
        
        {/* Dropdown Content */}
        <div className={`absolute right-0 mt-3 w-96 max-h-[500px] 
                        bg-gradient-to-br from-slate-900/95 to-slate-800/95 
                        backdrop-blur-xl border border-emerald-400/20 
                        rounded-2xl shadow-2xl shadow-emerald-400/10
                        overflow-hidden
                        transform transition-all duration-300
                        ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
                        z-50`}>
          
          {/* Dropdown Header */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 
                          border-b border-emerald-400/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 
                                rounded-xl flex items-center justify-center">
                  <BellAlertIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Notifications</h3>
                  <p className="text-emerald-400 text-sm">
                    {unread > 0 ? `${unread} unread` : 'All caught up'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDropdown}
                className="w-8 h-8 bg-white/10 rounded-lg 
                           flex items-center justify-center
                           hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              <div className="p-2 space-y-2">
                {notifications.slice(0, 5).map((notification, index) => (
                  <div
                    key={index}
                    className={`group p-4 rounded-xl 
                               bg-white/5 hover:bg-white/10 
                               border border-white/10 hover:border-emerald-400/30
                               transition-all duration-200
                               cursor-pointer
                               ${!notification.isRead ? 'bg-emerald-500/10 border-emerald-400/20' : ''}`}
                    onClick={() => {
                  openNotifications();
                  toggleDropdown(); // Close dropdown when navigating
                }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Notification Icon */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                                      ${!notification.isRead ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium 
                                     ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title || 'New Notification'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {notification.message || 'You have a new notification'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 
                                rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">No notifications</h4>
                <p className="text-gray-400 text-sm">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            )}
          </div>

          {/* Dropdown Footer */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 
                          border-t border-emerald-400/20 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={openNotifications}
                className="text-emerald-400 hover:text-emerald-300 
                           text-sm font-medium transition-colors
                           flex items-center gap-2"
              >
                <FireIcon className="w-4 h-4" />
                View all notifications
              </button>
              {unread > 0 && (
                <button
                  onClick={openNotifications}
                  className="text-xs px-3 py-1 bg-emerald-500/20 
                             border border-emerald-400/30 rounded-lg
                             text-emerald-400 hover:bg-emerald-500/30 
                             transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    )}

    {/* Custom Styles */}
    <style jsx>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #10b981, #06b6d4);
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #059669, #0891b2);
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `}</style>
  </div>
);

}

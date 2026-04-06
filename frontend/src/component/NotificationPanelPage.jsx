// NotificationsPage.jsx
import { useState, useEffect } from "react";
import socket from "../../utils/socket";
import { useOutletContext } from "react-router-dom";
import { API } from "../../utils/API.js"; // adjust path
import { 
  BellIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
  FireIcon,
  XMarkIcon,
  ClockIcon,
  CheckIcon,
  EyeIcon
} from "@heroicons/react/24/solid";

export default function NotificationsPage() {
  const { user } = useOutletContext();
  const userId = user?._id;
  const role = user?.role;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
        let data = await res.json();

        data = data.filter((notif) => notif.userId.toString() === userId);

        setNotifications(data);
        setLoading(false);

        // Mark all as read (FIXED URL)
        await fetch(`http://localhost:5000/api/notifications/mark-read/${userId}`, {
          method: "PUT",
        });
      } catch (err) {
        console.error(err);
      }
    };

    loadNotifications();

    socket.emit("join", userId);

    socket.on("receive-notification", (notif) => {
      if (notif.userId.toString() === userId) {
        setNotifications((prev) => [notif, ...prev]);
      }
    });

    return () => {
      socket.off("receive-notification");
    };
  }, [userId]);

  const markSingle = async (id) => {
    try {
      // FIXED URL
      await API.put(`/api/notifications/read/${id}`);

      const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
      let data = await res.json();
      data = data.filter((notif) => notif.userId.toString() === userId);
      setNotifications(data);
    } catch (err) {
      console.log(err);
    }
  };

  const markAllRead = async () => {
    try {
      // FIXED URL
      await API.put(`/api/notifications/mark-read/${userId}`);

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.log(err);
    }
  };

  // Helper functions
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-emerald-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-amber-400" />;
      case 'info':
        return <InformationCircleIcon className="w-6 h-6 text-blue-400" />;
      default:
        return <SparklesIcon className="w-6 h-6 text-purple-400" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
    <div className="pt-16">
  {loading && (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <div className="flex items-center gap-4">
                  <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                    All
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                    Unread
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Loading */}
          <div className="max-w-4xl mx-auto bg-white min-h-screen">
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="p-6 animate-pulse">
                  <div className="flex gap-4">
                    {/* Avatar Skeleton */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                    
                    {/* Content Skeleton */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Title Skeleton */}
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                          
                          {/* Message Skeleton */}
                          <div className="space-y-2 mb-2">
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                          </div>

                          {/* Time Skeleton */}
                          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                        </div>

                        {/* Action Button Skeleton */}
                        <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="min-h-screen bg-gray-50 ">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <div className="flex items-center gap-4">
                  <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                    All
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                    Unread
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="max-w-4xl mx-auto bg-white min-h-screen">
            <div className="divide-y divide-gray-100">
              <div className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    N
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold mb-1 text-gray-700">
                          No Notifications
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-2">
                          You are all caught up! Check back later for updates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <div className="flex items-center gap-4">
                  <button className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                    All
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                    Unread
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-w-4xl mx-auto bg-white min-h-screen">
            <div className="divide-y divide-gray-100">
              {notifications.map((notif, index) => (
                <div
                  key={notif._id}
                  className={`p-6 hover:bg-gray-50 transition-colors
                             ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* User Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {notif.title ? notif.title.charAt(0).toUpperCase() : 'N'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Title */}
                          <h3 className={`text-base font-semibold mb-1
                                         ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            <span className={`${!notif.isRead ? 'text-blue-600' : 'text-gray-900'}`}>
                              {notif.title || 'New Notification'}
                            </span>
                            {!notif.isRead && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                New
                              </span>
                            )}
                          </h3>
                          
                          {/* Message */}
                          <p className="text-gray-600 text-sm leading-relaxed mb-2">
                            {notif.message || 'You have a new notification'}
                          </p>

                          {/* Time and Actions */}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(notif.createdAt)}
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {!notif.isRead && (
                                <button
                                  onClick={() => markSingle(notif._id)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full
                                           hover:bg-blue-700 transition-colors"
                                >
                                  Mark as read
                                </button>
                              )}
                              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 014 0zm0 6a2 2 0 110-4 2 2 0 014 0zm0 6a2 2 0 110-4 2 2 0 014 0z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
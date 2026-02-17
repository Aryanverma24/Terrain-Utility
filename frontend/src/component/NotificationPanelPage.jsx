// NotificationsPage.jsx
import { useState, useEffect } from "react";
import socket from "../../utils/socket";
import { useOutletContext } from "react-router-dom";
import { API } from "../../utils/API.js"; // adjust path

export default function NotificationsPage() {
  const { user } = useOutletContext();
  const userId = user?._id;
  const role = user?.role;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading)
    return <p className="text-center mt-10 text-gray-500 text-lg">Loading notifications...</p>;

  if (notifications.length === 0)
    return <p className="text-center mt-10 text-gray-500 text-lg">No notifications.</p>;

return (
  <div className="max-w-3xl mx-auto p-6 pt-28 min-h-screen bg-gradient-to-b from-green-50 to-green-100">

    {/* BEAUTIFUL HEADING */}
    <h1 className="text-5xl font-black mb-10 text-gray-900 tracking-wide text-center 
      drop-shadow-sm bg-clip-text text-transparent 
      bg-gradient-to-r from-rose-400 to-pink-600">
      Notifications
    </h1>

    {loading ? (
      <p className="text-center mt-10 text-gray-500 text-lg animate-pulse">
        Loading notifications...
      </p>
    ) : notifications.length === 0 ? (
      <p className="text-center mt-10 text-gray-500 text-lg">
        No notifications.
      </p>
    ) : (
      <div className="space-y-6">
        {notifications.map((notif) => (
          <div
            key={notif._id}
            className={`p-6 rounded-2xl shadow-lg border transform transition-all duration-300
              hover:shadow-2xl hover:-translate-y-1 cursor-default relative
              before:absolute before:inset-y-0 before:left-0 before:w-2 before:rounded-l-2xl
              after:absolute after:inset-y-0 after:right-0 after:w-2 after:rounded-r-2xl
              before:bg-black/10 after:bg-black/10
              ${
                notif.isRead
                  ? "bg-gradient-to-tr from-rose-100 to-rose-200 border-rose-300"
                  : "bg-gradient-to-tr from-rose-200 to-rose-300 border-rose-500"
              }`}
          >
            <div className="flex justify-between items-start">
              <div>
                
                {/* TITLE with elegant effect */}
                <p className="font-bold text-2xl text-gray-900 
                  bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-700
                  drop-shadow-sm tracking-wide">
                  {notif.title}
                </p>

                {/* MESSAGE with subtle shadow + improved readability */}
                <p className="mt-2 text-gray-800 text-lg leading-relaxed 
                  drop-shadow-sm tracking-wide">
                  {notif.message}
                </p>

                {/* DATE with lighter shade */}
                <p className="text-gray-600 text-sm mt-3 italic tracking-wide">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>

              {/* BUTTON */}
              {!notif.isRead && (
                <button
                  onClick={() => markSingle(notif._id)}
                  className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 
                    hover:from-blue-700 hover:to-blue-800 active:scale-95 transition 
                    text-white rounded-xl shadow-md"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);


}